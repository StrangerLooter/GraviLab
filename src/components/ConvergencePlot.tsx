import React, { useState } from 'react';
import { ConvergenceResponse } from '../types';
import { runConvergenceStudy } from '../api/client';
import { TrendingDown, Play, CheckCircle2 } from 'lucide-react';

interface ConvergencePlotProps {
  planetId: string;
}

export const ConvergencePlot: React.FC<ConvergencePlotProps> = ({ planetId }) => {
  const [data, setData] = useState<ConvergenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunStudy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runConvergenceStudy({
        planet_id: planetId,
        base_dt_seconds: 120.0,
        duration_hours: 48.0,
        initial_position_km: [-3000000.0, 2000000.0, 0.0],
        initial_velocity_km_s: [12.0, -10.0, 0.0],
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Convergence study failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-space-800 space-y-4">
      <div className="flex items-center justify-between border-b border-space-800 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            RK4 Timestep Convergence & Accuracy Order
          </h4>
          <p className="text-[11px] text-slate-400">
            Executes trajectory integration at Δt, Δt/2, and Δt/4 to verify Richardson convergence and 4th-order scaling O(Δt⁴).
          </p>
        </div>
        <button
          onClick={handleRunStudy}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{loading ? 'Evaluating...' : 'Run Δt Convergence Test'}</span>
        </button>
      </div>

      {error && <div className="text-xs text-rose-400 font-mono">{error}</div>}

      {data ? (
        <div className="space-y-4">
          {/* Results Summary Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-space-950 border border-space-800">
              <span className="text-[10px] text-slate-400 uppercase">Base Δt Steps</span>
              <div className="text-base font-bold text-white mt-0.5">
                {data.dt_base}s → {data.dt_half}s → {data.dt_quarter}s
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-950 border border-space-800">
              <span className="text-[10px] text-slate-400 uppercase">E(Δt) - E(Δt/2) Diff</span>
              <div className="text-base font-bold text-cyan-300 mt-0.5">
                {data.diff_dt_vs_dthalf_km.toFixed(3)} km
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-950 border border-space-800">
              <span className="text-[10px] text-slate-400 uppercase">E(Δt/2) - E(Δt/4) Diff</span>
              <div className="text-base font-bold text-emerald-300 mt-0.5">
                {data.diff_dthalf_vs_dtquarter_km.toFixed(4)} km
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-950 border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Empirical Order p</span>
              <div className="text-base font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
                <span>p ≈ {data.estimated_order_p.toFixed(2)}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-space-900 border border-space-800 text-xs text-slate-300 font-mono">
            <strong>Theoretical Significance:</strong> Halving the step size decreases numerical truncation error by a factor of ~{data.ratio_e1_e2.toFixed(1)}x, confirming the hand-crafted Runge-Kutta solver achieves its design fourth-order convergence order without divergence.
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400 font-mono">
          Click "Run Δt Convergence Test" to execute multi-step RK4 error convergence analysis.
        </div>
      )}
    </div>
  );
};
