// 64 · guitar solo: out of the tomb into the dawn.
// From the white of the stair's top we are inside the garden tomb, in the dark of the empty
// chamber, looking out through the low door at a garden in first light, the sun coming up low over
// it. The camera flies out through the door into the morning, rises, and swings round to look back:
// the tomb stands open, the great stone rolled away along its groove, the cord hanging broken from
// its pegs, the seal split. Cut deep into the rolled stone, lit full by the low sun, is the line
// the solo carried: "Now Adam's children followed Christ toward home."
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DAWN_GLSL, DAWN_UNIFORMS } from '/song/lib/w-D-dawn.js';

export const kind = 'shader';
const TW = 2300, TH = 1600;

export default (P) => {
  const [L0] = linesAt(P.from - 20, "Now Adam's children");
  // the aligner stretched "toward" over the whole solo; it is sung at 345.25 and "home." just after
  const W = L0.words.map((w) => (/^home/i.test(w.w) ? { ...w, start: 345.75, end: 346.1 } : /^toward/i.test(w.w) ? { ...w, end: 345.7 } : w));
  const rowsL = [W.slice(0, 3), W.slice(3, 5), W.slice(5)].map((words) => ({ ...L0, words, end: 346.1 }));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.05, 1.15, 2.7]], [355.0, [0.15, 1.35, -1.2], ease.inOut3], [357.6, [1.6, 2.1, -4.6], ease.inOut3], [359.6, [-0.9, 1.5, -4.7], ease.inOut3], [P.to, [-1.05, 1.45, -4.5], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, 1.0, -6.0]], [355.0, [-0.2, 1.1, -8.0], ease.inOut3], [357.6, [-1.4, 1.1, -0.8], ease.inOut3], [359.6, [-2.2, 1.12, -0.4], ease.inOut3], [P.to, [-2.25, 1.12, -0.4], ease.out3]]);
    const d = drift(t, 0.01);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  return {
    name: 's64-dawn', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DAWN_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeDawn(ro, rd, jit, depth);
}`,
    uniforms: { ...DAWN_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 5, uAperture: 0.0 },
    camera,
    // the words are carved by the stone itself (uStoneTxt); the plane is parked out of the world
    textPlane: () => ({ c: [0, -50, 0], ax: [1, 0, 0], ay: [0, 1, 0], hs: [0.01, 0.01] }),
    update(t, u) {
      u.uStoneTxt.value = 1.0; u.uStoneX.value = -2.25;
      u.uSun.value = keys(t, [[P.from, 0.25], [P.to, 0.5]]);
      u.uMist.value = 1.0;
    },
    drawText(ctx, t) { drawLines(ctx, t, rowsL, { W: TW, H: TH, size: 250, caps: true, spacing: 6, rowsY: [0.3, 0.5, 0.7] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.14, threshold: 0.95, vignette: 0.42 }); },
    finish(t) { return { flare: { amount: 0.3, threshold: 0.8, tint: [1.0, 0.8, 0.55], length: 0.5 }, grade: { shadows: [0.02, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
