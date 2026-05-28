"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";
import { PERMISSION_MODULES } from "@/lib/permissions";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

interface RoleRow {
  id: number;
  name: string;
  permissions: string[];
  user_count?: number;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [form, setForm] = useState({ name: "", permissions: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const table = useAdminTable(roles, ["name"]);

  const load = () => {
    setLoading(true);
    api
      .get("/roles")
      .then((res) => setRoles((res.data.data || []).map((r: RoleRow) => ({
        ...r,
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
      }))))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", permissions: ["dashboard"] });
    setOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setEditing(role);
    setForm({ name: role.name, permissions: role.permissions.includes("*") ? ["*"] : [...role.permissions] });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        permissions: form.permissions.includes("*") ? ["*"] : form.permissions,
      };
      if (editing) await api.put(`/roles/${editing.id}`, payload);
      else await api.post("/roles", payload);
      setOpen(false);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role: RoleRow) => {
    if (role.name === "super_admin") return;
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await api.delete(`/roles/${role.id}`);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  };

  const protectedRole = (name: string) => name === "super_admin";

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">Create roles and control admin panel access</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" /> Add Role
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : viewMode === "list" ? (
        <>
          <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={table.total} page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} placeholder="Search roles..." />
          <AdminListTable
            rows={table.paginated}
            rowKey={(row) => String(row.id)}
            emptyMessage="No roles found"
            columns={[
              { key: "name", label: "Role", render: (row) => String(row.name).replace(/_/g, " ") },
              { key: "permissions", label: "Permissions", render: (row) => {
                const perms = row.permissions as string[];
                if (perms.includes("*")) return "Full access";
                return `${perms.length} modules`;
              }},
              { key: "user_count", label: "Users", render: (row) => String(row.user_count ?? 0) },
            ]}
            actions={(row) => (
              <>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(row as RoleRow)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {!protectedRole(String(row.name)) && (
                  <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(row as RoleRow)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          />
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {table.paginated.map((row, i) => (
            <motion.div key={String(row.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlowCard>
                <div className="p-5">
                  <p className="font-semibold capitalize">{String(row.name).replace(/_/g, " ")}</p>
                  <p className="text-sm text-muted-foreground">{(row.permissions as string[]).includes("*") ? "Full access" : `${(row.permissions as string[]).length} modules`}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit Role" : "Create Role"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <form onSubmit={save} className="space-y-4">
                <Input
                  className="rounded-xl"
                  placeholder="Role name (e.g. content_manager)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={editing ? protectedRole(editing.name) : false}
                  required
                />

                <div>
                  <p className="mb-2 text-sm font-medium">Permissions</p>
                  <label className="mb-3 flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes("*")}
                      onChange={() => setForm({ ...form, permissions: form.permissions.includes("*") ? ["dashboard"] : ["*"] })}
                      disabled={editing ? protectedRole(editing.name) : false}
                    />
                    Full access (all modules)
                  </label>
                  <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-border/40 p-3 sm:grid-cols-3">
                    {PERMISSION_MODULES.map((module) => (
                      <label key={module.key} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(module.key) || form.permissions.includes("*")}
                          disabled={form.permissions.includes("*") || Boolean(editing && protectedRole(editing.name))}
                          onChange={() => togglePermission(module.key)}
                        />
                        {module.label}
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full rounded-xl">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Role"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
