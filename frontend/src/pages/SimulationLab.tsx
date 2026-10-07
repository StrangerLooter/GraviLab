import React, { useState } from 'react';
import { Planet, Preset, SimulationRequest, SimulationResponse } from '../types';
import { SimulationCanvas3D } from '../components/SimulationCanvas3D';
import { TrajectoryCanvas2D } from '../components/TrajectoryCanvas2D';
import { ControlPanel } from '../components/ControlPanel';
import { TelemetryHUD } from '../components/TelemetryHUD';
import { Orbit, Compass, Zap, Layers, RefreshCw } from 'lucide-react';

interface SimulationLabProps {
  planets: Planet[];
  presets: Preset[];
  selectedPlanet: Planet;
  onSelectPlanet: (id: string) => void;
  onSelectPreset: (preset: Preset) => void;
  request: SimulationRequest;
  onChangeRequest: (updates: Partial<SimulationRequest>) => void;
  onRunSimulation: () => void;
  simulation: SimulationResponse | null;
  isLoading: boolean;
  playbackProgress: number;
  onChangePlaybackProgress: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetPlayback: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  planets,
  presets,
  selectedPlanet,
  onSelectPlanet,
  onSelectPreset,
  request,
  onChangeRequest,
  onRunSimulation,
  simulation,
  isLoading,
  playbackProgress,
  onChangePlaybackProgress,
  isPlaying,
  onTogglePlay,
  onResetPlayback,
  playbackSpeed,
  onChangePlaybackSpeed,
}) => {
  const [view2D, setView2D] = useState(false);

  const currentIdx = simulation?.trajectory
    ? Math.min(
        simulation.trajectory.length - 1,
        Math.max(0, Math.floor(playbackProgress * (simulation.trajectory.length - 1)))
      )
    : 0;

  const currentPoint = simulation?.trajectory ? simulation.trajectory[currentIdx] : undefined;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Telemetry Digital HUD */}
      <TelemetryHUD
        currentPoint={currentPoint}
        metrics={simulation?.metrics}
        conservation={simulation?.conservation}
        planetRadiusKm={selectedPlanet.radius_km}
      />

      {/* Main Simulation Viewport and Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Viewport (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          {view2D ? (
            <TrajectoryCanvas2D
              trajectory={simulation?.trajectory || []}
              playbackProgress={playbackProgress}
              planetRadiusKm={selectedPlanet.radius_km}
              planetColor={selectedPlanet.color}
              periapsisKm={simulation?.metrics.periapsis_km}
              turningAngleDeg={simulation?.metrics.turning_angle_deg}
            />
          ) : (
            <SimulationCanvas3D
              trajectory={simulation?.trajectory || []}
              playbackProgress={playbackProgress}
              planetName={selectedPlanet.name}
              planetRadiusKm={selectedPlanet.radius_km}
              planetColor={selectedPlanet.color}
              periapsisKm={simulation?.metrics.periapsis_km}
              turningAngleDeg={simulation?.metrics.turning_angle_deg}
            />
          )}

          {/* Quick Metrics Cards Below Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel p-3.5 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Hyperbolic Eccentricity</span>
              <div className="text-base font-bold font-mono text-white">
                e = {simulation?.metrics.eccentricity.toFixed(4) || '--'}
              </div>
              <p className="text-[10px] text-slate-400">
                e &gt; 1 verifies uncaptured hyperbolic escape trajectory.
              </p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase">Turning Deflection δ</span>
              <div className="text-base font-bold font-mono text-cyan-300">
                δ = {simulation?.metrics.turning_angle_deg.toFixed(2) || '--'}°
              </div>
              <p className="text-[10px] text-slate-400">
                Analytical angle δ = 2·arcsin(1/e).
              </p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-space-800 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase">Heliocentric Gain Δv</span>
              <div className="text-base font-bold font-mono text-amber-300">
                +{simulation?.metrics.delta_v_km_s.toFixed(3) || '--'} km/s
              </div>
              <p className="text-[10px] text-slate-400">
                Extracted from {selectedPlanet.name}'s orbital momentum.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Controls (4 Columns) */}
        <div className="lg:col-span-4">
          <ControlPanel
            planets={planets}
            presets={presets}
            selectedPlanetId={selectedPlanet.id}
            onSelectPlanet={onSelectPlanet}
            onSelectPreset={onSelectPreset}
            request={request}
            onChangeRequest={onChangeRequest}
            onRunSimulation={onRunSimulation}
            isLoading={isLoading}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onResetPlayback={onResetPlayback}
            playbackProgress={playbackProgress}
            onChangePlaybackProgress={onChangePlaybackProgress}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={onChangePlaybackSpeed}
            view2D={view2D}
            onToggle2D={() => setView2D(!view2D)}
          />
        </div>
      </div>
    </div>
  );
};
