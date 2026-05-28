"use client";

import { useState } from "react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

const emptyForm = { name: "", channel: "whatsapp", event_type: "custom", template_body: "", is_active: true };

export default function AdminAlertsPage() {
  const [tab, setTab] = useState<"templates" | "logs" | "send">("templates");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sendForm, setSendForm] = useState({ recipient: "", message: "", channel: "whatsapp" });
  const [reload, setReload] = useState(0);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      name: String(row.name || ""),
      channel: String(row.channel || "whatsapp"),
      event_type: String(row.event_type || "custom"),
      template_body: String(row.template_body || ""),
      is_active: row.is_active !== false,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editingId) await api.put(`/erp/alerts/templates/${editingId}`, form);
      else await api.post("/erp/alerts/templates", form);
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        {(["templates", "logs", "send"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} className="rounded-xl capitalize" onClick={() => setTab(t)}>{t === "send" ? "Send Alert" : t}</Button>
        ))}
      </div>
      {tab === "templates" && (
        <ErpAdminShell key={reload} title="SMS / WhatsApp Alerts" subtitle="Message templates and alert logs"
          endpoint="/erp/alerts/templates" actions={<ErpAddButton onClick={openCreate} label="Add Template" />}
          columns={[
            { key: "name", label: "Name" },
            { key: "channel", label: "Channel" },
            { key: "event_type", label: "Event" },
            { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
          ]}
          rowActions={(row) => (
            <ErpRowActions
              onEdit={() => openEdit(row)}
              onDelete={async () => { await api.delete(`/erp/alerts/templates/${row.id}`); setReload((n) => n + 1); }}
            />
          )}
        />
      )}
      {tab === "logs" && <ErpAdminShell title="Alert Logs" subtitle="Sent message history" endpoint="/erp/alerts/logs" columns={[
        { key: "recipient", label: "Recipient" },
        { key: "channel", label: "Channel" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Time", render: (r) => new Date(String(r.created_at)).toLocaleString() },
      ]} />}
      {tab === "send" && (
        <div className="max-w-lg space-y-3">
          <h2 className="text-xl font-bold">Send Manual Alert</h2>
          <Input className="rounded-xl" placeholder="Phone (with country code)" value={sendForm.recipient} onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })} />
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={sendForm.channel} onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
          <Textarea className="rounded-xl" placeholder="Message" value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} />
          <Button className="rounded-xl" onClick={async () => { await api.post("/erp/alerts/send", sendForm); alert("Alert sent"); setReload((n) => n + 1); }}>
            Send via {sendForm.channel === "sms" ? "SMS" : "WhatsApp"}
          </Button>
        </div>
      )}
      <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Alert Template" : "Add Alert Template"}>
        <div className="space-y-3">
          <Input className="rounded-xl" placeholder="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
          <Input className="rounded-xl" placeholder="Event Type" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} />
          <Textarea className="rounded-xl" placeholder="Template body — use {{student_name}}, {{amount}}, etc." value={form.template_body} onChange={(e) => setForm({ ...form, template_body: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <Button className="w-full rounded-xl" onClick={save}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </ErpModal>
    </>
  );
}
