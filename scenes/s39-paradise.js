// 39 · "He promised me His paradise today;"
// Now from the other side of the passage, low by the right-hand wall: the thief walks past the
// camera, right to left, the long upright of his cross sliding past close in the foreground, its foot
// scraping the flags. On the far wall, in the glow he carries, the promise burns in, word by word;
// on "paradise" the light down the passage swells a little, as if answering.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { PASSAGE_UNIFORMS } from '/song/lib/w-C-passage.js';
import { PASSAGE_FRAG, tplane } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'He promised me');
  const para = L.words.find((w) => w.w.startsWith('paradise'));
  const z = (t) => -21.5 + 0.9 * (t - P.from);
  const camera = (t) => {
    const pos = keys(t, [[P.from, [3.3, 1.1, -12.5]], [P.to, [3.2, 1.2, -11.8]]], ease.inOut3);
    const target = keys(t, [[P.from, [-4.0, 2.5, -17.5]], [P.to, [-4.0, 2.6, -15.0]]], ease.inOut3);
    const d = drift(t, 0.01);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 58, roll: 0.0, aperture: 0.02 };
  };
  return {
    name: 's39-paradise', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: PASSAGE_FRAG,
    uniforms: { ...PASSAGE_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 7, uAperture: 0.02 },
    camera,
    // the left-hand wall: looking at it from the right, the text runs away from the passage mouth
    textPlane() { return tplane([-4.15, 3.05, -16.6], [0, 0, -1], [0, 1, 0], 11.0, TW / TH); },
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = Math.hypot(-4.15 - c.pos[0], -16.6 - c.pos[2]); u.uAperture.value = c.aperture;
      u.uThief.value = [0.9, 0.0, z(t), 1.8];
      u.uThiefYaw.value = 0.0;
      u.uStep.value = (z(t) + 21.5) / 0.8 + 1.0;
      u.uGlow.value = 0.8;
      u.uFar.value = keys(t, [[para.start - 0.2, 0.85], [para.end + 0.6, 1.15], [P.to, 1.05]]);
      u.uWordMode.value = 1; u.uWordDepth.value = 0.55; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.62, 0.3);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 700, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.12, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
