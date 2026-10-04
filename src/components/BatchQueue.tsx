import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Plus, Play, Download, Trash2, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ExtractedMedia, QualityOption, DownloadJob } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { playTick, playSuccessChime } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';

interface BatchQueueItem {
  id: string;
  media: ExtractedMedia;
  selectedFormat: QualityOption;
  status: 'idle' | 'downloading' | 'completed' | 'error';
  progress: number;
}

interface BatchQueueProps {
  onPreview: (media: ExtractedMedia) => void;
  onDownloadCompleted: (job: DownloadJob) => void;
}

const SAMPLE_BATCH_URLS = [
  'https://www.tiktok.com/@discoverearth/video/7342819028192831',
  'https://www.instagram.com/reel/C3zYp9LqX1/',
  'https://youtube.com/shorts/k9ZkM4PzZvw',
  'https://x.com/OpenAI/status/1758223945973682570',
  'https://www.facebook.com/reel/113829104812390'
];

export const BatchQueue: React.FC<BatchQueueProps> = ({
  onPreview,
  onDownloadCompleted,
}) => {
  const [inputUrls, setInputUrls] = useState('');
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParseBatch = async () => {
    const rawLines = inputUrls
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http'));

    if (rawLines.length === 0) {
      setErrorMsg('Please enter at least one valid URL starting with http:// or https://');
      return;
    }

    setErrorMsg(null);
    setIsParsing(true);
    playTick();

    try {
      const res = await fetch('/api/batch-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: rawLines }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract batch links');
      }

      const newItems: BatchQueueItem[] = data.items.map((m: ExtractedMedia) => {
        // default to 1080p or first video format
        const defFormat = m.formats.find((f) => f.quality === '1080p') || m.formats[0];
        return {
          id: `queue-${Date.now()}-${Math.random()}`,
          media: m,
          selectedFormat: defFormat,
          status: 'idle',
          progress: 0,
        };
      });

      setQueue((prev) => [...prev, ...newItems]);
      setInputUrls('');
      playSuccessChime();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Batch extraction failed';
      setErrorMsg(message);
    } finally {
      setIsParsing(false);
    }
  };

  const loadSampleBatch = () => {
    playTick();
    setInputUrls(SAMPLE_BATCH_URLS.join('\n'));
    setErrorMsg(null);
  };

  const handleFormatChange = (itemId: string, formatId: string) => {
    playTick();
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const match = item.media.formats.find((f) => f.id === formatId) || item.selectedFormat;
          return { ...item, selectedFormat: match };
        }
        return item;
      })
    );
  };

  const applyGlobalPreset = (presetType: '1080p' | '720p' | 'mp3') => {
    playTick();
    setQueue((prev) =>
      prev.map((item) => {
        let match: QualityOption | undefined;
        if (presetType === '1080p') {
          match = item.media.formats.find((f) => f.quality === '1080p');
        } else if (presetType === '720p') {
          match = item.media.formats.find((f) => f.quality === '720p');
        } else if (presetType === 'mp3') {
          match = item.media.formats.find((f) => f.type === 'audio');
        }
        return match ? { ...item, selectedFormat: match } : item;
      })
    );
  };

  const removeItem = (id: string) => {
    playTick();
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    playTick();
    setQueue([]);
  };

  // Download a single queue item
  const downloadSingleItem = async (index: number) => {
    const item = queue[index];
    if (!item) return;

    setQueue((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, status: 'downloading', progress: 10 } : it))
    );

    const cleanAuthor = item.media.author.handle.replace(/[^a-zA-Z0-9_-]/g, '') || 'creator';
    const cleanTitle = item.media.title.slice(0, 25).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `[${item.media.platformName}]_${cleanAuthor}_${cleanTitle}_${item.selectedFormat.quality}.${item.selectedFormat.extension}`;

    // Snappy progress animation
    for (let p = 20; p <= 95; p += 25) {
      await new Promise((r) => setTimeout(r, 120));
      setQueue((prev) =>
        prev.map((it, idx) => (idx === index ? { ...it, progress: p } : it))
      );
    }

    // Trigger download
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(item.selectedFormat.downloadUrl)}&filename=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setQueue((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, status: 'completed', progress: 100 } : it))
    );

    const completedJob: DownloadJob = {
      id: `batch-job-${Date.now()}`,
      mediaId: item.media.id,
      title: item.media.title,
      platform: item.media.platform,
      thumbnailUrl: item.media.thumbnailUrl,
      format: item.selectedFormat,
      progress: 100,
      status: 'completed',
      speed: '8.2 MB/s',
      etaSeconds: 0,
      downloadedBytes: item.selectedFormat.fileSizeBytes,
      totalBytes: item.selectedFormat.fileSizeBytes,
      startedAt: Date.now(),
      completedAt: Date.now(),
      filename,
    };
    onDownloadCompleted(completedJob);
  };

  // Run all batch downloads sequentially
  const runBatchDownload = async () => {
    if (queue.length === 0 || isBatchRunning) return;
    setIsBatchRunning(true);
    playTick();

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'completed') {
        await downloadSingleItem(i);
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    setIsBatchRunning(false);
    playSuccessChime();
    fireConfetti(3500);
  };

  const totalBytes = queue.reduce((sum, it) => sum + it.selectedFormat.fileSizeBytes, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
  const completedCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Batch Input Card */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Batch Video & Playlist Queue
              </h2>
              <p className="text-xs text-slate-400">
                Paste multiple links (one per line) from Instagram, TikTok, YouTube, X, or Facebook.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSampleBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-800/50 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load 5 Sample Links</span>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          rows={4}
          value={inputUrls}
          onChange={(e) => setInputUrls(e.target.value)}
          placeholder={`https://www.tiktok.com/@creator/video/123...\nhttps://www.instagram.com/reel/xyz...\nhttps://youtube.com/shorts/abc...`}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
        />

        {errorMsg && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={handleParseBatch}
            disabled={!inputUrls.trim() || isParsing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              !inputUrls.trim() || isParsing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 active:scale-95'
            }`}
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Extracting Batch...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Queue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Queue Table and Actions */}
      {queue.length > 0 && (
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 shadow-xl space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Queue Items ({queue.length})</h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                  {completedCount}/{queue.length} Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                Est. total download size: <strong className="text-slate-200">{totalMb} MB</strong>
              </p>
            </div>

            {/* Global preset filters */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs text-slate-500 font-medium">Batch Preset:</span>
              <button
                type="button"
                onClick={() => applyGlobalPreset('1080p')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                All 1080p MP4
              </button>
              <button
                type="button"
                onClick={() => applyGlobalPreset('720p')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                All 720p MP4
              </button>
              <button
                type="button"
                onClick={() => applyGlobalPreset('mp3')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                All MP3 Audio
              </button>

              <button
                type="button"
                onClick={clearQueue}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors ml-2"
                title="Clear entire queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Queue Items List */}
          <div className="space-y-3">
            <AnimatePresence>
              {queue.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 gap-3"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                      <img
                        src={item.media.thumbnailUrl}
                        alt={item.media.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          playTick();
                          onPreview(item.media);
                        }}
                        className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        title="Preview"
                      >
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                        <PlatformIcon platform={item.media.platform} size={13} />
                        <span className="font-medium text-slate-300">{item.media.platformName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.media.durationFormatted}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate max-w-sm">
                        {item.media.title}
                      </h4>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {item.media.author.name}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quality Dropdown & Download Button */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <select
                      value={item.selectedFormat.id}
                      onChange={(e) => handleFormatChange(item.id, e.target.value)}
                      disabled={item.status === 'downloading'}
                      aria-label="Select format"
                      className="bg-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 border border-slate-700/80 focus:outline-none focus:border-cyan-500"
                    >
                      {item.media.formats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label} ({f.fileSizeFormatted})
                        </option>
                      ))}
                    </select>

                    {item.status === 'downloading' ? (
                      <div className="flex items-center gap-2 w-28">
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-150"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-cyan-400">{item.progress}%</span>
                      </div>
                    ) : item.status === 'completed' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-xl text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => downloadSingleItem(idx)}
                        disabled={isBatchRunning}
                        className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 rounded-xl transition-all"
                        title="Download this item"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={item.status === 'downloading'}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Batch CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Files are saved sequentially with genuine metadata file names.
            </span>

            <button
              type="button"
              onClick={runBatchDownload}
              disabled={isBatchRunning || queue.every((q) => q.status === 'completed')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isBatchRunning || queue.every((q) => q.status === 'completed')
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95'
              }`}
            >
              {isBatchRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Downloading Batch...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Start Batch Download ({queue.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
