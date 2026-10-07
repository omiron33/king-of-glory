// Group C's shot helpers: the shader for a shot in Hades (w-C-hades.js), small vector helpers, and
// the geometry of the fallen doors (a door-frame point to the world, as doorFrame() in the shader
// does it in reverse), so words can be laid on the doors where they come to rest.
import { COMMON_GLSL, WORDS_GLSL, FIGURE_GLSL, GLORY_GLSL } from '/song/lib/w-common.js';
import { HADESC_GLSL } from '/song/lib/w-C-hades.js';
import { PASSAGE_GLSL } from '/song/lib/w-C-passage.js';

export const HADES_FRAG = COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + GLORY_GLSL + HADESC_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeHades(ro, rd, jit, depth);
}`;

export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const mul = (a, s) => a.map((v) => v * s);
export const unit = (a) => mul(a, 1 / Math.hypot(...a));
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// A text plane: centre c, along-text axis ax, up-the-letters axis ay, width w (m), canvas aspect.
export const tplane = (c, ax, ay, w, aspect) => ({ c, ax: unit(ax), ay: unit(ay), hs: [w / 2, w / 2 / aspect] });

// GLSL rot(a) * v (a clockwise turn by a)
const rot = (a, [x, y]) => [Math.cos(a) * x + Math.sin(a) * y, -Math.sin(a) * x + Math.cos(a) * y];
const sstep = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
// door s (-1 or +1) at fall f: a point in the door's own frame (x across, y up its height, z its
// thickness; the outer face is z = 1.2) to the world
export function doorToWorld([x, y, z], s, f = 1) {
  const th = f * 1.5208, yaw = s * 0.42 * sstep((f - 0.2) / 0.8);
  [y, z] = rot(th, [y, z]);
  x -= s * 4.5; [x, z] = rot(yaw, [x, z]); x += s * 4.5;
  return [x, y, z];
}

// The gates as Hades has them after the first chorus: the chains burst (stubs still hanging from
// their staples), the brass scorched and hairline-cracked, light at the seam. o overrides.
export function gatesState(u, o = {}) {
  const s = { seam: 0.35, crack: 0.12, hot: 0.0, bow: 0.0, bars: [0, 0, 0], snap: [0, 0, 0], barHot: 0.0, bolt: [0, 0, 0], ...o };
  u.uSeam.value = s.seam; u.uCrack.value = s.crack; u.uHot.value = s.hot; u.uBow.value = s.bow;
  u.uChain.value = 1.0; u.uBurst.value = 0.75;
  u.uBarX.value.set(...s.bars); u.uBarSnap.value.set(...s.snap); u.uBarHot.value = s.barHot; u.uBolt.value.set(...s.bolt);
  u.uFall.value = 0.0; u.uOut.value = 0.0; u.uFlood.value = 0.0; u.uGK.value = 0.0; u.uDust.value = 1.0;
}

// the side passage where the thief walks (w-C-passage.js)
export const PASSAGE_FRAG = COMMON_GLSL + WORDS_GLSL + FIGURE_GLSL + PASSAGE_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadePassage(ro, rd, jit, depth);
}`;

// The hall after the gates have fallen: the doors lie crossed on the floor, the snapped bars hang from
// their brackets, the gateway pours light down the hall (flood), the cold fires are out, the dais
// stands at the colossus's feet. o overrides.
export function hallAfter(u, o = {}) {
  const s = { flood: 1.0, wave: 999.0, out: 0.2, cold: 0.6, fires: 0.0, ...o };
  u.uFall.value = 1.0; u.uBow.value = 0.0; u.uSeam.value = 0.0; u.uCrack.value = 0.15; u.uHot.value = 0.0;
  u.uChain.value = 1.0; u.uBurst.value = 0.75;
  u.uBarX.value.set(1, 1, 1); u.uBarSnap.value.set(2.45, 2.45, 2.45); u.uBarHot.value = 0.15; u.uBolt.value.set(1, 1, 1);
  u.uOut.value = s.out; u.uFlood.value = s.flood; u.uWave.value = s.wave; u.uCold.value = s.cold; u.uFires.value = s.fires;
  u.uDais.value = 1.0; u.uDust.value = 1.0;
}
