// 36 · "Set every bolt across the iron doors!"
// Close in at the left jamb, low: the ends of the reserve bars lie in their iron brackets, and the
// bolts, shafts of iron as thick as a man, hang drawn up above them. One after another they drop
// and slam home through brackets and bars: the middle bar's on "Set", the lower bar's on "bolt",
// the top bar's on "doors". The command is stamped into the middle bar, glowing red as each word is
// sung. Behind it all the seam of the doors breathes with the light outside; the camera creeps in.
import { grade, ease, clamp01, keys, drift, linesAt, spring } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, gatesState } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Set every bolt');
  const W = (p) => L.words.find((w) => w.w.toLowerCase().startsWith(p));
  const set = W('set'), bolt = W('bolt'), doors = W('doors');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [1.0, 9.0, -17.0]], [P.to, [-0.2, 9.6, -14.0]]]);
    const target = keys(t, [[P.from, [-7.4, 14.2, 0.0]], [P.to, [-7.8, 14.4, 0.0]]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: -0.02 };
  };
  // a bolt drops and rings in its bracket
  const drop = (t, w) => (t < w.start - 0.12 ? 0 : spring(t, w.start - 0.12, 0.18, 0.25));
  return {
    name: 's36-bolt', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 12, uAperture: 0.0 },
    camera,
    // the middle bar's face, from the left jamb toward the seam
    textPlane() { return tplane([-3.9, 12.5, -2.1], [-1, 0, 0], [0, 1, 0], 13.6, TW / TH); },
    update(t, u) {
      gatesState(u, {
        seam: 0.6 + 0.2 * Math.max(0, Math.sin(t * 4.3 + 1.0)) ** 4,
        bars: [1, 1, 1],
        bolt: [drop(t, bolt), drop(t, set), drop(t, doors)],
      });
      // this shot's light: barely any cold light: the seam does the work
      u.uKeyCol.value.set(0.55, 0.65, 0.85); u.uCold.value = 0.8;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.1; u.uWordGlow.value = 3.2;
      u.uWordCol.value.set(1.0, 0.42, 0.12);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 420, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.12, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.82], amount: 0.5 } }; },
  };
};
