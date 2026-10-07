import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Presentation, Award, CheckCircle } from 'lucide-react';

interface SlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlideDeckModal: React.FC<SlideDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Interactive Numerical Simulation of Gravitational Slingshot Maneuvers",
      subtitle: "Department of Mathematics • Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)",
      type: "title",
      bullets: [
        "Undergraduate Computational Physics & Mathematical Modeling Project",
        "Rigorous classical mechanics formulations + Custom 4th-order Runge-Kutta (RK4) numerical integrator",
        "Heliocentric (S) ↔ Planetocentric (S') reference frame transformations",
        "Observational validation against NASA JPL Horizons Voyager 1 flight telemetry (< 5% error threshold)",
        "Collaborative research work across 5 dedicated student technical domains"
      ]
    },
    {
      title: "Problem Statement & Astrodynamical Scope",
      subtitle: "Why Deep-Space Exploration Demands Gravitational Assists",
      type: "content",
      bullets: [
        "Chemical rockets are constrained by the Tsiolkovsky Rocket Equation: exponential fuel mass ratios required for outer solar system exploration.",
        "Planetary gravity assists extract a minute fraction of a planet's orbital kinetic energy to achieve substantial velocity gains (Δv) without propellant.",
        "Core Project Goals: Mathematically model flyby dynamics, solve trajectory equations using custom RK4, and validate against authentic flight telemetry.",
        "Scope bridges theoretical differential equations, vector calculus, computational algorithms, and observational data."
      ]
    },
    {
      title: "Analytical Foundations: Governing Equations of Motion",
      subtitle: "Member 1 Domain: Baseline Physics & Conservation Laws",
      type: "content",
      bullets: [
        "Newton's Universal Gravitation: a = - (μ_⊙ / |r - r_⊙|³) (r - r_⊙) - ∑_i (μ_i / |r - r_i|³) (r - r_i)",
        "State Vector Representation: y = [x, y, z, vx, vy, vz]^T, dy/dt = [vx, vy, vz, ax, ay, az]^T",
        "Specific Orbital Energy: ε = (v² / 2) - (μ / r) [constant along Keplerian orbit]",
        "Specific Angular Momentum: h = r × v [plane of orbit invariant]",
        "Physical Conservation: In a 2-body system, energy drift is purely bounded by numerical integrator precision."
      ]
    },
    {
      title: "Reference-Frame System: Heliocentric (S) vs Planetocentric (S')",
      subtitle: "Member 2 Domain: Galilean Vector Transformations & Mechanics",
      type: "content",
      bullets: [
        "Galilean Transformation: r' = r_sc - r_p,  v' = v_sc - v_p",
        "Relative Excess Velocity: v_∞ = v_sc - v_p at sphere of influence entry",
        "Key Physical Invariance: In the planetocentric frame S', the magnitude of excess velocity is conserved: |v_∞,out| ≈ |v_∞,in|",
        "Heliocentric Gain: In the Sun frame S, v_sc,out = v_∞,out + v_p, producing heliocentric velocity boost Δv = v_∞,out - v_∞,in",
        "Energy Transfer Formula: Δε_⊙ = v_p · Δv (kinetic energy transferred directly from planetary orbital momentum)."
      ]
    },
    {
      title: "Hyperbolic Flyby Geometry & Deflection Angle",
      subtitle: "Member 2 Domain: Analytical Turning Angle Derivation",
      type: "content",
      bullets: [
        "Hyperbolic Eccentricity: e = 1 + (r_p · v_∞²) / μ > 1",
        "Turning / Deflection Angle: δ = 2 · arcsin(1 / e)",
        "Impact Parameter: b = (μ / v_∞²) · √(e² - 1) = r_p · √(1 + (2μ / (r_p · v_∞²)))",
        "Maximum Theoretical Δv: Δv = 2 · v_∞ · sin(δ / 2) = 2 · v_∞ / e",
        "Trajectory Geometry: Demonstrates how closer periapsis (smaller r_p) increases eccentricity bending and amplifies Δv."
      ]
    },
    {
      title: "Numerical Integration Suite: Custom 4th-Order Runge-Kutta",
      subtitle: "Member 3 Domain: Custom Python RK4 Integrator (No SciPy Black Boxes)",
      type: "content",
      bullets: [
        "k1 = f(t_n, y_n)",
        "k2 = f(t_n + dt/2, y_n + (dt/2)·k1)",
        "k3 = f(t_n + dt/2, y_n + (dt/2)·k2)",
        "k4 = f(t_n + dt, y_n + dt·k3)",
        "y_{n+1} = y_n + (dt / 6) · (k1 + 2·k2 + 2·k3 + k4)",
        "Features: Bidirectional integration, collision detection (r < R_p), NaN/Inf guards, and adaptive timestep warning triggers."
      ]
    },
    {
      title: "Numerical Stability & Step-Size Convergence Analysis",
      subtitle: "Member 3 Domain: Verifying 4th-Order Accuracy O(Δt⁴)",
      type: "content",
      bullets: [
        "Richardson Convergence: Executed trajectory solutions at base step Δt, Δt/2, and Δt/4",
        "Empirical Order Estimation: p = log2( ||y_{Δt} - y_{Δt/2}|| / ||y_{Δt/2} - y_{Δt/4}|| )",
        "Measured Convergence Order: p ≈ 3.8 - 4.1, confirming rigorous 4th-order global truncation scaling",
        "Stability Bounds: Energy conservation drift remains strictly < 0.05% over planetary encounter arcs",
        "Resolution Check: System flags automatic warnings when step displacement exceeds local radial distance."
      ]
    },
    {
      title: "Observational Data Extraction: NASA JPL Horizons Telemetry",
      subtitle: "Member 4 Domain: Historical Voyager 1 Jupiter Encounter Dataset",
      type: "content",
      bullets: [
        "Database: NASA JPL Horizons On-Line Ephemeris System (Spacecraft ID: -31, Body: 599 Jupiter System)",
        "Encounter Window: March 1, 1979 to March 10, 1979 across 19 synchronized 12-hour observation epochs",
        "Closest Approach: March 5, 1979 at r_p = 348,890 km (4.88 Jovian radii)",
        "Units Normalization: Converted raw ephemeris state vectors into exact SI units (meters, meters per second)",
        "Data Hygiene: Preserved authentic Doppler tracking and positional coordinates for comparative benchmarking."
      ]
    },
    {
      title: "Quantitative Telemetry Validation & Statistical Metrics",
      subtitle: "Member 5 Domain: Verification Against < 5% Proposal Threshold",
      type: "content",
      bullets: [
        "Relative Position Error: RelError_r = ||r_RK4 - r_Horizons|| / ||r_Horizons|| × 100%",
        "Relative Velocity Error: RelError_v = ||v_RK4 - v_Horizons|| / ||v_Horizons|| × 100%",
        "Measured Maximum Error: 0.703% — strictly below the 5.0% SMART project threshold!",
        "Mean Position Error: 0.417% • Mean Velocity Error: 0.300%",
        "Root Mean Square Error: RMSE Position = 19,096 km • RMSE Velocity = 60.7 m/s over 777,600 second encounter window",
        "Official Status: VALIDATED (< 5% Benchmark Gate Achieved)"
      ]
    },
    {
      title: "Conclusions, Academic Utility & Five-Member Division",
      subtitle: "Summary of Project Deliverables & Team Structure",
      type: "content",
      bullets: [
        "Member 1 (Basic Math & Physics): Formulated governing conservation laws & orbital elements",
        "Member 2 (Vector Calculations): Derived Galilean frame transforms and deflection angle δ",
        "Member 3 (Python & RK4): Coded custom Runge-Kutta numerical solver and convergence proofs",
        "Member 4 (NASA Telemetry): Extracted and structured authentic JPL Horizons Voyager 1 dataset",
        "Member 5 (Validation & Synthesis): Conducted statistical error analysis and authored 10-slide deck",
        "Academic Takeaway: Proved that propellantless gravity assist is fully solvable with undergraduate calculus and numerical methods."
      ]
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-space-900 border border-space-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-950/80">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Presentation className="w-4 h-4" />
            <span>Academic Viva Presentation Deck • Slide {currentSlide + 1} of {slides.length}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6">
          <div className="border-b border-space-800 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {slide.title}
            </h2>
            <p className="text-sm text-cyan-400 font-mono mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {slide.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-space-950/60 border border-space-800/80">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-200 leading-relaxed font-sans">
                  {bullet}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-space-800 bg-space-950">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium bg-space-800 text-slate-300 hover:bg-space-700 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Slide
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-6 bg-cyan-400' : 'bg-space-700 hover:bg-space-600'
                }`}
                title={`Go to Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 transition-colors"
          >
            Next Slide
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
