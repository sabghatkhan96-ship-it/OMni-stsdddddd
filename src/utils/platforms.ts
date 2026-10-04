import { PlatformConfig, PlatformId } from '../types';

export const PLATFORMS_CONFIG: Record<PlatformId, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    displayName: 'Instagram (Reels, Posts, Stories)',
    iconName: 'Instagram',
    brandColor: '#E1306C',
    gradient: 'from-amber-500 via-rose-500 to-purple-600',
    supportedFormats: ['1080p MP4', '720p MP4', 'MP3 Audio', 'Cover Art'],
    placeholderText: 'Paste Instagram Reel, Story, or Post link...',
    features: ['1080p FHD Reels', 'Story & Carousel Grabber', 'HQ Audio Extraction'],
    sampleUrls: [
      { label: 'Cinematic Reel', url: 'https://www.instagram.com/reel/C3zYp9LqX1/' },
      { label: 'Travel Short', url: 'https://www.instagram.com/reel/C8x7A0qNm2/' }
    ]
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    displayName: 'TikTok (No Watermark)',
    iconName: 'Video',
    brandColor: '#00F2FE',
    gradient: 'from-cyan-400 via-slate-900 to-rose-500',
    supportedFormats: ['HD MP4 (No Watermark)', 'Original MP4', 'MP3 Audio', 'Cover'],
    placeholderText: 'Paste TikTok video link (tiktok.com/@user/video/... or vt.tiktok.com/...)',
    features: ['100% Clean / No Watermark', 'Original Creator Audio', 'Fast CDN Pipeline'],
    sampleUrls: [
      { label: 'Viral Trend Video', url: 'https://www.tiktok.com/@discoverearth/video/7342819028192831' },
      { label: 'Short Clip', url: 'https://vt.tiktok.com/ZS2x8aBc9/' }
    ]
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    displayName: 'YouTube (Shorts & Videos)',
    iconName: 'Youtube',
    brandColor: '#FF0000',
    gradient: 'from-red-600 to-red-800',
    supportedFormats: ['1080p 60fps', '720p HD', '480p SD', '320kbps MP3', 'MaxRes Thumbnail'],
    placeholderText: 'Paste YouTube Video or Shorts URL (youtube.com/watch?v=... or youtu.be/...)',
    features: ['Shorts & Full Videos', '320 kbps MP3 Extraction', 'MaxRes Thumbnail Grabber'],
    sampleUrls: [
      { label: 'YouTube Short', url: 'https://youtube.com/shorts/k9ZkM4PzZvw' },
      { label: 'Full 4K Nature Video', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' }
    ]
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    displayName: 'X / Twitter Videos & GIFs',
    iconName: 'Twitter',
    brandColor: '#1DA1F2',
    gradient: 'from-slate-700 via-slate-900 to-cyan-500',
    supportedFormats: ['1080p MP4', '720p MP4', '480p MP4', 'Audio MP3'],
    placeholderText: 'Paste X / Twitter post URL (x.com/.../status/... or twitter.com/...)',
    features: ['Instant Direct MP4', 'Thread Video Grabber', 'Crisp Audio Stream'],
    sampleUrls: [
      { label: 'Tech Demo Video', url: 'https://x.com/OpenAI/status/1758223945973682570' },
      { label: 'Space Launch Clip', url: 'https://twitter.com/SpaceX/status/1768625902094897451' }
    ]
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    displayName: 'Facebook (Reels & Videos)',
    iconName: 'Facebook',
    brandColor: '#1877F2',
    gradient: 'from-blue-600 to-indigo-800',
    supportedFormats: ['HD 1080p MP4', 'SD 480p MP4', 'MP3 Audio'],
    placeholderText: 'Paste Facebook video or reel link (facebook.com/reel/... or fb.watch/...)',
    features: ['Public Reels & Watch', 'High Definition Audio', 'Direct MP4 Stream'],
    sampleUrls: [
      { label: 'Viral Reel', url: 'https://www.facebook.com/reel/113829104812390' },
      { label: 'Watch Video', url: 'https://fb.watch/qR_k9L1p/' }
    ]
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    displayName: 'Pinterest (Pins & Idea Videos)',
    iconName: 'Pin',
    brandColor: '#E60023',
    gradient: 'from-rose-600 to-red-700',
    supportedFormats: ['Original HD Video', 'HD Image Pin'],
    placeholderText: 'Paste Pinterest pin link (pin.it/... or pinterest.com/pin/...)',
    features: ['Lossless Pin Video', 'High Res Pin Image', 'Idea Pins Grabber'],
    sampleUrls: [
      { label: 'Architecture Pin', url: 'https://pinterest.com/pin/843721311440291823/' }
    ]
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    displayName: 'Reddit (v.redd.it with Audio)',
    iconName: 'MessageSquare',
    brandColor: '#FF4500',
    gradient: 'from-orange-600 to-amber-700',
    supportedFormats: ['Merged 1080p Audio+Video', '720p MP4', 'MP3 Audio'],
    placeholderText: 'Paste Reddit post link (reddit.com/r/.../comments/...)',
    features: ['Audio+Video Auto-Merge', 'Subreddit Clip Grabber', 'Original Audio Track'],
    sampleUrls: [
      { label: 'Popular Clip', url: 'https://www.reddit.com/r/videos/comments/1b9z1x8/robotics_breakthrough/' }
    ]
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    displayName: 'Threads by Instagram',
    iconName: 'AtSign',
    brandColor: '#000000',
    gradient: 'from-neutral-700 via-neutral-900 to-emerald-600',
    supportedFormats: ['1080p MP4', 'Original Audio', 'Cover'],
    placeholderText: 'Paste Threads video link (threads.net/@user/post/...)',
    features: ['Direct Stream MP4', 'Clean Video Without Watermark'],
    sampleUrls: [
      { label: 'Threads Video', url: 'https://www.threads.net/@zuck/post/C2A98zLg_3j' }
    ]
  },
  generic: {
    id: 'generic',
    name: 'Universal',
    displayName: 'Universal Video Downloader',
    iconName: 'Globe',
    brandColor: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-600',
    supportedFormats: ['Best Available MP4', 'MP3 Audio', 'Thumbnail'],
    placeholderText: 'Paste any public video link...',
    features: ['Universal Extractor', 'HLS / MP4 Stream Extraction'],
    sampleUrls: []
  }
};

export function detectPlatform(rawUrl: string): PlatformId {
  if (!rawUrl || typeof rawUrl !== 'string') return 'generic';
  const url = rawUrl.trim().toLowerCase();

  if (url.includes('instagram.com') || url.includes('instagr.am')) {
    return 'instagram';
  }
  if (url.includes('tiktok.com') || url.includes('douyin.com')) {
    return 'tiktok';
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('twitter.com') || url.includes('x.com') || url.includes('t.co')) {
    return 'twitter';
  }
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
    return 'facebook';
  }
  if (url.includes('pinterest.com') || url.includes('pin.it')) {
    return 'pinterest';
  }
  if (url.includes('reddit.com') || url.includes('v.redd.it')) {
    return 'reddit';
  }
  if (url.includes('threads.net')) {
    return 'threads';
  }
  return 'generic';
}

export function formatNumber(num: number | undefined): string {
  if (!num && num !== 0) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
