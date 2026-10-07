/**
 * Custom Fourth-Order Runge-Kutta (RK4) Numerical Integrator.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 3: Python/TypeScript Coding & Numerics.
 *
 * Direct implementation of RK4 algorithm without third-party ODE libraries.
 */

import { StateVector6 } from './state';
import { vNorm } from './vectors';

export type DerivativeFunc = (t: number, y: StateVector6) => StateVector6;

/**
 * Executes a single 4th-order Runge-Kutta step:
 * k1 = f(t, y)
 * k2 = f(t + dt/2, y + (dt/2)*k1)
 * k3 = f(t + dt/2, y + (dt/2)*k2)
 * k4 = f(t + dt, y + dt*k3)
 * y_next = y + (dt/6)*(k1 + 2*k2 + 2*k3 + k4)
 */
export function rk4Step(
  y: StateVector6,
  t: number,
  dt: number,
  f: DerivativeFunc
): StateVector6 {
  const k1 = f(t, y);

  const y_k1: StateVector6 = [
    y[0] + 0.5 * dt * k1[0],
    y[1] + 0.5 * dt * k1[1],
    y[2] + 0.5 * dt * k1[2],
    y[3] + 0.5 * dt * k1[3],
    y[4] + 0.5 * dt * k1[4],
    y[5] + 0.5 * dt * k1[5],
  ];
  const k2 = f(t + 0.5 * dt, y_k1);

  const y_k2: StateVector6 = [
    y[0] + 0.5 * dt * k2[0],
    y[1] + 0.5 * dt * k2[1],
    y[2] + 0.5 * dt * k2[2],
    y[3] + 0.5 * dt * k2[3],
    y[4] + 0.5 * dt * k2[4],
    y[5] + 0.5 * dt * k2[5],
  ];
  const k3 = f(t + 0.5 * dt, y_k2);

  const y_k3: StateVector6 = [
    y[0] + dt * k3[0],
    y[1] + dt * k3[1],
    y[2] + dt * k3[2],
    y[3] + dt * k3[3],
    y[4] + dt * k3[4],
    y[5] + dt * k3[5],
  ];
  const k4 = f(t + dt, y_k3);

  const sixth = dt / 6.0;
  return [
    y[0] + sixth * (k1[0] + 2.0 * k2[0] + 2.0 * k3[0] + k4[0]),
    y[1] + sixth * (k1[1] + 2.0 * k2[1] + 2.0 * k3[1] + k4[1]),
    y[2] + sixth * (k1[2] + 2.0 * k2[2] + 2.0 * k3[2] + k4[2]),
    y[3] + sixth * (k1[3] + 2.0 * k2[3] + 2.0 * k3[3] + k4[3]),
    y[4] + sixth * (k1[4] + 2.0 * k2[4] + 2.0 * k3[4] + k4[4]),
    y[5] + sixth * (k1[5] + 2.0 * k2[5] + 2.0 * k3[5] + k4[5]),
  ];
}

export interface IntegrationResult {
  times: number[];
  states: StateVector6[];
  stepCount: number;
  terminatedEarly: boolean;
  terminationReason: string;
  finalTime: number;
  finalState: StateVector6;
}

/**
 * Integrates ODE system across tSpan with fixed step size dt.
 * Supports forward and backward integration.
 */
