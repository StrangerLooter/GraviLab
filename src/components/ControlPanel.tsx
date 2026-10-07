import React from 'react';
import { Planet, Preset, SimulationRequest } from '../types';
import { Play, Pause, RotateCcw, FastForward, Sliders, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  planets: Planet[];
  presets: Preset[];
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
  onSelectPreset: (preset: Preset) => void;
  request: SimulationRequest;
  onChangeRequest: (updates: Partial<SimulationRequest>) => void;
  onRunSimulation: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetPlayback: () => void;
  playbackProgress: number;
  onChangePlaybackProgress: (val: number) => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  view2D: boolean;
  onToggle2D: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  planets,
  presets,
  selectedPlanetId,
  onSelectPlanet,
  onSelectPreset,
  request,
  onChangeRequest,
  onRunSimulation,
  isLoading,
  isPlaying,
  onTogglePlay,
  onResetPlayback,
  playbackProgress,
  onChangePlaybackProgress,
  playbackSpeed,
  onChangePlaybackSpeed,
  view2D,
  onToggle2D,
}) => {
  return (
    <div className="space-y-4">
      {/* Simulation Presets Header */}
      <div className="glass-panel p-4 rounded-xl border border-space-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Mission Presets
          </label>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Launch</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="text-left p-2.5 rounded-lg bg-space-950/70 border border-space-800 hover:border-cyan-500/50 hover:bg-space-800/40 transition-all group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                v_inf: {preset.v_inf_km_s} km/s • {preset.simulation_duration_days}d
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Flyby Parameters Config */}
      <div className="glass-panel p-4 rounded-xl border border-space-800 space-y-4">
        <div className="flex items-center justify-between border-b border-space-800 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Integrator Parameters
          </span>
          <button
            onClick={onToggle2D}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              view2D
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-space-800 text-slate-400 border-space-700 hover:text-white'
            }`}
          >
            {view2D ? '2D Projection: ON' : 'View: 3D WebGL'}
          </button>
        </div>

        {/* Planet Select */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Flyby Planetary Body
          </label>
          <select
            value={selectedPlanetId}
            onChange={(e) => onSelectPlanet(e.target.value)}
            className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {planets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Mass: {p.mass_kg.toExponential(2)} kg, R: {p.radius_km.toLocaleString()} km)
              </option>
            ))}
          </select>
        </div>

        {/* Initial Velocity Vector (km/s) */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Spacecraft Initial Velocity [vx, vy, vz] (km/s)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">vx</span>
              <input
                type="number"
                step="0.1"
                value={request.initial_velocity_km_s[0]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onChangeRequest({
                    initial_velocity_km_s: [val, request.initial_velocity_km_s[1], request.initial_velocity_km_s[2]],
                  });
                }}
                className="w-full bg-space-950 border border-space-700 rounded px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono">vy</span>
              <input
                type="number"
                step="0.1"
                value={request.initial_velocity_km_s[1]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onChangeRequest({
                    initial_velocity_km_s: [request.initial_velocity_km_s[0], val, request.initial_velocity_km_s[2]],
                  });
                }}
                className="w-full bg-space-950 border border-space-700 rounded px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono">vz</span>
              <input
                type="number"
                step="0.1"
                value={request.initial_velocity_km_s[2]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onChangeRequest({
                    initial_velocity_km_s: [request.initial_velocity_km_s[0], request.initial_velocity_km_s[1], val],
                  });
                }}
                className="w-full bg-space-950 border border-space-700 rounded px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Timestep dt and Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Time Step dt</span>
              <span className="font-mono text-cyan-400">{request.dt_seconds}s</span>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={request.dt_seconds}
              onChange={(e) => onChangeRequest({ dt_seconds: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Duration</span>
              <span className="font-mono text-cyan-400">{request.duration_days} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={request.duration_days}
              onChange={(e) => onChangeRequest({ duration_days: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* Action Run Button */}
        <button
          onClick={onRunSimulation}
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Solving RK4 ODEs...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Custom RK4 Solve</span>
            </>
          )}
        </button>
      </div>

      {/* Animation Playback Bar */}
      <div className="glass-panel p-3 rounded-xl border border-space-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Trajectory Animation</span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <span>{(playbackProgress * request.duration_days).toFixed(1)}d</span>
            <span>/</span>
            <span>{request.duration_days.toFixed(1)}d</span>
          </div>
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.002"
          value={playbackProgress}
          onChange={(e) => onChangePlaybackProgress(parseFloat(e.target.value))}
          className="w-full accent-cyan-500"
        />

        {/* Controls row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-lg bg-space-800 text-white hover:bg-space-700 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={onResetPlayback}
              className="p-1.5 rounded-lg bg-space-800 text-slate-300 hover:bg-space-700 transition-colors"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed multiplier selector */}
          <div className="flex items-center gap-1 bg-space-950 p-0.5 rounded border border-space-800 text-[10px] font-mono">
            {[0.2, 1, 5, 20].map((s) => (
              <button
                key={s}
                onClick={() => onChangePlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded ${
                  playbackSpeed === s ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
