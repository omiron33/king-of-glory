// 26 · "Who is this King of Glory?"
// The gates from inside, huge: we stand low on the basalt floor and look up the face of the doors
// of brass, banded with iron, chained in an X, to the panel near their head. A voice beyond them:
// the seam flares with each word and thin light threads in through it, and the challenge stands
// on the doors in letters lit from behind, as if the light were pressing through them. The camera
// creeps in.
import { ease, keys, linesAt } from '/song/lib/look.js';
import { drawGate } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'Who is this King');
  return gateShot(P, {
    name: 's26-who',
    pos: [[P.from, [-3.4, 6.5, -25.0]], [P.to, [-2.8, 7.0, -23.0], ease.out3]],
    target: [[P.from, [0.0, 17.0, 0.0]], [P.to, [0.0, 17.6, 0.0], ease.out3]],
    fov: 40,
    update(t, u) {
      // the voice beyond: the seam swells with every word
      const pulse = Math.min(1.5, L.words.reduce((a, w) => a + (t > w.start - 0.05 ? Math.exp(-Math.max(0, t - w.start) * 3.0) : 0), 0));
      u.uSeam.value = 0.32 + 0.22 * pulse;
      u.uSpear.value = 0.06 + 0.06 * Math.min(pulse, 1.0);
    },
    draw(ctx, t) { drawGate(ctx, t, [{ line: L, split: /^king/i, y: 21.2, size: 230 }]); },
  });
};
