"use client";

import { useEffect, useState } from "react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { LookupSelect } from "@/components/admin/LookupSelect";
import { StudentSelect } from "@/components/admin/StudentSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { printReportCard } from "@/lib/report-card-render";

const emptyForm = { name: "", class_level: "", subject: "", exam_date: "", max_marks: 100, term_id: "" };
const emptyTermForm = { name: "", academic_year: "2026-27", start_date: "", end_date: "" };

export default function AdminExamsPage() {
  const [mainTab, setMainTab] = useState<"exams" | "report-cards">("exams");
  const [exams, setExams] = useState<Record<string, unknown>[]>([]);
  const [terms, setTerms] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [termForm, setTermForm] = useState(emptyTermForm);
  const [reload, setReload] = useState(0);

  const [rcTermId, setRcTermId] = useState("");
  const [rcStudentId, setRcStudentId] = useState("");
  const [publishExamId, setPublishExamId] = useState("");

  useEffect(() => {
    api.get("/erp/exams").then((r) => setExams(r.data.data || [])).catch(() => {});
    api.get("/erp/exam-terms").then((r) => setTerms(r.data.data || [])).catch(() => {});
  }, [reload]);

  useEffect(() => {
    if (!selected) return;
    const exam = exams.find((e) => e.id === selected);
    if (!exam) return;
    api.get("/students", { params: { class: exam.class_level, all: "true" } }).then((r) => setStudents(r.data.data || []));
    api.get(`/erp/exams/${selected}/marks`).then((r) => {
      const map: Record<string, string> = {};
      (r.data.data || []).forEach((m: Record<string, unknown>) => { map[String(m.student_id)] = String(m.marks_obtained ?? ""); });
      setMarks(map);
    });
  }, [selected, exams]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      name: String(row.name || ""),
      class_level: String(row.class_level || ""),
      subject: String(row.subject || ""),
      exam_date: row.exam_date ? String(row.exam_date).slice(0, 10) : "",
      max_marks: Number(row.max_marks ?? 100),
      term_id: String(row.term_id || ""),
    });
    setOpen(true);
  };

  const saveExam = async () => {
    try {
      const payload = { ...form, term_id: form.term_id || null };
      if (editingId) await api.put(`/erp/exams/${editingId}`, payload);
      else await api.post("/erp/exams", payload);
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  const saveTerm = async () => {
    try {
      if (editingTermId) await api.put(`/erp/exam-terms/${editingTermId}`, termForm);
      else await api.post("/erp/exam-terms", termForm);
      setTermOpen(false);
      setEditingTermId(null);
      setTermForm(emptyTermForm);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  const openEditTerm = (t: Record<string, unknown>) => {
    setEditingTermId(String(t.id));
    setTermForm({
      name: String(t.name || ""),
      academic_year: String(t.academic_year || "2026-27"),
      start_date: t.start_date ? String(t.start_date).slice(0, 10) : "",
      end_date: t.end_date ? String(t.end_date).slice(0, 10) : "",
    });
    setTermOpen(true);
  };

  const deleteTerm = async (t: Record<string, unknown>) => {
    if (!confirm(`Delete term "${t.name}"?`)) return;
    try {
      await api.delete(`/erp/exam-terms/${t.id}`);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Delete failed"));
    }
  };

  const saveMarks = async () => {
    await api.post(`/erp/exams/${selected}/marks`, { marks: students.map((s) => ({ student_id: s.id, marks_obtained: Number(marks[String(s.id)] || 0) })) });
    alert("Marks saved");
  };

  const publishResults = async () => {
    if (!publishExamId) return alert("Select an exam to publish");
    if (!confirm("Publish results and notify parents?")) return;
    try {
      const res = await api.post(`/erp/exams/${publishExamId}/publish`);
      alert(res.data.message || "Results published");
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Publish failed"));
    }
  };

  const printStudentReportCard = async () => {
    if (!rcStudentId) return alert("Select a student");
    try {
      const url = rcTermId
        ? `/erp/report-cards/${rcStudentId}/${rcTermId}`
        : `/erp/report-cards/${rcStudentId}`;
      const res = await api.get(url);
      const { student, marks: markRows } = res.data.data || {};
      const term = terms.find((t) => t.id === rcTermId);
      printReportCard({
        student,
        marks: markRows,
        term_name: term ? String(term.name) : undefined,
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "Could not load report card"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant={mainTab === "exams" ? "default" : "outline"} className="rounded-xl" onClick={() => setMainTab("exams")}>Exams & Marks</Button>
        <Button variant={mainTab === "report-cards" ? "default" : "outline"} className="rounded-xl" onClick={() => setMainTab("report-cards")}>Report Cards</Button>
      </div>

      {mainTab === "exams" ? (
        <>
          <ErpAdminShell
            key={reload}
            title="Exams & Report Cards"
            subtitle="Create exams, enter marks, generate report cards"
            endpoint="/erp/exams"
            actions={<ErpAddButton onClick={openCreate} label="Create Exam" />}
            columns={[
              { key: "name", label: "Exam" },
              { key: "term_name", label: "Term" },
              { key: "class_level", label: "Class" },
              { key: "subject", label: "Subject" },
              { key: "exam_date", label: "Date", render: (r) => r.exam_date ? new Date(String(r.exam_date)).toLocaleDateString() : "—" },
              { key: "max_marks", label: "Max Marks" },
              {
                key: "results_published",
                label: "Published",
                render: (r) => r.results_published ? "Yes" : "No",
              },
            ]}
            rowActions={(row) => (
              <ErpRowActions
                onEdit={() => openEdit(row)}
                onDelete={async () => {
                  await api.delete(`/erp/exams/${row.id}`);
                  if (selected === row.id) setSelected("");
                  setReload((n) => n + 1);
                }}
                deleteLabel={`Delete exam "${row.name}" and all marks?`}
              />
            )}
          />

          <GlowCard className="my-6 p-5">
            <h3 className="mb-3 font-bold">Marks Entry</h3>
            <select className="h-11 w-full max-w-md rounded-xl border border-border bg-background px-4 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Select exam for marks entry</option>
              {exams.map((e) => <option key={String(e.id)} value={String(e.id)}>{String(e.name)} — {String(e.class_level)} ({String(e.subject)})</option>)}
            </select>
          </GlowCard>

          {selected && (
            <div className="space-y-2">
              {students.map((s) => (
                <GlowCard key={String(s.id)} className="flex items-center justify-between p-4">
                  <span>{String(s.student_name)}</span>
                  <Input className="max-w-[100px] rounded-xl" type="number" placeholder="Marks" value={marks[String(s.id)] || ""} onChange={(e) => setMarks({ ...marks, [String(s.id)]: e.target.value })} />
                </GlowCard>
              ))}
              <Button className="mt-4 rounded-xl" onClick={saveMarks}>Save Marks</Button>
            </div>
          )}

          <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Exam" : "Create Exam"}>
            <div className="space-y-3">
              <Input className="rounded-xl" placeholder="Exam Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={form.term_id} onChange={(e) => setForm({ ...form, term_id: e.target.value })}>
                <option value="">Exam Term (optional)</option>
                {terms.map((t) => <option key={String(t.id)} value={String(t.id)}>{String(t.name)}</option>)}
              </select>
              <LookupSelect type="admission_class" value={form.class_level} onChange={(class_level) => setForm({ ...form, class_level })} placeholder="Select Class" required />
              <LookupSelect type="subject" value={form.subject} onChange={(subject) => setForm({ ...form, subject })} placeholder="Select Subject" required />
              <Input className="rounded-xl" type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
              <Input className="rounded-xl" type="number" placeholder="Max Marks" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: Number(e.target.value) })} />
              <Button className="w-full rounded-xl" onClick={saveExam}>{editingId ? "Update" : "Create"}</Button>
            </div>
          </ErpModal>
        </>
      ) : (
        <div className="space-y-6">
          <GlowCard className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold">Exam Terms</h3>
              <Button variant="outline" className="rounded-xl" onClick={() => { setEditingTermId(null); setTermForm(emptyTermForm); setTermOpen(true); }}>Add Term</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {terms.map((t) => (
                <div key={String(t.id)} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRcTermId(String(t.id))}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${rcTermId === t.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
                  >
                    {String(t.name)}{t.academic_year ? ` (${String(t.academic_year)})` : ""}
                  </button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => openEditTerm(t)}>✎</Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-destructive" onClick={() => deleteTerm(t)}>×</Button>
                </div>
              ))}
              {!terms.length && <p className="text-sm text-muted-foreground">No exam terms yet. Add a term to group exams for report cards.</p>}
            </div>
          </GlowCard>

          <GlowCard className="p-5">
            <h3 className="mb-4 font-bold">Publish Results</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1">
                <label className="mb-1 block text-sm text-muted-foreground">Select Exam</label>
                <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={publishExamId} onChange={(e) => setPublishExamId(e.target.value)}>
                  <option value="">Choose exam...</option>
                  {exams.map((e) => (
                    <option key={String(e.id)} value={String(e.id)}>
                      {String(e.name)} — {String(e.class_level)} {e.results_published ? "(published)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Button className="rounded-xl" onClick={publishResults}>Publish Results</Button>
            </div>
          </GlowCard>

          <GlowCard className="p-5">
            <h3 className="mb-4 font-bold">Print Student Report Card</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Student</label>
                <StudentSelect value={rcStudentId} onChange={setRcStudentId} placeholder="Select student *" required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Term (optional)</label>
                <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={rcTermId} onChange={(e) => setRcTermId(e.target.value)}>
                  <option value="">All terms</option>
                  {terms.map((t) => <option key={String(t.id)} value={String(t.id)}>{String(t.name)}</option>)}
                </select>
              </div>
            </div>
            <Button className="mt-4 rounded-xl" onClick={printStudentReportCard}>Print Report Card</Button>
          </GlowCard>

          <ErpModal open={termOpen} onClose={() => setTermOpen(false)} title={editingTermId ? "Edit Exam Term" : "Add Exam Term"}>
            <div className="space-y-3">
              <Input className="rounded-xl" placeholder="Term Name (e.g. Term 1)" value={termForm.name} onChange={(e) => setTermForm({ ...termForm, name: e.target.value })} />
              <Input className="rounded-xl" placeholder="Academic Year" value={termForm.academic_year} onChange={(e) => setTermForm({ ...termForm, academic_year: e.target.value })} />
              <Input className="rounded-xl" type="date" placeholder="Start Date" value={termForm.start_date} onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })} />
              <Input className="rounded-xl" type="date" placeholder="End Date" value={termForm.end_date} onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })} />
              <Button className="w-full rounded-xl" onClick={saveTerm}>{editingTermId ? "Update Term" : "Save Term"}</Button>
            </div>
          </ErpModal>
        </div>
      )}
    </div>
  );
}
