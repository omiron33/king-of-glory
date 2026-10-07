// 50 · "Christ caught and bound the father of the lie;"
// The King is here: His glory stands close on the right, and from it chains of light lash round the
// shadow, ring after ring from the feet up, pinning his arms; his cinders die and the cold points of
// his eyes go out. The line is written in light on the floor between them. The camera holds,
// easing in.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane, hallAfter } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 2048;

export default (P) => {
  const [L] = linesAt(P.from - 0.5, 'Christ caught');
  const caught = L.words.find((w) => w.w.startsWith('caught'));
  const camera = (t) => {
    const pos = keys(t, [[P.from, [-3.5, 12.5, -94.0]], [P.to, [-3.0, 12.0, -96.0]]]);
    const target = keys(t, [[P.from, [4.5, 0.5, -112.0]], [P.to, [4.5, 0.8, -112.0]]]);
    const d = drift(t, 0.02);
    return { pos: [pos[0] + d[0], pos[1] + d[1], pos[2]], target, fov: 50, roll: 0.0 };
  };
  return {
    name: 's50-caught', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 25, uAperture: 0.0 },
    camera,
    // on the floor in front of him, turned to face the camera
    textPlane() { return tplane([2.0, 0.03, -109.0], [0.94, 0, 0.34], [0.34, 0, -0.94], 15.0, TW / TH); },
    update(t, u) {
      hallAfter(u, { flood: 3.0, cold: 0.45 });
      u.uSat.value = [12.5, 0.0, -118.0, 7.5];
      u.uSatFrom.value.set(0, 0, -98);
      u.uSatYaw.value = -0.35;
      u.uSatLean.value = keys(t, [[caught.start, -0.2], [caught.start + 0.8, 0.0]]);
      u.uTear.value = keys(t, [[caught.start, 0.8], [caught.start + 1.2, 0.1]]);
      u.uBind.value = keys(t, [[caught.start - 0.15, 0.0], [caught.start + 1.4, 1.0, ease.out3]]);
      // the glory, near, on the right
      u.uG.value.set(13.0, 7.0, -104.0);
      u.uGR.value = 4.6; u.uGK.value = 0.45; u.uGLit.value = 2.5;
      u.uWordMode.value = 1; u.uWordDepth.value = 0.1; u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.85, 0.55);
    },
    drawText(ctx, t) {
      const i = L.words.findIndex((w) => w.w.startsWith('the'));
      drawLines(ctx, t, [{ ...L, words: L.words.slice(0, i) }, { ...L, words: L.words.slice(i) }], { W: TW, H: TH, size: 760, weight: 700, rowsY: [0.27, 0.73] });
    },
    post(t) { return grade(t, { exposure: 1.2, bloom: 0.16, threshold: 0.9, vignette: 0.55 }); },
    finish() { return { flare: { amount: 0.1, threshold: 0.8, tint: [1.0, 0.85, 0.6], length: 0.4 }, grade: { shadows: [0.0, 0.02, 0.05], highlights: [1.0, 0.94, 0.82], amount: 0.5 } }; },
  };
};
