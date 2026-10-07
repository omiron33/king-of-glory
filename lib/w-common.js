// GLSL shared by every world in the film: the thin lens and incised lettering.
//
// Lens: lensRay() is a real thin lens. The engine's sub-frame jitter (a low-discrepancy sequence)
// doubles as the aperture sample, rotated per pixel, so depth of field averages out with the
// motion blur. Scenes set uFocus (metres) and uAperture (lens radius, metres) from the camera.
//
// Lettering: the text texture's alpha is the depth of a cut. carveN() bends a surface normal by the
// slope of the cut so the moon or the glory catches one wall of each letter and shades the other.

export const COMMON_GLSL = /* glsl */ `
uniform float uFocus, uAperture;

vec3 lensRay(vec2 fc, out vec3 ro) {
  vec2 p = (2.0 * (fc + uJitter) - uRes) / uRes.y;
  ro = uCamPos;
  vec3 ww = normalize(uCamTarget - uCamPos);
  vec3 up = vec3(sin(uCamRoll), cos(uCamRoll), 0.0);
  vec3 uu = normalize(cross(ww, up)), vv = cross(uu, ww);
  float f = 1.0 / tan(radians(uFov) * 0.5);
  vec3 rd = normalize(p.x * uu + p.y * vv + f * ww);
  if (uAperture > 0.0) {
    vec3 fp = ro + rd * (uFocus / dot(rd, ww));
    vec2 j = uJitter + 0.5;
    float r = sqrt(fract(j.x + 0.37 * hash12(fc * 0.71)));
    float a = 6.2831853 * fract(j.y + hash12(fc + 13.1));
    vec2 d = r * vec2(cos(a), sin(a)) * uAperture;
    ro += uu * d.x + vv * d.y;
    rd = normalize(fp - ro);
  }
  return rd;
}

// Cut depth (0..1) of the lettering at uv, and its slope in uv units.
float carveA(vec2 uv) {
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
  return texture(uText, uv).a;
}
vec3 carve(vec2 uv, vec2 duv) {
  float a = carveA(uv);
  float gx = carveA(uv + vec2(duv.x, 0.0)) - carveA(uv - vec2(duv.x, 0.0));
  float gy = carveA(uv + vec2(0.0, duv.y)) - carveA(uv - vec2(0.0, duv.y));
  return vec3(a, gx, gy);
}
// Bend normal n (with surface axes tu, tv along the texture's u and v) into the walls of a cut.
vec3 carveN(vec3 n, vec3 tu, vec3 tv, vec3 c, float depth) {
  return normalize(n + depth * (c.y * tu + c.z * tv));
}

// Ray-to-segment closest approach: returns (distance, ray t, segment param 0..1).
vec3 rayLine(vec3 ro, vec3 rd, vec3 a, vec3 b) {
  vec3 ba = b - a, oa = ro - a;
  float bb = dot(ba, ba), rb = dot(rd, ba), ro2 = dot(oa, rd), ob = dot(oa, ba);
  float den = bb - rb * rb;
  float s = den > 1e-6 ? clamp((ob - ro2 * rb) / den, 0.0, 1.0) : 0.0;
  float t = max(dot(a + ba * s - ro, rd), 0.0);
  return vec3(length(ro + rd * t - a - ba * s), t, s);
}
`;

// ---------------------------------------------------------------- words on any surface
// The scene's textPlane(t) puts the text texture on a plane in the world (centre uTxC, axes uTxX
// along the text and uTxY up the text, half size uTxHS). wordsOn() returns the cut/ink amount (0..1)
// where a surface point lies within uWordDepth of that plane, so the words only appear on a real
// surface. inkWords() finishes the colour by the scene's style:
//   uWordMode 0: cut into stone, dark (for light surfaces)
//   uWordMode 1: burning/glowing in the surface (for dark surfaces), colour uWordCol
//   uWordMode 2: raised metal catching light, colour uWordCol
export const WORDS_GLSL = /* glsl */ `
uniform float uWordMode, uWordDepth, uWordGlow;
uniform vec3 uWordCol;
float wordsOn(vec3 p) {
  vec3 nn = normalize(cross(uTxX, uTxY));
  vec3 q = p - uTxC;
  if (abs(dot(q, nn)) > uWordDepth) return 0.0;
  vec2 uv = vec2(dot(q, uTxX) / uTxHS.x, dot(q, uTxY) / uTxHS.y) * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
  // full-resolution lookup: on raymarched hits the derivative-picked mip can smear the whole
  // plane; the 64 jittered sub-frames do the anti-aliasing instead
  return textureLod(uText, uv, 0.0).a;
}
vec3 inkWords(vec3 col, float a, vec3 n, vec3 rd) {
  if (a <= 0.001) return col;
  if (uWordMode < 0.5) return col * (1.0 - 0.95 * a);
  if (uWordMode < 1.5) return col * (1.0 - 0.85 * a) + uWordCol * uWordGlow * a;
  float rim = 0.45 + 0.55 * pow(1.0 - abs(dot(n, rd)), 2.0);
  return mix(col, uWordCol * uWordGlow * rim, a);
}
`;
export const WORDS_UNIFORMS = { uWordMode: 1, uWordDepth: 0.08, uWordGlow: 3.0, uWordCol: [1.0, 0.78, 0.45] };

