"""
Unit tests for conservation laws and numerical stability checks.
"""

import numpy as np
import pytest
from app.physics.conservation import (
    compute_specific_orbital_energy,
    compute_specific_angular_momentum,
    compute_conservation_metrics,
    check_stability_and_safety,
)
from app.physics.constants import SUN_MU, AU


def test_specific_orbital_energy():
    """Circular orbit at 1 AU has specific energy = -mu / (2*r)."""
    r = AU
    v_circ = np.sqrt(SUN_MU / r)
    energy = compute_specific_orbital_energy(
        position=np.array([r, 0.0, 0.0]),
        velocity=np.array([0.0, v_circ, 0.0]),
        mu=SUN_MU,
    )
    expected_energy = -SUN_MU / (2.0 * r)
    assert pytest.approx(energy, rel=1e-7) == expected_energy


def test_specific_angular_momentum():
    """Specific angular momentum h = r x v is perpendicular to orbital plane."""
    r = np.array([AU, 0.0, 0.0])
    v = np.array([0.0, 29780.0, 0.0])
    h = compute_specific_angular_momentum(r, v)
    assert np.allclose(h[:2], [0.0, 0.0])
    assert pytest.approx(h[2], rel=1e-5) == AU * 29780.0


def test_conservation_metrics_drift():
    """When energy is constant, drift percentage should be 0.0%."""
    metrics = compute_conservation_metrics(
        initial_energy=-5.0e8,
        current_energy=-5.0e8,
        initial_h=np.array([0.0, 0.0, 1.2e15]),
        current_h=np.array([0.0, 0.0, 1.2e15]),
    )
    assert metrics["energy_drift_pct"] == 0.0
    assert metrics["angular_momentum_drift_pct"] == 0.0


def test_stability_and_collision_detection():
    """Safety check flags collisions and grazing encounters."""
    planet_radius = 7.0e7  # 70,000 km

    # Collided
    res_collided = check_stability_and_safety(
        dist_to_planet=6.5e7,
        planet_radius=planet_radius,
        dt=100.0,
        speed_rel=15000.0,
    )
    assert res_collided["has_collided"] is True
    assert not res_collided["is_safe"]

    # Safe flyby at 4 planetary radii
    res_safe = check_stability_and_safety(
        dist_to_planet=2.8e8,
        planet_radius=planet_radius,
        dt=10.0,
        speed_rel=15000.0,
    )
    assert res_safe["has_collided"] is False
    assert res_safe["is_safe"] is True
