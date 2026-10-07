/**
 * 3D Vector Calculus & Linear Algebra Utilities.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 2: Vector Calculations & Angles.
 */

export type Vec3 = [number, number, number];

export function vAdd(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function vSub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vScale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function vDot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vCross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function vNormSq(v: Vec3): number {
  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

export function vNorm(v: Vec3): number {
  return Math.sqrt(vNormSq(v));
}

export function vNormalize(v: Vec3): Vec3 {
  const n = vNorm(v);
  if (n === 0) return [0, 0, 0];
  return [v[0] / n, v[1] / n, v[2] / n];
}

export function vDist(a: Vec3, b: Vec3): number {
  return vNorm(vSub(a, b));
}

/**
 * Rotates vector v around unit axis by angleRad using Rodrigues' rotation formula:
 * v_rot = v*cos(θ) + (axis × v)*sin(θ) + axis*(axis · v)*(1 - cos(θ))
 */
export function vRotateRodrigues(v: Vec3, axis: Vec3, angleRad: number): Vec3 {
  const k = vNormalize(axis);
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const dotKV = vDot(k, v);
  const crossKV = vCross(k, v);

  return [
    v[0] * cosA + crossKV[0] * sinA + k[0] * dotKV * (1 - cosA),
    v[1] * cosA + crossKV[1] * sinA + k[1] * dotKV * (1 - cosA),
    v[2] * cosA + crossKV[2] * sinA + k[2] * dotKV * (1 - cosA),
  ];
}
