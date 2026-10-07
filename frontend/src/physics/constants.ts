/**
 * Planetary and Astronomical Physical Constants (SI Units).
 * Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
 * Member 1: Basic Math & Physics Laws.
 */

export const G = 6.67430e-11; // Universal gravitational constant [m^3 / (kg * s^2)]
export const AU = 1.495978707e11; // Astronomical Unit [m]
export const SPEED_OF_LIGHT = 299792458.0; // Speed of light [m/s]
export const DAY_IN_SECONDS = 86400.0; // Seconds in a day [s]
export const YEAR_IN_SECONDS = 365.25 * DAY_IN_SECONDS; // Julian year in seconds [s]

// Central Body (Sun)
export const SUN_MASS = 1.98847e30; // Mass of Sun [kg]
export const SUN_RADIUS = 6.9634e8; // Radius of Sun [m]
export const SUN_MU = G * SUN_MASS; // Standard gravitational parameter [m^3 / s^2]

export interface PlanetCatalogEntry {
  id: string;
  name: string;
  mass: number;
  radius: number;
  mu: number;
  semiMajorAxis: number;
  orbitalPeriod: number;
  orbitalSpeed: number;
  color: string;
  description: string;
}

export const PLANET_CATALOG: Record<string, PlanetCatalogEntry> = {
  Sun: {
    id: "sun",
    name: "Sun",
    mass: SUN_MASS,
    radius: SUN_RADIUS,
    mu: SUN_MU,
    semiMajorAxis: 0.0,
    orbitalPeriod: 0.0,
    orbitalSpeed: 0.0,
    color: "#FDB813",
    description: "Central star of the solar system.",
  },
  Earth: {
    id: "earth",
    name: "Earth",
    mass: 5.9722e24,
    radius: 6.371e6,
    mu: G * 5.9722e24,
    semiMajorAxis: 1.0 * AU,
    orbitalPeriod: 365.256 * DAY_IN_SECONDS,
    orbitalSpeed: 29780.0,
    color: "#3B82F6",
    description: "Standard terrestrial gravity assist test body (e.g. Galileo, Cassini, Rosetta).",
  },
  Jupiter: {
    id: "jupiter",
    name: "Jupiter",
    mass: 1.89813e27,
    radius: 6.9911e7,
    mu: G * 1.89813e27, // ~ 1.266865e17 m^3/s^2
    semiMajorAxis: 5.2044 * AU,
    orbitalPeriod: 4332.59 * DAY_IN_SECONDS,
    orbitalSpeed: 13070.0,
    color: "#F59E0B",
    description: "Giant planet used by Voyager 1, Voyager 2, and New Horizons for outer solar system slingshots.",
  },
  Saturn: {
    id: "saturn",
    name: "Saturn",
    mass: 5.6834e26,
    radius: 5.8232e7,
    mu: G * 5.6834e26,
    semiMajorAxis: 9.5826 * AU,
    orbitalPeriod: 10759.22 * DAY_IN_SECONDS,
    orbitalSpeed: 9680.0,
    color: "#E2BF7D",
    description: "Ringed gas giant used for Voyager 2 redirection toward Uranus and Neptune.",
  },
  Venus: {
    id: "venus",
    name: "Venus",
    mass: 4.8675e24,
    radius: 6.0518e6,
    mu: G * 4.8675e24,
    semiMajorAxis: 0.723332 * AU,
    orbitalPeriod: 224.701 * DAY_IN_SECONDS,
    orbitalSpeed: 35020.0,
    color: "#EC4899",
    description: "Dense inner planet used in VVEJGA multi-assist trajectories.",
  },
  Mars: {
    id: "mars",
    name: "Mars",
    mass: 6.4171e23,
    radius: 3.3895e6,
    mu: G * 6.4171e23,
    semiMajorAxis: 1.523662 * AU,
    orbitalPeriod: 686.980 * DAY_IN_SECONDS,
    orbitalSpeed: 24077.0,
    color: "#EF4444",
    description: "Used for trajectory inclination tweaking and minor orbital energy pump maneuvers.",
  },
};

// Historical Voyager 1 Flyby Constants
export const VOYAGER_MASS = 815.0; // Spacecraft encounter mass [kg]
export const JUPITER_MU = PLANET_CATALOG.Jupiter.mu;
export const JUPITER_RADIUS = PLANET_CATALOG.Jupiter.radius;
