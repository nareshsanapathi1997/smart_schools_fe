import { SCHOOL } from "@/lib/constants";

export interface ReportCardMark {
  subject?: string;
  exam_name?: string;
  max_marks?: number | string;
  marks_obtained?: number | string;
  grade?: string;
  term_name?: string;
}

export interface ReportCardData {
  student?: {
    student_name?: string;
    admission_no?: string;
    class_level?: string;
    section?: string;
    roll_no?: string;
    academic_year?: string;
  };
  marks?: ReportCardMark[];
  term_name?: string;
}

function totalMarks(marks: ReportCardMark[]) {
  const obtained = marks.reduce((sum, m) => sum + Number(m.marks_obtained || 0), 0);
  const max = marks.reduce((sum, m) => sum + Number(m.max_marks || 0), 0);
  const pct = max ? Math.round((obtained / max) * 100) : 0;
  return { obtained, max, pct };
}

export function renderReportCardHtml(data: ReportCardData) {
  const student = data.student || {};
  const marks = data.marks || [];
  const term = data.term_name || marks[0]?.term_name || "Academic Term";
  const totals = totalMarks(marks);
  const rows = marks
    .map(
      (m) =>
        `<tr>
          <td>${m.subject || "—"}</td>
          <td>${m.exam_name || "—"}</td>
          <td style="text-align:center">${m.marks_obtained ?? "—"}</td>
          <td style="text-align:center">${m.max_marks ?? "—"}</td>
          <td style="text-align:center;font-weight:bold">${m.grade || "—"}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Report Card — ${student.student_name || "Student"}</title>
<style>
  body{font-family:Georgia,serif;margin:0;padding:32px;color:#1e293b;background:#f8fafc}
  .card{max-width:760px;margin:0 auto;background:#fff;border:3px double #4f46e5;padding:40px}
  .school{text-align:center;font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:#64748b}
  h1{text-align:center;color:#4f46e5;margin:16px 0 4px;font-size:26px}
  .meta{text-align:center;font-size:13px;color:#64748b;margin-bottom:24px}
  .info{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:14px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{padding:10px 8px;border-bottom:1px solid #e2e8f0}
  th{text-align:left;background:#f8fafc;color:#475569;font-size:12px;text-transform:uppercase}
  .summary{margin-top:24px;padding:16px;background:#ecfdf5;border-radius:12px;text-align:center}
  .footer{margin-top:32px;display:flex;justify-content:space-between;font-size:13px}
  .sign{border-top:1px solid #94a3b8;padding-top:8px;min-width:160px;text-align:center}
</style></head><body>
<div class="card">
  <div class="school">${SCHOOL.name}</div>
  <h1>Report Card</h1>
  <div class="meta">${term}${student.academic_year ? ` • ${student.academic_year}` : ""}</div>
  <div class="info">
    <div><strong>Student:</strong> ${student.student_name || "—"}</div>
    <div><strong>Admission No:</strong> ${student.admission_no || "—"}</div>
    <div><strong>Class:</strong> ${student.class_level || "—"}${student.section ? ` - ${student.section}` : ""}</div>
    <div><strong>Roll No:</strong> ${student.roll_no || "—"}</div>
  </div>
  <table>
    <thead><tr><th>Subject</th><th>Exam</th><th>Marks</th><th>Max</th><th>Grade</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#64748b">No marks recorded</td></tr>'}</tbody>
  </table>
  <div class="summary">
    <strong>Total: ${totals.obtained} / ${totals.max}</strong> &nbsp;|&nbsp; Percentage: <strong>${totals.pct}%</strong>
  </div>
  <div class="footer">
    <div class="sign">Class Teacher</div>
    <div class="sign">Principal</div>
  </div>
</div></body></html>`;
}

export function printReportCard(data: ReportCardData) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(renderReportCardHtml(data));
  w.document.close();
  w.print();
}
