"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, MessageSquare, Pencil, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { useAdminTable } from "@/hooks/useAdminTable";
import api from "@/lib/api";
import { downloadCsv } from "@/lib/api-error";
import { useLookups } from "@/hooks/useLookups";

interface Enquiry {
  id: string;
  student_name: string;
  parent_name: string;
  mobile: string;
  email: string;
  class_interested: string;
  status: string;
  admin_notes?: string;
  is_spam?: boolean;
  created_at: string;
}

const defaultStatusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600",
  contacted: "bg-amber-500/10 text-amber-600",
  enrolled: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  amber: "bg-amber-500/10 text-amber-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  red: "bg-red-500/10 text-red-600",
  violet: "bg-violet-500/10 text-violet-600",
  slate: "bg-slate-500/10 text-slate-600",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const { options: statusOptions, items: statusItems } = useLookups("enquiry_status", { all: true });
  const statusColors = statusItems.reduce<Record<string, string>>((acc, item) => {
    const color = String((item.metadata as { color?: string })?.color || "");
    acc[item.code] = colorMap[color] || defaultStatusColors[item.code] || "bg-muted text-muted-foreground";
    return acc;
  }, { ...defaultStatusColors });
  const statuses = statusOptions.length
    ? statusOptions
    : [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Enrolled", value: "enrolled" },
        { label: "Rejected", value: "rejected" },
      ];
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [isSpam, setIsSpam] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const table = useAdminTable(enquiries, ["student_name", "parent_name", "email", "mobile", "class_interested"]);

  const load = () => api.get("/enquiries", { params: { page, limit: 25 } }).then((res) => {
    setEnquiries(res.data.data || []);
    if (res.data.pagination) {
      setTotalPages(res.data.pagination.totalPages || 1);
      setTotal(res.data.pagination.total || 0);
    }
  }).catch(() => {});
  useEffect(() => { load(); }, [page]);

  const enroll = async (id: string) => {
    if (!confirm("Create student record from this enquiry and provision portal accounts?")) return;
    try {
      const res = await api.post(`/enquiries/${id}/enroll`);
      alert(res.data.message || "Enrolled");
      load();
    } catch {
      alert("Enroll failed");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/enquiries/${id}`, { status });
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const openEdit = (e: Enquiry) => {
    setEditing(e);
    setNotes(e.admin_notes || "");
    setIsSpam(Boolean(e.is_spam));
  };

  const saveDetails = async () => {
    if (!editing) return;
    await api.patch(`/enquiries/${editing.id}`, { admin_notes: notes, is_spam: isSpam });
    setEnquiries((prev) => prev.map((e) => (e.id === editing.id ? { ...e, admin_notes: notes, is_spam: isSpam } : e)));
    setEditing(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admission Enquiries</h1>
          <p className="mt-1 text-muted-foreground">Manage and track admission requests</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button variant="outline" className="rounded-xl" onClick={() => downloadCsv("/enquiries/export", "admission-enquiries.csv").catch(() => alert("Export failed"))}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={total || table.total} page={page} totalPages={totalPages || table.totalPages} onPageChange={setPage} placeholder="Search enquiries..." />
        {viewMode === "list" ? (
          <AdminListTable
            rows={table.search ? table.paginated : enquiries}
            rowKey={(e) => e.id}
            emptyMessage="No enquiries yet"
            rowClassName={(e) => (e.is_spam ? "opacity-60" : e.status === "new" ? "bg-primary/5" : undefined)}
            columns={[
              { key: "student_name", label: "Student" },
              { key: "parent_name", label: "Parent" },
              { key: "mobile", label: "Mobile" },
              { key: "class_interested", label: "Class" },
              { key: "status", label: "Status", render: (e) => <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[e.status] || ""}`}>{e.status}</span> },
              { key: "is_spam", label: "Spam", render: (e) => (e.is_spam ? "Yes" : "No") },
              { key: "created_at", label: "Date", render: (e) => new Date(e.created_at).toLocaleDateString() },
            ]}
            actions={(e) => (
              <>
                <select value={e.status} onChange={(ev) => updateStatus(e.id, ev.target.value)} className="rounded-xl border border-border bg-background px-2 py-1.5 text-sm">
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {e.status !== "enrolled" && (
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => enroll(e.id)} title="Enroll as student">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
              </>
            )}
          />
        ) : (
          <div className="space-y-3">
            {table.paginated.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlowCard className={e.status === "new" ? "ring-2 ring-primary/20" : ""}>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{e.student_name} {e.is_spam && <span className="text-xs text-red-500">(spam)</span>}</p>
                        <p className="text-sm text-muted-foreground">Parent: {e.parent_name} • Class: {e.class_interested}</p>
                        {e.admin_notes && <p className="mt-1 text-xs text-muted-foreground">Note: {e.admin_notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    </div>
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
                <h2 className="text-lg font-bold">Enquiry Details — {editing.student_name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
              </div>
              <Textarea className="rounded-xl" rows={4} placeholder="Admin notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isSpam} onChange={(e) => setIsSpam(e.target.checked)} /> Mark as spam
              </label>
              <Button className="mt-4 rounded-xl" onClick={saveDetails}>Save Notes</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
