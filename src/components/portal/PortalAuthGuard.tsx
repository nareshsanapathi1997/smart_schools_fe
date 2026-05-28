"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { portalApi } from "@/lib/portal-api";
import { usePortalStore } from "@/store/usePortalStore";

export function PortalAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, setPortalAuth, logout } = usePortalStore();
  const isPublic = pathname === "/portal/login" || pathname === "/portal";

  useEffect(() => {
    if (isPublic || !token) return;
    portalApi.get("/erp/portal/me")
      .then((res) => {
        const d = res.data.data;
        if (!d) return;
        setPortalAuth(
          {
            type: d.account_type || "student",
            student_name: d.student_name,
            admission_no: d.admission_no,
            student_id: d.student_id,
          },
          token
        );
      })
      .catch(() => {
        logout();
        router.push("/portal/login");
      });
  }, [token, isPublic, router, setPortalAuth, logout]);

  return <>{children}</>;
}
