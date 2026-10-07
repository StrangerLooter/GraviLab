"""
Unit tests for reference-frame transformations (S <-> S').
Member 2: Vector Calculations & Angles.
"""

import numpy as np
import pytest
from app.physics.state import StateVector
from app.physics.reference_frames import (
    heliocentric_to_planetocentric,
    planetocentric_to_heliocentric,
    compute_relative_velocity,
    rotate_vector_rodrigues,
    compute_frame_analysis,
)


def test_reference_frame_round_trip():
    """Transforming heliocentric -> planetocentric -> heliocentric must recover original state."""
    sc_state = StateVector(x=1.5e11, y=2.0e11, z=5.0e8, vx=15000.0, vy=-22000.0, vz=450.0)
    planet_state = StateVector(x=1.49e11, y=1.98e11, z=0.0, vx=13000.0, vy=-24000.0, vz=0.0)

    # Heliocentric to Planetocentric
    rel_state = heliocentric_to_planetocentric(sc_state, planet_state)

    # Back to Heliocentric
    recovered_state = planetocentric_to_heliocentric(rel_state, planet_state)

    assert np.allclose(sc_state.to_numpy(), recovered_state.to_numpy(), atol=1e-12)


def test_relative_velocity_definition():
    """v_rel = v_sc - v_p."""
    v_sc = np.array([30000.0, 10000.0, -500.0])
    v_p = np.array([13000.0, 5000.0, 0.0])
    v_rel = compute_relative_velocity(v_sc, v_p)
    assert np.allclose(v_rel, [17000.0, 5000.0, -500.0])


def test_rodrigues_rotation_preserves_magnitude():
    """Rotation around normal vector must strictly preserve vector norm."""
    v_in = np.array([8500.0, -4200.0, 1100.0])
    axis = np.array([0.0, 0.0, 1.0])
    angle = np.radians(65.4)

    v_out = rotate_vector_rodrigues(v_in, axis, angle)
    norm_in = np.linalg.norm(v_in)
    norm_out = np.linalg.norm(v_out)

    assert pytest.approx(norm_in, rel=1e-12) == norm_out


def test_frame_energy_transfer_relation():
    """In S, Delta energy per unit mass = v_p . Delta v."""
    planet = StateVector(x=7.78e11, y=0.0, z=0.0, vx=0.0, vy=13070.0, vz=0.0)
    v_inf = 10000.0

    # Incoming state in helio frame (sc approaching from -x)
    sc_in = StateVector(x=7.77e11, y=-1e9, z=0.0, vx=v_inf, vy=13070.0, vz=0.0)
    # Deflected in planet frame by 90 degrees: from +x direction to +y direction
    sc_out = StateVector(x=7.79e11, y=1e9, z=0.0, vx=0.0, vy=13070.0 + v_inf, vz=0.0)

    analysis = compute_frame_analysis(sc_in, sc_out, planet, turning_angle_rad=np.pi/2)

    # Speed in S' must be preserved
    assert pytest.approx(analysis["v_inf_in_mag"], rel=1e-7) == analysis["v_inf_out_mag"]
    # Energy exchange formula: Delta E = v_p . Delta v
    assert analysis["energy_exchange_agreement_error"] < 1e-4
    # Heliocentric speed must have increased
    assert analysis["sc_speed_out_helio"] > analysis["sc_speed_in_helio"]
