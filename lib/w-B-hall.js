// Group B's additions to the hall of Hades (lib/w-hades.js, which stays untouched): things laid
// over shadeHades() by depth, so they sit in the same world, take its fog and are hidden by it.
//   the gates under the pressure of light (scenes 26 to 34):
//     uSpear   light spearing in through the seam and through every rivet hole, as shafts in the air
//     uRivet   the rivet holes themselves burning round each stud
//     uWide    cracks widening (with w-hades' uCrack) until the glory outside is seen through them:
//              the mandorla at uGO (radius uGOR, brightness uGOK), beyond the doors
//     uCrossL  a cross of light burning in the seam;  uRing  a ring of light in the brass round the
//              doors' centre (the mandorla's edge pressing through)
//   David's psaltery (scene 22): uPsal (xyz foot of its frame, w scale; 0 off), uPsalYaw, uStrings
//     (the strings glowing and quivering); its words are cast into the soundboard
//   Jeremiah's footprints of light (scene 23): uFeet (x, z of the first step, heading, steps shown),
//     uFeetStride; uStrip lays a level worn path of stone under them (half width uStripW) so the
//     words along it are not broken by the column tops
//   a passage wall (scene 25): uWall, a dressed stone wall facing into the hall, scratched with words
// The lyric on the doors (and lintel) is laid out by drawGate() below: one text plane over the whole
// gate, x from +14 (canvas left, as seen from inside) to -14, y from 0 to 31.2.
import { wordState } from '/engine.js';
import { clean } from '/song/lib/look.js';

export const HALLB_UNIFORMS = {
  uSpear: 0.0, uRivet: 0.0, uWide: 0.0, uGO: [0, 14, 14], uGOR: 14.0, uGOK: 0.0, uCrossL: 0.0, uRing: 0.0,
  uPsal: [0, 0, 0, 0], uPsalYaw: 0.0, uStrings: 0.0,
  uFeet: [0, 0, 0, 0], uFeetStride: 0.72, uStrip: [0, 0, 0, 0], uStripW: 1.0,
  uWall: [0, 0, 0, 0],
};

