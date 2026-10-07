// 41 · "David cried, 'Open to the King!'"
// Before the barred gates, small against them, stands David: a rim-lit silhouette seen from behind,
// his arm flung up toward the doors as he cries out to them. The seam answers him: the light outside
// pulses through it and through every crack, and his cry is written in that light across the brass
// above him, each word shining through the doors as it is sung; on "Open" the seam flares. The camera
// rises slowly behind him.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'David cried');
  const open = L.words.find((w) => w.w.includes('Open'));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [4.8, 0.8, -24.5]], [P.to, [4.2, 1.15, -23.0]]]);
    const target = keys(t, [[P.from, [0.6, 11.0, 0.0]], [P.to, [0.2, 11.6, 0.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 54, roll: 0.0 };
  };
  return {
    name: 's41-david', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 25, uAperture: 0.0 },
    camera,
    // across the doors between the middle bar and the top band
    textPlane() { return tplane([0.0, 15.6, -0.1], [-1, 0, 0], [0, 1, 0], 17.0, TW / TH); },
    update(t, u) {
      const flare = Math.exp(-Math.max(0, t - open.start) * 2.5) * (t > open.start ? 1 : 0);
      gatesState(u, {
        seam: 0.5 + 0.9 * flare + 0.1 * Math.sin(t * 5.0),
        crack: 0.18 + 0.15 * flare,
        bars: [1, 1, 1], bolt: [1, 1, 1],
      });
      // David: arm raised to the doors
      u.uF0.value = [2.5, 0.0, -17.2, 1.85];
      u.uFlood.value = 0.06;
      u.uP0.value = [0.0, -0.06, keys(t, [[P.from, 0.55], [L.start + 0.3, 1.0]]), 0.0];
      // this shot's light: a hard cold rim
      u.uKeyCol.value.set(1.2, 1.6, 2.7); u.uCold.value = 0.6;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.32; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.86, 0.62);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 640, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.14, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
