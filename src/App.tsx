import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { SimulationLab } from './pages/SimulationLab';
import { PhysicsAnalysis } from './pages/PhysicsAnalysis';
import { ValidationPage } from './pages/ValidationPage';
import { TheoryReport } from './pages/TheoryReport';
import { SlideDeckModal } from './components/SlideDeckModal';
import { X } from 'lucide-react';

import { Planet, Preset, SimulationRequest, SimulationResponse, ValidationResponse } from './types';
import { fetchPlanets, fetchPresets, runSimulation, fetchVoyager1Validation } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('jupiter');
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);

  // Modals for in-simulation analysis inspection
  const [slideDeckOpen, setSlideDeckOpen] = useState<boolean>(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [validationModalOpen, setValidationModalOpen] = useState<boolean>(false);
  const [theoryModalOpen, setTheoryModalOpen] = useState<boolean>(false);

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

        // Run baseline simulation in pure client-side TypeScript RK4
        executeSimulation(simRequest);

        // Fetch validation benchmark dataset
        const valData = await fetchVoyager1Validation(60.0);
        setValidation(valData);
      } catch (err) {
        console.warn('Initial data loading notice:', err);
        setBackendHealthy(true);
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
      console.error('Simulation execution error:', err);
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
        // Nominal loop duration on screen ~ 14 seconds at 1x
        const stepRate = (1.0 / 14.0) * playbackSpeed * delta;
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

    const vInf = preset.v_inf_km_s;
    const angleRad = (preset.approach_angle_deg * Math.PI) / 180;
    const initialDist = preset.initial_distance_factor * 70000.0;

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
    description: 'Giant Jovian planet used for gravitational slingshot maneuvers.',
  };

  // IF IN SIMULATION MODE: Render the Full-Viewport 3D Simulator (Image 2 design)
  if (activeTab === 'simlab') {
    return (
      <div className="simulation-viewport-fullscreen">
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
          onExitSimulation={() => setActiveTab('dashboard')}
          onOpenAnalysis={() => setAnalysisModalOpen(true)}
          onOpenValidation={() => setValidationModalOpen(true)}
          onOpenTheory={() => setTheoryModalOpen(true)}
        />

        {/* Modal: In-Simulation Physics Analysis */}
        {analysisModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-space-950 border border-cyan-500/30 rounded-2xl p-6 overflow-y-auto shadow-2xl">
              <button
                onClick={() => setAnalysisModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-space-900 border border-space-800"
              >
                <X className="w-5 h-5" />
              </button>
              <PhysicsAnalysis
                simulation={simulation}
                selectedPlanetId={selectedPlanetId}
              />
            </div>
          </div>
        )}

        {/* Modal: In-Simulation NASA Horizons Validation */}
        {validationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-space-950 border border-emerald-500/30 rounded-2xl p-6 overflow-y-auto shadow-2xl">
              <button
                onClick={() => setValidationModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-space-900 border border-space-800"
              >
                <X className="w-5 h-5" />
              </button>
              <ValidationPage />
            </div>
          </div>
        )}

        {/* Modal: In-Simulation Theory & Deliverables */}
        {theoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-space-950 border border-purple-500/30 rounded-2xl p-6 overflow-y-auto shadow-2xl">
              <button
                onClick={() => setTheoryModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-space-900 border border-space-800"
              >
                <X className="w-5 h-5" />
              </button>
              <TheoryReport simulation={simulation || undefined} validation={validation || undefined} />
            </div>
          </div>
        )}

        {/* 10-Slide Viva Deck Modal */}
        <SlideDeckModal isOpen={slideDeckOpen} onClose={() => setSlideDeckOpen(false)} />
      </div>
    );
  }

  // STANDARD OVERVIEW / DOCUMENTATION PAGES (Image 1 design)
  return (
    <div className="min-h-screen bg-[#03050c] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendHealthy={backendHealthy}
        onLaunchSimulation={() => setActiveTab('simlab')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-4">
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

      {/* Footer */}
      <footer className="border-t border-space-800/80 bg-space-950/80 px-4 py-6 mt-auto text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <strong>GRAVILAB</strong> • Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal
          </div>
          <div className="text-cyan-400/80 flex items-center gap-3">
            <span>NASA JPL Horizons Telemetry (&lt; 5% Target)</span>
            <span>•</span>
            <span>Custom TypeScript RK4 Integrator</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
