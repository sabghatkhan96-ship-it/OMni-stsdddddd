import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ExternalLink } from 'lucide-react';
import { ExtractedMedia } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { playTick } from '../utils/sound';

interface VideoPlayerModalProps {
  media: ExtractedMedia | null;
  customPreviewUrl?: { url: string; title: string } | null;
  onClose: () => void;
  onDownload?: (media: ExtractedMedia) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  customPreviewUrl,
  onClose,
  onDownload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeMedia = media;
  const videoSrc = customPreviewUrl ? customPreviewUrl.url : activeMedia?.previewVideoUrl;
  const title = customPreviewUrl ? customPreviewUrl.title : activeMedia?.title;
  const isVertical = activeMedia ? activeMedia.aspectRatio === '9:16' : false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeMedia && !customPreviewUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className={`relative z-10 w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
            isVertical ? 'max-w-md max-h-[92vh]' : 'max-w-3xl'
          }`}
        >
          {/* Header Bar */}
          <div className="p-4 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5 min-w-0 pr-4">
              {activeMedia && <PlatformIcon platform={activeMedia.platform} size={16} />}
              <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            </div>

            <button
              onClick={() => {
                playTick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player */}
          <div className="relative bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              playsInline
              className={`w-full max-h-[70vh] object-contain ${
                isVertical ? 'aspect-[9/16]' : 'aspect-video'
              }`}
            />
          </div>

          {/* Footer Bar */}
          <div className="p-4 px-5 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/60 text-xs">
            <div className="text-slate-400 font-mono">
              {activeMedia ? (
                <span>
                  {activeMedia.durationFormatted} · {activeMedia.aspectRatio} · {activeMedia.platformName}
                </span>
              ) : (
                <span>Media Stream</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeMedia?.originalUrl && (
                <a
                  href={activeMedia.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Open Post</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {activeMedia && onDownload && (
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    onDownload(activeMedia);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Options</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
