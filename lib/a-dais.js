// The face of the basalt step before the throne of Hades (uDais in w-a-hall), 42 m wide, facing the
// hall at z = -128. Satan's boast is branded on its right half in cinders; Hades' answer cracks open
// in cold light on its left half. Scenes 07 and 08 share this plane and these rows.
import { capsRow } from '/song/lib/a-type.js';
import { wallPlane } from '/song/lib/a-type.js';

export const DAIS_TEX = [8192, 704];
export const daisPlane = () => wallPlane([0.0, 1.72, -127.93], [0, 0, 1], 42.0, DAIS_TEX[0] / DAIS_TEX[1]);
export const CINDERS = '255,110,30';
export const COLDLIGHT = '150,215,255';

// L2: "The Nazarene is yours. / Prepare His cell." on the right half
export function boastRows(ctx, t, L2, opts = {}) {
  const [W, H] = DAIS_TEX;
  ctx.letterSpacing = '14px';
  capsRow(ctx, t, L2.words.slice(0, 4), H * 0.3, 300, W * 0.4, { cx: W * 0.78, color: CINDERS, heat: 0.45, scorch: 60, ...opts });
  capsRow(ctx, t, L2.words.slice(4), H * 0.72, 300, W * 0.4, { cx: W * 0.78, color: CINDERS, heat: 0.45, scorch: 60, ...opts });
}
// L3: "But Hades shook: / He called four-day Lazarus;" on the left half
export function shookRows(ctx, t, L3, opts = {}) {
  const [W, H] = DAIS_TEX;
  ctx.letterSpacing = '14px';
  capsRow(ctx, t, L3.words.slice(0, 3), H * 0.3, 300, W * 0.4, { cx: W * 0.22, color: COLDLIGHT, scorch: 60, ...opts });
  capsRow(ctx, t, L3.words.slice(3), H * 0.72, 300, W * 0.4, { cx: W * 0.22, color: COLDLIGHT, scorch: 60, ...opts });
}
