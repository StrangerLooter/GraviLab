/**
 * Client-Side NASA JPL Horizons Validation Engine.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 5: Data Validation & Synthesis.
 */

import { ValidationResponse, HorizonsTelemetryPoint } from '../types';
import { HORIZONS_VOYAGER1_DATA } from './datasets';
import { JUPITER_MU } from './constants';
import { integrateRK4 } from './rk4';
import { StateVector6 } from './state';
import { vNorm, vSub } from './vectors';

/**
 * 1D Linear/Hermite interpolation along time axis
 */
function interpolateStateAtTime(
  times: number[],
  states: StateVector6[],
  targetTime: number
): StateVector6 {
  if (times.length === 0) return [0, 0, 0, 0, 0, 0];
  if (targetTime <= times[0]) return [...states[0]];
  if (targetTime >= times[times.length - 1]) return [...states[states.length - 1]];

  // Binary search for interval
  let low = 0;
  let high = times.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (times[mid] === targetTime) return [...states[mid]];
    if (times[mid] < targetTime) low = mid + 1;
    else high = mid - 1;
  }

  const idx = Math.max(0, Math.min(times.length - 2, high));
  const t0 = times[idx];
  const t1 = times[idx + 1];
  const alpha = (targetTime - t0) / (t1 - t0);

  const s0 = states[idx];
  const s1 = states[idx + 1];

  return [
    s0[0] + alpha * (s1[0] - s0[0]),
    s0[1] + alpha * (s1[1] - s0[1]),
    s0[2] + alpha * (s1[2] - s0[2]),
    s0[3] + alpha * (s1[3] - s0[3]),
    s0[4] + alpha * (s1[4] - s0[4]),
    s0[5] + alpha * (s1[5] - s0[5]),
  ];
}

