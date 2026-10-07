// The cells of Hades for scenes 10 and 11: the tiers of the abyss with every niche shut by an iron
// door of bars, a lock rail run along each tier through all the doors and a padlock at each, raked
// by a cold lamp. Hades' fear is etched into the lock rail of the nearest tier, glinting word by
// word as it is sung, while every lock shivers on its hasp and rust sifts down.
import { grade, ease, keys, drift, clean } from '/song/lib/look.js';
import { COMMON_GLSL } from '/song/lib/w-common.js';
import { ABYSS_GLSL, ABYSS_UNIFORMS } from '/song/lib/w-abyss.js';
import { capsRow } from '/song/lib/a-type.js';
import { SR, TH as TIER } from '/song/lib/a-abyss.js';

const TW = 8192, TH = 400;
const RAIL_R = SR - 0.42 - 0.045;     // the front face of the lock rail
const RAIL_Y = 2.05;

// a: angle of the text's centre on the wall; k: tier; len: text length (m)
// cam(t) returns { pos, target, fov } given helpers; lurch: time the corridor lurches into darkness
export function cellsScene(P, { name, line, a, k, len, cam, lurch = 1e9 }) {
  const N = [-Math.cos(a), 0, -Math.sin(a)], T = [-Math.sin(a), 0, Math.cos(a)];
  const C = [RAIL_R * Math.cos(a), k * TIER + RAIL_Y, RAIL_R * Math.sin(a)];
  const at = (s, n, y) => [C[0] + T[0] * s + N[0] * n, C[1] + y, C[2] + T[2] * s + N[2] * n];
  const camera = (t) => {
    const c = cam(t, at);
    const d = drift(t, 0.012);
    // the lurch: the view drops and swings away into the dark, still moving at the cut
    const lu = Math.max(0, t - lurch);
    const pos = [c.pos[0] + d[0], c.pos[1] + d[1] - 1.5 * lu * lu * 6, c.pos[2]];
    const target = [c.target[0], c.target[1] - 10 * lu * lu * 6, c.target[2]];
    return { pos, target, fov: c.fov, roll: 0.35 * lu * lu * 6 };
  };
  return {
    name, from: P.from, to: P.to,
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
    textPlane: () => ({ c: at(0, 0.03, 0), ax: T, ay: [0, 1, 0], hs: [len / 2, len / 2 / (TW / TH)] }),
    update(t, u) {
      u.uBars.value = 1.0;
      u.uRattle.value = keys(t, [[P.from, 0.4], [line.start, 1.0], [P.to, 1.4]]);
      u.uSeal.value = [0, 0, 0, 0];
      u.uAbWords.value = 1; u.uAbGlow.value = 3.0; u.uAbDepth.value = 0.15;
      u.uStir.value = 0.7; u.uWarm.value = 0.0;
      u.uGY.value = 320; u.uGlory.value = 0.25; u.uGR.value = 6.0;
      u.uBeam.value = 0.0; u.uSpotR.value = 0.0;
      // the lamp hangs out in the shaft ahead of the text, raking the doors; it gutters at the lurch
      const lp = at(5.5, 4.5, 2.2);
      const out = Math.max(0, 1 - Math.max(0, t - lurch) * 4);
      u.uLamp.value = [lp[0], lp[1], lp[2], 120.0 * out];
      u.uDust.value = 1.5;
    },
    drawText(ctx, t) {
      ctx.letterSpacing = '18px';
      capsRow(ctx, t, line.words, TH * 0.53, 300, TW, { color: '205,228,255', scorch: 16, fit: 0.97 });
    },
    post(t) { return grade(t, { exposure: 1.55, bloom: 0.14, threshold: 0.85, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.06], highlights: [0.95, 0.96, 1.0], amount: 0.5 } }; },
  };
}
