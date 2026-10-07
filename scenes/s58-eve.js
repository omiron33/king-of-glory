// 58 · "Eve fell weeping at her Lord's feet;" "He raised her; she knew those hands as well."
// The other side of the icon. Adam stands in his tomb on the left, held in the light; on the right
// Eve, in her red robe, has come out of her sarcophagus and kneels bowed low at the foot of the
// glory. On "raised" the hand of light reaches her wrist and she rises. Both lines are cut into the
// front of her sarcophagus and burn gold, one under the other; the camera drifts across to her.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { SARC_A, SARC_E, GLORY_AT, handOf, rows } from '/song/lib/w-D-raise.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 1400;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'Eve fell', 'He raised her');
  const raised = wordIn(L2, 'raised');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-1.8, 1.4, -42.4]], [P.to, [-2.8, 1.5, -42.0], ease.inOut3]]);
    const target = keys(t, [[P.from, [-2.3, 2.2, -35.0]], [P.to, [-2.9, 2.3, -35.0], ease.inOut3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  // Adam as he was left: risen, standing in his tomb, his arm up in the light
  const adam = { F: [SARC_A[0] - 0.4, 1.05, SARC_A[2] + 0.05, 1.85], pose: [-1.5, 0.0, 0.8, 0.3] };
  // Eve: kneeling bowed at His feet, then drawn up by the wrist
  const up = (t) => ease.inOut3(clamp01((t - raised.start - 0.1) / 1.4));
  const eve = (t) => {
    const k = up(t);
    return { F: [-1.1, 0.0, -34.6, 1.72], pose: [1.7 - 0.3 * k, 0.45 * (1 - k), 0.15 + 0.65 * k, 0.6 * (1 - k)] };
  };
  return {
    name: 's58-eve', from: P.from, to: P.to,
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
    // the front of Eve's sarcophagus (it faces -z, toward the camera; the camera's right is -x)
    textPlane: () => ({ c: [SARC_E[0], 0.74, SARC_E[2] - 0.77], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [1.6, 1.6 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0; u.uFlood.value = 0.45;
      u.uG.value.set(GLORY_AT[0] + 0.1 * Math.sin(t * 0.6), GLORY_AT[1], GLORY_AT[2]); u.uGR.value = 2.6; u.uGK.value = 0.32;
      u.uSarcA.value = [...SARC_A, 1]; u.uSarcE.value = [...SARC_E, -1];
      u.uLid.value = [1.0, 1.0, 0, 0];
      u.uF0.value = adam.F; u.uP0.value = adam.pose;
      const e = eve(t);
      u.uF1.value = e.F; u.uP1.value = e.pose; u.uFRed.value = 1.0;
      // the hand of light: from the figure in the glory down to Eve's wrist
      const h = handOf(e.F, e.pose);
      const reach = ease.out3(clamp01((t - raised.start + 0.25) / 0.4));
      const from = [GLORY_AT[0] - 0.45, GLORY_AT[1] + 0.2, GLORY_AT[2] - 0.3];
      u.uHandA.value.set(...from);
      u.uHandB.value.set(...from.map((v, i) => v + (h[i] - v) * reach));
      u.uHandK.value = 2.0 * reach;
      u.uFires.value = 0.3; u.uCold.value = 0.8; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 1.7; u.uWordCol.value.set(1.0, 0.78, 0.42);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L2], { W: TW, H: TH, size: 280, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.2, bloom: 0.16, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
