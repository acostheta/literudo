export type EmbedPlatform = 'youtube' | 'soundcloud';

export interface DetectedEmbed {
  platform: EmbedPlatform;
  embedUrl: string;
}

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
];

function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function isSoundCloudUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?soundcloud\.com\/.+/.test(url);
}

export function detectPlatform(url: string): EmbedPlatform | null {
  if (extractYouTubeId(url)) return 'youtube';
  if (isSoundCloudUrl(url)) return 'soundcloud';
  return null;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export async function resolveSoundCloudEmbedUrl(
  trackUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackUrl)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const html: string = data.html || '';
    const srcMatch = html.match(/src="([^"]+)"/);
    return srcMatch?.[1] || null;
  } catch {
    return null;
  }
}

export async function getEmbedUrl(
  url: string,
  platform: EmbedPlatform
): Promise<string | null> {
  if (platform === 'youtube') return getYoutubeEmbedUrl(url);
  if (platform === 'soundcloud') return resolveSoundCloudEmbedUrl(url);
  return null;
}
