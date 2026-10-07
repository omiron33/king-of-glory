// Hades from the inside (units: metres, y up). One cavern holds the whole confrontation:
//   the gates of brass at z = 0, facing into Hades (-z), set in a cliff, a basalt lintel over them;
//   the floor of basalt columns running back 160 m to the throne of Hades, a seated colossus of
//   black stone (faceless, a cave for a mouth) at z = -150, facing the gates;
//   cavern walls at |x| = 75 and a vault at y = 95, lost in the dark.
// Every scene uses a few of the movable pieces below; uniforms switch them on.
//   doors: uCrack (glowing cracks), uHot (iron bands red-hot), uBow (doors bulge inward),
//          uFall (doors torn from their hinges falling inward to lie crossed on the floor),
//          uBars (reserve bars across the doors), uChain (chains in an X across them), uBurst (chains breaking)
//   light: uSeam (light in the seam), uFlood (the gateway pouring light into Hades), glory at uG
//          (uGR radius, uGK brightness; the mandorla with the figure of Christ in light)
//   Satan: a shape of shadow and cinders at uSat (xyz feet, w height), uSatYaw, uSatLean, a trail
//          of cinders on the floor from uSatFrom; uBind wraps him in chains of light
//   Hades: uGrip brings the colossus's stone hands together in front of it (the binding);
//          uRuin cracks the throne apart
//   figures: uF0..uF2 (xyz feet, w height; w = 0 off), poses uP0..uP2 (yaw, lean, arm, kneel),
//          uFRed marks figure 1 as Eve (red robe)
//   the cross: uCrossP (xyz foot, w height; w = 0 off), uCrossK brightness
//   procession: uProc (0 off .. 1 full), walking from uProcA to uProcB
// Words: WORDS_GLSL from w-common, placed by the scene's textPlane, inked by its style.
//
// Group A's copy of w-hades.js for the confrontation (0:41 to 1:21), with these additions:
//   Satan: taller and more menacing (a peaked hood, a ragged hem that smokes, smoke rising off him),
//          uSatArm (xyz: direction in his own frame, w: 0..1) an arm raised to point,
//          uSatSwell swells the shadow and flares its cinders (the laugh)
//   uPrints: his trail is a line of scorched, smouldering footprints instead of a smear
//   Hades: uLean leans the colossus's shoulders down toward the hall (listening);
//          uQuake runs cracks of cold light through its stone and makes it tremble
//   uDais: a basalt step before the throne (its face carries words)
//   uCurtain: a sheet of dust falling through the text plane, lit from below; the words hang in it

export const HALL_UNIFORMS = {
  uSeam: 0.2, uFlood: 0.0, uCold: 1.0, uDust: 1.0,
  uCrack: 0.0, uHot: 0.0, uBow: 0.0, uFall: 0.0, uBars: 0.0, uChain: 0.0, uBurst: 0.0,
  uG: [0, 13, 8], uGR: 0.0, uGK: 0.0,
  uSat: [0, 0, -60, 0], uSatYaw: 0.0, uSatLean: 0.0, uSatFrom: [0, 0, -60], uBind: 0.0,
  uGrip: 0.0, uRuin: 0.0,
  uF0: [0, 0, 0, 0], uF1: [0, 0, 0, 0], uF2: [0, 0, 0, 0], uP0: [0, 0, 0, 0], uP1: [0, 0, 0, 0], uP2: [0, 0, 0, 0], uFRed: 0.0,
  uCrossP: [0, 0, 0, 0], uCrossK: 0.0,
  uProc: 0.0, uProcA: [0, 0, -20], uProcB: [0, 0, 6], uFires: 1.0,
  uSatArm: [0, 0, 1, 0], uSatSwell: 0.0, uPrints: 0.0, uLean: 0.0, uQuake: 0.0, uDais: 0.0, uCurtain: 0.0,
};

