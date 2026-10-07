// 46 · "Jesus Christ, the deathless Lord" "Has entered death and broken night"
// The whole gate again, from the middle of the hall: the doors bulge in like sails, cracks racing
// across them and pouring light, the iron glowing. On "Lord" the middle bar snaps and swings down;
// on "broken" the last bar goes. The two lines are cast in the brass, one above the other, burning
// through as they are sung. A slow, steady push toward the doors; everything holds its breath.
import { grade, ease, clamp01, keys, drift, linesAt, spring } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 4096, TH = 2400;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'Jesus Christ, the deathless', 'Has entered death');
  const lord = L1.words.find((w) => w.w.startsWith('Lord')), broken = L2.words.find((w) => w.w.startsWith('broken'));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [1.5, 7.0, -40.0]], [P.to, [0.4, 7.8, -33.5]]]);
    const target = keys(t, [[P.from, [0.0, 13.6, 0.0]], [P.to, [0.0, 13.8, 0.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0 };
  };
  const snap = (t, w) => (t < w.start - 0.1 ? 0 : 2.45 * spring(t, w.start - 0.1, 0.45, 0.2));
  return {
    name: 's46-deathless', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 35, uAperture: 0.0 },
    camera,
    textPlane() { return tplane([0.0, 11.6, -0.1], [-1, 0, 0], [0, 1, 0], 17.0, TW / TH); },
    update(t, u) {
      const k = clamp01((t - P.from) / (P.to - P.from));
      gatesState(u, {
        seam: 1.0 + 0.4 * k + 0.12 * Math.sin(t * 8.0),
        crack: 0.4 + 0.15 * ease.inOut3(k), hot: 0.3 + 0.3 * k,
        bow: 0.6 + 0.4 * ease.inOut3(k) + 0.04 * Math.sin(t * 9.0),
        bars: [1, 1, 1], bolt: [1, 1, 1], snap: [snap(t, broken), snap(t, lord), 2.45], barHot: 0.8 + 0.2 * k,
      });
      // this shot's light: deep furnace red
      u.uKeyCol.value.set(2.0, 0.75, 0.35); u.uCold.value = 0.8;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.32 + 0.9 * u.uBow.value; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.86, 0.62);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L2], { W: TW, H: TH, size: 520, weight: 700, rowsY: [0.18, 0.82] }); },
    post(t) { return grade(t, { exposure: 1.4, bloom: 0.15, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
