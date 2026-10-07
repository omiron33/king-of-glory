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
//
// Group A's additions (all off by default, so s02/s03-style scenes are unchanged):
//   uBars: every niche shut by an iron door of bars, and an iron lock rail run along each tier
//          through all of them, a padlock hanging at every door; uRattle makes the locks shiver
//   uSeal: one sealed niche (x: niche index round the shaft, y: tier, z: 1 shown, w: seconds since
//          its stone seal was blown outward; 0 = intact); its body is gone (Lazarus); uLinen 0..1
//          streams grave linen up out of it toward the far light
//   uLamp: a point light (xyz, w intensity; colour uLampCol, cold by default) to rake the walls
//   uLip:  extra height (m) on the ledge of the lowest tier, whose face can carry a line
//   uAbWords: the scene's text plane is drawn on whatever surface it lies on (the seal, the lock
//          rail, the lip): alpha darkens the stone, the canvas colour glows (x uAbGlow)

export const ABYSS_UNIFORMS = { uBeam: 0.0, uSpot: [0, 0, 1.25], uSpotR: 0.0, uGY: 300.0, uGlory: 0.0, uGR: 6.0, uStir: 0.2, uWarm: 0.0, uDust: 1.0, uCrack: 0.0,
  uBars: 0.0, uRattle: 0.0, uSeal: [0, 0, 0, 0], uSealGlow: 0.0, uLinen: 0.0, uLamp: [0, 0, 0, 0], uLampCol: [0.45, 0.75, 0.95], uLip: 0.0, uAbWords: 0.0, uAbGlow: 4.0, uAbDepth: 0.1 };

