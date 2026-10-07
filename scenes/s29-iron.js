// 29 · "Let the iron fall before His light" / "Jesus Christ, the deathless Lord"
// From the left, closer: the iron bands across the brass glow red and then white-hot, the doors
// bowing further, light streaming in round every stud; the first cracks run glowing through the
// brass. The two lines are written one beneath the other below the command, lit from behind
// (and the first word of the next line, sung just before the cut).
import { ease, keys, linesAt } from '/song/lib/look.js';
import { drawGate } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [L0, L1, L2, L3] = linesAt(P.from - 6.0, 'Lift up your gates', 'Let the iron fall', 'Jesus Christ', 'Has entered death');
  return gateShot(P, {
    name: 's29-iron',
    pos: [[P.from, [-9.0, 7.0, -21.0]], [P.to, [-7.2, 7.4, -19.5], ease.out3]],
    target: [[P.from, [0.5, 13.0, 0.0]], [P.to, [0.5, 12.6, 0.0], ease.out3]],
    fov: 44,
    update(t, u) {
      u.uSeam.value = 0.44 + 0.04 * Math.sin(t * 11.0);
      u.uSpear.value = 0.25;
      u.uRivet.value = 0.5;
      u.uBow.value = keys(t, [[P.from, 0.32], [P.to, 0.45]]);
      u.uHot.value = keys(t, [[P.from, 0.3], [L1.words[2].start, 0.9, ease.out3], [P.to, 1.2]]);
      u.uCrack.value = keys(t, [[L2.words[0].start - 0.5, 0.0], [P.to, 0.45]]);
    },
    draw(ctx, t) {
      drawGate(ctx, t, [
        { line: L0, split: /^for/i, y: 21.2, size: 230 },
        { line: L1, split: /^before/i, y: 14.8, size: 230 },
        { line: L2, split: 2, y: 8.4, size: 230 },
        { line: L3, split: /^and/i, y: 2.6, size: 230 },   // "Has" lands just before the cut
      ]);
    },
  });
};
