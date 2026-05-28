"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  Home,
  ClipboardList,
  BookOpen,
  CreditCard,
  Calendar,
  Clock,
  User,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCHOOL } from "@/lib/constants";
import { usePortalStore } from "@/store/usePortalStore";

export type PortalTab = "overview" | "attendance" | "fees" | "homework" | "results" | "timetable" | "library";

const ALL_NAV: { id: PortalTab; label: string; icon: typeof ClipboardList; parentOnly?: boolean; studentOnly?: boolean }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "attendance", label: "Attendance", icon: ClipboardList },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "homework", label: "Homework", icon: BookOpen, studentOnly: true },
  { id: "results", label: "Results", icon: Calendar },
  { id: "timetable", label: "Timetable", icon: Clock, studentOnly: true },
  { id: "library", label: "Library", icon: Library },
];

interface PortalShellProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  children: React.ReactNode;
  accountType?: string;
  student?: {
    name?: string;
    admission_no?: string;
    class_level?: string;
    section?: string;
    account_type?: string;
  } | null;
}

export function PortalShell({ activeTab, onTabChange, children, accountType, student }: PortalShellProps) {
  const router = useRouter();
  const { account, logout } = usePortalStore();
  const isParent = accountType === "parent" || account?.type === "parent";
  const nav = ALL_NAV.filter((item) => {
    if (isParent && item.studentOnly) return false;
    if (!isParent && item.parentOnly) return false;
    return true;
  });
  const displayName = student?.name || account?.student_name;
  const displayAdmission = student?.admission_no || account?.admission_no;
  const displayClass = student?.class_level;
  const displaySection = student?.section;

  const handleLogout = () => {
    logout();
    router.push("/portal/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/portal/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight">{SCHOOL.name}</p>
              <p className="text-xs text-muted-foreground">{isParent ? "Parent Portal" : "Student Portal"}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {displayAdmission}
                {displayClass ? ` • Class ${displayClass}` : ""}
                {displaySection ? `-${displaySection}` : ""}
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        <nav className="container mx-auto flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                activeTab === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="container mx-auto px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles =
    s === "present" || s === "paid" ? "bg-emerald-100 text-emerald-700" :
    s === "absent" || s === "overdue" ? "bg-red-100 text-red-700" :
    s === "pending" ? "bg-amber-100 text-amber-700" :
    s === "late" || s === "half_day" ? "bg-orange-100 text-orange-700" :
    "bg-slate-100 text-slate-700";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", styles)}>
      {s.replace("_", " ")}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, desc }: { icon: typeof User; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function formatCurrency(n: unknown) {
  const val = Number(n);
  if (Number.isNaN(val)) return "—";
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function feeLabel(f: Record<string, unknown>) {
  const head = String(f.fee_head_name || "").trim();
  const title = String(f.title || "").trim();
  if (head && title && head !== title) return `${head} — ${title}`;
  return head || title || "Fee Invoice";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function dayName(n: unknown) {
  const i = Number(n);
  return DAYS[i] ?? String(n);
}
