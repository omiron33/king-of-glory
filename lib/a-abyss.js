// Where things are in the abyss of w-abyss.js, computed the same way the shader does, so group A's
// scenes can aim cameras and text planes at a given niche. Picture modules import this.
const fract = (x) => x - Math.floor(x);
export function hash11(p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
export const SR = 40.0, TH = 4.5, NN = 96;
const CW = (2 * Math.PI) / NN;

// The frame of niche (index i round the shaft, tier k): its centre O on the wall face (at height
// k*TH + y), N the normal pointing into the shaft, T along the wall (the viewer's right as seen from
// inside), all as plain arrays.
export function niche(i, k, y = 2.35) {
  const a = (i - hash11(k * 1.37 + 0.5)) * CW;
  return {
    a,
    O: [SR * Math.cos(a), k * TH + y, SR * Math.sin(a)],
    N: [-Math.cos(a), 0, -Math.sin(a)],
    T: [-Math.sin(a), 0, Math.cos(a)],
  };
}
export const add = (...v) => v.reduce((s, x) => s.map((c, j) => c + x[j]));
export const mul = (v, k) => v.map((c) => c * k);
