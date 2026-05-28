"use client";

import { useState } from "react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { LookupSelect } from "@/components/admin/LookupSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

const emptyForm = { title: "", description: "", class_level: "", section: "", subject: "", due_date: "", attachment_url: "" };

export default function AdminHomeworkPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      title: String(row.title || ""),
      description: String(row.description || ""),
      class_level: String(row.class_level || ""),
      section: String(row.section || ""),
      subject: String(row.subject || ""),
      due_date: row.due_date ? String(row.due_date).slice(0, 10) : "",
      attachment_url: Array.isArray(row.attachments) && (row.attachments as { url?: string }[])[0]?.url
        ? String((row.attachments as { url?: string }[])[0].url)
        : "",
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editingId) await api.put(`/erp/homework/${editingId}`, form);
      else await api.post("/erp/homework", form);
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
      <ErpAdminShell key={reload} title="Homework & Assignments" subtitle="Post homework visible in parent and student portals" endpoint="/erp/homework"
        actions={<ErpAddButton onClick={openCreate} label="Post Homework" />}
        columns={[
          { key: "title", label: "Title" },
          { key: "class_level", label: "Class" },
          { key: "subject", label: "Subject" },
          { key: "due_date", label: "Due", render: (r) => r.due_date ? new Date(String(r.due_date)).toLocaleDateString() : "—" },
          { key: "attachments", label: "Attachment", render: (r) => Array.isArray(r.attachments) && (r.attachments as { url?: string }[]).length ? "Yes" : "—" },
        ]}
        rowActions={(row) => (
          <ErpRowActions
            onEdit={() => openEdit(row)}
            onDelete={async () => { await api.delete(`/erp/homework/${row.id}`); setReload((n) => n + 1); }}
          />
        )}
      />
      <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Homework" : "Post Homework"}>
        <div className="space-y-3">
          <Input className="rounded-xl" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea className="rounded-xl" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <LookupSelect type="admission_class" value={form.class_level} onChange={(class_level) => setForm({ ...form, class_level })} placeholder="Select Class" />
          <LookupSelect type="section" value={form.section} onChange={(section) => setForm({ ...form, section })} placeholder="Select Section" allowEmpty />
          <LookupSelect type="subject" value={form.subject} onChange={(subject) => setForm({ ...form, subject })} placeholder="Select Subject" />
          <Input className="rounded-xl" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <Input className="rounded-xl" placeholder="Attachment URL (optional)" value={form.attachment_url} onChange={(e) => setForm({ ...form, attachment_url: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Publish"}</Button>
        </div>
      </ErpModal>
    </>
  );
}
