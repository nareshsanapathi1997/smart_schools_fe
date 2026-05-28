"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCachedResource } from "@/hooks/useCachedResource";

interface StudentOption {
  id: string;
  student_name: string;
  admission_no: string;
  class_level?: string;
  section?: string;
}

interface StudentSelectProps {
  value: string;
  onChange: (studentId: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export function StudentSelect({
  value,
  onChange,
  className,
  required,
  placeholder = "Select Student",
}: StudentSelectProps) {
  const { data: students, loading } = useCachedResource<StudentOption[]>(
    "/students",
    { all: "true", status: "active" }
  );

  if (loading) {
    return (
      <div className={cn("flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading students...
      </div>
    );
  }

  const list = students || [];

  return (
    <select
      className={cn("h-11 w-full rounded-xl border border-border bg-background px-4 text-sm", className)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">{placeholder}</option>
      {list.map((s) => (
        <option key={s.id} value={s.id}>
          {s.student_name} — {s.admission_no}{s.class_level ? ` (${s.class_level}${s.section ? `-${s.section}` : ""})` : ""}
        </option>
      ))}
    </select>
  );
}
