// 35 · "Hades cried, 'Bar every gate of brass!'"
// Inside the gates, after the first chorus: the doors scorched and hairline-cracked, the burst
// chains hanging from their staples, light breathing at the seam. Hades will not give up: reserve
// bars of black iron come grinding across the doors from the dark at the left jamb, one after
// another, the middle one first; Hades' cry is stamped into it, each word flaring red-hot as it is
// sung, the stamp still glowing in the iron. The lower and upper bars slam into their brackets on
// "Bar" and "brass". The camera stands off to one side, low, and eases in toward the doors.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 512;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Hades cried');
  const bar = L.words.find((w) => w.w.includes('Bar')), brass = L.words.find((w) => w.w.startsWith('brass'));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-7.5, 3.4, -19.5]], [P.to, [-6.0, 4.0, -16.5]]]);
    const target = keys(t, [[P.from, [-0.5, 10.5, 0.0]], [P.to, [-0.5, 11.0, 0.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 56, roll: 0.0 };
  };
  // each bar: dragged in fast and easing into its brackets
  const slide = (t, t0, dur) => ease.out3(clamp01((t - t0) / dur));
  return {
    name: 's35-bar', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 25, uAperture: 0.0 },
    camera,
    // the middle bar's face (x from +11.5 to -11.5 reads left to right from inside)
    textPlane() { return tplane([0.0, 12.5, -2.1], [-1, 0, 0], [0, 1, 0], 22, TW / TH); },
    update(t, u) {
      const b1 = slide(t, P.from - 0.15, 0.5), b0 = slide(t, bar.start - 0.55, 0.5), b2 = slide(t, brass.start - 0.55, 0.5);
      gatesState(u, {
        seam: 0.32 + 0.12 * Math.max(0, Math.sin(t * 4.3)) ** 4,
        bars: [b0, b1, b2],
        barHot: 0.0,
      });
      // this shot's light: the cold sourceless key, from high on the left
      u.uKeyCol.value.set(1.5, 1.8, 2.4); u.uCold.value = 1.0;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.1; u.uWordGlow.value = 3.2;
      u.uWordCol.value.set(1.0, 0.42, 0.12);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 380, weight: 700, rowsY: [0.52] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.12, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
