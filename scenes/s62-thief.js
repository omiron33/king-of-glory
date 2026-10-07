// 62 · "The thief had carried his across the threshold;"
// The gateway from just inside, low over the fallen doors. At the threshold, to one side of the
// opening, stands the good thief's cross, rough timber, where he set it down when he came through
// first; the stair of light climbs away behind it and the righteous file past it, out and up. The
// line is cut into the brass of the fallen door at our feet, dark letters in the gold the gateway
// pours over it.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1000;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The thief had carried');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-0.8, 4.4, -17.0]], [P.to, [-1.6, 4.1, -15.5], ease.inOut3]]);
    const target = keys(t, [[P.from, [-1.5, 1.6, 3.0]], [P.to, [-2.0, 2.0, 3.0], ease.inOut3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  return {
    name: 's62-thief', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 20, uAperture: 0.0, uWordDepth: 0.2 },
    camera,
    // on the top of the fallen doors (their outer face, y = 1.2), read from inside: right is -x
    textPlane: () => ({ c: [-1.4, 1.2, -7.5], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [5.0, 5.0 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0;
      u.uFlood.value = 0.32; u.uStair.value = 0.6;
      u.uG.value.set(0.0, 5.6 + 22.0 * 0.475, 25.0); u.uGR.value = 3.4; u.uGK.value = 0.4;
      // the thief's cross, rough timber, at the threshold to the left of the way
      u.uCrossP.value = [-6.5, 0.0, 2.5, 8.0]; u.uCrossK.value = 0.0;
      u.uProc.value = 1.0; u.uProcV.value = 1.3; u.uProcRise.value = 0.475; u.uProcW.value = 1.0;
      u.uProcA.value.set(9.0, 1.2, -40); u.uProcB.value.set(0.5, 0, 44);
      u.uFires.value = 0.2; u.uCold.value = 0.7; u.uDust.value = 1.0;
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 420, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.15, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
