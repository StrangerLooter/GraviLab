"""
Orbital Dynamics Simulation & Convergence API Router.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
"""

from typing import Dict, Any, List
import numpy as np
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    SimulationRequest,
    SimulationResponse,
    ConvergenceRequest,
    ConvergenceResponse,
    TrajectoryPoint,
    FlybyMetrics,
    ConservationSummary,
)
from app.physics.constants import (
    PLANET_CATALOG,
    SUN_MU,
    AU,
    DAY_IN_SECONDS,
)
from app.physics.gravity import CelestialBody
from app.physics.state import StateVector
from app.physics.rk4 import rk4_integrate, compute_convergence_study
from app.physics.orbital_mechanics import compute_hyperbolic_elements
from app.physics.reference_frames import (
    heliocentric_to_planetocentric,
    planetocentric_to_heliocentric,
    compute_frame_analysis,
)
from app.physics.conservation import (
    compute_specific_orbital_energy,
    compute_specific_angular_momentum,
    compute_conservation_metrics,
    check_stability_and_safety,
)

router = APIRouter(prefix="/simulation", tags=["simulation"])


def _get_planet_body(planet_id: str) -> CelestialBody:
    key = planet_id.strip().capitalize()
    if key not in PLANET_CATALOG:
        # Default to Jupiter if unknown
        key = "Jupiter"
    info = PLANET_CATALOG[key]
    return CelestialBody(
        name=info["name"],
        mass=info["mass"],
        radius=info["radius"],
        mu=info["mu"],
        semi_major_axis=info["semi_major_axis"],
        orbital_period=info["orbital_period"],
        central_body_mu=SUN_MU,
    )


