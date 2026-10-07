/**
 * Newtonian Gravitational Acceleration & Multi-Body Mechanics.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 1: Basic Math & Physics Laws.
 */

import { Vec3, vSub, vNorm, vScale, vAdd } from './vectors';
import { SUN_MU } from './constants';

export interface CelestialBodyModel {
  name: string;
  mass: number;
  radius: number;
  mu: number;
  semiMajorAxis?: number;
  orbitalPeriod?: number;
  initialPhase?: number;
  getStateAtTime(t: number): { pos: Vec3; vel: Vec3 };
}

export class KeplerianCelestialBody implements CelestialBodyModel {
  name: string;
  mass: number;
  radius: number;
  mu: number;
  semiMajorAxis: number;
  orbitalPeriod: number;
  initialPhase: number;
  centralBodyMu: number;

  constructor(params: {
    name: string;
    mass: number;
    radius: number;
    mu: number;
    semiMajorAxis?: number;
    orbitalPeriod?: number;
    initialPhase?: number;
    centralBodyMu?: number;
  }) {
    this.name = params.name;
    this.mass = params.mass;
    this.radius = params.radius;
    this.mu = params.mu;
    this.semiMajorAxis = params.semiMajorAxis || 0;
    this.orbitalPeriod = params.orbitalPeriod || 0;
    this.initialPhase = params.initialPhase || 0;
    this.centralBodyMu = params.centralBodyMu || SUN_MU;
  }

  getStateAtTime(t: number): { pos: Vec3; vel: Vec3 } {
    if (this.semiMajorAxis <= 0) {
      return { pos: [0, 0, 0], vel: [0, 0, 0] };
    }

    const omega = Math.sqrt(this.centralBodyMu / Math.pow(this.semiMajorAxis, 3));
    const theta = this.initialPhase + omega * t;
    const r = this.semiMajorAxis;

    const pos: Vec3 = [r * Math.cos(theta), r * Math.sin(theta), 0];
    const vel: Vec3 = [-r * omega * Math.sin(theta), r * omega * Math.cos(theta), 0];
    return { pos, vel };
  }
}

/**
 * Computes direct 2-body Newtonian gravitational acceleration:
 * a = - (mu / |r|^3) * r
 */
export function twoBodyAcceleration(pos: Vec3, mu: number): Vec3 {
  const r = vNorm(pos);
  if (r === 0 || mu === 0) return [0, 0, 0];
  const factor = -mu / Math.pow(r, 3);
  return [pos[0] * factor, pos[1] * factor, pos[2] * factor];
}

/**
 * Computes total gravitational acceleration from N celestial bodies:
 * a = sum_i ( -mu_i * (r_sc - r_i) / |r_sc - r_i|^3 )
 */
export function computeGravitationalAcceleration(
  scPos: Vec3,
  bodies: CelestialBodyModel[],
  t: number = 0,
  eps: number = 1e-3
): Vec3 {
  let totalAcc: Vec3 = [0, 0, 0];

  for (const body of bodies) {
    const { pos: bodyPos } = body.getStateAtTime(t);
    const relVec = vSub(scPos, bodyPos);
    const dist = vNorm(relVec);

    if (dist < eps || body.mu === 0) continue;

    const distCubed = Math.pow(dist * dist + eps * eps, 1.5);
    const factor = -body.mu / distCubed;
    const accI = vScale(relVec, factor);
    totalAcc = vAdd(totalAcc, accI);
  }

  return totalAcc;
}
