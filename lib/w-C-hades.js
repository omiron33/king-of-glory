// Group C's Hades: lib/w-hades.js (the hall, the gates, the colossus, Satan) extended for the
// barring of the gates, their breaking and the binding of Satan. Everything is as in w-hades.js, plus:
//   uBarX: how far each of the three reserve bars (low, middle, high) has been dragged across, 0..1
//          (replaces uBars); uBarSnap: each bar snapped at the seam, its halves drooping from the
//          brackets, 0..1; uBarHot: the bars glowing from red to white heat
//   uBolt: the bolts at both ends of each bar, 0 drawn up .. 1 slammed home through the bar
//   uOut: the light beyond the gateway once the doors are down (the cliff behind is cut through)
//   uDais: a dais of dressed basalt at the colossus's feet whose face carries words (front z = -122)
//   uProcV: the procession's walking speed (m/s); uProcRise: the saints rising from their knees
//   uWave > 0: the flood reaches only uWave metres down the hall from the gates (a front of light)
//   uKeyCol: the key light's colour per shot (cold rim, warm seam, hot iron)
//   uTear: Satan's shadow torn by the light, its edges ripped into smoke
//   the glory: its mandorla is opaque (it hides the blaze behind it); uGLit scales the light it casts;
//          uArc > 0 writes the text texture round the top of its outer ring, as an icon's inscription
//          (u from the left end of the arc to the right, v from the ring's inner edge outward)
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

export const HADESC_UNIFORMS = {
  uSeam: 0.2, uFlood: 0.0, uCold: 1.0, uDust: 1.0,
  uCrack: 0.0, uHot: 0.0, uBow: 0.0, uFall: 0.0, uBars: 0.0, uChain: 0.0, uBurst: 0.0,
  uG: [0, 13, 8], uGR: 0.0, uGK: 0.0,
  uSat: [0, 0, -60, 0], uSatYaw: 0.0, uSatLean: 0.0, uSatFrom: [0, 0, -60], uBind: 0.0,
  uGrip: 0.0, uRuin: 0.0,
  uF0: [0, 0, 0, 0], uF1: [0, 0, 0, 0], uF2: [0, 0, 0, 0], uP0: [0, 0, 0, 0], uP1: [0, 0, 0, 0], uP2: [0, 0, 0, 0], uFRed: 0.0,
  uCrossP: [0, 0, 0, 0], uCrossK: 0.0,
  uProc: 0.0, uProcA: [0, 0, -20], uProcB: [0, 0, 6], uFires: 1.0,
  uBarX: [0, 0, 0], uBarSnap: [0, 0, 0], uBarHot: 0.0, uBolt: [0, 0, 0], uOut: 0.0, uDais: 0.0, uProcV: 0.9, uProcRise: 1.0, uGLit: 1.0, uArc: 0.0, uWave: 0.0, uTear: 0.0, uKeyCol: [1.5, 1.8, 2.4],
};

