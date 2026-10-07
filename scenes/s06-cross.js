// 06 · "He died upon the cross."
// The reverse: high over Satan's shoulder as he reaches the foot of the throne. His shadow fills
// the left of the frame, cinders crawling in it, smoke climbing off it; ahead of him, between the
// two cold fires, the boast is branded into the basalt word by word, smoking as it lands; above,
// the stone knees of Hades, its shoulders leaning down out of the dark to listen.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HALL_GLSL, HALL_UNIFORMS } from '/song/lib/w-a-hall.js';
import { floorPlane, capsRow } from '/song/lib/a-type.js';

export const kind = 'shader';
const TW = 4096, TH = 2048;

export default (P) => {
  const [L] = linesAt(P.from - 3.0, 'Satan came to Hades');
  const words = L.words.slice(4);
  const camera = (t) => {
    // a slow crane down and in over his shoulder
    const pos = keys(t, [[P.from, [-2.2, 10.4, -103.4]], [P.to, [-2.5, 9.6, -104.6]]], (x) => x);
    const target = keys(t, [[P.from, [0.2, 3.4, -124.0]], [P.to, [0.2, 3.6, -124.5]]], (x) => x);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 52, roll: 0.0 };
  };
  return {
    name: 's06-cross', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HALL_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHall(ro, rd, jit, depth);
}`,
    uniforms: { ...HALL_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 60, uAperture: 0.0 },
    camera,
    textPlane: () => floorPlane(camera(P.from), [1.6, 0.0, -116.8], 11.0, TW / TH),
    update(t, u) {
      // his last steps to the throne, then he leans over the words
      const s = keys(t, [[P.from - 0.5, [-5.0, 0.0, -108.0]], [P.from + 1.4, [-5.4, 0.0, -112.5], ease.out3]]);
      u.uSat.value = [s[0], s[1], s[2], 8.0];
      u.uSatFrom.value.set(-5.5, 0, -40);
      u.uSatYaw.value = Math.PI - 0.12;
      u.uSatLean.value = keys(t, [[P.from, 0.06], [P.to, 0.16]]);
      u.uLean.value = keys(t, [[P.from, 0.08], [P.to, 0.18]]);
      u.uFires.value = 0.75;
      u.uPrints.value = 1.0;
      u.uSeam.value = 0.45;
      u.uWordMode.value = 3; u.uWordDepth.value = 0.25; u.uWordGlow.value = 6.0;
      u.uWordCol.value.set(1.0, 0.38, 0.1);
    },
    drawText(ctx, t) {
      ctx.letterSpacing = '20px';
      capsRow(ctx, t, words.slice(0, 2), TH * 0.3, 700, TW, { heat: 0.45, scorch: 60, stretch: 1.3 });
      capsRow(ctx, t, words.slice(2), TH * 0.7, 700, TW, { heat: 0.45, scorch: 60, stretch: 1.3 });
    },
    post(t) { return grade(t, { exposure: 1.4, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
