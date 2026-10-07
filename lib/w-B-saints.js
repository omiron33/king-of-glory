// The saints in the abyss (units: metres, y up). Group B's world for the righteous who preach in
// Hades before Christ comes: the same round shaft of tiers as the abyss (lib/w-abyss.js, copied
// here so the two can change apart), 80 m across, floor at y = 0, its walls climbing out of sight,
// every tier a ledge and a row of burial niches with one of the dead glowing like an ember in each.
// The lowest tier is a plain carved plinth (no niches): the "lip of the lowest tier" that words are
// cut into. Far up the axis the light is coming down (the glory at uGY).
//
// Movable pieces, all off by default:
//   figures  uF0..uF2 (xyz feet, w height), poses uP0..uP2 (yaw, lean, arm pitch: 0 hanging, 1.57
//            forward, 2.8 up, kneel); rim-lit silhouettes, no faces; uRim is the light that rims them
//   uKey     a warm pool of light from above (xyz, w strength)
//   the oil  uDrop (a falling drop, xyz, w on), uSprig (the remembered sprig of olive, xyz, w glow),
//            uOil (xyz where the oil lands, w how far it has spread along uOilDir); uOilText 1 shows
//            the lyric only where the oil has run
//   scroll   uScroll (xyz of its first edge's foot, w unrolled length) along uScrollDir, its letters
//            glowing like coals
//   Jordan   uRiver (z of the near bank's face, z of the far bank, water level, height of the bank
//            stone); the water reflects the dove (uDove xyz, w size; uDoveK brightness) and, as uSky
//            rises, clears to show a sky
//   praise   uRise: the dead rise out of their niches as lights swirling up the shaft
//   arise    uStand: the dead stand up in their niches
// Words: WORDS_GLSL from w-common, placed by the scene's textPlane and inked on whatever surface
// they lie on (the plinth, the floor, the bank stone, the scroll).

export const SAINTS_UNIFORMS = {
  uGY: 220.0, uGlory: 0.6, uGR: 10.0, uStir: 0.5, uWarm: 0.4, uDust: 1.0,
  uKey: [0, 3, 0, 0], uRim: [0, 30, 0, 0],
  uF0: [0, 0, 0, 0], uF1: [0, 0, 0, 0], uF2: [0, 0, 0, 0], uP0: [0, 0, 0, 0], uP1: [0, 0, 0, 0], uP2: [0, 0, 0, 0],
  uDrop: [0, 0, 0, 0], uSprig: [0, 0, 0, 0], uOil: [0, 0, 0, 0], uOilDir: [1, 0, 0], uOilText: 0.0,
  uScroll: [0, 0, 0, 0], uScrollDir: [-1, 0, 0],
  uRiver: [0, 0, 0, 0], uSky: 0.0, uDove: [0, 0, 0, 0], uDoveK: 0.0,
  uRise: 0.0, uStand: 0.0,
};

// the Jordan as John's three scenes share it: near bank face z, far bank z, water level, bank height
export const JORDAN = [6.0, 16.0, -0.1, 1.1];