export function runClientValidation(dtSeconds: number = 60.0): ValidationResponse {
  const data = HORIZONS_VOYAGER1_DATA;
  const pts = data.telemetry_points;

  const tStart = pts[0].t_sec;
  const tEnd = pts[pts.length - 1].t_sec;

  const y0: StateVector6 = [
    pts[0].x,
    pts[0].y,
    pts[0].z,
    pts[0].vx,
    pts[0].vy,
    pts[0].vz,
  ];

  const muJ = JUPITER_MU;
  const fFlyby = (t: number, y: StateVector6): StateVector6 => {
    const rx = y[0];
    const ry = y[1];
    const rz = y[2];
    const rMag = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const factor = -muJ / (rMag * rMag * rMag);
    return [
      y[3],
      y[4],
      y[5],
      rx * factor,
      ry * factor,
      rz * factor,
    ];
  };

  const simResult = integrateRK4(y0, [tStart, tEnd], dtSeconds, fFlyby, {
    downsampleFactor: 5,
  });

  const posErrorsPct: number[] = [];
  const velErrorsPct: number[] = [];
  const posDiffsKm: number[] = [];
  const velDiffsMps: number[] = [];
  const pointsComparison: HorizonsTelemetryPoint[] = [];

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const simState = interpolateStateAtTime(simResult.times, simResult.states, p.t_sec);

    const rRef: [number, number, number] = [p.x, p.y, p.z];
    const vRef: [number, number, number] = [p.vx, p.vy, p.vz];
    const rSim: [number, number, number] = [simState[0], simState[1], simState[2]];
    const vSim: [number, number, number] = [simState[3], simState[4], simState[5]];

    const rRefMag = vNorm(rRef);
    const vRefMag = vNorm(vRef);
    const diffR = vNorm(vSub(rSim, rRef));
    const diffV = vNorm(vSub(vSim, vRef));

    const errRPct = rRefMag > 0 ? (diffR / rRefMag) * 100.0 : 0.0;
    const errVPct = vRefMag > 0 ? (diffV / vRefMag) * 100.0 : 0.0;

    posErrorsPct.push(errRPct);
    velErrorsPct.push(errVPct);
    posDiffsKm.push(diffR / 1000.0);
    velDiffsMps.push(diffV);

    pointsComparison.push({
      step: p.step,
      epoch: p.epoch,
      t_sec: p.t_sec,
      t_hours: Number((p.t_sec / 3600.0).toFixed(1)),
      r_ref_km: [Number((p.x / 1000.0).toFixed(1)), Number((p.y / 1000.0).toFixed(1)), Number((p.z / 1000.0).toFixed(1))],
      r_sim_km: [Number((rSim[0] / 1000.0).toFixed(1)), Number((rSim[1] / 1000.0).toFixed(1)), Number((rSim[2] / 1000.0).toFixed(1))],
      v_ref_km_s: [Number((p.vx / 1000.0).toFixed(3)), Number((p.vy / 1000.0).toFixed(3)), Number((p.vz / 1000.0).toFixed(3))],
      v_sim_km_s: [Number((vSim[0] / 1000.0).toFixed(3)), Number((vSim[1] / 1000.0).toFixed(3)), Number((vSim[2] / 1000.0).toFixed(3))],
      distance_ref_km: Number((rRefMag / 1000.0).toFixed(1)),
      distance_sim_km: Number((vNorm(rSim) / 1000.0).toFixed(1)),
      speed_ref_km_s: Number((vRefMag / 1000.0).toFixed(3)),
      speed_sim_km_s: Number((vNorm(vSim) / 1000.0).toFixed(3)),
      position_error_pct: Number(errRPct.toFixed(3)),
      velocity_error_pct: Number(errVPct.toFixed(3)),
      pos_diff_km: Number((diffR / 1000.0).toFixed(1)),
      vel_diff_mps: Number(diffV.toFixed(2)),
    });
  }

  const maxPosErr = Math.max(...posErrorsPct);
  const meanPosErr = posErrorsPct.reduce((a, b) => a + b, 0) / posErrorsPct.length;
  const maxVelErr = Math.max(...velErrorsPct);
  const meanVelErr = velErrorsPct.reduce((a, b) => a + b, 0) / velErrorsPct.length;
  const globalMaxErr = Math.max(maxPosErr, maxVelErr);

  const rmsePos = Math.sqrt(posDiffsKm.reduce((acc, d) => acc + d * d, 0) / posDiffsKm.length);
  const rmseVel = Math.sqrt(velDiffsMps.reduce((acc, d) => acc + d * d, 0) / velDiffsMps.length);

  const targetThresholdPct = 5.0;
  const isValidated = globalMaxErr <= targetThresholdPct;

  const simTrajectoryRender = simResult.times
    .filter((_, idx) => idx % Math.max(1, Math.floor(simResult.times.length / 250)) === 0)
    .map((t, idx) => {
      const s = simResult.states[idx];
      return {
        t_hours: Number((t / 3600.0).toFixed(2)),
        x_km: Number((s[0] / 1000.0).toFixed(1)),
        y_km: Number((s[1] / 1000.0).toFixed(1)),
        z_km: Number((s[2] / 1000.0).toFixed(1)),
        speed_km_s: Number((Math.hypot(s[3], s[4], s[5]) / 1000.0).toFixed(3)),
        distance_km: Number((Math.hypot(s[0], s[1], s[2]) / 1000.0).toFixed(1)),
      };
    });

  return {
    metadata: {
      mission: data.mission,
      target_body: data.target_body,
      encounter_window: data.encounter_window,
      closest_approach_epoch: data.closest_approach_epoch,
      integrator: "Custom RK4 (4th-order Runge-Kutta in TypeScript)",
      dt_seconds: dtSeconds,
      data_source: data.source,
    },
    summary: {
      max_position_error_pct: Number(maxPosErr.toFixed(3)),
      mean_position_error_pct: Number(meanPosErr.toFixed(3)),
      max_velocity_error_pct: Number(maxVelErr.toFixed(3)),
      mean_velocity_error_pct: Number(meanVelErr.toFixed(3)),
      global_max_error_pct: Number(globalMaxErr.toFixed(3)),
      target_threshold_pct: targetThresholdPct,
      is_validated: isValidated,
      status_badge: isValidated ? "VALIDATED (< 5%)" : "THRESHOLD EXCEEDED",
      rmse_position_km: Number(rmsePos.toFixed(2)),
      rmse_velocity_mps: Number(rmseVel.toFixed(2)),
    },
    points: pointsComparison,
    sim_trajectory: simTrajectoryRender,
  };
}
