// 04 · instrumental: the hall of Hades. The light we saw coming has not reached here yet. A basalt
// hall runs back from the gates to a seated colossus of black stone, Hades, faceless, a cave for a
// mouth. Down the hall from the dark comes Satan, a tall shape of shadow trailing cinders, toward
// the throne. The far gates glow faintly at their seam behind us.
import { grade, ease, clamp01, keys, drift } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HADES_GLSL, HADES_UNIFORMS } from '/song/lib/w-hades.js';

export const kind = 'shader';

export default (P) => {
  const camera = (t) => {
    const u = clamp01((t - P.from) / (P.to - P.from));
    const pos = keys(t, [[P.from, [18.0, 3.0, -30.0]], [P.to, [9.0, 2.0, -70.0]]]);
    const target = keys(t, [[P.from, [0.0, 30.0, -150.0]], [P.to, [-2.0, 12.0, -120.0]]]);
    const d = drift(t, 0.05);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 44, roll: 0.0 };
  };
  const sat = (t) => keys(t, [[P.from, [-30.0, 0.0, -80.0]], [P.to, [-6.0, 0.0, -112.0]]]);
  return {
    name: 's04-hall', from: P.from, to: P.to,
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...HADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 60, uAperture: 0.0 },
    camera,
    update(t, u) {
      const s = sat(t);
      u.uSat.value = [s[0], s[1], s[2], 7.5];
      u.uSatFrom.value.set(-40, 0, -70);
      u.uSatYaw.value = Math.atan2(24, -32) * 0;
      u.uSeam.value = 0.35;
    },
    post(t) { return grade(t, { exposure: 1.4, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
