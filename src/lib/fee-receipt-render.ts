import { SCHOOL } from "@/lib/constants";

export interface FeeReceiptData {
  receipt_no?: string;
  student_name?: string;
  admission_no?: string;
  class_level?: string;
  section?: string;
  title?: string;
  amount?: number | string;
  paid_amount?: number | string;
  payment_mode?: string;
  reference_no?: string;
  paid_at?: string;
  due_date?: string;
  status?: string;
}

export function printFeeReceipt(data: FeeReceiptData) {
  const amount = Number(data.paid_amount ?? data.amount ?? 0);
  const paidDate = data.paid_at ? new Date(String(data.paid_at)).toLocaleDateString() : new Date().toLocaleDateString();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Fee Receipt</title>
<style>
  body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;background:#f8fafc}
  .receipt{max-width:640px;margin:0 auto;background:#fff;border:2px solid #4f46e5;padding:32px}
  .header{text-align:center;border-bottom:2px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px}
  h1{margin:0;color:#4f46e5;font-size:22px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:14px;margin:16px 0}
  .amount{font-size:28px;font-weight:bold;color:#059669;text-align:center;margin:24px 0;padding:16px;background:#ecfdf5;border-radius:12px}
  .footer{margin-top:32px;text-align:center;font-size:12px;color:#64748b}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  td{padding:8px 0;border-bottom:1px solid #f1f5f9}
  td:first-child{color:#64748b;width:40%}
</style></head><body>
<div class="receipt">
  <div class="header">
    <h1>${SCHOOL.name}</h1>
    <p>Official Fee Receipt</p>
    <p style="font-size:12px;color:#64748b">${SCHOOL.address}</p>
  </div>
  <div class="meta">
    <div><strong>Receipt No:</strong> ${data.receipt_no || data.reference_no || "—"}</div>
    <div><strong>Date:</strong> ${paidDate}</div>
  </div>
  <table>
    <tr><td>Student</td><td><strong>${data.student_name || "—"}</strong></td></tr>
    <tr><td>Admission No</td><td>${data.admission_no || "—"}</td></tr>
    <tr><td>Class</td><td>${data.class_level || "—"}${data.section ? ` - ${data.section}` : ""}</td></tr>
    <tr><td>Fee Description</td><td>${data.title || "—"}</td></tr>
    <tr><td>Payment Mode</td><td class="capitalize">${data.payment_mode || "—"}</td></tr>
    ${data.reference_no ? `<tr><td>Reference</td><td>${data.reference_no}</td></tr>` : ""}
  </table>
  <div class="amount">₹${amount.toLocaleString()} Received</div>
  <p style="text-align:center;font-size:13px;color:#64748b">Status: <strong class="capitalize">${data.status || "paid"}</strong></p>
  <div class="footer">This is a computer-generated receipt. For queries contact ${SCHOOL.phone}</div>
</div></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.print();
}
