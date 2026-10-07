"""
Unit tests for NASA JPL Horizons validation and error metrics.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 5: Data Validation & Synthesis.
"""

import pytest
from app.validation.horizons import load_horizons_dataset, get_voyager1_initial_state
from app.validation.comparison import run_voyager1_horizons_comparison


def test_horizons_dataset_structure():
    """Verify JSON dataset schema and essential parameters."""
    data = load_horizons_dataset()
    assert data["mission"] == "Voyager 1"
    assert data["target_body"] == "Jupiter"
    assert len(data["telemetry_points"]) == 19
    assert data["periapsis_distance_m"] == 348890000.0


def test_voyager1_initial_state():
    """Verify initial state vector extraction at t=0."""
    t0, y0 = get_voyager1_initial_state()
    assert t0 == 0.0
    assert len(y0) == 6
    assert y0[0] < 0.0  # Approaching from negative x
    assert y0[3] > 10000.0  # Speed > 10 km/s


def test_rk4_vs_horizons_under_5_percent_threshold():
    """
    CRITICAL PROPOSAL REQUIREMENT:
    Maintain relative percentage error between Python RK4 numerical simulation
    and NASA JPL Horizons flight telemetry under a strict 5% threshold.
    """
    comparison = run_voyager1_horizons_comparison(dt_seconds=60.0)
    summary = comparison["summary"]

    # Must pass validation gate
    assert summary["is_validated"] is True, f"Error exceeded 5%: {summary['global_max_error_pct']}%"
    assert summary["global_max_error_pct"] < 5.0
    assert summary["status_badge"] == "VALIDATED (< 5%)"
    assert summary["mean_position_error_pct"] < 3.0
    assert summary["mean_velocity_error_pct"] < 2.5
