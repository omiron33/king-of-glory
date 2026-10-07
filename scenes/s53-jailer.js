// 53 · "The jailer held the one who filled his cells."
// The binding done: from low at the dais, looking up the colossus, Hades holds the bound shadow
// shut in its clasped stone hands high above, the chains of light glowing between the fingers, the
// cinders dead. The line is cut into the face of the dais in the light. Then stillness: the stone
// settles, the camera barely drifts down, and the flood of light lies quiet over everything.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, hallAfter } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1100;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The jailer held');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [3.0, 2.2, -100.0]], [P.to, [2.2, 2.0, -101.5]]]);
    const target = keys(t, [[P.from, [0.0, 17.0, -135.0]], [P.to, [0.0, 16.4, -135.0]]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 58, roll: 0.0 };
  };
  return {
    name: 's53-jailer', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 30, uAperture: 0.0 },
    camera,
    textPlane() { return tplane([0.0, 2.9, -121.94], [1, 0, 0], [0, 1, 0], 34.0, TW / TH); },
    update(t, u) {
      hallAfter(u, { flood: 3.0, cold: 0.5 });
      u.uSat.value = [0.0, 24.5, -135.0, 7.5];
      u.uSatFrom.value.set(0, 0, -98);
      u.uBind.value = 1.0; u.uTear.value = 0.05;
      u.uGrip.value = 1.0;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.12; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.8, 0.5);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 560, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.25, bloom: 0.14, threshold: 0.9, vignette: 0.55 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
