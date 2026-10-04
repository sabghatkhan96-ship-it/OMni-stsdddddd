import React from 'react';
import { PLATFORMS_CONFIG } from '../utils/platforms';
import { PlatformIcon } from './PlatformIcon';
import { PlatformId } from '../types';
import { Check, ArrowRight } from 'lucide-react';
import { playTick } from '../utils/sound';

interface PlatformsGuideProps {
  onSelectPlatformSample?: (url: string) => void;
}

export const PlatformsGuide: React.FC<PlatformsGuideProps> = ({
  onSelectPlatformSample,
}) => {
  const platformIds = Object.keys(PLATFORMS_CONFIG).filter(
    (id) => id !== 'generic'
  ) as PlatformId[];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Supported Social Media Platforms
        </h2>
        <p className="text-sm text-slate-400">
          OmniStream extracts public content directly with zero compression loss, no watermarks, and multiple format alternatives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platformIds.map((id) => {
          const cfg = PLATFORMS_CONFIG[id];
          return (
            <div
              key={id}
              className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800"
                    style={{ color: cfg.brandColor }}
                  >
                    <PlatformIcon platform={id} size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {cfg.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cfg.displayName}</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-1.5 my-3 text-xs text-slate-300">
                  {cfg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Formats */}
                <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <span className="text-slate-500 font-medium">Formats: </span>
                  <span className="font-mono text-slate-300">
                    {cfg.supportedFormats.join(' · ')}
                  </span>
                </div>
              </div>

              {/* Sample link test button */}
              {cfg.sampleUrls.length > 0 && onSelectPlatformSample && (
                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTick();
                      onSelectPlatformSample(cfg.sampleUrls[0].url);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 transition-all"
                  >
                    <span>Test sample link</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
