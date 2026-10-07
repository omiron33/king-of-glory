// 69 · final chorus: "By His life the dead arise"
// The tiers of the abyss in the morning light, from a ledge lower down, looking up. In three niches
// on the tier above us the dead who lay there stand up, and on "arise" they step out of the dark of
// the niches one after another and down onto the ledge into the light, rim-lit against the bright
// shaft. The line is cut into the face of that ledge, under their feet.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DABYSS_GLSL, DABYSS_UNIFORMS } from '/song/lib/w-D-abyss.js';

export const kind = 'shader';
const TW = 4096, TH = 340;
const K = 5, LY = K * 4.5, SR = 40, NN = 96, CW = 2 * Math.PI / NN;
const fract = (x) => x - Math.floor(x);
const hash11 = (p) => { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); };
// the angle of niche i on tier K (as cellOf() in the world staggers them)
const nicheAngle = (i) => i * CW - hash11(K * 1.37 + 0.5) * CW;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'By His life');
  const arise = wordIn(L, 'arise');
  const i0 = Math.round((-Math.PI / 2) / CW);
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-2.5, LY - 2.2, -30.5]], [P.to, [-1.6, LY - 2.4, -31.2], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, LY + 1.3, -40.0]], [P.to, [0.0, LY + 1.5, -40.0], ease.inOut3]]);
    const d = drift(t, 0.015);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  // a captive in niche i: standing in it, then stepping down onto the ledge, starting at t0
  const captive = (i, t0, h) => {
    const a = nicheAngle(i);
    return (t) => {
      const k = ease.inOut3(clamp01((t - t0) / 0.9));
      const u = 0.45 + (-0.75 - 0.45) * k, y = LY + 1.15 + (0.5 - 1.15) * ease.in2(clamp01((k - 0.35) / 0.5));
      const r = SR + u;
      return { F: [r * Math.cos(a), y, r * Math.sin(a), h], pose: [-(a + Math.PI / 2), 0.08 * Math.sin(k * Math.PI), 0.15 + 0.5 * k, 0] };
    };
  };
  const C = [captive(i0 - 1, arise.start - 0.55, 1.8), captive(i0, arise.start - 0.15, 1.85), captive(i0 + 1, arise.start + 0.25, 1.72)];
  return {
    name: 's69-arise', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DABYSS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeAbyss(ro, rd, jit, depth);
}`,
    uniforms: { ...DABYSS_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 10, uAperture: 0.0, uWordDepth: 0.3 },
    camera,
    // the face of the ledge (r = 38.6) under the risen; the camera looks -z, so the text runs +x
    textPlane: () => ({ c: [0.0, LY + 0.25, -38.62], ax: [1, 0, 0], ay: [0, 1, 0], hs: [3.2, 3.2 * TH / TW] }),
    update(t, u) {
      u.uDay.value = 1.0; u.uWarm.value = 1.0; u.uStir.value = 0.6;
      u.uGlory.value = 0.0; u.uBeam.value = 0.0; u.uCrack.value = 0.0; u.uDust.value = 0.0;
      const f = C.map((c) => c(t));
      u.uF0.value = f[0].F; u.uP0.value = f[0].pose;
      u.uF1.value = f[1].F; u.uP1.value = f[1].pose;
      u.uF2.value = f[2].F; u.uP2.value = f[2].pose;
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 300, caps: true, spacing: 14, rowsY: [0.52] }); },
    post(t) { return grade(t, { exposure: 1.05, bloom: 0.14, threshold: 0.9, vignette: 0.45 }); },
    finish() { return { flare: { amount: 0.15, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.4 }, grade: { shadows: [0.01, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
