"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: string;
  published: boolean;
  category: { id: string; name: string };
  _count: { lessons: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  async function togglePublish(courseId: string, published: boolean) {
    await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    fetchCourses();
  }

  async function handleDelete(courseId: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    fetchCourses();
  }

  if (loading) {
    return <p className="text-gray-500">Loading courses...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <Link href="/admin/courses/new">
          <Button>New Course</Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Lessons</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No courses yet.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {course.category.name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={course.price === "FREE" ? "success" : "warning"}>
                      {course.price}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublish(course.id, course.published)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                        course.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {course._count.lessons}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(course.id, course.title)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
