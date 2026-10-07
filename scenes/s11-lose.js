// 11 · "Do not bring Him here. We'll lose them all!"
// Higher up the wall, out in the dark of the shaft, looking across the barred doors of the second
// tier, with tier on tier of them above and below, every cold ember behind its bars. Hades' plea is
// etched along this tier's lock rail, glinting word by word; the padlocks shake harder. When the
// line ends the lamp gutters out and the view lurches down into the dark, still falling at the cut.
// (World and lettering: lib/a-cells.js.)
import { ease, keys, linesAt } from '/song/lib/look.js';
import { cellsScene } from '/song/lib/a-cells.js';

export const kind = 'shader';

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Do not bring Him here');
  return cellsScene(P, {
    name: 's11-lose', line: L, a: 2.3, k: 1, len: 5.6, lurch: L.end + 0.33,
    cam: (t, at) => ({
      pos: keys(t, [[P.from, at(2.6, 4.6, 1.6)], [L.start - 0.1, at(0.6, 3.5, 0.75), ease.out3], [P.to, at(0.35, 3.4, 0.7), (x) => x]]),
      target: keys(t, [[P.from, at(-0.8, 0.0, -0.4)], [L.start - 0.1, at(-0.1, 0.0, 0.1), ease.out3], [P.to, at(0.0, 0.0, 0.15), (x) => x]]),
      fov: 54,
    }),
  });
};
