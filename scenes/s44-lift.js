// 44 · (… "the mighty One!") "Lift up your gates for the King of Glory"
// Chorus two. Low on the floor of the hall, looking up at the gates: the doors begin to bow inward
// under the pressure of the light outside, the reserve bars straining in their brackets and starting
// to glow; hairline cracks race across the brass and burn. The last word of the answer finishes on
// the lower panel, and the chorus line is cast in the brass above it, shining through the doors as
// each word is sung. The camera rises slowly, tilting to hold the doors.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 4096, TH = 2400;

export default (P) => {
  const [L0, L1] = linesAt(P.from - 4.0, 'The Lord, the mighty', 'Lift up your gates');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-6.5, 1.0, -21.0]], [P.to, [-5.5, 2.4, -19.5]]]);
    const target = keys(t, [[P.from, [0.0, 12.0, 0.0]], [P.to, [0.0, 12.4, 0.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 56, roll: 0.03 };
  };
  return {
    name: 's44-lift', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 25, uAperture: 0.0 },
    camera,
    textPlane() { return tplane([0.0, 11.6, -0.1], [-1, 0, 0], [0, 1, 0], 17.0, TW / TH); },
    update(t, u) {
      const k = clamp01((t - P.from) / (P.to - P.from));
      gatesState(u, {
        seam: 0.7 + 0.3 * k + 0.1 * Math.sin(t * 6.0),
        crack: 0.15 + 0.22 * ease.inOut3(k),
        hot: 0.1 + 0.2 * k,
        bow: 0.15 + 0.35 * ease.inOut3(k),
        bars: [1, 1, 1], bolt: [1, 1, 1], barHot: 0.15 + 0.35 * k,
      });
      // this shot's light: hot orange, the iron heating
      u.uKeyCol.value.set(2.2, 1.1, 0.5); u.uCold.value = 0.8;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.32 + 0.9 * u.uBow.value; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.86, 0.62);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L0], { W: TW, H: TH, size: 520, weight: 700, hold: 0.5, rowsY: [0.18, 0.82] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.14, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
