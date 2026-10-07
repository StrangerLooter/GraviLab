"""
Validation API Router: NASA JPL Horizons Comparative Analysis.
Department of Mathematics, IEHE Bhopal - Gravity Assist Project.
Member 5: Data Validation & Synthesis.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.models.schemas import ValidationResponse
from app.validation.comparison import run_voyager1_horizons_comparison
from app.validation.horizons import load_horizons_dataset

router = APIRouter(prefix="/validation", tags=["validation"])


class ValidationRunRequest(BaseModel):
    dt_seconds: float = 60.0
    include_raw_points: bool = True


@router.post("/voyager1", response_model=ValidationResponse)
def validate_voyager1(req: Optional[ValidationRunRequest] = None) -> ValidationResponse:
    dt = req.dt_seconds if req else 60.0
    inc_pts = req.include_raw_points if req else True
    res = run_voyager1_horizons_comparison(dt_seconds=dt, include_raw_points=inc_pts)
    return ValidationResponse(**res)


@router.get("/raw-horizons", response_model=Dict[str, Any])
def get_raw_horizons_data() -> Dict[str, Any]:
    return load_horizons_dataset()
