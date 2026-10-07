// 67 · final chorus: "Jesus Christ, the deathless Lord" "Has entered death and broken night"
// The garden tomb at sunrise, close. Out of the low door, one after another, the righteous come up
// out of the dark of the earth into the morning and walk away along the path toward the sun, rim-lit.
// Both lines are cut into the great stone rolled away beside the door, dark in its sunlit face. On
// "broken night" the dark inside the tomb gives way: the empty chamber fills with light from within.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DAWN_GLSL, DAWN_UNIFORMS } from '/song/lib/w-D-dawn.js';

export const kind = 'shader';
const TW = 2300, TH = 1600;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'Jesus Christ, the deathless', 'Has entered death');
  const broken = wordIn(L2, 'broken');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.9, 1.45, -7.4]], [P.to, [0.4, 1.55, -6.8], ease.inOut3]]);
    const target = keys(t, [[P.from, [-1.1, 1.15, 0.0]], [P.to, [-1.2, 1.2, 0.0], ease.inOut3]]);
    const d = drift(t, 0.006);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 42, roll: 0.0 };
  };
  return {
    name: 's67-deathless', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DAWN_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeDawn(ro, rd, jit, depth);
}`,
    uniforms: { ...DAWN_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 5, uAperture: 0.0, uWordDepth: 0.45 },
    camera,
    // the words are carved by the stone itself (uStoneTxt); the plane is parked out of the world
    textPlane: () => ({ c: [0, -50, 0], ax: [1, 0, 0], ay: [0, 1, 0], hs: [0.01, 0.01] }),
    update(t, u) {
      u.uStoneX.value = -2.25; u.uStoneTxt.value = 1.0; u.uSun.value = keys(t, [[P.from, 0.5], [P.to, 0.65]]);
      u.uGlowIn.value = keys(t, [[broken.start - 0.2, 0.0], [broken.start + 0.8, 1.0, ease.out3]]);
      // the righteous coming up out of the tomb and away down the path, single file
      u.uProc.value = 1.0; u.uProcV.value = 1.1; u.uProcW.value = 0.0;
      u.uProcA.value.set(0.0, 0.0, 2.6); u.uProcB.value.set(24.0, 0.0, -30.0);
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) {
      const r = (l, a, b) => ({ ...l, words: l.words.slice(a, b) });
      drawLines(ctx, t, [r(L1, 0, 2), r(L1, 2), r(L2, 0, 3), r(L2, 3)], { W: TW, H: TH, size: 190, caps: true, spacing: 6, rowsY: [0.25, 0.4, 0.6, 0.75] });
    },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.14, threshold: 0.95, vignette: 0.42 }); },
    finish(t) { return { flare: { amount: 0.25, threshold: 0.8, tint: [1.0, 0.8, 0.55], length: 0.5 }, grade: { shadows: [0.02, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
