// 17 · "“The Son will come and heal my father's wound.”"
// Seen from the side and above: Seth holds out his open hand toward his father. Over it a
// remembered sprig of olive appears in gold light and lets fall one drop of oil; the drop lands in
// his palm, runs over, and spreads across the stone floor toward Adam. Seth's promise is written in
// the golden sheen of the spreading oil: the words appear only where the oil has run, each as it is
// sung, and the oil reaches Adam's feet on "wound".
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 1250;
const START = [1.5, 0.0, 35.0], END = [0.2, 0.0, 30.6];
const LEN = Math.hypot(END[0] - START[0], END[2] - START[2]);
const DIR = [(END[0] - START[0]) / LEN, 0, (END[2] - START[2]) / LEN];
const SIDE = [DIR[2], 0, -DIR[0]];   // across the path, away from the camera

export default (P) => {
  const [L] = linesAt(P.from - 0.6, 'The Son will come');
  const half = L.words.findIndex((w) => /^and/i.test(w.w));
  const A = { ...L, words: L.words.slice(0, half) }, B = { ...L, words: L.words.slice(half) };
  const tLand = L.words[0].start;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [6.0, 5.3, 33.4]], [P.to, [5.5, 5.0, 32.8], ease.out3]]);
    const target = keys(t, [[P.from, [1.0, 0.4, 33.4]], [P.to, [0.9, 0.2, 32.7], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 44, roll: 0.0, focus: 7.0, aperture: 0.01 };
  };
  return {
    name: 's17-oil', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 4.0, uWordDepth: 0.05, uWordCol: [1.0, 0.86, 0.55], uOilText: 1.0, uFocus: 6, uAperture: 0.01 },
    camera,
    textPlane: () => ({ c: [(START[0] + END[0]) / 2, 0.0, (START[2] + END[2]) / 2], ax: DIR, ay: SIDE, hs: [LEN / 2 + 0.05, (LEN / 2 + 0.05) * TH / TW] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uGlory.value = 0.7; u.uWarm.value = 0.95; u.uStir.value = 0.6;
      u.uKey.value = [0.9, 6.5, 33.0, 6.0];
      u.uRim.value = [-2.0, 5.0, 33.0, 1.4];
      u.uF1.value = [1.55, 0.0, 35.75, 1.8]; u.uP1.value = [Math.PI + 0.28, 0.04, 1.15, 0.0];
      u.uF0.value = [-0.05, 0.0, 29.9, 1.72]; u.uP0.value = [0.25, 0.2, 0.3, 0.0];
      // the sprig appears over his hand and lets fall a drop into it
      const hand = [1.37, 1.28, 35.12];
      u.uSprig.value = [1.32, 2.35, 35.05, keys(t, [[P.from, 0.0], [P.from + 0.35, 1.0, ease.out3], [tLand + 1.2, 1.0], [tLand + 2.4, 0.25]])];
      const tf = clamp01((t - (tLand - 0.45)) / 0.45);
      const dy = 2.25 + (hand[1] - 2.25) * tf * tf;
      u.uDrop.value = [1.33, dy, 35.08, t > tLand - 0.5 && t < tLand + 0.05 ? 1.0 : 0.0];
      // then the oil runs from his feet toward Adam, ahead of the words
      const last = L.words[L.words.length - 1];
      const reach = keys(t, [[tLand, 0.0], [tLand + 0.4, 0.8, ease.out3], [last.start, LEN + 0.2, (x) => x], [P.to, LEN + 0.4, ease.out3]]);
      u.uOil.value = [START[0], 0.0, START[2], reach];
      u.uOilDir.value.set(...DIR);
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 330, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
