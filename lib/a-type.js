// Lettering helpers for group A's scenes (0:41 to 1:30): planes on the surfaces the words live on,
// and rows of capitals that appear word by word as they are sung. Picture modules import this.
import { wordState } from '/engine.js';
import { clean } from '/song/lib/look.js';

const sub = (a, b) => a.map((v, i) => v - b[i]);
const nrm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };

// A text plane lying on the floor, square to the camera: its right is the camera's right and the
// tops of the letters point away from it. w: width in metres; aspect: canvas width / height.
export function floorPlane(cam, c, w, aspect) {
  const f = nrm([cam.target[0] - cam.pos[0], 0, cam.target[2] - cam.pos[2]]);
  return { c, ax: [-f[2], 0, f[0]], ay: f, hs: [w / 2, w / 2 / aspect] };
}

// A text plane standing upright on a wall facing direction n (horizontal, toward the viewer).
// Seen from the front, the text runs to the viewer's right: ax = up x n.
export function wallPlane(c, n, w, aspect) {
  const f = nrm([n[0], 0, n[2]]);
  return { c, ax: [f[2], 0, -f[0]], ay: [0, 1, 0], hs: [w / 2, w / 2 / aspect] };
}

// One row of capitals centred at (cx, y), fitted to the width tw. Each word appears as it is sung;
// opts.heat (seconds) makes a word that has just landed flare and smoke for a moment;
// opts.scorch (px) lays a dark halo under each word (for uWordMode 3, branded, in w-a-hall).
export function capsRow(ctx, t, words, y, size, tw, opts = {}) {
  const { weight = 800, heat = 0, fit = 0.92, stretch = 1, color = '255,255,255', cx = tw / 2 } = opts;
  // stretch > 1 draws the letters tall, so a line on the floor seen at a low angle reads upright
  const fill = (s, x) => { ctx.save(); ctx.translate(x, y); ctx.scale(1, stretch); ctx.fillText(s, 0, 0); ctx.restore(); };
  const txt = (w) => clean(w.w).toUpperCase();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = `${weight} ${size}px "EB Garamond"`;
  const full = words.map(txt).join(' ');
  const wd = ctx.measureText(full).width;
  if (wd > tw * fit) ctx.font = `${weight} ${Math.floor(size * tw * fit / wd)}px "EB Garamond"`;
  let x = cx - ctx.measureText(full).width / 2;
  for (const w of words) {
    const a = wordState(w, t).a;
    if (a > 0 && opts.scorch) {
      // a scorched halo under the word (alpha only: dark, no light)
      ctx.shadowColor = `rgba(0,0,0,${(0.85 * a).toFixed(3)})`; ctx.shadowBlur = opts.scorch;
      ctx.fillStyle = `rgba(0,0,0,${(0.85 * a).toFixed(3)})`;
      for (let k = 0; k < 2; k++) fill(txt(w), x);
      ctx.shadowBlur = 0;
    }
    if (a > 0) {
      const h = heat > 0 ? Math.exp(-Math.max(0, t - w.end) / heat) : 0;
      ctx.shadowColor = `rgba(255,255,255,${(0.6 * h).toFixed(3)})`; ctx.shadowBlur = 40 * h;
      ctx.fillStyle = `rgba(${color},${a.toFixed(3)})`; fill(txt(w), x);
      ctx.shadowBlur = 0;
    }
    x += ctx.measureText(txt(w) + ' ').width;
  }
}
