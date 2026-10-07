"""
Error Metrics & Statistical Validation Engine.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 5: Data Validation & Synthesis.
"""

from typing import Dict, Any, List, Union
import numpy as np


def compute_relative_vector_error_pct(
    sim_vec: np.ndarray,
    ref_vec: np.ndarray
) -> float:
    """
    Relative percentage error: |sim - ref| / |ref| * 100%
    """
    ref_norm = float(np.linalg.norm(ref_vec))
    if ref_norm < 1e-12:
        return 0.0
    diff_norm = float(np.linalg.norm(sim_vec - ref_vec))
    return (diff_norm / ref_norm) * 100.0


def compute_rmse(differences: np.ndarray) -> float:
    """
    Computes Root Mean Square Error: sqrt(mean(diff^2))
    """
    diffs = np.asarray(differences, dtype=np.float64)
    return float(np.sqrt(np.mean(diffs ** 2)))


def calculate_validation_summary(
    pos_errors_pct: List[float],
    vel_errors_pct: List[float],
    pos_diffs_km: List[float],
    vel_diffs_mps: List[float],
    target_threshold_pct: float = 5.0
) -> Dict[str, Any]:
    """
    Synthesizes overall comparative metrics, validating against the 5% SMART threshold.
    """
    pos_err_arr = np.array(pos_errors_pct, dtype=np.float64)
    vel_err_arr = np.array(vel_errors_pct, dtype=np.float64)

    max_pos_err = float(np.max(pos_err_arr)) if len(pos_err_arr) > 0 else 0.0
    mean_pos_err = float(np.mean(pos_err_arr)) if len(pos_err_arr) > 0 else 0.0
    max_vel_err = float(np.max(vel_err_arr)) if len(vel_err_arr) > 0 else 0.0
    mean_vel_err = float(np.mean(vel_err_arr)) if len(vel_err_arr) > 0 else 0.0

    global_max_err = max(max_pos_err, max_vel_err)
    is_validated = global_max_err <= target_threshold_pct

    rmse_pos_km = compute_rmse(np.array(pos_diffs_km))
    rmse_vel_mps = compute_rmse(np.array(vel_diffs_mps))

    return {
        "max_position_error_pct": round(max_pos_err, 3),
        "mean_position_error_pct": round(mean_pos_err, 3),
        "max_velocity_error_pct": round(max_vel_err, 3),
        "mean_velocity_error_pct": round(mean_vel_err, 3),
        "global_max_error_pct": round(global_max_err, 3),
        "target_threshold_pct": target_threshold_pct,
        "is_validated": is_validated,
        "status_badge": "VALIDATED (< 5%)" if is_validated else "THRESHOLD EXCEEDED",
        "rmse_position_km": round(rmse_pos_km, 2),
        "rmse_velocity_mps": round(rmse_vel_mps, 2),
    }