export const HALLB_GLSL = /* glsl */ `
uniform float uSpear, uRivet, uWide, uGOR, uGOK, uCrossL, uRing;
uniform vec3 uGO;
uniform vec4 uPsal; uniform float uPsalYaw, uStrings;
uniform vec4 uFeet; uniform float uFeetStride;
uniform vec4 uStrip; uniform float uStripW;
uniform vec4 uWall;    // a dressed wall of a side passage: plane x = uWall.x facing +x, from z = uWall.y to uWall.z, uWall.w high   // a smooth worn path along the footprints: xz centre, heading, half length

// ------------------------------------------------------------------ the gates giving way
const vec2 STUD = vec2(1.125, 1.067);
vec3 doorExtra(vec3 ro, vec3 rd, vec3 p) {
  vec3 q = gDQ;
  vec3 e = vec3(0.0);
  // rivet holes: light round the foot of every stud
  if (uRivet > 0.0) {
    vec2 g = q.xy - STUD * (floor(q.xy / STUD) + 0.5);
    float inD = step(abs(q.x - gDS * 4.52), 4.2) * step(0.4, q.y) * step(q.y, DH - 0.4);
    float fl = 0.7 + 0.3 * vnoise(floor(q.xy / STUD) * 3.1 + uTime * 4.0);
    float some = step(0.5, hash12(floor(q.xy / STUD) + 7.0));   // the same studs whose holes let the shafts in
    e += vec3(1.0, 0.8, 0.5) * 3.0 * uRivet * inD * fl * some * smoothstep(0.05, 0.0, abs(length(g) - 0.2));
  }
  // the cracks open and the glory outside shows through them
  if (uWide > 0.0) {
    float cr = voronoiEdge(q.xy * 0.35 + 1.7).x;
    float reach = smoothstep(uCrack * 1.2, uCrack * 1.2 - 0.3, fbm(q.xy * 0.15, 3) * 1.1);
    float w = 0.035 + uWide * 0.11;
    float m = smoothstep(w, w * 0.35, cr) * reach;
    e += m * (gloryLight(ro, rd, uGO, uGOR, uGOK, 1e5) + vec3(1.0, 0.82, 0.55) * (0.4 + 0.8 * uWide));
  }
  // a cross of light burning in the seam
  if (uCrossL > 0.0) {
    float arm = smoothstep(0.45, 0.2, abs(p.y - 17.5)) * smoothstep(5.2, 4.2, abs(p.x));
    float stem = smoothstep(0.45, 0.2, abs(p.x)) * smoothstep(2.5, 4.0, p.y) * smoothstep(25.5, 24.0, p.y);
    e += vec3(1.0, 0.86, 0.6) * uCrossL * 14.0 * max(arm, stem);
    e += vec3(1.0, 0.8, 0.5) * uCrossL * 0.6 * (exp(-abs(p.y - 17.5) / 1.2) * smoothstep(7.0, 3.0, abs(p.x)) + exp(-abs(p.x) / 1.0));
  }
  if (uRing > 0.0) {
    float r = length(p.xy - vec2(0.0, 13.0));
    e += vec3(1.0, 0.84, 0.58) * uRing * (10.0 * exp(-abs(r - 11.4) / 0.06) + 0.5 * exp(-abs(r - 11.4) / 0.8));
  }
  return e;
}

// shafts of light in the air: a sheet from the seam and a beam from every other rivet hole
vec3 spears(vec3 ro, vec3 rd, float dH, float jit) {
  if (uSpear <= 0.0 || abs(rd.z) < 1e-4) return vec3(0.0);
  float ta = (-18.0 - ro.z) / rd.z, tb = (-0.35 - ro.z) / rd.z;
  float t0 = max(min(ta, tb), 0.0), t1 = min(max(ta, tb), dH);
  if (t1 <= t0) return vec3(0.0);
  float acc = 0.0;
  float dt = (t1 - t0) / 12.0;
  for (int i = 0; i < 12; i++) {
    vec3 s = ro + rd * (t0 + (float(i) + jit) * dt);
    if (abs(s.x) > 9.2 || s.y < 0.0 || s.y > DH) continue;
    float zz = -s.z;
    float fall = exp(-zz * 0.11);
    float seam = 0.7 * exp(-abs(s.x) / (0.07 + 0.03 * zz));
    vec2 cid = floor(s.xy / STUD);
    vec2 g = s.xy - STUD * (cid + 0.5);
    float on = step(0.5, hash12(cid + 7.0)) * step(abs(abs(s.x) - 4.52), 4.2) * step(0.4, s.y) * step(s.y, DH - 0.4);
    float w = 0.05 + 0.018 * zz;
    float riv = on * exp(-dot(g, g) / (w * w)) * 0.35 * (0.6 + 0.4 * vnoise(cid * 2.3 + uTime * 3.0));
    float motes = 0.75 + 0.5 * vnoise(vec3(s.x * 2.0, s.y * 2.0 - uTime * 1.5, s.z * 2.0));
    acc += (seam + riv) * fall * motes;
  }
  return vec3(1.0, 0.84, 0.6) * acc * dt * uSpear;
}

// ------------------------------------------------------------------ David's psaltery
float sdTrap(vec2 p, float r1, float r2, float he) {
  vec2 k1 = vec2(r2, he), k2 = vec2(r2 - r1, 2.0 * he);
  p.x = abs(p.x);
  vec2 ca = vec2(p.x - min(p.x, (p.y < 0.0) ? r1 : r2), abs(p.y) - he);
  vec2 cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
vec3 psalFront() { return vec3(sin(uPsalYaw), 0.0, -cos(uPsalYaw)); }
vec3 psalRight() { return vec3(-cos(uPsalYaw), 0.0, -sin(uPsalYaw)); }
// local: x across (as seen from the front), y up from the foot, z back from the face
vec3 psalLocal(vec3 p) {
  vec3 q = (p - uPsal.xyz) / uPsal.w;
  return vec3(dot(q, psalRight()), q.y, -dot(q, psalFront()));
}
const float PS_H = 0.8, PS_B = 1.15, PS_T = 0.42;
float sdPsal(vec3 p, out int part) {
  vec3 q = psalLocal(p);
  vec2 c = vec2(q.x, q.y - PS_H);
  float outer = sdTrap(c, PS_B, PS_T, PS_H);
  float inner = sdTrap(c, PS_B - 0.11, PS_T - 0.07, PS_H - 0.09);
  float frame = max(max(outer, -inner), abs(q.z) - 0.07) - 0.01;
  float board = max(outer, abs(q.z - 0.02) - 0.025);
  // the rose of the sound hole
  board = max(board, -(length(c - vec2(0.0, 0.3)) - 0.1));
  part = frame < board ? 1 : 2;
  return min(frame, board) * uPsal.w;
}
bool marchPsal(vec3 ro, vec3 rd, float maxT, out float tp, out vec3 col) {
  tp = 0.0; col = vec3(0.0);
  vec3 cc = uPsal.xyz + vec3(0.0, PS_H * uPsal.w, 0.0);
  float b = dot(cc - ro, rd); float h = dot(cc - ro, cc - ro) - b * b;
  float rr = 1.6 * uPsal.w;
  if (h > rr * rr) return false;
  float t = max(b - rr, 0.0);
  int part = 0; bool hit = false;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float d = sdPsal(p, part);
    if (d < 0.0005 * t + 0.0005) { hit = true; break; }
    t += d;
    if (t > maxT || t > b + rr) break;
  }
  if (!hit) return false;
  vec3 p = ro + rd * t;
  vec2 e = vec2(0.001, 0.0); int k;
  vec3 n = normalize(vec3(sdPsal(p + e.xyy, k) - sdPsal(p - e.xyy, k), sdPsal(p + e.yxy, k) - sdPsal(p - e.yxy, k), sdPsal(p + e.yyx, k) - sdPsal(p - e.yyx, k)));
  vec3 q = psalLocal(p);
  float grain = 0.8 + 0.2 * sin(q.x * 90.0 + 2.0 * fbm(q.xy * vec2(2.0, 0.6), 3)) + 0.2 * fbm(q.xy * vec2(30.0, 3.0), 3);
  vec3 alb = part == 1 ? vec3(0.07, 0.032, 0.014) * grain : vec3(0.11, 0.06, 0.028) * grain;
  // light: the strings' glow in front of the board, a warm key from above, the gate seam behind
  vec3 F = psalFront();
  vec3 lig = vec3(1.0, 0.75, 0.45) * uStrings * 0.35 * sat(dot(n, F) * 0.7 + 0.3) * smoothstep(-0.1, 0.4, -q.z + 0.3);
  lig += vec3(1.0, 0.85, 0.65) * 0.25 * sat(dot(n, normalize(vec3(0.3, 1.0, -0.6))));
  lig += vec3(0.06, 0.08, 0.13);
  col = alb * lig;
  float rim = pow(1.0 - sat(dot(-rd, n)), 4.0) * sat(dot(n, vec3(0.0, 0.3, 1.0)) + 0.4);
  col += vec3(1.0, 0.7, 0.4) * rim * 0.5 * uSeam;
  col = inkWords(col, wordsOn(p), n, rd);
  col = mix(col, vec3(0.010, 0.014, 0.024), 1.0 - exp(-t * 0.0035));
  tp = t;
  return true;
}
// the strings: glowing threads in front of the soundboard, each quivering on its own
vec3 psalStrings(vec3 ro, vec3 rd, float depth) {
  if (uPsal.w <= 0.0 || uStrings <= 0.0) return vec3(0.0);
  vec3 F = psalFront();
  vec3 pc = uPsal.xyz + F * 0.045 * uPsal.w;
  float dn = dot(rd, F);
  if (abs(dn) < 1e-4) return vec3(0.0);
  float t = dot(pc - ro, F) / dn;
  if (t < 0.0 || t > depth + 0.02) return vec3(0.0);
  vec3 q = psalLocal(ro + rd * t);
  float y0 = 0.1, y1 = 2.0 * PS_H - 0.1;
  if (q.y < y0 || q.y > y1) return vec3(0.0);
  float hw = mix(PS_B - 0.12, PS_T - 0.08, (q.y) / (2.0 * PS_H));
  if (abs(q.x) > hw) return vec3(0.0);
  float sp = 0.1;
  float i = floor(q.x / sp + 0.5);
  float ph = sin(3.1416 * (q.y - y0) / (y1 - y0));
  float amp = 0.006 * uStrings * (0.6 + 0.4 * hash11(i + 3.0));
  float x = q.x - i * sp - amp * ph * sin(uTime * (40.0 + 9.0 * hash11(i)) + i);
  float px = max(t * 0.0012 / uPsal.w, 0.0015);
  float s = exp(-x * x / (px * px));
  return vec3(1.0, 0.82, 0.5) * s * 2.2 * uStrings;
}

// ------------------------------------------------------------------ Jeremiah's footprints
vec3 feetGlow(vec3 p) {
  vec2 dir = vec2(sin(uFeet.z), cos(uFeet.z)), side = vec2(dir.y, -dir.x);
  vec2 r = p.xz - uFeet.xy;
  float a = dot(r, dir), b = dot(r, side);
  float i0 = floor(a / uFeetStride + 0.5);
  vec3 e = vec3(0.0);
  for (int k = -1; k <= 1; k++) {
    float i = i0 + float(k);
    if (i < 0.0) continue;
    float on = sat(uFeet.w - i);
    if (on <= 0.0) continue;
    float sgn = mod(i, 2.0) < 0.5 ? -1.0 : 1.0;
    vec2 c = vec2(a - i * uFeetStride, b - sgn * 0.17) / 1.3;
    // a bare foot: sole, heel and the ball, toes forward along the walk
    float sole = length(c * vec2(1.0 / 0.13, 1.0 / 0.05)) - 1.0;
    float ball = length((c - vec2(0.06, 0.0)) * vec2(1.0 / 0.07, 1.0 / 0.055)) - 1.0;
    float heel = length((c + vec2(0.08, 0.0)) * vec2(1.0 / 0.055, 1.0 / 0.045)) - 1.0;
    float d = min(sole, min(ball, heel));
    float age = clamp(uFeet.w - i, 0.0, 6.0);
    float k2 = 0.6 + 0.4 * exp(-age * 0.6);
    e += vec3(1.0, 0.86, 0.6) * on * k2 * (6.0 * smoothstep(0.15, -0.1, d) + 0.35 * exp(-max(d, 0.0) * 0.8));
  }
  return e;
}

vec3 shadeHallB(vec3 ro, vec3 rd, float jit, out float depth) {
  vec3 col = shadeHades(ro, rd, jit, depth);
  float dH = depth;
  vec3 p = ro + rd * dH;
  int id = -1;
  if (dH < 419.0) mapH(p, id);
  float fogk = exp(-dH * 0.0035);
  if (id == 1) col += doorExtra(ro, rd, p) * fogk;
  // the worn path: a level band of smooth stone over the column tops, its edges sinking into them
  if (uStrip.w > 0.0 && rd.y < 0.0) {
    float ts = (0.004 - ro.y) / rd.y;
    vec3 ps = ro + rd * ts;
    vec2 dir = vec2(sin(uStrip.z), cos(uStrip.z));
    vec2 r = ps.xz - uStrip.xy;
    float along = abs(dot(r, dir)) - uStrip.w, across = abs(dot(r, vec2(dir.y, -dir.x))) - uStripW;
    float m = smoothstep(0.35, 0.0, max(along, across)) * smoothstep(0.3, 0.6, fbm(ps.xz * 1.7, 3) + 0.5 - 0.6 * max(max(along, across) + 0.35, 0.0));
    if (ts > 0.0 && ts < dH + 0.2 && m > 0.0) {
      vec3 sc = vec3(0.03, 0.033, 0.042) * (0.7 + 0.5 * fbm(ps.xz * 4.0, 3));
      sc *= vec3(0.06, 0.09, 0.16) * 6.0 + gateLight(ps, vec3(0.0, 1.0, 0.0)) * 1.5;
      sc = inkWords(sc, wordsOn(ps), vec3(0.0, 1.0, 0.0), rd);
      sc = mix(sc, vec3(0.010, 0.014, 0.024), 1.0 - exp(-ts * 0.0035));
      col = mix(col, sc, m);
      if (uFeet.w > 0.0) col += feetGlow(ps) * exp(-ts * 0.0035) * m;
      p = ps; dH = mix(dH, ts, m);
    }
  }
  if (id == 0 && uFeet.w > 0.0) col += feetGlow(p) * fogk * (uStrip.w > 0.0 ? 0.0 : 1.0);
  // the passage wall: dressed blocks of basalt, lit by the cold of the place, Satan's cinders and the seam
  if (uWall.w > 0.0 && rd.x < 0.0) {
    float tw = (uWall.x - ro.x) / rd.x;
    vec3 pw = ro + rd * tw;
    if (tw > 0.0 && tw < dH && pw.z > uWall.y && pw.z < uWall.z && pw.y > 0.0 && pw.y < uWall.w) {
      vec3 n = vec3(1.0, 0.0, 0.0);
      float row = floor(pw.y / 1.1), ox = 0.9 * mod(row, 2.0);
      vec2 b = vec2(fract((pw.z + ox) / 1.8) * 1.8, fract(pw.y / 1.1) * 1.1);
      float joint = smoothstep(0.0, 0.05, min(min(b.x, 1.8 - b.x), min(b.y, 1.1 - b.y)));
      vec3 alb = vec3(0.05, 0.052, 0.06) * (0.6 + 0.7 * fbm(pw.zy * 1.3 + row, 4)) * (0.4 + 0.6 * joint) * (0.8 + 0.4 * hash12(vec2(floor((pw.z + ox) / 1.8), row)));
      vec3 lig = uCold * vec3(0.5, 0.65, 1.0) + gateLight(pw, n);
      if (uSat.w > 0.0) { vec3 Ls = uSat.xyz + vec3(0.0, uSat.w * 0.5, 0.0) - pw; float d2 = dot(Ls, Ls); lig += vec3(1.0, 0.35, 0.08) * 6.0 * sat(dot(n, Ls * inversesqrt(d2))) / (1.0 + d2 * 0.12); }
      vec3 wc = alb * lig;
      wc = inkWords(wc, wordsOn(pw), n, rd);
      wc = mix(wc, vec3(0.010, 0.014, 0.024), 1.0 - exp(-tw * 0.0035));
      col = wc; dH = tw; depth = tw;   // (anything nearer, Satan included, already ended the march)
    }
  }
  col += spears(ro, rd, dH, jit);
  if (uPsal.w > 0.0) {
    float tp; vec3 pc;
    if (marchPsal(ro, rd, dH, tp, pc)) { col = pc; depth = tp; }
    col += psalStrings(ro, rd, depth);
  }
  return col;
}
`;

