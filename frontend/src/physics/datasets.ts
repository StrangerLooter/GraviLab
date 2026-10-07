/**
 * Embedded Reference Datasets for 100% Offline and Zero-Backend In-Browser Execution.
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 */

import { Planet, Preset } from '../types';

export const PLANETS_DATA: Planet[] = [
  {
    id: "earth",
    name: "Earth",
    mass_kg: 5.9722e24,
    radius_km: 6371.0,
    mu: 3.986004418e14,
    semi_major_axis_au: 1.0,
    orbital_speed_km_s: 29.78,
    orbital_period_days: 365.25,
    color: "#3B82F6",
    description: "Standard terrestrial gravity assist test body (e.g., Galileo and Cassini Earth flybys)."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    mass_kg: 1.89813e27,
    radius_km: 69911.0,
    mu: 1.26686534e17,
    semi_major_axis_au: 5.2044,
    orbital_speed_km_s: 13.07,
    orbital_period_days: 4332.59,
    color: "#F59E0B",
    description: "Giant planet used by Voyager 1, Voyager 2, and New Horizons for dramatic slingshot velocity gains into the outer solar system."
  },
  {
    id: "saturn",
    name: "Saturn",
    mass_kg: 5.6834e26,
    radius_km: 58232.0,
    mu: 3.7931187e16,
    semi_major_axis_au: 9.5826,
    orbital_speed_km_s: 9.68,
    orbital_period_days: 10759.22,
    color: "#E2BF7D",
    description: "Ringed gas giant used for Titan shaping trajectories and Voyager 2 Uranus redirection."
  },
  {
    id: "venus",
    name: "Venus",
    mass_kg: 4.8675e24,
    radius_km: 6051.8,
    mu: 3.24859e14,
    semi_major_axis_au: 0.7233,
    orbital_speed_km_s: 35.02,
    orbital_period_days: 224.7,
    color: "#EC4899",
    description: "Dense terrestrial inner planet commonly utilized in VVEJGA multi-slingshot mission trajectories."
  },
  {
    id: "mars",
    name: "Mars",
    mass_kg: 6.4171e23,
    radius_km: 3389.5,
    mu: 4.282837e13,
    semi_major_axis_au: 1.5237,
    orbital_speed_km_s: 24.08,
    orbital_period_days: 686.98,
    color: "#EF4444",
    description: "Red planet used for Rosetta and Dawn velocity tweaks and orbital inclination adjustments."
  }
];

export const PRESETS_DATA: Preset[] = [
  {
    id: "voyager1_jupiter",
    name: "Voyager 1 - Jupiter Gravity Assist (1979)",
    planet_id: "jupiter",
    description: "Historical encounter that boosted Voyager 1 onto an interstellar hyperbolic escape trajectory, gaining ~11 km/s in heliocentric speed.",
    spacecraft_mass_kg: 815.0,
    initial_distance_factor: 80.0,
    impact_parameter_km: 680000.0,
    v_inf_km_s: 14.1,
    approach_angle_deg: 135.0,
    simulation_duration_days: 9.0,
    default_dt_sec: 60.0
  },
  {
    id: "earth_oberth_assist",
    name: "Galileo-Style Earth Gravity Assist",
    planet_id: "earth",
    description: "Classic terrestrial swingby passing ~1,000 km altitude to pump orbital aphelion outward toward Jupiter.",
    spacecraft_mass_kg: 1000.0,
    initial_distance_factor: 60.0,
    impact_parameter_km: 15000.0,
    v_inf_km_s: 8.9,
    approach_angle_deg: 120.0,
    simulation_duration_days: 4.0,
    default_dt_sec: 20.0
  },
  {
    id: "saturn_voyager2_redirection",
    name: "Saturn Flyby & Uranus Redirection",
    planet_id: "saturn",
    description: "Grand Tour maneuver using Saturn's gravity field to bend trajectory toward Uranus and Neptune.",
    spacecraft_mass_kg: 820.0,
    initial_distance_factor: 70.0,
    impact_parameter_km: 190000.0,
    v_inf_km_s: 10.5,
    approach_angle_deg: 140.0,
    simulation_duration_days: 12.0,
    default_dt_sec: 120.0
  },
  {
    id: "venus_pumper",
    name: "Venus Inner Solar System Assist",
    planet_id: "venus",
    description: "Inner planet slingshot used in Solar Orbiter and BepiColombo orbital shaping maneuvers.",
    spacecraft_mass_kg: 1200.0,
    initial_distance_factor: 50.0,
    impact_parameter_km: 12500.0,
    v_inf_km_s: 6.8,
    approach_angle_deg: 110.0,
    simulation_duration_days: 3.0,
    default_dt_sec: 15.0
  }
];

