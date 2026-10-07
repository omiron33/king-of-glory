// 00 · title: KING OF GLORY / THE GATES OF HADES over the intro's guitar and piano.
// From the first frame we glide fast and low over a black floor of basalt columns toward the
// gates of Hades, seen from inside: two doors of brass as tall as a cathedral, banded with iron,
// bolted by a crossbar, set in a cliff that rises out of sight. The only warm thing in the dark is a
// hairline of light in the seam between the doors; it breathes on the piano and dust sifts down
// through it. The glide slows under the doors and tilts up their face, past the title cast in the
// crossbar, to the subtitle on the lintel and the black above.
import { grade, ease, clamp01, keys, drift } from '/song/lib/look.js';
import { COMMON_GLSL } from '/song/lib/x-common.js';
import { GATES_GLSL, GATES_UNIFORMS } from '/song/lib/x-gates.js';

export const kind = 'shader';
const TW = 8192, TH = 1092;

export default (P) => {
  const D = P.to - P.from;
  const camera = (t) => {
    const u = clamp01((t - P.from) / D);
    const z = -75 + 61 * (1 - Math.pow(1 - u, 2.2));
    const tilt = ease.inOut3(clamp01((u - 0.3) / 0.7));
    const d = drift(t, 0.05);
    const y = 1.1 + 1.6 * tilt + 0.05 * Math.sin(t * 1.9);
    const pos = [3.2 - 2.0 * u + d[0], y + d[1], z];
    const target = [0.0, 5.0 + 23.5 * tilt, 0.0];
    const focus = Math.hypot(target[1] - y, -z) ;
    return { pos, target, fov: 52 - 6 * tilt, roll: 0.012 * Math.sin(t * 0.5), focus, aperture: 0.02 };
  };
  return {
    name: 's00-title', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + GATES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeGates(ro, rd, jit, depth);
}`,
    uniforms: { ...GATES_UNIFORMS, uFocus: 30, uAperture: 0.02 },
    camera,
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      // the seam breathes on the piano: slow swells with a flicker, brighter as we arrive
      const k = clamp01((t - P.from) / D);
      u.uSeam.value = (0.18 + 0.22 * k) * (0.85 + 0.15 * Math.sin(t * 2.1) + 0.08 * Math.sin(t * 7.3));
      u.uDust.value = 1.0;
      u.uCold.value = 1.0;
    },
    drawText(ctx) {
      const caps = (s, y, h, sp) => {
        ctx.font = `600 ${h}px "EB Garamond"`;
        ctx.letterSpacing = `${sp}px`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const w = ctx.measureText(s).width;
        if (w > TW * 0.9) { ctx.font = `600 ${Math.floor(h * TW * 0.9 / w)}px "EB Garamond"`; }
        ctx.fillStyle = '#fff'; ctx.fillText(s, TW / 2, y);
      };
      caps('KING OF GLORY', TH * 0.25, 400, 150);
      caps('THE GATES OF HADES', TH * 0.75, 320, 40);
    },
    post(t) { return grade(t, { exposure: 1.6, bloom: 0.16, threshold: 0.8, vignette: 0.5 }); },
    finish(t) {
      const fade = 1 - ease.out3(clamp01((t - P.from) / 0.5));
      return { flare: { amount: 0.25, threshold: 0.7, tint: [1.0, 0.7, 0.45], length: 0.4 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 }, fade: 0.9 * fade };
    },
  };
};
