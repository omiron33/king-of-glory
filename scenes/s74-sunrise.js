// 74 · outro, the last bars: into the sunrise.
// Behind them now, from beside the open tomb: the whole procession of the righteous walks away
// along the path across the field into the rising sun, ranks of rim-lit silhouettes growing small,
// the glory going before them on the path into the light. The camera rises slowly over the garden
// as they go, the morning widening round them, and the picture fades to a warm black.
import { grade, ease, clamp01, keys, drift } from '/song/lib/look.js';
import { pathX } from '/song/lib/w-D-walk.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DAWN_GLSL, DAWN_UNIFORMS } from '/song/lib/w-D-dawn.js';

export const kind = 'shader';

export default (P) => {
  const fadeFrom = P.to - 5.0;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [5.0, 4.2, -1.5]], [P.to, [2.0, 10.0, -7.0], ease.inOut3]]);
    const target = keys(t, [[P.from, [0.5, 1.2, -32.0]], [P.to, [0.5, 2.0, -60.0], ease.inOut3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  return {
    name: 's74-sunrise', from: P.from, to: P.to,
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DAWN_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeDawn(ro, rd, jit, depth);
}`,
    uniforms: { ...DAWN_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 20, uAperture: 0.0 },
    camera,
    // no words: the text plane is parked out of the world
    textPlane: () => ({ c: [0, -50, 0], ax: [1, 0, 0], ay: [0, 1, 0], hs: [0.01, 0.01] }),
    update(t, u) {
      u.uWall.value = 1.0; u.uStoneX.value = -2.25; u.uGlowIn.value = 0.4;
      u.uSun.value = keys(t, [[P.from, 0.7], [P.to, 0.95]]); u.uGold.value = 0.5;
      const gz = -26.0 - (t - P.from) * 1.0;
      u.uG.value.set(pathX(gz), 3.0, gz); u.uGR.value = 2.4; u.uGK.value = 0.5;
      u.uProc.value = 1.0; u.uProcV.value = 1.0; u.uProcW.value = 1.0;
      u.uProcA.value.set(0.0, 0.0, 0.5); u.uProcB.value.set(0.6, 0.0, gz + 2.5);
      u.uDark.value = 0.0;
    },
    post(t) { return grade(t, { exposure: 0.9, bloom: 0.14, threshold: 0.95, vignette: 0.45 }); },
    finish(t) {
      const f = ease.inOut3(clamp01((t - fadeFrom) / (P.to - fadeFrom)));
      return { flare: { amount: 0.25, threshold: 0.8, tint: [1.0, 0.8, 0.55], length: 0.5 }, grade: { shadows: [0.04, 0.02, 0.0], highlights: [1.0, 0.92, 0.8], amount: 0.5 }, fade: 0.94 * f };   // to a warm near-black
    },
  };
};
