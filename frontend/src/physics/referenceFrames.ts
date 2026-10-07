/**
 * Reference-Frame Transformations: Heliocentric (S) <-> Planetocentric (S').
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 2: Vector Calculations & Angles.
 */

import { StateVector6, getPosition, getVelocity, createState } from './state';
import { Vec3, vSub, vAdd, vNorm, vDot } from './vectors';

export function heliocentricToPlanetocentric(
  scHelio: StateVector6,
  planetHelio: StateVector6
): StateVector6 {
  const rPrime = vSub(getPosition(scHelio), getPosition(planetHelio));
  const vPrime = vSub(getVelocity(scHelio), getVelocity(planetHelio));
  return createState(rPrime, vPrime);
}

export function planetocentricToHeliocentric(
  scRel: StateVector6,
  planetHelio: StateVector6
): StateVector6 {
  const rHelio = vAdd(getPosition(scRel), getPosition(planetHelio));
  const vHelio = vAdd(getVelocity(scRel), getVelocity(planetHelio));
  return createState(rHelio, vHelio);
}

export function computeRelativeVelocity(scVel: Vec3, planetVel: Vec3): Vec3 {
  return vSub(scVel, planetVel);
}

export interface FrameAnalysisResult {
  vInfInMag: number;
  vInfOutMag: number;
  vInfRatio: number;
  planetSpeed: number;
  scSpeedInHelio: number;
  scSpeedOutHelio: number;
  deltaVMagnitude: number;
  deltaVVector: Vec3;
  deltaEnergyHelio: number;
  deltaEnergyDotProduct: number;
  energyAgreementError: number;
}

/**
 * Proves that in S', |v_inf| is conserved, while in S:
 * Delta epsilon = v_p · Delta v
 */
export function computeFrameAnalysis(
  scHelioIn: StateVector6,
  scHelioOut: StateVector6,
  planetState: StateVector6,
  turningAngleRad: number
): FrameAnalysisResult {
  const scRelIn = heliocentricToPlanetocentric(scHelioIn, planetState);
  const scRelOut = heliocentricToPlanetocentric(scHelioOut, planetState);

  const vInfInMag = vNorm(getVelocity(scRelIn));
  const vInfOutMag = vNorm(getVelocity(scRelOut));
  const planetVel = getVelocity(planetState);
  const planetSpeed = vNorm(planetVel);

  const scVelIn = getVelocity(scHelioIn);
  const scVelOut = getVelocity(scHelioOut);

  const deltaVVec: Vec3 = vSub(scVelOut, scVelIn);
  const deltaVMag = vNorm(deltaVVec);

  const scSpeedIn = vNorm(scVelIn);
  const scSpeedOut = vNorm(scVelOut);

  // Delta energy per unit mass in Sun frame S:
  const deltaEnergyHelio = 0.5 * (scSpeedOut * scSpeedOut - scSpeedIn * scSpeedIn);
  // Theoretical prediction: v_p · Delta v
  const deltaEnergyDotProduct = vDot(planetVel, deltaVVec);

  return {
    vInfInMag,
    vInfOutMag,
    vInfRatio: vInfInMag > 0 ? vInfOutMag / vInfInMag : 1.0,
    planetSpeed,
    scSpeedInHelio: scSpeedIn,
    scSpeedOutHelio: scSpeedOut,
    deltaVMagnitude: deltaVMag,
    deltaVVector: deltaVVec,
    deltaEnergyHelio,
    deltaEnergyDotProduct,
    energyAgreementError: Math.abs(deltaEnergyHelio - deltaEnergyDotProduct),
  };
}
