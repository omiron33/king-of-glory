// Lyric typography for the text textures: lines laid out centred, each word appearing as it is
// sung, earlier lines fading once they are done. Picture modules import this.
import { wordState } from '/engine.js';
import { clean } from '/song/lib/look.js';

// lines: [{ words }] from linesAt(); rows: which line goes on which row (default one row per line).
// opts: { W, H, size, weight, italic, caps, gap, hold, rowsY } (rowsY: centre y of each row, 0..1)
export function drawLines(ctx, t, lines, opts = {}) {
  const { W, H, size = 300, weight = 700, italic = false, caps = false, hold = 99, spacing = 0 } = opts;
  const rowsY = opts.rowsY ?? lines.map((_, i) => (i + 0.5) / lines.length);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.letterSpacing = `${spacing}px`;
  lines.forEach((line, i) => {
    const end = line.end + hold;
    const fade = t > end ? Math.max(0, 1 - (t - end) / 0.4) : 1;
    if (fade <= 0) return;
    const txt = (w) => { const s = clean(w.w); return caps ? s.toUpperCase() : s; };
    let fs = size;
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${fs}px "EB Garamond"`;
    const full = line.words.map(txt).join(' ');
    const wd = ctx.measureText(full).width;
    if (wd > W * 0.94) { fs = Math.floor(fs * W * 0.94 / wd); ctx.font = `${italic ? 'italic ' : ''}${weight} ${fs}px "EB Garamond"`; }
    let x = (W - ctx.measureText(full).width) / 2;
    for (const w of line.words) {
      const a = wordState(w, t).a * fade;
      if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillText(txt(w), x, H * rowsY[i]); }
      x += ctx.measureText(txt(w) + ' ').width;
    }
  });
}

// A text plane lying on a surface: centre c, text-right axis ax, text-up axis ay (unit), width w (m),
// with the canvas aspect setting the height.
export const plane = (c, ax, ay, w, aspect) => ({ c, ax, ay, hs: [w / 2, w / 2 / aspect] });
