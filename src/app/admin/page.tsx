import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const [totalUsers, totalCourses, totalEnrollments, publishedCourses, recentEnrollments] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Total Courses", value: totalCourses },
    { label: "Published Courses", value: publishedCourses },
    { label: "Total Enrollments", value: totalEnrollments },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Enrollments
        </h2>
        {recentEnrollments.length === 0 ? (
          <p className="text-sm text-gray-500">No enrollments yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentEnrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {enrollment.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {enrollment.user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">
                    {enrollment.course.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
