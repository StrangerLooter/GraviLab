"""
Unit tests for hyperbolic orbital mechanics and flyby geometry.
"""

import numpy as np
import pytest
from app.physics.orbital_mechanics import (
    compute_hyperbolic_elements,
    compute_periapsis_from_impact_parameter,
)
from app.physics.constants import JUPITER_MU, JUPITER_RADIUS


def test_hyperbolic_elements_analytical_case():
    """Test with known analytical values: e = sqrt(2) gives turning angle = 90 deg."""
    # When e = sqrt(2), (rp * v_inf^2) / mu = sqrt(2) - 1
    mu = 1.0e14
    v_inf = 5000.0
    # rp * (v_inf^2) / mu = sqrt(2) - 1 => rp = (sqrt(2) - 1) * mu / v_inf^2
    rp = (np.sqrt(2.0) - 1.0) * mu / (v_inf ** 2)

    elements = compute_hyperbolic_elements(r_periapsis=rp, v_infinity=v_inf, mu=mu)

    assert pytest.approx(elements["eccentricity"], rel=1e-5) == np.sqrt(2.0)
    assert pytest.approx(elements["turning_angle_deg"], rel=1e-5) == 90.0
    assert pytest.approx(elements["turning_angle_rad"], rel=1e-5) == np.pi / 2.0


def test_turning_angle_limits():
    """As eccentricity increases, turning angle approaches zero."""
    mu = JUPITER_MU
    rp = 5.0 * JUPITER_RADIUS

    # Low speed => higher deflection
    elem_low_v = compute_hyperbolic_elements(rp, v_infinity=3000.0, mu=mu)
    # High speed => lower deflection
    elem_high_v = compute_hyperbolic_elements(rp, v_infinity=30000.0, mu=mu)

    assert elem_low_v["turning_angle_deg"] > elem_high_v["turning_angle_deg"]
    assert elem_low_v["eccentricity"] < elem_high_v["eccentricity"]
    assert elem_low_v["eccentricity"] > 1.0


def test_impact_parameter_round_trip():
    """compute_periapsis_from_impact_parameter should invert b back to rp."""
    mu = JUPITER_MU
    v_inf = 14000.0
    rp_original = 4.0 * JUPITER_RADIUS

    elements = compute_hyperbolic_elements(r_periapsis=rp_original, v_infinity=v_inf, mu=mu)
    b = elements["impact_parameter"]

    rp_recovered = compute_periapsis_from_impact_parameter(b, v_inf, mu)
    assert pytest.approx(rp_recovered, rel=1e-6) == rp_original
