import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface Lesson {
  id: string;
  title: string;
  position: number;
  duration?: string | null;
}

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  courseSlug: string;
  progress: Record<string, boolean>;
}

export function LessonSidebar({
  lessons,
  currentLessonId,
  courseSlug,
  progress,
}: LessonSidebarProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-900">Course Lessons</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {Object.values(progress).filter(Boolean).length} of {lessons.length}{" "}
          completed
        </p>
      </div>

      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = progress[lesson.id] ?? false;

            return (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${courseSlug}/lessons/${lesson.id}`}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50",
                    isCurrent && "bg-indigo-50 hover:bg-indigo-50 border-l-2 border-indigo-600"
                  )}
                >
                  {/* Position / Check */}
                  <span
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : isCurrent
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      lesson.position
                    )}
                  </span>

                  {/* Title and duration */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate",
                        isCurrent
                          ? "font-semibold text-indigo-700"
                          : "font-medium text-gray-700"
                      )}
                    >
                      {lesson.title}
                    </p>
                    {lesson.duration && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lesson.duration}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
