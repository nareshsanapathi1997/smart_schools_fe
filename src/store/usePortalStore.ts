"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortalAccount {
  type: string;
  student_name: string;
  admission_no: string;
  student_id: string;
}

interface PortalState {
  account: PortalAccount | null;
  token: string | null;
  setPortalAuth: (account: PortalAccount, token: string) => void;
  logout: () => void;
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      account: null,
      token: null,
      setPortalAuth: (account, token) => {
        localStorage.setItem("portal_token", token);
        set({ account, token });
      },
      logout: () => {
        localStorage.removeItem("portal_token");
        set({ account: null, token: null });
      },
    }),
    { name: "portal-storage", partialize: (s) => ({ account: s.account, token: s.token }) }
  )
);
