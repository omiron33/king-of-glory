// The garden tomb on the night of the Sabbath (units: metres, y up; the rock face is z = 0 and we
// stand at z < 0). A low door cut into a limestone cliff, a great round stone rolled across it in a
// groove, a cord stretched across the stone between two pegs in the rock and a wax seal pressed over
// it at the stone's centre. Moonlight from high on the left rakes across the face, so every chisel
// mark and every carved letter casts a hairline shadow. The ground is pale earth with mist lying on
// it; olive branches hang black against a night sky with the moon behind them.
//
// Text: carved round the stone. The texture's top half is the upper arc (letters' tops outward),
// the bottom half the lower arc (letters upright along the bottom, tops toward the centre).

export const TOMB_UNIFORMS = { uMist: 1.0, uSink: 0.0 };

export const TOMB_GLSL = /* glsl */ `
uniform float uMist;   // mist on the ground
uniform float uSink;   // 0..1 the camera sinking into the earth at the end (darkens toward black)

const vec3 STONE_C = vec3(0.15, 1.12, -0.42);   // the round stone: centre, radius, half thickness
const float STONE_R = 1.3, STONE_T = 0.17;
const vec3 MOON = normalize(vec3(-0.85, 0.42, -0.24));
const vec3 MOONC = vec3(0.62, 0.68, 0.82);
const float ARC_IN = 0.84, ARC_OUT = 1.04;       // the band the letters are cut in
const float A0 = 2.97, A1 = 0.17;                // the upper arc runs from 170° (left) to 10°

float ground(vec2 xz) {
  float h = 0.25 * fbm(xz * 0.35, 4) + 0.04 * fbm(xz * 3.0, 3);
  // the groove the stone runs in
  float g = abs(xz.y - STONE_C.z);
  h -= 0.16 * smoothstep(0.32, 0.18, g) * smoothstep(3.5, 2.5, abs(xz.x));
  return h - 0.12;
}

float sdRock(vec3 p) {
  float face = -p.z + 0.16 * fbm(p.xy * vec2(0.55, 1.6), 5) + 0.05 * smoothstep(0.3, 0.7, fbm(vec2(p.x * 0.3, p.y * 4.5), 3)) + 0.012 * fbm(p.xy * 9.0, 2);   // bedded limestone
  // the cliff curves back above and to the sides
  face += 0.04 * p.y * p.y * 0.1 + 0.02 * p.x * p.x;
  // the top of the outcrop, with the night sky above it
  float top = 2.25 + 0.7 * fbm(vec2(p.x * 0.35, 1.7), 3) + 0.55 * exp(-p.x * p.x * 0.25) + 0.15 * max(p.x - 1.0, 0.0);
  face = max(face, (p.y - top) * 0.7 - 0.25 * max(p.z, 0.0) * 0.0);
  // the door, cut square into the rock
  float door = sdBox(p - vec3(0.0, 0.75, 0.6), vec3(0.58, 0.85, 0.8));
  // dressed margin round the door
  return max(face, -door);
}

float sdStone(vec3 p) {
  vec3 q = p - STONE_C;
  float r = length(q.xy);
  float d = max(r - STONE_R, abs(q.z) - STONE_T);
  // a slightly rounded rim and a chiselled, uneven face
  // tooling: shallow concentric rings and pits, the rim chipped
  float tool = 0.006 * fbm(q.xy * 6.0, 3);
  float chip = 0.03 * smoothstep(0.55, 0.85, fbm(vec2(atan(q.y, q.x) * 4.0, 2.0), 3)) * smoothstep(STONE_R - 0.12, STONE_R, r);
  return d - 0.012 + tool + chip;
}

float sdCord(vec3 p) {
  return min(sdCapsule(p, vec3(-1.55, 1.12, -0.2), vec3(0.15, 1.1, STONE_C.z - STONE_T - 0.02), 0.013),
             sdCapsule(p, vec3(0.15, 1.1, STONE_C.z - STONE_T - 0.02), vec3(1.85, 1.14, -0.2), 0.013));
}
float sdSeal(vec3 p) {
  vec3 q = p - vec3(0.15, 1.1, STONE_C.z - STONE_T - 0.005);
  float a = atan(q.y, q.x);
  return sdEllipsoid(q, vec3(0.075, 0.07, 0.016) * (1.0 + 0.05 * sin(a * 5.0 + 1.0) + 0.03 * sin(a * 11.0)));
}

// an olive branch hanging into the foreground on the left, leaves in clusters
float sdBranch(vec3 p) {
  vec3 a = vec3(-3.3, 2.75, -3.9), b = vec3(-1.3, 2.05, -3.6), c = vec3(-0.35, 1.95, -3.75);
  float d = min(sdCapsule(p, a, b, 0.028), sdCapsule(p, b, c, 0.016));
  if (d > 0.6) return d;
  float leaves = 1e3;
  for (int i = 0; i < 14; i++) {
    float f = float(i) / 13.0;
    vec3 s = f < 0.6 ? mix(a, b, f / 0.6) : mix(b, c, (f - 0.6) / 0.4);
    vec3 h = hash33(vec3(float(i), 3.1, 7.7)) - 0.5;
    vec3 q = p - s - vec3(h.x * 0.12, -0.07 - 0.06 * h.y, h.z * 0.1);
    q.xy = rot(0.6 + h.z * 1.6) * q.xy;
    leaves = min(leaves, sdEllipsoid(q, vec3(0.085, 0.016, 0.006)));
  }
  return min(d, leaves);
}

float mapT(vec3 p, out int id) {
  float d = p.y - ground(p.xz); id = 0;
  float br = sdBranch(p); if (br < d) { d = br; id = 5; }
  float r = sdRock(p); if (r < d) { d = r; id = 1; }
  float s = sdStone(p); if (s < d) { d = s; id = 2; }
  float c = sdCord(p); if (c < d) { d = c; id = 3; }
  float w = sdSeal(p); if (w < d) { d = w; id = 4; }
  return d;
}
float mapT(vec3 p) { int i; return mapT(p, i); }
vec3 normT(vec3 p) {
  vec2 e = vec2(0.0008, 0.0);
  return normalize(vec3(mapT(p + e.xyy) - mapT(p - e.xyy), mapT(p + e.yxy) - mapT(p - e.yxy), mapT(p + e.yyx) - mapT(p - e.yyx)));
}
float shadowT(vec3 p, vec3 l) {
  float s = 1.0, t = 0.02;
  for (int i = 0; i < 40; i++) {
    float h = mapT(p + l * t);
    s = min(s, 12.0 * h / t);
    t += clamp(h, 0.01, 0.4);
    if (s < 0.01 || t > 12.0) break;
  }
  return sat(s);
}

// text coordinates on the stone face: a 2.3 m x 1.6 m panel centred on the stone, read from the front
const vec2 TXT_H = vec2(1.15, 0.8);
vec2 stoneUV(vec3 p) {
  return vec2((STONE_C.x - p.x) / (2.0 * TXT_H.x) + 0.5, (p.y - STONE_C.y) / (2.0 * TXT_H.y) + 0.5);
}

vec3 skyT(vec3 rd) {
  vec3 c = mix(vec3(0.045, 0.058, 0.09), vec3(0.008, 0.012, 0.026), pow(sat(rd.y * 1.6), 0.7));
  // thin high cloud, lit from the moon's side
  vec2 cq = rd.xz / max(rd.y + 0.15, 0.05);
  c += MOONC * 0.05 * smoothstep(0.45, 0.85, fbm(cq * 0.7 + vec2(uTime * 0.004, 0.0), 5)) * (0.4 + 1.2 * pow(sat(dot(rd, MOON)), 3.0)) * sat(rd.y * 4.0);
  float m = dot(rd, MOON);
  c += MOONC * (0.12 * pow(sat(m), 6.0) + 0.25 * pow(sat(m), 300.0)) + vec3(1.0) * smoothstep(0.99985, 0.99992, m) * 3.0;
  // stars
  vec3 s = rd * 300.0; vec3 id = floor(s);
  float h = hash13(id);
  c += vec3(0.8, 0.85, 1.0) * step(0.9985, h) * smoothstep(0.5, 0.0, length(fract(s) - 0.5)) * sat(rd.y * 3.0) * 0.6;
  return c;
}

// olive branches against the sky: a silhouette in direction space, upper left
float branches(vec3 rd) {
  vec2 q = vec2(atan(rd.x, rd.z), rd.y) * vec2(3.0, 3.0);
  float leaf = smoothstep(0.55, 0.62, fbm(q * 4.0 + vec2(0.0, uTime * 0.01), 5));
  float reach = smoothstep(0.1, 0.55, rd.y) * smoothstep(0.35, -0.5, rd.x);
  return leaf * reach;
}

vec3 shadeTomb(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.05; int id = -1;
  for (int i = 0; i < 220; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapT(p, k);
    if (h < 0.0003 * t) { id = k; break; }
    t += h * 0.7;
    if (t > 80.0) break;
  }
  depth = t;
  vec3 col;
  if (id < 0) {
    col = skyT(rd) * (1.0 - branches(rd));
  } else {
    vec3 p = ro + rd * t, n = normT(p);
    vec3 alb; float spec = 0.04, gl = 30.0; float cutK = 0.0;
    if (id == 0) alb = vec3(0.24, 0.23, 0.21) * (0.7 + 0.5 * fbm(p.xz * 4.0, 3));
    else if (id == 1) alb = vec3(0.30, 0.29, 0.27) * (0.75 + 0.4 * fbm(p.xy * 2.5, 4));
    else if (id == 2) {
      {
        vec2 sq = p.xy - STONE_C.xy;
        float stain = fbm(vec2(sq.x * 3.0, sq.y * 0.7) + 4.0, 4);                 // rain streaks running down
        float lich = smoothstep(0.55, 0.75, fbm(sq * 4.5 + 9.0, 4));             // lichen
        float edge = smoothstep(STONE_R - 0.35, STONE_R, length(sq));             // weathered rim
        alb = vec3(0.66, 0.64, 0.58) * (0.9 + 0.18 * fbm(p.xy * 5.0, 3));
        alb *= 1.0 - 0.16 * smoothstep(0.45, 0.8, stain) - 0.2 * edge;
        alb = mix(alb, vec3(0.2, 0.21, 0.16), lich * 0.3);
      }
      // the carved letters: cut into the face, dark in the cut, the moon on one wall
      if (n.z < -0.6) {
        vec3 c = carve(stoneUV(p), vec2(0.0006, 0.0009));
        cutK = smoothstep(0.1, 0.7, c.x);          // the cut: deep, dark with age, no light reaches in
      }
    }
    else if (id == 3) alb = vec3(0.18, 0.13, 0.08);
    else if (id == 5) alb = vec3(0.02, 0.025, 0.02);
    else { alb = vec3(0.32, 0.035, 0.02); spec = 0.45; gl = 90.0; }
    float sh = shadowT(p + n * 0.003, MOON);
    float dif = sat(dot(n, MOON));
    float ao = sat(0.5 + 0.5 * mapT(p + n * 0.15) / 0.15);
    float moonK = id == 2 ? 2.7 : 1.5;
    col = alb * (MOONC * moonK * dif * sh + vec3(0.035, 0.04, 0.055) * (0.6 + 0.4 * n.y) * ao);
    col += MOONC * spec * pow(sat(dot(reflect(rd, n), MOON)), gl) * sh;
    col *= 1.0 - 0.97 * cutK;
    col = mix(col, vec3(0.010, 0.014, 0.026), 1.0 - exp(-t * 0.03));
  }
  // mist lying on the ground, lit by the moon
  if (uMist > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 8; i++) {
      float tt = (float(i) + jit) / 8.0 * min(depth, 14.0);
      vec3 q = ro + rd * tt;
      float dn = smoothstep(0.55, 0.0, q.y - ground(q.xz)) * fbm(q.xz * 0.6 + vec2(uTime * 0.05, 0.0), 3);
      acc += dn;
    }
    col += vec3(0.05, 0.06, 0.085) * acc / 8.0 * min(depth, 14.0) * 0.18 * uMist;
  }
  return col * (1.0 - uSink);
}
`;
