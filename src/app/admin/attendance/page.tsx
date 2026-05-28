"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Save, Users, CheckCircle2, XCircle, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { LookupSelect } from "@/components/admin/LookupSelect";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

interface Student { id: string; student_name: string; class_level: string; section?: string; admission_no: string; }

type Tab = "mark" | "report";

const STEPS = [
  "Pick the date you are marking attendance for.",
  "Select the class and section.",
  "Set Present / Absent / Late / Half Day for each student.",
  "Click Save — absent students trigger a WhatsApp alert to parents.",
];

export default function AdminAttendancePage() {
  const [tab, setTab] = useState<Tab>("mark");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classLevel, setClassLevel] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [reportFrom, setReportFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = useState(new Date().toISOString().slice(0, 10));
  const [reportClass, setReportClass] = useState("");
  const [reportSection, setReportSection] = useState("");
  const [reportRows, setReportRows] = useState<Record<string, unknown>[]>([]);
  const [reportSummary, setReportSummary] = useState<Record<string, number>>({});
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!classLevel) { setStudents([]); setStatuses({}); return; }
    setLoading(true);
    const params: Record<string, string> = { class: classLevel, all: "true" };
    Promise.all([
      api.get("/students", { params }),
      api.get("/erp/attendance", { params: { date, class: classLevel, ...(section ? { section } : {}) } }),
    ])
      .then(([studentsRes, attRes]) => {
        let list: Student[] = studentsRes.data.data || [];
        if (section) list = list.filter((s) => (s.section || "") === section);
        setStudents(list);
        const existing: Record<string, string> = {};
        (attRes.data.data || []).forEach((r: Record<string, unknown>) => {
          existing[String(r.student_id)] = String(r.status || "present");
        });
        const initial: Record<string, string> = {};
        list.forEach((s) => { initial[s.id] = existing[s.id] || "present"; });
        setStatuses(initial);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [classLevel, section, date]);

  const stats = useMemo(() => {
    const vals = Object.values(statuses);
    return {
      present: vals.filter((v) => v === "present").length,
      absent: vals.filter((v) => v === "absent").length,
      late: vals.filter((v) => v === "late").length,
      half: vals.filter((v) => v === "half_day").length,
    };
  }, [statuses]);

  const markAll = (status: string) => {
    const next: Record<string, string> = {};
    students.forEach((s) => { next[s.id] = status; });
    setStatuses(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/erp/attendance/bulk", {
        date,
        records: students.map((s) => ({
          student_id: s.id,
          status: statuses[s.id] || "present",
          class_level: s.class_level,
          section: s.section,
        })),
      });
      alert(`Attendance saved for ${students.length} students on ${date}`);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const res = await api.get("/erp/attendance/report", {
        params: {
          from: reportFrom,
          to: reportTo,
          ...(reportClass ? { class: reportClass } : {}),
          ...(reportSection ? { section: reportSection } : {}),
        },
      });
      setReportRows(res.data.data?.records || []);
      setReportSummary(res.data.data?.summary || {});
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to load report"));
      setReportRows([]);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Daily Attendance</h1>
          <p className="text-muted-foreground">Mark attendance and view historical reports</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Button variant={tab === "mark" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("mark")}>Mark Attendance</Button>
        <Button variant={tab === "report" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("report")}><BarChart3 className="h-4 w-4" /> Reports</Button>
      </div>

      {tab === "mark" && (
        <>
          <GlowCard className="mb-6 p-5">
            <h3 className="mb-3 font-semibold">How to mark attendance</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {STEPS.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </GlowCard>

          <GlowCard className="mb-6 p-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
                <Input type="date" className="rounded-xl" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Class *</label>
                <LookupSelect type="admission_class" value={classLevel} onChange={setClassLevel} placeholder="Select Class" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Section</label>
                <LookupSelect type="section" value={section} onChange={setSection} placeholder="All Sections" allowEmpty />
              </div>
              <div className="flex items-end gap-2">
                <Button className="w-full rounded-xl" onClick={save} disabled={!students.length || saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            {students.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => markAll("present")}>All Present</Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => markAll("absent")}>All Absent</Button>
              </div>
            )}
          </GlowCard>

          {students.length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-4">
              <GlowCard className="flex items-center gap-3 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-xl font-bold">{stats.present}</p><p className="text-xs text-muted-foreground">Present</p></div></GlowCard>
              <GlowCard className="flex items-center gap-3 p-4"><XCircle className="h-5 w-5 text-red-600" /><div><p className="text-xl font-bold">{stats.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div></GlowCard>
              <GlowCard className="flex items-center gap-3 p-4"><Clock className="h-5 w-5 text-amber-600" /><div><p className="text-xl font-bold">{stats.late}</p><p className="text-xs text-muted-foreground">Late</p></div></GlowCard>
              <GlowCard className="flex items-center gap-3 p-4"><Users className="h-5 w-5 text-primary" /><div><p className="text-xl font-bold">{students.length}</p><p className="text-xs text-muted-foreground">Total</p></div></GlowCard>
            </div>
          )}

          <div className="space-y-2">
            {loading && <p className="py-10 text-center text-muted-foreground">Loading students...</p>}
            {!loading && students.map((s) => (
              <GlowCard key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{s.student_name}</p>
                  <p className="text-xs text-muted-foreground">{s.admission_no} • Section {s.section || "—"}</p>
                </div>
                <select className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={statuses[s.id] || "present"} onChange={(e) => setStatuses({ ...statuses, [s.id]: e.target.value })}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                </select>
              </GlowCard>
            ))}
            {!loading && classLevel && !students.length && (
              <p className="py-10 text-center text-muted-foreground">No students found for this class{section ? ` / section ${section}` : ""}.</p>
            )}
            {!classLevel && <p className="py-10 text-center text-muted-foreground">Select a class to begin.</p>}
          </div>
        </>
      )}

      {tab === "report" && (
        <>
          <GlowCard className="mb-6 p-5">
            <div className="grid gap-3 md:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
                <Input type="date" className="rounded-xl" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
                <Input type="date" className="rounded-xl" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Class</label>
                <LookupSelect type="admission_class" value={reportClass} onChange={setReportClass} placeholder="All Classes" allowEmpty />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Section</label>
                <LookupSelect type="section" value={reportSection} onChange={setReportSection} placeholder="All Sections" allowEmpty />
              </div>
              <div className="flex items-end">
                <Button className="w-full rounded-xl" onClick={loadReport} disabled={reportLoading}>
                  {reportLoading ? "Loading..." : "Load Report"}
                </Button>
              </div>
            </div>
          </GlowCard>

          {Object.keys(reportSummary).length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-4">
              {Object.entries(reportSummary).map(([status, count]) => (
                <GlowCard key={status} className="p-4">
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs capitalize text-muted-foreground">{status.replace("_", " ")}</p>
                </GlowCard>
              ))}
              <GlowCard className="p-4">
                <p className="text-xl font-bold">{reportRows.length}</p>
                <p className="text-xs text-muted-foreground">Total records</p>
              </GlowCard>
            </div>
          )}

          <div className="space-y-2">
            {reportRows.map((r) => (
              <GlowCard key={String(r.id)} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{String(r.student_name)}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(r.admission_no)} • {new Date(String(r.attendance_date)).toLocaleDateString()} • {String(r.class_level)}{r.section ? `-${String(r.section)}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  r.status === "present" ? "bg-emerald-100 text-emerald-700" :
                  r.status === "absent" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{String(r.status).replace("_", " ")}</span>
              </GlowCard>
            ))}
            {!reportLoading && !reportRows.length && (
              <p className="py-10 text-center text-muted-foreground">No records found. Adjust filters and click Load Report.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
