// 13 · "The captives turned toward the growing light."
// Back in the abyss, wide and low: tier on tier of the dead climbing out of sight, thousands of
// cold embers in their niches. A warm light is growing far above; its warmth comes down the shaft
// tier by tier, and one by one the embers turn from blue toward gold. The line runs along the
// parapet of the lowest ledge in letters of the same gold, each word lit as it is sung. Through the
// line we push slowly in and down toward one ember in the lowest row: Adam's place.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { COMMON_GLSL } from '/song/lib/w-common.js';
import { ABYSS_GLSL, ABYSS_UNIFORMS } from '/song/lib/w-abyss.js';
import { capsRow } from '/song/lib/a-type.js';
import { niche, add, mul, SR, TH as TIER } from '/song/lib/a-abyss.js';

export const kind = 'shader';
const TW = 4096, TH = 900;
const ADAM = [30, 0];                      // Adam's niche: index round the shaft, tier
const LIP = 1.8;                           // parapet height on the lowest ledge (m)

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The captives turned');
  const A = niche(ADAM[0], ADAM[1]);
  // the parapet face: 1.4 m in front of the wall face, rising from the ledge at y = TIER
  const face = (s, y) => add([(SR - 1.4) * Math.cos(A.a), 0, (SR - 1.4) * Math.sin(A.a)], mul(A.T, s), [0, y, 0]);
  // a point by the parapet: s along the wall (+ = the viewer's right), n out into the shaft, y height
  const at = (s, n, y) => add(face(s, y), mul(A.N, n));
  const camera = (t) => {
    // low on the floor beside the wall, looking along its curve and up the tiers; a slow push
    // along the parapet, and at the end down toward the ember in the lowest row under the words
    const pos = keys(t, [[P.from, at(-8.5, 10.0, 2.2)], [L.start + 0.3, at(-5.2, 8.6, 2.6), ease.out3], [P.to, at(-3.4, 6.6, 2.8), (x) => x]]);
    const target = keys(t, [[P.from, at(2.0, 0.0, 14.0)], [L.start + 0.3, at(1.2, 0.0, 8.0), ease.out3], [L.end + 0.3, at(1.0, 0.0, 7.4), (x) => x], [P.to, at(0.6, 0.6, 5.0), ease.inOut3]]);
    const d = drift(t, 0.015);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 62, roll: 0.0 };
  };
  return {
    name: 's13-captives', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + ABYSS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeAbyss(ro, rd, jit, depth);
}`,
    uniforms: { ...ABYSS_UNIFORMS, uFocus: 12, uAperture: 0.0 },
    camera,
    textPlane: () => ({ c: at(0, 0.1, TIER + 1.45), ax: A.T, ay: [0, 1, 0], hs: [4.8, 4.8 / (TW / TH)] }),
    update(t, u) {
      u.uLip.value = LIP;
      u.uAbWords.value = 1; u.uAbGlow.value = 3.4; u.uAbDepth.value = 0.45;
      u.uStir.value = 0.8;
      // the light grows far above and its warmth comes down the shaft
      u.uGY.value = keys(t, [[P.from, 330.0], [P.to, 260.0]]);
      u.uGlory.value = keys(t, [[P.from, 0.35], [P.to, 0.9, ease.in2]]);
      u.uGR.value = 8.0;
      u.uWarm.value = keys(t, [[P.from, 0.2], [L.start + 2.5, 0.55], [P.to, 0.95]], ease.inOut3);
      u.uBeam.value = 0.0; u.uSpotR.value = 0.0;
      u.uSeal.value = [0, 0, 0, 0]; u.uBars.value = 0.0;
      // the growing light as it falls on this wall: warm, from high in the shaft
      const lp = at(4.0, 22.0, 40.0);
      u.uLamp.value = [lp[0], lp[1], lp[2], keys(t, [[P.from, 1500.0], [P.to, 4200.0, ease.in2]])];
      u.uLampCol.value.set(1.0, 0.78, 0.5);
      u.uDust.value = 1.0;
    },
    drawText(ctx, t) {
      ctx.letterSpacing = '16px';
      capsRow(ctx, t, L.words.slice(0, 3), TH * 0.29, 340, TW, { color: '255,206,130', scorch: 26 });
      capsRow(ctx, t, L.words.slice(3), TH * 0.71, 340, TW, { color: '255,206,130', scorch: 26 });
    },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.16, threshold: 0.85, vignette: 0.45 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.06], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