export const SAINTS_GLSL = /* glsl */ `
uniform float uGY, uGlory, uGR, uStir, uWarm, uDust;
uniform vec4 uKey, uRim;
uniform vec4 uF0, uF1, uF2, uP0, uP1, uP2;
uniform vec4 uDrop, uSprig, uOil; uniform vec3 uOilDir; uniform float uOilText;
uniform vec4 uScroll; uniform vec3 uScrollDir;
uniform vec4 uRiver; uniform float uSky; uniform vec4 uDove; uniform float uDoveK;
uniform float uRise, uStand;

const float SR = 40.0;          // shaft radius
const float TH = 4.5;           // tier height
const float NN = 96.0;          // niches round each tier
const float PLINTH = 4.0;       // the lowest tier is a plain plinth up to here
const vec3 COLDE = vec3(0.30, 0.48, 1.0);
const vec3 WARME = vec3(1.0, 0.72, 0.38);
const vec3 GOLD = vec3(1.0, 0.74, 0.32);
const vec3 COAL = vec3(1.0, 0.42, 0.12);

vec3 cellOf(vec3 p, out vec2 cid) {
  float r = length(p.xz);
  float cw = 6.2831853 / NN;
  float k = floor(p.y / TH);
  float a = atan(p.z, p.x) + hash11(k * 1.37 + 0.5) * cw;
  float ai = floor(a / cw + 0.5);
  cid = vec2(ai, k);
  return vec3(r - SR, p.y - k * TH, (a - ai * cw) * SR);
}
bool hasNiche(vec2 cid) { return cid.y >= 1.0 && hash22(cid + 0.31).x >= 0.12; }
float nicheBox(vec3 c, vec2 cid) {
  vec2 hv = hash22(cid + 0.31);
  return sdBox(c - vec3(0.55, 2.2 + 0.25 * hv.y, 0.0), vec3(0.95, 1.05 + 0.3 * hv.y, 0.62 + 0.32 * hv.x));
}
// how far this niche's dead has stood up (0 lying .. 1 standing)
float standOf(vec2 cid) { return smoothstep(0.0, 1.0, uStand * 1.8 - 0.8 * hash12(cid + 9.1) - 0.02 * cid.y); }
float sdDead(vec3 c, vec2 cid) {
  if (!hasNiche(cid) || hash12(cid + 0.5) < 0.22) return 1e3;
  vec3 cc = c - vec3(0.0, 0.0, 0.25 * (hash12(cid + 3.7) - 0.5));
  float lying = sdEllipsoid(cc - vec3(0.8, 1.26, 0.0), vec3(0.3, 0.2, 0.85));
  float st = uStand > 0.0 ? standOf(cid) : 0.0;
  if (st <= 0.0) return lying;
  // standing: a shrouded figure on the niche floor, facing out into the shaft
  float fy = 1.15 - 0.05 * hash22(cid + 0.31).y;
  vec3 q = vec3(cc.z, cc.y - fy, -(cc.x - 0.6));
  float standing = sdFigure(q, 1.62 + 0.12 * hash12(cid + 5.0), 0.0, 0.0, 0.0);
  return mix(lying, standing, st);
}

// ------------------------------------------------------------------ figures
float sdSaint(vec3 p, float h, float lean, float arm, float kneel) {
  float s = h / 1.8;
  p /= s;
  p.y += 0.55 * kneel;
  p.yz = rot(-lean) * p.yz;
  float y = clamp(p.y, 0.0, 1.45);
  // a heavy robe: wider at the hem, hanging in folds
  float fa = atan(p.z, p.x);
  float rr = mix(0.36, 0.17, pow(y / 1.45, 0.8)) + (0.016 * sin(fa * 9.0 + p.y * 1.3) + 0.01 * sin(fa * 4.0 - 1.0)) * (1.0 - y / 1.45);
  float robe = max(length(p.xz * vec2(1.0, 1.22)) - rr, max(-p.y + 0.55 * kneel, p.y - 1.45));
  float sh = sdCapsule(p, vec3(-0.2, 1.4, -0.01), vec3(0.2, 1.4, -0.01), 0.085);
  // a hood over the head, falling onto the shoulders
  float head = sdEllipsoid(p - vec3(0.0, 1.62, -0.01), vec3(0.115, 0.14, 0.13));
  float hood = sdRoundCone(p, vec3(0.0, 1.45, -0.04), vec3(0.0, 1.66, -0.02), 0.15, 0.125);
  // the right arm swings from hanging (0) through forward (1.57) to raised (2.8), in a wide sleeve
  vec3 so = vec3(0.22, 1.37, 0.0);
  vec3 el = so + 0.33 * vec3(0.05, -cos(arm * 0.85), sin(arm * 0.85));
  vec3 hd = el + 0.32 * vec3(0.0, -cos(arm), sin(arm));
  float sleeve = sdRoundCone(p, so, el + 0.04 * (el - so), 0.075, 0.085);
  float armd = min(sleeve, sdCapsule(p, el, hd, 0.045));
  float hand = sdEllipsoid(p - hd - 0.05 * vec3(0.0, -cos(arm), sin(arm)), vec3(0.03, 0.075, 0.055));
  // the left arm hangs in its sleeve against the robe
  float larm = sdRoundCone(p, vec3(-0.22, 1.37, 0.0), vec3(-0.27, 0.85, 0.04), 0.075, 0.09);
  float d = smin(robe, sh, 0.1);
  d = smin(d, min(head, hood), 0.08);
  d = smin(d, larm, 0.04);
  d = min(d, smin(armd, hand, 0.02));
  return d * s;
}
float sdFigS(vec3 p, vec4 F, vec4 P) {
  if (F.w <= 0.0) return 1e3;
  vec3 q = p - F.xyz;
  if (dot(q, q) > F.w * F.w * 4.0) return length(q) - F.w;
  q.xz = rot(P.x) * q.xz;
  return sdSaint(q, F.w, P.y, P.z, P.w);
}

// ------------------------------------------------------------------ the scroll and the river bank
vec3 scrollLocal(vec3 p) {
  vec3 n = normalize(cross(uScrollDir, vec3(0.0, 1.0, 0.0)));
  vec3 q = p - uScroll.xyz;
  return vec3(dot(q, uScrollDir), q.y, dot(q, n));
}
float sdScroll(vec3 p, out bool roller) {
  roller = false;
  if (uScroll.w <= 0.0) return 1e3;
  vec3 q = scrollLocal(p);
  float L = uScroll.w, H = 1.5;
  if (q.x < -1.0 || q.x > L + 1.0 || abs(q.z) > 1.0) return 0.6;
  float wave = 0.012 * sin(q.x * 2.3 + 0.7) * sin(q.y * 1.1);
  float sheet = sdBox(vec3(q.x - L * 0.5, q.y - H * 0.5, q.z - wave), vec3(L * 0.5, H * 0.5, 0.004)) - 0.002;
  float r0 = sdCapsule(q, vec3(0.0, -0.12, 0.0), vec3(0.0, H + 0.12, 0.0), 0.055);
  float rl = 0.07 + 0.06 * (1.0 - min(L / 7.0, 1.0));
  float r1 = sdCapsule(q, vec3(L, -0.12, 0.0), vec3(L, H + 0.12, 0.0), rl);
  float rd = min(r0, r1);
  roller = rd < sheet;
  return min(sheet, rd);
}
bool riverOn() { return uRiver.y > uRiver.x; }
float sdBank(vec3 p) {
  if (!riverOn()) return 1e3;
  // the near bank: a long cut stone set along the water, its face toward us
  float zf = uRiver.x;
  float stone = sdBox(p - vec3(0.0, uRiver.w * 0.5 - 0.6, zf + 0.9), vec3(39.0, uRiver.w * 0.5 + 0.6, 0.9)) - 0.03;
  stone += 0.015 * fbm(p.xy * 3.0 + p.z, 3);
  return stone;
}

// the lyric on a surface, like wordsOn() in w-common, but sampling the text at a mip level chosen
// from the distance (the hit point jumps between neighbouring pixels, so automatic mip selection
// can fall to the coarsest level and smear the whole text plane with a faint glow)
float wordsAt(vec3 p, float t) {
  vec3 nn = normalize(cross(uTxX, uTxY));
  vec3 q = p - uTxC;
  if (abs(dot(q, nn)) > uWordDepth) return 0.0;
  vec2 uv = vec2(dot(q, uTxX) / uTxHS.x, dot(q, uTxY) / uTxHS.y) * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
  float texel = 2.0 * uTxHS.x / float(textureSize(uText, 0).x);
  float foot = t * 2.0 * tan(radians(uFov) * 0.5) / uRes.y;
  return textureLod(uText, uv, max(log2(foot / texel), 0.0)).a;
}

float mapS(vec3 p, out int id) {
  vec2 cid;
  vec3 c = cellOf(p, cid);
  bool plinth = cid.y < 0.5 || p.y < PLINTH;
  float niche = hasNiche(cid) && !(cid.y < 1.5 && p.y < PLINTH) ? nicheBox(c, cid) : 1e3;
  float rough = (plinth ? 0.03 : 0.16) * fbm(vec2((atan(p.z, p.x) + 3.1416) * SR * 0.5, p.y * 0.4), 3);
  float wall = max(-c.x - rough, -niche);
  float ledge = cid.y >= 1.0 ? sdBox(vec3(c.x + 0.7, c.y - 0.25, 0.0), vec3(0.7, 0.25, 1e3)) : 1e3;
  // the plinth's cornice
  ledge = min(ledge, sdBox(vec3(c.x + 0.35, p.y - PLINTH - 0.15, 0.0), vec3(0.35, 0.15, 1e3)));
  float fl = p.y + 0.012 * smoothstep(0.05, 0.0, voronoiEdge(p.xz * 0.38).x) + 0.01 * fbm(p.xz * 2.0, 3);
  // the Jordan's channel cut through the floor
  if (riverOn()) fl = max(fl, -(sdBox(p - vec3(0.0, -1.0, (uRiver.x + 1.8 + uRiver.y) * 0.5), vec3(60.0, 1.6, (uRiver.y - uRiver.x - 1.8) * 0.5))));
  float d = fl; id = 0;
  if (wall < d) { d = wall; id = 1; }
  if (ledge < d) { d = ledge; id = 1; }
  float b = sdDead(c, cid);
  if (b < d) { d = b; id = 2; }
  float f0 = sdFigS(p, uF0, uP0); if (f0 < d) { d = f0; id = 3; }
  float f1 = sdFigS(p, uF1, uP1); if (f1 < d) { d = f1; id = 3; }
  float f2 = sdFigS(p, uF2, uP2); if (f2 < d) { d = f2; id = 3; }
  bool rl; float sc = sdScroll(p, rl); if (sc < d) { d = sc; id = rl ? 6 : 5; }
  float bk = sdBank(p); if (bk < d) { d = bk; id = 7; }
  return d;
}
float mapS(vec3 p) { int i; return mapS(p, i); }
vec3 normS(vec3 p, float t) {
  vec2 e = vec2(0.0015 * max(1.0, t * 0.1), 0.0);
  return normalize(vec3(mapS(p + e.xyy) - mapS(p - e.xyy), mapS(p + e.yxy) - mapS(p - e.yxy), mapS(p + e.yyx) - mapS(p - e.yyx)));
}

vec3 gloryPosS() { return vec3(0.0, uGY, 0.0); }
float warmAtS(float y) {
  float reach = mix(uGY + 20.0, -10.0, uWarm);
  return smoothstep(reach - 3.0, reach + 9.0, y) * step(0.001, uWarm);
}
vec3 emberColS(vec2 cid, float y) {
  float h = hash12(cid);
  float fl = 0.75 + 0.25 * sin(uTime * (1.3 + 2.0 * h) + h * 40.0) * uStir + 0.15 * vnoise(vec2(uTime * 3.0, h * 50.0)) * uStir;
  float w = max(warmAtS(y), uStand > 0.0 ? standOf(cid) : 0.0);
  return mix(COLDE * (0.35 + 0.65 * h), WARME * (0.8 + 0.9 * h), w) * fl * (0.6 + 0.6 * uStir + 0.5 * w);
}

// the oil on the floor: how much of the stone it covers at p
float oilAt(vec3 p) {
  if (uOil.w <= 0.0) return 0.0;
  vec3 d = uOilDir, s = normalize(cross(d, vec3(0.0, 1.0, 0.0)));
  vec3 q = p - uOil.xyz;
  float a = dot(q, d), b = dot(q, s);
  float edge = 0.12 * (fbm(vec2(a * 2.2, b * 2.2) + 3.0, 3) - 0.5);
  float pool = length(vec2(a, b)) - min(uOil.w, 0.6) - edge;
  float w = 0.75 + 0.2 * sin(a * 1.7 + 1.0) + edge;
  float run = max(max(abs(b) - w * smoothstep(uOil.w + 0.2, uOil.w - 0.9, a), -a - 0.3), a - uOil.w - edge * 2.0);
  return smoothstep(0.05, -0.05, min(pool, run));
}

// a camera-facing frame round a point: returns 2D coords (metres) of the ray's pass by G
vec2 faceUV(vec3 ro, vec3 rd, vec3 G, out float tg) {
  tg = dot(G - ro, rd);
  vec3 q = ro + rd * tg - G;
  vec3 side = normalize(cross(rd, vec3(0.0, 1.0, 0.0)) + 1e-5);
  vec3 up = cross(side, rd);
  return vec2(dot(q, side), dot(q, up));
}
// the dove of light, wings raised as it comes down (2D, size 1 ~ wingspan)
float doveShape(vec2 e) {
  float body = length((e - vec2(0.0, -0.02)) * vec2(3.2, 1.6)) - 0.16;
  float head = length(e - vec2(0.0, 0.15)) - 0.05;
  float flap = 0.08 * sin(uTime * 5.0);
  vec2 w = vec2(abs(e.x), e.y);
  // each wing: a curved blade from the shoulder up and out
  float wx = clamp(w.x, 0.0, 0.5);
  float wy = 0.02 + wx * (0.55 + flap) - wx * wx * 0.4;
  float wing = max(abs(w.y - wy) - 0.07 * (1.0 - wx * 1.6), w.x - 0.5);
  float tail = max(abs(e.x) - 0.04 - 0.25 * max(-e.y - 0.1, 0.0), max(e.y + 0.1, -e.y - 0.38));
  return min(min(body, head), min(wing, tail));
}
vec3 doveLight(vec3 ro, vec3 rd, float depth) {
  if (uDoveK <= 0.0) return vec3(0.0);
  float tg; vec2 e = faceUV(ro, rd, uDove.xyz, tg) / uDove.w;
  if (tg < 0.0 || tg > depth) return vec3(0.0);
  float d = doveShape(e);
  vec3 c = vec3(1.0, 0.95, 0.85) * 6.0 * smoothstep(0.012, -0.004, d);
  c += vec3(1.0, 0.85, 0.6) * (0.5 * exp(-max(d, 0.0) * 18.0) + 0.25 * exp(-length(e) * 2.0));
  return c * uDoveK;
}
// the remembered sprig of olive: a stem with narrow leaves, drawn in gold light
vec3 sprigLight(vec3 ro, vec3 rd, float depth) {
  if (uSprig.w <= 0.0) return vec3(0.0);
  float tg; vec2 e = faceUV(ro, rd, uSprig.xyz, tg);
  if (tg < 0.0 || tg > depth + 0.3) return vec3(0.0);
  e = rot(0.35) * e;
  float stem = length(vec2(e.x - clamp(e.x, -0.28, 0.22), e.y - 0.05 * sin(e.x * 6.0))) - 0.007;
  float lv = 1e3;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float x = -0.22 + fi * 0.085;
    float sgn = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    vec2 q = e - vec2(x, 0.05 * sin(x * 6.0));
    q = rot(sgn * 0.75) * q;
    lv = min(lv, length((q - vec2(0.0, sgn * 0.06)) * vec2(1.0, 3.6) / vec2(1.0, 1.0)) * 1.0 - 0.065);
  }
  float d = min(stem, lv * 0.5);
  vec3 c = GOLD * 4.0 * smoothstep(0.006, -0.002, d) + GOLD * 0.35 * exp(-max(d, 0.0) * 25.0) + GOLD * 0.12 * exp(-length(e) * 3.0);
  return c * uSprig.w;
}
vec3 dropLight(vec3 ro, vec3 rd, float depth) {
  if (uDrop.w <= 0.0) return vec3(0.0);
  float tg = dot(uDrop.xyz - ro, rd);
  if (tg < 0.0 || tg > depth + 0.1) return vec3(0.0);
  float d = length(ro + rd * tg - uDrop.xyz);
  return GOLD * uDrop.w * (5.0 * smoothstep(0.035, 0.02, d) + 0.08 / (1.0 + d * d * 900.0) * 10.0);
}

vec3 mandorlaS(vec3 ro, vec3 rd, float depth) {
  vec3 G = gloryPosS();
  float tg = dot(G - ro, rd);
  if (tg < 0.0 || uGlory <= 0.0) return vec3(0.0);
  vec3 q = ro + rd * tg - G;
  float rho = length(q) / uGR;
  vec3 up = vec3(0.0, 0.0, 1.0), side = normalize(cross(rd, up));
  float ang = atan(dot(q, cross(side, rd)), dot(q, side));
  vec3 c = vec3(0.0);
  float vis = tg < depth ? 1.0 : 0.0;
  if (rho < 1.0) {
    float band = floor(rho * 5.0), f = fract(rho * 5.0);
    vec3 blue = mix(vec3(0.42, 0.62, 1.0), vec3(0.03, 0.08, 0.38), band / 4.0);
    c = rho < 0.16 ? mix(vec3(7.0, 6.0, 4.4), vec3(3.5, 3.0, 2.2), rho / 0.16) : blue * (1.0 + 1.6 * (1.0 - rho));
    c += vec3(1.0, 0.8, 0.45) * smoothstep(0.06, 0.0, abs(f - 0.97)) * 1.6 * step(0.16, rho);
    c *= smoothstep(1.0, 0.97, rho);
  }
  float rays = pow(abs(sin(ang * 8.0)), 24.0) + 0.5 * pow(abs(sin(ang * 8.0 + 0.4)), 60.0);
  c += vec3(1.6, 1.1, 0.5) * rays * exp(-max(rho - 0.6, 0.0) * 1.6) * step(0.5, rho);
  c += vec3(1.0, 0.85, 0.65) * 0.5 * exp(-rho * 1.4) + vec3(0.6, 0.7, 1.0) * 0.15 * exp(-rho * 0.35);
  return c * uGlory * vis;
}

// what the still water mirrors: the dark, the light far above, the dove, and as uSky rises a sky
vec3 waterEnv(vec3 ro, vec3 rd) {
  vec3 c = vec3(0.006, 0.009, 0.016);
  vec3 sky = mix(vec3(0.45, 0.5, 0.62), vec3(0.06, 0.16, 0.45), pow(sat(rd.y), 0.5));
  float cl = smoothstep(0.45, 0.8, fbm(rd.xz / max(rd.y, 0.08) * 1.6 + vec2(uTime * 0.02, 0.0), 5));
  sky = mix(sky, vec3(0.95, 0.8, 0.66), cl * 0.75);
  sky += vec3(1.0, 0.8, 0.55) * 0.6 * pow(sat(dot(rd, normalize(vec3(0.3, 0.5, 1.0)))), 6.0);
  // the tiers of glowing niches, mirrored
  float b = dot(ro.xz, rd.xz), a2 = dot(rd.xz, rd.xz), cc = dot(ro.xz, ro.xz) - 39.0 * 39.0;
  float tq = (-b + sqrt(max(b * b - a2 * cc, 0.0))) / max(a2, 1e-4);
  vec3 q = ro + rd * tq;
  if (q.y > PLINTH + 0.6) {
    vec2 cid; vec3 cq = cellOf(q, cid);
    vec2 hv = hash22(cid + 0.31);
    float inN = smoothstep(0.25, -0.1, abs(cq.y - 2.2 - 0.25 * hv.y) - 1.0 - 0.3 * hv.y) * smoothstep(0.2, -0.1, abs(cq.z) - 0.6 - 0.3 * hv.x);
    if (hasNiche(cid) && hash12(cid + 0.5) >= 0.22) c += emberColS(cid, q.y) * 0.22 * inN;
  }
  c = mix(c, sky * 0.75, uSky);
  c += mandorlaS(ro, rd, 1e5) * (1.0 - uSky * 0.6);
  c += doveLight(ro, rd, 1e5);
  return c;
}

// the swirl of lights rising up the shaft: thin cylindrical shells of moving points
vec3 risingLights(vec3 ro, vec3 rd, float depth) {
  if (uRise <= 0.0) return vec3(0.0);
  vec3 acc = vec3(0.0);
  for (int k = 0; k < 8; k++) {
    float r = 8.0 + 4.0 * float(k);
    // ray against the cylinder x^2 + z^2 = r^2
    float a = dot(rd.xz, rd.xz), b = dot(ro.xz, rd.xz), cc = dot(ro.xz, ro.xz) - r * r;
    float h = b * b - a * cc;
    if (h < 0.0) continue;
    h = sqrt(h);
    for (int s = 0; s < 2; s++) {
      float t = (-b + (s == 0 ? -h : h)) / a;
      if (t < 4.0 || t > depth) continue;
      vec3 q = ro + rd * t;
      float sp = 0.25 + 0.1 * float(k);
      float ang = atan(q.z, q.x) + uTime * sp * 0.35 - q.y * 0.012;
      float y = q.y - uTime * (2.5 + 0.6 * float(k));
      vec2 g = vec2(ang * r / 1.4, y / 1.4);
      vec2 id = floor(g), f = fract(g) - 0.5;
      vec2 o = (hash22(id + float(k) * 17.0) - 0.5) * 0.7;
      float on = step(1.0 - uRise * 0.85, hash12(id + 3.3 + float(k)));
      float sz = max(0.09, t * 0.0016);                     // points of light, about 9 cm, never below a pixel
      float d = length(f - o) * 1.4 / sz;
      // the lights have only just left the niches: none below the rising front
      float front = smoothstep(0.0, 6.0, q.y) * smoothstep(uRise * 260.0 + 5.0, uRise * 260.0 - 20.0, q.y);
      acc += mix(WARME, vec3(1.0, 0.95, 0.85), 0.5) * on * front * (exp(-d * d) * 5.0 + 0.15 * exp(-d * 0.35)) * (0.09 / sz);
    }
  }
  return acc * uRise;
}

vec3 shadeSaints(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.05; int id = -1;
  for (int i = 0; i < 300; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapS(p, k);
    if (h < 0.0003 * t + 0.0012) { id = k; break; }
    t += h * 0.85;
    if (t > 420.0) break;
  }
  depth = id >= 0 ? t : 1e4;
  vec3 G = gloryPosS();
  vec3 fogc = vec3(0.006, 0.009, 0.016) + vec3(0.04, 0.035, 0.03) * uGlory * pow(sat(dot(rd, normalize(G - ro))), 6.0);
  vec3 col = fogc;
  // the water of the Jordan lies over the channel
  float tw = riverOn() && rd.y < 0.0 ? (uRiver.z - ro.y) / rd.y : 1e5;
  bool water = false;
  if (tw > 0.0 && tw < depth) {
    vec3 pw = ro + rd * tw;
    if (pw.z > uRiver.x + 1.8 && pw.z < uRiver.y) { water = true; depth = tw; }
  }
  if (water) {
    vec3 p = ro + rd * tw;
    vec2 rp = p.xz * vec2(0.9, 1.6) + vec2(uTime * 0.25, 0.0);
    vec3 n = normalize(vec3(0.07 * (fbm(rp, 3) - 0.5) + 0.012 * sin(p.x * 3.0 + uTime * 1.5), 1.0, 0.1 * (fbm(rp * 1.7 + 7.0, 3) - 0.5)));
    vec3 r = reflect(rd, n);
    float fr = 0.25 + 0.75 * pow(1.0 - sat(-rd.y), 4.0);
    col = waterEnv(p, r) * mix(fr, 1.0, uSky * 0.7);
    // the moving water catches the dove's light
    if (uDoveK > 0.0) { vec3 L = uDove.xyz - p; col += vec3(1.0, 0.9, 0.75) * uDoveK * 0.6 / (1.0 + dot(L, L) * 0.08) * (0.5 + 0.5 * fbm(rp * 3.0, 2)); }
    col = mix(col, fogc, 1.0 - exp(-tw * 0.004));
  } else if (id >= 0) {
    vec3 p = ro + rd * t, n = normS(p, t);
    vec2 cid; vec3 c = cellOf(p, cid);
    vec3 alb = vec3(0.07, 0.068, 0.075) * (0.5 + 0.9 * fbm(p.xz * 0.9 + p.y * 0.3, 4));
    vec3 emit = vec3(0.0);
    if (id == 2) alb = mix(vec3(0.3, 0.3, 0.32), vec3(0.0012), uStand > 0.0 ? standOf(cid) : 0.0);   // the risen stand dark against their lit niches
    // the plinth is dressed stone, worn smooth, with a moulding along its foot
    if (id == 1 && p.y < PLINTH + 0.4) alb = vec3(0.075, 0.072, 0.078) * (0.75 + 0.5 * fbm(vec2((atan(p.z, p.x) + 3.1416) * SR * 0.7, p.y * 0.7), 4)) * (1.0 - 0.5 * smoothstep(0.04, 0.0, abs(p.y - 0.42)));
    if (id == 3) alb = vec3(0.012, 0.011, 0.012);
    if (id == 5) alb = vec3(0.42, 0.32, 0.2) * (0.75 + 0.35 * fbm(scrollLocal(p).xy * 4.0, 3));
    if (id == 6) alb = vec3(0.35, 0.26, 0.16);
    if (id == 7) alb = vec3(0.05, 0.048, 0.046) * (0.7 + 0.6 * fbm(p.xy * 1.5 + p.z, 4));
    vec3 L = G - p; float d2 = dot(L, L); L *= inversesqrt(d2);
    vec3 lig = vec3(1.0, 0.9, 0.75) * uGlory * 9000.0 / (d2 + 400.0) * sat(dot(n, L));
    lig += vec3(0.05, 0.07, 0.12) * (0.4 + 0.6 * n.y);
    vec3 ec = emberColS(cid, p.y);
    if (hasNiche(cid) && c.x > -1.6 && p.y > PLINTH) {
      float de = length(c - vec3(0.8, 1.3, 0.0));
      lig += ec * 0.6 / (1.0 + de * de * 3.0);
      if (c.x > 0.02 && nicheBox(c, cid) < 0.03 && hash12(cid + 0.5) >= 0.22) lig += ec * (1.6 + 1.6 * sat(-n.y)) / (1.0 + 0.8 * de * de);
    }
    // the warm pool from above
    if (uKey.w > 0.0) { vec3 K = uKey.xyz - p; float k2 = dot(K, K); float cone = exp(-dot(K.xz, K.xz) / 14.0); lig += vec3(1.0, 0.82, 0.6) * uKey.w * cone * sat(dot(n, K * inversesqrt(k2)) * 0.85 + 0.15) / (1.0 + k2 * 0.04); }
    // the oil's own glow on what is round it
    if (uOil.w > 0.0) { vec3 O = uOil.xyz + uOilDir * uOil.w * 0.5 + vec3(0.0, 0.25, 0.0) - p; float o2 = dot(O, O); lig += GOLD * 1.2 * min(uOil.w, 2.0) * sat(dot(n, O * inversesqrt(o2)) * 0.8 + 0.2) / (1.0 + o2 * 0.6); }
    if (uSprig.w > 0.0) { vec3 S = uSprig.xyz - p; float s2 = dot(S, S); lig += GOLD * 0.8 * uSprig.w * sat(dot(n, S * inversesqrt(s2)) * 0.8 + 0.2) / (1.0 + s2 * 1.5); }
    // the dove's light
    if (uDoveK > 0.0) { vec3 D = uDove.xyz - p; float dd = dot(D, D); lig += vec3(1.0, 0.92, 0.8) * uDoveK * 6.0 * sat(dot(n, D * inversesqrt(dd)) * 0.8 + 0.2) / (1.0 + dd * 0.05); }
    // the scroll's letters glow like coals and light the sheet round them
    if (uScroll.w > 0.0) {
      vec3 S = uScroll.xyz + uScrollDir * uScroll.w * 0.5 + vec3(0.0, 0.75, 0.0) - p; float s2 = dot(S, S);
      lig += COAL * 0.9 * sat(dot(n, S * inversesqrt(s2)) * 0.6 + 0.4) / (1.0 + s2 * 0.3);
      lig += vec3(0.5, 0.42, 0.32) * 0.08;   // the sheet holds a little light of its own
    }
    if (id == 5) {
      vec3 nn = normalize(cross(uTxX, uTxY));
      vec3 q = p - uTxC;
      vec2 uv = vec2(dot(q, uTxX) / uTxHS.x, dot(q, uTxY) / uTxHS.y) * 0.5 + 0.5;
      float halo = texture(uTextShade, uv).a;
      lig += COAL * 2.2 * halo;
    }
    col = alb * lig;
    if (id == 2) col += ec * (0.6 + 0.4 * sat(n.y + 0.3)) * (uStand > 0.0 ? 1.0 - standOf(cid) : 1.0);
    // the oil on the stone: a gold sheen that catches the light above
    float oil = id == 0 ? oilAt(p) : 0.0;
    if (oil > 0.0) {
      float sheen = 0.5 + 0.5 * fbm(p.xz * 3.0 + uTime * 0.2, 3);
      col = mix(col, GOLD * vec3(0.9, 0.7, 0.45) * (0.06 + 0.07 * sheen) + GOLD * 0.12 * pow(1.0 - sat(-rd.y), 3.0) + GOLD * 0.25 * smoothstep(0.8, 0.95, fbm(p.xz * 1.3 - uTime * 0.05, 3)), oil);
    }
    // rim light on the figures so they read as silhouettes
    if (id == 3 || (id == 2 && uStand > 0.0)) {
      vec3 src = uRim.w > 0.0 ? uRim.xyz : G;
      float rim = pow(1.0 - sat(dot(-rd, n)), 5.0) * sat(dot(n, normalize(src - p)) + 0.25);
      col += vec3(1.0, 0.84, 0.62) * rim * (uRim.w * 1.5 + 0.06);
    }
    // the lyric
    float wa = wordsAt(p, t);
    if (uOilText > 0.5) wa *= smoothstep(0.3, 0.9, oil);
    if (id == 5 && wa > 0.0) wa *= 0.8 + 0.2 * vnoise(vec2(uTime * 6.0, p.x * 3.0));
    col = inkWords(col, wa, n, rd);
    col = mix(col, fogc, 1.0 - exp(-t * 0.004));
  }
  // the warm light falling from above onto them, a soft shaft with grit in it
  if (uKey.w > 0.0) {
    vec3 bl = rayLine(ro, rd, vec3(uKey.x, 0.0, uKey.z), vec3(uKey.x, 80.0, uKey.z));
    // where the ray ends before its closest pass, take the distance at its end (no hard edge)
    if (bl.y > depth) { vec3 pe = ro + rd * depth; bl.x = length(pe.xz - uKey.xz); bl.z = pe.y / 80.0; }
    col += vec3(1.0, 0.8, 0.55) * uKey.w * 0.012 * exp(-bl.x * bl.x / 4.0) * (0.6 + 0.5 * fbm(vec2(bl.z * 60.0 - uTime * 0.4, bl.x), 3)) * sat(depth / 3.0);
  }
  col += mandorlaS(ro, rd, depth);
  col += risingLights(ro, rd, depth);
  col += doveLight(ro, rd, depth);
  col += sprigLight(ro, rd, depth);
  col += dropLight(ro, rd, depth);
  // grit drifting through the light
  if (uDust > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 4; i++) {
      float tt = (float(i) + jit) * 3.0 + 0.8;
      if (tt > depth) break;
      vec3 q = ro + rd * tt;
      acc += smoothstep(0.8, 0.95, vnoise(vec3(q.x * 1.6, q.y * 0.3 + uTime * 1.2, q.z * 1.6)));
    }
    col += vec3(1.0, 0.85, 0.6) * acc * 0.02 * uDust * (uGlory + uKey.w * 0.3);
  }
  return col;
}
`;
