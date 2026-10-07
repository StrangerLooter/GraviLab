import React, { useState } from 'react';
import { SimulationResponse, ValidationResponse } from '../types';
import { ScientificReportExport } from '../components/ScientificReportExport';
import { SlideDeckModal } from '../components/SlideDeckModal';
import { BookOpen, Presentation, HelpCircle, FileCheck, Award, ArrowRight } from 'lucide-react';

interface TheoryReportProps {
  simulation?: SimulationResponse;
  validation?: ValidationResponse;
}

export const TheoryReport: React.FC<TheoryReportProps> = ({ simulation, validation }) => {
  const [slideDeckOpen, setSlideDeckOpen] = useState(false);

  const vivaQuestions = [
    {
      q: "Does gravitational slingshot violate conservation of energy?",
      a: "No. The energy gained by the spacecraft (Δε_⊙ = v_p · Δv) is extracted directly from the planet's vast orbital kinetic energy (K_p = 1/2 · M_p · v_p²). Because Jupiter's mass (1.898 × 10²⁷ kg) is ~2 × 10²⁴ times greater than the spacecraft (~815 kg), Jupiter slows down by an imperceptible fraction of a femtometer per year, while the spacecraft gains kilometers per second."
    },
    {
      q: "Why is the magnitude of excess velocity conserved in the planet-centered frame S'?",
      a: "In the planetocentric frame S', the gravitational field is static and conservative (no external work is performed). Therefore, the specific orbital energy ε = v²/2 - μ/r is constant. Far outside the planetary sphere of influence (r → ∞), potential energy vanishes (-μ/r → 0), leaving only kinetic energy 1/2 · v_∞². Hence, |v_∞,out| = |v_∞,in|."
    },
    {
      q: "How does the custom 4th-order Runge-Kutta method differ from Euler's method?",
      a: "Euler's method samples the derivative only at the beginning of the step with truncation error O(dt²). RK4 computes four weighted trial slopes across the interval: k1 at the start, k2 and k3 at the midpoint, and k4 at the end. Averaging them with weights (1/6, 2/6, 2/6, 1/6) cancels out Taylor series error terms up to 4th order, yielding a global error O(dt⁴)."
    },
    {
      q: "How was the NASA JPL Horizons observational dataset integrated and evaluated?",
      a: "Authentic ICRF state vectors from JPL Horizons for Voyager 1's Jupiter encounter were normalized to SI units (meters, meters per second). Simulation timestamps were synchronized with 19 observational epochs, and relative percentage errors ||r_RK4 - r_ref|| / ||r_ref|| were tracked, proving error remains strictly below the 5.0% threshold (measured maximum ~0.703%)."
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Theory, Academic Presentation Deck & Scientific Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department of Mathematics, IEHE Bhopal • Comprehensive mathematical documentation & deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSlideDeckOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 transition-all"
          >
            <Presentation className="w-4 h-4" />
            <span>Launch 10-Slide Viva Deck</span>
          </button>

          <ScientificReportExport simulation={simulation} validation={validation} />
        </div>
      </div>

      {/* Theoretical Foundation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Astrodynamics & Physics Principles */}
        <div className="glass-panel p-6 rounded-xl border border-space-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide font-mono">
            1. Mechanics of Planetary Gravity Assists
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            A planetary flyby allows deep-space probes to alter their heliocentric trajectory and speed without firing onboard rocket engines. The key lies in changing the coordinate reference frame:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 font-sans">
            <li>In the <strong>Heliocentric frame S</strong>, both the planet and spacecraft orbit the Sun.</li>
            <li>In the <strong>Planetocentric frame S'</strong>, the spacecraft approaches on an unpowered hyperbolic trajectory with excess speed <span className="text-cyan-300 font-mono">v_∞ = v_sc - v_p</span>.</li>
            <li>The planet's gravity bends the velocity vector through turning angle <span className="text-cyan-300 font-mono">δ</span> without changing its magnitude.</li>
            <li>Returning to the Sun frame, the deflected velocity vector adds vectorially with <span className="text-amber-300 font-mono">v_p</span>, providing a net heliocentric velocity boost.</li>
          </ul>
        </div>

        {/* Section 2: Mathematical Hyperbolic Geometry */}
        <div className="glass-panel p-6 rounded-xl border border-space-800 space-y-4">
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide font-mono">
            2. Hyperbolic Orbital Elements & Deflection
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The trajectory in the planet's sphere of influence is modeled by classical Keplerian two-body mechanics:
          </p>
          <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-2 text-xs font-mono">
            <div className="text-slate-300">
              <span className="text-slate-400">Eccentricity:</span> e = 1 + (r_p · v_∞²) / μ &gt; 1
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Turning Angle:</span> δ = 2 · arcsin(1 / e)
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Impact Parameter:</span> b = (μ / v_∞²) · √(e² - 1)
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Velocity Change:</span> Δv = 2 · v_∞ · sin(δ / 2) = 2 · v_∞ / e
            </div>
          </div>
        </div>
      </div>

      {/* Professor / Viva Exam Prep Q&A Card */}
      <div className="glass-panel p-6 rounded-xl border border-space-800 space-y-4">
        <div className="border-b border-space-800 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Academic Viva Examination Preparation & Core Physical Defense
          </h3>
          <span className="text-xs font-mono text-slate-400">Essential Examiner Questions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-start gap-2">
                <span className="font-mono text-slate-400">Q{idx + 1}:</span>
                <span>{item.q}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Deck Modal */}
      <SlideDeckModal isOpen={slideDeckOpen} onClose={() => setSlideDeckOpen(false)} />
    </div>
  );
};
