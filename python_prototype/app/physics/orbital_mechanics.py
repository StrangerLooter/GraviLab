"""
Hyperbolic Orbital Mechanics & Planetary Flyby Geometry.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 1: Basic Math & Physics Laws & Member 2: Turning Angle Derivation.
"""

from typing import Dict, Any
import numpy as np


def compute_hyperbolic_elements(
    r_periapsis: float,
    v_infinity: float,
    mu: float
) -> Dict[str, float]:
    """
    Computes analytical hyperbolic orbital elements for a planetary flyby:
    - Eccentricity: e = 1 + (rp * v_inf^2) / mu
    - Turning/deflection angle: delta = 2 * arcsin(1 / e)
    - Impact parameter: b = (mu / v_inf^2) * sqrt(e^2 - 1)
    - Semi-major axis: a = - mu / (v_inf^2)
    - Maximum theoretical Delta V: delta_v = 2 * v_inf * sin(delta / 2) = 2 * v_inf / e
    """
    if mu <= 0.0:
        raise ValueError("Gravitational parameter mu must be strictly positive.")
    if r_periapsis <= 0.0:
        raise ValueError("Periapsis distance rp must be strictly positive.")
    if v_infinity < 0.0:
        raise ValueError("Hyperbolic excess speed v_infinity cannot be negative.")

    # Characteristic length: a_char = mu / v_inf^2
    if v_infinity == 0.0:
        # Parabolic limit
        e = 1.0
        delta_rad = np.pi
        b = 2.0 * r_periapsis
        delta_v = 0.0
        a = float('inf')
    else:
        a_char = mu / (v_infinity ** 2)
        e = 1.0 + (r_periapsis * (v_infinity ** 2)) / mu
        # Since e > 1 for hyperbolic trajectories:
        sin_half_delta = 1.0 / e
        delta_rad = 2.0 * np.arcsin(min(1.0, sin_half_delta))
        b = a_char * np.sqrt(max(0.0, e ** 2 - 1.0))
        delta_v = 2.0 * v_infinity * sin_half_delta
        a = -a_char

    delta_deg = float(np.degrees(delta_rad))

    return {
        "periapsis_radius": float(r_periapsis),
        "v_infinity": float(v_infinity),
        "mu": float(mu),
        "eccentricity": float(e),
        "turning_angle_rad": float(delta_rad),
        "turning_angle_deg": delta_deg,
        "impact_parameter": float(b),
        "semi_major_axis": float(a),
        "delta_v_theoretical": float(delta_v),
    }


def compute_periapsis_from_impact_parameter(
    impact_parameter: float,
    v_infinity: float,
    mu: float
) -> float:
    """
    Inverts the impact parameter equation to find the periapsis radius:
    b^2 = rp^2 + 2*mu*rp / v_inf^2
    rp = (mu / v_inf^2) * (sqrt(1 + (b * v_inf^2 / mu)^2) - 1)
    """
    if v_infinity <= 0.0 or mu <= 0.0:
        return impact_parameter

    a_char = mu / (v_infinity ** 2)
    beta = impact_parameter / a_char
    rp = a_char * (np.sqrt(1.0 + beta ** 2) - 1.0)
    return float(rp)
