"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  BookOpen,
  CreditCard,
  Calendar,
  Bus,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Printer,
  Library,
} from "lucide-react";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { Button } from "@/components/ui/button";
import { portalApi } from "@/lib/portal-api";
import { usePortalStore } from "@/store/usePortalStore";
import { printFeeReceipt } from "@/lib/fee-receipt-render";
import { getApiErrorMessage } from "@/lib/api-error";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import {
  PortalShell,
  PortalTab,
  StatusBadge,
  EmptyState,
  formatCurrency,
  feeLabel,
  dayName,
} from "@/components/portal/PortalShell";

interface DashboardData {
  student?: Record<string, unknown>;
  attendance?: Record<string, unknown>[];
  attendance_stats?: Record<string, number | null>;
  homework?: Record<string, unknown>[];
  fees?: Record<string, unknown>[];
  fee_summary?: Record<string, unknown>;
  timetable?: Record<string, unknown>[];
  marks?: Record<string, unknown>[];
  transport?: Record<string, unknown> | null;
  library?: Record<string, unknown>[];
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const { account, token } = usePortalStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PortalTab>("overview");
  const [payingId, setPayingId] = useState<string | null>(null);

  const isParent = account?.type === "parent";

  useEffect(() => {
    if (account && isParent && tab === "homework") setTab("fees");
    if (account && isParent && tab === "timetable") setTab("overview");
  }, [account, isParent, tab]);

  const reloadDashboard = useCallback(() => {
    if (!token) return;
    setLoading(true);
    portalApi.get("/erp/portal/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => router.push("/portal/login"))
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!token) { router.push("/portal/login"); return; }
    reloadDashboard();
  }, [token, router, reloadDashboard]);

  const student = data?.student as Record<string, unknown> | undefined;
  const attStats = data?.attendance_stats || {};
  const feeSummary = data?.fee_summary || {};
  const attendance = data?.attendance || [];
  const homework = data?.homework || [];
  const fees = data?.fees || [];
  const marks = data?.marks || [];
  const timetable = data?.timetable || [];
  const transport = data?.transport;
  const library = data?.library || [];

  const pendingFees = fees.filter((f) => f.status === "pending");
  const paidFees = fees.filter((f) => f.status === "paid");
  const upcomingHw = homework.filter((h) => h.due_date && new Date(String(h.due_date)) >= new Date());

  const timetableByDay: Record<number, Record<string, unknown>[]> = {};
  timetable.forEach((slot) => {
    const d = Number(slot.day_of_week);
    if (!timetableByDay[d]) timetableByDay[d] = [];
    timetableByDay[d].push(slot);
  });

  if (!account) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const accountLabel = isParent ? "Parent View" : "Student View";

  const payOnline = async (fee: Record<string, unknown>) => {
    const feeId = String(fee.id);
    setPayingId(feeId);
    try {
      const res = await portalApi.post(`/erp/portal/payments/invoices/${feeId}/order`);
      const order = res.data.data;
      if (order.razorpay_enabled && order.keyId && order.orderId && !order.mock) {
        const payment = await openRazorpayCheckout({
          keyId: order.keyId,
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: String(student?.name || account.student_name),
          description: feeLabel(fee),
          prefill: { name: String(student?.name || account.student_name) },
        });
        await portalApi.post("/erp/portal/payments/verify", payment);
        alert("Payment successful!");
        reloadDashboard();
        return;
      }
      if (!confirm(`Simulate online payment of ${formatCurrency(fee.amount)}?`)) return;
      await portalApi.post("/erp/portal/payments/verify", {
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `mock_pay_${Date.now()}`,
        razorpay_signature: "mock",
      });
      alert("Payment recorded successfully");
      reloadDashboard();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Online payment failed. Please contact the accounts office.");
      if (!String(err).includes("cancelled")) alert(msg);
    } finally {
      setPayingId(null);
    }
  };

  const printReceipt = (fee: Record<string, unknown>) => {
    printFeeReceipt({
      receipt_no: String(fee.reference_no || fee.id || ""),
      student_name: String(student?.name || account.student_name),
      admission_no: String(student?.admission_no || account.admission_no),
      class_level: String(student?.class_level || ""),
      section: student?.section ? String(student.section) : undefined,
      title: feeLabel(fee),
      amount: fee.amount as number | string,
      paid_amount: fee.paid_amount as number | string,
      payment_mode: fee.payment_mode ? String(fee.payment_mode) : undefined,
      reference_no: fee.reference_no ? String(fee.reference_no) : undefined,
      paid_at: fee.paid_at ? String(fee.paid_at) : undefined,
      status: "paid",
    });
  };

