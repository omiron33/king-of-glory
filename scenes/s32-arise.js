// 32 · "By His life the dead arise"
// Away from the gate to the burial tiers: the light from the breaking gates floods the abyss, and in
// niche after niche, tier above tier, the shrouded dead stand up, rim-lit, facing the light. The line
// is cut into the plinth of the lowest tier and burns gold as it is sung; the camera rises slowly.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 900;

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'By His life');
  const dead = L.words.find((w) => /dead/i.test(w.w)).start;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.0, 1.8, 26.0]], [P.to, [0.0, 2.6, 27.5], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, 5.8, 40.0]], [P.to, [0.0, 7.0, 40.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 54, roll: 0.0, focus: 13.0, aperture: 0.0 };
  };
  return {
    name: 's32-arise', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.4, uWordDepth: 0.5, uWordCol: [1.0, 0.8, 0.45], uFocus: 13, uAperture: 0.0 },
    camera,
    textPlane: () => ({ c: [0.0, 2.3, 39.9], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [6.0, 6.0 * TH / TW] }),
    update(t, u) {
      u.uGY.value = 110.0; u.uGlory.value = 2.0; u.uWarm.value = 1.0; u.uStir.value = 1.0;
      u.uKey.value = [0.0, 8.0, 30.0, 0.0];
      u.uRim.value = [0.0, 60.0, 0.0, 2.2];
      // they stand up from "dead" through "arise"
      u.uStand.value = keys(t, [[dead - 0.2, 0.0], [L.end + 0.3, 1.0, ease.out3]]);
      u.uRise.value = 0.25;
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 420, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.18, threshold: 0.8, vignette: 0.45 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