export function integrateRK4(
  y0: StateVector6,
  tSpan: [number, number],
  dt: number,
  f: DerivativeFunc,
  options?: {
    maxSteps?: number;
    downsampleFactor?: number;
    stopCondition?: (t: number, y: StateVector6) => boolean;
  }
): IntegrationResult {
  const tStart = tSpan[0];
  const tEnd = tSpan[1];
  const dtMag = Math.abs(dt);
  const maxSteps = options?.maxSteps || 150000;
  const downsample = Math.max(1, options?.downsampleFactor || 1);

  if (dtMag <= 0) {
    throw new Error(`Integration step size dt must be non-zero.`);
  }

  if (tStart === tEnd) {
    return {
      times: [tStart],
      states: [[...y0]],
      stepCount: 0,
      terminatedEarly: false,
      terminationReason: "tStart == tEnd",
      finalTime: tStart,
      finalState: [...y0],
    };
  }

  const direction = tEnd > tStart ? 1.0 : -1.0;
  let t = tStart;
  let y: StateVector6 = [...y0];

  const times: number[] = [t];
  const states: StateVector6[] = [[...y]];

  let stepCount = 0;
  let terminatedEarly = false;
  let terminationReason = "Completed tSpan";

  while (
    ((direction > 0 && t < tEnd) || (direction < 0 && t > tEnd)) &&
    stepCount < maxSteps
  ) {
    const remaining = Math.abs(tEnd - t);
    const stepDt = direction * Math.min(dtMag, remaining);
    if (Math.abs(stepDt) <= 1e-12) break;

    const yNext = rk4Step(y, t, stepDt, f);

    // Sanity check for NaN/Inf
    let hasNaN = false;
    for (let i = 0; i < 6; i++) {
      if (isNaN(yNext[i]) || !isFinite(yNext[i])) {
        hasNaN = true;
        break;
      }
    }

    if (hasNaN) {
      terminatedEarly = true;
      terminationReason = "Numerical instability: NaN/Inf detected";
      break;
    }

    y = yNext;
    t += stepDt;
    stepCount++;

    const isFinal =
      (direction > 0 && t >= tEnd) || (direction < 0 && t <= tEnd);
    if (stepCount % downsample === 0 || isFinal) {
      times.push(t);
      states.push([...y]);
    }

    if (options?.stopCondition && options.stopCondition(t, y)) {
      terminatedEarly = true;
      terminationReason = "Stop condition triggered";
      break;
    }
  }

  const isIncomplete =
    (direction > 0 && t < tEnd) || (direction < 0 && t > tEnd);
  if (stepCount >= maxSteps && isIncomplete) {
    terminatedEarly = true;
    terminationReason = `Max step limit (${maxSteps}) reached`;
  }

  return {
    times,
    states,
    stepCount,
    terminatedEarly,
    terminationReason,
    finalTime: t,
    finalState: y,
  };
}

export interface ConvergenceStudyResult {
  dtBase: number;
  dtHalf: number;
  dtQuarter: number;
  diffDtVsDtHalf: number;
  diffDtHalfVsDtQuarter: number;
  ratioE1E2: number;
  estimatedOrderP: number;
  isConverging: boolean;
  solDt: { times: number[]; speeds: number[] };
  solHalf: { times: number[]; speeds: number[] };
  solQuarter: { times: number[]; speeds: number[] };
}

/**
 * Runs convergence study at dt, dt/2, and dt/4 to verify 4th-order global truncation O(dt^4).
 */
export function computeConvergenceStudy(
  y0: StateVector6,
  tSpan: [number, number],
  baseDt: number,
  f: DerivativeFunc
): ConvergenceStudyResult {
  const dt1 = baseDt;
  const dt2 = baseDt / 2.0;
  const dt4 = baseDt / 4.0;

  const sol1 = integrateRK4(y0, tSpan, dt1, f);
  const sol2 = integrateRK4(y0, tSpan, dt2, f);
  const sol4 = integrateRK4(y0, tSpan, dt4, f);

  // Position difference at final state
  const p1 = [sol1.finalState[0], sol1.finalState[1], sol1.finalState[2]] as [number, number, number];
  const p2 = [sol2.finalState[0], sol2.finalState[1], sol2.finalState[2]] as [number, number, number];
  const p4 = [sol4.finalState[0], sol4.finalState[1], sol4.finalState[2]] as [number, number, number];

  const diff12 = Math.hypot(p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]);
  const diff24 = Math.hypot(p2[0] - p4[0], p2[1] - p4[1], p2[2] - p4[2]);

  let orderEstimate = 0.0;
  if (diff24 > 1e-12) {
    const ratio = diff12 / diff24;
    orderEstimate = ratio > 0 ? Math.log2(ratio) : 0.0;
  }

  const toSpeedArray = (states: StateVector6[]) =>
    states.map((s) => Math.hypot(s[3], s[4], s[5]));

  return {
    dtBase: dt1,
    dtHalf: dt2,
    dtQuarter: dt4,
    diffDtVsDtHalf: diff12,
    diffDtHalfVsDtQuarter: diff24,
    ratioE1E2: diff24 > 1e-12 ? diff12 / diff24 : 16.0,
    estimatedOrderP: orderEstimate,
    isConverging: diff24 < diff12,
    solDt: { times: sol1.times, speeds: toSpeedArray(sol1.states) },
    solHalf: { times: sol2.times, speeds: toSpeedArray(sol2.states) },
    solQuarter: { times: sol4.times, speeds: toSpeedArray(sol4.states) },
  };
}
