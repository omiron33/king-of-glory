// Group D: walking the garden path (scenes 71, 72). Picture modules import this.
// The path's centre line, as pathD() in w-D-dawn.js draws it, and a figure walking along it.
export const pathX = (z) => {
  const s = Math.min(1, Math.max(0, (z + 2) / -10));
  return 0.9 * Math.sin(-z * 0.06) * s * s * (3 - 2 * s);
};

// A figure that comes out of the tomb door at t0 and walks the path at v m/s, offset dx across it.
// Returns { F: [x, lift, z, h], pose: [yaw, lean, arm, kneel] } for uF0..uF2 (lift: above the ground).
export function walker(t0, v, h, dx = 0, arm = 0.0) {
  return (t) => {
    const s = Math.max(0, t - t0) * v;
    const z = 1.2 - s;
    const step = Math.sin(s * 3.6);
    return { F: [pathX(z) + dx, 0.03 * Math.abs(step), z, h], pose: [Math.PI, 0.06, arm, 0.0] };
  };
}
