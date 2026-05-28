"use client";

import { useEffect, useState } from "react";
import { CreditCard, IndianRupee, Receipt, TrendingUp, Printer } from "lucide-react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { LookupSelect } from "@/components/admin/LookupSelect";
import { StudentSelect } from "@/components/admin/StudentSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { printFeeReceipt } from "@/lib/fee-receipt-render";

type Tab = "overview" | "heads" | "invoices";

const emptyHeadForm = { name: "", amount: "", class_level: "", frequency: "annual" };
const emptyInvForm = { student_id: "", fee_head_id: "", title: "", amount: "", due_date: "", status: "pending" };
const emptyBulkForm = { fee_head_id: "", class_level: "", section: "", due_date: "" };
const emptyPayForm = { paid_amount: "", payment_mode: "cash", reference_no: "" };

export default function AdminFeesPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Record<string, unknown> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [headForm, setHeadForm] = useState(emptyHeadForm);
  const [invForm, setInvForm] = useState(emptyInvForm);
  const [bulkForm, setBulkForm] = useState(emptyBulkForm);
  const [payForm, setPayForm] = useState(emptyPayForm);
  const [feeHeads, setFeeHeads] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [reload, setReload] = useState(0);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    api.get("/erp/fee-heads").then((r) => setFeeHeads(r.data.data || []));
    api.get("/erp/fee-invoices/stats").then((r) => setStats(r.data.data || {})).catch(() => {});
  }, [reload]);

  const summary = (stats.summary || {}) as Record<string, number>;
  const byStatus = (stats.by_status || []) as Record<string, unknown>[];

  const sendReminders = async () => {
    if (!confirm("Send fee due reminders to parents with pending invoices?")) return;
    setSendingReminders(true);
    try {
      const res = await api.post("/erp/fee-invoices/send-reminders");
      alert(`Reminders sent: ${res.data.data?.sent ?? 0} (skipped: ${res.data.data?.skipped ?? 0})`);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to send reminders"));
    } finally {
      setSendingReminders(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    if (tab === "heads") setHeadForm(emptyHeadForm);
    else setInvForm(emptyInvForm);
    setOpen(true);
  };

  const openEditHead = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setHeadForm({
      name: String(row.name || ""),
      amount: String(row.amount ?? ""),
      class_level: String(row.class_level || ""),
      frequency: String(row.frequency || "annual"),
    });
    setOpen(true);
  };

  const openEditInvoice = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setInvForm({
      student_id: String(row.student_id || ""),
      fee_head_id: String(row.fee_head_id || ""),
      title: String(row.title || ""),
      amount: String(row.amount ?? ""),
      due_date: row.due_date ? String(row.due_date).slice(0, 10) : "",
      status: String(row.status || "pending"),
    });
    setOpen(true);
  };

  const onFeeHeadSelect = (feeHeadId: string) => {
    const head = feeHeads.find((h) => String(h.id) === feeHeadId);
    setInvForm({
      ...invForm,
      fee_head_id: feeHeadId,
      title: head ? String(head.name) : invForm.title,
      amount: head ? String(head.amount) : invForm.amount,
    });
  };

  const save = async () => {
    try {
      if (tab === "heads") {
        const payload = { ...headForm, amount: Number(headForm.amount) };
        if (editingId) await api.put(`/erp/fee-heads/${editingId}`, payload);
        else await api.post("/erp/fee-heads", payload);
      } else {
        const payload = { ...invForm, amount: Number(invForm.amount), fee_head_id: invForm.fee_head_id || null };
        if (editingId) await api.put(`/erp/fee-invoices/${editingId}`, payload);
        else await api.post("/erp/fee-invoices", payload);
      }
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  const recordPayment = async () => {
    if (!payTarget) return;
    try {
      await api.patch(`/erp/fee-invoices/${payTarget.id}/pay`, {
        paid_amount: Number(payForm.paid_amount) || Number(payTarget.amount),
        payment_mode: payForm.payment_mode,
        reference_no: payForm.reference_no,
      });
      setPayOpen(false);
      setReload((n) => n + 1);
      if (confirm("Payment recorded. Print receipt now?")) {
        printFeeReceipt({
          receipt_no: payForm.reference_no || String(payTarget.id).slice(0, 8).toUpperCase(),
          student_name: String(payTarget.student_name),
          admission_no: String(payTarget.admission_no || ""),
          class_level: String(payTarget.class_level || ""),
          section: String(payTarget.section || ""),
          title: String(payTarget.title),
          amount: Number(payTarget.amount),
          paid_amount: Number(payForm.paid_amount || payTarget.amount),
          payment_mode: payForm.payment_mode,
          reference_no: payForm.reference_no,
          paid_at: new Date().toISOString(),
          status: "paid",
        });
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Payment failed"));
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["overview", "invoices", "heads"] as Tab[]).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} className="rounded-xl capitalize" onClick={() => setTab(t)}>
            {t === "heads" ? "Fee Structure" : t}
          </Button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="mb-8"><h1 className="text-3xl font-bold">Fee Overview</h1><p className="text-muted-foreground">Collection summary and payment tracking</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlowCard className="p-5"><IndianRupee className="mb-2 h-5 w-5 text-primary" /><p className="text-2xl font-bold">₹{Number(summary.total_billed || 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Billed</p></GlowCard>
            <GlowCard className="p-5"><TrendingUp className="mb-2 h-5 w-5 text-emerald-600" /><p className="text-2xl font-bold">₹{Number(summary.total_collected || 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Collected</p></GlowCard>
            <GlowCard className="p-5"><CreditCard className="mb-2 h-5 w-5 text-amber-600" /><p className="text-2xl font-bold">₹{Number(summary.total_pending || 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Pending</p></GlowCard>
            <GlowCard className="p-5"><Receipt className="mb-2 h-5 w-5 text-violet-600" /><p className="text-2xl font-bold">{summary.invoice_count || 0}</p><p className="text-sm text-muted-foreground">Invoices</p></GlowCard>
          </div>
          <GlowCard className="mt-6 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold">Status Breakdown</h3>
              <Button variant="outline" className="rounded-xl" disabled={sendingReminders} onClick={sendReminders}>
                {sendingReminders ? "Sending..." : "Send Fee Reminders"}
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {byStatus.map((s) => (
                <div key={String(s.status)} className="rounded-xl bg-muted/50 p-3 text-sm">
                  <span className="capitalize font-medium">{String(s.status)}</span>: {String(s.count)} invoices — ₹{Number(s.amount).toLocaleString()}
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      )}

      {tab === "heads" && (
        <ErpAdminShell key={`heads-${reload}`} title="Fee Structure" subtitle="Define fee heads by class — used to generate invoices"
          endpoint="/erp/fee-heads" actions={<ErpAddButton onClick={openCreate} label="Add Fee Head" />}
          columns={[
            { key: "name", label: "Fee Name" },
            { key: "amount", label: "Amount", render: (r) => `₹${r.amount}` },
            { key: "class_level", label: "Class" },
            { key: "frequency", label: "Frequency", render: (r) => <span className="capitalize">{String(r.frequency)}</span> },
          ]}
          rowActions={(row) => (
            <ErpRowActions onEdit={() => openEditHead(row)} onDelete={async () => { await api.delete(`/erp/fee-heads/${row.id}`); setReload((n) => n + 1); }} />
          )}
        />
      )}

      {tab === "invoices" && (
        <ErpAdminShell key={`inv-${reload}`} title="Fee Invoices" subtitle="Student-wise invoices and payment collection"
          endpoint="/erp/fee-invoices"
          serverPagination
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setBulkOpen(true)}>Bulk Generate</Button>
              <ErpAddButton onClick={openCreate} label="Create Invoice" />
            </div>
          }
          columns={[
            { key: "student_name", label: "Student" },
            { key: "title", label: "Fee" },
            { key: "amount", label: "Amount", render: (r) => `₹${r.amount}` },
            { key: "status", label: "Status", render: (r) => <span className="capitalize">{String(r.status)}</span> },
            { key: "due_date", label: "Due", render: (r) => r.due_date ? new Date(String(r.due_date)).toLocaleDateString() : "—" },
            { key: "paid_at", label: "Paid", render: (r) => r.paid_at ? new Date(String(r.paid_at)).toLocaleDateString() : "—" },
          ]}
          rowActions={(row) => (
            <div className="flex flex-wrap gap-2">
              {row.status !== "paid" && (
                <>
                  <ErpRowActions onEdit={() => openEditInvoice(row)} onDelete={async () => { await api.delete(`/erp/fee-invoices/${row.id}`); setReload((n) => n + 1); }} />
                  <Button size="sm" className="rounded-xl" onClick={() => { setPayTarget(row); setPayForm({ paid_amount: String(row.amount), payment_mode: "cash", reference_no: "" }); setPayOpen(true); }}>Record Payment</Button>
                </>
              )}
              {row.status === "paid" && (
                <>
                  <span className="text-xs text-emerald-600">Paid {row.payment_mode ? `(${String(row.payment_mode)})` : ""}</span>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => printFeeReceipt({
                    receipt_no: String(row.reference_no || row.id).slice(0, 12),
                    student_name: String(row.student_name),
                    admission_no: String(row.admission_no || ""),
                    class_level: String(row.class_level || ""),
                    section: String(row.section || ""),
                    title: String(row.title),
                    amount: Number(row.amount),
                    paid_amount: Number(row.paid_amount || row.amount),
                    payment_mode: String(row.payment_mode || ""),
                    reference_no: String(row.reference_no || ""),
                    paid_at: String(row.paid_at || ""),
                    status: "paid",
                  })}><Printer className="h-4 w-4" /> Receipt</Button>
                </>
              )}
            </div>
          )}
        />
      )}

      <ErpModal open={open} onClose={() => setOpen(false)} title={tab === "heads" ? (editingId ? "Edit Fee Head" : "Add Fee Head") : (editingId ? "Edit Invoice" : "Create Invoice")}>
        <div className="space-y-3">
          {tab === "heads" ? (
            <>
              <Input className="rounded-xl" placeholder="Fee Name (e.g. Tuition Fee)" value={headForm.name} onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })} />
              <Input className="rounded-xl" type="number" placeholder="Amount (₹)" value={headForm.amount} onChange={(e) => setHeadForm({ ...headForm, amount: e.target.value })} />
              <LookupSelect type="admission_class" value={headForm.class_level} onChange={(class_level) => setHeadForm({ ...headForm, class_level })} placeholder="Class (optional)" allowEmpty />
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={headForm.frequency} onChange={(e) => setHeadForm({ ...headForm, frequency: e.target.value })}>
                <option value="annual">Annual</option>
                <option value="term">Per Term</option>
                <option value="monthly">Monthly</option>
                <option value="one_time">One Time</option>
              </select>
            </>
          ) : (
            <>
              <StudentSelect value={invForm.student_id} onChange={(student_id) => setInvForm({ ...invForm, student_id })} required />
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={invForm.fee_head_id} onChange={(e) => onFeeHeadSelect(e.target.value)}>
                <option value="">Select Fee Head (optional)</option>
                {feeHeads.map((h) => <option key={String(h.id)} value={String(h.id)}>{String(h.name)} — ₹{String(h.amount)}</option>)}
              </select>
              <Input className="rounded-xl" placeholder="Invoice Title" value={invForm.title} onChange={(e) => setInvForm({ ...invForm, title: e.target.value })} />
              <Input className="rounded-xl" type="number" placeholder="Amount (₹)" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} />
              <Input className="rounded-xl" type="date" value={invForm.due_date} onChange={(e) => setInvForm({ ...invForm, due_date: e.target.value })} />
            </>
          )}
          <Button className="w-full rounded-xl" onClick={save}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </ErpModal>

      <ErpModal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Generate Invoices">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Creates one invoice per student in the selected class from a fee head.</p>
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={bulkForm.fee_head_id} onChange={(e) => setBulkForm({ ...bulkForm, fee_head_id: e.target.value })}>
            <option value="">Select Fee Head *</option>
            {feeHeads.map((h) => <option key={String(h.id)} value={String(h.id)}>{String(h.name)} — ₹{String(h.amount)}</option>)}
          </select>
          <LookupSelect type="admission_class" value={bulkForm.class_level} onChange={(class_level) => setBulkForm({ ...bulkForm, class_level })} placeholder="Select Class *" required />
          <LookupSelect type="section" value={bulkForm.section} onChange={(section) => setBulkForm({ ...bulkForm, section })} placeholder="Section (optional)" allowEmpty />
          <Input className="rounded-xl" type="date" value={bulkForm.due_date} onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={async () => {
            try {
              const res = await api.post("/erp/fee-invoices/bulk-generate", bulkForm);
              alert(`Created ${res.data.data.created} invoices for ${res.data.data.total_students} students`);
              setBulkOpen(false);
              setReload((n) => n + 1);
            } catch (err) { alert(getApiErrorMessage(err, "Bulk generate failed")); }
          }}>Generate Invoices</Button>
        </div>
      </ErpModal>

      <ErpModal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment">
        <div className="space-y-3">
          <p className="text-sm">Paying: <strong>{String(payTarget?.student_name)}</strong> — {String(payTarget?.title)}</p>
          <Input className="rounded-xl" type="number" placeholder="Amount Received (₹)" value={payForm.paid_amount} onChange={(e) => setPayForm({ ...payForm, paid_amount: e.target.value })} />
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={payForm.payment_mode} onChange={(e) => setPayForm({ ...payForm, payment_mode: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
          <Input className="rounded-xl" placeholder="Reference / Transaction No" value={payForm.reference_no} onChange={(e) => setPayForm({ ...payForm, reference_no: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={recordPayment}>Confirm Payment</Button>
        </div>
      </ErpModal>
    </>
  );
}
