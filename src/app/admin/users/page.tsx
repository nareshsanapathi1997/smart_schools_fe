"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Users, Shield, Pencil, Trash2, Key, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { useAdminTable } from "@/hooks/useAdminTable";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

const roleColors: Record<string, string> = {
  editor: "bg-blue-500/10 text-blue-600",
  admin: "bg-violet-500/10 text-violet-600",
  super_admin: "bg-amber-500/10 text-amber-600",
};

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Array<{ name: string }>>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "editor", is_active: true });
  const [newPassword, setNewPassword] = useState("");
  const table = useAdminTable(users, ["name", "email", "role"]);

  const load = () => api.get("/auth/users").then((r) => setUsers(r.data.data || [])).catch(() => {});
  useEffect(() => {
    load();
    api.get("/roles").then((r) => setRoles(r.data.data || [])).catch(() => {});
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/users", form);
      setForm({ name: "", email: "", password: "", role: "editor" });
      load();
    } catch {
      alert("Failed to create user");
    }
  };

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, is_active: u.is_active ?? true });
    setNewPassword("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    await api.put(`/auth/users/${editing.id}`, editForm);
    if (newPassword.length >= 8) {
      await api.post(`/auth/users/${editing.id}/reset-password`, { password: newPassword });
    }
    setEditing(null);
    load();
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      load();
    } catch {
      alert("Cannot deactivate this user");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage admin and editor accounts</p>
          </div>
        </div>
        <AdminViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {currentUser?.role === "super_admin" && (
        <GlowCard className="mt-8">
          <div className="flex items-center gap-2 border-b border-border/50 px-6 py-4">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="font-bold">Add Admin User</h2>
          </div>
          <form onSubmit={create} className="grid gap-3 p-6 sm:grid-cols-2">
            <Input className="rounded-xl" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="email" className="rounded-xl" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input type="password" className="rounded-xl" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="h-11 rounded-xl border border-border bg-background px-4 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {(roles.length ? roles : [{ name: "editor" }, { name: "admin" }, { name: "super_admin" }]).map((role) => (
                <option key={role.name} value={role.name}>{role.name.replace(/_/g, " ")}</option>
              ))}
            </select>
            <Button type="submit" className="rounded-xl sm:col-span-2 sm:w-fit"><UserPlus className="h-4 w-4" /> Create User</Button>
          </form>
        </GlowCard>
      )}

      <div className="mt-8">
        <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={table.total} page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} placeholder="Search users..." />
        {viewMode === "list" ? (
          <AdminListTable
            rows={table.paginated}
            rowKey={(u) => u.id}
            emptyMessage="No users found"
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role", render: (u) => <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${roleColors[u.role] || ""}`}>{u.role.replace("_", " ")}</span> },
              { key: "is_active", label: "Active", render: (u) => (u.is_active === false ? "No" : "Yes") },
            ]}
            actions={(u) => currentUser?.role === "super_admin" ? (
              <>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                {u.id !== currentUser?.id && (
                  <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => deactivate(u.id)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </>
            ) : null}
          />
        ) : (
          <div className="space-y-3">
            {table.paginated.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlowCard>
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${roleColors[u.role] || ""}`}>{u.role.replace("_", " ")}</span>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg rounded-3xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Edit User</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-3">
                <Input className="rounded-xl" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <Input type="email" className="rounded-xl" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  {(roles.length ? roles : [{ name: "editor" }, { name: "admin" }, { name: "super_admin" }]).map((role) => (
                    <option key={role.name} value={role.name}>{role.name.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} /> Active</label>
                <Input type="password" className="rounded-xl" placeholder="New password (optional, min 8 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Button className="rounded-xl" onClick={saveEdit}><Key className="h-4 w-4" /> Save Changes</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
