// Group D's abyss: lib/w-abyss.js as it was before the harrowing, now on Easter morning. Changed:
//   uDay: the vault is gone and the morning falls down the shaft from the open sky above, warm on
//         the ledges and the niches; the sky shows overhead (uDay 0 off .. 1)
//   uChainS: broken chains lying along the ledges near angle -pi/2 (the -z wall) slide off and fall
//         (0 lying .. 1 gone over the edge; each tier at its own pace); < 0 none; the chain on tier
//         uChainHold only slides to the lip
//   figures uF0..uF2 (xyz feet, w height; w = 0 off) with poses uP0..uP2 (yaw, lean, arm, kneel):
//         the captives stepping out of their niches, rim-lit
//   words: WORDS_GLSL's plane on any wall, ledge or lintel, inked by the scene's uWordMode
// The march is held to 220 steps.
//
// The abyss of Hades (units: metres, y up). A round shaft 80 m across, its floor
// at y = 0 and its walls climbing out of sight, cut into tiers. Every tier is a ledge and a row of
// burial niches, and in every niche lies one of the dead: a shrouded form that glows like a cold
// ember (uStir makes them flicker; uWarm turns them from blue toward gold as the light comes near,
// the niches nearest the light first). The shaft's axis is the path of the light coming down:
// a beam through a crack in the vault (uBeam) and, descending along it, the glory: the icon's
// mandorla of graded blue rings round a white-gold core, with gold rays (uGlory at height uGY).
//
// Text: the floor carries the lyric on a plane round FLOOR_C, lit where the beam's spot (uSpot,
// radius uSpotR) falls on it: the letters are cut channels and the light pours into them.

export const DABYSS_UNIFORMS = { uDay: 0.0, uChainS: -1.0, uChainHold: -1.0, uF0: [0, 0, 0, 0], uF1: [0, 0, 0, 0], uF2: [0, 0, 0, 0], uP0: [0, 0, 0, 0], uP1: [0, 0, 0, 0], uP2: [0, 0, 0, 0], uBeam: 0.0, uSpot: [0, 0, 1.25], uSpotR: 0.0, uGY: 300.0, uGlory: 0.0, uGR: 6.0, uStir: 0.2, uWarm: 0.0, uDust: 1.0, uCrack: 0.0 };

