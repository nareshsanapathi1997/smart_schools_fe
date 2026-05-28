"use client";

import { Plus, Loader2 } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";
import api from "@/lib/api";

interface Column {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
}

interface ErpAdminShellProps {
  title: string;
  subtitle: string;
  endpoint: string;
  columns: Column[];
  searchKeys?: string[];
  actions?: ReactNode;
  children?: ReactNode;
  onLoad?: (rows: Record<string, unknown>[]) => void;
  rowActions?: (row: Record<string, unknown>) => ReactNode;
  emptyMessage?: string;
  serverPagination?: boolean;
}

export function ErpAdminShell({
  title,
  subtitle,
  endpoint,
  columns,
  searchKeys,
  actions,
  children,
  onLoad,
  rowActions,
  emptyMessage = "No records yet.",
  serverPagination = false,
}: ErpAdminShellProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const keys = (searchKeys || columns.map((c) => c.key)) as (keyof Record<string, unknown>)[];
  const table = useAdminTable(serverPagination ? rows : rows, keys);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = serverPagination
      ? { page, limit: 25, ...(search ? { search } : {}) }
      : {};
    api.get(endpoint, { params }).then((res) => {
      const data = res.data.data;
      if (serverPagination && res.data.pagination) {
        setRows(Array.isArray(data) ? data : []);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotal(res.data.pagination.total || 0);
        onLoad?.(Array.isArray(data) ? data : []);
      } else {
        const list = Array.isArray(data) ? data : data?.routes || data?.books || data?.runs || [];
        setRows(list);
        onLoad?.(list);
      }
    }).catch(() => setRows([])).finally(() => setLoading(false));
  }, [endpoint, onLoad, serverPagination, page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
      ) : (
        <>
          <AdminTableToolbar
            search={serverPagination ? search : table.search}
            onSearchChange={serverPagination ? (v) => { setSearch(v); setPage(1); } : table.setSearch}
            total={serverPagination ? total : table.total}
            page={serverPagination ? page : table.page}
            totalPages={serverPagination ? totalPages : table.totalPages}
            onPageChange={serverPagination ? setPage : table.setPage}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
          <AdminListTable
            rows={serverPagination ? rows : table.paginated}
            rowKey={(row) => String(row.id)}
            emptyMessage={emptyMessage}
            columns={columns.map((c) => ({ key: c.key, label: c.label, render: c.render }))}
            actions={rowActions}
          />
        </>
      )}
    </div>
  );
}

export function ErpModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border/50 bg-card p-6 shadow-premium" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ErpAddButton({ onClick, label = "Add New" }: { onClick: () => void; label?: string }) {
  return <Button onClick={onClick} className="rounded-xl"><Plus className="h-4 w-4" /> {label}</Button>;
}
