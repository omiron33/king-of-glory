// 21 · I heard the Father call Him His own Son."
// We look down over the near bank into the Jordan where the dove rests on the water. As John tells
// of the Father's voice, the black water clears: its mirror of the dark of Hades gives way to a
// dawn sky with drifting cloud, the heavens opened, until on "Son" the dove's reflection flares.
// The line is cut into the bank top in the foreground and filled with light as it is sung.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { SAINTS_GLSL, SAINTS_UNIFORMS, JORDAN } from '/song/lib/w-B-saints.js';

export const kind = 'shader';
const TW = 4096, TH = 1300;

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'I heard the Father');
  const i = L.words.findIndex((w) => /^call/i.test(w.w));
  const A = { ...L, words: L.words.slice(0, i) }, B = { ...L, words: L.words.slice(i) };
  const father = L.words.find((w) => /father/i.test(w.w)).start;
  const son = L.words[L.words.length - 1].start;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.5, 5.2, 1.0]], [P.to, [0.1, 5.0, 1.9], ease.out3]]);
    const target = keys(t, [[P.from, [0.4, -0.4, 13.0]], [P.to, [0.3, -0.5, 13.0], ease.out3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0, focus: 6.5, aperture: 0.01 };
  };
  return {
    name: 's21-voice', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + SAINTS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeSaints(ro, rd, jit, depth);
}`,
    uniforms: { ...SAINTS_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.6, uWordDepth: 0.06, uWordCol: [1.0, 0.88, 0.62], uFocus: 6, uAperture: 0.01 },
    camera,
    textPlane: () => ({ c: [0.0, JORDAN[3], JORDAN[0] + 0.9], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [3.4, 3.4 * TH / TW] }),
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uRiver.value = JORDAN;
      u.uGY.value = 140.0; u.uGlory.value = 1.3; u.uWarm.value = 0.96; u.uStir.value = 0.6;
      u.uKey.value = [0.0, 5.0, 4.0, 1.2];
      u.uRim.value = [0.6, 1.5, 12.0, 1.8];
      u.uF0.value = [1.6, 0.0, 17.0, 1.85]; u.uP0.value = [Math.PI - 0.2, -0.04, 2.85, 0.0];
      // the water clears to the opened sky from "Father", and the dove's light flares on "Son"
      u.uSky.value = keys(t, [[father - 0.2, 0.0], [son - 0.3, 1.0, ease.inOut3]]);
      u.uDove.value = [0.55, 0.85 + 0.03 * Math.sin(t * 2.0), 12.0, 0.9];
      u.uDoveK.value = keys(t, [[P.from, 1.15], [son, 1.2], [son + 0.25, 2.4, ease.out3], [P.to, 1.9]]);
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, B], { W: TW, H: TH, size: 270, rowsY: [0.33, 0.7] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