  return (
    <PortalShell activeTab={tab} onTabChange={setTab} accountType={account.type} student={student as Parameters<typeof PortalShell>[0]["student"]}>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {/* Welcome banner */}
          <GlowCard className="mb-6 overflow-hidden p-0">
            <div className="bg-gradient-to-r from-primary to-violet-600 p-6 text-white sm:p-8">
              <p className="text-sm text-violet-200">{greeting()},</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{String(student?.name || account.student_name)}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-violet-100">
                <span className="rounded-full bg-white/15 px-3 py-1">{String(student?.admission_no || account.admission_no)}</span>
                <span className="rounded-full bg-white/15 px-3 py-1">
                  Class {String(student?.class_level || "—")}{student?.section ? ` • Section ${String(student.section)}` : ""}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1">{accountLabel}</span>
              </div>
            </div>
          </GlowCard>

          {/* Overview tab */}
          {tab === "overview" && (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <GlowCard className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attendance (30d)</p>
                      <p className="mt-2 text-3xl font-bold">
                        {attStats.rate != null ? `${attStats.rate}%` : "—"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Number(attStats.present || 0)} present of {Number(attStats.total || 0)} days
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending Fees</p>
                      <p className="mt-2 text-3xl font-bold">{formatCurrency(feeSummary.pending_total)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{Number(feeSummary.pending_count || 0)} invoice(s) due</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Homework Due</p>
                      <p className="mt-2 text-3xl font-bold">{upcomingHw.length}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{homework.length} total assigned</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                      <BookOpen className="h-5 w-5 text-violet-600" />
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fees Paid</p>
                      <p className="mt-2 text-3xl font-bold">{formatCurrency(feeSummary.paid_total)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{paidFees.length} payment(s)</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </GlowCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <GlowCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold"><ClipboardList className="h-5 w-5 text-primary" /> Recent Attendance</h2>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setTab("attendance")}>View all</button>
                  </div>
                  {attendance.slice(0, 5).map((a) => (
                    <div key={String(a.id)} className="flex items-center justify-between border-b border-border/40 py-2.5 last:border-0">
                      <span className="text-sm">{new Date(String(a.attendance_date)).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                      <StatusBadge status={String(a.status)} />
                    </div>
                  ))}
                  {!attendance.length && <EmptyState icon={ClipboardList} title="No attendance yet" desc="Records appear here once your class teacher marks daily attendance." />}
                </GlowCard>

                <GlowCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold"><CreditCard className="h-5 w-5 text-amber-600" /> Fee Status</h2>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setTab("fees")}>View all</button>
                  </div>
                  {fees.slice(0, 5).map((f) => (
                    <div key={String(f.id)} className="flex items-center justify-between gap-3 border-b border-border/40 py-2.5 last:border-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{feeLabel(f)}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {f.due_date ? new Date(String(f.due_date)).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">{formatCurrency(f.status === "paid" ? (f.paid_amount || f.amount) : f.amount)}</p>
                        <StatusBadge status={String(f.status)} />
                      </div>
                    </div>
                  ))}
                  {!fees.length && <EmptyState icon={CreditCard} title="No fee invoices" desc="Fee invoices from the school office will appear here." />}
                </GlowCard>

                <GlowCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold"><BookOpen className="h-5 w-5 text-violet-600" /> Homework</h2>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setTab("homework")}>View all</button>
                  </div>
                  {homework.slice(0, 4).map((h) => (
                    <div key={String(h.id)} className="border-b border-border/40 py-2.5 last:border-0">
                      <p className="text-sm font-medium">{String(h.title)}</p>
                      <p className="text-xs text-muted-foreground">
                        {String(h.subject || "General")} • Due {h.due_date ? new Date(String(h.due_date)).toLocaleDateString() : "TBD"}
                      </p>
                    </div>
                  ))}
                  {!homework.length && <EmptyState icon={BookOpen} title="No homework posted" desc="Assignments from teachers will show up here when published." />}
                </GlowCard>

                <GlowCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold"><Calendar className="h-5 w-5 text-emerald-600" /> Exam Results</h2>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setTab("results")}>View all</button>
                  </div>
                  {marks.slice(0, 4).map((m) => (
                    <div key={String(m.id)} className="flex items-center justify-between border-b border-border/40 py-2.5 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{String(m.subject || m.exam_name)}</p>
                        <p className="text-xs text-muted-foreground">{String(m.exam_name || "")}</p>
                      </div>
                      <p className="text-sm font-bold">{String(m.marks_obtained)}/{String(m.max_marks)} <span className="text-muted-foreground">({String(m.grade || "—")})</span></p>
                    </div>
                  ))}
                  {!marks.length && <EmptyState icon={Calendar} title="No marks published" desc="Exam results will appear here once published by the school." />}
                </GlowCard>
              </div>

              {transport && (
                <GlowCard className="mt-6 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <Bus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold">School Transport</h2>
                      <p className="text-sm text-muted-foreground">
                        Route: <strong>{String(transport.route_name)}</strong>
                        {transport.stop_name ? ` • Stop: ${String(transport.stop_name)}` : ""}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              )}
            </>
          )}

          {/* Attendance tab */}
          {tab === "attendance" && (
            <GlowCard className="p-5">
              <h2 className="mb-4 text-lg font-bold">Attendance History</h2>
              {attStats.total ? (
                <div className="mb-6 flex flex-wrap gap-3">
                  {(["present", "absent", "late", "half_day"] as const).map((s) => (
                    Number(attStats[s]) > 0 && (
                      <div key={s} className="rounded-xl bg-muted/60 px-4 py-2 text-sm">
                        <span className="capitalize">{s.replace("_", " ")}</span>: <strong>{attStats[s]}</strong>
                      </div>
                    )
                  ))}
                  {attStats.rate != null && (
                    <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                      Attendance rate: <strong>{attStats.rate}%</strong> (last 30 days)
                    </div>
                  )}
                </div>
              ) : null}
              <div className="space-y-2">
                {attendance.map((a) => (
                  <div key={String(a.id)} className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3">
                    <span className="text-sm font-medium">
                      {new Date(String(a.attendance_date)).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <StatusBadge status={String(a.status)} />
                  </div>
                ))}
              </div>
              {!attendance.length && <EmptyState icon={ClipboardList} title="No attendance records" desc="Your daily attendance will be recorded by class teachers." />}
            </GlowCard>
          )}

          {/* Fees tab */}
          {tab === "fees" && (
            <div className="space-y-6">
              {isParent && (
                <GlowCard className="border-amber-200/60 bg-amber-50/50 p-4">
                  <p className="text-sm text-amber-900">
                    You are viewing fees for <strong>{String(student?.name || account.student_name)}</strong>.
                    Pay pending invoices online or print receipts after payment.
                  </p>
                </GlowCard>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <GlowCard className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Pending</p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">{formatCurrency(feeSummary.pending_total)}</p>
                </GlowCard>
                <GlowCard className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrency(feeSummary.paid_total)}</p>
                </GlowCard>
                <GlowCard className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Pending Invoices</p>
                  <p className="mt-1 text-2xl font-bold">{Number(feeSummary.pending_count || 0)}</p>
                </GlowCard>
              </div>

              {pendingFees.length > 0 && (
                <GlowCard className="p-5">
                  <h3 className="mb-4 font-bold text-amber-700">Due Payments</h3>
                  {pendingFees.map((f) => (
                    <div key={String(f.id)} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-3 last:border-0">
                      <div>
                        <p className="font-medium">{feeLabel(f)}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {f.due_date ? new Date(String(f.due_date)).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(f.amount)}</p>
                          <StatusBadge status="pending" />
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl"
                          disabled={payingId === String(f.id)}
                          onClick={() => payOnline(f)}
                        >
                          {payingId === String(f.id) ? "Processing..." : "Pay Online"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <p className="mt-4 text-xs text-muted-foreground">You can also pay fees at the school office or contact the accounts department.</p>
                </GlowCard>
              )}

              <GlowCard className="p-5">
                <h3 className="mb-4 font-bold">Payment History</h3>
                {paidFees.map((f) => (
                  <div key={String(f.id)} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-3 last:border-0">
                    <div>
                      <p className="font-medium">{feeLabel(f)}</p>
                      <p className="text-xs text-muted-foreground">
                        Paid {f.paid_at ? new Date(String(f.paid_at)).toLocaleDateString() : "—"}
                        {f.payment_mode ? ` • ${String(f.payment_mode)}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(f.paid_amount || f.amount)}</p>
                        <StatusBadge status="paid" />
                      </div>
                      <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => printReceipt(f)}>
                        <Printer className="h-4 w-4" /> Print Receipt
                      </Button>
                    </div>
                  </div>
                ))}
                {!paidFees.length && !pendingFees.length && (
                  <EmptyState icon={CreditCard} title="No fee records" desc="Invoices and payment history will appear here." />
                )}
              </GlowCard>
            </div>
          )}

          {/* Homework tab */}
          {tab === "homework" && (
            <GlowCard className="p-5">
              <h2 className="mb-4 text-lg font-bold">Homework & Assignments</h2>
              <div className="space-y-3">
                {homework.map((h) => (
                  <div key={String(h.id)} className="rounded-xl border border-border/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{String(h.title)}</p>
                        <p className="text-sm text-muted-foreground">{String(h.subject || "General")}</p>
                      </div>
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                        Due {h.due_date ? new Date(String(h.due_date)).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                    {h.description ? <p className="mt-2 text-sm text-muted-foreground">{String(h.description)}</p> : null}
                    {Array.isArray(h.attachments) && (h.attachments as { url?: string; name?: string }[]).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(h.attachments as { url?: string; name?: string }[]).map((a, idx) => (
                          a.url ? (
                            <a key={idx} href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline">
                              {a.name || "Attachment"}
                            </a>
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!homework.length && <EmptyState icon={BookOpen} title="No homework" desc="Check back when teachers post new assignments." />}
            </GlowCard>
          )}

          {/* Results tab */}
          {tab === "results" && (
            <GlowCard className="p-5">
              <h2 className="mb-4 text-lg font-bold">Exam Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Exam</th>
                      <th className="pb-3 pr-4 font-medium">Subject</th>
                      <th className="pb-3 pr-4 font-medium">Marks</th>
                      <th className="pb-3 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m) => (
                      <tr key={String(m.id)} className="border-b border-border/40">
                        <td className="py-3 pr-4">{String(m.exam_name || "—")}</td>
                        <td className="py-3 pr-4">{String(m.subject || "—")}</td>
                        <td className="py-3 pr-4 font-semibold">{String(m.marks_obtained)}/{String(m.max_marks)}</td>
                        <td className="py-3"><StatusBadge status={String(m.grade || "—")} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!marks.length && <EmptyState icon={Calendar} title="No results yet" desc="Published exam marks will appear in this table." />}
            </GlowCard>
          )}

          {/* Timetable tab */}
          {tab === "timetable" && (
            <GlowCard className="p-5">
              <h2 className="mb-4 text-lg font-bold">Weekly Timetable</h2>
              {Object.keys(timetableByDay).length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].filter((d) => timetableByDay[d]?.length).map((d) => (
                    <div key={d} className="rounded-xl border border-border/50 p-4">
                      <h3 className="mb-3 font-bold text-primary">{dayName(d)}</h3>
                      <div className="space-y-2">
                        {(timetableByDay[d] || []).map((slot) => (
                          <div key={String(slot.id)} className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                            <p className="font-medium">Period {String(slot.period_number)} — {String(slot.subject)}</p>
                            {slot.teacher_name ? <p className="text-xs text-muted-foreground">{String(slot.teacher_name)}</p> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Clock} title="No timetable" desc="Your class timetable will appear here once configured by admin." />
              )}
            </GlowCard>
          )}

          {/* Library tab */}
          {tab === "library" && (
            <GlowCard className="p-5">
              <h2 className="mb-4 text-lg font-bold">Library Books</h2>
              <div className="space-y-3">
                {library.map((item) => (
                  <div key={String(item.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 px-4 py-3">
                    <div>
                      <p className="font-medium">{String(item.book_title || "Book")}</p>
                      {item.author ? <p className="text-xs text-muted-foreground">{String(item.author)}</p> : null}
                      <p className="text-xs text-muted-foreground">
                        Issued {item.issued_at ? new Date(String(item.issued_at)).toLocaleDateString() : "—"}
                        {item.due_date ? ` • Due ${new Date(String(item.due_date)).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={String(item.status || "issued")} />
                  </div>
                ))}
              </div>
              {!library.length && (
                <EmptyState icon={Library} title="No library activity" desc="Books issued to the student will appear here." />
              )}
            </GlowCard>
          )}
        </>
      )}
    </PortalShell>
  );
}
