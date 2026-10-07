"""
Planetary and Astronomical Constants (SI Units).
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 1: Basic Math & Physics Laws.
"""

from typing import Final, Dict, Any

# Fundamental physical constants
G: Final[float] = 6.67430e-11  # Universal gravitational constant [m^3 / (kg * s^2)]
AU: Final[float] = 1.495978707e11  # Astronomical Unit [m]
SPEED_OF_LIGHT: Final[float] = 299792458.0  # Speed of light [m/s]
DAY_IN_SECONDS: Final[float] = 86400.0  # Seconds in a day [s]
YEAR_IN_SECONDS: Final[float] = 365.25 * DAY_IN_SECONDS  # Seconds in Julian year [s]

# Central Body (Sun)
SUN_MASS: Final[float] = 1.98847e30  # Mass of Sun [kg]
SUN_RADIUS: Final[float] = 6.9634e8  # Radius of Sun [m]
SUN_MU: Final[float] = G * SUN_MASS  # Standard gravitational parameter [m^3 / s^2]

# Planetary Data (SI Units)
# Mass [kg], Mean Radius [m], Orbital Semi-Major Axis [m], Mean Orbital Speed [m/s]
PLANET_CATALOG: Final[Dict[str, Dict[str, Any]]] = {
    "Sun": {
        "name": "Sun",
        "mass": SUN_MASS,
        "radius": SUN_RADIUS,
        "mu": SUN_MU,
        "semi_major_axis": 0.0,
        "orbital_period": 0.0,
        "orbital_speed": 0.0,
        "color": "#FDB813",
    },
    "Mercury": {
        "name": "Mercury",
        "mass": 3.3011e23,
        "radius": 2.4397e6,
        "mu": G * 3.3011e23,
        "semi_major_axis": 0.387098 * AU,
        "orbital_period": 87.969 * DAY_IN_SECONDS,
        "orbital_speed": 47362.0,
        "color": "#9E9E9E",
    },
    "Venus": {
        "name": "Venus",
        "mass": 4.8675e24,
        "radius": 6.0518e6,
        "mu": G * 4.8675e24,
        "semi_major_axis": 0.723332 * AU,
        "orbital_period": 224.701 * DAY_IN_SECONDS,
        "orbital_speed": 35020.0,
        "color": "#E3BB76",
    },
    "Earth": {
        "name": "Earth",
        "mass": 5.9722e24,
        "radius": 6.371e6,
        "mu": G * 5.9722e24,
        "semi_major_axis": 1.000000 * AU,
        "orbital_period": 365.256 * DAY_IN_SECONDS,
        "orbital_speed": 29780.0,
        "color": "#4B9CD3",
    },
    "Mars": {
        "name": "Mars",
        "mass": 6.4171e23,
        "radius": 3.3895e6,
        "mu": G * 6.4171e23,
        "semi_major_axis": 1.523662 * AU,
        "orbital_period": 686.980 * DAY_IN_SECONDS,
        "orbital_speed": 24077.0,
        "color": "#D14A28",
    },
    "Jupiter": {
        "name": "Jupiter",
        "mass": 1.89813e27,
        "radius": 6.9911e7,
        "mu": G * 1.89813e27,  # ~ 1.266865e17 m^3/s^2
        "semi_major_axis": 5.2044 * AU,
        "orbital_period": 4332.59 * DAY_IN_SECONDS,
        "orbital_speed": 13070.0,
        "color": "#D39C7E",
    },
    "Saturn": {
        "name": "Saturn",
        "mass": 5.6834e26,
        "radius": 5.8232e7,
        "mu": G * 5.6834e26,
        "semi_major_axis": 9.5826 * AU,
        "orbital_period": 10759.22 * DAY_IN_SECONDS,
        "orbital_speed": 9680.0,
        "color": "#E2BF7D",
    },
    "Uranus": {
        "name": "Uranus",
        "mass": 8.6810e25,
        "radius": 2.5362e7,
        "mu": G * 8.6810e25,
        "semi_major_axis": 19.201 * AU,
        "orbital_period": 30685.4 * DAY_IN_SECONDS,
        "orbital_speed": 6800.0,
        "color": "#93B8BE",
    },
    "Neptune": {
        "name": "Neptune",
        "mass": 1.02413e26,
        "radius": 2.4622e7,
        "mu": G * 1.02413e26,
        "semi_major_axis": 30.047 * AU,
        "orbital_period": 60189.0 * DAY_IN_SECONDS,
        "orbital_speed": 5430.0,
        "color": "#3E66F3",
    },
}

# Voyager 1 Flyby Historical Constants (Jupiter Encounter March 1979)
VOYAGER_MASS: Final[float] = 815.0  # Spacecraft dry mass at encounter [kg]
JUPITER_RADIUS: Final[float] = PLANET_CATALOG["Jupiter"]["radius"]
JUPITER_MU: Final[float] = PLANET_CATALOG["Jupiter"]["mu"]
