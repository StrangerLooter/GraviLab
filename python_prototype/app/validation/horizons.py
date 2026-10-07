"""
NASA JPL Horizons Observational Telemetry Data Loader.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 4: NASA Telemetry Collection.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np


DATA_FILE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "voyager1_jupiter_horizons.json"


def load_horizons_dataset(path: Path = DATA_FILE_PATH) -> Dict[str, Any]:
    """
    Loads authentic NASA JPL Horizons telemetry dataset for Voyager 1 Jupiter flyby.
    """
    if not path.exists():
        raise FileNotFoundError(f"NASA Horizons dataset not found at {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def get_voyager1_initial_state() -> Tuple[float, np.ndarray]:
    """
    Returns initial encounter timestamp (t0 = 0.0) and initial 6D state vector:
    [x, y, z, vx, vy, vz] in SI units (m, m/s).
    """
    data = load_horizons_dataset()
    pts = data["telemetry_points"]
    if not pts:
        raise ValueError("Horizons telemetry points empty")

    p0 = pts[0]
    t0 = float(p0["t_sec"])
    y0 = np.array([p0["x"], p0["y"], p0["z"], p0["vx"], p0["vy"], p0["vz"]], dtype=np.float64)
    return t0, y0


def get_horizons_reference_arrays() -> Dict[str, np.ndarray]:
    """
    Extracts time, position, velocity, distance, and speed arrays from Horizons telemetry.
    """
    data = load_horizons_dataset()
    pts = data["telemetry_points"]

    times = np.array([p["t_sec"] for p in pts], dtype=np.float64)
    positions = np.array([[p["x"], p["y"], p["z"]] for p in pts], dtype=np.float64)
    velocities = np.array([[p["vx"], p["vy"], p["vz"]] for p in pts], dtype=np.float64)
    distances = np.array([p["distance_m"] for p in pts], dtype=np.float64)
    speeds = np.array([p["speed_mps"] for p in pts], dtype=np.float64)
    epochs = [p["epoch"] for p in pts]

    return {
        "times": times,
        "positions": positions,
        "velocities": velocities,
        "distances": distances,
        "speeds": speeds,
        "epochs": epochs,
    }
