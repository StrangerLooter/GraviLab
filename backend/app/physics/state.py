"""
State Vector Representation & Derivatives for 3D Orbital Dynamics.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 3: Python Coding & Numerics.
"""

from dataclasses import dataclass
from typing import Union, List, Dict, Any
import numpy as np


@dataclass
class StateVector:
    """
    Cartesian State Vector [x, y, z, vx, vy, vz] in SI units (m, m/s).
    """
    x: float
    y: float
    z: float
    vx: float
    vy: float
    vz: float

    @property
    def position(self) -> np.ndarray:
        return np.array([self.x, self.y, self.z], dtype=np.float64)

    @property
    def velocity(self) -> np.ndarray:
        return np.array([self.vx, self.vy, self.vz], dtype=np.float64)

    @property
    def speed(self) -> float:
        return float(np.linalg.norm(self.velocity))

    @property
    def distance(self) -> float:
        return float(np.linalg.norm(self.position))

    def to_numpy(self) -> np.ndarray:
        return np.array([self.x, self.y, self.z, self.vx, self.vy, self.vz], dtype=np.float64)

    def to_dict(self) -> Dict[str, float]:
        return {
            "x": self.x,
            "y": self.y,
            "z": self.z,
            "vx": self.vx,
            "vy": self.vy,
            "vz": self.vz,
            "speed": self.speed,
            "distance": self.distance,
        }

    @classmethod
    def from_numpy(cls, arr: Union[np.ndarray, List[float]]) -> "StateVector":
        arr = np.asarray(arr, dtype=np.float64).flatten()
        if len(arr) != 6:
            raise ValueError(f"StateVector requires exactly 6 elements, received {len(arr)}")
        return cls(
            x=float(arr[0]),
            y=float(arr[1]),
            z=float(arr[2]),
            vx=float(arr[3]),
            vy=float(arr[4]),
            vz=float(arr[5]),
        )

    @classmethod
    def from_pos_vel(cls, r: np.ndarray, v: np.ndarray) -> "StateVector":
        r = np.asarray(r, dtype=np.float64)
        v = np.asarray(v, dtype=np.float64)
        return cls(
            x=float(r[0]),
            y=float(r[1]),
            z=float(r[2]),
            vx=float(v[0]),
            vy=float(v[1]),
            vz=float(v[2]),
        )


def compute_state_derivative(
    state: Union[StateVector, np.ndarray],
    acceleration: Union[np.ndarray, List[float]]
) -> np.ndarray:
    """
    Computes dy/dt = [vx, vy, vz, ax, ay, az]^T given current state and acceleration vector.
    """
    if isinstance(state, StateVector):
        vx, vy, vz = state.vx, state.vy, state.vz
    else:
        vx, vy, vz = state[3], state[4], state[5]

    ax, ay, az = acceleration[0], acceleration[1], acceleration[2]
    return np.array([vx, vy, vz, ax, ay, az], dtype=np.float64)
