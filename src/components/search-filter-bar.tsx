"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? ""
  );
  const [price, setPrice] = useState(searchParams.get("price") ?? "");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/courses?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: query });
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setCategory(value);
    updateParams({ category: value });
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setPrice(value);
    updateParams({ price: value });
  }

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const priceOptions = [
    { value: "", label: "All Prices" },
    { value: "FREE", label: "Free" },
    { value: "PAID", label: "Paid" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <Input
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className="w-full sm:w-48">
          <Select
            options={categoryOptions}
            value={category}
            onChange={handleCategoryChange}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={priceOptions}
            value={price}
            onChange={handlePriceChange}
          />
        </div>
      </div>
    </div>
  );
}
