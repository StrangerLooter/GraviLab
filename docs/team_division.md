# Five-Member Team Technical Division & Module Ownership

**Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)**  
**Undergraduate Computational Physics Project P1**  
*Interactive Numerical Gravitational Assist Simulator*

---

## Technical Allocation & Peer-Reviewed Responsibilities

| Team Member | Assigned Technical Domain | Key Functional Responsibilities | Implemented Code Architecture |
|---|---|---|---|
| **Member 1** | Basic math & physics laws | Formulates baseline conservation equations for kinetic energy, angular momentum, and hyperbolic orbital geometry. | `backend/app/physics/gravity.py`<br>`backend/app/physics/constants.py`<br>`backend/app/physics/conservation.py`<br>`backend/tests/test_gravity.py` |
| **Member 2** | Vector calculations & angles | Computes reference frame transformations between heliocentric (S) and planetocentric (S') frames; derives turning deflection angle $\delta$. | `backend/app/physics/reference_frames.py`<br>`backend/app/physics/orbital_mechanics.py`<br>`backend/tests/test_reference_frames.py`<br>`frontend/src/components/FrameTransformCard.tsx` |
| **Member 3** | Python coding & numerics | Develops core 4th-order Runge-Kutta (RK4) python integration scripts; generates trajectory convergence study. | `backend/app/physics/rk4.py`<br>`backend/app/physics/state.py`<br>`backend/tests/test_rk4.py`<br>`frontend/src/components/ConvergencePlot.tsx` |
| **Member 4** | NASA Telemetry collection | Retrieves Voyager 1 ephemeris and state vectors from NASA JPL Horizons database; structures data for validation in SI units. | `backend/data/voyager1_jupiter_horizons.json`<br>`backend/app/validation/horizons.py`<br>`backend/tests/test_validation.py` |
| **Member 5** | Data validation & synthesis | Performs quantitative comparison between RK4 model and NASA telemetry, computes error margins (< 5%), and authors final 10-slide deck. | `backend/app/validation/comparison.py`<br>`backend/app/validation/error_metrics.py`<br>`frontend/src/components/SlideDeckModal.tsx`<br>`frontend/src/pages/ValidationPage.tsx` |
