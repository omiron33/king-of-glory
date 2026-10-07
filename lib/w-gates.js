// The gates of Hades seen from inside (units: metres, y up; Hades is z < 0, the doors' face is z = 0).
// Two doors of brass, 9 m wide and 26 m tall, riveted in a grid of studs and banded with iron;
// a great iron crossbar in brackets bolts them shut; a basalt lintel and jambs hold them in a cliff
// that rises out of sight. The floor is the tops of basalt columns, black and wet. Nothing here has
// ever been lit: a cold, sourceless blue picks out edges. The one warm thing is the seam between
// the doors, a hairline of light from outside (uSeam), which lights the floor and the studs near it.
//
// Text: the crossbar's face carries the title in raised brass (texture rows 0.5..1) and the lintel's
// face the subtitle (rows 0..0.5).

export const GATES_UNIFORMS = { uSeam: 0.3, uDust: 1.0, uCold: 1.0 };

export const GATES_GLSL = /* glsl */ `
uniform float uSeam;   // brightness of the light in the seam
uniform float uDust;   // dust sifting from the lintel
uniform float uCold;   // the sourceless cold light

const float DW = 9.0, DH = 26.0;                 // one door's width, the doors' height
const vec3 BAR_C = vec3(0.0, 11.6, -1.05);      // the crossbar: centre and half size
const vec3 BAR_H = vec3(11.2, 0.75, 0.5);
const vec3 LIN_C = vec3(0.0, 28.6, -1.0);       // the lintel
const vec3 LIN_H = vec3(14.0, 2.6, 1.6);

float sdDoors(vec3 p) {
  // slab of the doors, set 0.25 m back in the frame
  float d = sdBox(p - vec3(0.0, DH * 0.5, 0.6), vec3(DW, DH * 0.5, 0.6));
  // iron bands: four, proud of the face
  float yb = p.y - clamp(floor(p.y / 6.4 + 0.5), 1.0, 4.0) * 6.4 + 1.2;
  float band = sdBox(vec3(p.x, yb, p.z + 0.12), vec3(DW, 0.38, 0.14)) - 0.02;
  // studs in a grid between the bands
  vec2 cell = vec2(1.125, 1.067);
  vec2 q = p.xy - cell * (floor(p.xy / cell) + 0.5);
  float inDoor = step(abs(p.x), DW - 0.3) * step(0.4, p.y) * step(p.y, DH - 0.4);
  float stud = inDoor > 0.5 ? length(vec3(q, p.z + 0.02)) - 0.17 : 1e3;
  // the seam between the doors
  d = max(d, -sdBox(p - vec3(0.0, DH * 0.5, 0.6), vec3(0.025, DH * 0.5 + 1.0, 1.0)));
  return min(d, min(band, stud));
}

float sdFrame(vec3 p) {
  float jamb = sdBox(vec3(abs(p.x) - 11.6, p.y - 16.0, p.z - 0.6), vec3(2.6, 16.0, 2.4));
  float lin = sdBox(p - LIN_C, LIN_H) - 0.05;
  float bar = sdBox(p - BAR_C, BAR_H) - 0.04;
  // brackets holding the bar on the jambs and on each door
  vec3 b = p - BAR_C; b.x = abs(b.x) - 9.6;
  float brk = sdBox(b, vec3(0.5, 1.1, 0.75));
  return min(min(jamb, lin), min(bar, brk));
}

float sdCliff(vec3 p) {
  // the rock the gates are set in: a wall at z = 1.5 with a rough face, everywhere but the gateway
  float rough = 1.4 * fbm(p.xy * 0.06, 4) + 0.35 * fbm(p.xy * 0.4, 3);
  float wall = (1.4 - p.z) + rough;
  float gate = sdBox(p - vec3(0.0, 15.5, 0.0), vec3(14.2, 15.5, 6.0));
  return max(wall, -gate);
}

float colTop(vec2 xz) {
  // columnar basalt: each cell a hexagon-ish column at its own height
  vec2 v = voronoiEdge(xz * 1.5);
  return -0.03 * hash12(floor(xz * 1.5 + 0.5)) - 0.05 * smoothstep(0.1, 0.0, v.x);
}

float sdFloor(vec3 p) {
  return p.y - colTop(p.xz) * smoothstep(-2.0, -4.0, p.z);
}

float mapG(vec3 p, out int id) {
  float d = sdFloor(p); id = 0;
  float dd = sdDoors(p); if (dd < d) { d = dd; id = 1; }
  float df = sdFrame(p); if (df < d) { d = df; id = 2; }
  float dc = sdCliff(p); if (dc < d) { d = dc; id = 3; }
  return d;
}
float mapG(vec3 p) { int i; return mapG(p, i); }

vec3 normG(vec3 p, float t) {
  vec2 e = vec2(0.0015 * max(1.0, t * 0.2), 0.0);
  return normalize(vec3(mapG(p + e.xyy) - mapG(p - e.xyy), mapG(p + e.yxy) - mapG(p - e.yxy), mapG(p + e.yyx) - mapG(p - e.yyx)));
}

float aoG(vec3 p, vec3 n) {
  float o = 0.0, w = 1.0;
  for (int i = 1; i <= 4; i++) { float h = 0.12 * float(i) * float(i); o += w * (h - mapG(p + n * h)); w *= 0.6; }
  return sat(1.0 - 0.9 * o);
}

// The light in the seam, seen as a line source x = 0, z = 0.05, y = 0..DH.
vec3 seamLight(vec3 p, vec3 n) {
  vec3 s = vec3(0.0, clamp(p.y, 0.0, DH), 0.1);
  vec3 l = s - p; float d2 = dot(l, l);
  vec3 L = l * inversesqrt(d2);
  float face = sat(-p.z * 2.0 + 0.3);
  return vec3(1.0, 0.62, 0.32) * uSeam * 60.0 * sat(dot(n, L)) / (1.0 + d2) * face;
}

vec3 coldLight(vec3 n) {
  vec3 key = normalize(vec3(-0.45, 0.75, -0.5));
  return uCold * (vec3(1.5, 1.8, 2.4) * pow(sat(dot(n, key)), 1.5) + vec3(0.06, 0.09, 0.16) * (0.5 + 0.5 * n.y) + vec3(0.03, 0.04, 0.07) * sat(-n.z));
}

// text on the crossbar (title, top half of the texture) and the lintel (subtitle, bottom half)
vec2 barUV(vec3 p) { return vec2((BAR_H.x - p.x) / (2.0 * BAR_H.x), 0.5 + 0.5 * (p.y - BAR_C.y + BAR_H.y) / (2.0 * BAR_H.y)); }
vec2 linUV(vec3 p) { float v = (p.y - 27.0) / 1.6; return v < 0.0 || v > 1.0 ? vec2(-1.0) : vec2((12.0 - p.x) / 24.0, 0.5 * v); }

vec3 shadeGates(vec3 ro, vec3 rd, float jit, out float depth) {
  float t = 0.2; int id = -1;
  for (int i = 0; i < 200; i++) {
    vec3 p = ro + rd * t;
    int k; float h = mapG(p, k);
    if (h < 0.0007 * t) { id = k; break; }
    t += h * 0.8;
    if (t > 260.0) break;
  }
  vec3 fogc = vec3(0.012, 0.016, 0.026);
  vec3 col = fogc;
  depth = t;
  if (id >= 0) {
    vec3 p = ro + rd * t;
    vec3 n = normG(p, t);
    float ao = aoG(p, n);
    vec3 alb; float spec = 0.0, rough = 0.5; float emit = 0.0;
    if (id == 0) {        // wet basalt
      float g = fbm(p.xz * 2.3, 4);
      alb = vec3(0.045, 0.047, 0.055) * (0.6 + 0.8 * g);
      spec = 0.55 * smoothstep(0.35, 0.7, fbm(p.xz * 0.35 + 3.0, 3)); rough = 0.12;
    } else if (id == 1) { // brass, dark with age, bright where worn
      float wear = 0.65 * fbm(p.xy * vec2(0.9, 0.25), 4) + 0.35 * fbm(p.xy * 6.0, 3);
      alb = mix(vec3(0.20, 0.12, 0.05), vec3(0.55, 0.37, 0.15), smoothstep(0.3, 0.75, wear));
      bool iron = p.z < -0.02 && abs(p.y - clamp(floor(p.y / 6.4 + 0.5), 1.0, 4.0) * 6.4 + 1.2) < 0.42;
      if (iron) { alb = vec3(0.03, 0.03, 0.032) * (0.7 + 0.6 * fbm(p.xy * 6.0, 3)); rough = 0.45; spec = 0.25; }
      else { spec = 0.6; rough = 0.3; }
    } else if (id == 2) { // iron bar, brackets; basalt lintel and jambs
      bool bar = sdBox(p - BAR_C, BAR_H + 0.08) < 0.01 && abs(p.x) < BAR_H.x + 0.05;
      bool lin = p.y > 25.9;
      if (bar) { alb = vec3(0.035, 0.032, 0.03) * (0.7 + 0.6 * fbm(p.xy * 5.0, 3)); spec = 0.3; rough = 0.4; }
      else if (lin) { alb = vec3(0.06, 0.06, 0.068) * (0.7 + 0.6 * fbm(p.xy * 3.0, 4)); spec = 0.15; rough = 0.5; }
      else { alb = vec3(0.05, 0.05, 0.056) * (0.7 + 0.6 * fbm(p.xy * 2.0, 4)); spec = 0.1; rough = 0.6; }
      // raised brass letters on the front faces of the bar and the lintel
      if (bar && n.z < -0.7) {
        vec3 c = carve(barUV(p), vec2(0.0006, 0.004));
        if (c.x > 0.02) {
          n = carveN(n, vec3(1, 0, 0), vec3(0, 1, 0), -c, 1.6);
          alb = mix(alb, vec3(0.62, 0.42, 0.16), smoothstep(0.1, 0.6, c.x)); spec = mix(spec, 0.9, c.x); rough = mix(rough, 0.2, c.x);
        }
      }
      if (lin && n.z < -0.7) {
        vec3 c = carve(linUV(p), vec2(0.0005, 0.004));
        if (c.x > 0.02) {
          n = carveN(n, vec3(1, 0, 0), vec3(0, 1, 0), -c, 1.6);
          alb = mix(alb, vec3(0.62, 0.42, 0.16), smoothstep(0.1, 0.6, c.x)); spec = mix(spec, 0.9, c.x); rough = mix(rough, 0.2, c.x);
        }
      }
    } else {              // cliff rock
      alb = vec3(0.04, 0.042, 0.05) * (0.6 + 0.8 * fbm(p.xy * 0.8, 4));
      rough = 0.7;
    }
    // light: the cold sourceless blue, and the seam
    vec3 Ls = seamLight(p, n);
    col = alb * (coldLight(n) * ao + Ls);
    // specular: the seam reflected (a glint on brass studs, a streak on the wet floor), the cold key
    vec3 r = reflect(rd, n);
    vec3 sp = vec3(0.0, clamp(p.y + r.y * 6.0, 0.0, DH), 0.1) - p;
    float al = dot(normalize(sp), r);
    float sh = pow(sat(al), mix(8.0, 400.0, 1.0 - rough));
    col += spec * vec3(1.0, 0.6, 0.3) * uSeam * sh * 3.0 / (1.0 + 0.02 * dot(sp, sp)) * sat(-p.z * 2.0 + 0.3);
    col += spec * uCold * vec3(0.25, 0.3, 0.42) * pow(sat(dot(r, normalize(vec3(-0.45, 0.75, -0.5)))), mix(6.0, 120.0, 1.0 - rough)) * ao;
    // the seam itself
    if (id == 1) col += vec3(1.0, 0.7, 0.4) * uSeam * 40.0 * exp(-abs(p.x) / 0.02) * step(p.y, DH) * step(0.0, -p.z + 0.4);
    // the slit throws a line of warm light along the floor into Hades, widening and fading as it goes
    if (id == 0 && p.z < 0.0) {
      float w = 0.06 + 0.035 * -p.z;
      col += vec3(1.0, 0.6, 0.3) * uSeam * 3.0 * exp(-p.x * p.x / (w * w)) / (1.0 + 0.04 * -p.z) * (0.6 + 0.4 * spec);
    }
    col = mix(col, fogc, 1.0 - exp(-t * 0.006));
  }
  // the sheet of light through the slit, lit haze in the plane x = 0
  if (abs(rd.x) > 1e-4) {
    float tx = -ro.x / rd.x;
    if (tx > 0.0 && tx < depth) {
      vec3 q = ro + rd * tx;
      float inS = step(q.z, 0.0) * smoothstep(DH, DH - 3.0, q.y) * step(0.0, q.y);
      float spread = abs(q.y - clamp(q.y, 0.0, DH));
      col += vec3(1.0, 0.6, 0.3) * uSeam * inS * 0.35 * exp(q.z * 0.05) * (0.6 + 0.4 * fbm(vec2(q.z * 0.3, q.y * 0.4 - uTime * 0.2), 3)) / max(abs(rd.x), 0.08) * 0.08;
    }
  }
  // light scattered in the air round the seam
  vec3 sl = rayLine(ro, rd, vec3(0.0, 0.0, -0.05), vec3(0.0, DH, -0.05));
  float occl = sl.y < depth + 0.5 ? 1.0 : 0.0;
  col += vec3(1.0, 0.6, 0.3) * uSeam * occl * (0.5 * exp(-sl.x * 2.5) + 0.06 * exp(-sl.x * 0.25));
  // dust sifting down from the lintel through that light
  if (uDust > 0.0) {
    float acc = 0.0;
    for (int i = 0; i < 6; i++) {
      float tz = (-0.6 - 2.6 * (float(i) + jit) / 6.0 - ro.z) / rd.z;   // planes z = -0.6 .. -3.2
      if (tz <= 0.0 || tz > depth) continue;
      vec3 q = ro + rd * tz;
      float fall = q.y + uTime * 1.6;
      float dn = smoothstep(0.55, 0.85, vnoise(vec3(q.x * 2.2, fall * 0.35, q.z * 2.0)));
      dn *= smoothstep(4.5, 0.0, abs(q.x)) * smoothstep(DH + 1.0, DH - 6.0, q.y) * smoothstep(0.0, 4.0, q.y);
      acc += dn * (0.25 + 1.5 * exp(-abs(q.x) * 1.2));
    }
    col += vec3(1.0, 0.65, 0.38) * acc * uSeam * uDust * 0.05;
  }
  return col;
}
`;
