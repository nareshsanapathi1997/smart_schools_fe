"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { ErpModal } from "@/components/admin/ErpAdminShell";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

interface AcademicYear {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

const emptyForm = { name: "", start_date: "", end_date: "", is_current: false };

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/erp/academic-years")
      .then((r) => setYears(r.data.data || []))
      .catch(() => setYears([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return alert("Name is required");
    setSaving(true);
    try {
      if (editingId) await api.put(`/erp/academic-years/${editingId}`, form);
      else await api.post("/erp/academic-years", form);
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (year: AcademicYear) => {
    setEditingId(year.id);
    setForm({
      name: year.name,
      start_date: year.start_date ? String(year.start_date).slice(0, 10) : "",
      end_date: year.end_date ? String(year.end_date).slice(0, 10) : "",
      is_current: !!year.is_current,
    });
    setOpen(true);
  };

  const remove = async (year: AcademicYear) => {
    if (!confirm(`Delete academic year "${year.name}"?`)) return;
    try {
      await api.delete(`/erp/academic-years/${year.id}`);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  };

  const setCurrent = async (year: AcademicYear) => {
    try {
      await api.patch(`/erp/academic-years/${year.id}/current`);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Update failed"));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Academic Years</h1>
            <p className="text-muted-foreground">Manage academic year periods and set the current year</p>
          </div>
        </div>
        <Button className="rounded-xl" onClick={() => { setEditingId(null); setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Academic Year
        </Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : (
          <AdminListTable
            rows={years}
            rowKey={(y) => y.id}
            emptyMessage="No academic years yet. Add one to organize student records and fees."
            columns={[
              { key: "name", label: "Year" },
              {
                key: "start_date",
                label: "Start",
                render: (y) => y.start_date ? new Date(String(y.start_date)).toLocaleDateString() : "—",
              },
              {
                key: "end_date",
                label: "End",
                render: (y) => y.end_date ? new Date(String(y.end_date)).toLocaleDateString() : "—",
              },
              {
                key: "is_current",
                label: "Current",
                render: (y) => y.is_current ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Current</span>
                ) : "—",
              },
            ]}
            actions={(y) => (
              <div className="flex flex-wrap gap-2">
                {!y.is_current && (
                  <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setCurrent(y)}>
                    <Star className="h-4 w-4" /> Set Current
                  </Button>
                )}
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(y)}><Pencil className="h-4 w-4" /></Button>
                {!y.is_current && (
                  <Button variant="outline" size="sm" className="rounded-xl text-destructive" onClick={() => remove(y)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            )}
          />
        )}
      </div>

      <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Academic Year" : "Add Academic Year"}>
        <div className="space-y-3">
          <Input className="rounded-xl" placeholder="Year Name (e.g. 2026-27)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input className="rounded-xl" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input className="rounded-xl" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
            Set as current academic year
          </label>
          <Button className="w-full rounded-xl" disabled={saving} onClick={save}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Save"}
          </Button>
        </div>
      </ErpModal>
    </div>
  );
}
