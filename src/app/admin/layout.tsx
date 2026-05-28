"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Users, Image, MessageSquare, Bot,
  Settings, LogOut, Menu, X, BarChart3, GraduationCap, Megaphone,
  Calendar, Star, Trophy, Mail, ExternalLink, FileSpreadsheet, ScrollText, MessagesSquare,
  Shield, Building2, Layers, ListTree, LayoutGrid, ClipboardCheck, Clock, Bus, CreditCard, Bell, KeyRound, Library,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { ADMIN_NAV_SECTIONS, canAccessAdminRoute } from "@/lib/admin-nav";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/leads": FileSpreadsheet,
  "/admin/students": GraduationCap,
  "/admin/attendance": ClipboardCheck,
  "/admin/timetable": Clock,
  "/admin/homework": BookOpen,
  "/admin/exams": Trophy,
  "/admin/fees": CreditCard,
  "/admin/transport": Bus,
  "/admin/library": Library,
  "/admin/payroll": CreditCard,
  "/admin/certificates": Star,
  "/admin/alerts": Bell,
  "/admin/portals": KeyRound,
  "/admin/enquiries": MessageSquare,
  "/admin/courses": BookOpen,
  "/admin/faculty": Users,
  "/admin/gallery": Image,
  "/admin/announcements": Megaphone,
  "/admin/events": Calendar,
  "/admin/testimonials": Star,
  "/admin/achievements": Trophy,
  "/admin/chatbot": Bot,
  "/admin/chat-logs": MessagesSquare,
  "/admin/contacts": Mail,
  "/admin/analytics": BarChart3,
  "/admin/erp-analytics": BarChart3,
  "/admin/academic-years": Calendar,
  "/admin/activity-logs": ScrollText,
  "/admin/departments": Building2,
  "/admin/class-levels": Layers,
  "/admin/lookups": ListTree,
  "/admin/features": LayoutGrid,
  "/admin/roles": Shield,
  "/admin/settings": Settings,
  "/admin/users": Users,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/forgot-password" || pathname.startsWith("/admin/reset-password");

  useEffect(() => {
    if (isAuthPage) return;
    if (!token) router.push("/admin/login");
    else if (!user) {
      api.get("/auth/me").then((res) => {
        useAuthStore.getState().setAuth(res.data.data, token);
      }).catch(() => router.push("/admin/login"));
    }
  }, [token, user, router, isAuthPage]);

  useEffect(() => {
    if (isAuthPage || !user) return;
    if (!canAccessAdminRoute(user.role, pathname, user.permissions)) {
      router.replace("/admin");
    }
  }, [user, pathname, isAuthPage, router]);

  if (isAuthPage) return <>{children}</>;

  if (user && !canAccessAdminRoute(user.role, pathname, user.permissions)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-950">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/40 bg-card/80 backdrop-blur-xl transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0 shadow-premium" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/40 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold">Smart School</span>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {ADMIN_NAV_SECTIONS.map((section) => {
            const items = section.items.filter((item) =>
              canAccessAdminRoute(user?.role, item.href, user?.permissions)
            );
            if (!items.length) return null;

            return (
              <div key={section.title} className="mb-5 last:mb-0">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = NAV_ICONS[item.href] || LayoutDashboard;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                          active ? "text-white" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="admin-nav"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-violet-600 shadow-glow"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon className="relative z-10 h-4 w-4 shrink-0" />
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-border/40 p-4">
          <Button variant="outline" className="w-full rounded-xl" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/40 bg-card/70 px-6 backdrop-blur-xl">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.name || "Admin"}</span>
          </p>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            View Website <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </header>
        <main className="flex-1 p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
