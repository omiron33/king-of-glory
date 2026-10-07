// Group D's garden at dawn: lib/w-tomb.js (the garden tomb on the Sabbath night) on Easter morning.
// Units: metres, y up; the rock face is z = 0 and the garden lies at z < 0. The great round stone
// has been rolled away along its groove to the left of the door (uStoneX), the cord hangs broken
// from its pegs and the seal is split; the door stands open on the dark of the empty chamber,
// which runs back into the rock (a camera can start inside it). The sun is coming up low over the
// garden in front of the tomb, so it lights the rock face and the stone full on, warm; the sky
// runs from gold at the horizon to a clear morning blue. The garden: pale earth and dewy grass, a
// worn path running from the door out across the field toward the sunrise, olive trees, low hills.
//
// Light: uSun 0..1 how far the sun is up (0 the moment before it clears the hills: rose light,
// 1 full gold); uGold floods the whole garden gold (the last chorus line); uGlowIn fills the
// empty chamber with light from within (the night inside the tomb broken).
// uWall 1 builds a low dry-stone wall along the near (+x) side of the path, its face (x = 2.55,
// facing +x and away from the sun, so in soft shade) a surface for words.
// People: the glory (uG, uGR, uGK, gloryLight from w-common), figures uF0..uF2 (x, height above
// the ground, z of the feet; w height)
// with poses uP0..uP2 as in w-hades, uFRed marks figure 1 as Eve; a procession (uProc 0..1) walking
// from uProcA toward uProcB along the path at uProcV m/s, uProcW columns either side.
// Words: uStoneTxt 1 carves the text texture into the stone's face (stoneUV, a 2.3 x 1.6 m panel);
// otherwise WORDS_GLSL's plane (the scene's textPlane) writes on any surface, inked by uWordMode.

export const DAWN_UNIFORMS = {
  uMist: 1.0, uSun: 1.0, uGold: 0.0, uStoneX: -2.25, uStoneTxt: 0.0, uDark: 0.0, uGlowIn: 0.0, uWall: 0.0,
  uG: [0, 2.6, -6], uGR: 0.0, uGK: 0.0,
  uF0: [0, 0, 0, 0], uF1: [0, 0, 0, 0], uF2: [0, 0, 0, 0], uP0: [0, 0, 0, 0], uP1: [0, 0, 0, 0], uP2: [0, 0, 0, 0], uFRed: 0.0,
  uProc: 0.0, uProcA: [0, 0, -2], uProcB: [0, 0, -80], uProcV: 1.0, uProcW: 1.0,
};

