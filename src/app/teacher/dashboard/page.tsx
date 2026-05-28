"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { teacherApi, clearTeacherToken } from "@/lib/teacher-api";

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DashboardData {
  teacher?: { faculty_name?: string; username?: string; department?: string };
  timetable?: Record<string, unknown>[];
  homework?: Record<string, unknown>[];
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("teacher_token")) {
      router.push("/teacher/login");
      return;
    }
    teacherApi.get("/erp/teacher/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => router.push("/teacher/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    clearTeacherToken();
    router.push("/teacher/login");
  };

  const timetableByDay: Record<number, Record<string, unknown>[]> = {};
  (data?.timetable || []).forEach((slot) => {
    const d = Number(slot.day_of_week);
    if (!timetableByDay[d]) timetableByDay[d] = [];
    timetableByDay[d].push(slot);
  });

  const teacher = data?.teacher;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100">
      <header className="border-b border-border/40 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Teacher Portal</p>
            <h1 className="text-xl font-bold">{teacher?.faculty_name || "Teacher"}</h1>
            {teacher?.department && <p className="text-sm text-muted-foreground">{teacher.department}</p>}
          </div>
          <Button variant="outline" className="rounded-xl gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading dashboard...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <GlowCard className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><Clock className="h-5 w-5 text-primary" /> My Timetable</h2>
              {Object.keys(timetableByDay).length ? (
                <div className="space-y-4">
                  {Object.keys(timetableByDay).map(Number).sort((a, b) => a - b).map((d) => (
                    <div key={d}>
                      <p className="mb-2 text-sm font-semibold text-primary">{DAY_NAMES[d] || `Day ${d}`}</p>
                      <div className="space-y-2">
                        {(timetableByDay[d] || []).map((slot) => (
                          <div key={String(slot.id)} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
                            <p className="font-medium">Period {String(slot.period_number)} — {String(slot.subject)}</p>
                            <p className="text-xs text-muted-foreground">
                              {String(slot.class_level || "")}{slot.section ? `-${String(slot.section)}` : ""}
                              {slot.start_time ? ` • ${String(slot.start_time)}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No timetable slots assigned to your name yet.</p>
              )}
            </GlowCard>

            <GlowCard className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><BookOpen className="h-5 w-5 text-violet-600" /> Homework</h2>
              <div className="space-y-3">
                {(data?.homework || []).slice(0, 10).map((h) => (
                  <div key={String(h.id)} className="rounded-xl border border-border/50 p-3 text-sm">
                    <p className="font-medium">{String(h.title)}</p>
                    <p className="text-xs text-muted-foreground">
                      {String(h.class_level || "")}{h.section ? `-${String(h.section)}` : ""} • {String(h.subject || "General")}
                      {h.due_date ? ` • Due ${new Date(String(h.due_date)).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                ))}
                {!data?.homework?.length && (
                  <p className="text-sm text-muted-foreground">No homework assignments posted.</p>
                )}
              </div>
              <Link href="/admin/homework" className="mt-4 inline-block text-sm text-primary hover:underline">
                Manage homework in admin →
              </Link>
            </GlowCard>
          </div>
        )}
      </main>
    </div>
  );
}
