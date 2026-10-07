// 01 · "The Sabbath held its breath above the tomb."
// Above, on Holy Saturday night: the round stone across the tomb door, sealed with a cord and wax.
// The words are cut across the stone in three lines round the cord and seal, each word's letters
// appearing in the stone as it is sung, the moon catching one wall of every cut. Nothing moves but
// the camera, craning slowly down and in; after the line it keeps sinking past the stone's foot into
// the ground and the picture goes dark: we are going below.
import { grade, ease, clamp01, keys, drift, linesAt, clean } from '/song/lib/look.js';
import { wordState } from '/engine.js';
import { COMMON_GLSL } from '/song/lib/x-common.js';
import { TOMB_GLSL, TOMB_UNIFORMS } from '/song/lib/x-tomb.js';

export const kind = 'shader';
const TW = 4096, TH = 2850;   // the 2.3 m x 1.6 m panel on the stone, same pixels per metre both ways

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The Sabbath held');
  const end = L.end;
  const camera = (t) => {
    // in, then down: a slow crane through the line, then sinking past the stone's foot
    const pos = keys(t, [[P.from, [-2.1, 1.75, -6.2]], [L.start + 0.6, [-1.6, 1.45, -5.2]], [end + 0.3, [-1.05, 1.3, -4.5]], [P.to, [-0.4, 0.02, -2.6], ease.in2]]);
    const target = keys(t, [[P.from, [-0.3, 1.45, -0.4]], [end + 0.3, [-0.15, 1.35, -0.4]], [P.to, [0.25, -0.3, -0.3], ease.in2]]);
    const d = drift(t, 0.006);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 40, roll: -0.01, focus: Math.hypot(pos[0] - 0.15, pos[1] - 1.1, pos[2] + 0.6), aperture: 0.012 };
  };
  return {
    name: 's01-sabbath', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: COMMON_GLSL + TOMB_GLSL + /* glsl */ `
vec3 shade(vec2 fc) {
  vec3 ro; vec3 rd = lensRay(fc, ro);
  float jit = hash12(fc + fract(uTime * 7.31) * 57.0);
  float depth;
  return shadeTomb(ro, rd, jit, depth);
}`,
    uniforms: { ...TOMB_UNIFORMS, uFocus: 3.5, uAperture: 0.012 },
    camera,
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = c.focus; u.uAperture.value = c.aperture;
      u.uMist.value = 1.0;
      u.uSink.value = ease.in2(clamp01((t - (P.to - 1.1)) / 1.1));
    },
    drawText(ctx, t) {
      // three lines cut across the stone: two above the cord and seal, one below
      const words = L.words.map((w) => ({ ...w, s: clean(w.w).replace(/[.,;:!?]/g, '').toUpperCase() }));
      const rows = [[words.slice(0, 3), 0.20], [words.slice(3, 5), 0.37], [words.slice(5), 0.72]];
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.letterSpacing = '24px';
      ctx.font = `800 320px "EB Garamond"`;
      for (const [row, y] of rows) {
        const full = row.map((w) => w.s).join(' ');
        let x = (TW - ctx.measureText(full).width) / 2;
        for (const w of row) {
          const k = wordState(w, t).a;
          if (k > 0) { ctx.fillStyle = `rgba(255,255,255,${k.toFixed(3)})`; ctx.fillText(w.s, x, TH * y); }
          x += ctx.measureText(w.s + ' ').width;
        }
      }
    },
    post(t) { return grade(t, { exposure: 1.3, bloom: 0.1, threshold: 0.9, vignette: 0.55 }); },
    finish(t) {
      return { flare: { amount: 0.15, threshold: 0.8, tint: [0.7, 0.8, 1.0], length: 0.35 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [0.9, 0.95, 1.0], amount: 0.5 } };
    },
  };
};
