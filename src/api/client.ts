/**
 * Client-Side Computational Gateway & Local Data Dispatcher.
 * 100% Client-Side In-Browser Execution for Vercel Deployment.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 */

import { Planet, Preset, SimulationRequest, SimulationResponse, ConvergenceResponse, ValidationResponse } from '../types';
import { PLANETS_DATA, PRESETS_DATA } from '../physics/datasets';
import { runClientSimulation } from '../physics/simulationEngine';
import { runClientValidation } from '../physics/validationEngine';
import { computeConvergenceStudy } from '../physics/rk4';
import { PLANET_CATALOG } from '../physics/constants';
import { StateVector6 } from '../physics/state';

export async function fetchPlanets(): Promise<Planet[]> {
  // Directly returns embedded planetary dataset for instant 0ms latency & offline reliability
  return PLANETS_DATA;
}

export async function fetchPresets(): Promise<Preset[]> {
  // Directly returns mission presets
  return PRESETS_DATA;
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  // 100% Client-Side Custom RK4 numerical simulation in browser
  return runClientSimulation(req);
}

export async function runConvergenceStudy(params: {
  planet_id: string;
  base_dt_seconds: number;
  duration_hours: number;
  initial_position_km: [number, number, number];
  initial_velocity_km_s: [number, number, number];
}): Promise<ConvergenceResponse> {
  const planetKey = params.planet_id.charAt(0).toUpperCase() + params.planet_id.slice(1).toLowerCase();
  const planetInfo = PLANET_CATALOG[planetKey] || PLANET_CATALOG.Jupiter;
  const planetMu = planetInfo.mu;

  const r0: [number, number, number] = [
    params.initial_position_km[0] * 1000.0,
    params.initial_position_km[1] * 1000.0,
    params.initial_position_km[2] * 1000.0,
  ];
  const v0: [number, number, number] = [
    params.initial_velocity_km_s[0] * 1000.0,
    params.initial_velocity_km_s[1] * 1000.0,
    params.initial_velocity_km_s[2] * 1000.0,
  ];
  const y0: StateVector6 = [r0[0], r0[1], r0[2], v0[0], v0[1], v0[2]];

  const durationSec = params.duration_hours * 3600.0;
  const baseDt = Math.max(2.0, params.base_dt_seconds);

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

  const study = computeConvergenceStudy(y0, [0.0, durationSec], baseDt, fFlyby);

  const times = study.solDt.times;
  const stride = Math.max(1, Math.floor(times.length / 100));

  const timesHours = times.filter((_, i) => i % stride === 0).map((t) => Number((t / 3600.0).toFixed(2)));
  const speedsDt = study.solDt.speeds.filter((_, i) => i % stride === 0).map((v) => Number((v / 1000.0).toFixed(3)));
  const speedsHalf = study.solHalf.speeds.filter((_, i) => i % stride === 0).map((v) => Number((v / 1000.0).toFixed(3)));
  const speedsQuarter = study.solQuarter.speeds.filter((_, i) => i % stride === 0).map((v) => Number((v / 1000.0).toFixed(3)));

  return {
    dt_base: Number(study.dtBase.toFixed(2)),
    dt_half: Number(study.dtHalf.toFixed(2)),
    dt_quarter: Number(study.dtQuarter.toFixed(2)),
    diff_dt_vs_dthalf_km: Number((study.diffDtVsDtHalf / 1000.0).toFixed(4)),
    diff_dthalf_vs_dtquarter_km: Number((study.diffDtHalfVsDtQuarter / 1000.0).toFixed(4)),
    ratio_e1_e2: Number(study.ratioE1E2.toFixed(2)),
    estimated_order_p: Number(study.estimatedOrderP.toFixed(2)),
    is_converging: study.isConverging,
    times_hours: timesHours,
    speeds_dt_km_s: speedsDt,
    speeds_half_km_s: speedsHalf,
    speeds_quarter_km_s: speedsQuarter,
  };
}

export async function fetchVoyager1Validation(dt_seconds: number = 60.0): Promise<ValidationResponse> {
  // 100% Client-Side NASA JPL Horizons validation in browser
  return runClientValidation(dt_seconds);
}
