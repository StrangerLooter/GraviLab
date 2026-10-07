import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { SimulationLab } from './pages/SimulationLab';
import { PhysicsAnalysis } from './pages/PhysicsAnalysis';
import { ValidationPage } from './pages/ValidationPage';
import { TheoryReport } from './pages/TheoryReport';
import { SlideDeckModal } from './components/SlideDeckModal';

import { Planet, Preset, SimulationRequest, SimulationResponse, ValidationResponse } from './types';
import { fetchPlanets, fetchPresets, runSimulation, fetchVoyager1Validation } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('jupiter');
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const [slideDeckOpen, setSlideDeckOpen] = useState<boolean>(false);

  // Simulation Parameters Request State (Default: Voyager 1 Jupiter Flyby)
  const [simRequest, setSimRequest] = useState<SimulationRequest>({
    planet_id: 'jupiter',
    initial_position_km: [-5170233.0, 4177476.0, -62887.0],
    initial_velocity_km_s: [11.042, -10.995, 0.133],
    frame: 'planetocentric',
    dt_seconds: 60.0,
    duration_days: 9.0,
    spacecraft_mass_kg: 815.0,
    downsample_factor: 5,
  });

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Playback Animation State
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Planets, Presets and Run Initial Baseline Simulation
  useEffect(() => {
    const initApp = async () => {
      try {
        const [loadedPlanets, loadedPresets] = await Promise.all([
          fetchPlanets(),
          fetchPresets(),
        ]);
        setPlanets(loadedPlanets);
        setPresets(loadedPresets);
        setBackendHealthy(true);

        // Run baseline simulation
        executeSimulation(simRequest);

        // Fetch validation data
        const valData = await fetchVoyager1Validation(60.0);
        setValidation(valData);
      } catch (err) {
        console.warn('Backend connection warning:', err);
        setBackendHealthy(false);
      }
    };
    initApp();
  }, []);

  const executeSimulation = async (req: SimulationRequest = simRequest) => {
    setIsLoading(true);
    try {
      const res = await runSimulation(req);
      setSimulation(res);
      setPlaybackProgress(0);
      setIsPlaying(true);
      setBackendHealthy(true);
    } catch (err) {
      console.error('Simulation execution failed:', err);
      setBackendHealthy(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Playback Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && simulation && simulation.trajectory.length > 0) {
        // Full trajectory duration in seconds = duration_days * 86400
        // Nominal loop duration on screen ~ 12 seconds at 1x
        const stepRate = (1.0 / 12.0) * playbackSpeed * delta;
        setPlaybackProgress((prev) => {
          const next = prev + stepRate;
          return next > 1.0 ? 0.0 : next;
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, simulation]);

  // Handle Preset Selection and Auto Launch
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPlanetId(preset.planet_id);

    // Calculate approximate initial state from preset geometry
    const vInf = preset.v_inf_km_s;
    const angleRad = (preset.approach_angle_deg * Math.PI) / 180;
    const initialDist = preset.initial_distance_factor * 70000.0; // Scaled Jovian distance

    const r0: [number, number, number] = [
      -initialDist * Math.cos(angleRad),
      initialDist * Math.sin(angleRad),
      -10000.0,
    ];
    const v0: [number, number, number] = [
      vInf * Math.cos(angleRad),
      -vInf * Math.sin(angleRad),
      0.1,
    ];

    const updatedReq: SimulationRequest = {
      ...simRequest,
      planet_id: preset.planet_id,
      initial_position_km: r0,
      initial_velocity_km_s: v0,
      dt_seconds: preset.default_dt_sec,
      duration_days: preset.simulation_duration_days,
      spacecraft_mass_kg: preset.spacecraft_mass_kg,
    };

    setSimRequest(updatedReq);
    executeSimulation(updatedReq);
  };

  const handleSelectPresetAndLaunch = (preset: Preset) => {
    handleSelectPreset(preset);
    setActiveTab('simlab');
  };

  const currentPlanet = planets.find((p) => p.id === selectedPlanetId) || {
    id: 'jupiter',
    name: 'Jupiter',
    mass_kg: 1.89813e27,
    radius_km: 69911.0,
    mu: 1.26686534e17,
    semi_major_axis_au: 5.2044,
    orbital_speed_km_s: 13.07,
    orbital_period_days: 4332.59,
    color: '#F59E0B',
    description: 'Gas giant',
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Mission Control Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendHealthy={backendHealthy}
        onQuickRun={() => executeSimulation()}
        isRunning={isLoading}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            presets={presets}
            planets={planets}
            onSelectPresetAndLaunch={handleSelectPresetAndLaunch}
            onNavigateTab={setActiveTab}
            backendHealthy={backendHealthy}
            onOpenSlideDeck={() => setSlideDeckOpen(true)}
          />
        )}

        {activeTab === 'simlab' && (
          <SimulationLab
            planets={planets}
            presets={presets}
            selectedPlanet={currentPlanet}
            onSelectPlanet={(id) => {
              setSelectedPlanetId(id);
              setSimRequest({ ...simRequest, planet_id: id });
            }}
            onSelectPreset={handleSelectPreset}
            request={simRequest}
            onChangeRequest={(updates) => setSimRequest({ ...simRequest, ...updates })}
            onRunSimulation={() => executeSimulation()}
            simulation={simulation}
            isLoading={isLoading}
            playbackProgress={playbackProgress}
            onChangePlaybackProgress={setPlaybackProgress}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onResetPlayback={() => {
              setPlaybackProgress(0);
              setIsPlaying(false);
            }}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={setPlaybackSpeed}
          />
        )}

        {activeTab === 'physics' && (
          <PhysicsAnalysis
            simulation={simulation}
            selectedPlanetId={selectedPlanetId}
          />
        )}

        {activeTab === 'validation' && <ValidationPage />}

        {activeTab === 'theory' && (
          <TheoryReport simulation={simulation || undefined} validation={validation || undefined} />
        )}
      </main>

      {/* 10-Slide Viva Deck Modal */}
      <SlideDeckModal isOpen={slideDeckOpen} onClose={() => setSlideDeckOpen(false)} />

      {/* Mission Control Footer */}
      <footer className="border-t border-space-800 bg-space-900/60 px-4 py-4 mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            <strong>Interactive Numerical Gravitational Assist Simulator</strong> • Department of Mathematics, IEHE Bhopal
          </div>
          <div className="font-mono text-cyan-400/80">
            Validated against NASA JPL Horizons Telemetry (&lt; 5% Target) • Custom Python RK4 Integrator
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
