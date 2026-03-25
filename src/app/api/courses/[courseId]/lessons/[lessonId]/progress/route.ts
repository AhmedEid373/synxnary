import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lessonId } = await params;

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;

    const existing = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (existing) {
      const updated = await prisma.lessonProgress.update({
        where: { id: existing.id },
        data: {
          completed: !existing.completed,
          completedAt: !existing.completed ? new Date() : null,
        },
      });

      return NextResponse.json({ completed: updated.completed });
    }

    const progress = await prisma.lessonProgress.create({
      data: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ completed: progress.completed });
  } catch (error) {
    console.error("Error toggling progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
