"""
Unit tests for custom 4th-Order Runge-Kutta numerical integrator.
Member 3: Python Coding & Numerics.
"""

import numpy as np
import pytest
from app.physics.rk4 import rk4_step, rk4_integrate, compute_convergence_study
from app.physics.constants import SUN_MU, AU


def test_rk4_constant_velocity():
    """Zero acceleration => position changes linearly with time x(t) = x0 + v*t."""
    # dy/dt = [vx, vy, vz, 0, 0, 0]
    def f_const(t: float, y: np.ndarray) -> np.ndarray:
        return np.array([y[3], y[4], y[5], 0.0, 0.0, 0.0])

    y0 = np.array([100.0, 200.0, 300.0, 10.0, -20.0, 5.0])
    dt = 5.0
    t_span = (0.0, 100.0)

    result = rk4_integrate(y0, t_span, dt, f_const)
    final_y = result["final_state"]

    expected_pos = y0[:3] + y0[3:6] * 100.0
    assert np.allclose(final_y[:3], expected_pos, atol=1e-10)


def test_rk4_harmonic_oscillator_analytical_accuracy():
    """
    Test against analytical harmonic oscillator: x''(t) + omega^2 * x(t) = 0.
    With x(0) = 1, v(0) = 0 => x(t) = cos(omega * t).
    """
    omega = 2.0 * np.pi / 10.0  # period = 10s

    def f_osc(t: float, y: np.ndarray) -> np.ndarray:
        # y = [x, 0, 0, vx, 0, 0]
        x = y[0]
        vx = y[3]
        ax = -(omega ** 2) * x
        return np.array([vx, 0.0, 0.0, ax, 0.0, 0.0])

    y0 = np.array([1.0, 0.0, 0.0, 0.0, 0.0, 0.0])
    period = 10.0
    dt = 0.1
    result = rk4_integrate(y0, (0.0, period), dt, f_osc)

    final_x = result["final_state"][0]
    # At t = 10s (one full cycle), x should be cos(2*pi) = 1.0
    assert pytest.approx(final_x, rel=1e-4) == 1.0


def test_rk4_circular_orbit_closure():
    """
    Simulate circular Earth orbit around Sun for 1/4 of an orbital period (~91.3 days).
    Radius should stay within 0.01% of 1 AU.
    """
    r0 = AU
    v_circ = np.sqrt(SUN_MU / r0)
    y0 = np.array([r0, 0.0, 0.0, 0.0, v_circ, 0.0])

    def f_orbit(t: float, y: np.ndarray) -> np.ndarray:
        pos = y[:3]
        vel = y[3:6]
        r = np.linalg.norm(pos)
        acc = - (SUN_MU / (r ** 3)) * pos
        return np.array([vel[0], vel[1], vel[2], acc[0], acc[1], acc[2]])

    quarter_period = 0.25 * (2.0 * np.pi * np.sqrt((r0 ** 3) / SUN_MU))
    dt = 3600.0  # 1 hour timestep

    res = rk4_integrate(y0, (0.0, quarter_period), dt, f_orbit)
    final_pos = res["final_state"][:3]
    final_r = np.linalg.norm(final_pos)

    # After 1/4 period, position should be near [0, AU, 0]
    assert pytest.approx(final_r, rel=1e-4) == r0
    assert abs(final_pos[0]) < 0.05 * AU
    assert pytest.approx(final_pos[1], rel=0.05) == AU


def test_rk4_convergence_order():
    """Convergence study shows error reduction by ~16x when dt is halved (4th order)."""
    omega = 1.0
    def f_osc(t: float, y: np.ndarray) -> np.ndarray:
        return np.array([y[3], 0.0, 0.0, -y[0], 0.0, 0.0])

    y0 = np.array([1.0, 0.0, 0.0, 0.0, 0.0, 0.0])
    t_span = (0.0, 5.0)
    base_dt = 0.4

    study = compute_convergence_study(y0, t_span, base_dt, f_osc)
    assert study["is_converging"] is True
    # For RK4, ratio between step errors E(dt)/E(dt/2) should be close to 2^4 = 16
    assert study["ratio_e1_e2"] > 10.0
    assert 3.2 <= study["estimated_order_p"] <= 4.5
