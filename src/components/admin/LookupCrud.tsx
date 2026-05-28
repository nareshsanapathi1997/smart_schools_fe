"use client";

import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";
import { clearLookupCache } from "@/hooks/useLookups";
import { LOOKUP_TYPES, LookupType } from "@/lib/lookups";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

interface LookupCrudProps {
  type: LookupType;
  showCode?: boolean;
  showColor?: boolean;
  hideHeader?: boolean;
}

export function LookupCrud({ type, showCode = true, showColor = false, hideHeader = false }: LookupCrudProps) {
  const meta = LOOKUP_TYPES[type];
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ label: "", code: "", sort_order: "0", is_active: true, color: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const table = useAdminTable(rows, ["label", "code"]);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/lookups", { params: { type, all: "true" } })
      .then((res) => setRows(res.data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ label: "", code: "", sort_order: String(rows.length + 1), is_active: true, color: "" });
    setOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const metadata = (row.metadata || {}) as Record<string, unknown>;
    setEditing(row);
    setForm({
      label: String(row.label || ""),
      code: String(row.code || ""),
      sort_order: String(row.sort_order ?? 0),
      is_active: row.is_active !== false,
      color: String(metadata.color || ""),
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type,
        label: form.label.trim(),
        code: form.code.trim() || undefined,
        sort_order: parseInt(form.sort_order, 10) || 0,
        is_active: form.is_active,
        metadata: showColor && form.color ? { color: form.color } : {},
      };

      if (editing?.id) await api.put(`/lookups/${editing.id}`, payload);
      else await api.post("/lookups", payload);

      clearLookupCache(type);
      setOpen(false);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Record<string, unknown>) => {
    if (!confirm(`Delete "${row.label}"?`)) return;
    try {
      await api.delete(`/lookups/${row.id}`);
      clearLookupCache(type);
      load();
    } catch {
      alert("Delete failed. It may be in use.");
    }
  };

  return (
    <div>
      {!hideHeader && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{meta.title}</h1>
            <p className="mt-1 text-muted-foreground">{meta.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminViewToggle value={viewMode} onChange={setViewMode} />
            <Button onClick={openCreate} className="rounded-xl">
              <Plus className="h-4 w-4" /> Add New
            </Button>
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : viewMode === "list" ? (
        <>
          <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={table.total} page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} placeholder={`Search ${meta.title.toLowerCase()}...`} />
          <AdminListTable
            rows={table.paginated}
            rowKey={(row) => String(row.id)}
            emptyMessage="No items yet. Click Add New to create one."
            columns={[
              { key: "label", label: "Label" },
              ...(showCode ? [{ key: "code", label: "Code" }] : []),
              { key: "sort_order", label: "Order" },
              { key: "is_active", label: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
              ...(showColor ? [{
                key: "color",
                label: "Color",
                render: (row: Record<string, unknown>) => {
                  const metadata = (row.metadata || {}) as Record<string, unknown>;
                  return String(metadata.color || "—");
                },
              }] : []),
            ]}
            actions={(row) => (
              <>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(row)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          />
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {table.paginated.map((row, i) => (
            <motion.div key={String(row.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlowCard>
                <div className="p-5">
                  <p className="font-semibold">{String(row.label)}</p>
                  {showCode && <p className="text-xs text-muted-foreground">Code: {String(row.code)}</p>}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-md rounded-3xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Add"} {meta.title.slice(0, -1)}</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <form onSubmit={save} className="space-y-3">
                <Input className="rounded-xl" placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
                {showCode && (
                  <Input className="rounded-xl" placeholder="Code (optional — auto-generated from label)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                )}
                <Input className="rounded-xl" type="number" placeholder="Display order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                {showColor && (
                  <Input className="rounded-xl" placeholder="Badge color (blue, amber, emerald, red)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
                </label>
                <Button type="submit" disabled={saving} className="w-full rounded-xl">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
