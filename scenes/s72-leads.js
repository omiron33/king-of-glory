// 72 · outro: "The King of Glory leads His people"
// Wider, higher, over the wall: the whole procession streams out of the open tomb and away along
// the path across the field, ranks of rim-lit figures, and at their head, walking before them into
// the low sun, the glory, the figure of light in its rings. The line is written in gold light
// along the shaded face of the wall in front of them.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { pathX } from '/song/lib/w-D-walk.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DAWN_GLSL, DAWN_UNIFORMS } from '/song/lib/w-D-dawn.js';

export const kind = 'shader';
const TW = 4096, TH = 420;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The King of Glory leads');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [12.0, 5.5, -12.0]], [P.to, [12.0, 5.8, -14.0], ease.inOut3]]);
    const target = keys(t, [[P.from, [0.0, 1.2, -15.0]], [P.to, [0.0, 1.3, -17.0], ease.inOut3]]);
    const d = drift(t, 0.01);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  return {
    name: 's72-leads', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DAWN_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeDawn(ro, rd, jit, depth);
}`,
    uniforms: { ...DAWN_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 12, uAperture: 0.0, uWordDepth: 0.08 },
    camera,
    // the wall's face (x = 2.55, facing +x); seen from +x the text runs toward -z
    textPlane: () => ({ c: [2.56, 0.68, -15.5], ax: [0, 0, -1], ay: [0, 1, 0], hs: [5.0, 5.0 * TH / TW] }),
    update(t, u) {
      u.uWall.value = 1.0; u.uStoneX.value = -2.25; u.uGlowIn.value = 0.5;
      u.uSun.value = 0.85; u.uGold.value = 0.5;
      // the glory at the head of the column
      const gz = keys(t, [[P.from, -24.0], [P.to, -27.5]]);
      u.uG.value.set(pathX(gz), 3.0, gz); u.uGR.value = 2.2; u.uGK.value = 0.45;
      u.uProc.value = 1.0; u.uProcV.value = 1.0; u.uProcW.value = 1.0;
      u.uProcA.value.set(0.0, 0.0, 0.5); u.uProcB.value.set(0.6, 0.0, -21.5 - (t - P.from));
      u.uWordMode.value = 1; u.uWordGlow.value = 2.2; u.uWordCol.value.set(1.0, 0.8, 0.45);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 300, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.14, threshold: 0.95, vignette: 0.42 }); },
    finish(t) { return { flare: { amount: 0.08, threshold: 0.8, tint: [1.0, 0.8, 0.55], length: 0.5 }, grade: { shadows: [0.02, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
