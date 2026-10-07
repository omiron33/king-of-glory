// 31 · "By His cross the chains are shattered"
// Square on to the middle of the gate where the two chains cross over the doors, their links glowing
// with the heat of the iron. As the line is sung the chains burst link by link from the crossing
// outward, uncovering the words written behind them on the brass, lit from behind.
import { ease, keys, linesAt } from '/song/lib/look.js';
import { drawGate } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [L] = linesAt(P.from - 0.3, 'By His cross');
  const chains = L.words.find((w) => /chains/i.test(w.w)).start;
  const last = L.words[L.words.length - 1];
  return gateShot(P, {
    name: 's31-chains',
    pos: [[P.from, [-1.2, 11.5, -23.0]], [P.to, [-0.8, 12.0, -20.5], ease.out3]],
    target: [[P.from, [0.0, 13.6, 0.0]], [P.to, [0.0, 13.8, 0.0], ease.out3]],
    fov: 44,
    exposure: 1.15,
    words: { uWordMode: 0 },
    update(t, u) {
      u.uSeam.value = 0.28 + 0.03 * Math.sin(t * 13.0);
      u.uSpear.value = 0.3;
      u.uRivet.value = 0.5;
      u.uHot.value = 0.8;
      u.uBow.value = 0.55;
      u.uCrack.value = 0.45; u.uWide.value = 0.35;
      u.uGO.value.set(0, 13, 16); u.uGOR.value = 16.0; u.uGOK.value = 1.6;
      // link by link from the crossing outward, from "chains" to the end of "shattered"
      u.uBurst.value = keys(t, [[chains - 0.1, 0.0], [last.end, 1.0, (x) => x]]);
    },
    draw(ctx, t) { drawGate(ctx, t, [{ line: L, split: /^the$/i, y: 14.8, size: 230 }]); },
  });
};
