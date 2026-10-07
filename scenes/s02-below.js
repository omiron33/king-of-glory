// 02 · "Below, a light disturbed the dead."
// Below, in the abyss: we look up into black. On "Below" a crack of white-gold splits the vault far
// overhead and a shaft of light stabs straight down past us, grit streaming in it; the camera drops
// with it to the floor, where it lands on the word cut in the stone. As the line goes on the spot
// widens toward us and pours into the channels of each word in turn, and round the walls, tier on
// tier, the dead in their niches begin to flicker. At the end the camera starts to lift up the beam.
import { grade, ease, clamp01, keys, drift, linesAt, clean } from '/song/lib/look.js';
import { wordState } from '/engine.js';
import { COMMON_GLSL } from '/song/lib/x-common.js';
import { ABYSS_GLSL, ABYSS_UNIFORMS } from '/song/lib/x-abyss.js';

export const kind = 'shader';
const TW = 8192, TH = 2048;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Below, a light');
  const W = (p) => L.words.find((w) => w.w.toLowerCase().startsWith(p));
  const below = W('below'), light = W('light'), dist = W('disturbed'), dead = W('dead');
  const strike = below.start - 0.4;
  const camera = (t) => {
    // the strike comes just before "Below": the camera whips down with the falling light and is
    // settling on the floor as the word is sung
    const pos = keys(t, [[P.from, [0.0, 1.8, -22.0]], [strike, [0.0, 2.6, -20.0]], [below.start + 0.1, [0.0, 10.5, -12.5], ease.inOut3], [dead.end + 0.3, [0.0, 10.6, -10.2]], [P.to, [0.0, 10.9, -10.0]]]);
    const target = keys(t, [[P.from, [0.0, 40.0, 30.0]], [strike - 0.05, [0.0, 44.0, 30.0]], [below.start + 0.1, [0.0, 0.0, 0.2], ease.inOut3], [dead.end + 0.3, [0.0, 0.0, -0.3]], [P.to, [0.0, 16.0, 1.0], ease.in2]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0, focus: Math.hypot(pos[1], pos[2]), aperture: 0.03 };
  };
  return {
    name: 's02-below', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + ABYSS_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeAbyss(ro, rd, jit, depth);
}`,
    uniforms: { ...ABYSS_UNIFORMS, uFocus: 18, uAperture: 0.03 },
    camera,
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      // the strike on "Below": a flash, then the shaft settles bright
      const k = clamp01((t - strike) / 0.08);
      u.uBeam.value = k * (1.0 + 1.2 * Math.exp(-Math.max(0, t - strike) * 4.0));
      // the spot lands on "Below," and spreads toward us over the rest of the line
      const a = L.words[1];
      const r = keys(t, [[strike + 0.05, 0.0], [below.start, 2.3, ease.out3], [a.start - 0.3, 2.6], [a.start + 0.05, 13.5, ease.out3], [dead.end, 14.0], [P.to, 14.0]]);
      const z = keys(t, [[a.start - 0.3, 1.3], [a.start + 0.05, -0.2, ease.out3]]);
      u.uSpot.value.set(0, 0, z);
      u.uSpotR.value = r;
      u.uStir.value = keys(t, [[P.from, 0.12], [dist.start, 0.25], [dead.end, 1.0, ease.inOut3]]);
      u.uGlory.value = 0.0; u.uWarm.value = 0.0; u.uDust.value = 1.0;
      u.uCrack.value = keys(t, [[P.from, 0.05], [strike, 0.6, ease.in2], [strike + 0.4, 1.0]]);
    },
    drawText(ctx, t) {
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.letterSpacing = '0px';
      const row = (words, y, size) => {
        ctx.font = `700 ${size}px "EB Garamond"`;
        const s = words.map((w) => clean(w.w)).join(' ');
        let x = (TW - ctx.measureText(s).width) / 2;
        for (const w of words) {
          const a = wordState(w, t).a;
          if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillText(clean(w.w), x, y); }
          x += ctx.measureText(clean(w.w) + ' ').width;
        }
      };
      row([below], TH * 0.42, 820);
      row(L.words.slice(1), TH * 0.86, 640);
    },
    post(t) { return grade(t, { exposure: 1.3, bloom: 0.1, threshold: 0.95, vignette: 0.5 }); },
    finish(t) {
      return { flare: { amount: 0.0, threshold: 0.85, tint: [1.0, 0.85, 0.6], length: 0.45 }, grade: { shadows: [0.0, 0.02, 0.06], highlights: [1.0, 0.94, 0.84], amount: 0.5 } };
    },
  };
};
