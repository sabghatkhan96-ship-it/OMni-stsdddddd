import React from 'react';
import { Download, Volume2, VolumeX, Sparkles, Layers, Compass, HelpCircle } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playTick } from '../utils/sound';

interface NavbarProps {
  activeTab: 'single' | 'batch' | 'platforms' | 'faq';
  setActiveTab: (tab: 'single' | 'batch' | 'platforms' | 'faq') => void;
  historyCount: number;
  openHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  openHistory,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTick();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playTick();
              setActiveTab('single');
            }}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              OmniStream
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => {
              playTick();
              setActiveTab('single');
            }}
            className={`transition-colors relative py-1 focus-visible:outline-none ${
              activeTab === 'single'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Downloader
            {activeTab === 'single' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              playTick();
              setActiveTab('batch');
            }}
            className={`flex items-center gap-1.5 transition-colors relative py-1 focus-visible:outline-none ${
              activeTab === 'batch'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Batch Queue
            {activeTab === 'batch' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              playTick();
              setActiveTab('platforms');
            }}
            className={`flex items-center gap-1.5 transition-colors relative py-1 focus-visible:outline-none ${
              activeTab === 'platforms'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Supported Platforms
            {activeTab === 'platforms' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              playTick();
              setActiveTab('faq');
            }}
            className={`flex items-center gap-1.5 transition-colors relative py-1 focus-visible:outline-none ${
              activeTab === 'faq'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ & Guide
            {activeTab === 'faq' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundOn ? 'Sound effects ON' : 'Sound effects MUTED'}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              playTick();
              openHistory();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all shadow-sm hover:border-cyan-500/40"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Downloads</span>
            {historyCount > 0 && (
              <span className="font-mono text-[11px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
