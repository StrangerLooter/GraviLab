"""
Unit tests for Newtonian gravitational acceleration and celestial bodies.
"""

import numpy as np
import pytest
from app.physics.constants import G, SUN_MU, AU, PLANET_CATALOG
from app.physics.gravity import CelestialBody, compute_gravitational_acceleration, two_body_acceleration


def test_zero_gravity():
    """When no bodies exist or mu=0, acceleration should be exactly zero."""
    pos = np.array([1e11, 2e11, 0.0])
    acc_empty = compute_gravitational_acceleration(pos, bodies=[])
    assert np.allclose(acc_empty, [0.0, 0.0, 0.0])

    zero_body = CelestialBody(name="Ghost", mass=0.0, radius=1e6, mu=0.0)
    acc_zero = compute_gravitational_acceleration(pos, bodies=[zero_body])
    assert np.allclose(acc_zero, [0.0, 0.0, 0.0])


def test_inverse_square_law():
    """At double the radial distance, gravitational acceleration must reduce by 4x."""
    sun = CelestialBody(name="Sun", mass=1.98847e30, radius=6.96e8, mu=SUN_MU)
    r1 = 1.0 * AU
    r2 = 2.0 * AU

    pos1 = np.array([r1, 0.0, 0.0])
    pos2 = np.array([r2, 0.0, 0.0])

    acc1 = compute_gravitational_acceleration(pos1, bodies=[sun])
    acc2 = compute_gravitational_acceleration(pos2, bodies=[sun])

    mag1 = np.linalg.norm(acc1)
    mag2 = np.linalg.norm(acc2)

    ratio = mag1 / mag2
    assert pytest.approx(ratio, rel=1e-5) == 4.0


def test_acceleration_direction():
    """Gravitational acceleration vector must point directly toward the gravitating body."""
    earth_mu = PLANET_CATALOG["Earth"]["mu"]
    earth = CelestialBody(name="Earth", mass=PLANET_CATALOG["Earth"]["mass"], radius=6.371e6, mu=earth_mu)

    # Spacecraft placed at (+x, +y, 0)
    pos = np.array([7.0e6, 7.0e6, 0.0])
    acc = compute_gravitational_acceleration(pos, bodies=[earth])

    # Acceleration must have negative components along x and y
    assert acc[0] < 0.0
    assert acc[1] < 0.0
    assert acc[2] == 0.0
    # Equal components because x == y
    assert pytest.approx(acc[0]) == acc[1]


def test_circular_orbital_speed_consistency():
    """Keplerian circular orbit speed must equal sqrt(mu / r)."""
    earth = CelestialBody(
        name="Earth",
        mass=PLANET_CATALOG["Earth"]["mass"],
        radius=PLANET_CATALOG["Earth"]["radius"],
        mu=PLANET_CATALOG["Earth"]["mu"],
        semi_major_axis=AU,
        central_body_mu=SUN_MU,
    )
    pos, vel = earth.get_state_at_time(0.0)
    expected_speed = np.sqrt(SUN_MU / AU)
    actual_speed = np.linalg.norm(vel)
    assert pytest.approx(actual_speed, rel=1e-3) == expected_speed