@router.post("/run", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest) -> SimulationResponse:
    planet = _get_planet_body(req.planet_id)
    planet_mu = planet.mu
    planet_radius = planet.radius

    # Initial state conversion to SI units (meters and meters/second)
    r0 = np.array(req.initial_position_km, dtype=np.float64) * 1000.0
    v0 = np.array(req.initial_velocity_km_s, dtype=np.float64) * 1000.0

    duration_sec = max(60.0, req.duration_days * DAY_IN_SECONDS)
    dt_sec = max(1.0, req.dt_seconds)

    # In Planetocentric frame S':
    # Equation of motion: a = - (mu_p / r^3) * r (with optional solar tidal perturbation)
    # This directly simulates the encounter in S' and maps to S
    planet_pos_0, planet_vel_0 = planet.get_state_at_time(0.0)
    planet_state_0 = StateVector.from_pos_vel(planet_pos_0, planet_vel_0)

    if req.frame == "heliocentric":
        sc_helio_0 = StateVector.from_pos_vel(r0, v0)
        sc_rel_0 = heliocentric_to_planetocentric(sc_helio_0, planet_state_0)
        y0 = sc_rel_0.to_numpy()
    else:
        # Input is relative to planet
        sc_rel_0 = StateVector.from_pos_vel(r0, v0)
        y0 = sc_rel_0.to_numpy()

    def f_flyby(t: float, y: np.ndarray) -> np.ndarray:
        r_vec = y[:3]
        v_vec = y[3:6]
        r_mag = np.linalg.norm(r_vec)
        a_vec = - (planet_mu / (r_mag ** 3)) * r_vec
        return np.array([v_vec[0], v_vec[1], v_vec[2], a_vec[0], a_vec[1], a_vec[2]], dtype=np.float64)

    # Run custom RK4
    sim_res = rk4_integrate(
        y0=y0,
        t_span=(0.0, duration_sec),
        dt=dt_sec,
        derivative_func=f_flyby,
        downsample_factor=req.downsample_factor,
    )

    times = sim_res["times"]
    states = sim_res["states"]

    if len(times) == 0:
        raise HTTPException(status_code=400, detail="Simulation produced 0 time steps.")

    # Compute trajectory points and find periapsis
    min_dist = float('inf')
    periapsis_time_sec = 0.0
    all_warnings: List[str] = []
    has_collided = False

    trajectory_points: List[TrajectoryPoint] = []

    initial_energy = compute_specific_orbital_energy(states[0, :3], states[0, 3:6], planet_mu)
    initial_h = compute_specific_angular_momentum(states[0, :3], states[0, 3:6])
    final_energy = initial_energy
    final_h = initial_h

    # Stride if state array is huge
    target_count = 350
    stride = max(1, len(times) // target_count)

    for i in range(0, len(times), stride):
        t_i = float(times[i])
        r_i = states[i, :3]
        v_i = states[i, 3:6]
        dist_i = float(np.linalg.norm(r_i))
        speed_i = float(np.linalg.norm(v_i))

        if dist_i < min_dist:
            min_dist = dist_i
            periapsis_time_sec = t_i

        # Check stability
        if not has_collided:
            stab = check_stability_and_safety(dist_i, planet_radius, dt_sec, speed_i)
            if stab["has_collided"]:
                has_collided = True
            for w in stab["warnings"]:
                if w not in all_warnings:
                    all_warnings.append(w)

        spec_e = compute_specific_orbital_energy(r_i, v_i, planet_mu)
        h_vec = compute_specific_angular_momentum(r_i, v_i)
        h_mag = float(np.linalg.norm(h_vec))

        if i == len(times) - 1 or (i + stride >= len(times)):
            final_energy = spec_e
            final_h = h_vec

        # Sun distance approximation
        p_pos_i, _ = planet.get_state_at_time(t_i)
        sc_helio_pos = r_i + p_pos_i
        dist_sun_au = float(np.linalg.norm(sc_helio_pos)) / AU

        trajectory_points.append(TrajectoryPoint(
            t_sec=t_i,
            t_hours=round(t_i / 3600.0, 2),
            t_days=round(t_i / DAY_IN_SECONDS, 3),
            x_km=round(float(r_i[0]) / 1000.0, 1),
            y_km=round(float(r_i[1]) / 1000.0, 1),
            z_km=round(float(r_i[2]) / 1000.0, 1),
            vx_km_s=round(float(v_i[0]) / 1000.0, 3),
            vy_km_s=round(float(v_i[1]) / 1000.0, 3),
            vz_km_s=round(float(v_i[2]) / 1000.0, 3),
            speed_km_s=round(speed_i / 1000.0, 3),
            distance_to_planet_km=round(dist_i / 1000.0, 1),
            distance_to_sun_au=round(dist_sun_au, 4),
            specific_energy=round(spec_e, 1),
            h_mag=round(h_mag, 1),
        ))

    # Flyby analytical elements
    v_inf_in = float(np.linalg.norm(states[0, 3:6]))
    v_inf_out = float(np.linalg.norm(states[-1, 3:6]))

    hyp = compute_hyperbolic_elements(
        r_periapsis=max(1000.0, min_dist),
        v_infinity=v_inf_in,
        mu=planet_mu,
    )

    # Frame analysis for heliocentric energy transfer
    p_pos_end, p_vel_end = planet.get_state_at_time(times[-1])
    planet_state_end = StateVector.from_pos_vel(p_pos_end, p_vel_end)

    sc_helio_in = planetocentric_to_heliocentric(StateVector.from_pos_vel(states[0, :3], states[0, 3:6]), planet_state_0)
    sc_helio_out = planetocentric_to_heliocentric(StateVector.from_pos_vel(states[-1, :3], states[-1, 3:6]), planet_state_end)

    frame_res = compute_frame_analysis(
        sc_helio_in=sc_helio_in,
        sc_helio_out=sc_helio_out,
        planet_state=planet_state_0,
        turning_angle_rad=hyp["turning_angle_rad"],
    )

    cons_metrics = compute_conservation_metrics(
        initial_energy=initial_energy,
        current_energy=final_energy,
        initial_h=initial_h,
        current_h=final_h,
    )

    metrics = FlybyMetrics(
        periapsis_km=round(min_dist / 1000.0, 1),
        periapsis_radii=round(min_dist / planet_radius, 2),
        v_infinity_in_km_s=round(v_inf_in / 1000.0, 3),
        v_infinity_out_km_s=round(v_inf_out / 1000.0, 3),
        eccentricity=round(hyp["eccentricity"], 4),
        turning_angle_deg=round(hyp["turning_angle_deg"], 2),
        delta_v_km_s=round(frame_res["delta_v_magnitude"] / 1000.0, 3),
        delta_energy_helio_mj_kg=round(frame_res["delta_energy_helio"] / 1e6, 3),
        closest_approach_time_hours=round(periapsis_time_sec / 3600.0, 2),
    )

    conservation = ConservationSummary(
        initial_energy=round(initial_energy, 1),
        final_energy=round(final_energy, 1),
        energy_drift_pct=round(cons_metrics["energy_drift_pct"], 4),
        initial_h_mag=round(cons_metrics["initial_h_magnitude"], 1),
        final_h_mag=round(cons_metrics["current_h_magnitude"], 1),
        angular_momentum_drift_pct=round(cons_metrics["angular_momentum_drift_pct"], 4),
        has_collided=has_collided,
        is_numerically_stable=not sim_res["terminated_early"] and cons_metrics["energy_drift_pct"] < 2.0,
        warnings=all_warnings,
    )

    return SimulationResponse(
        status="Success" if not has_collided else "Collision Detected",
        planet={
            "name": planet.name,
            "radius_km": round(planet.radius / 1000.0, 1),
            "mass_kg": planet.mass,
            "mu": planet.mu,
            "orbital_speed_km_s": round(float(np.linalg.norm(planet_vel_0)) / 1000.0, 2),
        },
        initial_state={
            "position_km": [round(float(v) / 1000.0, 1) for v in states[0, :3]],
            "velocity_km_s": [round(float(v) / 1000.0, 3) for v in states[0, 3:6]],
            "speed_km_s": round(v_inf_in / 1000.0, 3),
        },
        final_state={
            "position_km": [round(float(v) / 1000.0, 1) for v in states[-1, :3]],
            "velocity_km_s": [round(float(v) / 1000.0, 3) for v in states[-1, 3:6]],
            "speed_km_s": round(v_inf_out / 1000.0, 3),
        },
        metrics=metrics,
        conservation=conservation,
        trajectory_sample_count=len(trajectory_points),
        trajectory=trajectory_points,
    )


@router.post("/convergence", response_model=ConvergenceResponse)
def run_convergence(req: ConvergenceRequest) -> ConvergenceResponse:
    planet = _get_planet_body(req.planet_id)
    planet_mu = planet.mu

    r0 = np.array(req.initial_position_km, dtype=np.float64) * 1000.0
    v0 = np.array(req.initial_velocity_km_s, dtype=np.float64) * 1000.0
    y0 = np.concatenate([r0, v0])

    duration_sec = req.duration_hours * 3600.0
    base_dt = max(2.0, req.base_dt_seconds)

    def f_flyby(t: float, y: np.ndarray) -> np.ndarray:
        r_vec = y[:3]
        v_vec = y[3:6]
        r_mag = np.linalg.norm(r_vec)
        a_vec = - (planet_mu / (r_mag ** 3)) * r_vec
        return np.array([v_vec[0], v_vec[1], v_vec[2], a_vec[0], a_vec[1], a_vec[2]], dtype=np.float64)

    study = compute_convergence_study(
        y0=y0,
        t_span=(0.0, duration_sec),
        base_dt=base_dt,
        derivative_func=f_flyby,
    )

    times = study["sol_dt"]["times"]
    sample_stride = max(1, len(times) // 100)

    times_hours = [round(float(t) / 3600.0, 2) for t in times[::sample_stride]]
    speeds_dt = [round(v / 1000.0, 3) for v in study["sol_dt"]["speeds"][::sample_stride]]

    # Interpolate half and quarter speeds onto same sample times
    speeds_half = [round(v / 1000.0, 3) for v in study["sol_half"]["speeds"][:len(times)][::sample_stride]]
    speeds_quarter = [round(v / 1000.0, 3) for v in study["sol_quarter"]["speeds"][:len(times)][::sample_stride]]

    # Pad if slight length difference
    while len(speeds_half) < len(times_hours):
        speeds_half.append(speeds_half[-1] if speeds_half else 0.0)
    while len(speeds_quarter) < len(times_hours):
        speeds_quarter.append(speeds_quarter[-1] if speeds_quarter else 0.0)

    return ConvergenceResponse(
        dt_base=round(study["dt_base"], 2),
        dt_half=round(study["dt_half"], 2),
        dt_quarter=round(study["dt_quarter"], 2),
        diff_dt_vs_dthalf_km=round(study["diff_dt_vs_dthalf"] / 1000.0, 4),
        diff_dthalf_vs_dtquarter_km=round(study["diff_dthalf_vs_dtquarter"] / 1000.0, 4),
        ratio_e1_e2=round(study["ratio_e1_e2"], 2) if not np.isinf(study["ratio_e1_e2"]) else 16.0,
        estimated_order_p=round(study["estimated_order_p"], 2),
        is_converging=study["is_converging"],
        times_hours=times_hours,
        speeds_dt_km_s=speeds_dt,
        speeds_half_km_s=speeds_half[:len(times_hours)],
        speeds_quarter_km_s=speeds_quarter[:len(times_hours)],
    )
