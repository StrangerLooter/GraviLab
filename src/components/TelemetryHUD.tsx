import React from 'react';
import { TrajectoryPoint, FlybyMetrics, ConservationSummary } from '../types';
import { Gauge, Milestone, Compass, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatNumber, formatDistanceKm, formatSpeedKmS } from '../utils/formatters';

interface TelemetryHUDProps {
  currentPoint?: TrajectoryPoint;
  metrics?: FlybyMetrics;
  conservation?: ConservationSummary;
  planetRadiusKm: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  currentPoint,
  metrics,
  conservation,
  planetRadiusKm,
}) => {
  const currentSpeed = currentPoint ? currentPoint.speed_km_s : 0;
  const currentDist = currentPoint ? currentPoint.distance_to_planet_km : 0;
  const radiiMultiple = planetRadiusKm > 0 ? currentDist / planetRadiusKm : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* Current Speed */}
      <div className="p-3 rounded-xl glass-panel-subtle border border-space-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            Relative Speed
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80">S' Frame</span>
        </div>
        <div className="text-xl font-bold font-mono text-white glow-cyan">
          {formatSpeedKmS(currentSpeed)}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          v_inf in: {metrics ? formatSpeedKmS(metrics.v_infinity_in_km_s) : '--'}
        </div>
      </div>

      {/* Distance to Planet */}
      <div className="p-3 rounded-xl glass-panel-subtle border border-space-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Milestone className="w-3.5 h-3.5 text-blue-400" />
            Distance r
          </span>
          <span className="text-[10px] font-mono text-blue-400/80">{radiiMultiple.toFixed(1)} Rp</span>
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {formatDistanceKm(currentDist)}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          Periapsis: {metrics ? `${formatNumber(metrics.periapsis_km / 1e3, 0)}k km` : '--'}
        </div>
      </div>

      {/* Flyby Deflection Angle */}
      <div className="p-3 rounded-xl glass-panel-subtle border border-space-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            Turning Angle δ
          </span>
          <span className="text-[10px] font-mono text-purple-400/80">2·arcsin(1/e)</span>
        </div>
        <div className="text-xl font-bold font-mono text-cyan-300">
          {metrics ? `${metrics.turning_angle_deg.toFixed(2)}°` : '--'}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          e = {metrics ? metrics.eccentricity.toFixed(3) : '--'}
        </div>
      </div>

      {/* Effective Heliocentric Delta-V */}
      <div className="p-3 rounded-xl glass-panel-subtle border border-space-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Heliocentric Δv
          </span>
          <span className="text-[10px] font-mono text-amber-400/80">Slingshot Gain</span>
        </div>
        <div className="text-xl font-bold font-mono text-amber-300 glow-amber">
          {metrics ? `+${formatSpeedKmS(metrics.delta_v_km_s)}` : '--'}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          Propellantless transfer
        </div>
      </div>

      {/* Specific Energy Transfer */}
      <div className="p-3 rounded-xl glass-panel-subtle border border-space-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Δ Energy Helio
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80">vp · Δv</span>
        </div>
        <div className="text-xl font-bold font-mono text-emerald-300">
          {metrics ? `${formatNumber(metrics.delta_energy_helio_mj_kg, 1)} MJ/kg` : '--'}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          Planet kinetic exchange
        </div>
      </div>

      {/* Conservation / Integrity */}
      <div className="p-3 rounded-xl glass-panel-subtle border border-space-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            {conservation?.is_numerically_stable ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            )}
            RK4 Stability
          </span>
          <span className="text-[10px] font-mono text-slate-400">Drift Check</span>
        </div>
        <div className={`text-base font-bold font-mono ${conservation?.is_numerically_stable ? 'text-emerald-400' : 'text-rose-400'}`}>
          {conservation ? `${conservation.energy_drift_pct.toFixed(4)}%` : '--'}
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          Angular drift: {conservation ? `${conservation.angular_momentum_drift_pct.toFixed(4)}%` : '--'}
        </div>
      </div>
    </div>
  );
};
