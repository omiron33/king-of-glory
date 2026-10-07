// 08 · "But Hades shook: He called four-day Lazarus;"
// Low at the end of the basalt step, looking up the colossus of Hades. On "shook" it trembles:
// cracks of cold light run up through its faceted stone from the knees to the cave of its mouth,
// the cold fires gutter and flare, and Hades' answer cracks open across the step in the same cold
// light. Satan stands at the right, lowering his arm, unmoved.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HALL_GLSL, HALL_UNIFORMS } from '/song/lib/w-a-hall.js';
import { DAIS_TEX, daisPlane, shookRows } from '/song/lib/a-dais.js';

export const kind = 'shader';

export default (P) => {
  const [L3] = linesAt(P.from - 0.5, 'But Hades shook');
  const shook = wordIn(L3, 'shook');
  const camera = (t) => {
    // a slow rise up the colossus as it shakes
    const pos = keys(t, [[P.from, [-13.5, 2.0, -103.0]], [P.to, [-13.0, 2.4, -104.6]]], (x) => x);
    const target = keys(t, [[P.from, [-7.5, 15.0, -140.0]], [P.to, [-7.0, 17.5, -140.0]]], (x) => x);
    const d = drift(t, 0.04);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 64, roll: 0.0 };
  };
  return {
    name: 's08-shook', from: P.from, to: P.to,
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
      u.uSatArm.value = [0.87, 0.3, -0.45, keys(t, [[P.from, 1.0], [P.from + 1.2, 0.0]])];
      u.uPrints.value = 1.0;
      u.uDais.value = 1.0;
      // the quake: the cracks run up the stone from "shook" and keep flickering
      const q = keys(t, [[shook.start - 0.2, 0.0], [shook.start + 1.4, 0.8, ease.out3], [P.to, 1.0]]);
      u.uQuake.value = q;
      u.uLean.value = keys(t, [[P.from, 0.4], [shook.start + 0.6, 0.22, ease.out3]]);   // it starts back
      u.uFires.value = 0.5 + 0.25 * q * Math.sin(t * 23.0) * Math.sin(t * 7.3);
      u.uDust.value = 1.0 + 2.0 * q;
      u.uSeam.value = 0.35;
      u.uWordMode.value = 4; u.uWordDepth.value = 0.12; u.uWordGlow.value = 8.0;
    },
    drawText(ctx, t) { shookRows(ctx, t, L3); },
    post(t) { return grade(t, { exposure: 1.35, bloom: 0.18, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.06], highlights: [0.95, 0.95, 1.0], amount: 0.5 } }; },
  };
};
