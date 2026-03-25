"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ScrapedData {
  title: string | null;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  videoSource: string;
  duration: string | null;
}

interface LinkScraperInputProps {
  onChange: (data: ScrapedData) => void;
  initialUrl?: string;
}

export default function LinkScraperInput({
  onChange,
  initialUrl = "",
}: LinkScraperInputProps) {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ScrapedData | null>(null);

  const fetchMetadata = useCallback(
    async (targetUrl: string) => {
      if (!targetUrl.trim()) return;

      try {
        new URL(targetUrl);
      } catch {
        setError("Invalid URL");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch metadata");
        }

        const data: ScrapedData = await res.json();
        setPreview(data);
        onChange(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch metadata");
        setPreview(null);
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    setUrl(pasted);
    fetchMetadata(pasted);
  };

  const handleBlur = () => {
    if (url && !preview) {
      fetchMetadata(url);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          onBlur={handleBlur}
          disabled={loading}
        />
        <Button
          type="button"
          onClick={() => fetchMetadata(url)}
          disabled={loading || !url.trim()}
        >
          {loading ? "Fetching..." : "Fetch"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Scraping video metadata...
        </div>
      )}

      {preview && !loading && (
        <Card className="overflow-hidden">
          <div className="flex gap-4 p-4">
            {preview.thumbnailUrl && (
              <img
                src={preview.thumbnailUrl}
                alt={preview.title || "Video thumbnail"}
                className="h-24 w-40 rounded object-cover"
              />
            )}
            <div className="flex flex-col justify-center gap-2">
              {preview.title && (
                <p className="font-medium leading-tight">{preview.title}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="info">{preview.videoSource}</Badge>
                {preview.duration && (
                  <span className="text-sm text-muted-foreground">
                    {preview.duration}
                  </span>
                )}
              </div>
              {preview.embedUrl && (
                <p className="truncate text-xs text-muted-foreground">
                  {preview.embedUrl}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
