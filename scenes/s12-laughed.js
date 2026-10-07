// 12 · "Satan laughed; the chambers shook beneath him."
// Low before the throne, looking up: Satan has turned to us, his back to the colossus, and laughs.
// The shadow swells, its cinders flare with every peal, his eyes burn, and the stone of Hades behind
// him shivers; ash falls through the hall in sheets, and the words hang in the falling ash between
// us, lit red from below like letters in smoke. As the line ends the ash parts on a faint warm glow
// rising far above.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HALL_GLSL, HALL_UNIFORMS } from '/song/lib/w-a-hall.js';
import { capsRow } from '/song/lib/a-type.js';

export const kind = 'shader';
const TW = 4096, TH = 1280;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Satan laughed');
  const laughed = wordIn(L, 'laughed'), shook = wordIn(L, 'shook');
  const camera = (t) => {
    // a slow push up toward him, the lens low
    const pos = keys(t, [[P.from, [1.3, 1.3, -95.0]], [P.to, [1.0, 1.5, -97.0]]], (x) => x);
    const target = keys(t, [[P.from, [0.3, 5.6, -106.0]], [P.to, [0.3, 6.0, -106.0]]], (x) => x);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 64, roll: 0.0 };
  };
  return {
    name: 's12-laughed', from: P.from, to: P.to,
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
    // the words hang in the ash, upright, square to us, 8 m in front of the lens
    textPlane: () => ({ c: [0.8, 2.35, -100.2], ax: [1, 0, 0], ay: [0, 1, 0], hs: [2.7, 2.7 / (TW / TH)] }),
    update(t, u) {
      u.uSat.value = [0.4, 0.0, -105.5, 8.0];
      u.uSatFrom.value.set(-4.0, 0, -60);
      u.uSatYaw.value = 0.05;
      // the laugh: he swells, and each peal flares the cinders
      const sw = keys(t, [[laughed.start - 0.3, 0.0], [laughed.end + 0.4, 0.7, ease.out3], [L.end, 0.9], [P.to, 0.6]]);
      const peal = t > laughed.start - 0.1 && t < L.end + 0.3 ? 0.25 * Math.pow(Math.abs(Math.sin((t - laughed.start) * 9.0)), 3) : 0;
      u.uSatSwell.value = sw + peal;
      u.uSatLean.value = keys(t, [[laughed.start, 0.0], [laughed.end + 0.3, -0.12, ease.out3], [P.to, -0.05]]);   // head thrown back
      u.uPrints.value = 0.0; u.uSatFrom.value.set(0.4, 0, -105.5);
      u.uDais.value = 1.0;
      u.uLean.value = 0.22;
      u.uQuake.value = keys(t, [[shook.start - 0.3, 0.0], [shook.start + 0.4, 0.35, ease.out3], [P.to, 0.25]]);
      u.uFires.value = 0.6 + 0.2 * Math.sin(t * 13.0) * Math.sin(t * 5.1);
      u.uCurtain.value = keys(t, [[P.from, 0.6], [L.start, 1.0], [L.end + 0.4, 1.0], [P.to, 0.35]]);
      // a faint warm glow rising far above as the ash parts
      u.uG.value.set(0, 120, -100); u.uGR.value = 8.0;
      u.uGK.value = keys(t, [[L.end, 0.0], [P.to, 0.25, ease.in2]]);
      u.uSeam.value = 0.3;
      u.uWordMode.value = 1; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.5, 0.2);
    },
    drawText(ctx, t) {
      ctx.letterSpacing = '16px';
      capsRow(ctx, t, L.words.slice(0, 2), TH * 0.28, 520, TW);
      capsRow(ctx, t, L.words.slice(2), TH * 0.72, 520, TW);
    },
    post(t) { return grade(t, { exposure: 1.4, bloom: 0.18, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.02, 0.01, 0.02], highlights: [1.0, 0.9, 0.8], amount: 0.5 } }; },
  };
};
