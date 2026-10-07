// 25 · "Now Satan shook;" / "He searched in vain for any way to flee."
// A side passage of the hall: a long wall of dressed basalt, and along it Satan, the tall shape of
// shadow, backs away toward the gates, trembling, his cold eyes searching the stone for a way out
// and finding only wall. The lines are scratched into the wall above him and smoulder like his
// cinders as they are sung. At the end of the passage the gates' seam burns: he stops before it.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HADES_GLSL, HADES_UNIFORMS } from '/song/lib/w-hades.js';
import { HALLB_GLSL, HALLB_UNIFORMS } from '/song/lib/w-B-hall.js';

export const kind = 'shader';
const TW = 4096, TH = 1200;
const WX = -12.0;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 3.0, 'The saints broke', 'He searched');
  const A = { ...L1, words: L1.words.slice(L1.words.findIndex((w) => /^now/i.test(w.w))) };
  A.start = A.words[0].start;
  const camera = (t) => {
    const pos = keys(t, [[P.from, [2.0, 4.0, -41.0]], [P.to, [1.0, 4.3, -37.0], ease.out3]]);
    const target = keys(t, [[P.from, [-12.0, 6.5, -30.0]], [P.to, [-11.0, 6.6, -24.0], ease.inOut3]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  return {
    name: 's25-flee', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HADES_GLSL + HALLB_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHallB(ro, rd, jit, depth);
}`,
    uniforms: { ...HADES_UNIFORMS, ...HALLB_UNIFORMS, ...WORDS_UNIFORMS, uWordMode: 1, uWordGlow: 3.2, uWordDepth: 0.1, uWordCol: [1.0, 0.42, 0.12], uFocus: 30, uAperture: 0.0 },
    camera,
    // scratched along the wall above him; seen from the hall, the text runs away from the gates
    textPlane: () => ({ c: [WX, 9.6, -27.0], ax: [0, 0, -1], ay: [0, 1, 0], hs: [8.0, 8.0 * TH / TW] }),
    update(t, u) {
      u.uSeam.value = 0.5;
      u.uChain.value = 1.0;
      u.uWall.value = [WX, -70.0, -2.0, 16.0];
      // he backs toward the gates along the wall; he trembles from "shook" on (ark-shake-ok: Satan's figure trembles, not the frame)
      const shook = A.words.find((w) => /shook/i.test(w.w)).start;
      const tr = t > shook ? 0.05 * Math.exp(-(t - shook) * 0.3) : 0;
      const z = keys(t, [[P.from, -33.0], [P.to, -22.0, ease.inOut3]]);
      u.uSat.value = [WX + 2.6 + tr * Math.sin(t * 53.0), 0.0, z + tr * Math.sin(t * 41.0 + 1.0), 6.8];
      u.uSatFrom.value.set(WX + 3.0, 0.0, -44.0);
      // he turns to the wall and back, searching
      u.uSatYaw.value = Math.PI * 0.5 + 0.9 * Math.sin((t - P.from) * 1.3);
      u.uSatLean.value = 0.12;
    },
    drawText(ctx, t) { drawLines(ctx, t, [A, L2], { W: TW, H: TH, size: 330, rowsY: [0.3, 0.72] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
