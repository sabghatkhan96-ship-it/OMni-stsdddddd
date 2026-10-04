import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UrlInputBar } from './components/UrlInputBar';
import { MediaResultCard } from './components/MediaResultCard';
import { BatchQueue } from './components/BatchQueue';
import { PlatformsGuide } from './components/PlatformsGuide';
import { FAQSection } from './components/FAQSection';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { RecentDownloadsDrawer } from './components/RecentDownloadsDrawer';
import { ExtractedMedia, DownloadHistoryItem, DownloadJob } from './types';
import { ShieldCheck, Zap, Music, Video, Layers, Compass } from 'lucide-react';
import { playTick, playSuccessChime } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'platforms' | 'faq'>('single');
  const [extractedMedia, setExtractedMedia] = useState<ExtractedMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Video preview player state
  const [previewMedia, setPreviewMedia] = useState<ExtractedMedia | null>(null);
  const [customPreview, setCustomPreview] = useState<{ url: string; title: string } | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omnistream_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveHistory = (items: DownloadHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem('omnistream_history', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleExtract = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract video details. Please verify the URL.');
      }

      setExtractedMedia(data.media);
      setActiveTab('single');
      playSuccessChime();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Extraction error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCompleted = (job: DownloadJob) => {
    const newItem: DownloadHistoryItem = {
      id: `hist-${Date.now()}-${Math.random()}`,
      title: job.title,
      platform: job.platform,
      originalUrl: extractedMedia?.originalUrl || '',
      thumbnailUrl: job.thumbnailUrl,
      formatLabel: job.format.label,
      fileSizeFormatted: job.format.fileSizeFormatted,
      extension: job.format.extension,
      downloadedAt: new Date().toISOString(),
      authorName: extractedMedia?.author.name || 'Creator',
      previewUrl: job.format.downloadUrl,
      filename: job.filename,
    };

    const updated = [newItem, ...history.filter((h) => h.filename !== job.filename)].slice(0, 50);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    playTick();
    if (window.confirm('Are you sure you want to clear your download history?')) {
      saveHistory([]);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    playTick();
    saveHistory(history.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        openHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Tab 1: Single Downloader */}
        {activeTab === 'single' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Gen Multi-Platform Media Extractor</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-cyan-400">100% Watermark-Free</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Download Videos & Audio from{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                  Any Social Platform
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Save HD videos, original audio tracks, and full-resolution posters from Instagram Reels, TikTok, YouTube Shorts, X, Facebook, and more with zero compression.
              </p>
            </div>

            {/* Smart URL Input Component */}
            <UrlInputBar
              onExtract={handleExtract}
              isLoading={isLoading}
              error={error}
              onClearError={() => setError(null)}
            />

            {/* Extracted Media Result Card */}
            {extractedMedia && (
              <div className="pt-2">
                <MediaResultCard
                  media={extractedMedia}
                  onPreview={(m) => setPreviewMedia(m)}
                  onDownloadStarted={() => {}}
                  onDownloadCompleted={handleDownloadCompleted}
                />
              </div>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-white">No Watermarks</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct CDN stream extraction ensures clean, unbranded TikTok and Instagram Reels for archiving and editing.
                </p>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-white">1080p FHD Quality</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get high-bitrate Full HD (1080p 60fps) alongside balanced 720p and lightweight 480p format alternatives.
                </p>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-white">320kbps MP3 Audio</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extract creator audio tracks, music trends, and voiceovers instantly in crystal clear stereo MP3.
                </p>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-white">High-Speed Proxy</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated backend streaming pipeline bypasses CORS restrictions and downloads files directly to your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Batch Queue */}
        {activeTab === 'batch' && (
          <BatchQueue
            onPreview={(m) => setPreviewMedia(m)}
            onDownloadCompleted={handleDownloadCompleted}
          />
        )}

        {/* Tab 3: Supported Platforms */}
        {activeTab === 'platforms' && (
          <PlatformsGuide
            onSelectPlatformSample={(sampleUrl) => {
              setActiveTab('single');
              handleExtract(sampleUrl);
            }}
          />
        )}

        {/* Tab 4: FAQ */}
        {activeTab === 'faq' && <FAQSection />}
      </main>

      {/* Video Preview Player Modal */}
      <VideoPlayerModal
        media={previewMedia}
        customPreviewUrl={customPreview}
        onClose={() => {
          setPreviewMedia(null);
          setCustomPreview(null);
        }}
        onDownload={(m) => {
          setExtractedMedia(m);
          setActiveTab('single');
        }}
      />

      {/* Recent Downloads Drawer */}
      <RecentDownloadsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onRemoveItem={handleRemoveHistoryItem}
        onPreviewUrl={(url, title) => setCustomPreview({ url, title })}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">OmniStream Downloader</span>
            <span aria-hidden="true">·</span>
            <span>All-in-One Social Media Media Archiver</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                playTick();
                setActiveTab('single');
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Single
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab('batch');
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Batch Queue
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab('platforms');
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Platforms
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab('faq');
              }}
              className="hover:text-slate-300 transition-colors"
            >
              FAQ
            </button>
          </div>

          <p className="text-slate-600">
            For personal offline archival of public media only.
          </p>
        </div>
      </footer>
    </div>
  );
}
