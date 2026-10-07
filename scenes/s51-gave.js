// 51 · "He gave him over to the keeper of the dead:"
// Wide on the throne of Hades: the bound shadow, wrapped in rings of light, is lifted from the floor
// and carried up through the air toward the seated colossus, whose stone hands leave its knees and
// come together to receive him. The line is burned across the face of the dais at the colossus's
// feet. The camera tilts slowly up with the rising prisoner.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, hallAfter } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1100;

export default (P) => {
  const [L] = linesAt(P.from - 1.0, 'He gave him over');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-6.0, 3.0, -76.0]], [P.to, [-4.5, 4.0, -78.0]]]);
    const target = keys(t, [[P.from, [1.0, 9.0, -125.0]], [P.to, [0.0, 16.0, -130.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  const sat = (t) => keys(t, [[P.from + 0.2, [12.5, 0.0, -118.0]], [P.from + 2.2, [8.0, 9.0, -125.0], ease.inOut3], [P.to - 0.6, [0.0, 24.5, -135.0], ease.inOut3]]);
  return {
    name: 's51-gave', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 50, uAperture: 0.0 },
    camera,
    // the whole face of the dais
    textPlane() { return tplane([0.0, 2.9, -121.94], [1, 0, 0], [0, 1, 0], 38.0, TW / TH); },
    update(t, u) {
      hallAfter(u, { flood: 3.0, cold: 0.5 });
      const s = sat(t);
      u.uSat.value = [s[0], s[1], s[2], 7.5];
      u.uSatFrom.value.set(0, 0, -98);
      u.uSatYaw.value = -0.35 * (1 - clamp01((t - P.from) / 3));
      u.uBind.value = 1.0; u.uTear.value = 0.1;
      u.uGrip.value = keys(t, [[P.from + 1.5, 0.0], [P.to - 0.4, 1.0, ease.inOut3]]);
      u.uWordMode.value = 1; u.uWordDepth.value = 0.12; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.8, 0.5);
    },
    drawText(ctx, t) { drawLines(ctx, t, [L], { W: TW, H: TH, size: 560, weight: 700, rowsY: [0.5] }); },
    post(t) { return grade(t, { exposure: 1.25, bloom: 0.14, threshold: 0.9, vignette: 0.55 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
