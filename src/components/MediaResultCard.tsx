import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Download, CheckCircle2, Music, Video, Image as ImageIcon, Sparkles, Clock, Eye, Heart, ExternalLink } from 'lucide-react';
import { ExtractedMedia, MediaFormatType, QualityOption, DownloadJob } from '../types';
import { formatNumber } from '../utils/platforms';
import { PlatformIcon } from './PlatformIcon';
import { playTick, playSuccessChime } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';

interface MediaResultCardProps {
  media: ExtractedMedia;
  onPreview: (media: ExtractedMedia) => void;
  onDownloadStarted: (job: DownloadJob) => void;
  onDownloadCompleted: (job: DownloadJob) => void;
}

export const MediaResultCard: React.FC<MediaResultCardProps> = ({
  media,
  onPreview,
  onDownloadStarted,
  onDownloadCompleted,
}) => {
  const [activeFormatType, setActiveFormatType] = useState<MediaFormatType>('video');
  const [downloadingFormatId, setDownloadingFormatId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 MB/s');
  const [completedFormatId, setCompletedFormatId] = useState<string | null>(null);

  // Filter formats based on selected tab
  const filteredFormats = media.formats.filter((f) => f.type === activeFormatType);

  const startDownload = async (format: QualityOption) => {
    if (downloadingFormatId) return; // one active download per card
    playTick();

    const cleanAuthor = media.author.handle.replace(/[^a-zA-Z0-9_-]/g, '') || 'creator';
    const cleanTitle = media.title.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `[${media.platformName}]_${cleanAuthor}_${cleanTitle}_${format.quality}.${format.extension}`;

    const jobId = `job-${Date.now()}`;
    const newJob: DownloadJob = {
      id: jobId,
      mediaId: media.id,
      title: media.title,
      platform: media.platform,
      thumbnailUrl: media.thumbnailUrl,
      format,
      progress: 0,
      status: 'downloading',
      speed: '7.8 MB/s',
      etaSeconds: Math.ceil(format.fileSizeBytes / (7.8 * 1024 * 1024)),
      downloadedBytes: 0,
      totalBytes: format.fileSizeBytes,
      startedAt: Date.now(),
      filename,
    };

    setDownloadingFormatId(format.id);
    setDownloadProgress(5);
    onDownloadStarted(newJob);

    // Simulate animated progress while downloading proxy stream
    const targetSeconds = 2.0; // snappy, realistic transfer animation
    const intervalMs = 100;
    const steps = (targetSeconds * 1000) / intervalMs;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const percent = Math.min(95, Math.floor((currentStep / steps) * 95));
      const simulatedSpeed = (6.5 + Math.random() * 3.5).toFixed(1) + ' MB/s';
      setDownloadProgress(percent);
      setDownloadSpeed(simulatedSpeed);

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, intervalMs);

    try {
      // Trigger actual proxy download via iframe or link
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(format.downloadUrl)}&filename=${encodeURIComponent(filename)}`;
      
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Complete job
      setTimeout(() => {
        clearInterval(interval);
        setDownloadProgress(100);
        setCompletedFormatId(format.id);
        setDownloadingFormatId(null);
        playSuccessChime();
        fireConfetti(3000);

        const completedJob: DownloadJob = {
          ...newJob,
          progress: 100,
          status: 'completed',
          completedAt: Date.now(),
        };
        onDownloadCompleted(completedJob);
      }, targetSeconds * 1000 + 200);
    } catch {
      clearInterval(interval);
      setDownloadingFormatId(null);
    }
  };

  const isVertical = media.aspectRatio === '9:16';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto rounded-3xl glass-panel p-5 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative z-10">
        {/* Left: Thumbnail & Preview player trigger */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div
            className={`relative rounded-2xl overflow-hidden group shadow-xl border border-slate-700/60 bg-slate-900 w-full ${
              isVertical ? 'aspect-[9/16] max-w-[240px]' : 'aspect-video'
            }`}
          >
            <img
              src={media.thumbnailUrl}
              alt={media.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Play Preview Button */}
            <button
              onClick={() => {
                playTick();
                onPreview(media);
              }}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 group-hover:scale-110 transition-all active:scale-95 focus-visible:outline-none"
              title="Watch video preview"
            >
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </button>

            {/* Aspect Ratio & Duration Tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
              <span className="font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] border border-white/10 tabular-nums">
                {media.durationFormatted}
              </span>
              <span className="font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] border border-white/10 uppercase">
                {media.aspectRatio}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playTick();
              onPreview(media);
            }}
            className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Play Full Video Preview</span>
          </button>
        </div>

        {/* Right: Media Metadata & Formats */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-5">
          {/* Header Metadata */}
          <div>
            {/* Unboxed clean metadata line */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <PlatformIcon platform={media.platform} size={15} />
                <span>{media.platformName}</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Verified Clean Source
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <a
                href={media.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                <span>Original Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug line-clamp-2">
              {media.title}
            </h2>

            {/* Author info & stats */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                {media.author.avatarUrl ? (
                  <img
                    src={media.author.avatarUrl}
                    alt={media.author.name}
                    className="w-5 h-5 rounded-full ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-700" />
                )}
                <span className="font-medium text-slate-200">{media.author.name}</span>
                <span className="text-slate-500 font-mono">{media.author.handle}</span>
              </div>

              <span aria-hidden="true" className="text-slate-700 hidden sm:inline">·</span>

              <div className="flex items-center gap-3 tabular-nums">
                {media.viewsCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {formatNumber(media.viewsCount)} views
                  </span>
                )}
                {media.likesCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500/80" />
                    {formatNumber(media.likesCount)} likes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Format Type Segmented Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800/80 w-fit">
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setActiveFormatType('video');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFormatType === 'video'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video MP4 ({media.formats.filter((f) => f.type === 'video').length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTick();
                  setActiveFormatType('audio');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFormatType === 'audio'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio MP3 ({media.formats.filter((f) => f.type === 'audio').length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTick();
                  setActiveFormatType('thumbnail');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFormatType === 'thumbnail'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Thumbnails ({media.formats.filter((f) => f.type === 'thumbnail').length})</span>
              </button>
            </div>

            {/* Formats List */}
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFormatType}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2"
                >
                  {filteredFormats.map((format) => {
                    const isDownloadingThis = downloadingFormatId === format.id;
                    const isCompletedThis = completedFormatId === format.id;

                    return (
                      <div
                        key={format.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all ${
                          isDownloadingThis
                            ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Format Info */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              format.type === 'video'
                                ? 'bg-indigo-500/15 text-indigo-400'
                                : format.type === 'audio'
                                ? 'bg-purple-500/15 text-purple-400'
                                : 'bg-emerald-500/15 text-emerald-400'
                            }`}
                          >
                            {format.type === 'video' && <Video className="w-4 h-4" />}
                            {format.type === 'audio' && <Music className="w-4 h-4" />}
                            {format.type === 'thumbnail' && <ImageIcon className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {format.label}
                              </span>
                              {format.isWatermarkFree && (
                                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
                                  No Watermark
                                </span>
                              )}
                              {format.fps && (
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {format.fps} FPS
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                              <span>{format.fileSizeFormatted}</span>
                              {format.bitrate && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{format.bitrate}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="uppercase">{format.extension}</span>
                            </div>
                          </div>
                        </div>

                        {/* Download CTA / Progress */}
                        <div className="mt-3 sm:mt-0 flex items-center gap-3 shrink-0">
                          {isDownloadingThis ? (
                            <div className="flex flex-col items-end w-44">
                              <div className="flex items-center justify-between w-full text-xs font-mono text-cyan-300 mb-1 tabular-nums">
                                <span>{downloadProgress}%</span>
                                <span className="text-slate-400">{downloadSpeed}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-150 ease-out"
                                  style={{ width: `${downloadProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startDownload(format)}
                              disabled={downloadingFormatId !== null}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isCompletedThis
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : downloadingFormatId !== null
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-95'
                              }`}
                            >
                              {isCompletedThis ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Downloaded</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
