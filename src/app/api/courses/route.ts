import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");

  const where = published === "true" ? { published: true } : {};

  const courses = await prisma.course.findMany({
    where,
    include: {
      category: true,
      _count: { select: { lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, categoryId, price, thumbnail } = body;

  if (!title || !description || !categoryId) {
    return NextResponse.json(
      { error: "Title, description, and categoryId are required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(title);

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A course with this title already exists" },
      { status: 409 }
    );
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description,
      categoryId,
      price: price || "FREE",
      thumbnail: thumbnail || null,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
