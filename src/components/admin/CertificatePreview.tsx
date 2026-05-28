"use client";

import { cn } from "@/lib/utils";
import { CertificateRenderData, renderCertificateHtml } from "@/lib/certificate-render";

export function CertificatePreview({ data, className }: { data: CertificateRenderData; className?: string }) {
  const html = renderCertificateHtml(data);
  const srcDoc = html.replace(/<\/?html[^>]*>|<\/?head[^>]*>|<\/?body[^>]*>/gi, "");

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/60 bg-white shadow-inner", className)}>
      <iframe
        title="Certificate preview"
        className="h-[420px] w-full border-0 bg-white"
        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:8px;background:#f8fafc">${srcDoc.match(/<div class="cert"[\s\S]*<\/div>/)?.[0] || ""}</body></html>`}
      />
    </div>
  );
}
