"use client";

import { useEffect, useState } from "react";
import { Printer, FileText } from "lucide-react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { FacultySelect } from "@/components/admin/FacultySelect";
import { LookupSelect } from "@/components/admin/LookupSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { SCHOOL } from "@/lib/constants";

type Tab = "staff" | "runs" | "payslips";

const DESIGNATION_OPTIONS = ["Principal", "Vice Principal", "Head of Department", "Senior Teacher", "Teacher", "Accountant", "Admin Staff", "Librarian", "Lab Assistant", "Office Assistant"];
const emptyForm = { faculty_id: "", name: "", designation: "", department: "", bank_account: "", base_salary: "" };

function printPayslip(data: Record<string, unknown>) {
  const allowances = (data.allowances || {}) as Record<string, number>;
  const deductions = (data.deductions || {}) as Record<string, number>;
  const allowRows = Object.entries(allowances).map(([k, v]) => `<tr><td>${k.toUpperCase()}</td><td>₹${v}</td></tr>`).join("");
  const deductRows = Object.entries(deductions).map(([k, v]) => `<tr><td>${k.toUpperCase()}</td><td>₹${v}</td></tr>`).join("");
  const html = `<html><head><title>Payslip</title><style>
    body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}
    .header{text-align:center;border-bottom:2px solid #4f46e5;padding-bottom:16px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}
    .net{font-size:20px;font-weight:bold;color:#4f46e5;text-align:right;margin-top:16px}
  </style></head><body>
  <div class="header"><h1>${SCHOOL.name}</h1><p>Salary Payslip — ${data.month}/${data.year}</p></div>
  <p><strong>${data.staff_name}</strong> — ${data.designation || ""} (${data.department || ""})</p>
  <p>Bank A/C: ${data.bank_account || "—"} | Status: ${data.status}</p>
  <h3>Earnings</h3><table><tr><th>Component</th><th>Amount</th></tr>
  <tr><td>Base Salary</td><td>₹${data.base_salary}</td></tr>${allowRows}</table>
  <h3>Deductions</h3><table><tr><th>Component</th><th>Amount</th></tr>${deductRows || "<tr><td colspan=2>None</td></tr>"}</table>
  <p class="net">Net Salary: ₹${data.net_salary}</p>
  </body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.print();
}

export default function AdminPayrollPage() {
  const [tab, setTab] = useState<Tab>("staff");
  const [runs, setRuns] = useState<Record<string, unknown>[]>([]);
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [reload, setReload] = useState(0);

  const loadRuns = () => {
    api.get("/erp/payroll/runs").then((r) => {
      setRuns(r.data.data?.runs || []);
      setEntries(r.data.data?.entries || []);
    });
  };

  useEffect(() => { loadRuns(); }, [reload]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      faculty_id: String(row.faculty_id || ""),
      name: String(row.name || ""),
      designation: String(row.designation || ""),
      department: String(row.department || ""),
      bank_account: String(row.bank_account || ""),
      base_salary: String(row.base_salary ?? ""),
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = { ...form, base_salary: Number(form.base_salary) || 0, faculty_id: form.faculty_id || null };
      if (editingId) await api.put(`/erp/payroll/staff/${editingId}`, payload);
      else await api.post("/erp/payroll/staff", payload);
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) { alert(getApiErrorMessage(err, "Save failed")); }
  };

  const createRun = async () => {
    const now = new Date();
    try {
      await api.post("/erp/payroll/runs", { month: now.getMonth() + 1, year: now.getFullYear() });
      loadRuns();
      setTab("runs");
    } catch (err) { alert(getApiErrorMessage(err, "Could not create payroll run")); }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["staff", "runs", "payslips"] as Tab[]).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} className="rounded-xl capitalize" onClick={() => setTab(t)}>{t === "runs" ? "Salary Runs" : t}</Button>
        ))}
      </div>

      {tab === "staff" && (
        <ErpAdminShell key={reload} title="Payroll Staff" subtitle="Manage staff salary records linked to faculty"
          endpoint="/erp/payroll/staff"
          actions={<div className="flex gap-2"><ErpAddButton onClick={openCreate} label="Add Staff" /><Button variant="outline" className="rounded-xl" onClick={createRun}>Generate This Month</Button></div>}
          columns={[
            { key: "name", label: "Name" },
            { key: "designation", label: "Role" },
            { key: "department", label: "Department" },
            { key: "base_salary", label: "Base Salary", render: (r) => `₹${Number(r.base_salary).toLocaleString()}` },
          ]}
          rowActions={(row) => <ErpRowActions onEdit={() => openEdit(row)} onDelete={async () => { await api.delete(`/erp/payroll/staff/${row.id}`); setReload((n) => n + 1); }} deleteLabel={`Deactivate ${row.name}?`} />}
        />
      )}

      {tab === "runs" && (
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div><h1 className="text-3xl font-bold">Salary Processing</h1><p className="text-muted-foreground">Generate monthly run → review → process to mark as paid</p></div>
            <Button className="rounded-xl" onClick={createRun}>Generate This Month</Button>
          </div>
          <div className="space-y-3">
            {runs.map((r) => (
              <GlowCard key={String(r.id)} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">{String(r.month)}/{String(r.year)} Payroll</p>
                  <p className="text-sm capitalize text-muted-foreground">Status: {String(r.status)}</p>
                </div>
                {r.status === "draft" && (
                  <Button className="rounded-xl" onClick={() => api.post(`/erp/payroll/runs/${r.id}/process`).then(() => { loadRuns(); setTab("payslips"); })}>
                    Process & Generate Payslips
                  </Button>
                )}
              </GlowCard>
            ))}
            {!runs.length && <p className="text-muted-foreground">No payroll runs yet. Click Generate This Month to start.</p>}
          </div>
        </div>
      )}

      {tab === "payslips" && (
        <div>
          <div className="mb-8"><h1 className="text-3xl font-bold">Payslips</h1><p className="text-muted-foreground">View and print staff salary slips</p></div>
          <div className="space-y-2">
            {entries.map((e) => (
              <GlowCard key={String(e.id)} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{String(e.staff_name)}</p>
                    <p className="text-sm text-muted-foreground">{String(e.month)}/{String(e.year)} — Net ₹{Number(e.net_salary).toLocaleString()} ({String(e.status)})</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={async () => {
                  try {
                    const res = await api.get(`/erp/payroll/payslips/${e.id}`);
                    printPayslip(res.data.data || e);
                  } catch {
                    printPayslip(e);
                  }
                }}><Printer className="h-4 w-4" /> Print Payslip</Button>
              </GlowCard>
            ))}
            {!entries.length && <p className="text-muted-foreground">Process a payroll run to generate payslips.</p>}
          </div>
        </div>
      )}

      <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Staff" : "Add Payroll Staff"}>
        <div className="space-y-3">
          <FacultySelect value={form.faculty_id} onChange={(faculty_id, faculty) => setForm({ ...form, faculty_id, name: faculty?.name || form.name, designation: faculty?.designation || form.designation, department: faculty?.department || form.department })} />
          <Input className="rounded-xl" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
            <option value="">Select Role / Designation</option>
            {DESIGNATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <LookupSelect type="department" value={form.department} onChange={(department) => setForm({ ...form, department })} placeholder="Select Department" />
          <Input className="rounded-xl" placeholder="Bank Account" value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} />
          <Input className="rounded-xl" type="number" placeholder="Base Salary (₹)" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={save} disabled={!form.name}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </ErpModal>
    </>
  );
}
