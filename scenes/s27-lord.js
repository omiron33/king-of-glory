// 27 · "The Lord, the mighty One!"
// The answer from beyond the gates, and the first blow. Low and to the right of the doors we look
// up across the chained brass; on "Lord" light spears in through the seam and through every rivet
// hole at once, shafts of it standing in the dusty air of Hades, and the studs ring with light.
// The answer appears beneath the challenge, lit from behind like it.
import { ease, keys, linesAt, clamp01 } from '/song/lib/look.js';
import { drawGate } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [W, L] = linesAt(P.from - 4.0, 'Who is this King', 'The Lord, the mighty');
  const blow = L.words[1].start;
  return gateShot(P, {
    name: 's27-lord',
    pos: [[P.from, [7.5, 2.6, -21.0]], [P.to, [6.6, 2.9, -19.6], ease.out3]],
    target: [[P.from, [0.5, 15.0, 0.0]], [P.to, [0.4, 15.4, 0.0], ease.out3]],
    fov: 44,
    update(t, u) {
      const k = t > blow ? Math.exp(-(t - blow) * 1.8) : 0;
      const on = clamp01((t - blow + 0.05) / 0.08);
      u.uSeam.value = 0.35 + 0.12 * on + 0.35 * k;
      u.uSpear.value = 0.06 + 0.2 * on + 0.25 * k;
      u.uRivet.value = 0.5 * on + 0.5 * k;
    },
    draw(ctx, t) {
      drawGate(ctx, t, [
        { line: W, split: /^king/i, y: 21.2, size: 230 },
        { line: L, split: 2, y: 14.8, size: 230 },
      ]);
    },
  });
};
