// 30 · "Has entered death and broken night"
// Low at the foot of the doors, looking up their bowed face: the cracks race through the brass and
// widen, and through them, beyond the gates, the glory is seen: the mandorla's graded blue rings and
// white-gold core. Light and grit stream in at us. The last line of the verse is written low on the
// doors under the others, all lit from behind.
import { ease, keys, linesAt } from '/song/lib/look.js';
import { drawGate } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [L0, L1, L2, L3] = linesAt(P.from - 13.0, 'Lift up your gates', 'Let the iron fall', 'Jesus Christ', 'Has entered death');
  return gateShot(P, {
    name: 's30-night',
    pos: [[P.from, [2.4, 1.6, -22.0]], [P.to, [1.8, 1.8, -20.0], ease.out3]],
    target: [[P.from, [0.0, 7.0, 0.0]], [P.to, [0.0, 7.6, 0.0], ease.out3]],
    fov: 46,
    exposure: 1.15,
    words: { uWordMode: 0 },
    update(t, u) {
      u.uSeam.value = 0.24 + 0.03 * Math.sin(t * 13.0);
      u.uSpear.value = 0.0;
      u.uRivet.value = 0.5;
      u.uHot.value = 0.8;
      u.uBow.value = keys(t, [[P.from, 0.45], [P.to, 0.55]]);
      u.uCrack.value = keys(t, [[P.from, 0.4], [L3.words[2].start, 0.5, ease.out3], [P.to, 0.58]]);
      u.uWide.value = keys(t, [[P.from, 0.05], [L3.words[4].start, 0.15, ease.inOut3], [P.to, 0.22]]);
      u.uGO.value.set(0, 13, 16); u.uGOR.value = 16.0; u.uGOK.value = 1.6;
    },
    draw(ctx, t) {
      drawGate(ctx, t, [
        { line: L0, split: /^for/i, y: 21.2, size: 230 },
        { line: L1, split: /^before/i, y: 14.8, size: 230 },
        { line: L2, split: 2, y: 8.4, size: 230 },
        { line: L3, split: /^and/i, y: 2.6, size: 230 },
      ]);
    },
  });
};
