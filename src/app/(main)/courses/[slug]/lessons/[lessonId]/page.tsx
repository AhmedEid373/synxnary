import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VideoPlayer } from "@/components/video-player";
import { LessonSidebar } from "@/components/lesson-sidebar";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      lessons: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          duration: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      embedUrl: true,
      videoSource: true,
      thumbnailUrl: true,
      courseId: true,
    },
  });

  if (!lesson || lesson.courseId !== course.id) {
    notFound();
  }

  const progressRecords = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: course.lessons.map((l) => l.id) },
    },
    select: {
      lessonId: true,
      completed: true,
    },
  });

  const progress: Record<string, boolean> = {};
  for (const p of progressRecords) {
    progress[p.lessonId] = p.completed;
  }

  const isCompleted = progress[lessonId] ?? false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <VideoPlayer
            lesson={lesson}
            courseId={course.id}
            isCompleted={isCompleted}
          />
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Lesson Sidebar */}
        <div className="lg:col-span-1">
          <LessonSidebar
            lessons={course.lessons}
            currentLessonId={lessonId}
            courseSlug={slug}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
}
