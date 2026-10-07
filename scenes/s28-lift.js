// 28 · "Lift up your gates for the King of Glory"
// Chorus one. Square on to the gates from mid-height: under a pressure of light the two doors begin
// to bow inward toward us, the seam and the rivet holes pouring shafts into the hall, the iron bands
// warming. The command is written high on the doors, lit from behind; the answer fades beneath it.
import { ease, keys, linesAt } from '/song/lib/look.js';
import { drawGate } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [L0, L] = linesAt(P.from - 2.5, 'The Lord, the mighty', 'Lift up your gates');
  return gateShot(P, {
    name: 's28-lift',
    pos: [[P.from, [0.8, 9.0, -25.0]], [P.to, [0.5, 10.2, -21.5], ease.out3]],
    target: [[P.from, [0.0, 18.0, 0.0]], [P.to, [0.0, 18.8, 0.0], ease.out3]],
    fov: 42,
    update(t, u) {
      const k = (t - P.from) / (P.to - P.from);
      u.uSeam.value = 0.42 + 0.04 * Math.sin(t * 9.0);
      u.uSpear.value = 0.22;
      u.uRivet.value = 0.45;
      u.uBow.value = keys(t, [[P.from, 0.0], [P.to, 0.32, ease.out3]]);
      u.uHot.value = 0.25 * k;
    },
    draw(ctx, t) {
      drawGate(ctx, t, [
        { line: L0, split: 2, y: 14.8, size: 230, hold: 0.6 },
        { line: L, split: /^for/i, y: 21.2, size: 230 },
      ]);
    },
  });
};
