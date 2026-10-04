export type PlatformId =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'facebook'
  | 'pinterest'
  | 'reddit'
  | 'threads'
  | 'generic';

export type MediaFormatType = 'video' | 'audio' | 'thumbnail';

export interface QualityOption {
  id: string;
  type: MediaFormatType;
  label: string;
  extension: 'mp4' | 'mp3' | 'jpg' | 'png' | 'webp';
  quality: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  downloadUrl: string;
  isWatermarkFree?: boolean;
  fps?: number;
  bitrate?: string;
}

export interface MediaAuthor {
  name: string;
  handle: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface ExtractedMedia {
  id: string;
  originalUrl: string;
  platform: PlatformId;
  platformName: string;
  title: string;
  description?: string;
  author: MediaAuthor;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  previewVideoUrl: string;
  formats: QualityOption[];
  extractedAt: string;
}

export interface DownloadJob {
  id: string;
  mediaId: string;
  title: string;
  platform: PlatformId;
  thumbnailUrl: string;
  format: QualityOption;
  progress: number; // 0 - 100
  status: 'queued' | 'downloading' | 'completed' | 'failed' | 'paused';
  speed: string; // e.g. "4.8 MB/s"
  etaSeconds: number;
  downloadedBytes: number;
  totalBytes: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
  localBlobUrl?: string;
  filename: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: PlatformId;
  originalUrl: string;
  thumbnailUrl: string;
  formatLabel: string;
  fileSizeFormatted: string;
  extension: string;
  downloadedAt: string;
  authorName: string;
  previewUrl?: string;
  filename: string;
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  displayName: string;
  iconName: string;
  brandColor: string;
  gradient: string;
  supportedFormats: string[];
  placeholderText: string;
  features: string[];
  sampleUrls: {
    label: string;
    url: string;
  }[];
}
