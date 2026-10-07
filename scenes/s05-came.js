// 05 · "Satan came to Hades:"
// Satan comes down the hall toward us, a shape of shadow eight metres tall: cinders crawl through
// him in veins, smoke climbs off his shoulders, two cold points burn under the peaked hood, and the
// cold fires behind us light his front. Every step leaves a scorched, smouldering footprint on the
// basalt. Between him and us the line is branded into the floor in cinders, each word smoking as it
// lands; far behind him, at the end of the hall, the seam of the gates glows.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { COMMON_GLSL, WORDS_GLSL, WORDS_UNIFORMS, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HALL_GLSL, HALL_UNIFORMS } from '/song/lib/w-a-hall.js';
import { floorPlane, capsRow } from '/song/lib/a-type.js';

export const kind = 'shader';
const TW = 4096, TH = 2048;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Satan came to Hades');
  const words = L.words.slice(0, 4);
  const camera = (t) => {
    // a slow retreat before him, low, tilted down to the floor at our feet and up to his hood
    const pos = keys(t, [[P.from, [-1.6, 3.1, -103.0]], [P.to, [-1.9, 3.0, -104.2]]], (x) => x);
    const target = keys(t, [[P.from, [-3.0, 0.0, -84.0]], [P.to, [-3.2, 0.1, -84.6]]], (x) => x);
    const d = drift(t, 0.04);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 66, roll: 0.0 };
  };
  // Satan walks toward the throne (toward us), slowing as the line ends
  const sat = (t) => keys(t, [[P.from - 1.0, [-4.6, 0.0, -78.0]], [P.to + 0.6, [-4.0, 0.0, -91.5], ease.out3]]);
  return {
    name: 's05-came', from: P.from, to: P.to,
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
    textPlane: () => floorPlane(camera(P.from), [-2.1, 0.0, -97.6], 7.0, TW / TH),
    update(t, u) {
      const s = sat(t);
      const bob = 0.08 * Math.abs(Math.sin(t * 2.6));
      u.uSat.value = [s[0], s[1] + bob, s[2], 8.0];
      u.uSatFrom.value.set(-5.5, 0, -40);
      u.uSatYaw.value = Math.PI + 0.03;
      u.uSatLean.value = 0.1;
      u.uPrints.value = 1.0;
      u.uSeam.value = 0.45;
      u.uWordMode.value = 3; u.uWordDepth.value = 0.25; u.uWordGlow.value = 6.0;
      u.uWordCol.value.set(1.0, 0.38, 0.1);
    },
    drawText(ctx, t) {
      ctx.letterSpacing = '24px';
      capsRow(ctx, t, words.slice(0, 2), TH * 0.27, 760, TW, { heat: 0.45, scorch: 60 });
      capsRow(ctx, t, words.slice(2), TH * 0.73, 760, TW, { heat: 0.45, scorch: 60 });
    },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.16, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
