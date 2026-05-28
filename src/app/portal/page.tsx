"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortalStore } from "@/store/usePortalStore";

export default function PortalIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("portal_token") || usePortalStore.getState().token;
    router.replace(storedToken ? "/portal/dashboard" : "/portal/login");
  }, [router]);

  return null;
}
