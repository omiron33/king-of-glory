// 19 · John said, "I pointed to the Lamb of God.
// The Forerunner in Hades: the Jordan lies black across the floor of the abyss, held between cut
// stone banks. On the far bank John stands, a rim-lit silhouette, his arm raised high toward the
// light coming down the shaft; the tiers of the dead climb behind him. In the foreground the long
// stone of the near bank faces us, and his words are cut into it and filled with light as he sings.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS, JORDAN as RIVER } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'John said');
  const i = L.words.findIndex((w) => /pointed/i.test(w.w)) - 1;
  const A = { ...L, words: L.words.slice(0, i) }, B = { ...L, words: L.words.slice(i) };
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-1.2, 4.4, -1.4]], [P.to, [0.3, 4.3, -0.5], ease.out3]]);
    const target = keys(t, [[P.from, [0.2, 0.75, 16.0]], [P.to, [0.6, 0.8, 16.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0, focus: 7.4, aperture: 0.012 };
  };
  return {
    name: 's19-john', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.6, uWordDepth: 0.06, uWordCol: [1.0, 0.88, 0.62], uFocus: 7, uAperture: 0.012 },
    camera,
    textPlane: () => ({ c: [0.0, 0.58, RIVER[0]], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [3.6, 0.9] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uRiver.value = RIVER;
      u.uGY.value = 140.0; u.uGlory.value = 1.3; u.uWarm.value = 0.96; u.uStir.value = 0.6;
      u.uKey.value = [0.6, 5.0, 3.0, 2.2];
      u.uRim.value = [1.0, 40.0, 30.0, 1.8];
      // John on the far bank, his arm going up toward the light as he says "pointed"
      const pt = L.words.find((w) => /pointed/i.test(w.w)).start;
      u.uF0.value = [1.0, 0.0, 17.0, 1.85];
      u.uP0.value = [Math.PI - 0.15, -0.06, keys(t, [[P.from, 2.2], [pt - 0.2, 2.25], [pt + 0.5, 2.85, ease.out3]]), 0.0];
      // a soft light on the near bank so the stone itself is seen round the words
      u.uDoveK.value = 0.0;
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 250, rowsY: [0.3, 0.68] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
