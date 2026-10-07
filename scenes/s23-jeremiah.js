// 23 · Jeremiah said, "God would walk among us."
// The black basalt floor of the hall of Hades, the gates far off with their burning seam. Footprints
// of light appear one by one across the floor, walking out of the distance toward us, and as they
// pass they reveal Jeremiah's words written along their path in the stone, each word lit as it is
// sung. The camera drifts slowly beside the path at a readable angle.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HADES_GLSL, HADES_UNIFORMS } from '/song/lib/w-hades.js';
import { HALLB_GLSL, HALLB_UNIFORMS } from '/song/lib/w-B-hall.js';

export const kind = 'shader';
const TW = 4096, TH = 1100;
const A0 = [5.0, -41.0], A1 = [-5.0, -45.0];          // the path, far left to near right as seen
const LEN = Math.hypot(A1[0] - A0[0], A1[1] - A0[1]);
const DIR = [(A1[0] - A0[0]) / LEN, 0, (A1[1] - A0[1]) / LEN];
const AWAY = [-DIR[2], 0, DIR[0]].map((v, i, a) => (a[2] > 0 ? v : -v));   // across the path, away from us

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'Jeremiah said');
  const i = L.words.findIndex((w) => /god/i.test(w.w));
  const A = { ...L, words: L.words.slice(0, i) }, B = { ...L, words: L.words.slice(i) };
  const camera = (t) => {
    const pos = keys(t, [[P.from, [1.6, 7.2, -52.0]], [P.to, [-0.4, 7.0, -51.4], ease.out3]]);
    const target = keys(t, [[P.from, [0.6, 0.0, -42.0]], [P.to, [-0.4, 0.0, -42.2], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  const mid = [(A0[0] + A1[0]) / 2, (A0[1] + A1[1]) / 2];
  return {
    name: 's23-jeremiah', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HADES_GLSL + HALLB_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHallB(ro, rd, jit, depth);
}`,
    uniforms: { ...HADES_UNIFORMS, ...HALLB_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.6, uWordDepth: 0.12, uWordCol: [1.0, 0.84, 0.55], uFocus: 30, uAperture: 0.0 },
    camera,
    // the words lie just on our side of the footprints
    textPlane: () => ({ c: [mid[0] - AWAY[0] * 0.55, 0.0, mid[1] - AWAY[2] * 0.55], ax: DIR, ay: AWAY, hs: [LEN / 2, (LEN / 2) * TH / TW] }),
    update(t, u) {
      u.uSeam.value = 0.45;
      u.uChain.value = 1.0;
      u.uFires.value = 0.6;
      // the steps come one by one, leading the words: the last lands as "us" is sung
      const steps = LEN / 0.72 + 1;
      u.uFeet.value = [A0[0] + AWAY[0] * 0.6, A0[1] + AWAY[2] * 0.6, Math.atan2(DIR[0], DIR[2]),
        keys(t, [[P.from, 0.0], [L.words[0].start, 2.0], [L.words[L.words.length - 1].start, steps, (x) => x], [P.to, steps]])];
      u.uFeetStride.value = 0.72;
      // a worn path of smooth stone under the steps and the words
      u.uStrip.value = [mid[0] + AWAY[0] * 0.05, mid[1] + AWAY[2] * 0.05, Math.atan2(DIR[0], DIR[2]), LEN / 2 + 0.6];
      u.uStripW.value = 1.25;
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 330, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
