// Group D's Hades: lib/w-hades.js (the harrowing's hall) extended for the raising of Adam and Eve and
// the going out. Everything below is as in w-hades.js, plus:
//   uSarcA, uSarcE: Adam's and Eve's sarcophagi (xyz centre of the base on the floor; w = 0 off), lids
//          slid aside by uLid.x (Adam) and uLid.y (Eve), 0 shut .. 1 off and leaning on the side
//   uHandA -> uHandB, uHandK: Christ's hand of light reaching to a wrist (a burning stroke in the air);
//          uHand2 1 adds a second stroke uHandA -> uHandC (both wrists, as in the icon)
//   uTree: x the strength of the shadow the gateway's light throws along the floor, y the morph
//          from a tree (0) to the cross (1), z how brightly that light lies down the hall floor
//   uDay: x dawn through an opening torn in the vault (light pouring down to the floor), y its width
//   uIron: the last iron bar (xyz centre, w its roll in the door plane), uIronK 0 off .. 1 on
//   uProcV: the procession's walking speed (m/s), uProcRise: how far it climbs per metre walked;
//          uProcA.y is the height it walks at while on the fallen doors (z < 0)
//   uStair: a stair of light rising out through the gateway, 0 off .. 1 lit
//   uDais: a dais of black stone under the throne (its height in metres, 0 off), its face toward
//          the hall at z = -126 for words
//
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

export const DHADES_UNIFORMS = {
  uSeam: 0.2, uFlood: 0.0, uCold: 1.0, uDust: 1.0,
  uCrack: 0.0, uHot: 0.0, uBow: 0.0, uFall: 0.0, uBars: 0.0, uChain: 0.0, uBurst: 0.0,
  uG: [0, 13, 8], uGR: 0.0, uGK: 0.0,
  uSat: [0, 0, -60, 0], uSatYaw: 0.0, uSatLean: 0.0, uSatFrom: [0, 0, -60], uBind: 0.0,
  uGrip: 0.0, uRuin: 0.0,
  uF0: [0, 0, 0, 0], uF1: [0, 0, 0, 0], uF2: [0, 0, 0, 0], uP0: [0, 0, 0, 0], uP1: [0, 0, 0, 0], uP2: [0, 0, 0, 0], uFRed: 0.0,
  uCrossP: [0, 0, 0, 0], uCrossK: 0.0,
  uProc: 0.0, uProcA: [0, 0, -20], uProcB: [0, 0, 6], uFires: 1.0, uProcW: 3.0,
  uSarcA: [0, 0, 0, 0], uSarcE: [0, 0, 0, 0], uLid: [0, 0, 0, 0], uHandA: [0, 0, 0], uHandB: [0, 0, 0], uHandC: [0, 0, 0], uHandK: 0.0, uHand2: 0.0,
  uDais: 0.0, uTree: [0, 0, 0, 0], uDay: [0, 0, 0, 0], uIron: [0, 0, 0, 0], uIronK: 0.0, uProcV: 0.9, uProcRise: 0.0, uStair: 0.0,
};

