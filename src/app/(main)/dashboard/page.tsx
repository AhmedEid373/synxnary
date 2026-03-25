export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";

export const metadata = {
  title: "My Learning | Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = (session.user as { id: string }).id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          category: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              position: true,
              progress: {
                where: { userId, completed: true },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        My Learning
      </h1>

      {enrollments.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-indigo-50 p-6">
            <svg
              className="h-12 w-12 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No courses yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            You haven&apos;t enrolled in any courses. Browse our catalog to find
            something that interests you.
          </p>
          <Link href="/courses" className="mt-6">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const { course } = enrollment;
            const totalLessons = course.lessons.length;
            const completedLessons = course.lessons.filter(
              (l) => l.progress.length > 0
            ).length;
            const progressPercent =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            // Find the first incomplete lesson, or fall back to the first lesson
            const nextLesson =
              course.lessons.find((l) => l.progress.length === 0) ??
              course.lessons[0];

            const continuePath = nextLesson
              ? `/courses/${course.slug}/lessons/${nextLesson.id}`
              : `/courses/${course.slug}`;

            return (
              <Card key={enrollment.id} className="flex flex-col p-0 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <Badge variant="info">{course.category.name}</Badge>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  {/* Progress section */}
                  <div className="mt-auto space-y-2">
                    <ProgressBar value={progressPercent} className="h-3" />
                    <p className="text-sm text-gray-500">
                      {completedLessons} of {totalLessons} lessons completed
                    </p>
                  </div>

                  <Link href={continuePath}>
                    <Button size="sm" className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
