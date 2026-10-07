/**
 * Conservation Laws & Numerical Stability Monitoring.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 1: Basic Math & Physics Laws.
 */

import { Vec3, vNorm, vCross } from './vectors';

export function computeSpecificOrbitalEnergy(
  pos: Vec3,
  vel: Vec3,
  mu: number
): number {
  const r = vNorm(pos);
  const v = vNorm(vel);
  if (r === 0) return -Infinity;
  return 0.5 * v * v - mu / r;
}

export function computeSpecificAngularMomentum(
  pos: Vec3,
  vel: Vec3
): Vec3 {
  return vCross(pos, vel);
}

export interface ConservationMetrics {
  energyDriftPct: number;
  angularMomentumDriftPct: number;
  currentEnergy: number;
  initialEnergy: number;
  currentHMagnitude: number;
  initialHMagnitude: number;
}

export function computeConservationMetrics(
  initialEnergy: number,
  currentEnergy: number,
  initialH: Vec3,
  currentH: Vec3
): ConservationMetrics {
  const denomE = Math.abs(initialEnergy) > 1e-12 ? Math.abs(initialEnergy) : 1.0;
  const energyDriftPct = (Math.abs(currentEnergy - initialEnergy) / denomE) * 100.0;

  const h0Mag = vNorm(initialH);
  const hCurrMag = vNorm(currentH);
  const denomH = h0Mag > 1e-12 ? h0Mag : 1.0;
  const hDriftPct = (Math.abs(hCurrMag - h0Mag) / denomH) * 100.0;

  return {
    energyDriftPct,
    angularMomentumDriftPct: hDriftPct,
    currentEnergy,
    initialEnergy,
    currentHMagnitude: hCurrMag,
    initialHMagnitude: h0Mag,
  };
}

export interface StabilityCheckResult {
  hasCollided: boolean;
  isSafe: boolean;
  warnings: string[];
  distToPlanetKm: number;
}

export function checkStabilityAndSafety(
  distToPlanet: number,
  planetRadius: number,
  dt: number,
  speedRel: number
): StabilityCheckResult {
  const warnings: string[] = [];
  const hasCollided = distToPlanet <= planetRadius;

  if (hasCollided) {
    warnings.push(
      `Spacecraft collision detected: distance ${(distToPlanet / 1e3).toFixed(1)} km <= radius ${(planetRadius / 1e3).toFixed(1)} km`
    );
  } else if (distToPlanet < 1.15 * planetRadius) {
    warnings.push(
      `Grazing close approach (< 1.15 Rp): atmospheric entry or collision risk.`
    );
  }

  const stepDisplacement = dt * speedRel;
  if (distToPlanet > 0 && stepDisplacement > 0.25 * distToPlanet) {
    const recommendedDt = Math.max(1.0, (0.05 * distToPlanet) / Math.max(1.0, speedRel));
    warnings.push(
      `Timestep dt=${dt.toFixed(1)}s is large relative to local distance (${(distToPlanet / 1e3).toFixed(1)} km). Recommend dt <= ${recommendedDt.toFixed(1)}s.`
    );
  }

  return {
    hasCollided,
    isSafe: !hasCollided && warnings.length === 0,
    warnings,
    distToPlanetKm: distToPlanet / 1e3,
  };
}
