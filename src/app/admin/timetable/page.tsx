"use client";

import { useState } from "react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { LookupSelect } from "@/components/admin/LookupSelect";
import { TeacherSelect } from "@/components/admin/TeacherSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptyForm = { class_level: "", section: "A", day_of_week: 1, period_number: 1, subject: "", teacher_name: "", start_time: "", end_time: "", room: "" };

export default function AdminTimetablePage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      class_level: String(row.class_level || ""),
      section: String(row.section || "A"),
      day_of_week: Number(row.day_of_week ?? 1),
      period_number: Number(row.period_number ?? 1),
      subject: String(row.subject || ""),
      teacher_name: String(row.teacher_name || ""),
      start_time: String(row.start_time || "").slice(0, 5),
      end_time: String(row.end_time || "").slice(0, 5),
      room: String(row.room || ""),
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editingId) await api.put(`/erp/timetable/${editingId}`, form);
      else await api.post("/erp/timetable", form);
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ErpAdminShell
        key={reload}
        title="Class Timetable"
        subtitle="Period-wise schedules per class and section"
        endpoint="/erp/timetable"
        actions={<ErpAddButton onClick={openCreate} />}
        columns={[
          { key: "class_level", label: "Class" },
          { key: "section", label: "Section" },
          { key: "day_of_week", label: "Day", render: (r) => days[Number(r.day_of_week)] || String(r.day_of_week) },
          { key: "period_number", label: "Period" },
          { key: "subject", label: "Subject" },
          { key: "teacher_name", label: "Teacher" },
        ]}
        rowActions={(row) => (
          <ErpRowActions
            onEdit={() => openEdit(row)}
            onDelete={async () => { await api.delete(`/erp/timetable/${row.id}`); setReload((n) => n + 1); }}
          />
        )}
      />
      <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Timetable Slot" : "Add Timetable Slot"}>
        <div className="space-y-3">
          <LookupSelect type="admission_class" value={form.class_level} onChange={(class_level) => setForm({ ...form, class_level })} placeholder="Select Class" required />
          <LookupSelect type="section" value={form.section} onChange={(section) => setForm({ ...form, section })} placeholder="Select Section" />
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}>
            {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <Input className="rounded-xl" type="number" placeholder="Period" value={form.period_number} onChange={(e) => setForm({ ...form, period_number: Number(e.target.value) })} />
          <LookupSelect type="subject" value={form.subject} onChange={(subject) => setForm({ ...form, subject })} placeholder="Select Subject" required />
          <TeacherSelect value={form.teacher_name} onChange={(teacher_name) => setForm({ ...form, teacher_name })} placeholder="Select Teacher" />
          <Input className="rounded-xl" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <Input className="rounded-xl" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <Input className="rounded-xl" placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
        </div>
      </ErpModal>
    </>
  );
}