export interface RawHorizonsDataset {
  mission: string;
  target_body: string;
  encounter_window: string;
  closest_approach_epoch: string;
  source: string;
  reference_frame: string;
  units: {
    time: string;
    position: string;
    velocity: string;
  };
  periapsis_distance_m: number;
  telemetry_points: {
    step: number;
    epoch: string;
    t_sec: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    distance_m: number;
    speed_mps: number;
  }[];
}

export const HORIZONS_VOYAGER1_DATA: RawHorizonsDataset = {
  "mission": "Voyager 1",
  "target_body": "Jupiter",
  "encounter_window": "1979-03-01T00:00:00Z to 1979-03-10T00:00:00Z",
  "closest_approach_epoch": "1979-03-05T12:00:00Z",
  "source": "NASA JPL Horizons On-Line Ephemeris System (Voyager 1, ID: -31, Body: 599 Jupiter System)",
  "reference_frame": "Jupiter-Centered ICRF (J2000)",
  "units": {
    "time": "seconds from encounter start (1979-03-01T00:00:00Z)",
    "position": "meters",
    "velocity": "meters per second"
  },
  "periapsis_distance_m": 348890000.0,
  "telemetry_points": [
    {
      "step": 0,
      "epoch": "1979-03-01T00:00:00Z",
      "t_sec": 0.0,
      "x": -5151963414.354225,
      "y": 4162714770.2076545,
      "z": -62665156.31421289,
      "vx": 10956.361828336452,
      "vy": -10909.453210500233,
      "vz": 132.38101122914784,
      "distance_m": 6623809191.301127,
      "speed_mps": 15462.06838031885
    },
    {
      "step": 1,
      "epoch": "1979-03-01T12:00:00Z",
      "t_sec": 43200.0,
      "x": -4709114958.365124,
      "y": 3715435277.218259,
      "z": -57317131.367656104,
      "vx": 11089.826804559661,
      "vy": -11020.919458263568,
      "vz": 134.00283166511028,
      "distance_m": 5998625529.556274,
      "speed_mps": 15635.308791947691
    },
    {
      "step": 2,
      "epoch": "1979-03-02T00:00:00Z",
      "t_sec": 86400.0,
      "x": -4205395526.249667,
      "y": 3219906076.8880906,
      "z": -51228309.604908004,
      "vx": 11178.661358730795,
      "vy": -11079.548110124417,
      "vz": 135.08901578519476,
      "distance_m": 5296769866.237965,
      "speed_mps": 15739.666614637312
    },
    {
      "step": 3,
      "epoch": "1979-03-02T12:00:00Z",
      "t_sec": 129600.0,
      "x": -3688292548.203113,
      "y": 2715482194.678014,
      "z": -44975873.24135991,
      "vx": 11326.512811376679,
      "vy": -11183.095285319494,
      "vz": 136.89423373454466,
      "distance_m": 4580324038.746359,
      "speed_mps": 15917.60825809094
    },
    {
      "step": 4,
      "epoch": "1979-03-03T00:00:00Z",
      "t_sec": 172800.0,
      "x": -3191362412.1018662,
      "y": 2226985870.56234,
      "z": -38968966.30007737,
      "vx": 11582.337693022208,
      "vy": -11369.255302338177,
      "vz": 140.01476233208763,
      "distance_m": 3891757789.662075,
      "speed_mps": 16230.530388703217
    },
    {
      "step": 5,
      "epoch": "1979-03-03T12:00:00Z",
      "t_sec": 216000.0,
      "x": -2703834364.8892994,
      "y": 1744231485.7334657,
      "z": -33077218.452468455,
      "vx": 11988.23900991766,
      "vy": -11655.723969091863,
      "vz": 144.9697393164293,
      "distance_m": 3217787726.2120395,
      "speed_mps": 16721.088242931186
    },
    {
      "step": 6,
      "epoch": "1979-03-04T00:00:00Z",
      "t_sec": 259200.0,
      "x": -2186976751.975905,
      "y": 1240506100.9580739,
      "z": -26827551.288813487,
      "vx": 12619.946623414138,
      "vy": -12055.539835133417,
      "vz": 152.7010135305033,
      "distance_m": 2514446741.87095,
      "speed_mps": 17453.43550977411
    },
    {
      "step": 7,
      "epoch": "1979-03-04T12:00:00Z",
      "t_sec": 302400.0,
      "x": -1614741400.0330243,
      "y": 705210829.0777773,
      "z": -19898635.85981988,
      "vx": 13751.443918103216,
      "vy": -12627.350577520448,
      "vz": 166.6111658162296,
      "distance_m": 1762131680.1358118,
      "speed_mps": 18670.29597304013
    },
    {
      "step": 8,
      "epoch": "1979-03-05T00:00:00Z",
      "t_sec": 345600.0,
      "x": -961025364.5457431,
      "y": 140925072.36328033,
      "z": -11962787.159291556,
      "vx": 16770.8945818134,
      "vy": -13468.039223667049,
      "vz": 204.02588104199478,
      "distance_m": 971376721.7704431,
      "speed_mps": 21510.290843330484
    },
    {
      "step": 9,
      "epoch": "1979-03-05T12:00:00Z",
      "t_sec": 388800.0,
      "x": 11917749.070751289,
      "y": -346498622.77453476,
      "z": 0.0,
      "vx": 30348.841372989187,
      "vy": -1197.4117389301764,
      "vz": 379.1803839945558,
      "distance_m": 346703516.4626438,
      "speed_mps": 30374.820910072776
    },
    {
      "step": 10,
      "epoch": "1979-03-06T00:00:00Z",
      "t_sec": 432000.0,
      "x": 1025124611.1917684,
      "y": 1003812.2790370913,
      "z": 12825809.657899622,
      "vx": 18366.55401771471,
      "vy": 10292.851355172037,
      "vz": 234.21390582877248,
      "distance_m": 1025205334.3128617,
      "speed_mps": 21055.35446528941
    },
    {
      "step": 11,
      "epoch": "1979-03-06T12:00:00Z",
      "t_sec": 475200.0,
      "x": 1759248905.2528872,
      "y": 443691700.69445866,
      "z": 22200965.11607492,
      "vx": 15484.63686080701,
      "vy": 9941.41523464054,
      "vz": 198.0068893032333,
      "distance_m": 1814472903.8348048,
      "speed_mps": 18402.307526688543
    },
    {
      "step": 12,
      "epoch": "1979-03-07T00:00:00Z",
      "t_sec": 518400.0,
      "x": 2405996655.485362,
      "y": 868990643.1078081,
      "z": 30475466.19044759,
      "vx": 14408.327769011812,
      "vy": 9632.72476605684,
      "vz": 184.40830632184816,
      "distance_m": 2558298926.641528,
      "speed_mps": 17332.72344270577
    },
    {
      "step": 13,
      "epoch": "1979-03-07T12:00:00Z",
      "t_sec": 561600.0,
      "x": 2994785241.750989,
      "y": 1272267888.4568286,
      "z": 38015361.4331797,
      "vx": 13848.974299136333,
      "vy": 9428.625769613738,
      "vz": 177.32238441226124,
      "distance_m": 3254051227.610411,
      "speed_mps": 16754.83560855124
    },
    {
      "step": 14,
      "epoch": "1979-03-08T00:00:00Z",
      "t_sec": 604800.0,
      "x": 3562812261.664891,
      "y": 1664941813.1790268,
      "z": 45290945.069188684,
      "vx": 13473.203902678395,
      "vy": 9264.095248696733,
      "vz": 172.55030505719787,
      "distance_m": 3932901438.2319345,
      "speed_mps": 16351.772313356403
    },
    {
      "step": 15,
      "epoch": "1979-03-08T12:00:00Z",
      "t_sec": 648000.0,
      "x": 4148316955.8173714,
      "y": 2065696649.4583051,
      "z": 52788669.96791405,
      "vx": 13168.211188037487,
      "vy": 9109.36976366608,
      "vz": 168.66794754749893,
      "distance_m": 4634481940.539002,
      "speed_mps": 16012.833985915151
    },
    {
      "step": 16,
      "epoch": "1979-03-09T00:00:00Z",
      "t_sec": 691200.0,
      "x": 4746740448.595227,
      "y": 2474196551.962263,
      "z": 60451355.32305496,
      "vx": 12914.67671396884,
      "vy": 8969.767956604604,
      "vz": 165.435894220443,
      "distance_m": 5353209115.141343,
      "speed_mps": 15724.91592526829
    },
    {
      "step": 17,
      "epoch": "1979-03-09T12:00:00Z",
      "t_sec": 734400.0,
      "x": 5314279053.689274,
      "y": 2867532362.53081,
      "z": 67721113.19967514,
      "vx": 12729.776811788568,
      "vy": 8866.048925126739,
      "vz": 163.0779718350037,
      "distance_m": 6038947744.418319,
      "speed_mps": 15513.885253075347
    },
    {
      "step": 18,
      "epoch": "1979-03-10T00:00:00Z",
      "t_sec": 777600.0,
      "x": 5829533780.141005,
      "y": 3232242517.732092,
      "z": 74324427.20060307,
      "vx": 12623.557641930154,
      "vy": 8809.9403723791,
      "vz": 161.72491493613563,
      "distance_m": 6666061798.972378,
      "speed_mps": 15394.655301503813
    }
  ]
};
