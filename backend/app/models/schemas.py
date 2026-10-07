"""
Pydantic Schemas for API Requests and Responses.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    planet_id: str = Field(default="jupiter", description="ID of flyby planet (e.g. jupiter, earth, saturn)")
    # Spacecraft initial relative or heliocentric state
    initial_position_km: List[float] = Field(
        default=[-5170233.0, 4177476.0, -62887.0],
        description="Spacecraft initial position [x, y, z] in km"
    )
    initial_velocity_km_s: List[float] = Field(
        default=[11.042, -10.995, 0.133],
        description="Spacecraft initial velocity [vx, vy, vz] in km/s"
    )
    frame: str = Field(default="planetocentric", description="Reference frame of input: 'planetocentric' or 'heliocentric'")
    dt_seconds: float = Field(default=60.0, description="Integration timestep dt in seconds")
    duration_days: float = Field(default=9.0, description="Total simulation duration in days")
    spacecraft_mass_kg: float = Field(default=815.0, description="Spacecraft dry mass in kg")
    downsample_factor: int = Field(default=5, description="Downsampling factor for trajectory transmission")


class TrajectoryPoint(BaseModel):
    t_sec: float
    t_hours: float
    t_days: float
    x_km: float
    y_km: float
    z_km: float
    vx_km_s: float
    vy_km_s: float
    vz_km_s: float
    speed_km_s: float
    distance_to_planet_km: float
    distance_to_sun_au: float
    specific_energy: float
    h_mag: float


class FlybyMetrics(BaseModel):
    periapsis_km: float
    periapsis_radii: float
    v_infinity_in_km_s: float
    v_infinity_out_km_s: float
    eccentricity: float
    turning_angle_deg: float
    delta_v_km_s: float
    delta_energy_helio_mj_kg: float
    closest_approach_time_hours: float


class ConservationSummary(BaseModel):
    initial_energy: float
    final_energy: float
    energy_drift_pct: float
    initial_h_mag: float
    final_h_mag: float
    angular_momentum_drift_pct: float
    has_collided: bool
    is_numerically_stable: bool
    warnings: List[str]


class SimulationResponse(BaseModel):
    status: str
    planet: Dict[str, Any]
    initial_state: Dict[str, Any]
    final_state: Dict[str, Any]
    metrics: FlybyMetrics
    conservation: ConservationSummary
    trajectory_sample_count: int
    trajectory: List[TrajectoryPoint]


class ConvergenceRequest(BaseModel):
    planet_id: str = "jupiter"
    base_dt_seconds: float = 120.0
    duration_hours: float = 48.0
    initial_position_km: List[float] = [-3000000.0, 2000000.0, 0.0]
    initial_velocity_km_s: List[float] = [12.0, -10.0, 0.0]


class ConvergenceResponse(BaseModel):
    dt_base: float
    dt_half: float
    dt_quarter: float
    diff_dt_vs_dthalf_km: float
    diff_dthalf_vs_dtquarter_km: float
    ratio_e1_e2: float
    estimated_order_p: float
    is_converging: bool
    times_hours: List[float]
    speeds_dt_km_s: List[float]
    speeds_half_km_s: List[float]
    speeds_quarter_km_s: List[float]


class ValidationResponse(BaseModel):
    metadata: Dict[str, Any]
    summary: Dict[str, Any]
    points: List[Dict[str, Any]]
    sim_trajectory: List[Dict[str, Any]]
