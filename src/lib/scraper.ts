type VideoMetadata = {
  title: string | null;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  videoSource: string;
  duration: string | null;
};

async function extractOGTags(
  url: string
): Promise<{ title: string | null; image: string | null }> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MetadataBot/1.0)",
      },
    });
    const html = await response.text();

    const titleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i
    ) ||
      html.match(
        /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i
      );

    const imageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i
    ) ||
      html.match(
        /<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i
      );

    return {
      title: titleMatch?.[1] ?? null,
      image: imageMatch?.[1] ?? null,
    };
  } catch {
    return { title: null, image: null };
  }
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export async function extractVideoMetadata(
  url: string
): Promise<VideoMetadata> {
  const parsed = new URL(url);
  const hostname = parsed.hostname.replace(/^www\./, "");

  // YouTube
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    let title: string | null = null;
    try {
      const og = await extractOGTags(url);
      title = og.title;
    } catch {
      // ignore
    }

    return {
      title,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      videoSource: "YOUTUBE",
      duration: null,
    };
  }

  // Udemy
  if (hostname === "udemy.com") {
    const og = await extractOGTags(url);
    return {
      title: og.title,
      thumbnailUrl: og.image,
      embedUrl: url,
      videoSource: "UDEMY",
      duration: null,
    };
  }

  // Coursera
  if (hostname === "coursera.org") {
    const og = await extractOGTags(url);
    return {
      title: og.title,
      thumbnailUrl: og.image,
      embedUrl: url,
      videoSource: "COURSERA",
      duration: null,
    };
  }

  // Fallback
  const og = await extractOGTags(url);
  return {
    title: og.title,
    thumbnailUrl: og.image,
    embedUrl: url,
    videoSource: "OTHER",
    duration: null,
  };
}
