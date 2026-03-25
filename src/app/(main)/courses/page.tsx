import prisma from "@/lib/prisma";
import { CourseGrid } from "@/components/course-grid";
import { SearchFilterBar } from "@/components/search-filter-bar";

interface CoursesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const { q, category, price } = params;

  const where: Record<string, unknown> = { published: true };

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }

  if (category) {
    where.category = { slug: category };
  }

  if (price === "FREE" || price === "PAID") {
    where.price = price;
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { lessons: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="mt-2 text-gray-500">
          Browse our collection of courses and start learning today
        </p>
      </div>

      <div className="mb-8">
        <SearchFilterBar />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {courses.length} {courses.length === 1 ? "course" : "courses"} found
      </p>

      <CourseGrid courses={courses} />
    </div>
  );
}
