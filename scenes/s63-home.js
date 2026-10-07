// 63 · "Now Adam's children followed Christ toward home." and the guitar solo's first bars.
// Inside the passage out of Hades. The stair of light climbs away through the rock and Adam's
// children climb it in their ranks, rim-lit against the glowing treads; the glory goes before them
// at the top, where the light is. The line burns gold along the passage wall beside them, reading
// the way they walk. As the solo begins the camera lifts off the floor and rises with them up the
// stair, slowly at first, leaving the line on the wall below, until at the top it is in the light
// and the frame fills with it: the way out of death, toward the dawn.
import { grade, ease, clamp01, keys, drift, linesAt, wordIn } from '/song/lib/look.js';
import { drawLines } from '/song/lib/words.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { DHADES_GLSL, DHADES_UNIFORMS } from '/song/lib/w-D-hades.js';

export const kind = 'shader';
const TW = 4096, TH = 640;

export default (P) => {
  const [L0] = linesAt(P.from - 0.5, "Now Adam's children");
  // the aligner stretched "toward" over the whole solo; it is sung at 345.25 and "home." just after
  const L = { ...L0, words: L0.words.map((w) => (/^home/i.test(w.w) ? { ...w, start: 345.75, end: 346.1 } : /^toward/i.test(w.w) ? { ...w, end: 345.7 } : w)), end: 346.1 };
  const lift = 347.2;      // the camera stays put until the line has been read, then rises
  const camera = (t) => {
    const u = ease.inOut3(clamp01((t - lift) / (P.to - lift)));
    const pos = keys(t, [[P.from, [-11.0, 2.4, 4.5]], [lift, [-10.6, 2.7, 5.8], ease.out3], [P.to, [-1.0, 22.0, 34.0], ease.inOut3]]);
    const target = keys(t, [[P.from, [14.2, 12.5, 18.0]], [lift, [14.2, 12.8, 18.5], ease.out3], [P.to, [0.0, 25.0, 52.0], ease.inOut3]]);
    const d = drift(t, 0.03 * (1 - u));
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50 + 6 * u, roll: 0.0 };
  };
  return {
    name: 's63-home', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + DHADES_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`,
    uniforms: { ...DHADES_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 20, uAperture: 0.0, uWordDepth: 0.1 },
    camera,
    // the passage's right wall (x = 14.2, facing -x); from inside it reads along +z, the way out
    textPlane: () => ({ c: [14.19, 16.0, 17.0], ax: [0, 0, 1], ay: [0, 1, 0], hs: [15.0, 15.0 * TH / TW] }),
    update(t, u) {
      u.uFall.value = 1.035; u.uSeam.value = 0.0;
      u.uFlood.value = 0.3; u.uStair.value = 1.0;
      // the glory at the head of the stair; the light at the top swells as we near it
      const k = clamp01((t - lift) / (P.to - lift));
      u.uG.value.set(0.0, 22.5, 44.0); u.uGR.value = 3.6; u.uGK.value = 0.55 + 2.5 * k * k * k;
      u.uProc.value = 1.0; u.uProcV.value = 1.2; u.uProcRise.value = 0.475; u.uProcW.value = 2.0;
      u.uProcA.value.set(0, 1.2, -30); u.uProcB.value.set(0, 0, 44);
      u.uFires.value = 0.0; u.uCold.value = 0.6; u.uDust.value = 1.0;
      u.uWordMode.value = 1; u.uWordGlow.value = 2.6; u.uWordCol.value.set(1.0, 0.78, 0.42);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 420, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.1 + 0.6 * clamp01((t - P.to + 2.5) / 2.5), bloom: 0.15, threshold: 0.9, vignette: 0.5 }); },
    finish(t) { return { flare: { amount: 0.25, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