// ---------------------------------------------------------------- words on the gate
// The text canvas spans the whole gate as seen from inside: x from +14 (left) to -14, y 0..31.2.
export const GATE_TW = 3584, GATE_TH = 3994;
const PXM = GATE_TW / 28;
export const gatePlane = (z = -1.3) => ({ c: [0, 15.6, z], ax: [-1, 0, 0], ay: [0, 1, 0], hs: [14, 15.6] });
const Y = (m) => GATE_TH - m * PXM;      // world height (m) to canvas y

// fade a line out after it ends
const lineFade = (line, t, hold) => (t > line.end + hold ? Math.max(0, 1 - (t - line.end - hold) / 0.5) : 1);

// One row of words centred on the seam, split at the word gap nearest the middle so that no word
// crosses the bright seam; gap is the opening left for the seam (metres).
function seamRow(ctx, t, words, yM, size, fade, gap = 0.9, caps = false) {
  ctx.font = `600 ${size}px "EB Garamond"`;
  const txt = (w) => { const s = clean(w.w).replace(/[“”"]/g, ''); return caps ? s.toUpperCase() : s; };
  const sp = ctx.measureText(' ').width;
  const ws = words.map((w) => ctx.measureText(txt(w)).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const cx = GATE_TW / 2, g = gap * PXM / 2;
  // the word gap nearest the middle sits on the seam
  let bi = 0, bx = total / 2, acc = 0, bd = Infinity;
  for (let i = 1; i < words.length && gap > 0; i++) {
    acc += ws[i - 1] + (i > 1 ? sp : 0);
    const b = acc + sp / 2, d = Math.abs(b - total / 2);
    if (d < bd) { bd = d; bi = i; bx = b; }
  }
  // each half must stay on its own leaf (8.2 m of it)
  const widest = bi === 0 ? total / 2 : Math.max(bx - sp / 2, total - bx - sp / 2);
  if (widest > (gap > 0 ? 8.2 : 12.5) * PXM && size > 60) return seamRow(ctx, t, words, yM, Math.floor(size * (gap > 0 ? 8.2 : 12.5) * PXM / widest), fade, gap, caps);
  const pos = []; let x = 0;
  ws.forEach((w, i) => { pos.push(x); x += w + sp; });
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  words.forEach((w, i) => {
    const xx = bi === 0 ? cx - total / 2 + pos[i] : (i < bi ? cx - g - (bx - sp / 2) + pos[i] : cx + g + (pos[i] - pos[bi]));
    const a = wordState(w, t).a * fade;
    if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillText(txt(w), xx, Y(yM)); }
  });
}

// items: [{ line, rows: [index where row 2 starts] | null, y: centre height (m), size, gap, hold, caps }]
export function drawGate(ctx, t, items) {
  ctx.letterSpacing = '0px';
  for (const it of items) {
    const fade = lineFade(it.line, t, it.hold ?? 99);
    if (fade <= 0) continue;
    const size = it.size ?? 200;
    const lh = size / PXM * 1.1;
    if (it.split) {
      const i = typeof it.split === 'number' ? it.split : it.line.words.findIndex((w) => it.split.test(w.w));
      seamRow(ctx, t, it.line.words.slice(0, i), it.y + lh / 2, size, fade, it.gap, it.caps);
      seamRow(ctx, t, it.line.words.slice(i), it.y - lh / 2, size, fade, it.gap, it.caps);
    } else seamRow(ctx, t, it.line.words, it.y, size, fade, it.gap ?? 0.9, it.caps);
  }
}

// a line set along an arc round the doors' centre (0, 13), reading left to right over the top
export function drawArc(ctx, t, line, { r = 9.8, size = 200, fade = 1, spread = 1.0 } = {}) {
  ctx.font = `600 ${size}px "EB Garamond"`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.letterSpacing = '0px';
  const cx = GATE_TW / 2, cy = Y(13), R = r * PXM;
  const chars = [];
  line.words.forEach((w, wi) => {
    const s = clean(w.w).replace(/[“”"]/g, '') + (wi < line.words.length - 1 ? ' ' : '');
    for (const ch of s) chars.push({ ch, w });
  });
  const widths = chars.map((c) => ctx.measureText(c.ch).width);
  const total = widths.reduce((a, b) => a + b, 0) * spread;
  let ang = -total / R / 2;
  chars.forEach((c, i) => {
    const a0 = ang + widths[i] * spread / R / 2;
    ang += widths[i] * spread / R;
    const al = wordState(c.w, t).a * fade;
    if (al <= 0 || c.ch === ' ') return;
    ctx.save();
    ctx.translate(cx + R * Math.sin(a0), cy - R * Math.cos(a0));
    ctx.rotate(a0);
    ctx.fillStyle = `rgba(255,255,255,${al.toFixed(3)})`;
    ctx.fillText(c.ch, 0, 0);
    ctx.restore();
  });
}

// IC XC on the two leaves (not sung: the icon's name of Christ), at height y
export function drawICXC(ctx, a, y = 8.0, size = 520) {
  if (a <= 0) return;
  ctx.font = `600 ${size}px "EB Garamond"`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.letterSpacing = `${size * 0.08}px`;
  ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
  ctx.fillText('IC', GATE_TW / 2 - 4.5 * PXM, Y(y));
  ctx.fillText('XC', GATE_TW / 2 + 4.5 * PXM, Y(y));
  ctx.letterSpacing = '0px';
}
