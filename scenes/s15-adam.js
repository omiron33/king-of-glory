// 15 · "Adam called to Seth:"
// Adam's place on the floor of the abyss, at the foot of the lowest tier: an old man's silhouette,
// stooped, seen from behind and rim-lit by the warm light that has begun to fall down the shaft.
// Past his shoulder, by the plinth, stands his son Seth in the half dark; the niches of the dead
// climb the wall behind him, warming. The camera pushes slowly in over Adam's shoulder. Adam's call
// is cut into the plinth above Seth and burns warm gold as he sings it.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.6, 'Adam called');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [1.45, 1.5, 27.2]], [P.to, [1.15, 1.45, 28.3], ease.out3]]);
    const target = keys(t, [[P.from, [-0.3, 2.6, 40.0]], [P.to, [-0.25, 2.5, 40.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 42, roll: 0.0, focus: 7.0, aperture: 0.015 };
  };
  return {
    name: 's15-adam', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.2, uWordDepth: 0.2, uWordCol: [1.0, 0.74, 0.36], uFocus: 6, uAperture: 0.015 },
    camera,
    textPlane: () => ({ c: [-0.3, 2.75, 39.9], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [3.2, 0.8] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      const k = clamp01((t - P.from) / (P.to - P.from));
      u.uGlory.value = 0.7; u.uWarm.value = 0.85 + 0.08 * k; u.uStir.value = 0.6;
      u.uKey.value = [0.6, 5.0, 33.0, 6.0 + 1.5 * k];
      u.uRim.value = [-0.5, 5.0, 39.0, 1.8];
      // Adam: old, stooped, facing his son; Seth by the plinth, facing his father
      u.uF0.value = [0.2, 0.0, 30.6, 1.72]; u.uP0.value = [0.15, 0.2, 0.3, 0.0];
      u.uF1.value = [1.5, 0.0, 35.6, 1.8]; u.uP1.value = [Math.PI + 0.3, 0.02, 0.0, 0.0];
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 560, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
