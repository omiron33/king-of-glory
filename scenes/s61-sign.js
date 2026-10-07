// 61 · "They asked Him for a sign of victory;" "He set His cross where death had held its throne."
// The far end of the hall: the black colossus of Hades on its throne, its stone hands shut on the
// one it holds, the cold fires guttering in their bowls. In the foreground the first of the risen,
// Adam and Eve among them, stand looking up at it; the glory waits beside them. On "cross" a seam of
// white-gold splits the throne from top to foot, and in the split a cross of light stands up, taller
// than the colossus's knees, burning; the fires sink. Both lines are cut into the face of the dais
// the throne stands on and burn gold in the cut.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 560;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'They asked', 'He set His cross');
  const cross = wordIn(L2, 'cross');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [7.0, 5.0, -84.0]], [P.to, [3.0, 6.0, -90.0], ease.inOut3]]);
    const target = keys(t, [[P.from, [0.0, 17.0, -140.0]], [P.to, [0.0, 19.0, -140.0], ease.inOut3]]);
    const d = drift(t, 0.04);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 56, roll: 0.0 };
  };
  return {
    name: 's61-sign', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 40, uAperture: 0.0, uWordDepth: 0.4 },
    camera,
    // cut into the face of the throne's dais (z = -126); the camera looks -z, so the text runs +x
    textPlane: () => ({ c: [0.0, 3.0, -126.0], ax: [1, 0, 0], ay: [0, 1, 0], hs: [20.0, 20.0 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0; u.uFlood.value = 0.25;
      u.uGrip.value = 1.0; u.uDais.value = 6.0;
      // the sign: the throne splits and the cross stands up in it
      const k = keys(t, [[cross.start - 0.15, 0.0], [cross.start + 0.6, 1.0, ease.out3]]);
      const rise = ease.inOut3(clamp01((t - cross.start + 0.1) / 1.6));
      u.uRuin.value = k;
      u.uCrossP.value = rise > 0 ? [0.0, 6.0 - 24.0 * (1 - rise), -141.0, 30.0] : [0, 0, 0, 0];
      u.uCrossK.value = 3.5 * rise;
      u.uFires.value = 0.28 - 0.2 * k;
      u.uG.value.set(-16.0, 5.8, -104.0); u.uGR.value = 3.4; u.uGK.value = 0.45 + 0.2 * k;
      // the first of the risen in the foreground: Adam, Eve (in red), one more
      u.uF0.value = [-8.0, 0.0, -96.0, 1.85]; u.uP0.value = [3.3, -0.1, 0.0, 0.0];
      u.uF1.value = [-9.8, 0.0, -95.0, 1.72]; u.uP1.value = [3.0, -0.05, 0.0, 0.0]; u.uFRed.value = 1.0;
      u.uF2.value = [-6.2, 0.0, -97.5, 1.8]; u.uP2.value = [3.2, -0.1, 0.0, 0.0];
      u.uCold.value = 0.8; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 2.8; u.uWordCol.value.set(1.0, 0.78, 0.42);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L2], { W: TW, H: TH, size: 210, rowsY: [0.28, 0.74] }); },
    post(t) { return grade(t, { exposure: 1.1, bloom: 0.18, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.25, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
