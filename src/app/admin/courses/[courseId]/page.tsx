"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  position: number;
  videoSource: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  price: "FREE" | "PAID";
  thumbnail: string | null;
  published: boolean;
  lessons: Lesson[];
}

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<"FREE" | "PAID">("FREE");
  const [thumbnail, setThumbnail] = useState("");
  const [published, setPublished] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([course, cats]: [Course, Category[]]) => {
      setTitle(course.title);
      setDescription(course.description);
      setCategoryId(course.categoryId);
      setPrice(course.price);
      setThumbnail(course.thumbnail || "");
      setPublished(course.published);
      setLessons(course.lessons);
      setCategories(cats);
      setLoading(false);
    });
  }, [courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      setError("Title, description, and category are required.");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        price,
        thumbnail: thumbnail.trim() || null,
        published,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update course");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/admin/courses");
  }

  if (loading) {
    return <p className="text-gray-500">Loading course...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Course</h1>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title"
          />

          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course description"
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-indigo-500 focus:ring-indigo-500/30"
            />
          </div>

          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  value="FREE"
                  checked={price === "FREE"}
                  onChange={() => setPrice("FREE")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Free</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  value="PAID"
                  checked={price === "PAID"}
                  onChange={() => setPrice("PAID")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Paid</span>
              </label>
            </div>
          </div>

          <Input
            label="Thumbnail URL"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Published
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/admin/courses")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
          <Link href={`/admin/courses/${courseId}/lessons/new`}>
            <Button size="sm">Add Lesson</Button>
          </Link>
        </div>

        {lessons.length === 0 ? (
          <p className="text-sm text-gray-500">No lessons yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {lesson.position}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {lesson.title}
                  </span>
                  <Badge>{lesson.videoSource}</Badge>
                </div>
                <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
