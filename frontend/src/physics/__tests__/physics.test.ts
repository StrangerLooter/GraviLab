/**
 * Automated TypeScript Physics & Numerical Tests.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 */

import assert from 'node:assert';
import test, { describe, it } from 'node:test';

import { SUN_MU, AU, JUPITER_MU, JUPITER_RADIUS, PLANET_CATALOG } from '../constants.ts';
import { vNorm, vAdd, vSub, vDot, vCross, vRotateRodrigues } from '../vectors.ts';
import { createState, getPosition, getVelocity, computeStateDerivative } from '../state.ts';
import { KeplerianCelestialBody, twoBodyAcceleration, computeGravitationalAcceleration } from '../gravity.ts';
import { rk4Step, integrateRK4, computeConvergenceStudy } from '../rk4.ts';
import { heliocentricToPlanetocentric, planetocentricToHeliocentric, computeFrameAnalysis } from '../referenceFrames.ts';
import { computeHyperbolicElements, computePeriapsisFromImpactParameter } from '../orbitalMechanics.ts';
import { computeSpecificOrbitalEnergy, computeSpecificAngularMomentum, computeConservationMetrics } from '../conservation.ts';
import { runClientSimulation } from '../simulationEngine.ts';
import { runClientValidation } from '../validationEngine.ts';

describe('1. Gravitational Acceleration & Celestial Dynamics', () => {
  it('should compute zero acceleration when no bodies exist', () => {
    const acc = computeGravitationalAcceleration([1e11, 2e11, 0], []);
    assert.strictEqual(acc[0], 0);
    assert.strictEqual(acc[1], 0);
    assert.strictEqual(acc[2], 0);
  });

  it('should satisfy inverse-square law (4x reduction at 2x distance)', () => {
    const sun = new KeplerianCelestialBody({ name: 'Sun', mass: 1.98847e30, radius: 6.96e8, mu: SUN_MU });
    const acc1 = computeGravitationalAcceleration([1.0 * AU, 0, 0], [sun]);
    const acc2 = computeGravitationalAcceleration([2.0 * AU, 0, 0], [sun]);

    const mag1 = vNorm(acc1);
    const mag2 = vNorm(acc2);
    const ratio = mag1 / mag2;
    assert.ok(Math.abs(ratio - 4.0) < 1e-4, `Expected ratio ~ 4.0, got ${ratio}`);
  });

  it('should accurately calculate Keplerian orbital speed sqrt(mu / r)', () => {
    const earth = new KeplerianCelestialBody({
      name: 'Earth',
      mass: PLANET_CATALOG.Earth.mass,
      radius: PLANET_CATALOG.Earth.radius,
      mu: PLANET_CATALOG.Earth.mu,
      semiMajorAxis: AU,
      centralBodyMu: SUN_MU,
    });
    const { vel } = earth.getStateAtTime(0);
    const speed = vNorm(vel);
    const expectedSpeed = Math.sqrt(SUN_MU / AU);
    assert.ok(Math.abs((speed - expectedSpeed) / expectedSpeed) < 1e-3);
  });
});

describe('2. Custom RK4 Numerical Integrator', () => {
  it('should preserve constant velocity under zero acceleration', () => {
    const fZero = (t: number, y: any): any => [y[3], y[4], y[5], 0, 0, 0];
    const y0: [number, number, number, number, number, number] = [100, 200, 300, 10, -20, 5];
    const res = integrateRK4(y0, [0, 100], 5.0, fZero);

    const expectedX = 100 + 10 * 100;
    const expectedY = 200 + (-20) * 100;
    const expectedZ = 300 + 5 * 100;

    assert.ok(Math.abs(res.finalState[0] - expectedX) < 1e-8);
    assert.ok(Math.abs(res.finalState[1] - expectedY) < 1e-8);
    assert.ok(Math.abs(res.finalState[2] - expectedZ) < 1e-8);
  });

  it('should solve harmonic oscillator with high analytical accuracy', () => {
    const omega = (2.0 * Math.PI) / 10.0; // Period = 10s
    const fOsc = (t: number, y: any): any => [y[3], 0, 0, -omega * omega * y[0], 0, 0];
    const y0: [number, number, number, number, number, number] = [1.0, 0, 0, 0, 0, 0];
    const res = integrateRK4(y0, [0, 10.0], 0.1, fOsc);

    // At t=10s, x should be cos(2*pi) = 1.0
    assert.ok(Math.abs(res.finalState[0] - 1.0) < 1e-4);
  });

  it('should verify 4th-order Richardson convergence O(dt^4)', () => {
    const fOsc = (t: number, y: any): any => [y[3], 0, 0, -y[0], 0, 0];
    const y0: [number, number, number, number, number, number] = [1.0, 0, 0, 0, 0, 0];
    const study = computeConvergenceStudy(y0, [0, 5.0], 0.4, fOsc);

    assert.strictEqual(study.isConverging, true);
    assert.ok(study.ratioE1E2 > 10.0, `Ratio was ${study.ratioE1E2}`);
    assert.ok(study.estimatedOrderP >= 3.2 && study.estimatedOrderP <= 4.5, `Order p was ${study.estimatedOrderP}`);
  });
});

