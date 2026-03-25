import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnrollButton } from "./enroll-button";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      lessons: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          duration: true,
        },
      },
      _count: { select: { lessons: true } },
    },
  });

  if (!course) {
    notFound();
  }

  let enrollment = null;
  if (session?.user?.id) {
    enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });
  }

  const isEnrolled = !!enrollment;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/80">
                  {course.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Title and badges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge>{course.category.name}</Badge>
              <Badge
                variant={course.price === "FREE" ? "success" : "warning"}
              >
                {course.price === "FREE" ? "Free" : "Paid"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course.title}
            </h1>
          </div>

          {/* Description */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Lesson List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Course Content ({course._count.lessons}{" "}
              {course._count.lessons === 1 ? "lesson" : "lessons"})
            </h2>
            <div className="space-y-2">
              {course.lessons.map((lesson) => (
                <Card key={lesson.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
                      {lesson.position}
                    </span>
                    {isEnrolled ? (
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson.id}`}
                        className="text-gray-900 hover:text-indigo-600 transition-colors font-medium flex-1"
                      >
                        {lesson.title}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium flex-1">
                        {lesson.title}
                      </span>
                    )}
                    {lesson.duration && (
                      <span className="text-sm text-gray-400 flex-shrink-0">
                        {lesson.duration}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  {course._count.lessons}{" "}
                  {course._count.lessons === 1 ? "lesson" : "lessons"}
                </p>
              </div>

              {session?.user ? (
                isEnrolled ? (
                  <Link
                    href={`/courses/${course.slug}/lessons/${course.lessons[0]?.id}`}
                    className="block"
                  >
                    <Button className="w-full" size="lg">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <EnrollButton courseId={course.id} />
                )
              ) : (
                <Link href="/sign-in" className="block">
                  <Button variant="secondary" className="w-full" size="lg">
                    Sign in to Enroll
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
