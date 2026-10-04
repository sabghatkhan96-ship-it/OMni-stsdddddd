import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { playTick } from '../utils/sound';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does TikTok No-Watermark downloading work?',
    answer:
      'OmniStream bypasses the overlay render step by directly querying the CDN source stream published by the original TikTok creator before the watermark graphics are rendered onto the client player.',
  },
  {
    question: 'Can I extract and download audio as MP3?',
    answer:
      'Yes. OmniStream offers audio extraction in high-bitrate Studio MP3 (320 kbps) and Standard (128 kbps). This works for YouTube music videos, Instagram Reels audio tracks, and TikTok sounds.',
  },
  {
    question: 'How does the Batch Queue work?',
    answer:
      'Switch to the Batch Queue tab, paste multiple links separated by new lines, and click "Add to Queue". You can apply presets like "All 1080p MP4" or "All MP3" and download all items sequentially without manual repetition.',
  },
  {
    question: 'Where are downloaded files saved on mobile devices (iOS / Android)?',
    answer:
      'On Android, files are saved directly to your Downloads folder. On iOS Safari, tap the download arrow in the address bar, open the file, and tap Share > Save Video to add it to your Photos Camera Roll.',
  },
  {
    question: 'Are there any limits on file size or resolution?',
    answer:
      'OmniStream supports up to 1080p Full HD at 60fps for standard social media clips, and original resolution thumbnails. Full length videos up to several gigabytes are supported via our proxy stream pipeline.',
  },
  {
    question: 'Is any private data or browsing history logged?',
    answer:
      'No. Your download history is stored solely inside your local browser via localStorage. OmniStream does not maintain user account tracking, cookies, or video archiving.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    playTick();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full mb-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-sm text-slate-400">
          Learn how OmniStream processes streams, extracts audio, and handles multi-platform downloads.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
