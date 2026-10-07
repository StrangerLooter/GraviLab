import React from 'react';
import { SimulationResponse } from '../types';
import { ArrowRight, Layers, CheckCircle, Scale } from 'lucide-react';
import { formatSpeedKmS } from '../utils/formatters';

interface FrameTransformCardProps {
  simulation?: SimulationResponse;
}

export const FrameTransformCard: React.FC<FrameTransformCardProps> = ({ simulation }) => {
  if (!simulation) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-space-800 text-center text-slate-400">
        Run simulation to view reference-frame transformations.
      </div>
    );
  }

  const { metrics, planet, initial_state, final_state } = simulation;
  const vp = planet.orbital_speed_km_s;
  const vInfIn = metrics.v_infinity_in_km_s;
  const vInfOut = metrics.v_infinity_out_km_s;
  const conservationRatio = vInfIn > 0 ? (vInfOut / vInfIn) * 100 : 100;

  return (
    <div className="glass-panel p-6 rounded-xl border border-space-800 space-y-6">
      {/* Title & Core Principle */}
      <div className="border-b border-space-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          Reference-Frame Transformations: Heliocentric (S) ↔ Planetocentric (S')
        </div>
        <p className="text-xs text-slate-400">
          Galilean state transformations demonstrate why the planetocentric excess speed magnitude is conserved (<span className="text-cyan-300 font-mono">|v_∞,out| ≈ |v_∞,in|</span>) while the heliocentric speed increases through orbital momentum exchange (<span className="text-amber-300 font-mono">Δε_⊙ = v_p · Δv</span>).
        </p>
      </div>

      {/* Frame Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planet-Centered Frame S' */}
        <div className="p-4 rounded-xl bg-space-950/80 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-cyan-300 font-mono">
              Planet Frame (S') — Jupiter Centered
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Energy Conserved
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span>Incoming Asymptote |v_∞,in|:</span>
              <strong className="text-white">{formatSpeedKmS(vInfIn)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Outgoing Asymptote |v_∞,out|:</span>
              <strong className="text-white">{formatSpeedKmS(vInfOut)}</strong>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-space-800 text-emerald-400">
              <span className="flex items-center gap-1.5 font-sans font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Hyperbolic Excess Conservation:
              </span>
              <strong>{conservationRatio.toFixed(3)}%</strong>
            </div>
          </div>

          <div className="p-2.5 rounded bg-space-900 border border-space-800 text-[11px] text-slate-400 font-mono">
            Trajectory in S' is a pure Keplerian hyperbola with turning angle δ = 2·arcsin(1/e) = {metrics.turning_angle_deg.toFixed(2)}°. No net energy is gained or lost relative to {planet.name}.
          </div>
        </div>

        {/* Sun-Centered Frame S */}
        <div className="p-4 rounded-xl bg-space-950/80 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-amber-300 font-mono">
              Sun Frame (S) — Heliocentric
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Energy Exchanged
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span>Planet Orbital Speed |v_p|:</span>
              <strong className="text-amber-400">{formatSpeedKmS(vp)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Heliocentric Velocity Boost Δv:</span>
              <strong className="text-amber-300">+{formatSpeedKmS(metrics.delta_v_km_s)}</strong>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-space-800 text-amber-400">
              <span className="flex items-center gap-1.5 font-sans font-medium">
                <Scale className="w-3.5 h-3.5" />
                Specific Energy Transfer Δε_⊙:
              </span>
              <strong>+{metrics.delta_energy_helio_mj_kg.toFixed(2)} MJ/kg</strong>
            </div>
          </div>

          <div className="p-2.5 rounded bg-space-900 border border-space-800 text-[11px] text-slate-400 font-mono">
            In the heliocentric frame S, the vector sum v_sc = v_p + v_∞ alters the direction of v_∞, aligning it closer to v_p and extracting orbital kinetic energy from {planet.name}.
          </div>
        </div>
      </div>

      {/* Vector Triangle Diagram (SVG) */}
      <div className="p-4 rounded-xl bg-space-950/60 border border-space-800 space-y-3">
        <div className="text-xs font-semibold text-slate-300">
          Vector Addition Geometry: <span className="font-mono text-cyan-400">v_sc = v_p + v_∞</span>
        </div>
        <div className="w-full flex items-center justify-center py-2">
          <svg viewBox="0 0 500 160" className="w-full max-w-lg h-36">
            <defs>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
              </marker>
              <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
              </marker>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06B6D4" />
              </marker>
            </defs>

            {/* v_p (planet velocity) */}
            <line x1="50" y1="120" x2="220" y2="120" stroke="#F59E0B" strokeWidth="3" markerEnd="url(#arrow-amber)" />
            <text x="135" y="140" fill="#F59E0B" fontSize="12" fontFamily="monospace" textAnchor="middle">v_p ({vp} km/s)</text>

            {/* v_inf,out */}
            <line x1="220" y1="120" x2="380" y2="40" stroke="#8B5CF6" strokeWidth="3" markerEnd="url(#arrow-purple)" />
            <text x="315" y="70" fill="#8B5CF6" fontSize="12" fontFamily="monospace" textAnchor="middle">v_∞,out ({vInfOut.toFixed(1)} km/s)</text>

            {/* Resulting v_sc,out */}
            <line x1="50" y1="120" x2="380" y2="40" stroke="#06B6D4" strokeWidth="3" strokeDasharray="4 2" markerEnd="url(#arrow-cyan)" />
            <text x="190" y="65" fill="#06B6D4" fontSize="12" fontFamily="monospace" textAnchor="middle">v_sc,out (Heliocentric)</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
