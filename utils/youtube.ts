/**
 * Extract the 11-character YouTube video ID from a URL.
 * Handles: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/.
 * Returns null if the URL doesn't match a known YouTube form.
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const pattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(pattern)
  return match ? match[1] : null
}

/** Build an embeddable URL from any YouTube URL form. Null if not a YouTube URL. */
export function youtubeEmbedUrl(url: string): string | null {
  const id = extractYoutubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

/** Build a thumbnail URL (high quality) from any YouTube URL form. */
export function youtubeThumbnailUrl(url: string): string | null {
  const id = extractYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
