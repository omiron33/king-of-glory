// 52 · "Hold him until the day I come again."
// The King speaks to Hades. His glory stands near us on the left, the mandorla's rings and rays
// filling that side of the frame; beyond, across the lit hall, the colossus sits with the bound
// shadow shut in its stone hands, the chains of light glowing between the fingers. Christ's command
// is written in gold round the top of the mandorla's outer ring, as on an icon. The camera drifts
// very slowly toward the throne.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, hallAfter } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Hold him until');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [6.0, 5.0, -76.0]], [P.to, [5.5, 5.3, -79.0]]]);
    const target = keys(t, [[P.from, [-3.0, 16.0, -125.0]], [P.to, [-3.0, 16.5, -125.0]]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 52, roll: 0.0 };
  };
  return {
    name: 's52-hold', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 50, uAperture: 0.0 },
    camera,
    textPlane() { return { c: [0, -50, 0], ax: [1, 0, 0], ay: [0, 1, 0], hs: [1, 0.1] }; },
    update(t, u) {
      hallAfter(u, { flood: 3.0, cold: 0.5 });
      u.uSat.value = [0.0, 24.5, -135.0, 7.5];
      u.uSatFrom.value.set(0, 0, -98);
      u.uBind.value = 1.0; u.uTear.value = 0.1;
      u.uGrip.value = 1.0;
      // the glory, near on the left; the words round its ring
      u.uG.value.set(-3.2, 8.5, -92.0);
      u.uGR.value = 5.0; u.uGK.value = 0.55; u.uGLit.value = 2.5;
      u.uArc.value = 1.0;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.0; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.72, 0.4);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 560, weight: 700, caps: true, spacing: 24, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.2, bloom: 0.15, threshold: 0.9, vignette: 0.55 }); },
    finish() { return { flare: { amount: 0.08, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.4 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
