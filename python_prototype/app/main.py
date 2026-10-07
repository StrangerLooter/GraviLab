"""
FastAPI Application Entry Point.
Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)
Interactive Numerical Gravitational Assist Simulator.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.planets import router as planets_router
from app.api.simulation import router as simulation_router
from app.api.validation import router as validation_router

app = FastAPI(
    title="Interactive Numerical Gravitational Assist Simulator API",
    description=(
        "Computational physics API modeling planetary gravity-assist maneuvers, "
        "solving trajectories using custom RK4 numerical integration, transforming "
        "between heliocentric and planet-centered reference frames, and validating "
        "against NASA JPL Horizons telemetry (< 5% error threshold)."
    ),
    version="1.0.0",
)

# Enable CORS for local development and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under /api
app.include_router(planets_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(validation_router, prefix="/api")


@app.get("/")
def root():
    return {
        "project": "Interactive Numerical Gravitational Assist Simulator",
        "institution": "Department of Mathematics, IEHE Bhopal",
        "status": "Online",
        "api_docs": "/docs",
        "validation_target": "< 5.0% error relative to NASA JPL Horizons telemetry",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "orbital-dynamics-rk4-engine"}
