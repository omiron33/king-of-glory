// 16 · "“Tell of mercy's oil.”"
// On Seth's first word the camera has turned to him: the son, a younger silhouette against the
// plinth of the lowest tier, turns from the dark toward his father and lifts his open hand to him.
// The warm light from above rims his hood and arm; the niches of the dead climb behind, gold now.
// Adam's request is cut into the plinth beside him, under his call, and burns gold word by word.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 1600;

// a text plane lying on the plinth wall (radius 40) at horizontal position x, height y
const onPlinth = (x, y, w, h) => {
  const z = Math.sqrt(39.9 * 39.9 - x * x);
  const r = Math.hypot(x, z);
  return { c: [x, y, z], ax: [-z / r, 0, x / r], ay: [0, 1, 0], hs: [w / 2, h / 2] };
};

export default (P) => {
  const [L] = linesAt(P.from - 4.0, 'Adam called');
  const iq = L.words.findIndex((w) => /tell/i.test(w.w));
  const A = { ...L, words: L.words.slice(0, iq) }, B = { ...L, words: L.words.slice(iq) };
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-0.9, 1.35, 30.4]], [P.to, [-0.5, 1.4, 31.3], ease.out3]]);
    const target = keys(t, [[P.from, [1.9, 2.0, 40.0]], [P.to, [2.2, 2.05, 40.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 40, roll: 0.0, focus: 5.6, aperture: 0.012 };
  };
  return {
    name: 's16-seth', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.2, uWordDepth: 0.2, uWordCol: [1.0, 0.74, 0.36], uFocus: 6, uAperture: 0.012 },
    camera,
    textPlane: () => onPlinth(3.4, 2.95, 5.6, 2.19),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uGlory.value = 0.7; u.uWarm.value = 0.94; u.uStir.value = 0.6;
      u.uKey.value = [2.6, 5.5, 38.0, 4.0];
      u.uRim.value = [2.5, 5.0, 39.0, 1.8];
      // Seth turns to his father and lifts his open hand to him
      const tell = B.words[0].start;
      const yaw = keys(t, [[P.from, Math.PI + 1.25], [tell, Math.PI + 0.35, ease.out3]]);
      const arm = keys(t, [[tell - 0.2, 0.0], [tell + 0.9, 1.15, ease.inOut3]]);
      u.uF1.value = [1.5, 0.0, 35.6, 1.8]; u.uP1.value = [yaw, 0.02, arm, 0.0];
      u.uF0.value = [0.2, 0.0, 30.6, 1.72]; u.uP0.value = [0.15, 0.2, 0.3, 0.0];
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 400, rowsY: [0.27, 0.73] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
