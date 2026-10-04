import React, { useState, useEffect } from 'react';
import { Clipboard, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';
import { detectPlatform, PLATFORMS_CONFIG } from '../utils/platforms';
import { PlatformIcon } from './PlatformIcon';
import { playTick } from '../utils/sound';

interface UrlInputBarProps {
  onExtract: (url: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  onExtract,
  isLoading,
  error,
  onClearError,
}) => {
  const [url, setUrl] = useState('');
  const detectedPlatform = detectPlatform(url);
  const platformConfig = PLATFORMS_CONFIG[detectedPlatform];

  // Auto-detect when URL changes
  useEffect(() => {
    if (error && onClearError) {
      onClearError();
    }
  }, [url]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() || isLoading) return;
    playTick();
    onExtract(url.trim());
  };

  const handlePasteClipboard = async () => {
    playTick();
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          if (text.startsWith('http')) {
            onExtract(text.trim());
          }
        }
      }
    } catch {
      // Clipboard permission denied or unavailable
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    playTick();
    setUrl(sampleUrl);
    onExtract(sampleUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center p-2 rounded-2xl glass-panel transition-all duration-300 ${
          url.trim().length > 0
            ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Dynamic Platform Icon Badge */}
        <div className="pl-3 pr-2 flex items-center shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
              detectedPlatform !== 'generic'
                ? `bg-slate-800 text-white shadow-sm ring-1 ring-white/10`
                : 'text-slate-500 bg-slate-900/60'
            }`}
            style={{
              color: detectedPlatform !== 'generic' ? platformConfig.brandColor : undefined,
            }}
          >
            <PlatformIcon platform={detectedPlatform} size={20} />
          </div>
        </div>

        {/* Input */}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={platformConfig.placeholderText || 'Paste link from Instagram, TikTok, YouTube, X, Facebook...'}
          className="flex-1 bg-transparent px-3 py-3.5 text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 min-w-0 font-medium"
          disabled={isLoading}
        />

        {/* Controls */}
        <div className="flex items-center gap-1.5 pr-1 shrink-0">
          {url.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setUrl('');
                if (onClearError) onClearError();
              }}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePasteClipboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700/60 transition-all hover:border-slate-600"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paste</span>
          </button>

          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              !url.trim() || isLoading
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span className="hidden sm:inline">Fetching...</span>
              </>
            ) : (
              <>
                <span>Download</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-200 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Quick Try Samples - zero pill, clean text & interactive buttons */}
      <div className="flex items-center flex-wrap gap-2 pt-1 text-xs text-slate-400">
        <span className="font-medium text-slate-500">Quick Test Samples:</span>
        <button
          type="button"
          onClick={() => handleSelectSample('https://www.tiktok.com/@discoverearth/video/7342819028192831')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all font-medium"
        >
          <PlatformIcon platform="tiktok" size={13} className="text-cyan-400" />
          TikTok (No Watermark)
        </button>

        <button
          type="button"
          onClick={() => handleSelectSample('https://www.instagram.com/reel/C3zYp9LqX1/')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/30 text-slate-300 hover:text-pink-300 transition-all font-medium"
        >
          <PlatformIcon platform="instagram" size={13} className="text-pink-400" />
          Instagram Reel
        </button>

        <button
          type="button"
          onClick={() => handleSelectSample('https://youtube.com/shorts/k9ZkM4PzZvw')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-red-300 transition-all font-medium"
        >
          <PlatformIcon platform="youtube" size={13} className="text-red-400" />
          YouTube Short
        </button>

        <button
          type="button"
          onClick={() => handleSelectSample('https://x.com/OpenAI/status/1758223945973682570')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-slate-300 hover:text-blue-300 transition-all font-medium"
        >
          <PlatformIcon platform="twitter" size={13} className="text-blue-400" />
          X Video
        </button>

        <button
          type="button"
          onClick={() => handleSelectSample('https://www.facebook.com/reel/113829104812390')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-all font-medium"
        >
          <PlatformIcon platform="facebook" size={13} className="text-indigo-400" />
          Facebook Reel
        </button>
      </div>
    </div>
  );
};
