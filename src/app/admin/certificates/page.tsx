"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Printer } from "lucide-react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { CertificatePreview } from "@/components/admin/CertificatePreview";
import { StudentSelect } from "@/components/admin/StudentSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { openCertificatePreview, type CertificateRenderData } from "@/lib/certificate-render";

type Tab = "issued" | "templates";

const emptyCertForm = { student_id: "", certificate_type: "bonafide", template_id: "", reason: "", issued_date: new Date().toISOString().slice(0, 10) };
const emptyTplForm = {
  name: "",
  certificate_type: "bonafide",
  title_text: "",
  body_template: "This is to certify that {{student_name}} (Admission No: {{admission_no}}, Class: {{class_level}}-{{section}}) is a bonafide student of {{school_name}}.",
  footer_text: "Principal",
  is_active: true,
};

export default function AdminCertificatesPage() {
  const [tab, setTab] = useState<Tab>("issued");
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCertForm);
  const [tplForm, setTplForm] = useState(emptyTplForm);
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([]);
  const [previewData, setPreviewData] = useState<CertificateRenderData>({});
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.get("/erp/certificates/templates").then((r) => setTemplates(r.data.data || []));
  }, [reload]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => String(t.id) === form.template_id || String(t.certificate_type) === form.certificate_type),
    [templates, form.template_id, form.certificate_type]
  );

  const buildPreview = (studentId?: string, cert?: Record<string, unknown>) => {
    const tpl = cert
      ? templates.find((t) => String(t.id) === String(cert.template_id)) || templates.find((t) => t.certificate_type === cert.certificate_type)
      : selectedTemplate;
    const data = cert?.data as { student?: Record<string, unknown> } | undefined;
    return {
      student_name: String(data?.student?.student_name || "Sample Student"),
      admission_no: String(data?.student?.admission_no || "STS-2026-0001"),
      class_level: String(data?.student?.class_level || "Class V"),
      section: String(data?.student?.section || "A"),
      reason: String(cert?.reason || form.reason),
      certificate_no: String(cert?.certificate_no || "CERT-PREVIEW"),
      issued_date: String(cert?.issued_date || form.issued_date),
      certificate_type: String(cert?.certificate_type || form.certificate_type),
      title_text: String(tpl?.title_text || ""),
      body_template: String(tpl?.body_template || ""),
      footer_text: String(tpl?.footer_text || ""),
    } satisfies CertificateRenderData;
  };

  const openCreateCert = () => { setEditingId(null); setForm(emptyCertForm); setOpen(true); };
  const openEditCert = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      student_id: String(row.student_id || ""),
      certificate_type: String(row.certificate_type || "bonafide"),
      template_id: String(row.template_id || ""),
      reason: String(row.reason || ""),
      issued_date: row.issued_date ? String(row.issued_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openCreateTpl = () => { setEditingId(null); setTplForm(emptyTplForm); setOpen(true); };
  const openEditTpl = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setTplForm({
      name: String(row.name || ""),
      certificate_type: String(row.certificate_type || "bonafide"),
      title_text: String(row.title_text || ""),
      body_template: String(row.body_template || ""),
      footer_text: String(row.footer_text || "Principal"),
      is_active: row.is_active !== false,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (tab === "issued") {
        if (editingId) await api.put(`/erp/certificates/${editingId}`, form);
        else await api.post("/erp/certificates", form);
      } else if (editingId) await api.put(`/erp/certificates/templates/${editingId}`, tplForm);
      else await api.post("/erp/certificates/templates", tplForm);
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button variant={tab === "issued" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("issued")}>Issued Certificates</Button>
        <Button variant={tab === "templates" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("templates")}>Templates</Button>
      </div>

      {tab === "issued" ? (
        <ErpAdminShell key={reload} title="Certificate Generator" subtitle="Generate, preview, edit and print student certificates"
          endpoint="/erp/certificates"
          actions={<ErpAddButton onClick={openCreateCert} label="Generate Certificate" />}
          columns={[
            { key: "certificate_no", label: "Cert No" },
            { key: "student_name", label: "Student" },
            { key: "certificate_type", label: "Type", render: (r) => String(r.certificate_type).toUpperCase() },
            { key: "issued_date", label: "Issued", render: (r) => new Date(String(r.issued_date)).toLocaleDateString() },
          ]}
          rowActions={(row) => (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setPreviewData(buildPreview(undefined, row)); setPreviewOpen(true); }}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openCertificatePreview(buildPreview(undefined, row))}>
                <Printer className="h-4 w-4" />
              </Button>
              <ErpRowActions
                onEdit={() => openEditCert(row)}
                onDelete={async () => { await api.delete(`/erp/certificates/${row.id}`); setReload((n) => n + 1); }}
              />
            </div>
          )}
        />
      ) : (
        <ErpAdminShell key={`tpl-${reload}`} title="Certificate Templates" subtitle="Design certificate layouts with placeholders: {{student_name}}, {{admission_no}}, {{class_level}}, {{section}}, {{school_name}}, {{date}}"
          endpoint="/erp/certificates/templates"
          actions={<ErpAddButton onClick={openCreateTpl} label="Add Template" />}
          columns={[
            { key: "name", label: "Name" },
            { key: "certificate_type", label: "Type", render: (r) => String(r.certificate_type).toUpperCase() },
            { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
          ]}
          rowActions={(row) => (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                setPreviewData({
                  certificate_type: String(row.certificate_type),
                  title_text: String(row.title_text),
                  body_template: String(row.body_template),
                  footer_text: String(row.footer_text),
                  reason: "Sample purpose",
                });
                setPreviewOpen(true);
              }}><Eye className="h-4 w-4" /></Button>
              <ErpRowActions onEdit={() => openEditTpl(row)} onDelete={async () => { await api.delete(`/erp/certificates/templates/${row.id}`); setReload((n) => n + 1); }} />
            </div>
          )}
        />
      )}

      <ErpModal open={open} onClose={() => setOpen(false)} title={
        tab === "issued" ? (editingId ? "Edit Certificate" : "Generate Certificate")
          : (editingId ? "Edit Template" : "Add Template")
      }>
        <div className="space-y-3">
          {tab === "issued" ? (
            <>
              <StudentSelect value={form.student_id} onChange={(student_id) => setForm({ ...form, student_id })} required />
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={form.certificate_type} onChange={(e) => setForm({ ...form, certificate_type: e.target.value, template_id: "" })}>
                <option value="bonafide">Bonafide</option>
                <option value="tc">Transfer Certificate (TC)</option>
                <option value="character">Character Certificate</option>
              </select>
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={form.template_id} onChange={(e) => setForm({ ...form, template_id: e.target.value })}>
                <option value="">Auto-select template by type</option>
                {templates.filter((t) => t.certificate_type === form.certificate_type).map((t) => (
                  <option key={String(t.id)} value={String(t.id)}>{String(t.name)}</option>
                ))}
              </select>
              <Input className="rounded-xl" type="date" value={form.issued_date} onChange={(e) => setForm({ ...form, issued_date: e.target.value })} />
              <Textarea className="rounded-xl" placeholder="Reason / Purpose" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <CertificatePreview data={buildPreview(form.student_id)} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => { setPreviewData(buildPreview(form.student_id)); setPreviewOpen(true); }}>Full Preview</Button>
                <Button className="flex-1 rounded-xl" onClick={save}>{editingId ? "Update" : "Generate"}</Button>
              </div>
            </>
          ) : (
            <>
              <Input className="rounded-xl" placeholder="Template Name" value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} />
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={tplForm.certificate_type} onChange={(e) => setTplForm({ ...tplForm, certificate_type: e.target.value })}>
                <option value="bonafide">Bonafide</option>
                <option value="tc">TC</option>
                <option value="character">Character</option>
              </select>
              <Input className="rounded-xl" placeholder="Certificate Title" value={tplForm.title_text} onChange={(e) => setTplForm({ ...tplForm, title_text: e.target.value })} />
              <Textarea className="rounded-xl min-h-[120px]" placeholder="Body template with {{placeholders}}" value={tplForm.body_template} onChange={(e) => setTplForm({ ...tplForm, body_template: e.target.value })} />
              <Input className="rounded-xl" placeholder="Footer / Signatory" value={tplForm.footer_text} onChange={(e) => setTplForm({ ...tplForm, footer_text: e.target.value })} />
              <CertificatePreview data={{ certificate_type: tplForm.certificate_type, title_text: tplForm.title_text, body_template: tplForm.body_template, footer_text: tplForm.footer_text, reason: "Sample" }} />
              <Button className="w-full rounded-xl" onClick={save}>{editingId ? "Update Template" : "Save Template"}</Button>
            </>
          )}
        </div>
      </ErpModal>

      <ErpModal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Certificate Preview">
        <CertificatePreview data={previewData} className="mb-4" />
        <Button className="w-full rounded-xl" onClick={() => openCertificatePreview(previewData)}><Printer className="h-4 w-4" /> Print</Button>
      </ErpModal>
    </>
  );
}
