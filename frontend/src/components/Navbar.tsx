import React, { useState } from 'react';
import { Orbit, Activity, ShieldCheck, BookOpen, Layers, Play, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendHealthy: boolean;
  onQuickRun?: () => void;
  isRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickRun,
  isRunning = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'simlab', label: 'Simulation Lab', icon: Orbit },
    { id: 'physics', label: 'Physics Analysis', icon: Activity },
    { id: 'validation', label: 'NASA Horizons (< 5%)', icon: ShieldCheck },
    { id: 'theory', label: 'Theory & 10-Slide Deck', icon: BookOpen },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-space-900/95 backdrop-blur-md border-b border-space-800 px-3 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Institution */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Orbit className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white uppercase">
                GraviLab
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Client RK4
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 tracking-tight hidden sm:block">
              Dept. of Mathematics • IEHE Bhopal • Gravity Assist Simulator
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-space-800" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            title="In-Browser Pure Client-Side Numerical Physics Engine"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Engine: 100% In-Browser RK4</span>
            <span className="sm:hidden">Client RK4</span>
          </div>

          {onQuickRun && (
            <button
              id="btn-quick-run"
              onClick={onQuickRun}
              disabled={isRunning}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono shadow-md shadow-cyan-600/20 disabled:opacity-50 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Solving...' : 'Run Flyby'}</span>
            </button>
          )}

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-space-800 text-slate-300 hover:text-white border border-space-700"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-space-800 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-space-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