export const DHADES_GLSL = /* glsl */ `
uniform float uSeam, uFlood, uCold, uDust;
uniform float uCrack, uHot, uBow, uFall, uBars, uChain, uBurst;
uniform vec3 uG; uniform float uGR, uGK;
uniform vec4 uSat; uniform float uSatYaw, uSatLean; uniform vec3 uSatFrom; uniform float uBind;
uniform float uGrip, uRuin;
uniform vec4 uF0, uF1, uF2, uP0, uP1, uP2; uniform float uFRed;
uniform vec4 uCrossP; uniform float uCrossK;
uniform float uProc; uniform vec3 uProcA, uProcB;
uniform float uFires;   // the cold fires at the throne's feet
uniform vec4 uSarcA, uSarcE, uLid; uniform vec3 uHandA, uHandB, uHandC; uniform float uHandK, uHand2;
uniform vec4 uTree, uDay, uIron; uniform float uIronK, uProcV, uProcRise, uStair, uProcW, uDais;
const vec3 FIRE_L = vec3(-24.0, 0.0, -122.0), FIRE_R = vec3(24.0, 0.0, -122.0);

const float DW = 9.0, DH = 26.0;
const vec2 DAY_C = vec2(0.0, -16.0);   // where the vault is torn open over the fallen doors
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
  float gate = sdBox(p - vec3(0.0, 15.5, 22.0), vec3(14.2, 15.5, 28.0));
  return max(wall, -gate);
}

// the cavern: side walls, a far wall behind the throne, the vault
float sdCavern(vec3 p) {
  float r = 3.0 * fbm(p.yz * 0.05 + p.x * 0.01, 4) + 0.8 * fbm(p.yz * 0.3, 2);
  float side = 75.0 - abs(p.x) + r;
  float back = (p.z + 185.0) + 2.0 * fbm(p.xy * 0.05, 3);
  float vault = 95.0 - p.y + 3.0 * fbm(p.xz * 0.04, 4);
  // dawn through a rent in the vault
  if (uDay.y > 0.0) vault = max(vault, uDay.y - length(p.xz - DAY_C) + 4.0 * fbm(p.xz * 0.1, 3));
  return min(min(side, back), vault);
}

float colTop(vec2 xz) {
  vec2 v = voronoiEdge(xz * 1.5);
  return -0.03 * hash12(floor(xz * 1.5 + 0.5)) - 0.05 * smoothstep(0.1, 0.0, v.x);
}
float sdFloorG(vec3 p) { return p.y - colTop(p.xz) * smoothstep(-2.0, -4.0, p.z); }

// ------------------------------------------------------------------ Hades, the colossus
float sdColossus(vec3 p) {
  vec3 q = p - THRONE;
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
  float d = min(throne, body) + rk;
  // the dais the throne stands on
  if (uDais > 0.0) d = min(d, sdBox(q - vec3(0.0, uDais * 0.5, 10.0), vec3(27.0, uDais * 0.5, 14.0)) + 0.15 * fbm(q.xy * 0.4, 3) - 0.1);
  return d;
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
  if (length(q - vec3(0.0, uSat.w * 0.5, 0.0)) > uSat.w * 1.2) return length(q - vec3(0.0, uSat.w * 0.5, 0.0)) - uSat.w;
  // a tall shape of shadow: a hooded figure with ragged edges that smoke
  float d = sdFigure(q, uSat.w, uSatLean, 0.25, 0.0);
  d += 0.06 * uSat.w / 5.0 * (fbm(q * 2.5 + vec3(0.0, -uTime * 1.5, 0.0), 3) - 0.3);
  return d;
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
  vec3 q = p - vec3(uProcA.x, 0.0, uProcA.z);
  float s = dot(q, dir) - uTime * uProcV, x = dot(q, side);
  q.y -= uProcA.y * smoothstep(0.8, -0.8, p.z);         // uProcA.y: walking on the fallen doors
  q.y -= clamp((p.z - 3.0) * uProcRise, 0.0, 20.0);   // up the stair of light
  float hw = (uProcW + 0.5) * 1.3;
  if (abs(x) > hw + 0.8 || dot(q, dir) < 0.0 || dot(q, dir) > L * uProc) return max(abs(x) - hw, 1.0);
  float row = floor(s / 1.6), col = clamp(floor(x / 1.3 + 0.5), -uProcW, uProcW);
  vec3 c = vec3((col + 0.45 * (hash11(row * 7.0 + col) - 0.5)) * 1.3, 0.0, (row + 0.5) * 1.6 + 0.6 * (hash11(row + col * 3.0) - 0.5));
  // a ragged edge: some places empty
  if (hash11(row * 3.1 + col * 17.0) < 0.12 + 0.5 * smoothstep(uProcW - 2.0, uProcW, abs(col)) * hash11(row + col)) return 0.45;
  vec3 lq = vec3(x - c.x, q.y, s - c.z);
  pid = hash11(row * 13.0 + col);
  // never step past the next cell's figure
  return min(sdFigure(lq, 1.7 + 0.15 * pid, 0.05, 0.0, 0.0), 0.45);
}

// ------------------------------------------------------------------ group D's pieces
// a sarcophagus: S.xyz the centre of its foot on the floor, S.w = +-1 which way its lid slides
float sdSarc(vec3 p, vec4 S, float lid) {
  if (S.w == 0.0) return 1e3;
  vec3 q = p - S.xyz;
  if (dot(q, q) > 49.0) return length(q) - 5.0;
  float box = sdBox(q - vec3(0.0, 0.72, 0.0), vec3(1.7, 0.58, 0.74)) - 0.03;
  box = max(box, -sdBox(q - vec3(0.0, 1.1, 0.0), vec3(1.5, 0.6, 0.56)));
  float plinth = sdBox(q - vec3(0.0, 0.08, 0.0), vec3(1.9, 0.08, 0.92));
  // the lid slides off sideways and tips down against the side
  float sg = sign(S.w);
  vec3 lq = q - vec3(sg * (lid * 2.3), 1.41 - 0.62 * smoothstep(0.55, 1.0, lid), 0.0);
  lq.xy = rot(-sg * 0.45 * smoothstep(0.55, 1.0, lid)) * lq.xy;
  float ld = sdBox(lq, vec3(1.8, 0.1, 0.82)) - 0.02;
  return min(min(box, plinth), ld);
}
// the last iron bar hanging in the broken frame
float sdIron(vec3 p) {
  if (uIronK <= 0.0) return 1e3;
  vec3 q = p - uIron.xyz;
  q.xy = rot(uIron.w) * q.xy;
  float b = sdBox(q, vec3(7.5, 0.55, 0.42)) - 0.04;
  // rivet heads along it
  vec3 r = q; r.x = r.x - clamp(floor(r.x / 1.5 + 0.5), -4.0, 4.0) * 1.5;
  return min(b, length(r - vec3(0.0, 0.0, -0.45)) - 0.16);
}
// the stair of light out through the gateway: z 3 -> 45, rising 20 m
float sdStair(vec3 p) {
  if (uStair <= 0.0) return 1e3;
  float z = p.z - 3.0;
  if (z < -1.0 || z > 43.0 || abs(p.x) > 6.0) return max(max(-1.0 - z, z - 43.0), max(abs(p.x) - 5.0, 0.5));
  float k = clamp(floor(z / 0.8), 0.0, 52.0);
  float h0 = (k + 1.0) * 0.38, h1 = (k + 2.0) * 0.38;
  float a = sdBox(vec3(p.x, p.y - h0 * 0.5, z - (k + 0.5) * 0.8), vec3(4.2, h0 * 0.5, 0.4));
  float b = k < 52.0 ? sdBox(vec3(p.x, p.y - h1 * 0.5, z - (k + 1.5) * 0.8), vec3(4.2, h1 * 0.5, 0.4)) : 1e3;
  return min(a, b);
}
float sdSeg2(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
// the shadow the gateway's light throws into the hall: a tree that becomes the cross
float treeShadow(vec3 p) {
  if (uTree.x <= 0.0 || p.y > 3.0) return 0.0;
  // across, and along from the foot of the fallen doors into the hall (the shape is drawn in a
  // frame 1.6x larger than the floor)
  vec2 q = vec2(p.x, -p.z - 26.0) * 1.6;
  if (q.y < -1.0 || q.y > 46.0) return 0.0;
  float trunk = abs(q.x + 0.4 * sin(q.y * 0.15)) - mix(1.4, 0.6, sat(q.y / 18.0));
  trunk = max(max(trunk, q.y - 20.0), -q.y);
  float br = 1e3;
  br = min(br, sdSeg2(q, vec2(0.0, 11.0), vec2(-6.5, 22.0)) - 0.5);
  br = min(br, sdSeg2(q, vec2(0.2, 14.0), vec2(7.0, 24.0)) - 0.45);
  br = min(br, sdSeg2(q, vec2(-3.0, 16.0), vec2(-9.5, 25.0)) - 0.35);
  br = min(br, sdSeg2(q, vec2(3.4, 18.5), vec2(4.0, 30.0)) - 0.35);
  float crown = length((q - vec2(0.0, 29.0)) * vec2(0.8, 1.1)) - 10.5 + 4.0 * fbm(q * 0.35, 4);
  crown = max(crown, -(length((q - vec2(0.0, 29.0)) * vec2(0.8, 1.1)) - 4.0 + 6.0 * fbm(q * 0.5 + 3.0, 3)));   // light through the leaves
  float tree = min(min(trunk, br), crown);
  // the cross: its foot at the doors, its beam long across the hall
  float cross = min(max(abs(q.x) - 1.5, abs(q.y - 21.0) - 21.0), max(abs(q.y - 27.0) - 2.6, abs(q.x) - 19.0));
  float d = mix(tree, cross, smoothstep(0.0, 1.0, uTree.y));
  return smoothstep(0.4, -0.4, d) * uTree.x;
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
  float pid; float dp = sdProc(p, pid); if (dp < d) { d = dp; id = 7; }
  float da = min(sdSarc(p, uSarcA, uLid.x), sdSarc(p, uSarcE, uLid.y)); if (da < d) { d = da; id = 10; }
  float di = sdIron(p); if (di < d) { d = di; id = 11; }
  float dt = sdStair(p); if (dt < d) { d = dt; id = 12; }
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

vec3 shadeHades(vec3 ro, vec3 rd, float jit, out float depth) {
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
      // the ruin: the crack burning with the light that broke it
      emit += vec3(1.0, 0.8, 0.5) * 6.0 * uRuin * smoothstep(2.5, 0.0, abs(p.x - THRONE.x)) * step(p.z, THRONE.z - 3.0);
    }
    else if (id == 5) {
      vec3 q = satLocal(p);
      alb = vec3(0.006); spec = 0.05;
      // cinders crawling in the shadow
      float cn = smoothstep(0.72, 0.9, vnoise(q * 3.5 + vec3(0.0, uTime * 0.8, 0.0)));
      emit += vec3(1.0, 0.35, 0.08) * 3.0 * cn * (1.0 - 0.8 * uBind);
      // eyes: two cold points under the hood
      vec2 e = vec2(abs(q.x) - 0.075 * uSat.w / 1.8, q.y - 1.62 * uSat.w / 1.8);
      emit += vec3(0.6, 0.8, 1.0) * 6.0 * smoothstep(0.035, 0.0, length(e)) * step(0.0, q.z) * (1.0 - uBind);
    }
    else if (id == 6) { alb = vec3(0.03); spec = 0.5; rough = 0.3; emit += vec3(1.0, 0.3, 0.05) * uHot * 1.5; }
    else if (id == 7) { alb = vec3(0.007, 0.007, 0.008); spec = 0.05; }
    else if (id == 8) { alb = vec3(0.09, 0.008, 0.006); spec = 0.1; }
    else if (id == 9) { alb = vec3(0.3, 0.25, 0.15); emit += vec3(1.0, 0.82, 0.5) * uCrossK; }
    else if (id == 10) { alb = vec3(0.10, 0.095, 0.09) * (0.65 + 0.7 * fbm(p.xy * 3.0 + p.z, 4)); spec = 0.15; rough = 0.5; }
    else if (id == 11) { alb = vec3(0.035, 0.034, 0.036) * (0.7 + 0.6 * fbm(p.xy * 4.0, 3)); spec = 0.6; rough = 0.35; }
    else if (id == 12) {
      alb = vec3(0.2, 0.18, 0.15);
      float top = smoothstep(0.6, 0.9, n.y);
      emit += vec3(1.0, 0.82, 0.55) * uStair * (0.6 + 2.4 * top) * (0.55 + 0.45 * sat((p.z - 3.0) / 40.0));
    }
    float ao = sat(0.4 + 0.6 * mapH(p + n * 0.4) / 0.4);
    vec3 lig = uCold * (vec3(1.5, 1.8, 2.4) * pow(sat(dot(n, key)), 1.5) * 0.8 + vec3(0.06, 0.09, 0.16) * (0.5 + 0.5 * n.y)) * ao;
    float tsh = treeShadow(p);
    lig += gateLight(p, n) * (1.0 - 0.92 * tsh);
    // uTree.z: the gateway's light thrown long down the hall, so the shadow reads on the floor
    if (uTree.z > 0.0 && p.z < 0.0) lig += vec3(1.0, 0.8, 0.55) * uTree.z * sat(n.y) * (1.0 - 0.95 * tsh) * exp(p.z * 0.012) * smoothstep(30.0, 12.0, abs(p.x));
    // dawn pouring through the rent in the vault: a warm column standing on the floor
    if (uDay.x > 0.0) {
      float dc = length(p.xz - DAY_C);
      lig += vec3(1.0, 0.8, 0.56) * uDay.x * 1.6 * smoothstep(uDay.y * 1.1, uDay.y * 0.55, dc) * sat(n.y * 0.85 + 0.15);
      lig += vec3(0.9, 0.7, 0.5) * uDay.x * 0.25 * exp(-dc * 0.03) * (0.5 + 0.5 * n.y);
    }
    // the hand of light lights what it holds
    if (uHandK > 0.0) { vec3 L = uHandB - p; float d2 = dot(L, L); lig += vec3(1.0, 0.88, 0.7) * uHandK * 3.0 * sat(dot(n, L * inversesqrt(d2)) * 0.8 + 0.2) / (d2 + 1.0) * (id == 7 || id == 8 ? 0.15 : 1.0); }
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
    if (id == 0 && uSat.w > 0.0) {
      vec3 ab = uSat.xyz - uSatFrom; float L = max(length(ab), 1e-3);
      float s = clamp(dot(p - uSatFrom, ab) / (L * L), 0.0, 1.0);
      float dl = length(p - (uSatFrom + ab * s));
      emit += vec3(1.0, 0.32, 0.06) * 2.5 * smoothstep(0.9, 0.0, dl) * smoothstep(0.55, 0.85, vnoise(p.xz * 3.0)) * (0.4 + 0.6 * s) * (1.0 - uBind);
    }
    // rim light on figures from the glory/flood, so they read as silhouettes
    if (id == 7 || id == 8 || id == 5) {
      vec3 src = uGK > 0.0 ? uG : vec3(0.0, 13.0, 4.0);
      float rim = pow(1.0 - sat(dot(-rd, n)), 4.0) * sat(dot(n, normalize(src - p)) + 0.3);
      emit += vec3(1.0, 0.85, 0.65) * rim * (uGK * 1.6 + uFlood * 1.6 + uSeam * 0.5 + uDay.x * 1.2 + 0.08);
      if (id == 8) emit *= vec3(0.75, 0.22, 0.15);   // her red robe takes the rim light red
    }
    col = alb * lig + emit;
    vec3 r = reflect(rd, n);
    col += spec * alb.g * 8.0 * lig * pow(sat(dot(r, normalize(vec3(0.0, 13.0, 4.0) - p))), mix(8.0, 300.0, 1.0 - rough)) * (uSeam + uFlood);
    col = inkWords(col, wordsOn(p), n, rd);
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
  // the sky through the rent in the vault, and the column of dawn under it
  if (uDay.x > 0.0) {
    if (depth > 400.0 && rd.y > 0.0) col = mix(vec3(1.0, 0.72, 0.42), vec3(0.55, 0.62, 0.8), sat(rd.y)) * 2.5 * uDay.x;
    vec3 dl = rayLine(ro, rd, vec3(DAY_C.x, 0.0, DAY_C.y), vec3(DAY_C.x, 95.0, DAY_C.y));
    if (dl.y < depth) col += vec3(1.0, 0.8, 0.55) * uDay.x * 0.18 * exp(-dl.x / (uDay.y * 0.7)) * (0.7 + 0.3 * fbm(vec2(dl.z * 8.0, uTime * 0.3), 2));
  }
  if (uHandK > 0.0) {
    vec3 hl = rayLine(ro, rd, uHandA, uHandB);
    if (hl.y < depth + 0.3) col += vec3(1.0, 0.86, 0.6) * uHandK * (0.9 * exp(-hl.x / mix(0.12, 0.05, hl.z)) + 0.12 * exp(-hl.x / 0.8));
    if (uHand2 > 0.0) {
      vec3 h2 = rayLine(ro, rd, uHandA, uHandC);
      if (h2.y < depth + 0.3) col += vec3(1.0, 0.86, 0.6) * uHandK * (0.9 * exp(-h2.x / mix(0.12, 0.05, h2.z)) + 0.12 * exp(-h2.x / 0.8));
    }
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
