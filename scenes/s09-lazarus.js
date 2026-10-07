// 09 · "My prisoner flew out at a single word."
// Hades remembers. One burial niche in the wall of the abyss, among the rows of cold embers, is
// shut with a slab of stone, and Hades' words are cut into it; as the line goes on, a white-gold
// light from inside the empty niche leaks through the joints of the slab. On the last word the
// slab blows outward in pieces, the words still on them, flying past us into the dark, and grave
// linen streams up out of the empty niche toward a far light.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { COMMON_GLSL } from '/song/lib/w-common.js';
import { ABYSS_GLSL, ABYSS_UNIFORMS } from '/song/lib/w-abyss.js';
import { capsRow } from '/song/lib/a-type.js';
import { niche, add, mul } from '/song/lib/a-abyss.js';

export const kind = 'shader';
const TW = 1536, TH = 1920;
const SEAL = [-20, 0];                  // the niche: index round the shaft, tier

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'My prisoner flew out');
  const W = (p) => L.words.find((w) => w.w.toLowerCase().startsWith(p));
  const word = W('word');
  const blow = word.end + 0.3;          // the slab holds until the last word has been read
  const F = niche(SEAL[0], SEAL[1]);
  const camera = (t) => {
    const dist = keys(t, [[P.from, 8.5], [L.start - 0.1, 4.6, ease.out3], [blow, 4.3, (x) => x], [P.to, 4.0]]);
    const lift = keys(t, [[blow, 0.0], [P.to, 2.6, ease.in2]]);
    const side = keys(t, [[P.from, 1.2], [L.start - 0.1, 0.25, ease.out3], [P.to, 0.1]]);
    const pos = add(F.O, mul(F.N, dist), mul(F.T, side), [0, 0.15, 0]);
    const target = add(F.O, mul(F.T, side * 0.4), [0, 0.1 + lift, 0]);
    const d = drift(t, 0.012);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  return {
    name: 's09-lazarus', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + ABYSS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeAbyss(ro, rd, jit, depth);
}`,
    uniforms: { ...ABYSS_UNIFORMS, uFocus: 5, uAperture: 0.0 },
    camera,
    // the face of the intact slab
    textPlane: () => ({ c: add(F.O, mul(F.N, 0.25)), ax: F.T, ay: [0, 1, 0], hs: [1.04, 1.3] }),
    update(t, u) {
      u.uSeal.value = [SEAL[0], SEAL[1], 1, Math.max(0, t - blow)];
      u.uSealGlow.value = keys(t, [[L.start, 0.05], [word.start, 0.6, ease.in2], [blow, 1.0]]);
      u.uLinen.value = keys(t, [[blow + 0.05, 0.0], [P.to, 0.55, ease.out3]]);
      u.uAbWords.value = 1; u.uAbGlow.value = 3.2; u.uAbDepth.value = 0.08;
      u.uStir.value = 0.5; u.uWarm.value = 0.0;
      u.uGY.value = 260; u.uGlory.value = 0.3; u.uGR.value = 6.0;
      u.uBeam.value = 0.0; u.uSpotR.value = 0.0;
      const L0 = add(F.O, mul(F.N, 6.0), mul(F.T, -5.0), [0, 4.0, 0]);
      u.uLamp.value = [L0[0], L0[1], L0[2], 150.0];
      u.uDust.value = 1.0;
    },
    drawText(ctx, t) {
      ctx.letterSpacing = '10px';
      const rows = [L.words.slice(0, 2), L.words.slice(2, 4), L.words.slice(4, 7), L.words.slice(7)];
      rows.forEach((r, i) => capsRow(ctx, t, r, TH * (0.17 + 0.22 * i), 300, TW, { color: '255,214,150', scorch: 22 }));
    },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.06], highlights: [1.0, 0.94, 0.84], amount: 0.5 } }; },
  };
};
