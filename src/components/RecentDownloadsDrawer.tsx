import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Download, Search, HardDrive, Play, Copy, Check, FileDown } from 'lucide-react';
import { DownloadHistoryItem } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { playTick, playSuccessChime } from '../utils/sound';

interface RecentDownloadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  onPreviewUrl?: (url: string, title: string) => void;
}

export const RecentDownloadsDrawer: React.FC<RecentDownloadsDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onRemoveItem,
  onPreviewUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const handleCopyLink = (item: DownloadHistoryItem) => {
    playTick();
    navigator.clipboard.writeText(item.originalUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    playTick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omnistream_downloads_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    playSuccessChime();
  };

  const handleRedownload = (item: DownloadHistoryItem) => {
    playTick();
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(item.previewUrl || '')}&filename=${encodeURIComponent(item.filename)}`;
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccessChime();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-slate-950 border-l border-slate-800 shadow-2xl z-10 flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Downloads</h3>
                  <p className="text-xs text-slate-400 font-mono tabular-nums">
                    {history.length} items saved locally
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
                      title="Export as JSON"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onClearHistory}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Clear history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/40">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search downloads by title or author..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Platform filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'tiktok', 'instagram', 'youtube', 'twitter', 'facebook'].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => {
                      playTick();
                      setFilterPlatform(plat);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap capitalize ${
                      filterPlatform === plat
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {plat === 'all' ? 'All' : plat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <HardDrive className="w-10 h-10 mb-3 text-slate-700 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-400">No downloads found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {history.length === 0
                      ? 'Download your first media file from Instagram, TikTok, or YouTube to see it here.'
                      : 'Try adjusting your search or platform filter.'}
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {item.previewUrl && onPreviewUrl && (
                          <button
                            onClick={() => {
                              playTick();
                              onPreviewUrl(item.previewUrl!, item.title);
                            }}
                            className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            title="Preview"
                          >
                            <Play className="w-3 h-3 fill-current translate-x-0.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                          <PlatformIcon platform={item.platform} size={12} />
                          <span className="font-semibold text-slate-300 capitalize">
                            {item.platform}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-cyan-400 font-medium">
                            {item.formatLabel}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          <span>{item.fileSizeFormatted}</span>
                          <span aria-hidden="true">·</span>
                          <span>{new Date(item.downloadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRedownload(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Download className="w-3 h-3 text-cyan-400" />
                          <span>Re-download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
