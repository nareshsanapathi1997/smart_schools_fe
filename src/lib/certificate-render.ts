import { SCHOOL } from "@/lib/constants";

export interface CertificateRenderData {
  student_name?: string;
  admission_no?: string;
  class_level?: string;
  section?: string;
  reason?: string;
  certificate_no?: string;
  issued_date?: string;
  certificate_type?: string;
  title_text?: string;
  body_template?: string;
  footer_text?: string;
  school_name?: string;
}

export function renderCertificateHtml(data: CertificateRenderData) {
  const vars: Record<string, string> = {
    student_name: data.student_name || "Student Name",
    admission_no: data.admission_no || "—",
    class_level: data.class_level || "—",
    section: data.section || "—",
    reason: data.reason || "—",
    certificate_no: data.certificate_no || "CERT-00000",
    date: data.issued_date ? new Date(data.issued_date).toLocaleDateString() : new Date().toLocaleDateString(),
    school_name: data.school_name || SCHOOL.name,
  };

  const body = (data.body_template || defaultBody(data.certificate_type || "bonafide"))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "—");

  const title = data.title_text || `${(data.certificate_type || "bonafide").toUpperCase()} Certificate`;
  const footer = data.footer_text || "Authorized Signatory";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  body { font-family: Georgia, serif; margin: 0; padding: 40px; color: #1e293b; }
  .cert { max-width: 720px; margin: 0 auto; border: 3px double #4f46e5; padding: 48px; background: #fff; }
  .school { text-align: center; font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: #64748b; }
  h1 { text-align: center; color: #4f46e5; margin: 24px 0 8px; font-size: 28px; }
  .meta { text-align: center; font-size: 13px; color: #64748b; margin-bottom: 32px; }
  .body { font-size: 17px; line-height: 1.8; text-align: justify; min-height: 120px; }
  .footer { margin-top: 48px; display: flex; justify-content: space-between; font-size: 14px; }
  .sign { border-top: 1px solid #94a3b8; padding-top: 8px; min-width: 180px; text-align: center; }
</style></head><body>
<div class="cert">
  <div class="school">${vars.school_name}</div>
  <h1>${title}</h1>
  <div class="meta">Certificate No: ${vars.certificate_no} &nbsp;|&nbsp; Date: ${vars.date}</div>
  <div class="body">${body}</div>
  ${data.reason ? `<p style="margin-top:24px;font-size:14px;"><strong>Purpose:</strong> ${vars.reason}</p>` : ""}
  <div class="footer">
    <div class="sign">Date<br/>${vars.date}</div>
    <div class="sign">${footer}</div>
  </div>
</div></body></html>`;
}

function defaultBody(type: string) {
  if (type === "tc") return "This is to certify that {{student_name}} (Admission No: {{admission_no}}) was a student of Class {{class_level}} at {{school_name}}.";
  if (type === "character") return "This is to certify that {{student_name}} is a student of good moral character at {{school_name}}.";
  return "This is to certify that {{student_name}} (Admission No: {{admission_no}}, Class: {{class_level}}-{{section}}) is a bonafide student of {{school_name}}.";
}

export function openCertificatePreview(data: CertificateRenderData) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(renderCertificateHtml(data));
  w.document.close();
}

export function printCertificate(data: CertificateRenderData) {
  openCertificatePreview(data);
  setTimeout(() => { window.print(); }, 300);
}
