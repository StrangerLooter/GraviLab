/**
 * State Vector Representation & Derivative Formulation.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 3: Python/TypeScript Coding & Numerics.
 */

import { Vec3, vNorm } from './vectors';

export type StateVector6 = [number, number, number, number, number, number];

export function getPosition(state: StateVector6): Vec3 {
  return [state[0], state[1], state[2]];
}

export function getVelocity(state: StateVector6): Vec3 {
  return [state[3], state[4], state[5]];
}

export function getSpeed(state: StateVector6): number {
  return vNorm(getVelocity(state));
}

export function getDistance(state: StateVector6): number {
  return vNorm(getPosition(state));
}

export function createState(pos: Vec3, vel: Vec3): StateVector6 {
  return [pos[0], pos[1], pos[2], vel[0], vel[1], vel[2]];
}

/**
 * Computes dy/dt = [vx, vy, vz, ax, ay, az]
 */
export function computeStateDerivative(state: StateVector6, acceleration: Vec3): StateVector6 {
  return [
    state[3],
    state[4],
    state[5],
    acceleration[0],
    acceleration[1],
    acceleration[2],
  ];
}
