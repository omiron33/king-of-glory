// 34 · "...reigns on high" (held)
// The pull back to the whole straining gate: both doors bowed in, cracked through with the glory,
// the chains gone, the iron white-hot, shafts of light standing in the hall. As "on" is held a cross
// of light burns into the seam, and the name of Christ, IC XC, flares on the two leaves. The last
// line stays across the lintel; light floods round the doors into the hall, lighting the floor
// before us; the camera settles before "high" lands. The doors still stand: they fall in group C.
import { ease, keys, linesAt, clamp01 } from '/song/lib/look.js';
import { drawGate, drawArc, drawICXC } from '/song/lib/w-B-hall.js';
import { gateShot } from '/song/lib/w-B-gateshot.js';

export const kind = 'shader';

export default (P) => {
  const [M, K] = linesAt(P.from - 6.0, 'Son of Mary', 'The King of Glory reigns');
  const on = K.words.find((w) => /^on$/i.test(w.w)).start;
  const high = K.words[K.words.length - 1].start;
  return gateShot(P, {
    name: 's34-reigns',
    pos: [[P.from, [0.6, 13.6, -27.0]], [high - 0.3, [0.0, 10.0, -44.0], ease.inOut3], [P.to, [0.0, 9.97, -44.3]]],
    target: [[P.from, [0.0, 20.8, 0.0]], [high - 0.3, [0.0, 16.0, 0.0], ease.inOut3], [P.to, [0.0, 15.98, 0.0]]],
    fov: 44,
    exposure: 1.15,
    words: { uWordMode: 1, uWordGlow: 3.0 },
    update(t, u) {
      u.uSeam.value = 0.28 + 0.03 * Math.sin(t * 13.0);
      u.uSpear.value = 0.3;
      u.uRivet.value = 0.5;
      u.uHot.value = 0.8;
      u.uBow.value = keys(t, [[P.from, 0.6], [P.to, 0.7]]);
      u.uCrack.value = 0.45; u.uWide.value = keys(t, [[P.from, 0.4], [P.to, 0.5]]);
      u.uBurst.value = 1.0;
      u.uGO.value.set(0, 13, 16); u.uGOR.value = 16.0; u.uGOK.value = keys(t, [[P.from, 1.8], [high, 2.6]]);
      u.uRing.value = 1.0;
      // the light floods in round the doors and pours over the hall as "on" is held
      u.uFlood.value = keys(t, [[on, 0.0], [high, 0.35, ease.inOut3], [P.to, 0.45]]);
      u.uCrossL.value = keys(t, [[on + 0.3, 0.0], [on + 1.6, 1.0, ease.out3], [P.to, 1.2]]);
    },
    draw(ctx, t) {
      drawArc(ctx, t, M, { r: 8.8, size: 250 });
      drawGate(ctx, t, [{ line: K, y: 28.6, size: 300, gap: 0 }]);
      drawICXC(ctx, clamp01((t - (on + 1.8)) / 1.2), 4.0, 520);
    },
  });
};