export const ABYSS_GLSL = /* glsl */ `
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
uniform float uBars, uRattle, uSealGlow, uLinen, uLip, uAbWords, uAbGlow, uAbDepth;
uniform vec4 uSeal, uLamp; uniform vec3 uLampCol;

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

// ---- the sealed niche (Lazarus): a frame on the wall face at the niche's centre
vec3 gSealO, gSealT, gSealN;
void sealFrame() {
  float cw = 6.2831853 / NN;
  float a = (uSeal.x - hash11(uSeal.y * 1.37 + 0.5)) * cw;
  gSealN = -vec3(cos(a), 0.0, sin(a));
  gSealT = vec3(-sin(a), 0.0, cos(a));
  gSealO = vec3(SR * cos(a), uSeal.y * TH + 2.35, SR * sin(a));
}
// the slab in six pieces; once blown (uSeal.w > 0) each flies out into the shaft, tumbling
vec3 gFragRest;   // the hit point carried back to where it lay on the intact slab (seal frame)
float sdSeal(vec3 p) {
  if (uSeal.z <= 0.0) return 1e3;
  vec3 r = p - gSealO;
  vec3 l = vec3(dot(r, gSealT), r.y, dot(r, gSealN));
  float b = uSeal.w;
  if (b <= 0.0) {
    gFragRest = l;
    return sdBox(l - vec3(0.0, 0.0, 0.06), vec3(1.08, 1.3, 0.17)) - 0.02;
  }
  float best = 1e3;
  if (length(l) > 4.0 + b * 16.0) return length(l) - 3.0 - b * 16.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 g = vec2(mod(fi, 3.0) - 1.0, floor(fi / 3.0) - 0.5);
    vec3 c0 = vec3(g.x * 0.72, g.y * 1.3, 0.06);
    float h = hash11(fi * 7.3 + 1.0);
    vec3 v = vec3(g.x * 2.2 + (h - 0.5) * 1.5, 1.6 + 2.5 * h + g.y * 1.2, 7.0 + 4.0 * h);
    vec3 c = c0 + v * b + vec3(0.0, -4.9 * b * b, 0.0);
    vec3 q = l - c;
    float ang = b * (2.0 + 5.0 * h) * (h > 0.5 ? 1.0 : -1.0);
    q.xz = rot(ang) * q.xz; q.yz = rot(ang * 0.7) * q.yz;
    float d = sdBox(q, vec3(0.34, 0.63, 0.17)) - 0.02;
    if (d < best) { best = d; gFragRest = c0 + q; }
  }
  return best;
}
// grave linen streaming up out of the niche toward the light
float sdLinen(vec3 p) {
  if (uLinen <= 0.0 || uSeal.z <= 0.0) return 1e3;
  vec3 r = p - gSealO;
  vec3 l = vec3(dot(r, gSealT), r.y + 1.0, dot(r, gSealN));
  float len = uLinen * 16.0;
  if (l.y < -0.2 || l.y > len + 1.0 || l.z < -0.5 || l.z > 1.0 + 0.5 * len) return 0.5 + max(max(-0.2 - l.y, l.y - len - 1.0), 0.0);
  float best = 1e3;
  for (int j = 0; j < 3; j++) {
    float fj = float(j);
    float cx = (fj - 1.0) * 0.35 + 0.45 * sin(l.y * 0.55 - uTime * 2.6 + fj * 2.1) * smoothstep(0.0, 3.0, l.y);
    float cz = 0.1 + 0.14 * l.y + 0.25 * sin(l.y * 0.4 + fj);
    vec2 q = vec2(l.x - cx, l.z - cz);
    float tw = l.y * 0.35 + fj + uTime;
    q = rot(tw) * q;
    float wdt = 0.06 * (1.0 - 0.6 * smoothstep(0.0, len, l.y));
    float d = max(sdBox(vec3(q.x, 0.0, q.y), vec3(wdt, 1.0, 0.012)), max(-l.y, l.y - len * (0.75 + 0.25 * hash11(fj))));
    best = min(best, d);
  }
  return best * 0.6;
}

// ---- the iron doors of the cells: bars over the niche opening, a lock rail along the tier, a padlock
float sdIron(vec3 c, vec2 cid, vec2 hv) {
  if (uBars <= 0.0 || cid.y < 0.0) return 1e3;
  float ny = 2.2 + 0.25 * hv.y, nh = 1.05 + 0.3 * hv.y, nz = 0.62 + 0.32 * hv.x;
  float xb = c.x + 0.3;
  float bz = c.z - 0.21 * floor(c.z / 0.21 + 0.5);
  float rail = sdBox(vec3(c.x + 0.42, c.y - 2.05, 0.0), vec3(0.045, 0.15, 1e3));
  if (hv.x < 0.12) return rail;   // no niche here, only the rail running past
  float bars = max(length(vec2(xb, bz)) - 0.032, max(abs(c.y - ny) - nh - 0.1, abs(c.z) - nz - 0.05));
  float straps = sdBox(vec3(xb, abs(c.y - ny) - nh + 0.06, c.z), vec3(0.04, 0.06, nz + 0.12));
  // ark-shake-ok: each padlock shivers on its hasp
  float sh = uRattle * 0.025 * sin(uTime * 47.0 + hash12(cid) * 60.0);
  vec3 lq = vec3(c.x + 0.52, c.y - 1.68, c.z - sh);
  float lock = min(sdBox(lq, vec3(0.06, 0.13, 0.12)) - 0.02, max(abs(length(lq.yz - vec2(0.17, 0.0)) - 0.08) - 0.018, abs(lq.x) - 0.018));
  return min(min(bars, straps), min(rail, lock));
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
  // the lip of the lowest ledge: built up solid, uLip metres taller
  // (evaluated for every point, not per tier, so rays from below cannot step into it)
  if (uLip > 0.0) ledge = min(ledge, sdBox(vec3(c.x + 0.7, p.y - TH - 0.25 - uLip * 0.5, 0.0), vec3(0.7, 0.25 + uLip * 0.5, 1e3)));
  // the floor: flagstones
  float fl = p.y + 0.012 * smoothstep(0.05, 0.0, voronoiEdge(p.xz * 0.38).x) + 0.01 * fbm(p.xz * 2.0, 3);
  float d = fl; id = 0;
  if (wall < d) { d = wall; id = 1; }
  if (ledge < d) { d = ledge; id = 1; }
  bool sealed = uSeal.z > 0.0 && cid == uSeal.xy;
  float b = (hash12(cid + 0.5) < 0.22 || sealed) ? 1e3 : sdBody(c - vec3(0.0, 0.0, 0.25 * (hash12(cid + 3.7) - 0.5)));
  if (b < d) { d = b; id = 2; }
  float ir = sealed ? 1e3 : sdIron(c, cid, hv); if (ir < d) { d = ir; id = 3; }
  float se = sdSeal(p); if (se < d) { d = se; id = 4; }
  float ln = sdLinen(p); if (ln < d) { d = ln; id = 5; }
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
  return mix(COLDE * (0.35 + 0.65 * h), WARME * 1.8, w) * fl * (0.7 + 0.8 * uStir + 1.5 * w);
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

// the scene's text plane sampled at a world point (explicit gradients: no mip seams at edges)
vec4 abText(vec3 pw) {
  vec3 nn = normalize(cross(uTxX, uTxY));
  vec3 q = pw - uTxC;
  vec2 uv = vec2(dot(q, uTxX) / uTxHS.x, dot(q, uTxY) / uTxHS.y) * 0.5 + 0.5;
  vec4 tx = textureGrad(uText, clamp(uv, 0.0, 1.0), dFdx(uv), dFdy(uv));
  return tx * step(abs(dot(q, nn)), uAbDepth) * step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
}
vec3 abInk(vec3 col, vec4 tx) { return col * (1.0 - 0.9 * tx.a) + tx.rgb * uAbGlow; }

vec3 shadeAbyss(vec3 ro, vec3 rd, float jit, out float depth) {
  sealFrame();
  float t = 0.1; int id = -1;
  for (int i = 0; i < 400; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapA(p, k);
    if (h < 0.0003 * t + 0.002) { id = k; break; }
    t += h * 0.9;
    if (t > 420.0) break;
  }
  depth = id >= 0 ? t : 1e4;
  vec3 G = gloryPos();
  vec3 fogc = vec3(0.006, 0.009, 0.016) + vec3(0.04, 0.035, 0.03) * uGlory * pow(sat(dot(rd, normalize(G - ro))), 6.0);
  vec3 col = fogc;
  if (id >= 0) {
    vec3 p = ro + rd * t, n = normA(p, t);
    vec2 cid; vec3 c = cellOf(p, cid);
    vec3 alb = vec3(0.07, 0.068, 0.075) * (0.5 + 0.9 * fbm(p.xz * 0.9 + p.y * 0.3, 4));
    if (id == 2) alb = vec3(0.3, 0.3, 0.32);
    // where a lamp rakes the stone, show its grain (hewn rock, chisel marks, soot)
    if (uLamp.w > 0.0 && id <= 1) alb *= 0.55 + 0.9 * fbm(vec2(atan(p.z, p.x) * SR * 1.7, p.y * 1.7), 4) * (0.7 + 0.3 * vnoise(p * 9.0));
    if (id == 3) alb = vec3(0.035, 0.032, 0.03) * (0.7 + 0.6 * fbm(p.xz * 6.0 + p.y * 4.0, 3));   // black iron, rusted
    if (id == 4) { sdSeal(p); alb = vec3(0.1, 0.095, 0.09) * (0.5 + 0.8 * fbm(gFragRest.xy * 3.0, 4)) * (0.8 + 0.4 * vnoise(gFragRest * 12.0)); }
    if (id == 5) alb = vec3(0.5, 0.48, 0.44);
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
    // a cold lamp raking the walls
    if (uLamp.w > 0.0) {
      vec3 Lm = uLamp.xyz - p; float lm2 = dot(Lm, Lm);
      lig += uLampCol * uLamp.w * sat(dot(n, Lm * inversesqrt(lm2)) * 0.9 + 0.1) / (1.0 + lm2);
    }
    // the beam's spot on the floor
    float sp = id == 0 ? spotAt(p) : 0.0;
    lig += vec3(1.0, 0.85, 0.6) * 0.35 * sp;
    col = alb * lig;
    if (id == 2) col += ec * (0.6 + 0.4 * sat(n.y + 0.3));
    if (id == 3) {
      // iron catches the ember light behind it and the lamp in hard glints
      vec3 r = reflect(rd, n);
      if (uLamp.w > 0.0) col += vec3(0.5, 0.75, 0.95) * 0.04 * uLamp.w / (1.0 + dot(uLamp.xyz - p, uLamp.xyz - p)) * pow(sat(dot(r, normalize(uLamp.xyz - p))), 30.0) * 5.0;
      col += ec * 0.08 * pow(sat(dot(r, normalize(vec3(-p.x, 0.0, -p.z)))), 4.0);
    }
    if (id == 5) col += vec3(1.0, 0.9, 0.7) * 0.12 * (0.6 + 0.4 * sat(n.y));   // the linen catches the far light
    if (id == 4) {
      // light from inside the sealed niche leaking through the joints of the slab, then the burst
      vec2 jt = vec2(abs(abs(gFragRest.x) - 0.36), abs(gFragRest.y));
      float joint = min(jt.x, jt.y) + 0.04 * fbm(gFragRest.xy * 6.0, 2);
      col += vec3(1.0, 0.8, 0.5) * uSealGlow * 4.0 * smoothstep(0.05, 0.0, joint) * step(uSeal.w, 0.0);
    }
    if (uAbWords > 0.0) {
      if (id == 4) col = abInk(col, abText(gSealO + gSealT * gFragRest.x + vec3(0.0, gFragRest.y, 0.0) + gSealN * gFragRest.z));
      else if (id == 1 || id == 3) col = abInk(col, abText(p));
    }
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
  // the burst of light out of the opened niche
  if (uSeal.z > 0.0 && uSeal.w > 0.0) {
    vec3 sm = rayLine(ro, rd, gSealO - gSealN * 0.3, gSealO + gSealN * 2.0 + vec3(0.0, 12.0 * uLinen, 0.0));
    float k = uSealGlow * exp(-uSeal.w * 2.5);
    col += vec3(1.0, 0.85, 0.6) * (1.6 * k * exp(-sm.x * 2.0) + 0.05 * uSealGlow * exp(-sm.x * 0.6)) * step(sm.y, depth + 1.0);
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
