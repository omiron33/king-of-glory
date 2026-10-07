// 03 · instrumental: the light coming down.
// We rise up the shaft on the beam, looking up. High above, where the crack was, a glory is
// descending: the icon's mandorla, a white-gold core in graded ultramarine rings with gold rays.
// It is small at first, a star with rings, and grows as it falls toward us; tier after tier of the
// dead turn from cold blue to gold as its light reaches them, top tiers first; grit rains through
// the light. On the swell before the verse it fills the top of the frame and flares.
import { grade, ease, clamp01, keys, drift } from '/song/lib/look.js';
import { COMMON_GLSL } from '/song/lib/x-common.js';
import { ABYSS_GLSL, ABYSS_UNIFORMS } from '/song/lib/x-abyss.js';

export const kind = 'shader';

export default (P) => {
  const D = P.to - P.from;
  const gy = (t) => keys(t, [[P.from, 330.0], [P.to, 135.0, ease.in2]]);
  const camera = (t) => {
    const u = clamp01((t - P.from) / D);
    const rise = ease.inOut3(u);
    const ang = -Math.PI / 2 + 0.55 * rise;          // start at the floor text (z < 0), orbit as we rise
    const r = 10.0 + 14 * rise;
    const y = 10.9 + 58 * rise;
    const d = drift(t, 0.06);
    const pos = [r * Math.cos(ang) + d[0], y + d[1], r * Math.sin(ang)];
    const g = gy(t);
    const look = ease.inOut3(clamp01(u / 0.35));       // from the beam above the floor up to the glory
    const target = [0.0, 16.0 + (g - 16.0) * look, 1.0 * (1 - look)];
    return { pos, target, fov: 50 + 6 * rise, roll: 0.05 * Math.sin(u * 2.4), focus: g - y, aperture: 0.0 };
  };
  return {
    name: 's03-descent', from: P.from, to: P.to,
    frag: COMMON_GLSL + ABYSS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeAbyss(ro, rd, jit, depth);
}`,
    uniforms: { ...ABYSS_UNIFORMS, uFocus: 100, uAperture: 0.0 },
    camera,
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = Math.max(10, c.focus); u.uAperture.value = 0.0;
      const g = gy(t);
      u.uGY.value = g;
      u.uGR.value = keys(t, [[P.from, 7.0], [P.to, 22.0, ease.in2]]);
      // brighter as it comes; a swell into the verse, a flare at the very end
      u.uGlory.value = keys(t, [[P.from, 0.35], [P.from + 5.5, 0.75], [P.to - 1.6, 1.0, ease.in2], [P.to - 0.25, 1.7, ease.in2], [P.to, 3.0]]);
      u.uBeam.value = keys(t, [[P.from, 1.0], [P.from + 3.0, 0.7], [P.to, 0.4]]);
      u.uSpot.value.set(0, 0, -0.2); u.uSpotR.value = 11.0;
      u.uCrack.value = 0.0;
      u.uStir.value = 1.0;
      u.uWarm.value = keys(t, [[P.from + 0.8, 0.0], [P.to, 0.62, ease.inOut3]]);
      u.uDust.value = 1.0;
    },
    post(t) { return grade(t, { exposure: 1.25, bloom: 0.22, threshold: 0.85, vignette: 0.45 }); },
    finish(t) {
      return { flare: { amount: 0.3, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.5 }, grade: { shadows: [0.0, 0.02, 0.06], highlights: [1.0, 0.94, 0.82], amount: 0.5 } };
    },
  };
};
