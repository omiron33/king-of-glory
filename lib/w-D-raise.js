// Group D: helpers shared by the raising of Adam and Eve (scenes 57, 58). Picture modules import this.
// The set: Adam's sarcophagus on the viewer's left, Eve's on the right, Christ's glory between and a
// little behind, the empty gateway pouring light behind all three (the camera looks +z, toward it).
export const SARC_A = [4.6, 0.0, -36.0], SARC_E = [-4.6, 0.0, -36.0];
export const GLORY_AT = [0.0, 4.4, -33.0];

// Where a figure's raised hand is in the world: the inverse of sdFig()/sdFigure() in the world file
// (feet F = [x, y, z, h], pose = [yaw, lean, arm, kneel]; lean is ignored).
export function handOf(F, pose) {
  const [x, y, z, h] = F, [yaw, , arm, kneel] = pose;
  const s = h / 1.8;
  const m = (a, b) => a + (b - a) * arm;
  const hl = [m(0.33, 0.3), m(0.85, 2.15) - 0.55 * kneel, m(0.12, 0.15)].map((v) => v * s);
  const c = Math.cos(yaw), sn = Math.sin(yaw);
  // GLSL rot(a) * v = (c vx + s vy, -s vx + c vy); its inverse rotates by -a
  return [x + c * hl[0] - sn * hl[2], y + hl[1], z + sn * hl[0] + c * hl[2]];
}

// Split a measured line into rows after its k-th word (for a surface too short for the whole line).
export const rows = (line, k) => [{ ...line, words: line.words.slice(0, k) }, { ...line, words: line.words.slice(k) }];
