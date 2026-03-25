"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    setError("");

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create category");
      setSaving(false);
      return;
    }

    setNewName("");
    setModalOpen(false);
    setSaving(false);
    fetchCategories();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;

    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  }

  if (loading) {
    return <p className="text-gray-500">Loading categories...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => setModalOpen(true)}>Add Category</Button>
      </div>

      <Card>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Slug</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="py-3 text-gray-500">{cat.slug}</td>
                  <td className="py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(cat.id, cat.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError("");
          setNewName("");
        }}
        title="Add Category"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Web Development"
            error={error}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setModalOpen(false);
                setError("");
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
