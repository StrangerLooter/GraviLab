"""
Custom Fourth-Order Runge-Kutta (RK4) Numerical Integrator.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 3: Python Coding & Numerics.

DO NOT REPLACE with scipy.integrate.solve_ivp. Hand-crafted RK4 implementation.
"""

from typing import Callable, List, Dict, Any, Tuple, Optional
import numpy as np

from .state import StateVector


DerivativeFunc = Callable[[float, np.ndarray], np.ndarray]


def rk4_step(
    y: np.ndarray,
    t: float,
    dt: float,
    f: DerivativeFunc
) -> np.ndarray:
    """
    Executes a single custom 4th-order Runge-Kutta step:
    k1 = f(t, y)
    k2 = f(t + dt/2, y + (dt/2)*k1)
    k3 = f(t + dt/2, y + (dt/2)*k2)
    k4 = f(t + dt, y + dt*k3)
    y_next = y + (dt/6) * (k1 + 2*k2 + 2*k3 + k4)
    """
    y = np.asarray(y, dtype=np.float64)

    k1 = f(t, y)
    k2 = f(t + 0.5 * dt, y + 0.5 * dt * k1)
    k3 = f(t + 0.5 * dt, y + 0.5 * dt * k2)
    k4 = f(t + dt, y + dt * k3)

    return y + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)


def rk4_integrate(
    y0: np.ndarray,
    t_span: Tuple[float, float],
    dt: float,
    derivative_func: DerivativeFunc,
    max_steps: int = 100000,
    stop_condition: Optional[Callable[[float, np.ndarray], bool]] = None,
    downsample_factor: int = 1
) -> Dict[str, Any]:
    """
    Integrates system of ODEs from t_span[0] to t_span[1] with fixed step dt.
    Returns dictionary with times, states array, steps taken, and exit status.
    """
    t_start, t_end = float(t_span[0]), float(t_span[1])
    dt_mag = abs(dt)
    if dt_mag <= 0.0:
        raise ValueError(f"Step size dt magnitude must be positive, got {dt}")
    if t_start == t_end:
        return {
            "times": np.array([t_start]),
            "states": np.array([y0]),
            "step_count": 0,
            "terminated_early": False,
            "termination_reason": "t_start == t_end",
            "final_time": t_start,
            "final_state": np.asarray(y0),
        }

    direction = 1.0 if t_end > t_start else -1.0
    signed_dt = direction * dt_mag

    t = t_start
    y = np.asarray(y0, dtype=np.float64).copy()

    times: List[float] = [t]
    states: List[np.ndarray] = [y.copy()]

    step_count = 0
    terminated_early = False
    termination_reason = "Completed t_span"

    while ((direction > 0 and t < t_end) or (direction < 0 and t > t_end)) and step_count < max_steps:
        # Avoid overshooting t_end on the last step
        remaining = abs(t_end - t)
        step_dt = direction * min(dt_mag, remaining)
        if abs(step_dt) <= 1e-12:
            break

        y_next = rk4_step(y, t, step_dt, derivative_func)

        # Numerical sanity check
        if np.any(np.isnan(y_next)) or np.any(np.isinf(y_next)):
            terminated_early = True
            termination_reason = "Numerical instability: NaN/Inf detected in state vector"
            break

        y = y_next
        t += step_dt
        step_count += 1

        is_final = (direction > 0 and t >= t_end) or (direction < 0 and t <= t_end)
        if step_count % downsample_factor == 0 or is_final:
            times.append(t)
            states.append(y.copy())

        if stop_condition is not None and stop_condition(t, y):
            terminated_early = True
            termination_reason = "Custom stop condition triggered"
            break

    is_incomplete = (direction > 0 and t < t_end) or (direction < 0 and t > t_end)
    if step_count >= max_steps and is_incomplete:
        terminated_early = True
        termination_reason = f"Max step limit ({max_steps}) reached"

    states_arr = np.array(states, dtype=np.float64)

    return {
        "times": np.array(times, dtype=np.float64),
        "states": states_arr,
        "step_count": step_count,
        "terminated_early": terminated_early,
        "termination_reason": termination_reason,
        "final_time": t,
        "final_state": y,
    }


def compute_convergence_study(
    y0: np.ndarray,
    t_span: Tuple[float, float],
    base_dt: float,
    derivative_func: DerivativeFunc
) -> Dict[str, Any]:
    """
    Evaluates numerical convergence at dt, dt/2, and dt/4.
    Demonstrates the 4th-order accuracy O(dt^4) of the custom RK4 algorithm.
    """
    dt_1 = base_dt
    dt_2 = base_dt / 2.0
    dt_4 = base_dt / 4.0

    sol_1 = rk4_integrate(y0, t_span, dt_1, derivative_func)
    sol_2 = rk4_integrate(y0, t_span, dt_2, derivative_func)
    sol_4 = rk4_integrate(y0, t_span, dt_4, derivative_func)

    # Compare final state positions
    final_pos_1 = sol_1["final_state"][:3]
    final_pos_2 = sol_2["final_state"][:3]
    final_pos_4 = sol_4["final_state"][:3]

    diff_1_2 = float(np.linalg.norm(final_pos_1 - final_pos_2))
    diff_2_4 = float(np.linalg.norm(final_pos_2 - final_pos_4))

    # Empirical order of accuracy: p = log2(E1 / E2)
    order_estimate = 0.0
    if diff_2_4 > 1e-12:
        ratio = diff_1_2 / diff_2_4
        order_estimate = float(np.log2(ratio)) if ratio > 0 else 0.0

    return {
        "dt_base": dt_1,
        "dt_half": dt_2,
        "dt_quarter": dt_4,
        "diff_dt_vs_dthalf": diff_1_2,
        "diff_dthalf_vs_dtquarter": diff_2_4,
        "ratio_e1_e2": (diff_1_2 / diff_2_4) if diff_2_4 > 1e-12 else float('inf'),
        "estimated_order_p": order_estimate,
        "is_converging": diff_2_4 < diff_1_2,
        "sol_dt": {
            "times": sol_1["times"].tolist(),
            "positions": sol_1["states"][:, :3].tolist(),
            "speeds": [float(np.linalg.norm(v)) for v in sol_1["states"][:, 3:6]],
        },
        "sol_half": {
            "times": sol_2["times"].tolist(),
            "positions": sol_2["states"][:, :3].tolist(),
            "speeds": [float(np.linalg.norm(v)) for v in sol_2["states"][:, 3:6]],
        },
        "sol_quarter": {
            "times": sol_4["times"].tolist(),
            "positions": sol_4["states"][:, :3].tolist(),
            "speeds": [float(np.linalg.norm(v)) for v in sol_4["states"][:, 3:6]],
        },
    }
