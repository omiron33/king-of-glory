// A side passage of Hades (units: metres, y up), for the good thief's arrival. A long barrel-vaulted
// corridor of rough-hewn, wet black basalt runs along z: walls at |x| = 4, a vault springing at 4.5 m to a crown at
// 8.5 m, a floor of worn flags. Far down it, at z = -95, the passage opens on light: Christ is close
// behind (uFar, the strength of that light, which reaches up the passage and rims everything in it).
// Down the passage walks the thief: a rim-lit silhouette with a faint glow of his own (uGlow), his
// cross on his right shoulder, the crossing at his shoulder and its foot dragging on the floor behind.
//   uThief: xyz feet, w height; uThiefYaw: his heading (0 faces +z, toward the passage mouth behind
//   the camera); uStep: his walking phase (bob and sway).
// Words: WORDS_GLSL, placed by the scene's textPlane on a wall; the thief's own glow lights them.

export const PASSAGE_UNIFORMS = {
  uThief: [1.4, 0, -30, 1.8], uThiefYaw: 0.0, uStep: 0.0, uGlow: 0.6, uFar: 1.0, uDust: 1.0,
};

export const PASSAGE_GLSL = /* glsl */ `
uniform vec4 uThief; uniform float uThiefYaw, uStep, uGlow, uFar, uDust;
const float PW = 4.0, PS = 4.5, PEND = -95.0;

// masonry: courses 0.75 m high, blocks 1.6 m long, every other course staggered
// rough-hewn masonry: courses ~0.9 m with jittered heights, blocks 1.1-2.3 m long, joints deep and
// chipped (their edges eaten by noise), each block's face bulging by its own amount
vec3 hewn(vec2 uv) {
  float row = floor(uv.y / 0.9);
  float fy = fract(uv.y / 0.9);
  float len = 1.1 + 1.2 * hash11(row * 3.7);
  float x = uv.x / len + hash11(row * 7.1);
  float col = floor(x), fx = fract(x);
  float e = min(min(fx, 1.0 - fx) * len, min(fy, 1.0 - fy) * 0.9);   // distance to the block's edge (m)
  float chip = 0.06 * fbm(uv * 3.0, 3);
  float jnt = smoothstep(0.09 + chip, 0.0, e);
  return vec3(jnt, hash12(vec2(col, row)), e);
}
float joints(vec2 uv) { return hewn(uv).x; }
float blockId(vec2 uv) { return hewn(uv).y; }
vec2 wallUV(vec3 p) { return p.y < PS ? vec2(p.z, p.y) : vec2(p.z, PS + PW * atan(abs(p.x), p.y - PS)); }
float sdHall(vec3 p) {
  // inside the corridor the field is positive: distance to walls, vault and floor
  float wall = p.y < PS ? PW - abs(p.x) : PW - length(vec2(p.x, p.y - PS));
  vec2 wuv = wallUV(p);
  vec3 hw = hewn(wuv);
  wall += 0.06 * hw.x + 0.16 * fbm(vec2(p.z, p.y) * 1.4 + 3.0, 4) + 0.08 * hw.y - 0.06 * smoothstep(0.0, 0.4, hw.z) + 0.03 * fbm(vec2(p.z, p.y) * 6.0, 2);
  float fl = p.y + 0.05 * joints(p.zx * vec2(1.0, 1.4) + 0.3) - 0.04 * fbm(p.xz * 1.5, 3);
  float endw = p.z - PEND;
  return min(min(wall, fl), endw);
}

// a man walking, bare but for a cloth at the hips (the crucified thief): feet at the origin, facing
// +z, height h, walking phase ph (one step per unit); his right hand steadies the beam on his
// shoulder, his left reaches across to it
float sdMan(vec3 p, float h, float ph) {
  float s = h / 1.8; p /= s;
  p.yz = rot(-0.12) * p.yz;                       // stooped under the weight
  float a = sin(ph * 3.1416), b = cos(ph * 3.1416);
  float d = 1e3;
  for (int i = 0; i < 2; i++) {
    float sd = i == 0 ? -1.0 : 1.0, sw = 0.38 * a * sd;
    vec3 hip = vec3(0.1 * sd, 0.94, 0.0);
    vec3 knee = hip + vec3(0.0, -0.46 * cos(sw), 0.46 * sin(sw));
    float bend = 0.25 + 0.3 * max(0.0, -b * sd);
    vec3 ank = knee + vec3(0.0, -0.45 * cos(sw - bend), 0.45 * sin(sw - bend));
    d = min(d, sdRoundCone(p, hip, knee, 0.105, 0.075));
    d = min(d, sdRoundCone(p, knee, ank, 0.072, 0.05));
    d = min(d, sdCapsule(p, ank, ank + vec3(0.0, -0.03, 0.17), 0.05));
  }
  float torso = sdEllipsoid(p - vec3(0.0, 1.2, 0.02), vec3(0.2, 0.3, 0.13));
  float sh = sdCapsule(p, vec3(-0.19, 1.42, 0.02), vec3(0.19, 1.42, 0.02), 0.09);
  float neck = sdCapsule(p, vec3(0.0, 1.45, 0.02), vec3(0.0, 1.56, 0.04), 0.05);
  float head = sdEllipsoid(p - vec3(0.0, 1.65, 0.05), vec3(0.095, 0.115, 0.105));
  // a ragged cloth from waist to knee
  float cloth = max(sdRoundCone(p, vec3(0.0, 0.55, 0.0), vec3(0.0, 1.02, 0.0), 0.24, 0.16) + 0.015 * sin(atan(p.z, p.x) * 9.0), 0.5 + 0.04 * sin(atan(p.z, p.x) * 5.0) - p.y);
  float armR = min(sdRoundCone(p, vec3(0.21, 1.4, 0.02), vec3(0.32, 1.16, 0.16), 0.07, 0.055), sdRoundCone(p, vec3(0.32, 1.16, 0.16), vec3(0.2, 1.5, 0.24), 0.05, 0.045));
  float armL = min(sdRoundCone(p, vec3(-0.21, 1.4, 0.02), vec3(-0.18, 1.12, 0.2), 0.07, 0.055), sdRoundCone(p, vec3(-0.18, 1.12, 0.2), vec3(0.1, 1.42, 0.3), 0.05, 0.045));
  d = smin(d, torso, 0.09);
  d = smin(d, sh, 0.05);
  d = smin(d, neck, 0.03);
  d = smin(d, head, 0.03);
  d = smin(d, cloth, 0.03);
  d = smin(d, min(armR, armL), 0.05);
  return d * s;
}

// the thief, in his own frame: feet at the origin, facing +z
vec3 thiefLocal(vec3 p) {
  vec3 q = p - uThief.xyz;
  q.xz = rot(uThiefYaw) * q.xz;
  q.y -= 0.03 * abs(sin(uStep * 3.1416));
  q.xy = rot(0.025 * sin(uStep * 3.1416)) * q.xy;
  return q;
}
float sdCrossT(vec3 q, float h) {
  // the shoulder, the foot of the cross dragging behind, the head a little in front and above
  vec3 S = vec3(0.17, 1.47, 0.02) * h / 1.8;
  vec3 F = vec3(0.45, 0.06, -3.1);
  vec3 D = normalize(F - S);
  vec3 top = S - D * 1.05;
  float up = sdCapsule(q, top, F, 0.085) ;
  vec3 J = S - D * 0.55;
  vec3 X = normalize(cross(D, vec3(0.0, 1.0, 0.0)));
  float beam = sdCapsule(q, J - X * 1.05, J + X * 1.05, 0.08);
  return min(up, beam);
}
float sdThief(vec3 p, out bool isCross) {
  isCross = false;
  if (uThief.w <= 0.0) return 1e3;
  vec3 q = thiefLocal(p);
  if (length(q - vec3(0.0, 1.2, -1.0)) > 5.0) return length(q - vec3(0.0, 1.2, -1.0)) - 4.5;
  float body = sdMan(q, uThief.w, uStep);
  float cr = sdCrossT(q, uThief.w);
  isCross = cr < body;
  return min(body, cr);
}

float mapP(vec3 p, out int id) {
  float d = sdHall(p); id = 0;
  bool ic; float dt = sdThief(p, ic); if (dt < d) { d = dt; id = ic ? 2 : 1; }
  return d;
}
float mapP(vec3 p) { int i; return mapP(p, i); }
vec3 normP(vec3 p, float t) {
  vec2 e = vec2(0.002 * max(1.0, t * 0.1), 0.0);
  return normalize(vec3(mapP(p + e.xyy) - mapP(p - e.xyy), mapP(p + e.yxy) - mapP(p - e.yxy), mapP(p + e.yyx) - mapP(p - e.yyx)));
}

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

vec3 shadePassage(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.05; int id = -1;
  for (int i = 0; i < 200; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapP(p, k);
    if (abs(h) < 0.0005 * t + 0.001) { id = k; break; }
    t += h * 0.7;
    if (t > 140.0) break;
  }
  depth = t;
  vec3 farC = vec3(1.0, 0.82, 0.55);
  vec3 fogc = vec3(0.008, 0.010, 0.016);
  vec3 col = fogc;
  vec3 FL = vec3(0.0, 4.0, PEND + 3.0);                       // the light at the end of the passage
  vec3 GL = uThief.xyz + vec3(0.0, 1.3, 0.0);                  // the thief's own glow
  if (id >= 0) {
    vec3 p = ro + rd * t;
    vec3 n = normP(p, t);
    vec3 alb = vec3(0.05); vec3 emit = vec3(0.0); float spec = 0.1;
    if (id == 0) {
      alb = vec3(0.034, 0.036, 0.042) * (0.6 + 0.7 * fbm(p.zy * 2.3 + p.x, 4)) * (0.75 + 0.5 * blockId(p.y < 0.05 ? p.zx : wallUV(p)));
      // wet: seeping walls and pooled floor
      spec = 0.25 + 0.6 * smoothstep(0.4, 0.7, fbm(p.xz * 0.4 + p.y * 0.3 + 2.0, 3)) * (p.y < 0.1 ? 1.0 : 0.5);
      if (p.z < PEND + 0.5) emit += farC * uFar * 6.0;
    } else if (id == 1) { alb = vec3(0.012, 0.011, 0.012); }
    else { alb = vec3(0.02, 0.014, 0.01); }
    float ao = sat(0.35 + 0.65 * mapP(p + n * 0.35) / 0.35);
    vec3 lig = vec3(0.16, 0.24, 0.42) * (0.55 + 0.45 * n.y) * ao;
    // the sourceless cold of Hades, from high on the left
    lig += vec3(0.3, 0.42, 0.7) * (0.5 * pow(sat(dot(n, normalize(vec3(0.5, 0.8, 0.2)))), 1.5) + 0.45 * abs(n.x) + 0.2 * sat(n.z)) * ao;
    // the light at the end of the passage, falling up the corridor
    vec3 L = FL - p; float d2 = dot(L, L);
    lig += farC * uFar * 9000.0 * sat(dot(n, L * inversesqrt(d2)) * 0.65 + 0.35) / (d2 + 400.0) * ao;
    // the thief's glow
    vec3 G = GL - p; float g2 = dot(G, G);
    if (id == 0) lig += vec3(1.0, 0.62, 0.32) * uGlow * 30.0 * sat(dot(n, G * inversesqrt(g2)) * 0.9 + 0.1) / (2.0 + g2) * ao;
    // rim: the light behind him outlines the silhouette and his cross
    if (id >= 1) {
      float rim = pow(1.0 - sat(dot(-rd, n)), 4.0) * sat(dot(n, normalize(FL - p)) + 0.3);
      emit += farC * rim * (1.4 * uFar + 0.4 * uGlow);
    }
    col = alb * lig + emit;
    vec3 r = reflect(rd, n);
    col += spec * 0.6 * farC * uFar * pow(sat(dot(r, normalize(FL - p))), 40.0) * 30.0 / (1.0 + d2 * 0.002);
    if (uWordMode > 0.5) col *= 1.0 - 0.7 * sat(wordsSoot(p) * 2.0);
    col = inkWords(col, wordsOn(p), n, rd);
    col = mix(col, fogc, 1.0 - exp(-t * 0.004));
  }
  // light in the air down the passage: the far glow and a haze of dust in it
  float toward = sat(dot(rd, normalize(FL - ro)));
  col += farC * uFar * (0.35 * pow(toward, 60.0) + 0.06 * pow(toward, 6.0)) * sat(depth / 40.0);
  if (uDust > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 5; i++) {
      float tt = (float(i) + jit) * 2.5 + 0.8;
      if (tt > depth) break;
      vec3 q = ro + rd * tt;
      acc += smoothstep(0.82, 0.95, vnoise(vec3(q.x * 2.0, q.y * 2.0 + uTime * 0.3, q.z * 2.0)));
    }
    col += vec3(1.0, 0.8, 0.55) * acc * 0.025 * uDust * (uFar + uGlow);
  }
  return col;
}
`;
