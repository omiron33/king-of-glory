// 60 · "He led the righteous through the broken gates."
// From inside the hall, low, behind the righteous: they walk in their ranks over the fallen doors
// and out through the empty gateway, where a stair of light climbs away through the rock; the glory
// goes before them up the stair. The line burns gold across the lintel over the gateway, where the
// title once stood.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 900;

export default (P) => {
  const [L] = linesAt(P.from - 0.6, 'He led the righteous');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [3.0, 5.5, -42.0]], [P.to, [2.0, 6.0, -39.0], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, 17.5, 0.0]], [P.to, [0.0, 18.0, 0.0], ease.inOut3]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 47, roll: 0.0 };
  };
  return {
    name: 's60-gates', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 30, uAperture: 0.0, uWordDepth: 0.12 },
    camera,
    // the face of the lintel (z = -2.6) seen from inside: the camera's right is -x
    textPlane: () => ({ c: [0.0, 28.6, -2.62], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [13.0, 13.0 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0;
      u.uFlood.value = 0.5;
      u.uStair.value = 1.0;
      // the glory going up the stair before them
      const gz = keys(t, [[P.from, 10.0], [P.to, 16.0]]);
      u.uG.value.set(0.0, 5.6 + (gz - 3.0) * 0.475, gz); u.uGR.value = 3.4; u.uGK.value = 0.55;
      u.uProc.value = 1.0; u.uProcV.value = 1.3; u.uProcRise.value = 0.475; u.uProcW.value = 4.0;
      u.uProcA.value.set(0, 1.2, -60); u.uProcB.value.set(0, 0, 44);
      u.uFires.value = 0.25; u.uCold.value = 0.8; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 2.6; u.uWordCol.value.set(1.0, 0.78, 0.42);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 520, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.15, bloom: 0.15, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
