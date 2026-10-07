// 68 · final chorus: "By His cross the chains are shattered"
// Down in the abyss of tiers, on Easter morning: the vault is gone and the day falls down the
// shaft onto ledge after ledge, the dead in their niches all turned to gold. Along the ledges lie
// the broken chains that bound them; as the line is sung they slide off, tier above tier and below,
// tip over the lips and fall away into the depth. The line is cut into the face of the ledge in
// front of us, dark in the sunlit stone, the chain on it come to rest at the lip.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DABYSS_GLSL, DABYSS_UNIFORMS } from '/song/lib/w-D-abyss.js';

export const kind = 'shader';
const TW = 4096, TH = 340;
const K = 3, LY = K * 4.5;            // the tier whose ledge carries the line

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'By His cross the chains');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [2.5, LY + 0.4, -28.5]], [P.to, [1.2, LY + 0.2, -29.5], ease.out3]]);
    const target = keys(t, [[P.from, [0.0, LY + 4.0, -40.0]], [P.to, [0.0, LY + 4.2, -40.0], ease.inOut3]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 56, roll: 0.0 };
  };
  return {
    name: 's68-chains', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DABYSS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeAbyss(ro, rd, jit, depth);
}`,
    uniforms: { ...DABYSS_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 9, uAperture: 0.0, uWordDepth: 0.3 },
    camera,
    // the face of the ledge (r = 38.6) at the -z wall; the camera looks -z, so the text runs +x
    textPlane: () => ({ c: [0.0, LY + 0.25, -38.62], ax: [1, 0, 0], ay: [0, 1, 0], hs: [3.6, 3.6 * TH / TW] }),
    update(t, u) {
      u.uDay.value = 1.0; u.uWarm.value = 1.0; u.uStir.value = 0.6;
      u.uGlory.value = 0.0; u.uBeam.value = 0.0; u.uCrack.value = 0.0; u.uDust.value = 0.0;
      u.uChainS.value = keys(t, [[P.from, 0.0], [P.to, 1.5, ease.in2]]); u.uChainHold.value = K;
      u.uWordMode.value = 0;
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 300, caps: true, spacing: 14, rowsY: [0.52] }); },
    post(t) { return grade(t, { exposure: 1.05, bloom: 0.14, threshold: 0.9, vignette: 0.45 }); },
    finish() { return { flare: { amount: 0.15, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.4 }, grade: { shadows: [0.01, 0.02, 0.04], highlights: [1.0, 0.93, 0.82], amount: 0.45 } }; },
  };
};
