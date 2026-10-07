// 43 · "Who is this King of Glory?" "The Lord, the mighty One!"
// Silence, then drums: the gates square on, filling the frame, every seam and crack glowing with
// the light pressing from outside, the reserve bars black across them. The challenge is cast into
// the brass in two lines, the question above, the answer below, each word shining through the doors
// as it is sung; on every drum hit the seam brightens. A slow, steady push toward the doors.
import { grade, ease, clamp01, keys, drift, linesAt, beats } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 4096, TH = 2400;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'Who is this King', 'The Lord, the mighty');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [0.0, 9.5, -33.0]], [P.to, [0.0, 10.2, -28.5]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target: [0.0, 12.6, 0.0], fov: 46, roll: 0.0 };
  };
  const bt = beats.map((b) => (typeof b === 'number' ? b : b.time)).filter((b) => b >= P.from - 1 && b <= P.to + 1);
  const pulse = (t) => { let k = 0; for (const b of bt) if (t >= b) k = Math.max(k, Math.exp(-(t - b) * 6.0)); return k; };
  return {
    name: 's43-who', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 30, uAperture: 0.0 },
    camera,
    // two rows on the doors: the panels centred at y = 14.8 and y = 8.4, between the bands
    textPlane() { return tplane([0.0, 11.6, -0.1], [-1, 0, 0], [0, 1, 0], 17.0, TW / TH); },
    update(t, u) {
      const k = pulse(t) * clamp01((t - L1.start + 0.3) / 0.3);
      gatesState(u, {
        seam: 0.6 + 0.6 * k,
        crack: 0.24 + 0.12 * k,
        hot: 0.08, bars: [1, 1, 1], bolt: [1, 1, 1],
      });
      // this shot's light: warm, as if from the seam
      u.uKeyCol.value.set(1.3, 0.95, 0.6); u.uCold.value = 0.45;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.32; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.86, 0.62);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L1, L2], { W: TW, H: TH, size: 520, weight: 700, rowsY: [0.18, 0.82] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.14, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
