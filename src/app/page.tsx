export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CourseGrid } from "@/components/course-grid";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  let featuredCourses: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    price: "FREE" | "PAID";
    category: { name: string };
    _count: { lessons: number };
  }[] = [];
  try {
    featuredCourses = await prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        category: { select: { name: true } },
        _count: { select: { lessons: true } },
      },
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                Learn Anything, Anytime
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Discover a curated collection of free and premium courses from
                the best sources across the web. Start learning today at your
                own pace.
              </p>
              <div className="mt-10">
                <Link href="/courses">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8 py-3 text-base">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Courses
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Our latest additions to help you grow your skills
            </p>
          </div>
          <CourseGrid courses={featuredCourses} />
          {featuredCourses.length > 0 && (
            <div className="mt-12 text-center">
              <Link href="/courses">
                <Button variant="secondary" size="lg">
                  View All Courses
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
