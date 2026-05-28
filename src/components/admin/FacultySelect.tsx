"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCachedResource } from "@/hooks/useCachedResource";

export interface FacultyOption {
  id: string;
  name: string;
  designation?: string;
  department?: string;
}

interface FacultySelectProps {
  value: string;
  onChange: (facultyId: string, faculty?: FacultyOption) => void;
  className?: string;
  placeholder?: string;
}

export function FacultySelect({ value, onChange, className, placeholder = "Link to faculty (optional)" }: FacultySelectProps) {
  const { data: faculty, loading } = useCachedResource<FacultyOption[]>(
    "/faculty",
    { all: "true" }
  );

  if (loading) {
    return (
      <div className={cn("flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading faculty...
      </div>
    );
  }

  const list = faculty || [];

  return (
    <select
      className={cn("h-11 w-full rounded-xl border border-border bg-background px-4 text-sm", className)}
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const selected = list.find((f) => f.id === id);
        onChange(id, selected);
      }}
    >
      <option value="">{placeholder}</option>
      {list.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}{f.designation ? ` — ${f.designation}` : ""}{f.department ? ` (${f.department})` : ""}
        </option>
      ))}
    </select>
  );
}
