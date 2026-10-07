// 59 · "One tree had led them into death;" "Christ's cross became their road to life."
// High over the hall, looking down the length of it to the gateway, where the glory stands in the
// white-gold flood. Its light throws a long shadow down the floor toward us: the shadow of a tree,
// the tree of Eden, trunk, branches and a ragged crown spread over the basalt. On "cross" the shadow
// draws itself in, the crown and branches thinning to a beam, until a cross lies dark down the
// middle of the hall. The first line burns gold in the crown's shadow; the second lies along the
// cross's beam.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 2048;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'One tree', "Christ's cross");
  const cross = wordIn(L2, 'cross');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-3.0, 21.0, -66.0]], [P.to, [0.0, 19.5, -63.0], ease.inOut3]]);
    const target = keys(t, [[P.from, [-0.5, 0.0, -38.0]], [P.to, [0.0, 0.0, -36.0], ease.inOut3]]);
    const d = drift(t, 0.04);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  return {
    name: 's59-tree', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 40, uAperture: 0.0, uWordDepth: 0.16 },
    camera,
    // on the floor across the crown of the shadow; the lower row lies along the cross's beam (z = -42.9)
    textPlane: () => ({ c: [0.0, 0.0, -41.0], ax: [-1, 0, 0], ay: [0, 0, 1], hs: [11.0, 5.5] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0;
      u.uFlood.value = 0.9;
      u.uG.value.set(0.0, 6.0, 1.5); u.uGR.value = 3.4; u.uGK.value = 0.5;
      // the tree's shadow, drawing in to the cross as "cross" is sung
      const m = keys(t, [[cross.start - 0.3, 0.0], [cross.start + 1.1, 1.0, ease.inOut3]]);
      u.uTree.value = [1.0, m, 3.6, 0];
      u.uFires.value = 0.25; u.uCold.value = 0.7; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 3.0; u.uWordCol.value.set(1.0, 0.78, 0.42);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L2], { W: TW, H: TH, size: 360, rowsY: [0.25, 0.67] }); },
    post(t) { return grade(t, { exposure: 1.15, bloom: 0.15, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { flare: { amount: 0.2, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
