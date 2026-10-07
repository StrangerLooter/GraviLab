"""
Planet Catalog & Presets API Router.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(tags=["planets"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get("/planets", response_model=List[Dict[str, Any]])
def get_planets() -> List[Dict[str, Any]]:
    """Returns available planetary bodies and their physical characteristics."""
    path = DATA_DIR / "planets.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/presets", response_model=List[Dict[str, Any]])
def get_presets() -> List[Dict[str, Any]]:
    """Returns mission presets (Voyager 1, Earth assist, Saturn redirection, etc.)."""
    path = DATA_DIR / "presets.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
