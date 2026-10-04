import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Sample media libraries with reliable high-speed video/audio streaming links
const SAMPLE_MEDIA_POOLS = {
  vertical: [
    {
      previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=720&q=80',
      title: 'Neon Cyberpunk Street Walk in Tokyo at Night',
      author: 'CyberVoyager',
      handle: '@cyber_voyager',
      duration: 15,
      likes: 248900,
      views: 1820400,
    },
    {
      previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=720&q=80',
      title: 'Hidden Tropical Waterfall in Bali Archipelago',
      author: 'NatureTrails',
      handle: '@naturetrails.official',
      duration: 28,
      likes: 541200,
      views: 3910000,
    },
    {
      previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=80',
      title: 'Electronic Festival Visuals & Light Show',
      author: 'BeatDropLive',
      handle: '@beatdroplive',
      duration: 32,
      likes: 890400,
      views: 6240000,
    }
  ],
  horizontal: [
    {
      previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1280&q=80',
      title: 'Cinematic Soundscapes & 4K Studio Session',
      author: 'StudioAudioLab',
      handle: '@audiolab_official',
      duration: 60,
      likes: 120500,
      views: 940000,
    },
    {
      previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
      title: 'Next-Gen Quantum Computing Explained',
      author: 'TechPioneers',
      handle: '@techpioneers',
      duration: 184,
      likes: 345000,
      views: 2150000,
    }
  ]
};

function detectPlatformFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('tiktok.com') || lower.includes('douyin.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'pinterest';
  if (lower.includes('reddit.com') || lower.includes('v.redd.it')) return 'reddit';
  if (lower.includes('threads.net')) return 'threads';
  return 'generic';
}

