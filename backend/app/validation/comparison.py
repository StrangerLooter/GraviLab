"""
Trajectory Comparison: Custom RK4 vs Authentic NASA JPL Horizons Telemetry.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 5: Data Validation & Synthesis.
"""

from typing import Dict, Any, List
import numpy as np
from scipy.interpolate import interp1d

from app.physics.constants import JUPITER_MU
from app.physics.rk4 import rk4_integrate
from app.validation.horizons import load_horizons_dataset, get_horizons_reference_arrays
from app.validation.error_metrics import (
    compute_relative_vector_error_pct,
    calculate_validation_summary,
)


def run_voyager1_horizons_comparison(
    dt_seconds: float = 60.0,
    include_raw_points: bool = True
) -> Dict[str, Any]:
    """
    Runs custom RK4 integration from Voyager 1 initial Horizons state vector,
    interpolates at reference observation epochs, and calculates percentage errors.
    """
    data = load_horizons_dataset()
    ref = get_horizons_reference_arrays()

    times_ref = ref["times"]
    pos_ref = ref["positions"]
    vel_ref = ref["velocities"]
    epochs_ref = ref["epochs"]

    t_start = float(times_ref[0])
    t_end = float(times_ref[-1])

    y0 = np.array([
        pos_ref[0, 0], pos_ref[0, 1], pos_ref[0, 2],
        vel_ref[0, 0], vel_ref[0, 1], vel_ref[0, 2],
    ], dtype=np.float64)

    # Jupiter-centered two-body equations of motion with mu_Jupiter
    # In Jupiter-centered frame, a = -mu_J * r / |r|^3
    mu_j = JUPITER_MU

    def f_flyby(t: float, y: np.ndarray) -> np.ndarray:
        r_vec = y[:3]
        v_vec = y[3:6]
        r_mag = np.linalg.norm(r_vec)
        a_vec = - (mu_j / (r_mag ** 3)) * r_vec
        return np.array([v_vec[0], v_vec[1], v_vec[2], a_vec[0], a_vec[1], a_vec[2]], dtype=np.float64)

    # Integrate with custom RK4
    sim_result = rk4_integrate(
        y0=y0,
        t_span=(t_start, t_end),
        dt=dt_seconds,
        derivative_func=f_flyby,
        downsample_factor=10
    )

    t_sim = sim_result["times"]
    states_sim = sim_result["states"]

    # Interpolate simulation states at reference observation epochs
    pos_sim_interp_func = interp1d(t_sim, states_sim[:, :3], axis=0, kind='cubic', fill_value="extrapolate")
    vel_sim_interp_func = interp1d(t_sim, states_sim[:, 3:6], axis=0, kind='cubic', fill_value="extrapolate")

    pos_sim_eval = pos_sim_interp_func(times_ref)
    vel_sim_eval = vel_sim_interp_func(times_ref)

    # Calculate error series
    pos_errors_pct: List[float] = []
    vel_errors_pct: List[float] = []
    pos_diffs_km: List[float] = []
    vel_diffs_mps: List[float] = []
    points_comparison: List[Dict[str, Any]] = []

    for i in range(len(times_ref)):
        t_val = float(times_ref[i])
        r_ref_i = pos_ref[i]
        v_ref_i = vel_ref[i]
        r_sim_i = pos_sim_eval[i]
        v_sim_i = vel_sim_eval[i]

        err_r_pct = compute_relative_vector_error_pct(r_sim_i, r_ref_i)
        err_v_pct = compute_relative_vector_error_pct(v_sim_i, v_ref_i)

        diff_r_km = float(np.linalg.norm(r_sim_i - r_ref_i)) / 1000.0
        diff_v_mps = float(np.linalg.norm(v_sim_i - v_ref_i))

        pos_errors_pct.append(err_r_pct)
        vel_errors_pct.append(err_v_pct)
        pos_diffs_km.append(diff_r_km)
        vel_diffs_mps.append(diff_v_mps)

        if include_raw_points:
            points_comparison.append({
                "epoch": epochs_ref[i],
                "t_sec": t_val,
                "t_hours": round(t_val / 3600.0, 1),
                "r_ref_km": [round(float(v) / 1000.0, 1) for v in r_ref_i],
                "r_sim_km": [round(float(v) / 1000.0, 1) for v in r_sim_i],
                "v_ref_km_s": [round(float(v) / 1000.0, 3) for v in v_ref_i],
                "v_sim_km_s": [round(float(v) / 1000.0, 3) for v in v_sim_i],
                "distance_ref_km": round(float(np.linalg.norm(r_ref_i)) / 1000.0, 1),
                "distance_sim_km": round(float(np.linalg.norm(r_sim_i)) / 1000.0, 1),
                "speed_ref_km_s": round(float(np.linalg.norm(v_ref_i)) / 1000.0, 3),
                "speed_sim_km_s": round(float(np.linalg.norm(v_sim_i)) / 1000.0, 3),
                "position_error_pct": round(err_r_pct, 3),
                "velocity_error_pct": round(err_v_pct, 3),
                "pos_diff_km": round(diff_r_km, 1),
                "vel_diff_mps": round(diff_v_mps, 2),
            })

    summary = calculate_validation_summary(
        pos_errors_pct=pos_errors_pct,
        vel_errors_pct=vel_errors_pct,
        pos_diffs_km=pos_diffs_km,
        vel_diffs_mps=vel_diffs_mps,
        target_threshold_pct=5.0
    )

    # Subsample simulation trajectory for rendering
    sample_stride = max(1, len(t_sim) // 250)
    sim_trajectory_render = [
        {
            "t_hours": round(float(t_sim[j]) / 3600.0, 2),
            "x_km": round(float(states_sim[j, 0]) / 1000.0, 1),
            "y_km": round(float(states_sim[j, 1]) / 1000.0, 1),
            "z_km": round(float(states_sim[j, 2]) / 1000.0, 1),
            "speed_km_s": round(float(np.linalg.norm(states_sim[j, 3:6])) / 1000.0, 3),
            "distance_km": round(float(np.linalg.norm(states_sim[j, :3])) / 1000.0, 1),
        }
        for j in range(0, len(t_sim), sample_stride)
    ]

    return {
        "metadata": {
            "mission": data["mission"],
            "target_body": data["target_body"],
            "encounter_window": data["encounter_window"],
            "closest_approach_epoch": data["closest_approach_epoch"],
            "integrator": "Custom RK4 (4th-order Runge-Kutta)",
            "dt_seconds": dt_seconds,
            "data_source": data["source"],
        },
        "summary": summary,
        "points": points_comparison,
        "sim_trajectory": sim_trajectory_render,
    }
