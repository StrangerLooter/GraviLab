"""
Conservation Laws & Error Metrics for 2-Body / N-Body Orbital Mechanics.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 1: Basic Math & Physics Laws.
"""

from typing import Dict, Any, Union
import numpy as np


def compute_specific_orbital_energy(
    position: Union[np.ndarray, list],
    velocity: Union[np.ndarray, list],
    mu: float
) -> float:
    """
    Computes specific orbital energy epsilon = (v^2 / 2) - (mu / r) [J/kg or m^2/s^2].
    """
    r_vec = np.asarray(position, dtype=np.float64)
    v_vec = np.asarray(velocity, dtype=np.float64)

    r = float(np.linalg.norm(r_vec))
    v = float(np.linalg.norm(v_vec))

    if r == 0.0:
        return float('-inf')

    return float(0.5 * (v ** 2) - (mu / r))


def compute_specific_angular_momentum(
    position: Union[np.ndarray, list],
    velocity: Union[np.ndarray, list]
) -> np.ndarray:
    """
    Computes specific angular momentum vector h = r x v [m^2/s].
    """
    r_vec = np.asarray(position, dtype=np.float64)
    v_vec = np.asarray(velocity, dtype=np.float64)
    return np.cross(r_vec, v_vec)


def compute_conservation_metrics(
    initial_energy: float,
    current_energy: float,
    initial_h: np.ndarray,
    current_h: np.ndarray
) -> Dict[str, float]:
    """
    Computes percentage drift in specific orbital energy and angular momentum.
    """
    denom_e = abs(initial_energy) if abs(initial_energy) > 1e-12 else 1.0
    energy_relative_error_pct = (abs(current_energy - initial_energy) / denom_e) * 100.0

    h0_mag = float(np.linalg.norm(initial_h))
    h_current_mag = float(np.linalg.norm(current_h))
    denom_h = h0_mag if h0_mag > 1e-12 else 1.0
    h_relative_error_pct = (abs(h_current_mag - h0_mag) / denom_h) * 100.0

    return {
        "energy_drift_pct": float(energy_relative_error_pct),
        "angular_momentum_drift_pct": float(h_relative_error_pct),
        "current_energy": float(current_energy),
        "initial_energy": float(initial_energy),
        "current_h_magnitude": float(h_current_mag),
        "initial_h_magnitude": float(h0_mag),
    }


def check_stability_and_safety(
    dist_to_planet: float,
    planet_radius: float,
    dt: float,
    speed_rel: float
) -> Dict[str, Any]:
    """
    Evaluates physical safety (collision) and numerical resolution:
    Checks if timestep dt is dangerously large near periapsis:
    e.g. dt * speed > 0.1 * dist_to_planet
    """
    warnings = []
    has_collided = dist_to_planet <= planet_radius

    if has_collided:
        warnings.append(
            f"Spacecraft collision detected: distance {dist_to_planet/1e3:.1f} km <= radius {planet_radius/1e3:.1f} km"
        )
    elif dist_to_planet < 1.15 * planet_radius:
        warnings.append(
            f"Grazing close approach (< 1.15 Rp): atmospheric entry or collision risk."
        )

    # Resolution check: displacement per step vs local distance
    step_displacement = dt * speed_rel
    if dist_to_planet > 0 and step_displacement > 0.25 * dist_to_planet:
        recommended_dt = max(1.0, 0.05 * dist_to_planet / max(1.0, speed_rel))
        warnings.append(
            f"Timestep dt={dt:.1f}s is large relative to local distance ({dist_to_planet/1e3:.1f} km). "
            f"Recommend dt <= {recommended_dt:.1f}s."
        )

    return {
        "has_collided": has_collided,
        "is_safe": not has_collided and len(warnings) == 0,
        "warnings": warnings,
        "dist_to_planet_km": dist_to_planet / 1e3,
    }
