"use client";

import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SafeImage } from "@/components/shared/SafeImage";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";
import { PLACEHOLDER, resolveMediaUrl } from "@/lib/images";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "image" | "date" | "json";

export interface FieldConfig {
  key: string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface ResourceCrudProps {
  title: string;
  subtitle?: string;
  endpoint: string;
  deleteEndpoint?: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  imageKey?: string;
  imageFallback?: string;
  multipart?: boolean;
  fetchParams?: Record<string, string>;
  defaultValues?: Record<string, unknown>;
  transformSubmit?: (data: Record<string, unknown>) => Record<string, unknown>;
  transformEdit?: (row: Record<string, unknown>) => Record<string, unknown>;
}

const empty = (fields: FieldConfig[], defaults?: Record<string, unknown>) =>
  Object.fromEntries(
    fields.map((f) => [f.key, defaults?.[f.key] ?? (f.type === "checkbox" ? false : "")])
  );

export function ResourceCrud({
  title,
  subtitle,
  endpoint,
  deleteEndpoint,
  fields,
  columns,
  imageKey = "image_url",
  imageFallback = PLACEHOLDER.gallery,
  multipart = false,
  fetchParams = { all: "true" },
  defaultValues,
  transformSubmit,
  transformEdit,
}: ResourceCrudProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(empty(fields));
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const searchKeys = columns.map((c) => c.key) as (keyof Record<string, unknown>)[];
  const table = useAdminTable(rows, searchKeys.length ? searchKeys : ["id"]);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(endpoint, { params: fetchParams })
      .then((res) => setRows(res.data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [endpoint, fetchParams]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty(fields, defaultValues));
    setFile(null);
    setOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    setForm(transformEdit ? transformEdit(row) : { ...row });
    setFile(null);
    setOpen(true);
  };

  const setField = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = transformSubmit ? transformSubmit(form) : form;
      if (multipart) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "boolean") {
            fd.append(k, v ? "true" : "false");
            return;
          }
          if (v !== "") fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
        });
        if (file) fd.append("image", file);
        if (editing?.id) await api.put(`${endpoint}/${editing.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        else await api.post(endpoint, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        if (editing?.id) await api.put(`${endpoint}/${editing.id}`, payload);
        else await api.post(endpoint, payload);
      }
      setOpen(false);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed. Check fields and try again."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Record<string, unknown>) => {
    if (!confirm("Delete this item?")) return;
    const id = row.id as string;
    try {
      const base = deleteEndpoint || endpoint;
      await api.delete(`${base}/${id}`);
      load();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : viewMode === "list" ? (
        <>
          <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={table.total} page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} placeholder={`Search ${title.toLowerCase()}...`} />
          <AdminListTable
            rows={table.paginated}
            rowKey={(row) => String(row.id)}
            emptyMessage="No items yet. Click Add New to create one."
            columns={[
            ...(imageKey
              ? [{
                  key: "__image",
                  label: "Photo",
                  className: "w-20",
                  render: (row: Record<string, unknown>) => (
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg ring-2 ring-primary/10">
                      <SafeImage src={row[imageKey] as string} alt="" fallback={imageFallback} fill className="rounded-lg" />
                    </div>
                  ),
                }]
              : []),
            ...columns.map((col) => ({
              key: col.key,
              label: col.label,
              render: col.render,
            })),
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
        <div className="space-y-3">
          {table.paginated.map((row, i) => (
            <motion.div
              key={String(row.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlowCard className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {imageKey && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/10">
                        <SafeImage src={row[imageKey] as string} alt="" fallback={imageFallback} fill className="rounded-xl" />
                      </div>
                    )}
                    <div className="min-w-0 grid flex-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                      {columns.map((col) => (
                        <div key={col.key}>
                          <p className="text-xs text-muted-foreground">{col.label}</p>
                          <p className="truncate text-sm font-medium">
                            {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
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
          {!table.total && (
            <GlowCard className="py-16 text-center text-muted-foreground">
              No items yet. Click Add New to create one.
            </GlowCard>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/50 bg-card p-6 shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editing ? "Edit" : "Add"} {title}</h2>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={save} className="space-y-4">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-sm font-medium">{field.label}</label>
                    {field.type === "textarea" ? (
                      <Textarea rows={field.rows || 3} className="rounded-xl" value={String(form[field.key] ?? "")} onChange={(e) => setField(field.key, e.target.value)} required={field.required} />
                    ) : field.type === "checkbox" ? (
                      <input type="checkbox" checked={Boolean(form[field.key])} onChange={(e) => setField(field.key, e.target.checked)} className="h-4 w-4 rounded" />
                    ) : field.type === "select" ? (
                      <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={String(form[field.key] ?? "")} onChange={(e) => setField(field.key, e.target.value)}>
                        {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : field.type === "image" ? (
                      <div className="space-y-2">
                        <Input className="rounded-xl" value={String(form[field.key] ?? "")} onChange={(e) => setField(field.key, e.target.value)} placeholder="Image URL (https://...)" />
                        {multipart && (
                          <Input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveMediaUrl(String(form[field.key] || ""), imageFallback)} alt="Preview" className="h-32 w-full rounded-xl object-cover ring-2 ring-primary/10" />
                      </div>
                    ) : (
                      <Input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} className="rounded-xl" value={String(form[field.key] ?? "")} onChange={(e) => setField(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)} placeholder={field.placeholder} required={field.required} />
                    )}
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving} className="rounded-xl">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save"}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
