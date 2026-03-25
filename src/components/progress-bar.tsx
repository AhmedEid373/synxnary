import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("relative w-full rounded-full bg-gray-200", className)}>
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
      {clamped > 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
