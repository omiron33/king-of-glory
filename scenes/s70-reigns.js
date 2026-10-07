// 70 · final chorus: "Son of Mary, Son of God" "The King of Glory reigns on high"
// The open tomb at sunrise, the great stone rolled away and the low door standing open on the empty
// chamber. Both lines are cut deep into the rolled stone, lit full by the low sun. On "King of
// Glory" the sun clears the hills and the whole garden goes gold; the camera draws back and up,
// and over the rock, high in the morning sky, the glory stands: He reigns on high.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DAWN_GLSL, DAWN_UNIFORMS } from '/song/lib/w-D-dawn.js';

export const kind = 'shader';
const TW = 2300, TH = 1600;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'Son of Mary', 'The King of Glory reigns');
  const king = wordIn(L2, 'King');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-1.6, 1.35, -4.6]], [king.start, [-1.4, 1.5, -5.4], ease.inOut3], [P.to, [-0.8, 2.3, -7.6], ease.inOut3]]);
    const target = keys(t, [[P.from, [-2.25, 1.15, -0.4]], [king.start, [-2.1, 1.25, -0.4], ease.inOut3], [P.to, [-1.6, 2.3, 0.0], ease.inOut3]]);
    const d = drift(t, 0.006);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  return {
    name: 's70-reigns', from: P.from, to: P.to,
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
      const g = ease.inOut3(clamp01((t - king.start + 0.2) / 2.5));
      u.uSun.value = 0.6 + 0.25 * g; u.uGold.value = g;
      u.uGlowIn.value = 0.6;
      // the glory high over the rock in the morning sky
      u.uG.value.set(0.4, 7.5 + 1.5 * g, 4.0); u.uGR.value = 2.2; u.uGK.value = 0.32 * g;
    },
    drawText(ctx, t) {
      const r = (l, a, b) => ({ ...l, words: l.words.slice(a, b) });
      drawLines(ctx, t, [r(L1, 0, 3), r(L1, 3), r(L2, 0, 4), r(L2, 4)], { W: TW, H: TH, size: 200, caps: true, spacing: 6, rowsY: [0.24, 0.39, 0.61, 0.76] });
    },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.14, threshold: 0.95, vignette: 0.42 }); },
    finish(t) { return { flare: { amount: 0.3, threshold: 0.8, tint: [1.0, 0.8, 0.55], length: 0.5 }, grade: { shadows: [0.02, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
