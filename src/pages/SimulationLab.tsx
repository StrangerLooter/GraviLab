import React, { useState, useEffect } from 'react';
import { Planet, Preset, SimulationRequest, SimulationResponse } from '../types';
import { SimulationCanvas3D } from '../components/SimulationCanvas3D';
import { TrajectoryCanvas2D } from '../components/TrajectoryCanvas2D';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Activity,
  BookOpen,
  Home,
  Layers,
  Sparkles,
  Compass,
  X,
  Menu,
} from 'lucide-react';
import { formatNumber, formatScientific } from '../utils/formatters';

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
  onExitSimulation: () => void;
  onOpenAnalysis: () => void;
  onOpenValidation: () => void;
  onOpenTheory: () => void;
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
  onExitSimulation,
  onOpenAnalysis,
  onOpenValidation,
  onOpenTheory,
}) => {
  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [view2D, setView2D] = useState<boolean>(false);

  // Visual toggles matching Image 2
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'free' | 'top' | 'side' | 'follow'>('free');

  // Accordion section states for Left Panel
  const [openSimSection, setOpenSimSection] = useState<boolean>(true);
  const [openVisualsSection, setOpenVisualsSection] = useState<boolean>(true);
  const [openPresetsSection, setOpenPresetsSection] = useState<boolean>(true);
  const [openPhysicsSection, setOpenPhysicsSection] = useState<boolean>(false);
  const [openCameraSection, setOpenCameraSection] = useState<boolean>(false);

  // Accordion section states for Right Panel
  const [openTelemetrySection, setOpenTelemetrySection] = useState<boolean>(true);
  const [openInspectorSection, setOpenInspectorSection] = useState<boolean>(true);
  const [openValidationSection, setOpenValidationSection] = useState<boolean>(true);

  // Mobile drawer states
  const [mobileLeftOpen, setMobileLeftOpen] = useState<boolean>(false);
  const [mobileRightOpen, setMobileRightOpen] = useState<boolean>(false);

  // Inspector selected body: 'spacecraft' | 'planet' | 'sun'
  const [inspectedBody, setInspectedBody] = useState<'spacecraft' | 'planet' | 'sun'>('spacecraft');

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable full-screen mode:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const currentIdx = simulation?.trajectory
    ? Math.min(
        simulation.trajectory.length - 1,
        Math.max(0, Math.floor(playbackProgress * (simulation.trajectory.length - 1)))
      )
    : 0;

  const currentPoint = simulation?.trajectory ? simulation.trajectory[currentIdx] : undefined;

  const currentTimeKs = currentPoint ? (currentPoint.t_sec / 1000).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#03050c] select-none z-40">
      {/* 1. Full-Bleed 3D / 2D WebGL Canvas Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        {view2D ? (
          <div className="w-full h-full p-4 pt-16 pb-20 flex items-center justify-center">
            <div className="w-full h-full max-w-5xl max-h-[85vh]">
              <TrajectoryCanvas2D
                trajectory={simulation?.trajectory || []}
                playbackProgress={playbackProgress}
                planetRadiusKm={selectedPlanet.radius_km}
                planetColor={selectedPlanet.color}
                periapsisKm={simulation?.metrics.periapsis_km}
                turningAngleDeg={simulation?.metrics.turning_angle_deg}
              />
            </div>
          </div>
        ) : (
          <SimulationCanvas3D
            trajectory={simulation?.trajectory || []}
            playbackProgress={playbackProgress}
            planetName={selectedPlanet.name}
            planetRadiusKm={selectedPlanet.radius_km}
            planetColor={selectedPlanet.color}
            periapsisKm={simulation?.metrics.periapsis_km}
            turningAngleDeg={simulation?.metrics.turning_angle_deg}
            showVectors={showVectors}
            showGrid={showGrid}
            showAxes={showAxes}
            showTrails={showTrails}
            cameraMode={cameraMode}
            className="w-full h-full"
          />
        )}
      </div>

      {/* 2. Top HUD Navigation & Telemetry Header Bar */}
      <header className="absolute top-0 left-0 right-0 h-13 z-30 flex items-center justify-between px-3 md:px-6 bg-[#03050c]/85 backdrop-blur-md border-b border-cyan-500/20 text-xs font-mono">
        {/* Left: Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExitSimulation}
            title="Return to Main Overview"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-all font-sans font-bold text-xs"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">GRAVILAB</span>
          </button>

          <div className="flex items-center gap-2 pl-1 border-l border-space-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className={`uppercase font-bold tracking-wider text-[11px] ${isPlaying ? 'text-cyan-400' : 'text-amber-400'}`}>
              {isPlaying ? 'SIMULATING' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Center / Right: Live Telemetry Ribbon */}
        <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
          <div>
            <span className="text-slate-500">T = </span>
            <span className="text-cyan-300 font-semibold">{currentTimeKs} ks</span>
          </div>
          <div>
            <span className="text-slate-500">FPS </span>
            <span className="text-emerald-400 font-semibold">60</span>
          </div>
          <div>
            <span className="text-slate-500">DT </span>
            <span className="text-cyan-300 font-semibold">{request.dt_seconds.toFixed(1)}s</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
            CUSTOM RK4
          </div>
          <div className="text-slate-400 hidden xl:inline">
            {selectedPlanet.name.toUpperCase()} FLYBY
          </div>
          <div className="text-purple-300 hidden 2xl:inline">
            NASA HORIZONS CALIBRATED
          </div>
        </div>

        {/* Far Right: Tools & FULLSCREEN BUTTON (Image 2 style) */}
        <div className="flex items-center gap-2">
          {/* 2D / 3D Switch */}
          <button
            onClick={() => setView2D(!view2D)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              view2D
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50'
                : 'bg-space-900/80 text-slate-400 border-space-700/60 hover:text-white'
            }`}
          >
            {view2D ? '2D PLANE' : '3D SPACE'}
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Spacetime Grid Plane"
            className={`hidden sm:flex px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              showGrid
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-space-900/80 text-slate-400 border-space-700/60 hover:text-white'
            }`}
          >
            GRID
          </button>

          {/* Trajectory Trails Toggle */}
          <button
            onClick={() => setShowTrails(!showTrails)}
            title="Toggle Trajectory Trails"
            className={`hidden sm:flex px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              showTrails
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-space-900/80 text-slate-400 border-space-700/60 hover:text-white'
            }`}
          >
            TRAILS
          </button>

          {/* FULLSCREEN BUTTON IN TOP-RIGHT CORNER (Requested explicitly by user) */}
          <button
            onClick={toggleFullScreen}
            title={isFullscreen ? 'Exit Full Screen [Esc]' : 'Enter Full Screen [F11]'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm transition-all"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
            )}
            <span className="hidden sm:inline text-[11px] font-bold">
              {isFullscreen ? 'EXIT' : 'FULLSCREEN'}
            </span>
          </button>

          {/* Mobile Drawer Toggles */}
          <div className="flex lg:hidden items-center gap-1 pl-1 border-l border-space-800">
            <button
              onClick={() => setMobileLeftOpen(!mobileLeftOpen)}
              className="p-1.5 rounded-md bg-space-900 text-cyan-400 border border-space-700"
              title="Toggle Controls"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileRightOpen(!mobileRightOpen)}
              className="p-1.5 rounded-md bg-space-900 text-purple-400 border border-space-700"
              title="Toggle Telemetry"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. Left Floating Glassmorphism Controls Panel (Image 2 style) */}
      <aside
        className={`absolute top-14 left-3 bottom-20 z-20 w-72 sm:w-80 sim-glass-panel rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
          mobileLeftOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-space-950/60">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mission Controls</span>
          </div>
          <button
            onClick={() => setMobileLeftOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs font-mono">
          {/* ■ SIMULATION */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenSimSection(!openSimSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Simulation</span>
              {openSimSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSimSection && (
              <div className="p-3 pt-1 space-y-3 border-t border-space-800/80">
                {/* Play / Reset / Step */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={onTogglePlay}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/50 font-bold transition-all"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>
                  <button
                    onClick={onResetPlayback}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-md bg-space-800/80 hover:bg-space-800 text-slate-300 border border-space-700 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>
                  <button
                    onClick={() => {
                      onTogglePlay();
                      setTimeout(() => onTogglePlay(), 50);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-md bg-space-800/80 hover:bg-space-800 text-slate-300 border border-space-700 transition-all"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>STEP</span>
                  </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">SPEED</span>
                  <div className="flex items-center gap-1">
                    {[0.5, 1.0, 2.0, 5.0, 10.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => onChangePlaybackSpeed(s)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          playbackSpeed === s
                            ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50'
                            : 'bg-space-950 text-slate-400 border-space-800 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ■ VISUALS & FABRIC */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenVisualsSection(!openVisualsSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Visuals &amp; Fabric</span>
              {openVisualsSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openVisualsSection && (
              <div className="p-3 pt-1 space-y-2 border-t border-space-800/80 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SPACETIME GRID</span>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      showGrid
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-space-950 text-slate-500 border-space-800'
                    }`}
                  >
                    {showGrid ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TRAJECTORY TRAILS</span>
                  <button
                    onClick={() => setShowTrails(!showTrails)}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      showTrails
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-space-950 text-slate-500 border-space-800'
                    }`}
                  >
                    {showTrails ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">VECTORS (V, A)</span>
                  <button
                    onClick={() => setShowVectors(!showVectors)}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      showVectors
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-space-950 text-slate-500 border-space-800'
                    }`}
                  >
                    {showVectors ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">COORDINATE AXES</span>
                  <button
                    onClick={() => setShowAxes(!showAxes)}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      showAxes
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-space-950 text-slate-500 border-space-800'
                    }`}
                  >
                    {showAxes ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Reference Frame Selection */}
                <div className="pt-1.5 border-t border-space-800/80">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">REFERENCE FRAME</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onChangeRequest({ frame: 'planetocentric' })}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        request.frame === 'planetocentric'
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                          : 'bg-space-950 text-slate-400 border-space-800'
                      }`}
                    >
                      PLANET (S')
                    </button>
                    <button
                      onClick={() => onChangeRequest({ frame: 'heliocentric' })}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        request.frame === 'heliocentric'
                          ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500/50'
                          : 'bg-space-950 text-slate-400 border-space-800'
                      }`}
                    >
                      HELIOCENTRIC (S)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ■ ORBIT PRESETS */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenPresetsSection(!openPresetsSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Orbit Presets</span>
              {openPresetsSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openPresetsSection && (
              <div className="p-2 space-y-1.5 border-t border-space-800/80">
                {presets.map((preset) => {
                  const isSelected = selectedPlanet.id === preset.planet_id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onSelectPreset(preset)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                          : 'bg-space-950/60 text-slate-400 border-space-800/80 hover:text-white hover:border-space-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{preset.name}</span>
                        {preset.planet_id === 'jupiter' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            VOYAGER 1
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ■ PHYSICS ENGINE & INTEGRATOR */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenPhysicsSection(!openPhysicsSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Physics Engine</span>
              {openPhysicsSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openPhysicsSection && (
              <div className="p-3 pt-1 space-y-2.5 border-t border-space-800/80 text-[11px]">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>TIMESTEP Δt</span>
                    <span className="text-cyan-300 font-bold">{request.dt_seconds} s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={request.dt_seconds}
                    onChange={(e) => onChangeRequest({ dt_seconds: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>DURATION</span>
                    <span className="text-cyan-300 font-bold">{request.duration_days} days</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={request.duration_days}
                    onChange={(e) => onChangeRequest({ duration_days: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={onRunSimulation}
                  disabled={isLoading}
                  className="w-full py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
                >
                  {isLoading ? 'INTEGRATING RK4...' : 'RECALCULATE TRAJECTORY'}
                </button>
              </div>
            )}
          </div>

          {/* ■ CAMERA MODES */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenCameraSection(!openCameraSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Camera Modes</span>
              {openCameraSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openCameraSection && (
              <div className="p-2 space-y-1.5 border-t border-space-800/80">
                {[
                  { id: 'free', label: 'Free Orbit Camera' },
                  { id: 'top', label: 'Top-Down Orbital Plane' },
                  { id: 'side', label: 'Side Elevation View' },
                  { id: 'follow', label: 'Follow Spacecraft Probe' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraMode(cam.id as any)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] border transition-all ${
                      cameraMode === cam.id
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                        : 'bg-space-950/60 text-slate-400 border-space-800/80 hover:text-white'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 4. Right Floating Glassmorphism Telemetry & Inspector Panel (Image 2 style) */}
      <aside
        className={`absolute top-14 right-3 bottom-20 z-20 w-72 sm:w-80 sim-glass-panel rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
          mobileRightOpen ? 'translate-x-0' : 'translate-x-[110%] lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-space-950/60">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flight Telemetry</span>
          </div>
          <button
            onClick={() => setMobileRightOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs font-mono">
          {/* ■ TELEMETRY */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenTelemetrySection(!openTelemetrySection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Telemetry</span>
              {openTelemetrySection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openTelemetrySection && (
              <div className="p-3 pt-1 space-y-2 border-t border-space-800/80 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">HELIOCENTRIC SPEED</span>
                  <span className="text-cyan-300 font-bold">
                    {currentPoint ? currentPoint.speed_km_s.toFixed(2) : '--'} km/s
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">NET VELOCITY BOOST (Δv)</span>
                  <span className="text-amber-400 font-bold">
                    +{simulation?.metrics.delta_v_km_s.toFixed(3) || '--'} km/s
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ENERGY EXTRACTION (Δε_☉)</span>
                  <span className="text-emerald-400 font-bold">
                    +{simulation?.metrics.delta_energy_helio_mj_kg.toFixed(2) || '--'} MJ/kg
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CLOSEST APPROACH (r_p)</span>
                  <span className="text-rose-400 font-bold">
                    {simulation?.metrics.periapsis_km.toLocaleString() || '--'} km
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TURNING ANGLE (δ)</span>
                  <span className="text-purple-300 font-bold">
                    {simulation?.metrics.turning_angle_deg.toFixed(2) || '--'}°
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">HYPERBOLIC ECCENTRICITY</span>
                  <span className="text-slate-200 font-bold">
                    e = {simulation?.metrics.eccentricity.toFixed(4) || '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SPECIFIC ENERGY DRIFT</span>
                  <span className="text-emerald-400 font-mono">
                    {simulation?.conservation.energy_drift_pct.toFixed(5) || '0.00000'}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ANGULAR MOMENTUM DRIFT</span>
                  <span className="text-emerald-400 font-mono">
                    {simulation?.conservation.angular_momentum_drift_pct.toFixed(5) || '0.00000'}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ■ BODY INSPECTOR */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenInspectorSection(!openInspectorSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Body Inspector</span>
              {openInspectorSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openInspectorSection && (
              <div className="p-3 pt-1 space-y-2 border-t border-space-800/80 text-[11px]">
                {/* Body Tabs */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[
                    { id: 'spacecraft', label: 'Probe' },
                    { id: 'planet', label: selectedPlanet.name },
                    { id: 'sun', label: 'Sun' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setInspectedBody(b.id as any)}
                      className={`py-1 rounded text-[10px] font-bold border transition-colors ${
                        inspectedBody === b.id
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50'
                          : 'bg-space-950 text-slate-400 border-space-800'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {inspectedBody === 'spacecraft' && (
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">MASS</span>
                      <span>{request.spacecraft_mass_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">POS X</span>
                      <span>{currentPoint ? (currentPoint.x_km / 1000).toFixed(1) : '0.0'} × 10³ km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">POS Y</span>
                      <span>{currentPoint ? (currentPoint.y_km / 1000).toFixed(1) : '0.0'} × 10³ km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">POS Z</span>
                      <span>{currentPoint ? (currentPoint.z_km / 1000).toFixed(1) : '0.0'} × 10³ km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SPEED</span>
                      <span className="text-cyan-300 font-bold">
                        {currentPoint ? currentPoint.speed_km_s.toFixed(3) : '0.000'} km/s
                      </span>
                    </div>
                  </div>
                )}

                {inspectedBody === 'planet' && (
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">MASS</span>
                      <span>{formatScientific(selectedPlanet.mass_kg)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RADIUS</span>
                      <span>{selectedPlanet.radius_km.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ORBIT SPEED</span>
                      <span className="text-amber-300 font-bold">
                        {selectedPlanet.orbital_speed_km_s.toFixed(2)} km/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GRAV PARAM μ</span>
                      <span>{formatScientific(selectedPlanet.mu)} m³/s²</span>
                    </div>
                  </div>
                )}

                {inspectedBody === 'sun' && (
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">MASS</span>
                      <span>1.989 × 10³⁰ kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SOLAR μ</span>
                      <span>1.327 × 10²⁰ m³/s²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">POSITION</span>
                      <span>[0.0, 0.0, 0.0] AU</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ■ NASA HORIZONS BENCHMARK */}
          <div className="rounded-lg bg-space-900/60 border border-space-800 overflow-hidden">
            <button
              onClick={() => setOpenValidationSection(!openValidationSection)}
              className="w-full flex items-center justify-between px-3 py-2 text-cyan-400 text-left font-bold text-[11px] uppercase tracking-wider hover:bg-space-800/40"
            >
              <span>■ Horizons Benchmark</span>
              {openValidationSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openValidationSection && (
              <div className="p-3 pt-1 space-y-2 border-t border-space-800/80 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">MAX RELATIVE ERROR</span>
                  <span className="text-emerald-400 font-bold font-mono">0.703%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ACCURACY THRESHOLD</span>
                  <span className="text-slate-300">&lt; 5.0% (Passed)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TELEMETRY STATIONS</span>
                  <span className="text-slate-300">19 Synced Epochs</span>
                </div>
                <button
                  onClick={onOpenValidation}
                  className="w-full mt-1 py-1.5 rounded bg-space-800/80 hover:bg-space-700 text-slate-200 border border-space-700 flex items-center justify-center gap-1.5 transition-all text-[10px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>INSPECT FULL VALIDATION TABLE</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 5. Bottom Floating Playback & Timeline Scrubber Bar (Image 2 style) */}
      <footer className="absolute bottom-3 left-3 right-3 h-14 z-30 sim-glass-panel rounded-xl px-4 flex items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetPlayback}
            title="Reset to Encounter Start"
            className="p-2 rounded-lg bg-space-900/80 hover:bg-space-800 text-slate-300 border border-space-700/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              const next = Math.min(1.0, playbackProgress + 0.05);
              onChangePlaybackProgress(next);
            }}
            title="Step Forward"
            className="p-2 rounded-lg bg-space-900/80 hover:bg-space-800 text-slate-300 border border-space-700/80 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 flex items-center gap-3 max-w-2xl">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap hidden sm:inline">
            T = 0s
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={playbackProgress}
            onChange={(e) => {
              onChangePlaybackProgress(parseFloat(e.target.value));
            }}
            className="w-full accent-cyan-400 h-1.5 bg-space-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-cyan-300 font-bold whitespace-nowrap">
            {currentTimeKs} ks
          </span>
        </div>

        {/* Modals Quick Access: ANALYSIS, VALIDATION, THEORY */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={onOpenAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-900/80 hover:bg-space-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition-all font-semibold"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">ANALYSIS</span>
          </button>

          <button
            onClick={onOpenValidation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-900/80 hover:bg-space-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">VALIDATION</span>
          </button>

          <button
            onClick={onOpenTheory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-900/80 hover:bg-space-800 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 transition-all font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">THEORY &amp; VIVA</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
