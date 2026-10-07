// 55 · "Jesus crossed the ruins, calling Adam:"
// Inside Hades after the gates have fallen. The two doors of brass lie crossed on the floor where
// they came down, the empty gateway beyond them pouring white-gold light into the hall. Across the
// fallen doors the glory walks toward us: the mandorla of ultramarine rings with the figure of
// light inside it, lighting the brass and the basalt as it comes. The camera, low in the hall,
// drifts back before it. The line is written in light on the basalt in front of the doors, the
// path He is walking.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1280;

export default (P) => {
  const L = linesAt(P.from - 0.5, 'Jesus crossed');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [4.5, 7.0, -41.0]], [P.to, [1.5, 7.6, -45.0], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, 2.6, -13.0]], [P.to, [0.0, 2.2, -19.0], ease.inOut3]]);
    const d = drift(t, 0.05);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 44, roll: 0.0 };
  };
  // the glory walking in over the doors, a slow stride
  const glory = (t) => {
    const z = keys(t, [[P.from, -3.0], [P.to, -21.0, ease.inOut3]]);
    return [0.4 * Math.sin(t * 0.7), 5.9 + 0.08 * Math.sin(t * 3.1), z];
  };
  return {
    name: 's55-ruins', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 30, uAperture: 0.0, uWordDepth: 0.16 },
    camera,
    // on the basalt in front of the fallen doors, read from the camera (looking +z, so its right is -x)
    textPlane: () => ({ c: [0.0, 0.0, -30.0], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [9.5, 9.5 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035;   // flat on the floor u.uSeam.value = 0.0; u.uBow.value = 0.0;
      u.uFlood.value = 0.6 + 0.05 * Math.sin(t * 1.3);
      const g = glory(t);
      u.uG.value.set(g[0], g[1], g[2]); u.uGR.value = 3.6; u.uGK.value = 0.45;
      u.uFires.value = 0.5; u.uCold.value = 0.8; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 3.2; u.uWordCol.value.set(1.0, 0.8, 0.48);
    },
    drawText(ctx, t) { drawLines(ctx, t, L, { W: TW, H: TH, size: 330, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.1, bloom: 0.16, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.25, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