// ---------------------------------------------------------------- figures and the glory
// A robed human figure, stylized: no face, no hands in detail, read as a silhouette with rim light.
// Local frame: feet at the origin, facing +z, height h. lean bends the body forward (radians),
// arm raises the right arm (0 down .. 1 straight up), kneel 0..1 folds it toward the ground.
export const FIGURE_GLSL = /* glsl */ `
float sdFigure(vec3 p, float h, float lean, float arm, float kneel) {
  float s = h / 1.8;
  p /= s;
  p.y += 0.55 * kneel;
  p.yz = rot(-lean) * p.yz;
  // robe: a rounded cone from shoulders to the ground
  float y = clamp(p.y, 0.0, 1.45);
  float rr = mix(0.32, 0.17, y / 1.45);
  float robe = max(length(p.xz * vec2(1.0, 1.25)) - rr, max(-p.y + 0.55 * kneel, p.y - 1.45));
  float sh = sdCapsule(p, vec3(-0.19, 1.42, 0.0), vec3(0.19, 1.42, 0.0), 0.08);
  float head = sdEllipsoid(p - vec3(0.0, 1.63, 0.02), vec3(0.1, 0.125, 0.11));
  vec3 hand = mix(vec3(0.33, 0.85, 0.12), vec3(0.3, 2.15, 0.15), arm);
  float armd = sdCapsule(p, vec3(0.2, 1.38, 0.0), hand, 0.055);
  float d = smin(robe, sh, 0.08);
  d = smin(d, head, 0.05);
  d = min(d, armd);
  return d * s;
}
`;

// The glory: the icon's mandorla round Christ, a white-gold core in graded ultramarine rings with gold
// rays, facing the viewer. G centre, R radius, k brightness. Returns emitted light for the ray.
export const GLORY_GLSL = /* glsl */ `
vec3 gloryLight(vec3 ro, vec3 rd, vec3 G, float R, float k, float depth) {
  float tg = dot(G - ro, rd);
  if (tg < 0.0 || k <= 0.0) return vec3(0.0);
  vec3 q = ro + rd * tg - G;
  // the mandorla is an upright ellipse, taller than wide
  vec3 side = normalize(cross(rd, vec3(0.0, 1.0, 0.0)) + 1e-5);
  vec3 up = cross(side, rd);
  vec2 e = vec2(dot(q, side), dot(q, up)) / R;
  float rho = length(e * vec2(1.25, 0.8));
  float ang = atan(e.y, e.x);
  vec3 c = vec3(0.0);
  float vis = tg < depth ? 1.0 : 0.0;
  if (rho < 1.0) {
    float band = floor(rho * 5.0), f = fract(rho * 5.0);
    vec3 blue = mix(vec3(0.42, 0.62, 1.0), vec3(0.03, 0.08, 0.38), band / 4.0);
    c = blue * (1.0 + 1.6 * (1.0 - rho));
    c += vec3(1.0, 0.8, 0.45) * smoothstep(0.06, 0.0, abs(f - 0.97)) * 1.6;
    float st = step(0.985, hash12(floor(vec2(ang * 30.0, rho * 40.0))));
    c += vec3(1.5, 1.3, 0.9) * st;
    // the figure of light at the centre: a tall robed form, white-gold, with vertical folds; no face
    vec2 f2 = e * vec2(1.0, 1.0);
    float body = smoothstep(0.03, 0.0, length(vec2(f2.x * (1.0 + 0.5 * max(-f2.y, 0.0)), max(abs(f2.y + 0.05) - 0.62, 0.0))) - 0.13 - 0.07 * smoothstep(0.3, -0.6, f2.y));
    float head = smoothstep(0.02, 0.0, length(f2 - vec2(0.0, 0.66)) - 0.075);
    float halo = smoothstep(0.012, 0.0, abs(length(f2 - vec2(0.0, 0.66)) - 0.13)) * 0.8;
    float folds = 0.75 + 0.25 * sin(f2.x * 90.0 + f2.y * 6.0);
    c = mix(c, vec3(5.0, 4.4, 3.3) * folds, max(body, head));
    c += vec3(3.0, 2.2, 1.0) * halo;
    c *= smoothstep(1.0, 0.97, rho);
  }
  float rays = pow(abs(sin(ang * 8.0)), 24.0) + 0.5 * pow(abs(sin(ang * 8.0 + 0.4)), 60.0);
  c += vec3(1.6, 1.1, 0.5) * rays * exp(-max(rho - 0.6, 0.0) * 1.6) * step(0.5, rho);
  c += vec3(1.0, 0.85, 0.65) * 0.5 * exp(-rho * 1.4) + vec3(0.6, 0.7, 1.0) * 0.15 * exp(-rho * 0.35);
  return c * k * vis;
}
`;