export const DABYSS_GLSL = /* glsl */ `
uniform float uDay, uChainS, uChainHold; uniform vec4 uF0, uF1, uF2, uP0, uP1, uP2;
uniform float uBeam;     // the shaft of light from the vault, 0..1
uniform vec3 uSpot;      // where it lands on the floor
uniform float uSpotR;    // the lit spot's radius (m)
uniform float uGY;       // the glory's height on the axis
uniform float uGlory;    // its brightness
uniform float uGR;       // its radius (m)
uniform float uStir;     // the dead stirring (ember flicker and brightness)
uniform float uWarm;     // how far the warmth of the light has reached down the tiers, 0..1
uniform float uDust;     // dust streaming down
uniform float uCrack;    // the crack running across the vault, 0..1

const float SR = 40.0;          // shaft radius
const float TH = 4.5;           // tier height
const float NN = 96.0;          // niches round each tier
const vec3 FLOOR_C = vec3(0.0, 0.0, 0.0);   // the lyric plane on the floor, 20 m x 5 m
const vec2 FLOOR_H = vec2(10.0, 2.5);
const vec3 COLDE = vec3(0.30, 0.48, 1.0);
const vec3 WARME = vec3(1.0, 0.72, 0.38);

// local coordinates in a niche cell: (u radial outward from the wall face, ly height in the tier, s along the wall)
vec3 cellOf(vec3 p, out vec2 cid) {
  float r = length(p.xz);
  float cw = 6.2831853 / NN;
  float k = floor(p.y / TH);
  float a = atan(p.z, p.x) + hash11(k * 1.37 + 0.5) * cw;   // each tier's niches staggered
  float ai = floor(a / cw + 0.5);
  cid = vec2(ai, k);
  return vec3(r - SR, p.y - k * TH, (a - ai * cw) * SR);
}

float sdBody(vec3 c) {
  return sdEllipsoid(c - vec3(0.8, 1.26, 0.0), vec3(0.3, 0.2, 0.85));
}

// broken chains along the ledges of the -z wall, sliding off toward the shaft and falling
float sdChainA(vec3 p) {
  if (uChainS < 0.0 || p.z > -20.0) return 1e3;
  float k = floor(p.y / TH + 0.35);                   // the ledge a point belongs to (chains fall below it)
  if (k < 1.0 || k > 9.0) return 1e3;
  float s = (atan(p.z, p.x) + 1.5707963) * SR;        // along the wall from the -z point
  if (abs(s) > 9.0) return abs(s) - 8.5;
  float u = length(p.xz) - SR;                        // radial: 0 at the wall face, -1.4 the ledge's lip
  float sl = clamp(uChainS * (0.75 + 0.5 * hash11(k * 3.7)) - 0.1 * hash11(k), 0.0, 2.0);
  if (k == uChainHold) sl = min(sl, 0.5);             // this tier's chain stops at the lip (its words are below it)
  float uc = -0.45 - 1.4 * min(sl, 1.0);
  float fall = max(sl - 0.62, 0.0);
  float yc = k * TH + 0.56 - 14.0 * fall * fall;
  vec3 q = vec3(u - uc - 0.8 * fall, p.y - yc, s - 2.0 * (hash11(k + 1.0) - 0.5));
  q.xy = rot(-1.2 * min(fall * 3.0, 1.0)) * q.xy;     // tipping over the edge
  if (abs(q.z) > 3.4) return length(vec2(abs(q.z) - 3.3, length(q.xy))) - 0.05;
  float li = floor(q.z / 0.42);
  vec3 lq = vec3(q.x, q.y - 0.05, q.z - (li + 0.5) * 0.42);
  if (mod(li, 2.0) > 0.5) lq.xy = lq.yx;
  vec2 t2 = vec2(length(vec2(lq.x, max(abs(lq.z) - 0.1, 0.0))) - 0.13, lq.y);
  return min(length(t2) - 0.05, 0.25);
}
float sdFigA(vec3 p, vec4 F, vec4 P) {
  if (F.w <= 0.0) return 1e3;
  vec3 q = p - F.xyz;
  if (dot(q, q) > F.w * F.w * 4.0) return length(q) - F.w;
  q.xz = rot(P.x) * q.xz;
  return sdFigure(q, F.w, P.y, P.z, P.w);
}

float mapA(vec3 p, out int id) {
  vec2 cid;
  vec3 c = cellOf(p, cid);
  // wall (solid where u > 0) with a niche cut into each cell
  vec2 hv = hash22(cid + 0.31);
  float niche = hv.x < 0.12 ? 1e3 : sdBox(c - vec3(0.55, 2.2 + 0.25 * hv.y, 0.0), vec3(0.95, 1.05 + 0.3 * hv.y, 0.62 + 0.32 * hv.x));
  float rough = 0.16 * fbm(vec2((atan(p.z, p.x) + 3.1416) * SR * 0.5, p.y * 0.4), 3);
  float wall = max(-c.x - rough, -niche);
  // a ledge running round the foot of every tier
  float ledge = cid.y >= 1.0 ? sdBox(vec3(c.x + 0.7, c.y - 0.25, 0.0), vec3(0.7, 0.25, 1e3)) : 1e3;
  // and the next tier's ledge overhead, so a ray coming up from below sees it in time
  ledge = min(ledge, sdBox(vec3(c.x + 0.7, c.y - TH - 0.25, 0.0), vec3(0.7, 0.25, 1e3)));
  // the floor: flagstones
  float fl = p.y + 0.012 * smoothstep(0.05, 0.0, voronoiEdge(p.xz * 0.38).x) + 0.01 * fbm(p.xz * 2.0, 3);
  float d = fl; id = 0;
  if (wall < d) { d = wall; id = 1; }
  if (ledge < d) { d = ledge; id = 1; }
  float b = hash12(cid + 0.5) < 0.22 ? 1e3 : sdBody(c - vec3(0.0, 0.0, 0.25 * (hash12(cid + 3.7) - 0.5)));
  if (b < d) { d = b; id = 2; }
  float ch = sdChainA(p); if (ch < d) { d = ch; id = 3; }
  float f = min(min(sdFigA(p, uF0, uP0), sdFigA(p, uF1, uP1)), sdFigA(p, uF2, uP2)); if (f < d) { d = f; id = 4; }
  return d;
}
float mapA(vec3 p) { int i; return mapA(p, i); }
vec3 normA(vec3 p, float t) {
  vec2 e = vec2(0.002 * max(1.0, t * 0.1), 0.0);
  return normalize(vec3(mapA(p + e.xyy) - mapA(p - e.xyy), mapA(p + e.yxy) - mapA(p - e.yxy), mapA(p + e.yyx) - mapA(p - e.yyx)));
}

vec3 gloryPos() { return vec3(0.0, uGY, 0.0); }

// the warmth a niche at height y has received
float warmAt(float y) {
  float reach = mix(uGY + 20.0, -10.0, uWarm);   // the warm front comes down from the light
  return smoothstep(reach - 5.0, reach + 25.0, y) * step(0.001, uWarm);
}

vec3 emberCol(vec2 cid, float y) {
  float h = hash12(cid);
  float fl = 0.75 + 0.25 * sin(uTime * (1.3 + 2.0 * h) + h * 40.0) * uStir + 0.15 * vnoise(vec2(uTime * 3.0, h * 50.0)) * uStir;
  float w = warmAt(y);
  return mix(COLDE * (0.35 + 0.65 * h), WARME * 1.8, w) * fl * (0.7 + 0.8 * uStir + 1.5 * w) * (1.0 - 0.8 * uDay);   // by day the embers pale
}

// the lyric on the floor: uv on the text plane (viewer looking +z: the text's right is -x, its top +z)
vec2 floorUV(vec3 p) {
  return vec2((FLOOR_C.x - p.x) / (2.0 * FLOOR_H.x) + 0.5, (p.z - FLOOR_C.z) / (2.0 * FLOOR_H.y) + 0.5);
}
float spotAt(vec3 p) {
  if (uSpotR <= 0.0) return 0.0;
  float d = length((p.xz - uSpot.xz) * vec2(1.0, 1.6));
  return smoothstep(uSpotR, uSpotR * 0.55, d) * uBeam;
}

vec3 mandorla(vec3 ro, vec3 rd, float depth) {
  vec3 G = gloryPos();
  float tg = dot(G - ro, rd);
  if (tg < 0.0 || uGlory <= 0.0) return vec3(0.0);
  vec3 q = ro + rd * tg - G;
  float d = length(q);
  float rho = d / uGR;
  // screen-ish angle round the glory for the rays
  vec3 up = vec3(0.0, 0.0, 1.0), side = normalize(cross(rd, up));
  float ang = atan(dot(q, cross(side, rd)), dot(q, side));
  vec3 c = vec3(0.0);
  float vis = tg < depth ? 1.0 : 0.0;
  // the rings: white-gold core, then graded ultramarine bands, each edged with a thin pale line
  if (rho < 1.0) {
    float band = floor(rho * 5.0), f = fract(rho * 5.0);
    vec3 blue = mix(vec3(0.42, 0.62, 1.0), vec3(0.03, 0.08, 0.38), band / 4.0);
    c = rho < 0.16 ? mix(vec3(7.0, 6.0, 4.4), vec3(3.5, 3.0, 2.2), rho / 0.16) : blue * (1.0 + 1.6 * (1.0 - rho));
    c += vec3(1.0, 0.8, 0.45) * smoothstep(0.06, 0.0, abs(f - 0.97)) * 1.6 * step(0.16, rho);
    // stars in the rings
    float st = step(0.985, hash12(floor(vec2(ang * 30.0, rho * 40.0))));
    c += vec3(1.5, 1.3, 0.9) * st * step(0.22, rho);
    c *= smoothstep(1.0, 0.97, rho);
  }
  // gold rays reaching out past the rings
  float rays = pow(abs(sin(ang * 8.0)), 24.0) + 0.5 * pow(abs(sin(ang * 8.0 + 0.4)), 60.0);
  c += vec3(1.6, 1.1, 0.5) * rays * exp(-max(rho - 0.6, 0.0) * 1.6) * step(0.5, rho);
  // and the glow round all of it
  c += vec3(1.0, 0.85, 0.65) * 0.5 * exp(-rho * 1.4) + vec3(0.6, 0.7, 1.0) * 0.15 * exp(-rho * 0.35);
  return c * uGlory * vis;
}

vec3 shadeAbyss(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.1; int id = -1;
  for (int i = 0; i < 220; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapA(p, k);
    if (h < 0.0003 * t + 0.002) { id = k; break; }
    t += h * 0.75;
    if (t > 420.0) break;
  }
  depth = id >= 0 ? t : 1e4;
  if (id < 0 && uDay > 0.0) return mix(vec3(1.0, 0.8, 0.6), vec3(0.45, 0.6, 0.85), sat(rd.y)) * 1.6 * uDay;
  vec3 G = gloryPos();
  vec3 fogc = vec3(0.006, 0.009, 0.016) + vec3(0.04, 0.035, 0.03) * uGlory * pow(sat(dot(rd, normalize(G - ro))), 6.0);
  vec3 col = fogc;
  if (id >= 0) {
    vec3 p = ro + rd * t, n = normA(p, t);
    vec2 cid; vec3 c = cellOf(p, cid);
    vec3 alb = vec3(0.07, 0.068, 0.075) * (0.5 + 0.9 * fbm(p.xz * 0.9 + p.y * 0.3, 4));
    alb *= 1.0 + 2.5 * uDay;   // pale limestone in the daylight
    if (id == 2) alb = vec3(0.3, 0.3, 0.32);
    if (id == 3) alb = vec3(0.04, 0.038, 0.036);
    if (id == 4) alb = vec3(0.012);
    // the glory as a light (very bright, far), and the cold of the place
    vec3 L = G - p; float d2 = dot(L, L); L *= inversesqrt(d2);
    vec3 lig = vec3(1.0, 0.9, 0.75) * uGlory * 9000.0 / (d2 + 400.0) * sat(dot(n, L));
    lig += vec3(0.05, 0.07, 0.12) * (0.4 + 0.6 * n.y);
    // the ember's own light inside its niche
    vec3 ec = emberCol(cid, p.y);
    if (cid.y >= 0.0 && c.x > -1.6) {
      float de = length(c - vec3(0.8, 1.3, 0.0));
      lig += ec * 0.6 / (1.0 + de * de * 3.0);
      // the niche's inside is lit by its ember: seen from below, a row of faintly glowing cells
      vec2 hv = hash22(cid + 0.31);
      float inN = hv.x < 0.12 ? 1e3 : sdBox(c - vec3(0.55, 2.2 + 0.25 * hv.y, 0.0), vec3(0.95, 1.05 + 0.3 * hv.y, 0.62 + 0.32 * hv.x));
      if (c.x > 0.02 && inN < 0.03 && hash12(cid + 0.5) >= 0.22) lig += ec * (3.5 + 3.0 * sat(-n.y)) / (1.0 + 0.4 * de * de);
    }
    // the beam as a line light: warm on the walls and ledges round its foot
    if (uBeam > 0.0) {
      vec3 bp = vec3(uSpot.x, clamp(p.y, 0.0, 400.0), uSpot.z + 1.4) - p;
      float bd2 = dot(bp, bp);
      lig += vec3(1.0, 0.82, 0.55) * uBeam * 8.0 / (1.0 + bd2 * 0.06) * sat(dot(n, bp * inversesqrt(bd2)) * 0.8 + 0.2) * exp(-p.y * 0.01);
    }
    // the beam's spot on the floor
    float sp = id == 0 ? spotAt(p) : 0.0;
    lig += vec3(1.0, 0.85, 0.6) * 0.35 * sp;
    // the morning down the shaft from the open sky
    if (uDay > 0.0) lig += vec3(1.0, 0.82, 0.6) * uDay * (2.2 * sat(n.y * 0.9 + 0.1) + 1.3 * sat(-dot(n.xz, normalize(p.xz)) * 0.8 + 0.2)) * (0.55 + 0.45 * smoothstep(0.0, 120.0, p.y));
    col = alb * lig;
    if (id == 2) col += ec * (0.6 + 0.4 * sat(n.y + 0.3));
    if (id == 3) col += vec3(1.0, 0.9, 0.7) * 0.25 * uDay * pow(sat(dot(reflect(rd, n), vec3(0.0, 1.0, 0.0))), 12.0);
    if (id == 4) col += vec3(1.0, 0.82, 0.6) * (0.5 + uDay) * pow(1.0 - sat(dot(-rd, n)), 3.0) * sat(n.y + 0.5);
    col = inkWords(col, wordsOn(p), n, rd);
    // the lyric cut in the floor: light pours into the channels where the spot is
    if (id == 0) {
      vec3 cv = carve(floorUV(p), vec2(0.0004, 0.0016));
      if (cv.x > 0.01) {
        col *= 1.0 - 0.8 * cv.x;
        col += vec3(1.0, 0.8, 0.5) * 6.5 * cv.x * sp;
      }
    }
    col = mix(col, fogc, 1.0 - exp(-t * 0.004));
  }
  // the beam from the vault down to the spot, a widening shaft of light with dust in it
  if (uBeam > 0.0) {
    vec3 top = vec3(uSpot.x, 400.0, uSpot.z + 1.4), bot = vec3(uSpot.x, 0.0, uSpot.z + 1.4);
    vec3 bl = rayLine(ro, rd, bot, top);
    if (bl.y < depth) {
      float w = mix(clamp(uSpotR * 0.3, 0.5, 1.6), 0.3, sqrt(bl.z));
      float core = exp(-bl.x * bl.x / (w * w));
      core *= mix(0.25, 1.0, smoothstep(0.0, 0.02, bl.z));   // thinner where it meets the floor, so the words read
      float dust = 0.6 + 0.8 * fbm(vec2(bl.z * 160.0 + uTime * 6.0, (bl.x / w) * 3.0 + jit * 0.3), 3) * uDust;
      col += vec3(1.0, 0.86, 0.62) * uBeam * (0.55 * core * dust + 0.012 * exp(-bl.x / (w * 4.0)));
    }
  }
  // the crack in the vault, a jagged hairline of white-gold far overhead (uCrack: how far it has run)
  if (uCrack > 0.0 && rd.y > 0.0) {
    float tc = (120.0 - ro.y) / rd.y;
    if (tc < depth) {
      vec3 q = ro + rd * tc;
      float jag = 2.5 * (fbm(vec2(q.z * 0.08, 1.0), 4) - 0.5) + 0.6 * (vnoise(vec2(q.z * 0.6, 3.0)) - 0.5);
      float run = smoothstep(uCrack * 60.0, uCrack * 60.0 - 6.0, abs(q.z - uSpot.z - 1.4));
      float line = exp(-abs(q.x - uSpot.x - jag) / 0.25);
      col += vec3(1.0, 0.85, 0.6) * line * run * (2.0 + 4.0 * uBeam) + vec3(1.0, 0.8, 0.5) * 0.04 * run * exp(-abs(q.x - uSpot.x - jag) / 6.0);
    }
  }
  col += mandorla(ro, rd, depth);
  // grit falling everywhere through the light
  if (uDust > 0.0 && uGlory > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 5; i++) {
      float tt = (float(i) + jit) * 9.0 + 3.0;
      if (tt > depth) break;
      vec3 q = ro + rd * tt;
      acc += smoothstep(0.78, 0.95, vnoise(vec3(q.x * 1.3, q.y * 0.25 + uTime * 3.5, q.z * 1.3)));
    }
    col += vec3(1.0, 0.85, 0.6) * acc * 0.03 * uGlory * uDust;
  }
  return col;
}
`;
