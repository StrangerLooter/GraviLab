/**
 * Hyperbolic Orbital Mechanics & Planetary Flyby Geometry.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 1 & Member 2 Domains.
 */

export interface HyperbolicElements {
  periapsisRadius: number;
  vInfinity: number;
  mu: number;
  eccentricity: number;
  turningAngleRad: number;
  turningAngleDeg: number;
  impactParameter: number;
  semiMajorAxis: number;
  deltaVTheoretical: number;
}

export function computeHyperbolicElements(
  rPeriapsis: number,
  vInfinity: number,
  mu: number
): HyperbolicElements {
  if (mu <= 0) throw new Error("Gravitational parameter mu must be positive");
  if (rPeriapsis <= 0) throw new Error("Periapsis radius must be positive");

  if (vInfinity <= 0) {
    return {
      periapsisRadius: rPeriapsis,
      vInfinity: 0,
      mu,
      eccentricity: 1.0,
      turningAngleRad: Math.PI,
      turningAngleDeg: 180.0,
      impactParameter: 2.0 * rPeriapsis,
      semiMajorAxis: Infinity,
      deltaVTheoretical: 0.0,
    };
  }

  const aChar = mu / (vInfinity * vInfinity);
  const eccentricity = 1.0 + (rPeriapsis * vInfinity * vInfinity) / mu;
  const sinHalfDelta = Math.min(1.0, 1.0 / eccentricity);
  const turningAngleRad = 2.0 * Math.asin(sinHalfDelta);
  const turningAngleDeg = (turningAngleRad * 180.0) / Math.PI;

  const impactParameter = aChar * Math.sqrt(Math.max(0, eccentricity * eccentricity - 1.0));
  const deltaVTheoretical = 2.0 * vInfinity * sinHalfDelta;

  return {
    periapsisRadius: rPeriapsis,
    vInfinity,
    mu,
    eccentricity,
    turningAngleRad,
    turningAngleDeg,
    impactParameter,
    semiMajorAxis: -aChar,
    deltaVTheoretical,
  };
}

export function computePeriapsisFromImpactParameter(
  impactParameter: number,
  vInfinity: number,
  mu: number
): number {
  if (vInfinity <= 0 || mu <= 0) return impactParameter;
  const aChar = mu / (vInfinity * vInfinity);
  const beta = impactParameter / aChar;
  return aChar * (Math.sqrt(1.0 + beta * beta) - 1.0);
}
