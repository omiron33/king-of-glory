// 37 · "A thief arrived, his cross upon his back:"
// A side passage of Hades, barrel-vaulted basalt running away into the dark; far down it the
// passage opens on a light, and out of that light a man comes walking toward us: a silhouette
// rimmed in gold with a faint glow of his own, a cross on his shoulder, its foot dragging on the
// flags behind him. As he comes, the line burns itself into the wall beside his path, each word
// kindling as it is sung and staying lit. The camera stands at the wall opposite and drifts
// slowly back before him.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { PASSAGE_UNIFORMS } from '/song/lib/w-C-passage.js';
import { PASSAGE_FRAG, tplane } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'A thief arrived');
  const z = (t) => -29.0 + 1.0 * (t - P.from);           // he walks toward us, steadily
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-2.6, 1.6, -9.0]], [P.to, [-2.5, 1.7, -6.5]]], ease.inOut3);
    const target = keys(t, [[P.from, [2.6, 2.5, -27.0]], [P.to, [2.8, 2.6, -23.0]]], ease.inOut3);
    const d = drift(t, 0.015);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 42, roll: 0.0, focus: 16, aperture: 0.03 };
  };
  return {
    name: 's37-thief', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: PASSAGE_FRAG,
    uniforms: { ...PASSAGE_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 16, uAperture: 0.03 },
    camera,
    // the right-hand wall above his path, reading toward us
    textPlane() { return tplane([4.15, 3.0, -21.0], [0, 0, 1], [0, 1, 0], 13.0, TW / TH); },
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = Math.hypot(1.4 - c.pos[0], z(t) - c.pos[2]); u.uAperture.value = c.aperture;
      u.uThief.value = [1.4, 0.0, z(t), 1.8];
      u.uThiefYaw.value = 0.0;
      u.uStep.value = (z(t) + 29) / 0.8;
      u.uGlow.value = 0.7;
      u.uFar.value = 0.8;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.55; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.62, 0.3);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 700, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.5, bloom: 0.12, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
