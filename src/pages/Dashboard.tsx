import React from 'react';
import { Preset, Planet } from '../types';
import { Orbit, Compass, ShieldCheck, Activity, Award, ArrowRight, Play, Users, BookOpen } from 'lucide-react';

interface DashboardProps {
  presets: Preset[];
  planets: Planet[];
  onSelectPresetAndLaunch: (preset: Preset) => void;
  onNavigateTab: (tab: string) => void;
  backendHealthy: boolean;
  onOpenSlideDeck: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  presets,
  planets,
  onSelectPresetAndLaunch,
  onNavigateTab,
  backendHealthy,
  onOpenSlideDeck,
}) => {
  const teamMembers = [
    {
      role: "Member 1",
      domain: "Basic Math & Physics Laws",
      responsibilities: "Formulates baseline conservation equations for kinetic energy, angular momentum, and hyperbolic orbital geometry."
    },
    {
      role: "Member 2",
      domain: "Vector Calculations & Angles",
      responsibilities: "Computes reference frame transformations between heliocentric (S) and planetocentric (S') frames; derives turning deflection angle δ."
    },
    {
      role: "Member 3",
      domain: "Python Coding & Numerics",
      responsibilities: "Develops core 4th-order Runge-Kutta (RK4) python integration scripts, timestep convergence testing O(Δt⁴)."
    },
    {
      role: "Member 4",
      domain: "NASA Telemetry Collection",
      responsibilities: "Retrieves Voyager 1 ephemeris and state vectors from NASA JPL Horizons database; structures data in SI units for validation."
    },
    {
      role: "Member 5",
      domain: "Data Validation & Synthesis",
      responsibilities: "Performs quantitative comparison between RK4 model and NASA telemetry, computes error margins (< 5%), authors final 10-slide deck."
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Mission Control Header */}
      <div className="relative rounded-2xl overflow-hidden border border-space-800 bg-gradient-to-br from-space-900 via-space-950 to-space-900 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Undergraduate Computational Physics Project P1</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Interactive Numerical Gravitational Assist Simulator
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Mathematically model planetary gravity-assist maneuvers, numerically solve spacecraft trajectory equations of motion using a custom <strong>4th-order Runge-Kutta (RK4)</strong> integrator in Python, transform between heliocentric and planet-centered reference frames, and validate simulations against authentic <strong>NASA JPL Horizons</strong> flight telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('simlab')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 transition-all"
            >
              <Orbit className="w-4 h-4" />
              <span>Launch 3D Simulation Lab</span>
            </button>

            <button
              onClick={() => onNavigateTab('validation')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs font-mono bg-space-800 hover:bg-space-700 text-slate-200 border border-space-700 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Inspect NASA Horizons Validation (&lt; 5%)</span>
            </button>

            <button
              onClick={onOpenSlideDeck}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs font-mono bg-space-800 hover:bg-space-700 text-slate-200 border border-space-700 transition-all"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Open 10-Slide Viva Deck</span>
            </button>
          </div>
        </div>

        {/* Institutional Accreditation */}
        <div className="mt-8 pt-4 border-t border-space-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div>
            <strong>Institution:</strong> Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)
          </div>
          <div className="font-mono text-cyan-400/90">
            Engine: Python 3.13 • Custom RK4 • FastAPI Gateway
          </div>
        </div>
      </div>

      {/* SMART Objectives Scorecard */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          SMART Objectives Framework (Proposal Section 5)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl glass-panel border border-space-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">Specific</span>
            <div className="text-xs font-semibold text-white">Quantify Δv & Turning δ</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Compute velocity vector change and deflection angle using classical mechanics equations.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-emerald-500/40 bg-emerald-500/5 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Measurable</span>
            <div className="text-xs font-semibold text-emerald-300">Strict &lt; 5% Error Target</div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Maintain relative percentage error between Python RK4 solver and NASA JPL Horizons under 5%.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-space-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Achievable</span>
            <div className="text-xs font-semibold text-white">6-Week Architecture</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Execute derivations, numerical solver, and comparative analysis in defined phases.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-space-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400">Realistic</span>
            <div className="text-xs font-semibold text-white">Authentic Voyager 1</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Model authentic planetary flyby to demonstrate propellantless momentum transfer.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-space-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-blue-400">Time-Bound</span>
            <div className="text-xs font-semibold text-white">Full Slide Deck & Report</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Produce 10-slide viva deck and verifiable scientific report deliverables.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Missions Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Standard Planetary Flyby Presets
          </h2>
          <span className="text-xs text-slate-500 font-mono">Click to launch in 3D simulator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="glass-panel p-5 rounded-xl border border-space-800 flex flex-col justify-between glass-card-hover group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-cyan-300 uppercase">
                    {preset.planet_id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {preset.simulation_duration_days} days
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {preset.description}
                </p>
              </div>

              <div className="pt-4 border-t border-space-800/80 mt-4 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400">
                  v_∞: <strong className="text-slate-200">{preset.v_inf_km_s} km/s</strong>
                </div>
                <button
                  onClick={() => onSelectPresetAndLaunch(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600 hover:text-white transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Launch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Five-Member Student Team Workload Distribution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Five-Member Student Division of Work (Proposal Section 3)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Formal academic allocation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-space-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">{member.role}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-white">{member.domain}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {member.responsibilities}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
