// 10 · "If Jesus enters, every cell will open."
// The cells of Hades: we move slowly along the foot of the abyss wall, close to the iron doors
// that shut every niche, rank on rank of them climbing out of sight up the tiers, cold embers lying
// behind the bars. Hades' fear is etched along the iron lock rail threaded through every door,
// each word glinting in the raking lamp as it is sung; the padlocks shiver on their hasps and rust
// sifts down from the hinges. (World and lettering: lib/a-cells.js.)
import { ease, keys, linesAt } from '/song/lib/look.js';
import { cellsScene } from '/song/lib/a-cells.js';

export const kind = 'shader';

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'If Jesus enters');
  return cellsScene(P, {
    name: 's10-enters', line: L, a: -1.2, k: 0, len: 5.6,
    cam: (t, at) => ({
      pos: keys(t, [[P.from, at(-4.2, 4.2, 0.6)], [L.start - 0.2, at(-0.9, 3.6, 0.3), ease.out3], [P.to, at(-0.6, 3.5, 0.25), (x) => x]]),
      target: keys(t, [[P.from, at(0.8, 0.0, 0.7)], [L.start - 0.2, at(-0.1, 0.0, 0.1), ease.out3], [P.to, at(0.0, 0.0, 0.05), (x) => x]]),
      fov: 50,
    }),
  });
};
