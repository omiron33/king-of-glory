// Group B's gate shots (scenes 26 to 34): the doors of brass from inside Hades with the lyric on
// them, everything that differs between shots passed in: the camera keys, the state of the doors
// and the light (update), and which lines stand where on the gate (draw). The doors never fall here.
import { grade, keys, drift } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HADES_GLSL, HADES_UNIFORMS } from '/song/lib/w-hades.js';
import { HALLB_GLSL, HALLB_UNIFORMS, GATE_TW, GATE_TH, gatePlane } from '/song/lib/w-B-hall.js';

export function gateShot(P, { name, pos, target, fov = 42, driftAmt = 0.03, update, draw, words = {}, exposure = 1.5, flare = 0.05 }) {
  const camera = (t) => {
    const p = keys(t, pos), d = drift(t, driftAmt);
    return { pos: [p[0] + d[0], p[1] + d[1], p[2]], target: keys(t, target), fov: typeof fov === 'function' ? fov(t) : fov, roll: 0.0 };
  };
  return {
    name, from: P.from, to: P.to,
    textSize: [GATE_TW, GATE_TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HADES_GLSL + HALLB_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHallB(ro, rd, jit, depth);
}`,
    uniforms: { ...HADES_UNIFORMS, ...HALLB_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.4, uWordDepth: 1.45, uWordCol: [1.0, 0.86, 0.6], uFocus: 25, uAperture: 0.0, ...words },
    camera,
    textPlane: () => gatePlane(),
    update(t, u) { u.uChain.value = 1.0; u.uDust.value = 1.0; update(t, u); },
    drawText: draw,
    post(t) { return grade(t, { exposure, bloom: 0.16, threshold: 0.8, vignette: 0.5 }); },
    finish() { return { flare: { amount: flare, threshold: 0.8, tint: [1.0, 0.72, 0.45], length: 0.35 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
}
