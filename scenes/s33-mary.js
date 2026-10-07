// 33 · "Son of Mary, Son of God" / "The King of Glory reigns on high"
// Back at the gate, wider: the doors bowed and cracked through, the glory showing in every crack,
// and in the brass round their centre a ring of light pressing through where the mandorla's edge
// stands against them. "Son of Mary, Son of God" runs round the ring's upper arc; then the last
// line of the chorus is written across the lintel above the doors.
import { ease, keys, linesAt } from '/song/lib/look.js';
import { drawGate, drawArc } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [M, K] = linesAt(P.from - 0.3, 'Son of Mary', 'The King of Glory reigns');
  return gateShot(P, {
    name: 's33-mary',
    pos: [[P.from, [1.0, 14.0, -25.0]], [P.to, [0.6, 14.5, -23.0], ease.out3]],
    target: [[P.from, [0.0, 20.5, 0.0]], [P.to, [0.0, 20.8, 0.0], ease.out3]],
    fov: 46,
    exposure: 1.15,
    words: { uWordMode: 0 },
    update(t, u) {
      u.uSeam.value = 0.28 + 0.03 * Math.sin(t * 13.0);
      u.uSpear.value = 0.3;
      u.uRivet.value = 0.5;
      u.uHot.value = 0.8;
      u.uBow.value = 0.6;
      u.uCrack.value = 0.45; u.uWide.value = 0.4;
      u.uBurst.value = 1.0;
      u.uGO.value.set(0, 13, 16); u.uGOR.value = 16.0; u.uGOK.value = 1.8;
      // the arc's words are cut dark against the light; the lintel's line burns in the dark stone
      u.uWordMode.value = t < K.words[0].start - 0.12 ? 0 : 1;
      u.uRing.value = keys(t, [[P.from, 0.3], [M.words[0].start + 0.4, 1.0, ease.out3]]);
    },
    draw(ctx, t) {
      drawArc(ctx, t, M, { r: 8.8, size: 250 });
      drawGate(ctx, t, [{ line: K, y: 28.6, size: 300, gap: 0 }]);
    },
  });
};
