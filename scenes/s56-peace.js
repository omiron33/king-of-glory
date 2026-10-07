// 56 · "Peace to you and all your children."
// The reverse: from the gateway, behind Christ. The glory stands on the fallen doors and its light
// runs out down the hall over the dead, who have come out of the dark and stand in their thousands
// on the basalt, rim-lit silhouettes facing Him; far behind them the black colossus of Hades sits in
// the gloom with its cold fires guttering. The greeting is written in gold across the floor at the
// foot of the ruin, between Him and them. The camera sinks slowly toward the crowd.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1100;

export default (P) => {
  const L = linesAt(P.from - 0.5, 'Peace to you');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [6.0, 10.0, 0.0]], [P.to, [5.0, 9.0, -3.0], ease.out3]]);
    const target = keys(t, [[P.from, [-1.5, 1.5, -38.0]], [P.to, [-1.5, 1.0, -40.0], ease.inOut3]]);
    const d = drift(t, 0.04);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  return {
    name: 's56-peace', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 30, uAperture: 0.0, uWordDepth: 0.16 },
    camera,
    // on the basalt just past the ends of the fallen doors; the camera looks -z, so the text runs +x
    textPlane: () => ({ c: [2.0, 0.0, -30.0], ax: [1, 0, 0], ay: [0, 0, -1], hs: [9.0, 9.0 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0;
      u.uFlood.value = 0.22;
      u.uG.value.set(-5.0 + 0.3 * Math.sin(t * 0.5), 5.9, -20.0); u.uGR.value = 3.6; u.uGK.value = 0.5;
      // the dead, standing, facing Him
      u.uProc.value = 1.0; u.uProcV.value = 0.0; u.uProcRise.value = 0.0;
      u.uProcA.value.set(1, 0, -110); u.uProcB.value.set(1, 0, -34); u.uProcW.value = 11.0;
      u.uFires.value = 0.35; u.uCold.value = 0.8; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 3.4; u.uWordCol.value.set(1.0, 0.8, 0.45);
    },
    drawText(ctx, t) { drawLines(ctx, t, L, { W: TW, H: TH, size: 300, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.15, bloom: 0.16, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
