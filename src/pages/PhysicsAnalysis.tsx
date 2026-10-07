import React from 'react';
import { SimulationResponse } from '../types';
import { FrameTransformCard } from '../components/FrameTransformCard';
import { EnergyChart } from '../components/EnergyChart';
import { ConvergencePlot } from '../components/ConvergencePlot';
import { Activity, BookOpen, Layers, CheckCircle } from 'lucide-react';

interface PhysicsAnalysisProps {
  simulation: SimulationResponse | null;
  selectedPlanetId: string;
}

export const PhysicsAnalysis: React.FC<PhysicsAnalysisProps> = ({
  simulation,
  selectedPlanetId,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-space-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Physics Analysis & Conservation Laws
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed mathematical verification of Galilean frame transformations, hyperbolic orbital mechanics, specific energy conservation in S', and numerical RK4 convergence.
        </p>
      </div>

      {/* Frame Transformations Module (Member 2 Domain) */}
      <FrameTransformCard simulation={simulation || undefined} />

      {/* Energy & Momentum Conservation Chart (Member 1 Domain) */}
      {simulation?.trajectory && <EnergyChart trajectory={simulation.trajectory} />}

      {/* RK4 Timestep Convergence Panel (Member 3 Domain) */}
      <ConvergencePlot planetId={selectedPlanetId} />

      {/* Mathematical Formulations Card */}
      <div className="glass-panel p-6 rounded-xl border border-space-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          Governing Mathematical Equations Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-space-950 border border-space-800 space-y-2">
            <span className="text-cyan-400 font-bold">1. Specific Orbital Energy (Planet Frame S')</span>
            <div className="text-slate-200 p-2 rounded bg-space-900 border border-space-800">
              ε = (1/2) · v² - (μ / r) = constant
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Since the flyby is unpowered, specific orbital energy is strictly conserved along the hyperbolic trajectory relative to the planet.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-space-950 border border-space-800 space-y-2">
            <span className="text-amber-400 font-bold">2. Heliocentric Energy Exchange (Sun Frame S)</span>
            <div className="text-slate-200 p-2 rounded bg-space-900 border border-space-800">
              Δε_⊙ = (1/2) · (v_out² - v_in²) = v_p · Δv
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              The heliocentric energy boost is directly proportional to the dot product of the planet's orbital velocity and the spacecraft's deflected velocity vector.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-space-950 border border-space-800 space-y-2">
            <span className="text-purple-400 font-bold">3. Hyperbolic Deflection Angle δ</span>
            <div className="text-slate-200 p-2 rounded bg-space-900 border border-space-800">
              δ = 2 · arcsin(1 / e),  where e = 1 + (r_p · v_∞²) / μ
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              The turning angle increases with stronger planetary gravity (higher μ) and closer periapsis approach (smaller r_p).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-space-950 border border-space-800 space-y-2">
            <span className="text-emerald-400 font-bold">4. Custom 4th-Order Runge-Kutta Step</span>
            <div className="text-slate-200 p-2 rounded bg-space-900 border border-space-800">
              y_{'{n+1}'} = y_n + (dt/6) · (k1 + 2·k2 + 2·k3 + k4)
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              The fourth-order RK4 integration scheme provides local truncation error O(dt⁵) and global truncation error O(dt⁴).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
