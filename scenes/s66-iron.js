// 66 · final chorus: "Let the iron fall before His light"
// The gateway from inside, in the dawn. The doors are down, but one iron bar still hangs askew in
// the broken frame, pinned at one end high on the left jamb. The glory stands in the opening in the
// morning light. On "fall" the bar tears free, drops the height of the gateway and lands across
// the threshold on the fallen brass with a jolt that throws up dust; it rocks once and lies still.
// The line is cut into the brass of the doors in front of us.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn, spring } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { rows } from '/song/lib/w-D-raise.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1900;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Let the iron fall');
  const fall = wordIn(L, 'fall');
  const t0 = fall.start + 0.05, tl = t0 + 1.25;     // tears free, lands
  const camera = (t) => {
    const pos = keys(t, [[P.from, [2.0, 8.0, -22.0]], [P.to, [0.8, 7.6, -20.5], ease.inOut3]]);
    const target = keys(t, [[P.from, [-1.0, 5.0, 0.0]], [P.to, [-0.5, 4.6, 0.0], ease.inOut3]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  // the bar: hanging from the left jamb, then falling to lie across the threshold on the brass
  const bar = (t) => {
    const f = ease.in2(clamp01((t - t0) / (tl - t0)));
    const settle = t > tl ? spring(t, tl, 0.5, 0.3) : 0;
    const y = t < tl ? 17.0 + (1.78 - 17.0) * f : 1.78 + 0.35 * (1 - settle) * Math.exp(-(t - tl) * 4.0) * Math.abs(Math.sin((t - tl) * 9.0));
    const a = t < tl ? -0.76 + 0.7 * f : -0.06 + 0.06 * settle;
    const x = -6.2 + 3.0 * f;
    return [x, y, -2.6, a];
  };
  return {
    name: 's66-iron', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 20, uAperture: 0.0, uWordDepth: 0.25 },
    camera,
    // on the outer faces of the fallen doors (y = 1.2), read from inside (right is -x)
    textPlane: () => ({ c: [0.0, 1.2, -5.8], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [6.2, 6.2 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0; u.uFlood.value = 0.22;
      u.uDay.value = [0.45, 15.0, 0, 0];
      u.uG.value.set(0.0, 6.2, 4.0); u.uGR.value = 3.6; u.uGK.value = 0.5;
      u.uIron.value = bar(t); u.uIronK.value = 1.0;
      // dust thrown up where it lands
      u.uDust.value = 1.0 + 4.0 * Math.max(0, Math.exp(-(t - tl) * 2.0)) * (t > tl ? 1 : 0);
      u.uFires.value = 0.0; u.uCold.value = 0.5;
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) { drawLines(ctx, t, rows(L, 4), { W: TW, H: TH, size: 560, caps: true, spacing: 20, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.16, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
