// 49 · "Satan staggered backward, seeking flight."
// At the throne's foot, the flood reaches Satan: the tall shape of shadow reels back from it, his
// smoke torn off him in rags, his cinders blown out, looking for a way out and finding only the
// dais and the stone knees of Hades behind him. The line is burned into the face of the dais, to
// the left of him, as he staggers. The camera holds low and close, drifting.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, hallAfter } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1600;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Satan staggered');
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-3.0, 3.2, -95.0]], [P.to, [-2.0, 3.6, -97.0]]]);
    const target = keys(t, [[P.from, [1.0, 6.5, -122.0]], [P.to, [1.5, 7.0, -122.0]]]);
    const d = drift(t, 0.03);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  // his feet: staggering back toward the dais in lurches
  const sx = (t) => keys(t, [[P.from, [9.0, 0.0, -110.0]], [P.from + 1.4, [10.0, 0.0, -114.0], ease.out3], [P.from + 2.6, [11.5, 0.0, -116.5], ease.out3], [P.to, [12.5, 0.0, -118.0], ease.out3]]);
  return {
    name: 's49-satan', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 25, uAperture: 0.0 },
    camera,
    // the dais face, left of centre (looking down -z, screen right is +x)
    textPlane() { return tplane([-6.0, 2.9, -121.94], [1, 0, 0], [0, 1, 0], 24.0, TW / TH); },
    update(t, u) {
      hallAfter(u, { flood: 3.0, cold: 0.5 });
      const s = sx(t);
      u.uSat.value = [s[0], s[1], s[2], 7.5];
      u.uSatFrom.value.set(0, 0, -98);
      u.uSatYaw.value = -0.35;
      u.uSatLean.value = -0.22 + 0.08 * Math.sin(t * 5.0);
      u.uTear.value = 0.7 + 0.3 * Math.sin(t * 3.0) ** 2;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.12; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.8, 0.5);
    },
    drawText(ctx, t) {
      const i = L.words.findIndex((w) => w.w.startsWith('backward'));
      drawLines(ctx, t, [{ ...L, words: L.words.slice(0, i) }, { ...L, words: L.words.slice(i) }], { W: TW, H: TH, size: 620, weight: 700, rowsY: [0.27, 0.73] });
    },
    post(t) { return grade(t, { exposure: 1.2, bloom: 0.14, threshold: 0.9, vignette: 0.55 }); },
    finish() { return { grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
