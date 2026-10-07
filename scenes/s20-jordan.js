// 20 · At Jordan I saw the Spirit rest on Him;
// Closer, over the near bank: the black water of the Jordan moves below us, mirroring the glowing
// tiers. A dove of light comes down out of the dark above, wings raised, and settles just over the
// water, its reflection rising to meet it; its light washes the bank stone, the water and John
// on the far side. John's words are cut into the flat top of the near bank and burn as he sings.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS, JORDAN } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 1300;

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'At Jordan');
  const i = L.words.findIndex((w) => /^the$/i.test(w.w));
  const A = { ...L, words: L.words.slice(0, i) }, B = { ...L, words: L.words.slice(i) };
  const spirit = L.words.find((w) => /spirit/i.test(w.w)).start;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-0.6, 4.4, 1.0]], [P.to, [-0.15, 4.3, 1.6], ease.out3]]);
    const target = keys(t, [[P.from, [0.4, 0.6, 14.0]], [P.to, [0.5, 0.45, 14.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0, focus: 5.0, aperture: 0.012 };
  };
  return {
    name: 's20-jordan', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.6, uWordDepth: 0.06, uWordCol: [1.0, 0.88, 0.62], uFocus: 5, uAperture: 0.012 },
    camera,
    textPlane: () => ({ c: [0.0, JORDAN[3], JORDAN[0] + 0.9], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [3.4, 3.4 * TH / TW] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uRiver.value = JORDAN;
      u.uGY.value = 140.0; u.uGlory.value = 1.3; u.uWarm.value = 0.96; u.uStir.value = 0.6;
      u.uKey.value = [0.0, 5.0, 4.0, 1.2];
      u.uRim.value = [0.6, 1.5, 12.0, 1.8];
      u.uF0.value = [1.6, 0.0, 17.0, 1.85]; u.uP0.value = [Math.PI - 0.2, -0.04, 2.85, 0.0];
      // the dove comes down and settles over the water as "Spirit" is sung
      const y = keys(t, [[P.from, 14.0], [spirit + 0.3, 1.0, ease.out3], [P.to, 0.85]]);
      const x = keys(t, [[P.from, 0.9], [spirit + 0.3, 0.6, ease.out3], [P.to, 0.55]]);
      u.uDove.value = [x, y, 12.0, 0.9];
      u.uDoveK.value = keys(t, [[P.from, 0.6], [spirit + 0.3, 1.0], [P.to, 1.15]]);
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 300, rowsY: [0.32, 0.7] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
