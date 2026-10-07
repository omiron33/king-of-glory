// 22 · David cried, "I sang that brass would break!"
// Close on David's psaltery standing in the hall of Hades: a trapezoid frame of dark wood, its
// strings glowing and quivering as if just struck; far behind it, out of focus, the brass gates
// with their burning seam. His words burn gold in the soundboard behind the strings. As
// the line ends the focus racks from the psaltery to the gates.
import { ease, keys, drift, linesAt, grade, clamp01 } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HADES_GLSL, HADES_UNIFORMS } from '/song/lib/w-hades.js';
import { HALLB_GLSL, HALLB_UNIFORMS } from '/song/lib/w-B-hall.js';

export const kind = 'shader';
const TW = 4096, TH = 1400;
const BASE = [0.4, 0.0, -31.0], SC = 1.25, YAW = 0.18;

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'David cried');
  const i = L.words.findIndex((w) => /^.?I$/.test(w.w.replace(/[“"]/g, '')));
  const A = { ...L, words: L.words.slice(0, i) }, B = { ...L, words: L.words.slice(i) };
  const rack = L.end + 0.2;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.15, 1.15, -34.6]], [P.to, [0.3, 1.2, -34.15], ease.out3]]);
    const target = keys(t, [[P.from, [0.5, 0.95, -30.0]], [rack, [0.5, 1.0, -30.0]], [P.to, [0.3, 3.0, 0.0], ease.inOut3]]);
    const d = drift(t, 0.006);
    const focus = keys(t, [[rack, 3.3], [P.to - 0.2, 34.0, ease.inOut3]]);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 40, roll: 0.0, focus, aperture: 0.05 };
  };
  const front = [Math.sin(YAW), 0, -Math.cos(YAW)], right = [-Math.cos(YAW), 0, -Math.sin(YAW)];
  return {
    name: 's22-david', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HADES_GLSL + HALLB_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHallB(ro, rd, jit, depth);
}`,
    uniforms: { ...HADES_UNIFORMS, ...HALLB_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.6, uWordDepth: 0.03, uWordCol: [1.0, 0.82, 0.52], uFocus: 3.4, uAperture: 0.05 },
    camera,
    // on the soundboard, below the rose
    textPlane: () => ({ c: [BASE[0] + front[0] * 0.006 * SC, BASE[1] + 0.5 * SC, BASE[2] + front[2] * 0.006 * SC + 0.0], ax: right, ay: [0, 1, 0], hs: [0.95 * SC, 0.95 * SC * TH / TW] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uSeam.value = 0.4;
      u.uChain.value = 1.0;
      u.uPsal.value = [BASE[0], BASE[1], BASE[2], SC];
      u.uPsalYaw.value = YAW;
      // the strings were struck: bright, quivering, struck again on "break"
      const brk = L.words[L.words.length - 1].start;
      u.uStrings.value = 0.7 + 0.5 * Math.exp(-Math.max(0, t - P.from) * 0.8) + (t > brk ? 0.8 * Math.exp(-(t - brk) * 2.0) : 0);
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 270, rowsY: [0.3, 0.7] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