describe('3. Reference Frame Transformations (S <-> S\')', () => {
  it('should recover original state through round-trip transformation S -> S\' -> S', () => {
    const sc = createState([1.5e11, 2.0e11, 5e8], [15000, -22000, 450]);
    const planet = createState([1.49e11, 1.98e11, 0], [13000, -24000, 0]);

    const scRel = heliocentricToPlanetocentric(sc, planet);
    const scRecovered = planetocentricToHeliocentric(scRel, planet);

    for (let i = 0; i < 6; i++) {
      assert.ok(Math.abs(sc[i] - scRecovered[i]) < 1e-10);
    }
  });

  it('should demonstrate energy transfer relation: Delta energy = v_p · Delta v', () => {
    const planet = createState([7.78e11, 0, 0], [0, 13070, 0]);
    const vInf = 10000;
    const scIn = createState([7.77e11, -1e9, 0], [vInf, 13070, 0]);
    const scOut = createState([7.79e11, 1e9, 0], [0, 13070 + vInf, 0]);

    const analysis = computeFrameAnalysis(scIn, scOut, planet, Math.PI / 2);
    assert.ok(Math.abs(analysis.vInfInMag - analysis.vInfOutMag) < 1e-4);
    assert.ok(analysis.energyAgreementError < 1e-4);
    assert.ok(analysis.scSpeedOutHelio > analysis.scSpeedInHelio);
  });
});

describe('4. Hyperbolic Orbital Mechanics & Flyby Geometry', () => {
  it('should correctly calculate analytical e=sqrt(2) yielding turning angle = 90 deg', () => {
    const mu = 1.0e14;
    const vInf = 5000;
    const rp = (Math.sqrt(2.0) - 1.0) * mu / (vInf * vInf);

    const elem = computeHyperbolicElements(rp, vInf, mu);
    assert.ok(Math.abs(elem.eccentricity - Math.sqrt(2)) < 1e-5);
    assert.ok(Math.abs(elem.turningAngleDeg - 90.0) < 1e-5);
  });

  it('should invert impact parameter b back to periapsis rp', () => {
    const mu = JUPITER_MU;
    const vInf = 14100;
    const rpOrig = 4.0 * JUPITER_RADIUS;

    const elem = computeHyperbolicElements(rpOrig, vInf, mu);
    const rpRec = computePeriapsisFromImpactParameter(elem.impactParameter, vInf, mu);
    assert.ok(Math.abs((rpRec - rpOrig) / rpOrig) < 1e-6);
  });
});

describe('5. Conservation Laws & Stability', () => {
  it('should compute zero drift when energy and angular momentum are unchanged', () => {
    const metrics = computeConservationMetrics(-5e8, -5e8, [0, 0, 1e15], [0, 0, 1e15]);
    assert.strictEqual(metrics.energyDriftPct, 0);
    assert.strictEqual(metrics.angularMomentumDriftPct, 0);
  });
});

describe('6. NASA JPL Horizons Telemetry Validation Benchmark', () => {
  it('CRITICAL SMART OBJECTIVE: Relative error must be strictly under 5.0%', () => {
    const res = runClientValidation(60.0);
    const summary = res.summary;

    assert.strictEqual(summary.is_validated, true);
    assert.ok(summary.global_max_error_pct < 5.0, `Error exceeded 5%: ${summary.global_max_error_pct}%`);
    assert.strictEqual(summary.status_badge, "VALIDATED (< 5%)");
    assert.ok(summary.mean_position_error_pct < 3.0);
    assert.ok(summary.mean_velocity_error_pct < 2.5);
    assert.strictEqual(res.points.length, 19);
  });
});
