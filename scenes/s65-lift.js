// 65 · final chorus: "Lift up your gates for the King of Glory"
// Back down in Hades, now empty. The vault over the gateway has been torn open and the dawn pours
// down through the rent in a warm column onto the floor far below, where the two doors of brass lie
// crossed where they fell. Looking down from high in the vault, the camera sinks slowly toward them;
// the line is cut into the brass of the fallen doors, dark in the gold of the morning light.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { rows } from '/song/lib/w-D-raise.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1700;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Lift up your gates');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [2.5, 38.0, -36.0]], [P.to, [1.2, 32.0, -32.0], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, 0.0, -8.0]], [P.to, [0.0, 0.0, -8.5], ease.inOut3]]);
    const d = drift(t, 0.05);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 40, roll: 0.0 };
  };
  return {
    name: 's65-lift', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 50, uAperture: 0.0, uWordDepth: 0.25 },
    camera,
    // on the outer faces of the fallen doors (y = 1.2), read looking down toward the gateway (right is -x)
    textPlane: () => ({ c: [0.0, 1.2, -4.6], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [6.5, 6.5 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0; u.uFlood.value = 0.2;
      u.uDay.value = [keys(t, [[P.from, 0.75], [P.to, 1.0]]), 15.0, 0, 0];
      u.uFires.value = 0.0; u.uCold.value = 0.5; u.uDust.value = 1.0;
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) { drawLines(ctx, t, rows(L, 4), { W: TW, H: TH, size: 520, caps: true, spacing: 20, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.16, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
