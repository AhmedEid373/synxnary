import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { VideoSource } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
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

    if (!title || !videoUrl || !embedUrl || !videoSource) {
      return NextResponse.json(
        { error: "Title, videoUrl, embedUrl, and videoSource are required" },
        { status: 400 }
      );
    }

    let finalPosition = position;
    if (finalPosition === undefined || finalPosition === null) {
      const maxLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      finalPosition = (maxLesson?.position ?? 0) + 1;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        embedUrl,
        videoSource: videoSource as VideoSource,
        thumbnailUrl: thumbnailUrl || null,
        duration: duration || null,
        position: finalPosition,
        courseId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
