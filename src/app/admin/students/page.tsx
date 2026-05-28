"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, Upload, Download, Pencil, Trash2, X, Loader2, FileSpreadsheet, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { useLookups } from "@/hooks/useLookups";
import { parseCsv } from "@/lib/csv-utils";
import { LookupSelect } from "@/components/admin/LookupSelect";
import api from "@/lib/api";
import { downloadCsv, getApiErrorMessage } from "@/lib/api-error";

interface Student {
  id: string;
  admission_no: string;
  student_name: string;
  class_level: string;
  section?: string;
  roll_no?: string;
  gender?: string;
  date_of_birth?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  status: string;
  academic_year?: string;
}

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const emptyForm = {
  admission_no: "",
  student_name: "",
  class_level: "",
  section: "",
  roll_no: "",
  gender: "",
  date_of_birth: "",
  parent_name: "",
  parent_phone: "",
  parent_email: "",
  address: "",
  status: "active",
  academic_year: "2026-27",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<{ total?: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;
  const { options: classOptions } = useLookups("admission_class", { all: true });

  const classSelectOptions = useMemo(
    () => (classOptions.length ? classOptions : [
      { label: "Class V", value: "Class V" },
      { label: "Class VI", value: "Class VI" },
    ]),
    [classOptions]
  );

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/students", { params: { page, limit: pageSize, search: search.trim() || undefined } }),
      api.get("/students/stats"),
    ])
      .then(([listRes, statsRes]) => {
        setStudents(listRes.data.data || []);
        const pagination = listRes.data.pagination;
        if (pagination) {
          setTotal(pagination.total);
          setTotalPages(pagination.totalPages);
        } else {
          setTotal((listRes.data.data || []).length);
          setTotalPages(1);
        }
        setStats(statsRes.data.data || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, pageSize]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      admission_no: student.admission_no || "",
      student_name: student.student_name || "",
      class_level: student.class_level || "",
      section: student.section || "",
      roll_no: student.roll_no || "",
      gender: student.gender || "",
      date_of_birth: student.date_of_birth ? String(student.date_of_birth).slice(0, 10) : "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      parent_email: student.parent_email || "",
      address: student.address || "",
      status: student.status || "active",
      academic_year: student.academic_year || "2026-27",
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/students/${editing.id}`, form);
      else await api.post("/students", form);
      setFormOpen(false);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (student: Student) => {
    if (!confirm(`Remove ${student.student_name}?`)) return;
    try {
      await api.delete(`/students/${student.id}`);
      load();
    } catch {
      alert("Delete failed");
    }
  };

  const handleBulkFile = async (file: File) => {
    setBulkResult(null);
    setSaving(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text).map((row) => ({
        admission_no: row.admission_no,
        student_name: row.student_name,
        class_level: row.class_level,
        section: row.section,
        roll_no: row.roll_no,
        gender: row.gender,
        date_of_birth: row.date_of_birth,
        parent_name: row.parent_name,
        parent_phone: row.parent_phone,
        parent_email: row.parent_email,
        address: row.address,
        status: row.status || "active",
        academic_year: row.academic_year || "2026-27",
        enrolled_at: row.enrolled_at,
      }));

      const res = await api.post("/students/bulk", { students: rows });
      const { inserted, failed, errors } = res.data.data || {};
      setBulkResult(`Imported ${inserted} students${failed ? `, ${failed} failed` : ""}.${errors?.length ? ` First error: ${errors[0].message}` : ""}`);
      load();
    } catch (err) {
      setBulkResult(getApiErrorMessage(err, "Bulk import failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">Add students individually or import in bulk via CSV</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button variant="outline" className="rounded-xl" onClick={() => downloadCsv("/students/template", "students-import-template.csv").catch(() => alert("Download failed"))}>
            <Download className="h-4 w-4" /> Template
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => downloadCsv("/students/export", "students-export.csv").catch(() => alert("Export failed"))}>
            <FileSpreadsheet className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => { setBulkOpen(true); setBulkResult(null); }}>
            <Upload className="h-4 w-4" /> Bulk Upload
          </Button>
          <Button className="rounded-xl" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <GlowCard className="p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total ?? total}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </GlowCard>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading students...
          </div>
        ) : (
          <>
            <AdminTableToolbar
              search={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              placeholder="Search students..."
            />
            {viewMode === "list" ? (
              <AdminListTable
                rows={students}
                rowKey={(s) => s.id}
                emptyMessage="No students yet. Add one or bulk upload a CSV file."
                columns={[
                  { key: "admission_no", label: "Admission No" },
                  { key: "student_name", label: "Name" },
                  { key: "class_level", label: "Class" },
                  { key: "section", label: "Section" },
                  { key: "parent_phone", label: "Parent Phone" },
                  { key: "status", label: "Status", render: (s) => <span className="capitalize">{s.status}</span> },
                ]}
                actions={(s) => (
                  <>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(s)}><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {students.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <GlowCard className="p-5">
                      <p className="font-semibold">{s.student_name}</p>
                      <p className="text-sm text-muted-foreground">{s.admission_no} • {s.class_level}{s.section ? `-${s.section}` : ""}</p>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(s)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </GlowCard>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setFormOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit Student" : "Add Student"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setFormOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
                <Input className="rounded-xl sm:col-span-2" placeholder="Admission No (auto if empty)" value={form.admission_no} onChange={(e) => setForm({ ...form, admission_no: e.target.value })} />
                <Input className="rounded-xl sm:col-span-2" placeholder="Student Name *" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} required />
                <select className="h-11 rounded-xl border border-border bg-background px-4 text-sm sm:col-span-2" value={form.class_level} onChange={(e) => setForm({ ...form, class_level: e.target.value })} required>
                  <option value="">Select Class *</option>
                  {classSelectOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <LookupSelect type="section" value={form.section} onChange={(section) => setForm({ ...form, section })} placeholder="Select Section" allowEmpty />
                <Input className="rounded-xl" placeholder="Roll No" value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} />
                <select className="h-11 rounded-xl border border-border bg-background px-4 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {form.gender && !GENDER_OPTIONS.some((o) => o.value === form.gender) && (
                    <option value={form.gender}>{form.gender}</option>
                  )}
                </select>
                <Input className="rounded-xl" type="date" placeholder="DOB" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                <Input className="rounded-xl sm:col-span-2" placeholder="Parent Name" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} />
                <Input className="rounded-xl" placeholder="Parent Phone" value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} />
                <Input className="rounded-xl" placeholder="Parent Email" value={form.parent_email} onChange={(e) => setForm({ ...form, parent_email: e.target.value })} />
                <Textarea className="rounded-xl sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <Input className="rounded-xl" placeholder="Academic Year" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} />
                <select className="h-11 rounded-xl border border-border bg-background px-4 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="alumni">Alumni</option>
                  <option value="transferred">Transferred</option>
                </select>
                <Button type="submit" disabled={saving} className="rounded-xl sm:col-span-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Student"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bulkOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setBulkOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg rounded-3xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Bulk Upload Students</h2>
                <Button variant="ghost" size="icon" onClick={() => setBulkOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file using the template format. Required columns: <strong>student_name</strong>, <strong>class_level</strong>.
                Leave admission_no blank to auto-generate.
              </p>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center transition hover:bg-primary/10">
                <Upload className="mb-2 h-8 w-8 text-primary" />
                <span className="text-sm font-medium">Choose CSV file</span>
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleBulkFile(e.target.files[0])} />
              </label>
              {bulkResult && <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm">{bulkResult}</p>}
              <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => downloadCsv("/students/template", "students-import-template.csv").catch(() => alert("Download failed"))}>
                <Download className="h-4 w-4" /> Download CSV Template
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
