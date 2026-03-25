"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  embedUrl: string;
  videoSource: string;
  title: string;
  thumbnailUrl?: string | null;
}

interface VideoPlayerProps {
  lesson: Lesson;
  courseId: string;
  isCompleted: boolean;
  onToggleComplete?: () => void;
}

export function VideoPlayer({
  lesson,
  courseId,
  isCompleted: initialCompleted,
  onToggleComplete,
}: VideoPlayerProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function handleToggleComplete() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/lessons/${lesson.id}/progress`,
        { method: "POST" }
      );
      if (res.ok) {
        setCompleted((prev) => !prev);
        onToggleComplete?.();
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {lesson.videoSource === "YOUTUBE" ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
          <iframe
            src={lesson.embedUrl}
            title={lesson.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-video w-full bg-gray-900 flex items-center justify-center">
            {lesson.thumbnailUrl ? (
              <Image
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                fill
                className="object-cover opacity-60"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
            )}
            <div className="relative z-10 text-center space-y-4 p-6">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
              <a
                href={lesson.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Watch on {lesson.videoSource.charAt(0) + lesson.videoSource.slice(1).toLowerCase()}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </Card>
      )}

      <Button
        variant={completed ? "secondary" : "primary"}
        onClick={handleToggleComplete}
        isLoading={loading}
        className="w-full sm:w-auto"
      >
        {completed ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Completed
          </span>
        ) : (
          "Mark as Complete"
        )}
      </Button>
    </div>
  );
}