export const HADESC_GLSL = /* glsl */ `
uniform float uSeam, uFlood, uCold, uDust;
uniform float uCrack, uHot, uBow, uFall, uBars, uChain, uBurst;
uniform vec3 uG; uniform float uGR, uGK;
uniform vec4 uSat; uniform float uSatYaw, uSatLean; uniform vec3 uSatFrom; uniform float uBind;
uniform float uGrip, uRuin;
uniform vec4 uF0, uF1, uF2, uP0, uP1, uP2; uniform float uFRed;
uniform vec4 uCrossP; uniform float uCrossK;
uniform float uProc; uniform vec3 uProcA, uProcB;
uniform float uFires;   // the cold fires at the throne's feet
uniform vec3 uBarX, uBarSnap, uBolt; uniform float uBarHot, uOut, uDais, uProcV, uProcRise, uGLit, uArc, uWave, uTear;
uniform vec3 uKeyCol;   // the colour (and strength) of the sourceless key light, set per shot
const vec3 FIRE_L = vec3(-24.0, 0.0, -122.0), FIRE_R = vec3(24.0, 0.0, -122.0);

const float DW = 9.0, DH = 26.0;
const vec3 LIN_C = vec3(0.0, 28.6, -1.0), LIN_H = vec3(14.0, 2.6, 1.6);
const vec3 THRONE = vec3(0.0, 0.0, -150.0);
vec3 gDQ;          // the last door hit, in the door's own frame
float gDS;         // which door (-1 left, +1 right, as seen from inside)

// the soot round burned letters: the blurred text texture, on the same plane as wordsOn()
float wordsSoot(vec3 p) {
  if (uWordDepth <= 0.0) return 0.0;
  vec3 nn = normalize(cross(uTxX, uTxY));
  vec3 q = p - uTxC;
  if (abs(dot(q, nn)) > uWordDepth + 0.3) return 0.0;
  vec2 uv = vec2(dot(q, uTxX) / uTxHS.x, dot(q, uTxY) / uTxHS.y) * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
  return texture(uTextShade, uv).a;
}

// ------------------------------------------------------------------ the glory, close
// gloryLight() from w-common, tuned for the King standing near us: deeper ultramarine in the inner
// rings and a softer halo, so the white-gold figure of light at the heart stands out from them,
// with gold edging down His vestments. No face: a head of light in a gold-ringed halo.
float sg2(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
vec3 gloryC(vec3 ro, vec3 rd, vec3 G, float R, float k, float depth) {
  float tg = dot(G - ro, rd);
  if (tg < 0.0 || k <= 0.0) return vec3(0.0);
  vec3 q = ro + rd * tg - G;
  vec3 side = normalize(cross(rd, vec3(0.0, 1.0, 0.0)) + 1e-5);
  vec3 up = cross(side, rd);
  vec2 e = vec2(dot(q, side), dot(q, up)) / R;
  float rho = length(e * vec2(1.25, 0.8));
  float ang = atan(e.y, e.x);
  vec3 c = vec3(0.0);
  float vis = tg < depth ? 1.0 : 0.0;
  if (rho < 1.0) {
    float band = floor(rho * 5.0), f = fract(rho * 5.0);
    vec3 blue = mix(vec3(0.30, 0.48, 1.0), vec3(0.03, 0.08, 0.38), band / 4.0);
    c = blue * (1.0 + 0.7 * (1.0 - rho));
    c += vec3(1.0, 0.8, 0.45) * smoothstep(0.06, 0.0, abs(f - 0.97)) * 1.6;
    float st = step(0.985, hash12(floor(vec2(ang * 30.0, rho * 40.0))));
    c += vec3(1.5, 1.3, 0.9) * st;
    vec2 f2 = e;
    // the figure as in the icon: robe widening to a flared hem, shoulders, and both arms reaching
    // down and out to either side (to raise Adam and Eve); a head of light, no face
    float yy = clamp((f2.y + 0.67) / 1.17, 0.0, 1.0);
    float rw = mix(0.25, 0.11, pow(yy, 0.8)) + 0.025 * sin(f2.y * 40.0) * (1.0 - yy);
    float robe = max(abs(f2.x) - rw, abs(f2.y + 0.085) - 0.585);
    vec2 ax = vec2(abs(f2.x), f2.y);
    float arm = min(sg2(ax, vec2(0.12, 0.47), vec2(0.27, 0.22)) - 0.04, sg2(ax, vec2(0.27, 0.22), vec2(0.41, 0.03)) - 0.032);
    float hand = length(ax - vec2(0.42, 0.01)) - 0.038;
    float shoul = sg2(ax, vec2(0.0, 0.48), vec2(0.13, 0.46)) - 0.055;
    float neck = sg2(f2, vec2(0.0, 0.5), vec2(0.0, 0.6)) - 0.032;
    float bd = min(min(robe, arm), min(min(hand, shoul), neck));
    float body = smoothstep(0.012, 0.0, bd);
    float hd = length(f2 - vec2(0.0, 0.66)) - 0.072;
    float head = smoothstep(0.02, 0.0, hd);
    float halo = smoothstep(0.012, 0.0, abs(length(f2 - vec2(0.0, 0.66)) - 0.13)) * 0.8;
    float folds = 0.75 + 0.25 * sin(f2.x * 90.0 + f2.y * 6.0);
    // gold edging round the figure and down the front of the vestments
    float edge = smoothstep(0.01, 0.0, abs(bd + 0.008)) + smoothstep(0.006, 0.0, abs(f2.x)) * step(f2.y, 0.44) * step(robe, 0.0);
    // a glow round the figure itself
    c += vec3(1.0, 0.85, 0.6) * 0.45 * exp(-max(bd, 0.0) * 30.0);
    c = mix(c, vec3(6.0, 5.4, 4.2) * folds, max(body, head));
    c += vec3(2.4, 1.6, 0.6) * edge * 0.7;
    c += vec3(3.0, 2.2, 1.0) * halo;
    c *= smoothstep(1.0, 0.97, rho);
  }
  float rays = pow(abs(sin(ang * 8.0)), 24.0) + 0.5 * pow(abs(sin(ang * 8.0 + 0.4)), 60.0);
  c += vec3(1.6, 1.1, 0.5) * 0.8 * rays * exp(-max(rho - 0.6, 0.0) * 1.6) * step(0.75, rho);
  c += vec3(1.0, 0.85, 0.65) * 0.25 * exp(-rho * 1.4) + vec3(0.6, 0.7, 1.0) * 0.1 * exp(-rho * 0.35);
  return c * k * vis;
}

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
  return min(jamb, lin);
}

// the reserve bars: three beams of iron dragged across the doors in brackets on the jambs, bolted at
// both ends; snapped, a bar breaks at the seam and each half droops from its bracket
const float BAR_Z = -1.6;
float sdCylY(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float barY(int i) { return 5.0 + 7.5 * float(i); }
float sdBarOne(vec3 p, float y, float ext, float snap) {
  if (ext <= 0.0) return 1e3;
  if (snap <= 0.0) {
    float hw = 11.5 * ext;
    return sdBox(p - vec3(-11.5 + hw, y, BAR_Z), vec3(hw, 0.6, 0.45)) - 0.04;
  }
  float s = p.x < 0.0 ? -1.0 : 1.0;
  vec3 q = p - vec3(s * 11.5, y, BAR_Z);
  q.xy = rot(s * 0.62 * snap) * q.xy;
  q.z += 0.9 * snap * smoothstep(0.0, 11.0, abs(q.x));
  return sdBox(q - vec3(-s * (5.75 - 0.3 * snap), 0.0, 0.0), vec3(5.75 - 0.3 * snap, 0.6, 0.45)) - 0.04;
}
float sdBars(vec3 p) {
  if (p.z < -4.5 || abs(p.x) > 13.5 || p.y > 26.0) return max(max(-4.0 - p.z, abs(p.x) - 13.0), max(p.y - 25.0, 0.5));
  float d = 1e3;
  for (int i = 0; i < 3; i++) {
    float y = barY(i);
    float ext = i == 0 ? uBarX.x : (i == 1 ? uBarX.y : uBarX.z);
    float sn = i == 0 ? uBarSnap.x : (i == 1 ? uBarSnap.y : uBarSnap.z);
    float bo = i == 0 ? uBolt.x : (i == 1 ? uBolt.y : uBolt.z);
    d = min(d, sdBarOne(p, y, ext, sn));
    // brackets on the jambs above and below each bar end, and the bolt dropped through them
    vec3 q = vec3(abs(p.x) - 10.4, p.y - y, p.z - BAR_Z);
    float br = sdBox(vec3(q.x, abs(q.y) - 1.05, q.z), vec3(1.0, 0.38, 0.78)) - 0.03;
    float bolt = sdCapsule(q, vec3(0.0, -1.5 + 3.6 * (1.0 - bo), 0.0), vec3(0.0, 2.0 + 3.6 * (1.0 - bo), 0.0), 0.55);
    float head = sdCylY(q - vec3(0.0, 2.1 + 3.6 * (1.0 - bo), 0.0), 0.85, 0.22);
    d = min(d, min(br, min(bolt, head)));
  }
  return d;
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
  // once the doors are down the gateway runs through to the light outside
  if (uOut > 0.0) gate = min(gate, sdBox(p - vec3(0.0, 13.0, 40.0), vec3(9.2, 13.0, 40.0)));
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
  return min(throne, body) + rk;
}

// the dais at the colossus's feet: dressed basalt, its face a field for words
float sdDais(vec3 p) {
  if (uDais <= 0.0) return 1e3;
  float d = sdBox(p - vec3(0.0, 2.6, -128.0), vec3(26.0, 2.6, 6.0)) - 0.06;
  float step1 = sdBox(p - vec3(0.0, 0.4, -121.2), vec3(27.0, 0.4, 1.2)) - 0.04;
  return min(d, step1);
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
  d += (0.06 + 0.35 * uTear) * uSat.w / 5.0 * (fbm(q * 2.5 + vec3(0.0, -uTime * (1.5 + 3.0 * uTear), 0.0), 3) - 0.3);
  return d;
}

// the chains of light that bind him: five rings of torus links round his body, wound on from the
// feet up as uBind grows, alternate links turned crosswise like a real chain
float sdBindChains(vec3 p) {
  if (uBind <= 0.0 || uSat.w <= 0.0) return 1e3;
  vec3 q = satLocal(p);
  float s = uSat.w / 1.8;
  if (length(q - vec3(0.0, uSat.w * 0.5, 0.0)) > uSat.w * 0.8) return length(q - vec3(0.0, uSat.w * 0.5, 0.0)) - uSat.w * 0.7;
  float d = 1e3;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    if (uBind < fi * 0.15 + 0.05) break;
    float yl = 0.2 + 0.27 * fi;                                  // height in the figure's 1.8 m frame
    float R = (mix(0.32, 0.17, yl / 1.45) + 0.06) * s;
    vec3 c = q - vec3(0.0, yl * s, 0.0);
    c.xy = rot(0.12 * sin(fi * 2.1)) * c.xy;                    // each ring a little askew
    float a = atan(c.z, c.x);
    float N = 12.0, st = 6.2831853 / N;
    float ai = floor(a / st + 0.5);
    float aa = ai * st;
    vec3 rr = vec3(cos(aa), 0.0, sin(aa)), tt = vec3(-sin(aa), 0.0, cos(aa));
    vec3 l = c - rr * R;
    vec3 lq = vec3(dot(l, tt), dot(l, rr), l.y) / s;
    if (mod(ai, 2.0) > 0.5) lq.yz = lq.zy;
    float lk = length(vec2(length(vec2(max(abs(lq.x) - 0.05, 0.0), lq.y)) - 0.07, lq.z)) - 0.022;
    d = min(d, lk * s);
  }
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
  vec3 q = p - uProcA;
  float s = dot(q, dir) - uTime * uProcV, x = dot(q, side);
  if (abs(x) > 6.0 || dot(q, dir) < 0.0 || dot(q, dir) > L * uProc) return max(abs(x) - 5.0, 1.0);
  float row = floor(s / 1.6), col = clamp(floor(x / 1.3 + 0.5), -3.0, 3.0);
  vec3 c = vec3((col + 0.3 * (hash11(row * 7.0 + col) - 0.5)) * 1.3, 0.0, (row + 0.5) * 1.6 + 0.3 * hash11(row + col * 3.0));
  vec3 lq = vec3(x - c.x, q.y, s - c.z);
  pid = hash11(row * 13.0 + col);
  float kn = 1.0 - smoothstep(pid * 0.5, pid * 0.5 + 0.5, uProcRise);
  return sdFigure(lq, 1.7 + 0.15 * pid, 0.05 + 0.35 * kn, 0.25 * (1.0 - kn) * step(0.7, pid), 0.45 * kn);
}

float mapH(vec3 p, out int id) {
  float d = sdFloorG(p); id = 0;
  float dd = uFall < 0.999 || true ? sdDoors(p) : 1e3; if (dd < d) { d = dd; id = 1; }
  float df = sdFrameG(p); if (df < d) { d = df; id = 2; }
  float db = sdBars(p); if (db < d) { d = db; id = 10; }
  float dd2 = sdDais(p); if (dd2 < d) { d = dd2; id = 11; }
  float dc = min(sdCliffG(p), sdCavern(p)); if (dc < d) { d = dc; id = 3; }
  float dk = sdColossus(p); if (dk < d) { d = dk; id = 4; }
  float ds = sdSatan(p); if (ds < d) { d = ds; id = 5; }
  float dh = sdChains(p); if (dh < d) { d = dh; id = 6; }
  float dbc = sdBindChains(p); if (dbc < d) { d = dbc; id = 12; }
  float d0 = sdFig(p, uF0, uP0); if (d0 < d) { d = d0; id = 7; }
  float d1 = sdFig(p, uF1, uP1); if (d1 < d) { d = d1; id = uFRed > 0.5 ? 8 : 7; }
  float d2 = sdFig(p, uF2, uP2); if (d2 < d) { d = d2; id = 7; }
  float dx = sdCrossG(p); if (dx < d) { d = dx; id = 9; }
  vec2 fq = vec2(abs(p.x) - 24.0, p.z + 122.0);
  float bowl = max(length(fq) - 3.2, abs(p.y - 2.0) - 2.0); if (bowl < d) { d = bowl; id = 2; }
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
  float reach = uWave > 0.0 ? smoothstep(uWave + 6.0, uWave - 6.0, -p.z) : 1.0;
  c += vec3(1.0, 0.86, 0.66) * uFlood * 2600.0 * sat(dot(n, g * inversesqrt(g2)) * 0.85 + 0.15) / (g2 + 60.0) * reach;
  // the front of the flood itself, a band of light running down the hall
  if (uWave > 0.0) c += vec3(1.0, 0.74, 0.42) * uFlood * 110.0 * reach * sat(dot(n, g * inversesqrt(g2)) * 0.6 + 0.4) / (10.0 + g2 * 0.004);
  if (uWave > 0.0) c += vec3(1.0, 0.85, 0.6) * uFlood * 40.0 * exp(-abs(-p.z - uWave) * 0.35) * sat(n.y * 0.6 + 0.5);
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
      float wear = 0.65 * fbm(q * vec3(0.9, 0.25, 0.9), 4) + 0.35 * fbm(q * 6.0, 3);
      alb = mix(vec3(0.075, 0.035, 0.015), vec3(0.30, 0.15, 0.055), smoothstep(0.3, 0.75, wear)); spec = 0.6; rough = 0.3;
      // dark bronze, worn bright on the studs and at the edges where hands and weather rub it
      float stud = smoothstep(-0.05, -0.15, q.z);
      float edgeW = smoothstep(0.35, 0.0, min(abs(abs(q.x - gDS * 4.52) - 4.48), abs(q.y - DH) + 0.2));
      alb = mix(alb, vec3(0.5, 0.27, 0.09), 0.5 * max(stud, edgeW * 0.7));
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
    else if (id == 3) {
      alb = vec3(0.04, 0.042, 0.05) * (0.6 + 0.8 * fbm(p.xy * 0.8 + p.z * 0.1, 4)); rough = 0.7;
      // beyond the gateway: the light itself
      if (uOut > 0.0 && p.z > 3.0 && abs(p.x) < 9.6 && p.y < 26.5) emit += vec3(1.0, 0.9, 0.72) * uOut * 14.0 * smoothstep(3.0, 9.0, p.z);
    }
    else if (id == 10) {
      // iron, heating from dull red to white where the pressure bends it
      alb = vec3(0.07, 0.058, 0.048) * (0.55 + 0.9 * fbm(p.xy * vec2(0.8, 3.0) + p.z, 4)); spec = 0.5; rough = 0.35;
      float h = uBarHot * (0.75 + 0.25 * fbm(p.xy * 1.5 + uTime * 0.6, 2)) * smoothstep(13.0, 2.0, abs(p.x) + 2.0 * (1.0 - uBarHot));
      emit += mix(vec3(1.0, 0.18, 0.03), vec3(1.0, 0.85, 0.6), smoothstep(0.5, 1.0, h)) * h * h * 5.0;
    }
    else if (id == 12) { alb = vec3(0.3, 0.25, 0.15); emit += vec3(1.0, 0.85, 0.55) * 3.0 * uBind; }
    else if (id == 11) {
      alb = vec3(0.06, 0.062, 0.07) * (0.75 + 0.5 * fbm(p.xy * 1.2 + p.z * 0.3, 4)); spec = 0.25; rough = 0.35;
      float j = smoothstep(0.04, 0.0, abs(fract(p.x / 3.2) - 0.5) - 0.48) * step(0.9, p.y);
      alb *= 1.0 - 0.6 * j;
    }
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
    else if (id == 7) { alb = vec3(0.02, 0.02, 0.022); spec = 0.05; }
    else if (id == 8) { alb = vec3(0.25, 0.02, 0.015); spec = 0.1; }
    else if (id == 9) { alb = vec3(0.3, 0.25, 0.15); emit += vec3(1.0, 0.82, 0.5) * uCrossK; }
    float ao = sat(0.4 + 0.6 * mapH(p + n * 0.4) / 0.4);
    vec3 lig = uCold * (uKeyCol * pow(sat(dot(n, key)), 1.5) * 0.8 + vec3(0.06, 0.09, 0.16) * (0.5 + 0.5 * n.y)) * ao;
    lig += gateLight(p, n);
    // the cold fires of Hades: pale green-blue, from below
    for (int f = 0; f < 2; f++) {
      vec3 fp = (f == 0 ? FIRE_L : FIRE_R) + vec3(0.0, 7.0, 0.0);
      vec3 L = fp - p; float d2 = dot(L, L);
      float fl = 0.85 + 0.15 * sin(uTime * 7.0 + float(f) * 2.0) * sin(uTime * 3.1);
      lig += vec3(0.35, 0.85, 0.95) * uFires * 6000.0 * fl * sat(dot(n, L * inversesqrt(d2)) * 0.9 + 0.1) / (d2 + 20.0) * smoothstep(60.0, 8.0, p.y);
    }
    // the glory as a light
    if (uGK > 0.0) { vec3 L = uG - p; float d2 = dot(L, L); float r2 = uGR * uGR; lig += vec3(1.0, 0.9, 0.75) * uGK * uGLit * 3.0 * r2 * sat(dot(n, L * inversesqrt(d2)) * 0.8 + 0.2) / (d2 + r2); }
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
      float rim = pow(1.0 - sat(dot(-rd, n)), 3.0) * sat(dot(n, normalize(src - p)) + 0.4);
      emit += vec3(1.0, 0.85, 0.65) * rim * (uGK * 1.6 + uFlood * 1.6 + uSeam * 0.5 + 0.08);
    }
    col = alb * lig + emit;
    vec3 r = reflect(rd, n);
    col += spec * alb.g * 8.0 * lig * pow(sat(dot(r, normalize(vec3(0.0, 13.0, 4.0) - p))), mix(8.0, 300.0, 1.0 - rough)) * (uSeam + uFlood);
    if (uWordMode > 0.5) col *= 1.0 - 0.9 * sat(wordsSoot(p) * 3.0);
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
  // the mandorla is opaque, as in the icon: it hides the blaze behind it, so its rings read
  if (uGK > 0.0) {
    float tg = dot(uG - ro, rd);
    if (tg > 0.0 && tg < depth) {
      vec3 q = ro + rd * tg - uG;
      vec3 side = normalize(cross(rd, vec3(0.0, 1.0, 0.0)) + 1e-5), up = cross(side, rd);
      float rho = length(vec2(dot(q, side), dot(q, up)) / uGR * vec2(1.25, 0.8));
      col *= 1.0 - 0.94 * smoothstep(1.0, 0.97, rho) * min(uGK * 2.0, 1.0);
    }
  }
  col += gloryC(ro, rd, uG, uGR, uGK, depth);
  if (uArc > 0.0) {
    float tg = dot(uG - ro, rd);
    if (tg > 0.0 && tg < depth) {
      vec3 q = ro + rd * tg - uG;
      vec3 side = normalize(cross(rd, vec3(0.0, 1.0, 0.0)) + 1e-5), up = cross(side, rd);
      vec2 es = vec2(dot(q, side), dot(q, up)) / uGR * vec2(1.25, 0.8);
      float rho = length(es), ang = atan(es.y, es.x);
      float a = carveA(vec2((2.62 - ang) / 2.1, 0.1 + 0.8 * (rho - 0.795) / 0.19));
      col = mix(col, uWordCol * uWordGlow, a * uArc);
    }
  }
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