export const HALL_GLSL = /* glsl */ `
uniform float uSeam, uFlood, uCold, uDust;
uniform float uCrack, uHot, uBow, uFall, uBars, uChain, uBurst;
uniform vec3 uG; uniform float uGR, uGK;
uniform vec4 uSat; uniform float uSatYaw, uSatLean; uniform vec3 uSatFrom; uniform float uBind;
uniform float uGrip, uRuin;
uniform vec4 uF0, uF1, uF2, uP0, uP1, uP2; uniform float uFRed;
uniform vec4 uCrossP; uniform float uCrossK;
uniform float uProc; uniform vec3 uProcA, uProcB;
uniform float uFires;   // the cold fires at the throne's feet
uniform vec4 uSatArm; uniform float uSatSwell, uPrints, uLean, uQuake, uDais, uCurtain;
const vec3 FIRE_L = vec3(-24.0, 0.0, -122.0), FIRE_R = vec3(24.0, 0.0, -122.0);

const float DW = 9.0, DH = 26.0;
const vec3 LIN_C = vec3(0.0, 28.6, -1.0), LIN_H = vec3(14.0, 2.6, 1.6);
const vec3 THRONE = vec3(0.0, 0.0, -150.0);
vec3 gDQ;          // the last door hit, in the door's own frame
float gDS;         // which door (-1 left, +1 right, as seen from inside)

// ------------------------------------------------------------------ the doors
// a door's own frame: x across (its hinge side at |x| = 9), y up its height, z its thickness
vec3 doorFrame(vec3 p, float s) {
  float th = uFall * 1.5208;                       // falls to lie flat (87 degrees)
  // fallen doors come to rest crossed: each swings about the vertical a little as it falls
  float yaw = s * 0.42 * smoothstep(0.2, 1.0, uFall);
  vec3 q = p;
  vec3 piv = vec3(s * 4.5, 0.0, 0.0);
  q -= piv; q.xz = rot(-yaw) * q.xz; q += piv;
  // fall about the bottom edge (y = 0, z = 0) toward -z
  q.yz = rot(-th) * q.yz;
  // bowing in under the pressure from outside
  q.z += uBow * 0.9 * sin(clamp(q.y / DH, 0.0, 1.0) * 3.1416) * (1.0 - abs(q.x - s * 4.5) / 4.5);
  return q;
}
float sdDoorOne(vec3 q, float s) {
  vec3 c = vec3(s * 4.52, DH * 0.5, 0.6);
  float d = sdBox(q - c, vec3(4.48, DH * 0.5, 0.6));
  float yb = q.y - clamp(floor(q.y / 6.4 + 0.5), 1.0, 4.0) * 6.4 + 1.2;
  float band = sdBox(vec3(q.x - s * 4.52, yb, q.z + 0.12), vec3(4.48, 0.38, 0.14)) - 0.02;
  vec2 cell = vec2(1.125, 1.067);
  vec2 g = q.xy - cell * (floor(q.xy / cell) + 0.5);
  float inD = step(abs(q.x - s * 4.52), 4.2) * step(0.4, q.y) * step(q.y, DH - 0.4);
  float stud = inD > 0.5 ? length(vec3(g, q.z + 0.02)) - 0.17 : 1e3;
  return min(d, min(band, stud));
}
float sdDoors(vec3 p) {
  float best = 1e3;
  for (int i = 0; i < 2; i++) {
    float s = i == 0 ? -1.0 : 1.0;
    vec3 q = doorFrame(p, s);
    float d = sdDoorOne(q, s);
    if (d < best) { best = d; gDQ = q; gDS = s; }
  }
  return best;
}

float sdFrameG(vec3 p) {
  float jamb = sdBox(vec3(abs(p.x) - 11.6, p.y - 16.0, p.z - 0.6), vec3(2.6, 16.0, 2.4));
  float lin = sdBox(p - LIN_C, LIN_H) - 0.05;
  // reserve bars across the doors, dragged into place (uBars: how far they reach across)
  float bars = 1e3;
  if (uBars > 0.0) {
    for (int i = 0; i < 3; i++) {
      float y = 5.0 + 7.5 * float(i);
      float hw = 11.5 * uBars;
      bars = min(bars, sdBox(p - vec3(-11.5 + hw, y, -1.6), vec3(hw, 0.6, 0.45)) - 0.04);
    }
  }
  return min(min(jamb, lin), bars);
}

// chains in an X across the doors; uBurst breaks them from the centre outward
float sdChains(vec3 p) {
  if (uChain <= 0.0) return 1e3;
  float best = 1e3;
  for (int k = 0; k < 2; k++) {
    vec3 a = k == 0 ? vec3(-10.5, 23.0, -2.1) : vec3(10.5, 23.0, -2.1);
    vec3 b = k == 0 ? vec3(10.5, 3.0, -2.1) : vec3(-10.5, 3.0, -2.1);
    vec3 ab = b - a; float L = length(ab); vec3 dir = ab / L;
    float s = clamp(dot(p - a, dir), 0.0, L);
    float li = floor(s / 0.7);
    float u = (li + 0.5) * 0.7;
    // broken links near the centre are gone
    float fromC = abs(u - L * 0.5) / (L * 0.5);
    if (fromC < uBurst) continue;
    vec3 c = a + dir * u;
    vec3 q = p - c;
    vec3 side = normalize(cross(dir, vec3(0.0, 0.0, 1.0)));
    vec3 lq = vec3(dot(q, dir), dot(q, side), q.z);
    if (mod(li, 2.0) > 0.5) lq.yz = lq.zy;
    vec2 t2 = vec2(length(vec2(max(abs(lq.x) - 0.18, 0.0), lq.y)) - 0.2, lq.z);
    best = min(best, length(t2) - 0.06);
  }
  return best;
}

float sdCliffG(vec3 p) {
  float rough = 1.4 * fbm(p.xy * 0.06, 4) + 0.35 * fbm(p.xy * 0.4, 3);
  float wall = (1.4 - p.z) + rough;
  float gate = sdBox(p - vec3(0.0, 15.5, 0.0), vec3(14.2, 15.5, 6.0));
  return max(wall, -gate);
}

// the cavern: side walls, a far wall behind the throne, the vault
float sdCavern(vec3 p) {
  float r = 3.0 * fbm(p.yz * 0.05 + p.x * 0.01, 4) + 0.8 * fbm(p.yz * 0.3, 2);
  float side = 75.0 - abs(p.x) + r;
  float back = (p.z + 185.0) + 2.0 * fbm(p.xy * 0.05, 3);
  float vault = 95.0 - p.y + 3.0 * fbm(p.xz * 0.04, 4);
  return min(min(side, back), vault);
}

float colTop(vec2 xz) {
  vec2 v = voronoiEdge(xz * 1.5);
  return -0.03 * hash12(floor(xz * 1.5 + 0.5)) - 0.05 * smoothstep(0.1, 0.0, v.x);
}
float sdFloorG(vec3 p) { return p.y - colTop(p.xz) * smoothstep(-2.0, -4.0, p.z); }

// ------------------------------------------------------------------ Hades, the colossus
vec3 colLocal(vec3 p) {
  vec3 q = p - THRONE;
  // ark-shake-ok: the colossus itself trembles (one object, small, not the frame)
  q.x += uQuake * 0.07 * (sin(uTime * 41.0) + 0.6 * sin(uTime * 67.0 + 1.3));
  // leaning down toward the hall: the upper body bends forward over the hips
  float a = uLean * smoothstep(22.0, 44.0, q.y);
  vec2 yz = q.yz - vec2(22.0, -6.0);
  q.yz = vec2(22.0, -6.0) + vec2(yz.x * cos(a) + yz.y * sin(a), -yz.x * sin(a) + yz.y * cos(a));
  return q;
}
float sdColossus(vec3 p) {
  vec3 q = colLocal(p);
  if (length(q) > 75.0) return length(q) - 70.0;
  // hewn, faceted black stone: plates split by cracks
  vec2 vf = voronoiEdge(q.xy * 0.09 + q.z * 0.05);
  float rk = 0.9 * fbm(q.xy * 0.2 + q.z * 0.1, 3) - 0.5 * smoothstep(0.08, 0.0, vf.x) + 0.35 * vf.y;
  float throne = min(sdBox(q - vec3(0.0, 9.0, -6.0), vec3(19.0, 9.0, 10.0)), sdBox(q - vec3(0.0, 30.0, -14.0), vec3(19.0, 30.0, 3.0)));
  // the ruin: a crack down the middle of the throne
  throne = max(throne, -(sdBox(q - vec3(0.0, 30.0, -10.0), vec3(1.5 * uRuin + 0.001, 40.0, 20.0))));
  float hips = sdBox(q - vec3(0.0, 21.0, -6.0), vec3(10.0, 4.0, 7.0)) - 1.0;
  float thighL = sdCapsule(q, vec3(-6.0, 21.0, -4.0), vec3(-7.0, 21.0, 10.0), 4.2);
  float thighR = sdCapsule(q, vec3(6.0, 21.0, -4.0), vec3(7.0, 21.0, 10.0), 4.2);
  float shinL = sdCapsule(q, vec3(-7.0, 21.0, 10.0), vec3(-7.5, 1.0, 12.0), 3.4);
  float shinR = sdCapsule(q, vec3(7.0, 21.0, 10.0), vec3(7.5, 1.0, 12.0), 3.4);
  float torso = sdRoundCone(q, vec3(0.0, 24.0, -6.0), vec3(0.0, 40.0, -5.0), 8.0, 10.5);
  float head = sdEllipsoid(q - vec3(0.0, 52.0, -3.5), vec3(5.5, 7.0, 6.0));
  // the mouth of Hades: a cave in the chest
  float mouth = sdEllipsoid(q - vec3(0.0, 31.0, 4.0), vec3(2.6, 6.5, 6.0));
  // arms: shoulders to hands; hands rest on the knees, or come together at uGrip
  vec3 hl = mix(vec3(-8.0, 22.5, 13.0), vec3(-2.6, 30.0, 14.0), uGrip);
  vec3 hr = mix(vec3(8.0, 22.5, 13.0), vec3(2.6, 30.0, 14.0), uGrip);
  vec3 el = mix(vec3(-14.0, 30.0, 4.0), vec3(-13.0, 30.0, 6.0), uGrip), er = el * vec3(-1.0, 1.0, 1.0);
  float armL = min(sdCapsule(q, vec3(-11.0, 40.0, -5.0), el, 3.4), sdCapsule(q, el, hl, 3.0));
  float armR = min(sdCapsule(q, vec3(11.0, 40.0, -5.0), er, 3.4), sdCapsule(q, er, hr, 3.0));
  float hands = min(sdEllipsoid(q - hl, vec3(3.0, 2.6, 3.6)), sdEllipsoid(q - hr, vec3(3.0, 2.6, 3.6)));
  float body = smin(smin(min(hips, min(thighL, thighR)), min(shinL, shinR), 1.5), torso, 3.0);
  body = smin(body, head, 2.0);
  body = min(min(body, min(armL, armR)), hands);
  body = max(body, -mouth);
  return min(throne, body) + rk;
}

// ------------------------------------------------------------------ Satan
vec3 satLocal(vec3 p) {
  vec3 q = p - uSat.xyz;
  q.xz = rot(uSatYaw) * q.xz;
  return q;
}
float sdSatan(vec3 p) {
  if (uSat.w <= 0.0) return 1e3;
  vec3 q = satLocal(p);
  float h = uSat.w, s = h / 1.8;
  vec3 bc = vec3(0.0, h * 0.55, 0.0);
  if (length(q - bc) > h * 1.0) return length(q - bc) - h * 0.85;
  // a tall shape of shadow, top-heavy: a cowled head, a mantle hanging from broad shoulders like
  // folded wings, a robe narrowing to a hem that frays into smoke on the floor
  vec3 w = q / s;
  w.x /= 1.0 + 0.3 * uSatSwell; w.z /= 1.0 + 0.2 * uSatSwell;
  w.yz = rot(-uSatLean) * w.yz;
  float robe = sdRoundCone(w, vec3(0.0, 0.05, 0.0), vec3(0.0, 1.25, 0.0), 0.2, 0.27);
  vec3 mw = w; mw.z = (mw.z + 0.05) * 1.7;
  float mantle = sdRoundCone(mw, vec3(0.0, 0.25, 0.0), vec3(0.0, 1.28, 0.0), 0.14, 0.44);
  mantle = max(mantle, w.y - 1.42);                           // cut flat over the shoulders
  float cowl = sdEllipsoid(w - vec3(0.0, 1.64, 0.0), vec3(0.19, 0.27, 0.22));
  // the cowl's brow juts forward over where a face would be
  cowl = smin(cowl, sdEllipsoid(w - vec3(0.0, 1.72, 0.1), vec3(0.15, 0.08, 0.14)), 0.05);
  float d = smin(smin(robe, mantle, 0.12), cowl, 0.08);
  // the pointing arm: from the right shoulder along uSatArm.xyz
  if (uSatArm.w > 0.0) {
    vec3 sh = vec3(0.3, 1.32, 0.05);
    vec3 hand = sh + normalize(mix(vec3(0.2, -1.0, 0.1), uSatArm.xyz, uSatArm.w)) * 0.82;
    d = smin(d, sdCapsule(w, sh, hand, 0.07 * (1.0 + 0.3 * uSatSwell)), 0.06);
    // long fingers of shadow
    vec3 dirA = normalize(hand - sh);
    d = min(d, sdCapsule(w, hand, hand + dirA * 0.16 + vec3(0.0, 0.02, 0.0), 0.025));
  }
  // ragged edges that smoke, streaming upward, worst at the hem
  float rag = fbm(vec2(atan(w.x, w.z) * 3.0, w.y * 4.0 - uTime * 1.2), 3) - 0.35;
  d += (0.05 + 0.12 * smoothstep(0.5, 0.0, w.y) + 0.06 * smoothstep(0.7, 1.0, abs(w.x) / 0.46)) * rag * smoothstep(1.5, 1.3, w.y);
  d += 0.025 * (fbm(w.xy * 9.0 + vec2(0.0, -uTime * 1.5), 2) - 0.5);
  // heavy folds hanging down the cloth, and a rough, sagging cowl
  d += 0.018 * sin(atan(w.x, w.z) * 11.0 + 2.0 * fbm(w.xy * 2.0, 2)) * smoothstep(1.5, 1.0, w.y);
  d += 0.03 * (fbm(w.xz * 7.0 + w.y * 3.0, 3) - 0.5) * smoothstep(1.4, 1.6, w.y);
  return d * s * 0.8;
}

// ------------------------------------------------------------------ figures and the cross
float sdFig(vec3 p, vec4 F, vec4 P) {
  if (F.w <= 0.0) return 1e3;
  vec3 q = p - F.xyz;
  if (dot(q, q) > F.w * F.w * 4.0) return length(q) - F.w;
  q.xz = rot(P.x) * q.xz;
  return sdFigure(q, F.w, P.y, P.z, P.w);
}
float sdCrossG(vec3 p) {
  if (uCrossP.w <= 0.0) return 1e3;
  vec3 q = p - uCrossP.xyz; float h = uCrossP.w;
  return min(sdBox(q - vec3(0.0, h * 0.5, 0.0), vec3(h * 0.045, h * 0.5, h * 0.045)), sdBox(q - vec3(0.0, h * 0.72, 0.0), vec3(h * 0.3, h * 0.045, h * 0.045)));
}
// the procession: rows of small rim-lit figures walking along uProcA -> uProcB
float sdProc(vec3 p, out float pid) {
  pid = 0.0;
  if (uProc <= 0.0) return 1e3;
  vec3 ab = uProcB - uProcA; float L = length(ab); vec3 dir = ab / L; vec3 side = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
  vec3 q = p - uProcA;
  float s = dot(q, dir) - uTime * 0.9, x = dot(q, side);
  if (abs(x) > 6.0 || dot(q, dir) < 0.0 || dot(q, dir) > L * uProc) return max(abs(x) - 5.0, 1.0);
  float row = floor(s / 1.6), col = clamp(floor(x / 1.3 + 0.5), -3.0, 3.0);
  vec3 c = vec3((col + 0.3 * (hash11(row * 7.0 + col) - 0.5)) * 1.3, 0.0, (row + 0.5) * 1.6 + 0.3 * hash11(row + col * 3.0));
  vec3 lq = vec3(x - c.x, q.y, s - c.z);
  pid = hash11(row * 13.0 + col);
  return sdFigure(lq, 1.7 + 0.15 * pid, 0.05, 0.0, 0.0);
}

float mapH(vec3 p, out int id) {
  float d = sdFloorG(p); id = 0;
  float dd = uFall < 0.999 || true ? sdDoors(p) : 1e3; if (dd < d) { d = dd; id = 1; }
  float df = sdFrameG(p); if (df < d) { d = df; id = 2; }
  float dc = min(sdCliffG(p), sdCavern(p)); if (dc < d) { d = dc; id = 3; }
  float dk = sdColossus(p); if (dk < d) { d = dk; id = 4; }
  float ds = sdSatan(p); if (ds < d) { d = ds; id = 5; }
  float dh = sdChains(p); if (dh < d) { d = dh; id = 6; }
  float d0 = sdFig(p, uF0, uP0); if (d0 < d) { d = d0; id = 7; }
  float d1 = sdFig(p, uF1, uP1); if (d1 < d) { d = d1; id = uFRed > 0.5 ? 8 : 7; }
  float d2 = sdFig(p, uF2, uP2); if (d2 < d) { d = d2; id = 7; }
  float dx = sdCrossG(p); if (dx < d) { d = dx; id = 9; }
  vec2 fq = vec2(abs(p.x) - 24.0, p.z + 122.0);
  float bowl = max(length(fq) - 3.2, abs(p.y - 2.0) - 2.0); if (bowl < d) { d = bowl; id = 2; }
  // the step before the throne: a basalt dais 42 m wide, its face toward the hall at z = -128
  if (uDais > 0.0) { float da = sdBox(p - vec3(0.0, 1.7, -131.0), vec3(21.0, 1.7, 3.0)) - 0.05; if (da < d) { d = da; id = 2; } }
  float pid; float dp = sdProc(p, pid); if (dp < d) { d = dp; id = 7; }
  return d;
}
float mapH(vec3 p) { int i; return mapH(p, i); }
vec3 normH(vec3 p, float t) {
  vec2 e = vec2(0.002 * max(1.0, t * 0.15), 0.0);
  return normalize(vec3(mapH(p + e.xyy) - mapH(p - e.xyy), mapH(p + e.yxy) - mapH(p - e.yxy), mapH(p + e.yyx) - mapH(p - e.yyx)));
}

// the light from the gateway: through the seam, and when the doors give, a flood
vec3 gateLight(vec3 p, vec3 n) {
  vec3 s = vec3(0.0, clamp(p.y, 0.0, DH), 0.1);
  vec3 l = s - p; float d2 = dot(l, l); vec3 L = l * inversesqrt(d2);
  float face = sat(-p.z * 2.0 + 0.3);
  vec3 c = vec3(1.0, 0.62, 0.32) * uSeam * 60.0 * sat(dot(n, L)) / (1.0 + d2) * face;
  vec3 g = vec3(0.0, 13.0, 4.0) - p; float g2 = dot(g, g);
  c += vec3(1.0, 0.86, 0.66) * uFlood * 2600.0 * sat(dot(n, g * inversesqrt(g2)) * 0.85 + 0.15) / (g2 + 60.0);
  return c;
}

// uWordMode 3, branded: the canvas alpha scorches the stone dark (letters and a halo round them),
// its colour (white letters only) burns with uWordCol (mode 4: with the colour drawn on the canvas,
// so one plane can carry Satan's cinders and Hades' cold light). Glowing words on a scorched ground.
vec3 inkBrand(vec3 col, vec3 p) {
  vec3 nn = normalize(cross(uTxX, uTxY));
  vec3 q = p - uTxC;
  // sampled with explicit gradients and no early return, so the mip level is right at every edge
  vec2 uv = vec2(dot(q, uTxX) / uTxHS.x, dot(q, uTxY) / uTxHS.y) * 0.5 + 0.5;
  vec4 tx = textureGrad(uText, clamp(uv, 0.0, 1.0), dFdx(uv), dFdy(uv));
  float inside = step(abs(dot(q, nn)), uWordDepth) * step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  tx *= inside;
  float flick = 0.85 + 0.15 * vnoise(vec3(p.xz * 3.0, uTime * 2.0));
  vec3 ink = uWordMode > 3.5 ? tx.rgb : uWordCol * tx.r;   // mode 4: the canvas colours the light
  return col * (1.0 - 0.92 * tx.a) + ink * uWordGlow * flick;
}

vec3 shadeHall(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.1; int id = -1;
  for (int i = 0; i < 260; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapH(p, k);
    if (h < 0.0004 * t + 0.0015) { id = k; break; }
    t += h * 0.8;
    if (t > 420.0) break;
  }
  depth = t;
  vec3 fogc = vec3(0.010, 0.014, 0.024) + vec3(0.05, 0.04, 0.03) * uFlood * pow(sat(dot(rd, normalize(vec3(0.0, 13.0, 4.0) - ro))), 4.0);
  vec3 col = fogc;
  vec3 key = normalize(vec3(-0.45, 0.75, -0.5));
  if (id >= 0) {
    vec3 p = ro + rd * t;
    vec3 n = normH(p, t);
    vec3 alb = vec3(0.05); float spec = 0.1, rough = 0.6; vec3 emit = vec3(0.0);
    if (id == 0) { alb = vec3(0.045, 0.047, 0.055) * (0.6 + 0.8 * fbm(p.xz * 2.3, 4)); spec = 0.5 * smoothstep(0.35, 0.7, fbm(p.xz * 0.35 + 3.0, 3)); rough = 0.12; }
    else if (id == 1) {
      vec3 q = gDQ;
      float wear = 0.65 * fbm(q.xy * vec2(0.9, 0.25), 4) + 0.35 * fbm(q.xy * 6.0, 3);
      alb = mix(vec3(0.20, 0.12, 0.05), vec3(0.55, 0.37, 0.15), smoothstep(0.3, 0.75, wear)); spec = 0.6; rough = 0.3;
      bool iron = q.z < -0.02 && abs(q.y - clamp(floor(q.y / 6.4 + 0.5), 1.0, 4.0) * 6.4 + 1.2) < 0.42;
      if (iron) { alb = vec3(0.03, 0.03, 0.032); spec = 0.25; rough = 0.45; emit += vec3(1.0, 0.25, 0.05) * uHot * 2.5 * (0.6 + 0.4 * fbm(q.xy * 2.0 + uTime, 2)); }
      // cracks: light from outside through the brass
      float cr = voronoiEdge(q.xy * 0.35 + 1.7).x;
      float reach = smoothstep(uCrack * 1.2, uCrack * 1.2 - 0.3, fbm(q.xy * 0.15, 3) * 1.1);
      emit += vec3(1.0, 0.85, 0.6) * 9.0 * smoothstep(0.035, 0.0, cr) * reach * uCrack;
      // the seam: the inner edge of each door glows
      emit += vec3(1.0, 0.7, 0.4) * uSeam * 40.0 * exp(-abs(abs(q.x) - 0.04) / 0.02) * step(q.y, DH) * (1.0 - uFall);
    }
    else if (id == 2) { alb = vec3(0.05, 0.05, 0.056) * (0.7 + 0.6 * fbm(p.xy * 2.0, 4)); }
    else if (id == 3) { alb = vec3(0.04, 0.042, 0.05) * (0.6 + 0.8 * fbm(p.xy * 0.8 + p.z * 0.1, 4)); rough = 0.7; }
    else if (id == 4) {
      alb = vec3(0.05, 0.05, 0.056) * (0.5 + 0.9 * fbm(p.xy * 0.3, 4)); spec = 0.2; rough = 0.35;
      // Hades shaking: cracks of cold light run up through the stone plates
      if (uQuake > 0.0) {
        vec3 q = colLocal(p);
        float ce = min(voronoiEdge(q.xy * 0.09 + q.z * 0.05).x * 1.4, voronoiEdge(q.yz * 0.23 + q.x * 0.11 + 3.1).x);
        ce += 0.03 * (fbm(q.xy * 1.3, 2) - 0.5);
        float reach = smoothstep(uQuake * 70.0, uQuake * 70.0 - 14.0, q.y + 12.0 * fbm(q.xz * 0.05, 2));
        float fl = 0.7 + 0.3 * sin(uTime * 23.0 + q.y * 0.3);
        emit += vec3(0.55, 0.8, 1.0) * 5.0 * smoothstep(0.022, 0.0, ce) * reach * fl * min(uQuake * 2.0, 1.0) * step(0.45, vnoise(q * 0.12 + 7.0));
      }
      // the ruin: the crack burning with the light that broke it
      emit += vec3(1.0, 0.8, 0.5) * 6.0 * uRuin * smoothstep(2.5, 0.0, abs(p.x - THRONE.x)) * step(p.z, THRONE.z - 3.0);
    }
    else if (id == 5) {
      vec3 q = satLocal(p);
      alb = vec3(0.007, 0.0065, 0.008); spec = 0.02; rough = 0.8;
      // a cold rim from behind him so the hood and shoulders cut the dark
      float rimS = pow(1.0 - sat(dot(-rd, n)), 2.5);
      emit += vec3(0.35, 0.5, 0.75) * 0.2 * rimS * (1.0 - uBind);
      // cinders crawling in the shadow
      float cs = uSat.w / 1.8;
      // cinders crawl through him in veins, thickest low on the robe
      vec3 cq = q / cs;
      float vn = vnoise(cq * 12.0 + vec3(0.0, uTime * 0.9, 0.0) + 0.6 * vnoise(cq * 24.0 - uTime * 0.3));
      float cpat = smoothstep(0.7 - 0.35 * uSatSwell, 0.9, vnoise(cq * 2.2 + vec3(0.0, uTime * 0.25, 0.0))) * (0.15 + 0.85 * smoothstep(1.3, 0.2, cq.y));
      float cn = smoothstep(0.028, 0.0, abs(vn - 0.5)) * cpat + 0.5 * smoothstep(0.9, 0.97, vnoise(cq * 12.0 + uTime * 1.3));
      emit += vec3(1.0, 0.35, 0.08) * (2.2 + 2.5 * uSatSwell) * cn * (1.0 - 0.8 * uBind);
      vec3 ew = q / cs; ew.x /= 1.0 + 0.3 * uSatSwell; ew.yz = rot(-uSatLean) * ew.yz;
      // the dark of the cowl glows faintly round the eyes
      emit += vec3(0.3, 0.45, 0.8) * 0.06 * smoothstep(0.14, 0.0, length(vec2(ew.x, ew.y - 1.6))) * step(0.0, ew.z) * (1.0 - uBind);
    }
    else if (id == 6) { alb = vec3(0.03); spec = 0.5; rough = 0.3; emit += vec3(1.0, 0.3, 0.05) * uHot * 1.5; }
    else if (id == 7) { alb = vec3(0.02, 0.02, 0.022); spec = 0.05; }
    else if (id == 8) { alb = vec3(0.25, 0.02, 0.015); spec = 0.1; }
    else if (id == 9) { alb = vec3(0.3, 0.25, 0.15); emit += vec3(1.0, 0.82, 0.5) * uCrossK; }
    float ao = sat(0.4 + 0.6 * mapH(p + n * 0.4) / 0.4);
    vec3 lig = uCold * (vec3(1.5, 1.8, 2.4) * pow(sat(dot(n, key)), 1.5) * 0.8 + vec3(0.06, 0.09, 0.16) * (0.5 + 0.5 * n.y)) * ao;
    lig += gateLight(p, n);
    // the cold fires of Hades: pale green-blue, from below
    for (int f = 0; f < 2; f++) {
      vec3 fp = (f == 0 ? FIRE_L : FIRE_R) + vec3(0.0, 7.0, 0.0);
      vec3 L = fp - p; float d2 = dot(L, L);
      float fl = 0.85 + 0.15 * sin(uTime * 7.0 + float(f) * 2.0) * sin(uTime * 3.1);
      lig += vec3(0.35, 0.85, 0.95) * uFires * 6000.0 * fl * sat(dot(n, L * inversesqrt(d2)) * 0.9 + 0.1) / (d2 + 20.0) * smoothstep(60.0, 8.0, p.y);
    }
    // the glory as a light
    if (uGK > 0.0) { vec3 L = uG - p; float d2 = dot(L, L); lig += vec3(1.0, 0.9, 0.75) * uGK * uGR * uGR * 18.0 * sat(dot(n, L * inversesqrt(d2)) * 0.8 + 0.2) / (d2 + 30.0); }
    // Satan's cinder light and the light of his binding
    if (uSat.w > 0.0) { vec3 L = uSat.xyz + vec3(0.0, uSat.w * 0.5, 0.0) - p; float d2 = dot(L, L); lig += (vec3(1.0, 0.35, 0.08) * (1.0 - uBind) * 2.0 + vec3(1.0, 0.85, 0.6) * uBind * 10.0) / (1.0 + d2 * 0.5); }
    // a trail of cinders on the floor where he has walked
    if (id == 0 && uSat.w > 0.0 && uPrints > 0.0) {
      // footprints: scorched where each step fell, the newest still smouldering
      vec3 ab = uSat.xyz - uSatFrom; float L = max(length(ab), 1e-3); vec3 dir = ab / L;
      vec3 sd = vec3(-dir.z, 0.0, dir.x);
      float stride = uSat.w * 0.36;
      float sAl = dot(p - uSatFrom, dir);
      float i = clamp(floor(sAl / stride + 0.5), 0.0, floor(L / stride));
      float side = mod(i, 2.0) < 0.5 ? -1.0 : 1.0;
      vec3 fc = uSatFrom + dir * i * stride + sd * side * uSat.w * 0.07;
      vec3 fq = p - fc;
      vec2 f2 = vec2(dot(fq, sd), dot(fq, dir)) / (uSat.w * 0.1);
      float foot = smoothstep(1.0, 0.75, length(f2 * vec2(2.2, 1.0)));
      float age = (L - i * stride) / stride;
      float heat = exp(-age * 0.35);
      float grain = 0.55 + 0.45 * vnoise(p.xz * 9.0 + uTime * 0.5);
      alb *= 1.0 - 0.8 * foot;
      emit += vec3(1.0, 0.3, 0.05) * 4.0 * foot * heat * grain * (1.0 - uBind) * uPrints * step(sAl, L + stride * 0.5);
    }
    if (id == 0 && uSat.w > 0.0 && uPrints <= 0.0) {
      vec3 ab = uSat.xyz - uSatFrom; float L = max(length(ab), 1e-3);
      float s = clamp(dot(p - uSatFrom, ab) / (L * L), 0.0, 1.0);
      float dl = length(p - (uSatFrom + ab * s));
      emit += vec3(1.0, 0.32, 0.06) * 2.5 * smoothstep(0.9, 0.0, dl) * smoothstep(0.55, 0.85, vnoise(p.xz * 3.0)) * (0.4 + 0.6 * s) * (1.0 - uBind);
    }
    // rim light on figures from the glory/flood, so they read as silhouettes
    if (id == 7 || id == 8 || id == 5) {
      vec3 src = uGK > 0.0 ? uG : vec3(0.0, 13.0, 4.0);
      float rim = pow(1.0 - sat(dot(-rd, n)), 3.0) * sat(dot(n, normalize(src - p)) + 0.4);
      emit += vec3(1.0, 0.85, 0.65) * rim * (uGK * 1.6 + uFlood * 1.6 + uSeam * 0.5 + 0.08);
    }
    if (id == 5) lig *= 0.3;   // the shadow drinks the light
    col = alb * lig + emit;
    vec3 r = reflect(rd, n);
    col += spec * alb.g * 8.0 * lig * pow(sat(dot(r, normalize(vec3(0.0, 13.0, 4.0) - p))), mix(8.0, 300.0, 1.0 - rough)) * (uSeam + uFlood);
    if (uWordMode > 2.5) col = inkBrand(col, p);
    else col = inkWords(col, wordsOn(p), n, rd);
    col = mix(col, fogc, 1.0 - exp(-t * 0.0035));
  }
  // light in the air: the seam sheet, the flood, the glory
  vec3 sl = rayLine(ro, rd, vec3(0.0, 0.0, -0.05), vec3(0.0, DH, -0.05));
  if (sl.y < depth + 0.5) col += vec3(1.0, 0.6, 0.3) * uSeam * (1.0 - uFall) * (0.5 * exp(-sl.x * 2.5) + 0.06 * exp(-sl.x * 0.25));
  if (uFlood > 0.0) {
    vec3 gl = rayLine(ro, rd, vec3(-8.0, 13.0, 2.0), vec3(8.0, 13.0, 2.0));
    col += vec3(1.0, 0.86, 0.66) * uFlood * 0.6 * exp(-gl.x * 0.12) * (0.7 + 0.3 * fbm(vec2(gl.z * 6.0, uTime), 2));
  }
  // chains of light round Satan as he is bound
  if (uBind > 0.0 && uSat.w > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float h = uSat.w * (0.15 + 0.17 * fi);
      vec3 c = uSat.xyz + vec3(0.0, h, 0.0);
      float tc = dot(c - ro, rd);
      if (tc < 0.0 || tc > depth + 1.0) continue;
      vec3 q = ro + rd * tc - c;
      float ring = abs(length(q.xz * vec2(1.0, 1.6)) - uSat.w * 0.28) + abs(q.y + 0.12 * uSat.w * sin(atan(q.z, q.x) + fi)) * 0.6;
      acc += exp(-ring * 18.0 / uSat.w) * smoothstep(fi * 0.15, fi * 0.15 + 0.3, uBind);
    }
    col += vec3(1.0, 0.85, 0.55) * acc * 2.5;
  }
  // his eyes: two cold points burning in the dark of the cowl, drawn in the air so they show from
  // any angle the cowl's lip allows
  if (uSat.w > 0.0 && uBind < 1.0) {
    float es = uSat.w / 1.8;
    for (int k = 0; k < 2; k++) {
      vec3 v = vec3(k == 0 ? -0.055 : 0.055, 1.6, 0.2);
      v.yz = rot(uSatLean) * v.yz;
      v.x *= 1.0 + 0.3 * uSatSwell; v.z *= 1.0 + 0.2 * uSatSwell;
      v *= es;
      vec3 E = uSat.xyz + vec3((rot(-uSatYaw) * v.xz).x, v.y, (rot(-uSatYaw) * v.xz).y);
      float te = dot(E - ro, rd);
      vec2 fw = rot(-uSatYaw) * vec2(0.0, 1.0);
      float facing = smoothstep(0.05, -0.35, dot(rd.xz, fw));   // only from in front of him
      if (te > 0.0 && te < depth + 0.3 * es && facing > 0.0) {
        vec3 dv = (ro + rd * te - E) / es; float de = length(vec2(dv.x * 0.55, dv.y) ) + 0.5 * abs(dv.z) * 0.0;
        col += vec3(0.6, 0.82, 1.0) * facing * (1.0 - uBind) * (1.0 + 0.4 * uSatSwell) * (2.6 * exp(-de / 0.008) + 0.08 * exp(-de / 0.03));
      }
    }
  }
  // smoke rising off Satan, and the faint red of his cinders hanging in the air round him
  if (uSat.w > 0.0) {
    vec3 ax = rayLine(ro, rd, uSat.xyz + vec3(0.0, uSat.w * 0.1, 0.0), uSat.xyz + vec3(0.0, uSat.w * 0.9, 0.0));
    col += vec3(1.0, 0.3, 0.07) * (0.035 + 0.05 * uSatSwell) * exp(-ax.x / (uSat.w * 0.28)) * (1.0 - uBind);
    vec3 sl2 = rayLine(ro, rd, uSat.xyz + vec3(0.0, uSat.w * 0.7, 0.0), uSat.xyz + vec3(0.0, uSat.w * 2.6, 0.0));
    if (sl2.y < depth) {
      float w = uSat.w * (0.18 + 0.4 * sl2.z) * (1.0 + 0.5 * uSatSwell);
      float n = fbm(vec2(sl2.x / w * 2.0, sl2.z * 5.0 - uTime * 0.9), 4);
      col = mix(col, vec3(0.004, 0.003, 0.003), 0.55 * smoothstep(w, 0.0, sl2.x * (0.6 + n)) * (1.0 - sl2.z));
      col += vec3(1.0, 0.3, 0.05) * 0.25 * smoothstep(0.75, 0.95, n) * smoothstep(w, 0.0, sl2.x) * (1.0 - sl2.z) * (1.0 + 2.0 * uSatSwell);
    }
  }
  // a sheet of dust falling through the text plane, lit from below; the words hang in it
  if (uCurtain > 0.0) {
    // everything computed for every pixel (no early outs), so the text's mip level is right
    vec3 nn = normalize(cross(uTxX, uTxY));
    float dn = dot(rd, nn);
    float tc = dot(uTxC - ro, nn) / (abs(dn) > 1e-4 ? dn : 1e-4);
    vec3 q = ro + rd * tc - uTxC;
    vec2 pl = vec2(dot(q, uTxX), dot(q, uTxY));
    vec2 uv = pl / uTxHS * 0.5 + 0.5;
    float a = textureGrad(uText, clamp(uv, 0.0, 1.0), dFdx(uv), dFdy(uv)).a * step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    float vis = step(0.0, tc) * step(tc, depth) * uCurtain;
    float edge = smoothstep(3.0, 2.0, abs(pl.x / uTxHS.x)) * smoothstep(-4.0, -1.5, pl.y / uTxHS.y) * smoothstep(5.0, 2.0, pl.y / uTxHS.y);
    float streak = fbm(vec2(pl.x * 3.1, pl.y * 0.16 + uTime * 1.6), 4);
    float sheet = (0.45 + 0.55 * smoothstep(0.3, 0.75, streak)) * edge * vis;
    float below = exp(-max(pl.y / uTxHS.y + 1.5, 0.0) * 0.6);
    // a curtain of falling ash: it veils what is behind it and glows red where his cinders light it
    col = mix(col, vec3(0.012, 0.01, 0.009), 0.6 * sheet);
    col += vec3(1.0, 0.6, 0.35) * 0.035 * sheet * (0.3 + below) * (0.5 + streak);
    col = col * (1.0 - 0.7 * a * vis) + uWordCol * uWordGlow * a * vis * (0.75 + 0.25 * streak);
  }
  col += gloryLight(ro, rd, uG, uGR, uGK, depth);
  // the fires themselves: tall cold flames over the bowls
  if (uFires > 0.0) {
    for (int f = 0; f < 2; f++) {
      vec3 fb = (f == 0 ? FIRE_L : FIRE_R) + vec3(0.0, 4.0, 0.0);
      vec3 fl = rayLine(ro, rd, fb, fb + vec3(0.0, 14.0, 0.0));
      if (fl.y < depth) {
        float w = mix(2.6, 0.3, fl.z);
        float n = fbm(vec2(fl.x * 0.8 + float(f) * 9.0, fl.z * 4.0 - uTime * 2.5), 4);
        col += vec3(0.4, 0.9, 1.0) * uFires * 3.0 * smoothstep(w, w * 0.2, fl.x * (0.7 + 0.8 * n)) * (1.0 - fl.z * 0.7);
      }
    }
  }
  // dust and grit in the air, lit by whatever light there is
  if (uDust > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 5; i++) {
      float tt = (float(i) + jit) * 4.0 + 1.0;
      if (tt > depth) break;
      vec3 q = ro + rd * tt;
      acc += smoothstep(0.8, 0.95, vnoise(vec3(q.x * 1.6, q.y * 0.3 + uTime * 1.8, q.z * 1.6)));
    }
    col += vec3(1.0, 0.8, 0.55) * acc * 0.04 * uDust * (uSeam + uFlood * 2.0 + uGK);
  }
  return col;
}
`;
