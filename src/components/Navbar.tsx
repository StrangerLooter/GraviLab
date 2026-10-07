import React, { useState } from 'react';
import { Orbit, Activity, ShieldCheck, BookOpen, Layers, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendHealthy: boolean;
  onLaunchSimulation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLaunchSimulation,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Layers },
    { id: 'simlab', label: 'Simulator', icon: Orbit },
    { id: 'physics', label: 'Physics Analysis', icon: Activity },
    { id: 'validation', label: 'Horizons (< 5%)', icon: ShieldCheck },
    { id: 'theory', label: 'Theory & Viva Deck', icon: BookOpen },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#03050c]/90 backdrop-blur-md border-b border-cyan-500/15 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Institution */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
              <Orbit className="w-5 h-5 animate-spin" style={{ animationDuration: '28s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-widest text-white uppercase font-mono">
                  GRAVILAB
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                  RK4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Dept. of Mathematics • IEHE Bhopal
              </p>
            </div>
          </button>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-space-800" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-space-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Buttons (Image 1 style: GitHub pill + glowing Launch Simulation pill) */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/StrangerLooter/GraviLab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-space-900/80 hover:bg-space-800 text-slate-200 border border-space-700/80 font-mono text-xs font-medium hover:border-slate-500 transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          <button
            onClick={() => {
              if (onLaunchSimulation) onLaunchSimulation();
              else setActiveTab('simlab');
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-space-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_28px_rgba(6,182,212,0.9)]"
          >
            <span>Launch Simulation</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setActiveTab('simlab')}
            className="px-3 py-1 rounded-full bg-cyan-500 text-space-950 font-mono text-xs font-bold"
          >
            Launch
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-space-900 border border-space-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-space-800 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-space-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 flex items-center justify-between border-t border-space-800/80">
            <a
              href="https://github.com/StrangerLooter/GraviLab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 font-mono hover:text-white"
            >
              GitHub Repository ↗
            </a>
            <span className="text-[10px] font-mono text-cyan-400/80">IEHE Bhopal</span>
          </div>
        </div>
      )}
    </header>
  );
};
