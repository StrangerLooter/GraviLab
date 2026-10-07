import React, { useEffect, useRef } from 'react';
import { Preset, Planet } from '../types';
import {
  Orbit,
  Compass,
  ShieldCheck,
  Activity,
  Award,
  ArrowRight,
  Play,
  BookOpen,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background particle starfield effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        ctx.fillStyle = `rgba(186, 230, 253, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between pb-16 overflow-hidden">
      {/* Background Subtle Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
      />

      {/* Main Hero Section (Image 1 reference design) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-20 max-w-5xl mx-auto">
        {/* Subtle Category Tagline */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-xs md:text-sm font-mono tracking-[0.35em] uppercase text-cyan-400 font-semibold">
            EXPLORE &nbsp;·&nbsp; SIMULATE &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; DISCOVER
          </span>
        </div>

        {/* Massive Dual-Tone Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight uppercase leading-none select-none mb-4">
          <span className="block text-white">GRAVITATIONAL</span>
          <span className="block hero-gradient-text">SLINGSHOT</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-slate-300 font-mono tracking-tight leading-relaxed mb-10 text-center">
          A high-precision 3D numerical laboratory for classical gravitational dynamics,
          hyperbolic flybys, and NASA JPL Horizons validation.
        </p>

        {/* Central Glowing CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onNavigateTab('simlab')}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-full bg-space-950 border border-cyan-400/60 text-white font-mono font-bold text-sm tracking-wider uppercase transition-all duration-300 glow-pill-cyan hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-space-950 shadow-md shadow-cyan-400/50 group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <span>ENTER SIMULATION</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Institutional Accreditation Pill */}
        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-space-900/60 text-slate-400 border border-space-800">
          <span>Dept. of Mathematics • IEHE Bhopal • Project P1</span>
        </div>
      </div>

      {/* Mission Presets & Scientific Capabilities Section */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 space-y-12">
        {/* Mission Presets Quick Launcher */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Featured Flight Presets</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Launch calibrated numerical flyby trajectories into the 3D simulator
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('simlab')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Open Custom Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presets.slice(0, 3).map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPresetAndLaunch(preset)}
                className="group sim-glass-panel p-5 rounded-2xl cursor-pointer hover:border-cyan-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                      {preset.planet_id}
                    </span>
                    {preset.planet_id === 'jupiter' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        &lt; 5% VALIDATED
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-space-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    v_∞: <span className="text-cyan-400 font-bold">{preset.v_inf_km_s} km/s</span>
                  </div>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                    LAUNCH <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Scientific Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sim-glass-panel p-5 rounded-2xl space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm font-mono uppercase">Custom RK4 Integrator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hand-crafted 4th-order Runge-Kutta numerical scheme demonstrating fourth-order convergence O(Δt⁴) with zero black-box libraries.
            </p>
          </div>

          <div className="sim-glass-panel p-5 rounded-2xl space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm font-mono uppercase">Dual Galilean Frames</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforms between heliocentric (S) and planet-centered (S') coordinates; verifies velocity invariance and energy extraction Δε_☉ = v_p · Δv.
            </p>
          </div>

          <div className="sim-glass-panel p-5 rounded-2xl space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm font-mono uppercase">NASA JPL Horizons &lt; 5%</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validated against 19 synchronized historical Voyager 1 Jupiter flyby tracking stations, achieving 0.703% maximum relative error.
            </p>
          </div>

          <div className="sim-glass-panel p-5 rounded-2xl space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm font-mono uppercase">10-Slide Oral Viva Deck</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive academic presentation deck covering mathematical formulations, numerical stability, and observational verification.
            </p>
            <button
              onClick={onOpenSlideDeck}
              className="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 pt-1"
            >
              <span>View Presentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
