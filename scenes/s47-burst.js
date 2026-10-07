// 47 · "The gates of brass burst outward; iron fell." "The King came through in human form and glory."
// THE CLIMAX, one unbroken shot from inside Hades. The gates stand square before us at the end of
// the hall, bowed in under the pressure of the light outside, every crack burning, the snapped bars
// hanging white-hot from their brackets; the first line burns in the lintel above them. On "burst"
// the doors tear from their hinges and come down INTO Hades, toward us, the gateway behind them
// blazing white-gold; they land crossed on the floor (the one shake of the film, damped within
// 0.3 s) while the camera is thrown back and down. Out of the light the King comes through: the
// mandorla of graded ultramarine rings and gold rays, the figure of light at its heart, growing until
// it towers over us and stands on the crossing of the fallen doors. The second line is written in
// gold round the top of the mandorla's outer ring, as on an icon; the camera then barely drifts.
import { grade, ease, clamp01, keys, drift, linesAt } from '/song/lib/look.js';
import { WORDS_UNIFORMS } from '/song/lib/w-common.js';
import { HADESC_UNIFORMS } from '/song/lib/w-C-hades.js';
import { HADES_FRAG, tplane } from '/song/lib/w-C-shot.js';
import { drawLines } from '/song/lib/words.js';

export const kind = 'shader';
const TW = 8192, TH = 1024;

export default (P) => {
  const [L1, L2] = linesAt(P.from - 0.5, 'The gates of brass burst', 'The King came through');
  const burst = L1.words.find((w) => w.w.startsWith('burst'));
  const tb = burst.start - 0.06;        // the doors give
  const tl = tb + 0.72;                 // and land
  const swap = L1.end + 0.1;            // the words move from the lintel to the fallen door
  const fall = (t) => clamp01((t - tb) / (tl - tb)) ** 2;
  const camera = (t) => {
    // a slow push toward the straining doors; from the burst a long, easing pull back and down, so
    // the King, coming through, towers over us
    const pos = keys(t, [[P.from, [1.4, 6.6, -33.5]], [tb, [0.5, 6.4, -30.5]], [L2.start + 0.7, [0.0, 5.0, -43.0]], [P.to, [-0.5, 4.8, -42.0]]]);
    const target = keys(t, [[P.from, [0.0, 15.6, 0.0]], [tb, [0.0, 15.4, 0.0]], [L2.start + 0.7, [0.0, 11.6, -10.0]], [P.to, [0.0, 11.8, -10.5]]]);
    const d = drift(t, 0.04);
    // the landing: a single damped jolt, gone within 0.3 s
    const k = t - tl;
    const sh = k > 0 && k < 0.3 ? 0.22 * Math.exp(-k / 0.07) * (1 - k / 0.3) : 0;
    const jx = sh * Math.sin(k * 2 * Math.PI * 11.0), jy = sh * Math.cos(k * 2 * Math.PI * 14.0);
    return { pos: [pos[0] + d[0] + jx, pos[1] + d[1] + jy, pos[2]], target, fov: 52, roll: 0.004 * jx, focus: 40, aperture: 0.0 };
  };
  const lintel = tplane([0, 28.6, -2.66], [-1, 0, 0], [0, 1, 0], 27, TW / TH);
  return {
    name: 's47-burst', from: P.from, to: P.to,
    textSize: [TW, TH],
    frag: HADES_FRAG,
    uniforms: { ...HADESC_UNIFORMS, ...WORDS_UNIFORMS, uFocus: 40, uAperture: 0.0 },
    camera,
    textPlane() { return lintel; },
    update(t, u) {
      const f = fall(t);
      const after = clamp01((t - tb) / 0.25);
      u.uFall.value = f;
      // before: the doors at breaking point; after: the gateway open on the light
      u.uBow.value = (1.0 + 0.08 * Math.sin(t * 9.0)) * (1 - ease.out3(clamp01((t - tb) / (tl - tb))));
      u.uCrack.value = 0.72 - 0.45 * clamp01((t - tl) / 1.5);
      u.uHot.value = 1.0 - 0.6 * after;
      u.uSeam.value = keys(t, [[P.from, 0.55], [tb - 0.3, 0.8, ease.in2], [tb, 1.2]]);
      u.uBarX.value.set(1, 1, 1);
      u.uBarSnap.value.set(2.45, 2.45, 2.45);          // snapped in the chorus, hanging from their brackets
      u.uBarHot.value = keys(t, [[P.from, 0.95], [tb, 1.0], [tl + 1.5, 0.35]]);
      u.uBolt.value.set(1, 1, 1);
      u.uChain.value = 1.0; u.uBurst.value = 0.75;
      u.uOut.value = keys(t, [[tb - 0.02, 0.0], [tb + 0.12, 0.5, ease.out3], [tl + 0.5, 0.2]]);
      u.uFlood.value = keys(t, [[tb, 0.0], [tb + 0.3, 0.5, ease.out3], [tl + 0.4, 0.22], [P.to, 0.28]]);
      u.uCold.value = 1.0 - 0.5 * after;
      u.uFires.value = 1.0 - 0.7 * after;
      // the King comes through out of the light and stands on the crossed doors
      // (He stands on the crossing of the fallen doors: His feet at the mandorla's 0.67 R below centre)
      const g = keys(t, [[tl - 0.2, [0.0, 13.0, 7.0]], [L2.start - 0.1, [0.0, 9.0, -11.5], ease.out3], [P.to, [0.0, 9.2, -11.6]]]);
      u.uG.value.set(...g);
      u.uGR.value = keys(t, [[tl - 0.2, 4.0], [L2.start - 0.1, 10.2, ease.out3], [P.to, 10.6]]);
      u.uGK.value = keys(t, [[tb + 0.15, 0.0], [tl, 0.35, ease.in2], [L2.start - 0.1, 0.55, ease.out3], [P.to, 0.6]]);
      u.uGLit.value = 3.0;
      // words: burning in the lintel, then written in gold round the mandorla's outer ring
      u.uArc.value = t >= swap ? 1 : 0;
      u.uWordMode.value = 1;
      u.uWordDepth.value = t >= swap ? 0.0 : 0.12;
      u.uWordGlow.value = 4.0;
      u.uWordCol.value.set(1.0, 0.72, 0.4);
      u.uDust.value = 1.0;
    },
    drawText(ctx, t) {
      if (t < swap) drawLines(ctx, t, [L1], { W: TW, H: TH, size: 520, weight: 700, rowsY: [0.5] });
      else drawLines(ctx, t, [L2], { W: TW, H: TH, size: 560, weight: 700, caps: true, spacing: 24, rowsY: [0.5] });
    },
    post(t) {
      const flash = Math.exp(-Math.max(0, t - tb) * 3.0) * (t > tb ? 1 : 0);
      return grade(t, { exposure: 1.2 + 0.3 * flash, bloom: 0.12 + 0.08 * flash, threshold: 0.85, vignette: 0.45 });
    },
    finish(t) {
      return { flare: { amount: 0.05, threshold: 0.75, tint: [1.0, 0.85, 0.6], length: 0.55 }, grade: { shadows: [0.0, 0.02, 0.06], highlights: [1.0, 0.94, 0.82], amount: 0.5 } };
    },
  };
};
