import type { Metadata } from "next";
import { PortalAuthGuard } from "@/components/portal/PortalAuthGuard";

export const metadata: Metadata = {
  title: "Portal Login",
  description: "Parent and student portal login for Smart School",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthGuard>
      <div className="min-h-screen">{children}</div>
    </PortalAuthGuard>
  );
}
