"""
Reference-Frame Transformations: Heliocentric (S) <-> Planetocentric (S').
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 2: Vector Calculations & Angles.
"""

from typing import Tuple, Dict, Any
import numpy as np

from .state import StateVector


def heliocentric_to_planetocentric(
    sc_state: StateVector,
    planet_state: StateVector
) -> StateVector:
    """
    Transforms state from Heliocentric frame (S) to Planetocentric frame (S'):
    r' = r_sc - r_p
    v' = v_sc - v_p
    """
    r_prime = sc_state.position - planet_state.position
    v_prime = sc_state.velocity - planet_state.velocity
    return StateVector.from_pos_vel(r_prime, v_prime)


def planetocentric_to_heliocentric(
    sc_relative_state: StateVector,
    planet_state: StateVector
) -> StateVector:
    """
    Transforms state from Planetocentric frame (S') back to Heliocentric frame (S):
    r_sc = r' + r_p
    v_sc = v' + v_p
    """
    r_helio = sc_relative_state.position + planet_state.position
    v_helio = sc_relative_state.velocity + planet_state.velocity
    return StateVector.from_pos_vel(r_helio, v_helio)


def compute_relative_velocity(
    sc_velocity: np.ndarray,
    planet_velocity: np.ndarray
) -> np.ndarray:
    """
    Computes hyperbolic excess / relative velocity: v_inf = v_sc - v_planet
    """
    return np.asarray(sc_velocity, dtype=np.float64) - np.asarray(planet_velocity, dtype=np.float64)


def rotate_vector_rodrigues(
    v: np.ndarray,
    axis: np.ndarray,
    angle_rad: float
) -> np.ndarray:
    """
    Rotates vector v around normal axis by angle_rad using Rodrigues' formula:
    v_rot = v*cos(delta) + (axis x v)*sin(delta) + axis*(axis . v)*(1 - cos(delta))
    """
    v = np.asarray(v, dtype=np.float64)
    k = np.asarray(axis, dtype=np.float64)
    k_norm = np.linalg.norm(k)
    if k_norm == 0.0:
        return v
    k = k / k_norm

    cos_a = np.cos(angle_rad)
    sin_a = np.sin(angle_rad)

    return (
        v * cos_a
        + np.cross(k, v) * sin_a
        + k * np.dot(k, v) * (1.0 - cos_a)
    )


def compute_frame_analysis(
    sc_helio_in: StateVector,
    sc_helio_out: StateVector,
    planet_state: StateVector,
    turning_angle_rad: float
) -> Dict[str, Any]:
    """
    Comprehensive comparative analysis between frames S and S'.
    Demonstrates that in S', speed |v_inf| is conserved, while in S,
    the spacecraft gains or loses heliocentric kinetic energy:
    Delta epsilon = v_p . Delta v
    """
    # Relative states in S'
    sc_rel_in = heliocentric_to_planetocentric(sc_helio_in, planet_state)
    sc_rel_out = heliocentric_to_planetocentric(sc_helio_out, planet_state)

    v_inf_in_mag = sc_rel_in.speed
    v_inf_out_mag = sc_rel_out.speed
    planet_speed = planet_state.speed

    # Delta v vectors
    delta_v_vec = sc_helio_out.velocity - sc_helio_in.velocity
    delta_v_mag = float(np.linalg.norm(delta_v_vec))

    # Energy change in heliocentric frame per unit mass:
    delta_energy_helio = 0.5 * (sc_helio_out.speed ** 2 - sc_helio_in.speed ** 2)
    # Predicted energy change from dot product: v_p . Delta v
    delta_energy_dot_product = float(np.dot(planet_state.velocity, delta_v_vec))

    return {
        "v_inf_in_mag": v_inf_in_mag,
        "v_inf_out_mag": v_inf_out_mag,
        "v_inf_ratio": v_inf_out_mag / v_inf_in_mag if v_inf_in_mag > 0 else 1.0,
        "planet_speed": planet_speed,
        "sc_speed_in_helio": sc_helio_in.speed,
        "sc_speed_out_helio": sc_helio_out.speed,
        "delta_v_magnitude": delta_v_mag,
        "delta_v_vector": delta_v_vec.tolist(),
        "delta_energy_helio": delta_energy_helio,
        "delta_energy_dot_product": delta_energy_dot_product,
        "energy_exchange_agreement_error": abs(delta_energy_helio - delta_energy_dot_product),
    }
