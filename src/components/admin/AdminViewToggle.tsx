"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminViewMode = "list" | "cards";

interface AdminViewToggleProps {
  value: AdminViewMode;
  onChange: (mode: AdminViewMode) => void;
  className?: string;
}

export function AdminViewToggle({ value, onChange, className }: AdminViewToggleProps) {
  return (
    <div className={cn("inline-flex rounded-xl border border-border/60 bg-background p-1", className)}>
      <Button
        type="button"
        size="sm"
        variant={value === "list" ? "default" : "ghost"}
        className="rounded-lg"
        onClick={() => onChange("list")}
      >
        <List className="h-4 w-4" /> List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "cards" ? "default" : "ghost"}
        className="rounded-lg"
        onClick={() => onChange("cards")}
      >
        <LayoutGrid className="h-4 w-4" /> Cards
      </Button>
    </div>
  );
}

export function useAdminViewMode(defaultMode: AdminViewMode = "list") {
  const [viewMode, setViewMode] = useState<AdminViewMode>(defaultMode);

  useEffect(() => {
    const saved = localStorage.getItem("admin-view-mode") as AdminViewMode | null;
    if (saved === "list" || saved === "cards") setViewMode(saved);
  }, []);

  const setMode = (mode: AdminViewMode) => {
    setViewMode(mode);
    localStorage.setItem("admin-view-mode", mode);
  };

  return [viewMode, setMode] as const;
}
