// 71 · outro: "Christ is risen. Adam rises." "Eve comes walking into day."
// The garden from the side, at sunrise. A low wall of dressed stone runs beside the path from the
// open tomb out across the field toward the sun. On "Adam rises" Adam, the old man's silhouette we
// know, comes up out of the tomb's door and walks out along the path into the morning, rim-lit by
// the low sun ahead of him; on "Eve" she follows him out in her red robe. The camera drifts along
// with them. Both lines are written in gold light along the shaded face of the wall.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { walker } from '/song/lib/w-D-walk.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DAWN_GLSL, DAWN_UNIFORMS } from '/song/lib/w-D-dawn.js';

export const kind = 'shader';
const TW = 4096, TH = 700;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'Christ is risen', 'Eve comes walking');
  const adamW = wordIn(L1, 'Adam'), eveW = wordIn(L2, 'Eve');
  const adam = walker(adamW.start - 0.8, 0.95, 1.85, -0.25, 0.0);
  const eve = walker(eveW.start - 0.9, 0.95, 1.72, 0.2, 0.0);
  const camera = (t) => {
    const pos = keys(t, [[P.from, [9.5, 3.3, -5.4]], [P.to, [9.3, 3.4, -6.9], ease.inOut3]]);
    const target = keys(t, [[P.from, [0.0, 1.0, -5.8]], [P.to, [0.0, 1.05, -7.2], ease.inOut3]]);
    const d = drift(t, 0.01);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 44, roll: 0.0 };
  };
  return {
    name: 's71-risen', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DAWN_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeDawn(ro, rd, jit, depth);
}`,
    uniforms: { ...DAWN_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 7, uAperture: 0.0, uWordDepth: 0.08 },
    camera,
    // the wall's face (x = 2.55, facing +x); seen from +x the text runs toward -z, the way they walk
    textPlane: () => ({ c: [2.56, 0.66, -6.4], ax: [0, 0, -1], ay: [0, 1, 0], hs: [2.9, 2.9 * TH / TW] }),
    update(t, u) {
      u.uWall.value = 1.0; u.uStoneX.value = -2.25; u.uGlowIn.value = 0.5;
      u.uSun.value = 0.8; u.uGold.value = 0.4;
      const a = adam(t), e = eve(t);
      u.uF0.value = a.F; u.uP0.value = a.pose;
      u.uF1.value = t > eveW.start - 0.9 ? e.F : [0, 0, 0, 0]; u.uP1.value = e.pose; u.uFRed.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 2.2; u.uWordCol.value.set(1.0, 0.8, 0.45);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L2], { W: TW, H: TH, size: 280, rowsY: [0.3, 0.74] }); },
    post(t) { return grade(t, { exposure: 1.0, bloom: 0.14, threshold: 0.95, vignette: 0.42 }); },
    finish(t) { return { flare: { amount: 0.08, threshold: 0.8, tint: [1.0, 0.8, 0.55], length: 0.5 }, grade: { shadows: [0.02, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
