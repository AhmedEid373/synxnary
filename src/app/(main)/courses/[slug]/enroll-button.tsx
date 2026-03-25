"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      isLoading={loading}
    >
      Enroll Now
    </Button>
  );
}