export const DAWN_GLSL = /* glsl */ `
uniform float uMist, uSun, uGold, uStoneX, uStoneTxt, uDark, uGlowIn, uWall;
uniform vec3 uG; uniform float uGR, uGK;
uniform vec4 uF0, uF1, uF2, uP0, uP1, uP2; uniform float uFRed;
uniform float uProc, uProcV, uProcW; uniform vec3 uProcA, uProcB;

const float STONE_R = 1.3, STONE_T = 0.17;
const float STONE_Z = -0.42;
vec3 stoneC() { return vec3(uStoneX, 1.12, STONE_Z - 0.03 * abs(uStoneX)); }
// the sun, low over the garden in front of the tomb and to the left
vec3 sunDir() { return normalize(vec3(-0.38, mix(0.07, 0.3, uSun), -0.92)); }
vec3 sunCol() { return mix(vec3(1.0, 0.5, 0.3), vec3(1.0, 0.8, 0.56), uSun) * mix(1.3, 2.2, uSun); }

float ground(vec2 xz) {
  float h = 0.25 * fbm(xz * 0.35, 4) + 0.04 * fbm(xz * 3.0, 3);
  // the groove the stone runs in
  float g = abs(xz.y - STONE_Z);
  h -= 0.16 * smoothstep(0.32, 0.18, g) * smoothstep(4.5, 3.5, abs(xz.x + 0.6));
  // the land falls gently away and rises again into low hills far off
  h += -0.01 * max(-xz.y - 4.0, 0.0) + 9.0 * smoothstep(120.0, 260.0, -xz.y) * (0.6 + 0.4 * fbm(vec2(xz.x * 0.01, 3.0), 3));
  return h - 0.12;
}
// the path: a worn strip of pale earth from the door out toward the sunrise
float pathD(vec2 xz) {
  float cx = 0.9 * sin(-xz.y * 0.06) * smoothstep(-2.0, -12.0, xz.y);
  return abs(xz.x - cx) - mix(0.7, 1.3, smoothstep(-2.0, -30.0, xz.y));
}

float sdRock(vec3 p) {
  float face = -p.z + 0.16 * fbm(p.xy * vec2(0.9, 1.1), 5) + 0.02 * fbm(p.xy * 6.0, 3) + 0.06 * fbm(p.xy * 1.3 + 7.0, 3) + 0.012 * fbm(p.xy * 9.0, 2);
  face += 0.004 * p.y * p.y + 0.02 * p.x * p.x;
  float top = 2.25 + 0.7 * fbm(vec2(p.x * 0.35, 1.7), 3) + 0.55 * exp(-p.x * p.x * 0.25) + 0.15 * max(p.x - 1.0, 0.0);
  face = max(face, (p.y - top) * 0.7);
  // the door, cut square into the rock, and the chamber behind it
  float door = sdBox(p - vec3(0.0, 0.75, 0.6), vec3(0.58, 0.85, 0.8));
  float room = sdBox(p - vec3(0.0, 1.0, 2.6), vec3(1.4, 1.1, 1.6));
  return max(face, -min(door, room));
}

float sdStone(vec3 p) {
  vec3 q = p - stoneC();
  float r = length(q.xy);
  float d = max(r - STONE_R, abs(q.z) - STONE_T);
  float tool = 0.006 * fbm(q.xy * 6.0, 3);
  float chip = 0.03 * smoothstep(0.55, 0.85, fbm(vec2(atan(q.y, q.x) * 4.0, 2.0), 3)) * smoothstep(STONE_R - 0.12, STONE_R, r);
  return d - 0.012 + tool + chip;
}
// the cord, broken: an end hanging from each peg
float sdCord(vec3 p) {
  return min(sdCapsule(p, vec3(-1.55, 1.12, -0.2), vec3(-1.35, 0.55, -0.3), 0.013),
             sdCapsule(p, vec3(1.85, 1.14, -0.2), vec3(1.7, 0.6, -0.32), 0.013));
}
// the seal, split in two and fallen on the ground before the door
float sdSeal(vec3 p) {
  vec3 q = (p - vec3(0.35, ground(vec2(0.35, -0.95)) + 0.02, -0.95)).xzy;
  float a = sdEllipsoid(q - vec3(-0.03, 0.0, 0.0), vec3(0.04, 0.07, 0.016));
  float b = sdEllipsoid(q - vec3(0.05, -0.03, 0.0), vec3(0.035, 0.06, 0.016));
  return min(a, b);
}

// an olive tree: a twisted trunk and a crown of leaf clusters (the near one on the right)
float sdOlive(vec3 p, vec3 o, float s) {
  vec3 q = (p - o) / s;
  if (length(q - vec3(0.0, 2.4, 0.0)) > 5.0) return (length(q - vec3(0.0, 2.4, 0.0)) - 4.5) * s;
  // a gnarled, leaning trunk splitting into three limbs
  float tr = sdCapsule(q, vec3(0.0), vec3(0.45, 1.4, 0.1), 0.3 - 0.06 * q.y);
  tr = min(tr, sdCapsule(q, vec3(0.45, 1.4, 0.1), vec3(-1.2, 2.5, 0.4), 0.13));
  tr = min(tr, sdCapsule(q, vec3(0.45, 1.4, 0.1), vec3(1.8, 2.4, -0.3), 0.13));
  tr = min(tr, sdCapsule(q, vec3(0.45, 1.4, 0.1), vec3(0.5, 2.9, -0.6), 0.11));
  // a loose, ragged crown: clumps of leaves with sky between them
  float crown = 1e3;
  for (int i = 0; i < 7; i++) {
    vec3 h = hash33(vec3(float(i), o.x, o.z)) - 0.5;
    vec3 c = vec3(h.x * 3.8, 2.9 + h.y * 1.6, h.z * 3.0);
    crown = min(crown, sdEllipsoid(q - c, vec3(1.0, 0.8, 0.9)));
  }
  crown += 0.55 * fbm(q.xz * 3.0 + q.y * 2.1, 3) - 0.25;
  return min(tr, crown) * s;
}

// a figure standing on the garden: F.y is its height above the ground under it
float sdFigD(vec3 p, vec4 F, vec4 P) {
  if (F.w <= 0.0) return 1e3;
  vec3 q = p - vec3(F.x, ground(F.xz) + F.y, F.z);
  if (dot(q, q) > F.w * F.w * 4.0) return length(q) - F.w;
  q.xz = rot(P.x) * q.xz;
  return sdFigure(q, F.w, P.y, P.z, P.w);
}
// the procession on the path: ranks of figures walking out toward the sunrise
float sdProcD(vec3 p) {
  if (uProc <= 0.0) return 1e3;
  vec3 ab = uProcB - uProcA; float L = length(ab); vec3 dir = ab / L; vec3 side = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
  vec3 q = p - uProcA;
  float s = dot(q, dir) - uTime * uProcV, x = dot(q, side);
  float hw = (uProcW + 0.5) * 1.3;
  if (abs(x) > hw + 0.8 || dot(q, dir) < 0.0 || dot(q, dir) > L * uProc) return max(abs(x) - hw, 1.0);
  float row = floor(s / 1.7), col = clamp(floor(x / 1.3 + 0.5), -uProcW, uProcW);
  vec2 jt = hash22(vec2(row, col) + 3.7) - 0.5;
  vec3 c = vec3((col + 0.5 * jt.x) * 1.3, 0.0, (row + 0.5) * 1.7 + 0.6 * jt.y);
  if (hash12(vec2(row, col) + 9.1) < 0.18) return 0.45;
  vec3 lq = vec3(x - c.x, q.y - ground(p.xz), s - c.z);
  return min(sdFigure(lq, 1.65 + 0.2 * hash12(vec2(row, col)), 0.04, 0.0, 0.0), 0.45);
}

// a low wall of dressed stones along the path, 1.3 m high, from the tomb out into the field
float sdWall(vec3 p) {
  if (uWall <= 0.0) return 1e3;
  float gy = ground(vec2(2.3, p.z));
  vec3 q = p - vec3(2.3, gy, 0.0);
  float d = sdBox(q - vec3(0.0, 0.65, -32.0), vec3(0.25, 0.65, 29.0)) - 0.02;
  // coursing: shallow joints between the stones
  float jy = abs(fract(q.y / 0.43) - 0.5) * 0.43, jz = abs(fract(q.z / 0.9 + 0.5 * floor(q.y / 0.43)) - 0.5) * 0.9;
  return d + 0.012 * smoothstep(0.03, 0.0, min(jy, jz)) + 0.01 * fbm(q.yz * 3.0, 2);
}

float mapD(vec3 p, out int id) {
  float d = p.y - ground(p.xz); id = 0;
  float r = sdRock(p); if (r < d) { d = r; id = 1; }
  float s = sdStone(p); if (s < d) { d = s; id = 2; }
  float c = sdCord(p); if (c < d) { d = c; id = 3; }
  float w = sdSeal(p); if (w < d) { d = w; id = 4; }
  float o = min(sdOlive(p, vec3(-13.0, -0.15, -9.0), 1.1), min(sdOlive(p, vec3(-10.0, -0.15, -2.5), 1.25), sdOlive(p, vec3(-17.0, 0.0, -16.0), 1.4)));
  o = min(o, min(sdOlive(p, vec3(-11.0, 0.0, -22.0), 1.3), sdOlive(p, vec3(14.0, 0.0, -34.0), 1.5)));
  if (o < d) { d = o; id = 5; }
  float f0 = sdFigD(p, uF0, uP0); if (f0 < d) { d = f0; id = 6; }
  float f1 = sdFigD(p, uF1, uP1); if (f1 < d) { d = f1; id = uFRed > 0.5 ? 7 : 6; }
  float f2 = sdFigD(p, uF2, uP2); if (f2 < d) { d = f2; id = 6; }
  float pr = sdProcD(p); if (pr < d) { d = pr; id = 6; }
  float wl = sdWall(p); if (wl < d) { d = wl; id = 8; }
  return d;
}
float mapD(vec3 p) { int i; return mapD(p, i); }
vec3 normD(vec3 p, float t) {
  vec2 e = vec2(0.002 * max(1.0, t * 0.2), 0.0);
  return normalize(vec3(mapD(p + e.xyy) - mapD(p - e.xyy), mapD(p + e.yxy) - mapD(p - e.yxy), mapD(p + e.yyx) - mapD(p - e.yyx)));
}
float shadowD(vec3 p, vec3 l) {
  float s = 1.0, t = 0.03;
  for (int i = 0; i < 36; i++) {
    float h = mapD(p + l * t);
    s = min(s, 10.0 * h / t);
    t += clamp(h, 0.03, 0.6);
    if (s < 0.01 || t > 14.0) break;
  }
  return sat(s);
}

// text coordinates on the stone face: a 2.3 m x 1.6 m panel centred on the stone, read from the front
const vec2 TXT_H = vec2(1.15, 0.8);
vec2 stoneUV(vec3 p) {
  vec3 c = stoneC();
  return vec2((c.x - p.x) / (2.0 * TXT_H.x) + 0.5, (p.y - c.y) / (2.0 * TXT_H.y) + 0.5);
}

vec3 skyD(vec3 rd) {
  vec3 L = sunDir();
  float h = rd.y;
  vec3 zen = mix(vec3(0.16, 0.24, 0.45), vec3(0.22, 0.42, 0.78), uSun);
  vec3 hor = mix(vec3(1.0, 0.55, 0.38), vec3(1.0, 0.8, 0.58), uSun);
  vec3 c = mix(hor, zen, pow(sat(h * 2.2 + 0.05), 0.6));
  float m = sat(dot(rd, L));
  c += vec3(1.0, 0.6, 0.3) * 0.35 * pow(m, 8.0) * (1.2 - 0.5 * uSun) + vec3(1.0, 0.75, 0.45) * 0.4 * pow(m, 60.0);
  // thin morning cloud, lit gold from below on the sun's side
  vec2 cq = rd.xz / max(rd.y + 0.12, 0.05);
  float cl = smoothstep(0.5, 0.85, fbm(cq * 0.5 + vec2(uTime * 0.01, 0.0), 5)) * sat(rd.y * 5.0);
  c = mix(c, vec3(1.0, 0.7, 0.5) * (0.6 + 1.6 * pow(m, 3.0)), cl * 0.55);
  // the sun's disc
  c += vec3(1.0, 0.85, 0.6) * smoothstep(0.99955, 0.99975, m) * 30.0;
  c *= 1.0 + 0.35 * uGold * vec3(1.0, 0.7, 0.3);
  return c * 1.1;
}

vec3 shadeDawn(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.02; int id = -1;
  for (int i = 0; i < 200; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapD(p, k);
    if (h < 0.0004 * t) { id = k; break; }
    t += h * 0.8;
    if (t > 320.0) break;
  }
  depth = id < 0 ? 1e4 : t;
  vec3 L = sunDir(), SC = sunCol();
  vec3 col;
  if (id < 0) {
    col = skyD(rd);
  } else {
    vec3 p = ro + rd * t, n = normD(p, t);
    vec3 alb; float spec = 0.04, gl = 30.0; float cutK = 0.0; float trans = 0.0;
    if (id == 0) {
      // dewy grass, pale earth on the path
      float g = fbm(p.xz * 1.7, 4);
      alb = mix(vec3(0.16, 0.2, 0.08), vec3(0.3, 0.3, 0.13), g);
      alb = mix(alb, vec3(0.42, 0.36, 0.28) * (0.85 + 0.3 * fbm(p.xz * 5.0, 3)), smoothstep(0.25, -0.15, pathD(p.xz)));
      alb = mix(alb, vec3(0.34, 0.31, 0.27), smoothstep(-2.5, -0.5, p.z));    // bare earth before the tomb
      // flowers in the grass
      vec2 fc = fract(p.xz * 9.0) - 0.5;
      float fl = step(0.985, hash12(floor(p.xz * 9.0))) * step(0.3, pathD(p.xz)) * smoothstep(0.25, 0.15, length(fc));
      alb = mix(alb, mix(vec3(0.9, 0.85, 0.7), vec3(0.85, 0.3, 0.25), hash12(floor(p.xz * 9.0) + 2.0)), fl);
      spec = 0.15; gl = 20.0;
    }
    else if (id == 1) {
      alb = vec3(0.42, 0.38, 0.32) * (0.75 + 0.4 * fbm(p.xy * 2.5, 4));
      // inside the chamber: the stone is the same, but the light hardly reaches
    }
    else if (id == 2) {
      vec3 sc = stoneC();
      vec2 sq = p.xy - sc.xy;
      float stain = fbm(vec2(sq.x * 3.0, sq.y * 0.7) + 4.0, 4);
      float lich = smoothstep(0.55, 0.75, fbm(sq * 4.5 + 9.0, 4));
      float edge = smoothstep(STONE_R - 0.35, STONE_R, length(sq));
      alb = vec3(0.7, 0.66, 0.58) * (0.9 + 0.18 * fbm(p.xy * 5.0, 3));
      alb *= 1.0 - 0.16 * smoothstep(0.45, 0.8, stain) - 0.2 * edge;
      alb = mix(alb, vec3(0.2, 0.21, 0.16), lich * 0.3);
      if (uStoneTxt > 0.5 && n.z < -0.6) {
        vec3 cv = carve(stoneUV(p), vec2(0.0006, 0.0009));
        cutK = smoothstep(0.1, 0.7, cv.x);
      }
    }
    else if (id == 3) alb = vec3(0.18, 0.13, 0.08);
    else if (id == 5) { alb = vec3(0.07, 0.09, 0.05); trans = 1.0; }
    else if (id == 6) { alb = vec3(0.02, 0.019, 0.018); }
    else if (id == 7) { alb = vec3(0.12, 0.012, 0.01); }
    else if (id == 8) { alb = vec3(0.4, 0.36, 0.3) * (0.75 + 0.4 * fbm(p.yz * 2.0, 3)); }
    else { alb = vec3(0.32, 0.035, 0.02); spec = 0.45; gl = 90.0; }
    float sh = shadowD(p + n * 0.01, L);
    float dif = sat(dot(n, L));
    float ao = sat(0.45 + 0.55 * mapD(p + n * 0.25) / 0.25);
    vec3 skyAmb = mix(vec3(0.25, 0.3, 0.42), vec3(0.35, 0.42, 0.55), uSun) * (0.5 + 0.5 * n.y);
    vec3 lig = vec3(1.0, 0.85, 0.6) * uGlowIn * 2.5 * sat(dot(n, normalize(vec3(0.0, 1.0, 1.5) - p))) / (1.0 + dot(p - vec3(0.0, 1.0, 1.0), p - vec3(0.0, 1.0, 1.0))) * step(p.z, 0.3) * (id == 1 ? 0.0 : 1.0)
             + SC * dif * sh + skyAmb * ao * 0.55 + vec3(0.35, 0.28, 0.2) * 0.25 * sat(-n.y + 0.3) * ao;
    // the chamber is dark: whatever is inside the rock gets no sky
    bool inRoom = id == 1 && p.z > 0.25 && abs(p.x) < 1.5 && p.y < 2.2;
    if (inRoom) lig = lig * smoothstep(2.2, 0.3, p.z) * 0.6 + vec3(1.0, 0.85, 0.6) * uGlowIn * 3.0;
    if (trans > 0.0) lig += SC * 0.25 * pow(sat(dot(rd, L)), 3.0);   // sun through the leaves
    // the glory as a light
    if (uGK > 0.0) { vec3 GL = uG - p; float d2 = dot(GL, GL); lig += vec3(1.0, 0.92, 0.8) * uGK * uGR * uGR * 3.0 * sat(dot(n, GL * inversesqrt(d2)) * 0.8 + 0.2) / (d2 + 4.0); }
    col = alb * lig;
    col += SC * spec * pow(sat(dot(reflect(rd, n), L)), gl) * sh * (id == 0 ? 0.3 : 1.0);
    // rim light on the people from the low sun ahead of them
    if (id == 6 || id == 7) {
      float rim = pow(1.0 - sat(dot(-rd, n)), 3.0) * sat(dot(n, L) + 0.35);
      col += SC * rim * 0.9 * (id == 7 ? vec3(1.0, 0.3, 0.2) : vec3(1.0));
    }
    col *= 1.0 - 0.96 * cutK;
    col = inkWords(col, wordsOn(p), n, rd);
    // aerial haze toward the horizon, warm in the sun's direction
    vec3 haze = mix(vec3(0.55, 0.6, 0.72), vec3(1.0, 0.72, 0.48), pow(sat(dot(rd, L)), 4.0));
    col = mix(col, haze * (0.8 + 0.4 * uSun), 1.0 - exp(-t * 0.006));
  }
  // morning mist on the ground, lit by the sun
  if (uMist > 0.0) {
    float acc = 0.0;
    float span = min(depth, 30.0);
    for (int i = 0; i < 6; i++) {
      float tt = (float(i) + jit) / 6.0 * span;
      vec3 q = ro + rd * tt;
      acc += smoothstep(0.6, 0.0, q.y - ground(q.xz)) * fbm(q.xz * 0.4 + vec2(uTime * 0.05, 0.0), 3);
    }
    col += SC * vec3(1.0, 0.85, 0.7) * acc / 6.0 * span * 0.01 * uMist * (0.4 + 1.2 * pow(sat(dot(rd, L)), 2.0));
  }
  col += gloryLight(ro, rd, uG, uGR, uGK, depth);
  // the whole garden going gold (the stone keeps its own colour, so its words still read)
  col *= mix(vec3(1.0), vec3(1.2, 1.04, 0.78), uGold * (id == 2 ? 0.25 : 1.0));
  return col * (1.0 - uDark);
}
`;
