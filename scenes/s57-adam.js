// 57 · "He raised him; Adam knew the hands that made him."
// Adam's tomb, as in the icon of the Anastasis. A sarcophagus of dark stone stands on the basalt
// before the empty gateway, its lid already sliding aside; the glory stands over it, the figure of
// light in its rings. On "raised" a stroke of light, Christ's hand, reaches down and takes Adam by
// the wrist, and the old man comes up out of the tomb, a rim-lit silhouette, his arm held up in the
// light. The line is cut into the front of the sarcophagus and burns gold in the cut.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { SARC_A, SARC_E, GLORY_AT, handOf, rows } from '/song/lib/w-D-raise.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1400;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'He raised him');
  const raised = wordIn(L, 'raised');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [7.8, 1.6, -44.2]], [P.to, [7.0, 1.8, -43.4], ease.out3]]);
    const target = keys(t, [[P.from, [2.8, 2.1, -36.0]], [P.to, [2.6, 2.3, -36.0], ease.inOut3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 38, roll: 0.0 };
  };
  // Adam: lying in the tomb (kneeling, hidden), then drawn up by the wrist to stand in it
  const up = (t) => ease.inOut3(clamp01((t - raised.start - 0.15) / 1.5));
  const adam = (t) => {
    const k = up(t);
    return { F: [SARC_A[0] - 0.4, 1.05 * k - 0.15, SARC_A[2] + 0.05, 1.85], pose: [-1.3 * k - 0.2, 0.15 * (1 - k), 0.2 + 0.6 * k, 0.9 - 0.6 * k] };
  };
  return {
    name: 's57-adam', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 9, uAperture: 0.0, uWordDepth: 0.06 },
    camera,
    // the front of Adam's sarcophagus (it faces -z, toward the camera; the camera's right is -x)
    textPlane: () => ({ c: [SARC_A[0], 0.74, SARC_A[2] - 0.77], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [1.6, 1.6 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0; u.uFlood.value = 0.45;
      u.uG.value.set(GLORY_AT[0] + 0.1 * Math.sin(t * 0.6), GLORY_AT[1], GLORY_AT[2]); u.uGR.value = 2.6; u.uGK.value = 0.4;
      u.uSarcA.value = [...SARC_A, 1]; u.uSarcE.value = [...SARC_E, -1];
      u.uLid.value = [keys(t, [[P.from, 0.55], [raised.start, 1.0, ease.out3]]), 0.0, 0, 0];
      const a = adam(t);
      u.uF0.value = a.F; u.uP0.value = a.pose;
      // the hand of light: from the figure in the glory down to Adam's wrist
      const h = handOf(a.F, a.pose);
      const reach = ease.out3(clamp01((t - raised.start + 0.25) / 0.4));
      const from = [GLORY_AT[0] + 0.45, GLORY_AT[1] + 0.2, GLORY_AT[2] - 0.3];
      u.uHandA.value.set(...from);
      u.uHandB.value.set(...from.map((v, i) => v + (h[i] - v) * reach));
      u.uHandK.value = 2.0 * reach;
      u.uFires.value = 0.3; u.uCold.value = 0.8; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 1.7; u.uWordCol.value.set(1.0, 0.78, 0.42);
    },
    drawText(ctx, t) { drawLines(ctx, t, rows(L, 3), { W: TW, H: TH, size: 330, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.2, bloom: 0.16, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
