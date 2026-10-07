// 40 · "I come before Him. He is close behind."
// Behind the thief now, near the passage mouth, looking back down the corridor the way he came:
// he has stopped, and turns to look back toward the light at the far end, his cross black against
// it. The line burns into the right-hand wall nearest us. On "close behind" the light down there
// swells and pours up the passage toward us, gilding the vault: the King is coming.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { PASSAGE_UNIFORMS } from '/song/lib/w-C-passage.js';
import { PASSAGE_FRAG, tplane } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'I come before');
  const close = L.words.find((w) => w.w.startsWith('close'));
  const stop = P.from + 1.2;
  const z = (t) => -13.2 + 0.9 * Math.min(t - P.from, 1.2) - 0.25 * ease.out3(clamp01((t - stop) / 1.0));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-2.4, 1.7, -2.0]], [P.to, [-2.2, 1.8, -3.4]]], ease.inOut3);
    const target = keys(t, [[P.from, [2.2, 2.6, -18.0]], [P.to, [2.0, 2.7, -20.0]]], ease.inOut3);
    const d = drift(t, 0.012);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 46, roll: 0.0, aperture: 0.02 };
  };
  return {
    name: 's40-behind', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: PASSAGE_FRAG,
    uniforms: { ...PASSAGE_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 10, uAperture: 0.02 },
    camera,
    // the right-hand wall nearest us, reading toward us
    textPlane() { return tplane([4.15, 3.1, -13.0], [0, 0, 1], [0, 1, 0], 9.5, TW / TH); },
    update(t, u) {
      const c = camera(t);
      u.uFocus.value = Math.hypot(1.2 - c.pos[0], z(t) - c.pos[2]); u.uAperture.value = c.aperture;
      u.uThief.value = [1.2, 0.0, z(t), 1.8];
      // he stops and turns back toward the light
      u.uThiefYaw.value = Math.PI * ease.inOut3(clamp01((t - stop) / 1.6));
      u.uStep.value = (z(t) + 13.2) / 0.8;
      u.uGlow.value = 0.8;
      u.uFar.value = keys(t, [[close.start - 0.3, 0.9], [close.start + 1.4, 2.6, ease.inOut3], [P.to, 3.2]]);
      u.uWordMode.value = 1; u.uWordDepth.value = 0.55; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.62, 0.3);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 700, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.45, bloom: 0.12, threshold: 0.9, vignette: 0.5 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.92, 0.8], amount: 0.5 } }; },
  };
};
