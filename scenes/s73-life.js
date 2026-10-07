// 73 · outro: "Out of death and into life."
// The final tableau, the icon of the Anastasis in light. Back in the hall below, now full of the
// morning: the glory stands on the two doors of brass where they lie crossed, the figure of light
// in its blue rings, and with both hands of light it holds Adam by the wrist on one side and Eve,
// in red, on the other, drawing them up out of death. Everything is lit from the open gateway and
// the rent vault; the light grows as the line is held. The line is cut into the brass at His feet.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { handOf, rows } from '/song/lib/w-D-raise.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1700;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Out of death');
  const G = [0.0, 4.6, -9.0];
  const adam = { F: [2.5, 1.2, -9.8, 1.9], pose: [-1.2, 0.12, 0.7, 0.3] };
  const eve = { F: [-2.5, 1.2, -9.8, 1.78], pose: [1.2, 0.12, 0.7, 0.3] };
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.0, 3.8, -21.5]], [P.to, [0.0, 4.2, -23.5], ease.inOut3]]);
    const target = keys(t, [[P.from, [0.0, 3.3, -8.0]], [P.to, [0.0, 3.5, -8.0], ease.inOut3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 44, roll: 0.0 };
  };
  return {
    name: 's73-life', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 18, uAperture: 0.0, uWordDepth: 0.25 },
    camera,
    // on the outer faces of the fallen doors (y = 1.2), at His feet, read from the hall (right is -x)
    textPlane: () => ({ c: [0.0, 1.2, -15.0], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [4.6, 4.6 * TH / TW] }),
    update(t, u) {
      const k = clamp01((t - P.from) / (P.to - P.from));
      u.uFall.value = 1.035; u.uSeam.value = 0.0;
      u.uFlood.value = 0.15 + 0.1 * k; u.uDay.value = [0.3 + 0.15 * k, 15.0, 0, 0];
      u.uG.value.set(...G); u.uGR.value = 2.7; u.uGK.value = 0.3 + 0.1 * k;
      u.uF0.value = adam.F; u.uP0.value = adam.pose;
      u.uF1.value = eve.F; u.uP1.value = eve.pose; u.uFRed.value = 1.0;
      const from = [G[0], G[1] - 0.6, G[2] - 0.4];
      u.uHandA.value.set(...from); u.uHandB.value.set(...handOf(adam.F, adam.pose)); u.uHandC.value.set(...handOf(eve.F, eve.pose));
      u.uHandK.value = 1.6; u.uHand2.value = 1.0;
      u.uFires.value = 0.0; u.uCold.value = 0.4; u.uDust.value = 1.0;
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) { drawLines(ctx, t, rows(L, 3), { W: TW, H: TH, size: 560, caps: true, spacing: 20, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.16, threshold: 0.9, vignette: 0.45 }); },
    finish() { return { flare: { amount: 0.15, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.02, 0.015, 0.02], highlights: [1.0, 0.93, 0.8], amount: 0.5 } }; },
  };
};
