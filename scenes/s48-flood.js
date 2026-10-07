// 48 · "The deepest prison flooded with His light;"
// Turned round now, from just inside the broken gateway: the King's light is behind us, and it
// pours away from us down the whole length of the hall of Hades. A front of white-gold runs along
// the basalt toward the far throne, the cold fires gutter out, the colossus and the shadow at its
// feet are caught in it. The line is cut into the floor ahead of us in two rows, dark in the
// flood of light that crosses it. The camera drifts slowly up and back as the light reaches the throne.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, hallAfter } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 2048;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'The deepest prison');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [4.0, 8.5, -13.0]], [P.to, [3.5, 10.0, -16.0]]]);
    const target = keys(t, [[P.from, [0.0, 3.5, -90.0]], [P.to, [0.0, 4.5, -95.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  return {
    name: 's48-flood', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 40, uAperture: 0.0 },
    camera,
    // on the floor ahead, reading across the hall (looking down -z, screen right is +x)
    textPlane() { return tplane([0.5, 0.03, -40.0], [1, 0, 0], [0, 0, -1], 21.0, TW / TH); },
    update(t, u) {
      hallAfter(u, {
        flood: 1.2,
        wave: keys(t, [[P.from, 22.0], [P.from + 0.5, 52.0, ease.out3], [P.to, 165.0, ease.inOut3]]),
        fires: keys(t, [[P.from, 1.0], [P.from + 2.5, 0.0]]),
        cold: keys(t, [[P.from, 0.8], [P.to, 0.4]]),
      });
      u.uSat.value = [3.0, 0.0, -112.0, 7.5];
      u.uSatFrom.value.set(-10, 0, -95);
      u.uSatLean.value = keys(t, [[P.to - 1.5, 0.0], [P.to, -0.15]]);
      u.uTear.value = clamp01((t - P.to + 1.5) / 1.5) * 0.5;
      u.uWordMode.value = 0; u.uWordDepth.value = 0.1; u.uWordGlow.value = 3.5;
      u.uWordCol.value.set(1.0, 0.82, 0.5);
    },
    drawText(ctx, t) { drawLines(ctx, t, [{ ...L, words: L.words.slice(0, 3) }, { ...L, words: L.words.slice(3) }], { W: TW, H: TH, size: 860, weight: 700, rowsY: [0.27, 0.73] }); },
    post(t) { return grade(t, { exposure: 1.15, bloom: 0.14, threshold: 0.9, vignette: 0.55 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
