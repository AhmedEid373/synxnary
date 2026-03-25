import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    price: "FREE" | "PAID";
    category: { name: string };
    _count: { lessons: number };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-lg hover:-translate-y-1 duration-200">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white/80">
                {course.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>{course.category.name}</Badge>
            <Badge variant={course.price === "FREE" ? "success" : "warning"}>
              {course.price === "FREE" ? "Free" : "Paid"}
            </Badge>
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-1 text-sm text-gray-400">
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {course._count.lessons}{" "}
              {course._count.lessons === 1 ? "lesson" : "lessons"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
