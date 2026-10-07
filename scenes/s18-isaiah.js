// 18 · Isaiah cried, "I spoke of light in darkness!"
// In the dark of the abyss a scroll unrolls across the air by itself, its free roller running from
// left to right; the tiers of the dead rise behind it, warming toward gold under the light far up
// the shaft. Isaiah's words are written on the sheet in ink that glows like coals, lighting the
// parchment round each letter as it is sung. The camera drifts along with the opening scroll.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 930;
const X0 = 3.3, LEN = 6.6, Y0 = 0.95;

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'Isaiah cried');
  const iq = L.words.findIndex((w) => /^.?I$/i.test(w.w.replace(/[“"]/g, '')));
  const A = { ...L, words: L.words.slice(0, iq) }, B = { ...L, words: L.words.slice(iq) };
  const camera = (t) => {
    const pos = keys(t, [[P.from, [1.6, 1.55, -5.6]], [P.to, [-0.3, 1.6, -6.2], ease.out3]]);
    const target = keys(t, [[P.from, [1.2, 2.3, 10.0]], [P.to, [-0.2, 2.4, 10.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 42, roll: 0.0, focus: 6.0, aperture: 0.02 };
  };
  return {
    name: 's18-isaiah', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 4.5, uWordDepth: 0.03, uWordCol: [1.0, 0.45, 0.13], uFocus: 6, uAperture: 0.02 },
    camera,
    textPlane: () => ({ c: [X0 - LEN / 2, Y0 + 0.75, 0.0], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [LEN / 2, (LEN / 2) * TH / TW] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uGlory.value = 0.9; u.uWarm.value = 0.96; u.uStir.value = 0.7;
      // the scroll opens ahead of the words: the first row by "Isaiah", the whole sheet by "I spoke"
      const len = keys(t, [[P.from, 0.15], [L.words[0].start, 4.2, ease.out3], [B.words[0].start - 0.1, LEN, ease.inOut3]]);
      u.uScroll.value = [X0, Y0, 0.0, len];
      u.uKey.value = [0.0, 6.0, -1.5, 1.4];
      u.uScrollDir.value.set(-1, 0, 0);
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 300, rowsY: [0.3, 0.7] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
