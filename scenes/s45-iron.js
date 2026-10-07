// 45 · "Let the iron fall before His light"
// Close on the doors at the height of the bars: the iron is white-hot now, the brass bulging behind
// it, light spitting through the cracks. On "fall" the top bar snaps at the seam and both halves swing
// down on their brackets to hang against the jambs, glowing. The line burns through the brass panel
// below the middle bar. The camera eases back from the heat.
import { grade, ease, clamp01, keys, drift, linesAt, spring } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Let the iron fall');
  const fall = L.words.find((w) => w.w.startsWith('fall'));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [3.0, 9.0, -11.0]], [P.to, [3.4, 9.6, -14.0]]]);
    const target = keys(t, [[P.from, [-0.5, 12.0, 0.0]], [P.to, [-0.5, 12.4, 0.0]]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 58, roll: -0.02 };
  };
  return {
    name: 's45-iron', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 13, uAperture: 0.0 },
    camera,
    // the panel between the lower and middle bars
    textPlane() { return tplane([0.0, 8.4, -0.1], [-1, 0, 0], [0, 1, 0], 16.0, TW / TH); },
    update(t, u) {
      const sn = t < fall.start - 0.1 ? 0 : 2.45 * spring(t, fall.start - 0.1, 0.45, 0.2);
      gatesState(u, {
        seam: 1.0 + 0.1 * Math.sin(t * 7.0),
        crack: 0.4, hot: 0.3, bow: 0.5 + 0.1 * clamp01((t - P.from) / 3),
        bars: [1, 1, 1], bolt: [1, 1, 1], snap: [0, 0, sn], barHot: 0.75,
      });
      // this shot's light: white-hot iron
      u.uKeyCol.value.set(2.4, 1.3, 0.6); u.uCold.value = 0.8;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.32 + 0.9 * u.uBow.value; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.86, 0.62);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 640, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.4, bloom: 0.15, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
