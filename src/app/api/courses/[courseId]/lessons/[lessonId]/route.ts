import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { VideoSource } from "@prisma/client";

type RouteParams = { params: Promise<{ courseId: string; lessonId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
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

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;

    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      videoUrl,
      embedUrl,
      videoSource,
      thumbnailUrl,
      duration,
      position,
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (videoUrl !== undefined) data.videoUrl = videoUrl;
    if (embedUrl !== undefined) data.embedUrl = embedUrl;
    if (videoSource !== undefined) data.videoSource = videoSource as VideoSource;
    if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) data.duration = duration;
    if (position !== undefined) data.position = position;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;

    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
