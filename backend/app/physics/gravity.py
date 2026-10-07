"""
Newtonian Gravitational Acceleration & Multi-Body Mechanics.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 1: Basic Math & Physics Laws.
"""

from dataclasses import dataclass
from typing import List, Optional, Tuple, Callable
import numpy as np

from .constants import G, SUN_MU, SUN_RADIUS, SUN_MASS


@dataclass
class CelestialBody:
    """
    Representation of a massive celestial body (Sun, Planet, Moon).
    """
    name: str
    mass: float
    radius: float
    mu: float
    # Optional analytical orbit around central body:
    semi_major_axis: float = 0.0
    orbital_period: float = 0.0
    initial_phase: float = 0.0  # radians
    central_body_mu: float = SUN_MU
    # Custom ephemeris callable if available: f(t) -> (pos, vel)
    ephemeris_func: Optional[Callable[[float], Tuple[np.ndarray, np.ndarray]]] = None

    def __post_init__(self):
        if self.mu == 0.0 and self.mass > 0.0:
            self.mu = G * self.mass

    def get_state_at_time(self, t: float) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns (position [x, y, z], velocity [vx, vy, vz]) in SI units at time t.
        """
        if self.ephemeris_func is not None:
            return self.ephemeris_func(t)

        if self.semi_major_axis <= 0.0:
            # Stationary body at origin (e.g. Sun)
            return np.zeros(3, dtype=np.float64), np.zeros(3, dtype=np.float64)

        # 2D Keplerian circular approximation around central body
        omega = np.sqrt(self.central_body_mu / (self.semi_major_axis ** 3))
        theta = self.initial_phase + omega * t
        r = self.semi_major_axis

        pos = np.array([r * np.cos(theta), r * np.sin(theta), 0.0], dtype=np.float64)
        vel = np.array([-r * omega * np.sin(theta), r * omega * np.cos(theta), 0.0], dtype=np.float64)
        return pos, vel


def compute_gravitational_acceleration(
    spacecraft_pos: np.ndarray,
    bodies: List[CelestialBody],
    t: float = 0.0,
    eps: float = 1e-3  # Small softening parameter to avoid singularities inside core
) -> np.ndarray:
    """
    Computes total gravitational acceleration acting on spacecraft:
    a = sum_i ( -mu_i * (r_sc - r_i) / |r_sc - r_i|^3 )
    """
    sc_pos = np.asarray(spacecraft_pos, dtype=np.float64)
    total_acc = np.zeros(3, dtype=np.float64)

    for body in bodies:
        body_pos, _ = body.get_state_at_time(t)
        rel_vec = sc_pos - body_pos
        dist = float(np.linalg.norm(rel_vec))

        if dist < eps:
            continue

        dist_cubed = (dist ** 2 + eps ** 2) ** 1.5
        acc_i = - (body.mu / dist_cubed) * rel_vec
        total_acc += acc_i

    return total_acc


def two_body_acceleration(
    spacecraft_pos: np.ndarray,
    central_mu: float,
    central_body_pos: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Direct two-body Newtonian gravitational acceleration: a = -mu * r / |r|^3
    """
    r_vec = np.asarray(spacecraft_pos, dtype=np.float64)
    if central_body_pos is not None:
        r_vec = r_vec - np.asarray(central_body_pos, dtype=np.float64)

    r_mag = float(np.linalg.norm(r_vec))
    if r_mag == 0.0:
        return np.zeros(3, dtype=np.float64)

    return - (central_mu / (r_mag ** 3)) * r_vec
