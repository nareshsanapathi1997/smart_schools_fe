"use client";

import { ReactNode } from "react";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { cn } from "@/lib/utils";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface AdminListTableProps<T> {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  actions?: (row: T) => ReactNode;
  rowClassName?: (row: T) => string | undefined;
}

export function AdminListTable<T extends object>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  actions,
  rowClassName,
}: AdminListTableProps<T>) {
  if (!rows.length) {
    return (
      <GlowCard className="py-16 text-center text-muted-foreground">
        {emptyMessage}
      </GlowCard>
    );
  }

  return (
    <GlowCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", col.className)}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn("border-b border-border/30 transition-colors hover:bg-muted/20", rowClassName?.(row))}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right align-middle">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlowCard>
  );
}
