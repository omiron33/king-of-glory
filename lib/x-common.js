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
