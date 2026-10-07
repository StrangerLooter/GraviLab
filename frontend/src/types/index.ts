export interface Planet {
  id: string;
  name: string;
  mass_kg: number;
  radius_km: number;
  mu: number;
  semi_major_axis_au: number;
  orbital_speed_km_s: number;
  orbital_period_days: number;
  color: string;
  description: string;
}

export interface Preset {
  id: string;
  name: string;
  planet_id: string;
  description: string;
  spacecraft_mass_kg: number;
  initial_distance_factor: number;
  impact_parameter_km: number;
  v_inf_km_s: number;
  approach_angle_deg: number;
  simulation_duration_days: number;
  default_dt_sec: number;
}

export interface TrajectoryPoint {
  t_sec: number;
  t_hours: number;
  t_days: number;
  x_km: number;
  y_km: number;
  z_km: number;
  vx_km_s: number;
  vy_km_s: number;
  vz_km_s: number;
  speed_km_s: number;
  distance_to_planet_km: number;
  distance_to_sun_au: number;
  specific_energy: number;
  h_mag: number;
}

export interface FlybyMetrics {
  periapsis_km: number;
  periapsis_radii: number;
  v_infinity_in_km_s: number;
  v_infinity_out_km_s: number;
  eccentricity: number;
  turning_angle_deg: number;
  delta_v_km_s: number;
  delta_energy_helio_mj_kg: number;
  closest_approach_time_hours: number;
}

export interface ConservationSummary {
  initial_energy: number;
  final_energy: number;
  energy_drift_pct: number;
  initial_h_mag: number;
  final_h_mag: number;
  angular_momentum_drift_pct: number;
  has_collided: boolean;
  is_numerically_stable: boolean;
  warnings: string[];
}

export interface SimulationResponse {
  status: string;
  planet: {
    name: string;
    radius_km: number;
    mass_kg: number;
    mu: number;
    orbital_speed_km_s: number;
  };
  initial_state: {
    position_km: [number, number, number];
    velocity_km_s: [number, number, number];
    speed_km_s: number;
  };
  final_state: {
    position_km: [number, number, number];
    velocity_km_s: [number, number, number];
    speed_km_s: number;
  };
  metrics: FlybyMetrics;
  conservation: ConservationSummary;
  trajectory_sample_count: number;
  trajectory: TrajectoryPoint[];
}

export interface SimulationRequest {
  planet_id: string;
  initial_position_km: [number, number, number];
  initial_velocity_km_s: [number, number, number];
  frame: string;
  dt_seconds: number;
  duration_days: number;
  spacecraft_mass_kg: number;
  downsample_factor: number;
}

export interface ConvergenceResponse {
  dt_base: number;
  dt_half: number;
  dt_quarter: number;
  diff_dt_vs_dthalf_km: number;
  diff_dthalf_vs_dtquarter_km: number;
  ratio_e1_e2: number;
  estimated_order_p: number;
  is_converging: boolean;
  times_hours: number[];
  speeds_dt_km_s: number[];
  speeds_half_km_s: number[];
  speeds_quarter_km_s: number[];
}

export interface HorizonsTelemetryPoint {
  step: number;
  epoch: string;
  t_sec: number;
  t_hours: number;
  r_ref_km: [number, number, number];
  r_sim_km: [number, number, number];
  v_ref_km_s: [number, number, number];
  v_sim_km_s: [number, number, number];
  distance_ref_km: number;
  distance_sim_km: number;
  speed_ref_km_s: number;
  speed_sim_km_s: number;
  position_error_pct: number;
  velocity_error_pct: number;
  pos_diff_km: number;
  vel_diff_mps: number;
}

export interface ValidationSummary {
  max_position_error_pct: number;
  mean_position_error_pct: number;
  max_velocity_error_pct: number;
  mean_velocity_error_pct: number;
  global_max_error_pct: number;
  target_threshold_pct: number;
  is_validated: boolean;
  status_badge: string;
  rmse_position_km: number;
  rmse_velocity_mps: number;
}

export interface ValidationResponse {
  metadata: {
    mission: string;
    target_body: string;
    encounter_window: string;
    closest_approach_epoch: string;
    integrator: string;
    dt_seconds: number;
    data_source: string;
  };
  summary: ValidationSummary;
  points: HorizonsTelemetryPoint[];
  sim_trajectory: {
    t_hours: number;
    x_km: number;
    y_km: number;
    z_km: number;
    speed_km_s: number;
    distance_km: number;
  }[];
}
