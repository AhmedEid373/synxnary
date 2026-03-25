"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import LinkScraperInput, {
  type ScrapedData,
} from "@/components/link-scraper-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewLessonPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [position, setPosition] = useState<number | "">("");
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [videoSource, setVideoSource] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScraped = useCallback((data: ScrapedData) => {
    if (data.title) setTitle(data.title);
    if (data.embedUrl) {
      setEmbedUrl(data.embedUrl);
      setVideoUrl(data.embedUrl);
    }
    if (data.videoSource) setVideoSource(data.videoSource);
    if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
    if (data.duration) setDuration(data.duration);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          videoUrl: videoUrl || embedUrl,
          embedUrl,
          videoSource,
          thumbnailUrl: thumbnailUrl || undefined,
          duration: duration || undefined,
          position: position !== "" ? Number(position) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create lesson");
      }

      router.push(`/admin/courses/${courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">Add New Lesson</h1>

      <div>
        <label className="mb-2 block text-sm font-medium">Video URL</label>
        <LinkScraperInput onChange={handleScraped} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Lesson description (optional)"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="duration"
              className="mb-2 block text-sm font-medium"
            >
              Duration
            </label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 12:34"
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-medium"
            >
              Position
            </label>
            <Input
              id="position"
              type="number"
              min={1}
              value={position}
              onChange={(e) =>
                setPosition(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="Auto"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting || !title || !embedUrl}>
            {submitting ? "Creating..." : "Create Lesson"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/admin/courses/${courseId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
