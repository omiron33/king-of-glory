// 42 · "The saints rose up; the thunder rolled again."
// Low in the hall, behind the waiting dead: rank on rank of rim-lit silhouettes kneel on the basalt
// before the barred gates. On "rose up" they rise, row after row, and stand facing the doors. On
// "thunder" a blow falls on the gates from outside: light bursts through the seam and every crack,
// floods the hall for an instant and dies back. The line is written in that light across the brass
// in two rows, above the heads of the saints. The camera creeps forward behind them.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 2200;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The saints rose');
  const rose = L.words.find((w) => w.w.startsWith('rose')), thunder = L.words.find((w) => w.w.startsWith('thunder'));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-4.0, 2.2, -44.0]], [P.to, [-3.2, 2.5, -40.5]]]);
    const target = keys(t, [[P.from, [0.0, 13.5, 0.0]], [P.to, [0.0, 14.0, 0.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 40, roll: 0.0 };
  };
  return {
    name: 's42-saints', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 40, uAperture: 0.0 },
    camera,
    // two rows on the doors between the middle bar and the third band, above the saints' heads
    textPlane() { return tplane([0.0, 15.3, -0.1], [-1, 0, 0], [0, 1, 0], 17.0, TW / TH); },
    update(t, u) {
      const k = t > thunder.start - 0.05 ? Math.exp(-(t - thunder.start + 0.05) * 2.2) : 0;
      gatesState(u, {
        seam: 0.55 + 2.4 * k + 0.08 * Math.sin(t * 4.0),
        crack: 0.2 + 0.4 * k,
        bars: [1, 1, 1], bolt: [1, 1, 1],
      });
      u.uFlood.value = 0.08 + 0.35 * k;
      // the saints: standing still, rising from their knees row by row
      u.uProc.value = 1.0;
      u.uProcA.value.set(0, 0, -42); u.uProcB.value.set(0, 0, -8);
      u.uProcV.value = 0.0;
      u.uProcRise.value = keys(t, [[rose.start - 0.2, 0.0], [rose.start + 2.2, 1.0, ease.out3]]);
      // this shot's light: dim and cold, so the thunder tells
      u.uKeyCol.value.set(0.8, 1.0, 1.5); u.uCold.value = 0.35;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.32; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.86, 0.62);
    },
    drawText(ctx, t) {
      const i = L.words.findIndex((w) => w.w.startsWith('the'));
      drawLines(ctx, t, [{ ...L, words: L.words.slice(0, i) }, { ...L, words: L.words.slice(i) }], { W: TW, H: TH, size: 640, weight: 700, rowsY: [0.27, 0.73] });
    },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.14, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
