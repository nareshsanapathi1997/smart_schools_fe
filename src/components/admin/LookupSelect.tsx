"use client";

import { Loader2 } from "lucide-react";
import { useLookups } from "@/hooks/useLookups";
import { LookupType } from "@/lib/lookups";
import { cn } from "@/lib/utils";

interface LookupSelectProps {
  type: LookupType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  allowEmpty?: boolean;
  fallbackOptions?: { label: string; value: string }[];
}

export function LookupSelect({
  type,
  value,
  onChange,
  placeholder = "Select...",
  className,
  required,
  allowEmpty = true,
  fallbackOptions = [],
}: LookupSelectProps) {
  const { options, loading } = useLookups(type, { all: true });
  const list = options.length ? options : fallbackOptions;

  if (loading) {
    return (
      <div className={cn("flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <select
      className={cn("h-11 w-full rounded-xl border border-border bg-background px-4 text-sm", className)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {list.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
      {value && !list.some((o) => o.value === value) && (
        <option value={value}>{value}</option>
      )}
    </select>
  );
}
