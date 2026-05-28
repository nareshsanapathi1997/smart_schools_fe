"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCachedResource } from "@/hooks/useCachedResource";

interface TeacherSelectProps {
  value: string;
  onChange: (teacherName: string, teacherId?: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function TeacherSelect({ value, onChange, className, placeholder = "Select Teacher", required }: TeacherSelectProps) {
  const { data: teachers, loading } = useCachedResource<{ id: string; name: string; designation?: string; department?: string }[]>(
    "/erp/teachers"
  );

  if (loading) {
    return (
      <div className={cn("flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading teachers...
      </div>
    );
  }

  const list = teachers || [];
  const selectedId = list.find((t) => t.name === value)?.id || "";

  return (
    <select
      className={cn("h-11 w-full rounded-xl border border-border bg-background px-4 text-sm", className)}
      value={selectedId}
      onChange={(e) => {
        const teacher = list.find((t) => t.id === e.target.value);
        onChange(teacher?.name || "", teacher?.id);
      }}
      required={required}
    >
      <option value="">{placeholder}</option>
      {list.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}{t.designation ? ` — ${t.designation}` : ""}{t.department ? ` (${t.department})` : ""}
        </option>
      ))}
      {value && !list.some((t) => t.name === value) && (
        <option value="__custom__">{value}</option>
      )}
    </select>
  );
}