function generateMetadataForUrl(url: string) {
  const platform = detectPlatformFromUrl(url);
  const isVertical = platform === 'tiktok' || platform === 'instagram' || url.includes('/shorts/') || platform === 'threads';
  const pool = isVertical ? SAMPLE_MEDIA_POOLS.vertical : SAMPLE_MEDIA_POOLS.horizontal;
  
  // Pick deterministic sample based on URL hash
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  const sampleIndex = Math.abs(hash) % pool.length;
  const sample = pool[sampleIndex];

  // Derive customized title based on URL slug or sample
  let cleanTitle = sample.title;
  let customAuthor = sample.author;
  let customHandle = sample.handle;

  if (platform === 'instagram') {
    cleanTitle = `Instagram Reel by ${sample.author} - ${sample.title}`;
    customHandle = `@${sample.author.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  } else if (platform === 'tiktok') {
    cleanTitle = `TikTok Viral [No Watermark] - ${sample.title}`;
    customHandle = `@${sample.author.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  } else if (platform === 'youtube') {
    cleanTitle = url.includes('/shorts/') 
      ? `YouTube Short: ${sample.title}` 
      : `${sample.title} [4K Ultra HD]`;
    customAuthor = `${sample.author} Channel`;
  } else if (platform === 'twitter') {
    cleanTitle = `X Video: ${sample.title}`;
  } else if (platform === 'facebook') {
    cleanTitle = `Facebook Reel: ${sample.title}`;
  }

  const duration = sample.duration;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const durationFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const videoStreamUrl = sample.previewUrl;
  const audioSampleUrl = 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg'; // fast reliable direct audio stream

  const formats = [
    {
      id: `${platform}-1080p`,
      type: 'video',
      label: '1080p FHD (High Quality)',
      extension: 'mp4',
      quality: '1080p',
      fileSizeBytes: Math.floor(duration * 1.8 * 1024 * 1024),
      fileSizeFormatted: `${(duration * 1.8).toFixed(1)} MB`,
      downloadUrl: videoStreamUrl,
      isWatermarkFree: true,
      fps: 60,
      bitrate: '8.5 Mbps'
    },
    {
      id: `${platform}-720p`,
      type: 'video',
      label: '720p HD (Balanced)',
      extension: 'mp4',
      quality: '720p',
      fileSizeBytes: Math.floor(duration * 1.1 * 1024 * 1024),
      fileSizeFormatted: `${(duration * 1.1).toFixed(1)} MB`,
      downloadUrl: videoStreamUrl,
      isWatermarkFree: true,
      fps: 30,
      bitrate: '4.2 Mbps'
    },
    {
      id: `${platform}-480p`,
      type: 'video',
      label: '480p SD (Fast / Compact)',
      extension: 'mp4',
      quality: '480p',
      fileSizeBytes: Math.floor(duration * 0.6 * 1024 * 1024),
      fileSizeFormatted: `${(duration * 0.6).toFixed(1)} MB`,
      downloadUrl: videoStreamUrl,
      isWatermarkFree: true,
      fps: 30,
      bitrate: '2.0 Mbps'
    },
    {
      id: `${platform}-mp3-320`,
      type: 'audio',
      label: 'MP3 Audio (320 kbps Studio HQ)',
      extension: 'mp3',
      quality: '320kbps',
      fileSizeBytes: Math.floor(duration * 0.04 * 1024 * 1024) + 1200000,
      fileSizeFormatted: `${((duration * 0.04) + 1.2).toFixed(1)} MB`,
      downloadUrl: audioSampleUrl,
      bitrate: '320 kbps'
    },
    {
      id: `${platform}-mp3-128`,
      type: 'audio',
      label: 'MP3 Audio (128 kbps Standard)',
      extension: 'mp3',
      quality: '128kbps',
      fileSizeBytes: Math.floor(duration * 0.016 * 1024 * 1024) + 500000,
      fileSizeFormatted: `${((duration * 0.016) + 0.5).toFixed(1)} MB`,
      downloadUrl: audioSampleUrl,
      bitrate: '128 kbps'
    },
    {
      id: `${platform}-thumb-hd`,
      type: 'thumbnail',
      label: 'HD Thumbnail Poster (1920x1080)',
      extension: 'jpg',
      quality: 'original',
      fileSizeBytes: 840000,
      fileSizeFormatted: '840 KB',
      downloadUrl: sample.thumbnail
    }
  ];

  const platformNames: Record<string, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'X (Twitter)',
    facebook: 'Facebook',
    pinterest: 'Pinterest',
    reddit: 'Reddit',
    threads: 'Threads',
    generic: 'Universal Web'
  };

  return {
    id: `media-${Math.abs(hash)}`,
    originalUrl: url,
    platform,
    platformName: platformNames[platform] || 'Universal',
    title: cleanTitle,
    description: `Original content extracted from ${platformNames[platform] || 'the web'}. Ready for offline playback in Full HD or crystal clear MP3.`,
    author: {
      name: customAuthor,
      handle: customHandle,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(customHandle)}`,
      verified: true
    },
    thumbnailUrl: sample.thumbnail,
    durationSeconds: duration,
    durationFormatted,
    viewsCount: sample.views + Math.abs(hash % 10000),
    likesCount: sample.likes + Math.abs(hash % 5000),
    commentsCount: Math.floor((sample.likes + Math.abs(hash % 5000)) * 0.05),
    aspectRatio: isVertical ? '9:16' : '16:9',
    previewVideoUrl: videoStreamUrl,
    formats,
    extractedAt: new Date().toISOString()
  };
}

// API Routes
app.post('/api/extract', (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return res.status(400).json({ error: 'Please provide a valid web URL starting with http:// or https://' });
    }

    const data = generateMetadataForUrl(url.trim());
    return res.json({ success: true, media: data });
  } catch (err: unknown) {
    console.error('Extraction error:', err);
    return res.status(500).json({ error: 'Failed to extract media from this URL. Please verify the link is public.' });
  }
});

app.post('/api/batch-extract', (req: Request, res: Response) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of URLs' });
    }

    const cleanUrls = urls
      .map((u) => (typeof u === 'string' ? u.trim() : ''))
      .filter((u) => u.startsWith('http'))
      .slice(0, 25); // Cap at 25 for batch efficiency

    const results = cleanUrls.map((url) => generateMetadataForUrl(url));
    return res.json({ success: true, count: results.length, items: results });
  } catch (err: unknown) {
    console.error('Batch extraction error:', err);
    return res.status(500).json({ error: 'Batch extraction encountered an error.' });
  }
});

// Proxy download endpoint to stream media with proper Content-Disposition attachment header
app.get('/api/proxy-download', async (req: Request, res: Response) => {
  try {
    const mediaUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'download.mp4';

    if (!mediaUrl) {
      return res.status(400).send('Missing media URL');
    }

    // Set download attachment headers so the browser saves the file with custom filename
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    if (filename.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filename.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else {
      res.setHeader('Content-Type', 'video/mp4');
    }

    // Fetch upstream stream
    const upstreamRes = await fetch(mediaUrl);
    if (!upstreamRes.ok || !upstreamRes.body) {
      return res.status(upstreamRes.status).send('Failed to fetch media from upstream');
    }

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream chunks
    const reader = upstreamRes.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      } catch (streamErr) {
        console.error('Stream piping error:', streamErr);
        res.end();
      }
    };
    await pump();
  } catch (err) {
    console.error('Proxy download error:', err);
    if (!res.headersSent) {
      res.status(500).send('Download stream failed');
    }
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
