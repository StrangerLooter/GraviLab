/**
 * Client-Side Simulation Engine.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Executes full numerical simulation directly inside the user's browser.
 */

import { SimulationRequest, SimulationResponse, TrajectoryPoint, FlybyMetrics, ConservationSummary } from '../types';
import { PLANET_CATALOG } from './constants';
import { KeplerianCelestialBody } from './gravity';
import { integrateRK4 } from './rk4';
import { StateVector6, createState } from './state';
import { vNorm } from './vectors';
import { computeHyperbolicElements } from './orbitalMechanics';
import { heliocentricToPlanetocentric, planetocentricToHeliocentric, computeFrameAnalysis } from './referenceFrames';
import { computeSpecificOrbitalEnergy, computeSpecificAngularMomentum, computeConservationMetrics, checkStabilityAndSafety } from './conservation';

export function runClientSimulation(req: SimulationRequest): SimulationResponse {
  const planetKey = req.planet_id.charAt(0).toUpperCase() + req.planet_id.slice(1).toLowerCase();
  const planetInfo = PLANET_CATALOG[planetKey] || PLANET_CATALOG.Jupiter;

  const planet = new KeplerianCelestialBody({
    name: planetInfo.name,
    mass: planetInfo.mass,
    radius: planetInfo.radius,
    mu: planetInfo.mu,
    semiMajorAxis: planetInfo.semiMajorAxis,
    orbitalPeriod: planetInfo.orbitalPeriod,
  });

  const planetMu = planet.mu;
  const planetRadius = planet.radius;

  // Convert inputs (km -> m, km/s -> m/s)
  const r0: [number, number, number] = [
    req.initial_position_km[0] * 1000.0,
    req.initial_position_km[1] * 1000.0,
    req.initial_position_km[2] * 1000.0,
  ];
  const v0: [number, number, number] = [
    req.initial_velocity_km_s[0] * 1000.0,
    req.initial_velocity_km_s[1] * 1000.0,
    req.initial_velocity_km_s[2] * 1000.0,
  ];

  const durationSec = Math.max(60.0, req.duration_days * 86400.0);
  const dtSec = Math.max(1.0, req.dt_seconds);

  const { pos: planetPos0, vel: planetVel0 } = planet.getStateAtTime(0.0);
  const planetState0 = createState(planetPos0, planetVel0);

  let y0: StateVector6;
  if (req.frame === "heliocentric") {
    const scHelio0 = createState(r0, v0);
    y0 = heliocentricToPlanetocentric(scHelio0, planetState0);
  } else {
    y0 = createState(r0, v0);
  }

  // Planetocentric ODE: a = - (mu_p / |r|^3) * r
  const fFlyby = (t: number, y: StateVector6): StateVector6 => {
    const rx = y[0];
    const ry = y[1];
    const rz = y[2];
    const rMag = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const factor = -planetMu / (rMag * rMag * rMag);
    return [
      y[3],
      y[4],
      y[5],
      rx * factor,
      ry * factor,
      rz * factor,
    ];
  };

  const simResult = integrateRK4(y0, [0.0, durationSec], dtSec, fFlyby, {
    downsampleFactor: req.downsample_factor,
  });

  const times = simResult.times;
  const states = simResult.states;

  let minDistance = Infinity;
  let periapsisTimeSec = 0.0;
  const allWarnings: string[] = [];
  let hasCollided = false;

  const trajectoryPoints: TrajectoryPoint[] = [];

  const initialEnergy = computeSpecificOrbitalEnergy([states[0][0], states[0][1], states[0][2]], [states[0][3], states[0][4], states[0][5]], planetMu);
  const initialH = computeSpecificAngularMomentum([states[0][0], states[0][1], states[0][2]], [states[0][3], states[0][4], states[0][5]]);
  let finalEnergy = initialEnergy;
  let finalH = initialH;

  const targetCount = 350;
  const stride = Math.max(1, Math.floor(times.length / targetCount));

  for (let i = 0; i < times.length; i += stride) {
    const t_i = times[i];
    const s_i = states[i];
    const r_i: [number, number, number] = [s_i[0], s_i[1], s_i[2]];
    const v_i: [number, number, number] = [s_i[3], s_i[4], s_i[5]];
    const dist_i = vNorm(r_i);
    const speed_i = vNorm(v_i);

    if (dist_i < minDistance) {
      minDistance = dist_i;
      periapsisTimeSec = t_i;
    }

    if (!hasCollided) {
      const stab = checkStabilityAndSafety(dist_i, planetRadius, dtSec, speed_i);
      if (stab.hasCollided) hasCollided = true;
      for (const w of stab.warnings) {
        if (!allWarnings.includes(w)) allWarnings.push(w);
      }
    }

    const specE = computeSpecificOrbitalEnergy(r_i, v_i, planetMu);
    const hVec = computeSpecificAngularMomentum(r_i, v_i);
    const hMag = vNorm(hVec);

    if (i === times.length - 1 || i + stride >= times.length) {
      finalEnergy = specE;
      finalH = hVec;
    }

    const { pos: pPosI } = planet.getStateAtTime(t_i);
    const scHelioPos: [number, number, number] = [r_i[0] + pPosI[0], r_i[1] + pPosI[1], r_i[2] + pPosI[2]];
    const distSunAu = vNorm(scHelioPos) / 1.495978707e11;

    trajectoryPoints.push({
      t_sec: t_i,
      t_hours: Number((t_i / 3600.0).toFixed(2)),
      t_days: Number((t_i / 86400.0).toFixed(3)),
      x_km: Number((r_i[0] / 1000.0).toFixed(1)),
      y_km: Number((r_i[1] / 1000.0).toFixed(1)),
      z_km: Number((r_i[2] / 1000.0).toFixed(1)),
      vx_km_s: Number((v_i[0] / 1000.0).toFixed(3)),
      vy_km_s: Number((v_i[1] / 1000.0).toFixed(3)),
      vz_km_s: Number((v_i[2] / 1000.0).toFixed(3)),
      speed_km_s: Number((speed_i / 1000.0).toFixed(3)),
      distance_to_planet_km: Number((dist_i / 1000.0).toFixed(1)),
      distance_to_sun_au: Number(distSunAu.toFixed(4)),
      specific_energy: Number(specE.toFixed(1)),
      h_mag: Number(hMag.toFixed(1)),
    });
  }

  const vInfIn = vNorm([states[0][3], states[0][4], states[0][5]]);
  const vInfOut = vNorm([states[states.length - 1][3], states[states.length - 1][4], states[states.length - 1][5]]);

  const hyp = computeHyperbolicElements(
    Math.max(1000.0, minDistance),
    vInfIn,
    planetMu
  );

  const { pos: pPosEnd, vel: pVelEnd } = planet.getStateAtTime(times[times.length - 1]);
  const planetStateEnd = createState(pPosEnd, pVelEnd);

  const scHelioIn = planetocentricToHeliocentric(createState([states[0][0], states[0][1], states[0][2]], [states[0][3], states[0][4], states[0][5]]), planetState0);
  const scHelioOut = planetocentricToHeliocentric(createState([states[states.length - 1][0], states[states.length - 1][1], states[states.length - 1][2]], [states[states.length - 1][3], states[states.length - 1][4], states[states.length - 1][5]]), planetStateEnd);

  const frameRes = computeFrameAnalysis(scHelioIn, scHelioOut, planetState0, hyp.turningAngleRad);
  const consMetrics = computeConservationMetrics(initialEnergy, finalEnergy, initialH, finalH);

  const metrics: FlybyMetrics = {
    periapsis_km: Number((minDistance / 1000.0).toFixed(1)),
    periapsis_radii: Number((minDistance / planetRadius).toFixed(2)),
    v_infinity_in_km_s: Number((vInfIn / 1000.0).toFixed(3)),
    v_infinity_out_km_s: Number((vInfOut / 1000.0).toFixed(3)),
    eccentricity: Number(hyp.eccentricity.toFixed(4)),
    turning_angle_deg: Number(hyp.turningAngleDeg.toFixed(2)),
    delta_v_km_s: Number((frameRes.deltaVMagnitude / 1000.0).toFixed(3)),
    delta_energy_helio_mj_kg: Number((frameRes.deltaEnergyHelio / 1e6).toFixed(3)),
    closest_approach_time_hours: Number((periapsisTimeSec / 3600.0).toFixed(2)),
  };

  const conservation: ConservationSummary = {
    initial_energy: Number(initialEnergy.toFixed(1)),
    final_energy: Number(finalEnergy.toFixed(1)),
    energy_drift_pct: Number(consMetrics.energyDriftPct.toFixed(4)),
    initial_h_mag: Number(consMetrics.initialHMagnitude.toFixed(1)),
    final_h_mag: Number(consMetrics.currentHMagnitude.toFixed(1)),
    angular_momentum_drift_pct: Number(consMetrics.angularMomentumDriftPct.toFixed(4)),
    has_collided: hasCollided,
    is_numerically_stable: !simResult.terminatedEarly && consMetrics.energyDriftPct < 2.0,
    warnings: allWarnings,
  };

  const sLast = states[states.length - 1];

  return {
    status: hasCollided ? "Collision Detected" : "Success",
    planet: {
      name: planet.name,
      radius_km: Number((planet.radius / 1000.0).toFixed(1)),
      mass_kg: planet.mass,
      mu: planet.mu,
      orbital_speed_km_s: Number((vNorm(planetVel0) / 1000.0).toFixed(2)),
    },
    initial_state: {
      position_km: [Number((states[0][0] / 1000.0).toFixed(1)), Number((states[0][1] / 1000.0).toFixed(1)), Number((states[0][2] / 1000.0).toFixed(1))],
      velocity_km_s: [Number((states[0][3] / 1000.0).toFixed(3)), Number((states[0][4] / 1000.0).toFixed(3)), Number((states[0][5] / 1000.0).toFixed(3))],
      speed_km_s: Number((vInfIn / 1000.0).toFixed(3)),
    },
    final_state: {
      position_km: [Number((sLast[0] / 1000.0).toFixed(1)), Number((sLast[1] / 1000.0).toFixed(1)), Number((sLast[2] / 1000.0).toFixed(1))],
      velocity_km_s: [Number((sLast[3] / 1000.0).toFixed(3)), Number((sLast[4] / 1000.0).toFixed(3)), Number((sLast[5] / 1000.0).toFixed(3))],
      speed_km_s: Number((vInfOut / 1000.0).toFixed(3)),
    },
    metrics,
    conservation,
    trajectory_sample_count: trajectoryPoints.length,
    trajectory: trajectoryPoints,
  };
}
