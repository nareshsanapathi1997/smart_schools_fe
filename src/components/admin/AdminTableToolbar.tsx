"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminTableToolbar({
  search,
  onSearchChange,
  placeholder = "Search...",
  total,
  page,
  totalPages,
  onPageChange,
}: AdminTableToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[220px] flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="rounded-xl pl-9"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{total} record{total !== 1 ? "s" : ""}</span>
        {totalPages > 1 && (
          <>
            <Button variant="outline" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Prev
            </Button>
            <span>{page} / {totalPages}</span>
            <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
