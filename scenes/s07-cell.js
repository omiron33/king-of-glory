// 07 · "The Nazarene is yours. Prepare His cell."
// At the foot of the throne. Satan stands before the basalt step, his back to us, and as he speaks
// his words are branded in cinders across the face of the step; on "Prepare His cell" he raises a
// long arm of shadow and points into the dark of the side wall where the cells are. Above him the
// seated colossus of Hades leans its stone shoulders down out of the dark to listen, lit from below
// by the cold fires.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HALL_GLSL, HALL_UNIFORMS } from '/song/lib/w-a-hall.js';
import { DAIS_TEX, daisPlane, boastRows } from '/song/lib/a-dais.js';

export const kind = 'shader';

export default (P) => {
  const [L2] = linesAt(P.from - 0.5, 'The Nazarene is yours');
  const prep = wordIn(L2, 'Prepare');
  const camera = (t) => {
    // a slow push across the hall toward the step, tilting up toward the leaning colossus
    const pos = keys(t, [[P.from, [16.0, 4.2, -96.0]], [P.to, [13.5, 4.6, -101.0]]], (x) => x);
    const target = keys(t, [[P.from, [0.5, 12.0, -134.0]], [P.to, [0.0, 13.5, -134.0]]], (x) => x);
    const d = drift(t, 0.04);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 58, roll: 0.0 };
  };
  return {
    name: 's07-cell', from: P.from, to: P.to,
    textSize: DAIS_TEX,
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HALL_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHall(ro, rd, jit, depth);
}`,
    uniforms: { ...HALL_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 60, uAperture: 0.0 },
    camera,
    textPlane: daisPlane,
    update(t, u) {
      u.uSat.value = [0.5, 0.0, -122.5, 8.0];
      u.uSatFrom.value.set(-4.0, 0, -60);
      u.uSatYaw.value = Math.PI + 0.52;
      u.uSatLean.value = 0.08;
      // the arm comes up on "Prepare" and holds, pointing at the cells
      const arm = keys(t, [[prep.start - 0.5, 0.0], [prep.start + 0.5, 1.0, ease.out3]]);
      u.uSatArm.value = [0.87, 0.3, -0.45, arm];
      u.uPrints.value = 1.0;
      u.uLean.value = keys(t, [[P.from, 0.18], [P.to, 0.4]]);
      u.uDais.value = 1.0;
      u.uSeam.value = 0.35;
      u.uWordMode.value = 4; u.uWordDepth.value = 0.12; u.uWordGlow.value = 8.0;
    },
    drawText(ctx, t) { boastRows(ctx, t, L2); },
    post(t) { return grade(t, { exposure: 1.35, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
