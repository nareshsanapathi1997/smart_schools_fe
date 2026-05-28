"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, CreditCard, ClipboardCheck, UserPlus, Users, Wallet, BarChart3,
} from "lucide-react";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import api from "@/lib/api";

interface ErpAnalytics {
  active_students: number;
  fee_pending: number;
  fee_collected: number;
  fee_pending_count: number;
  attendance_30d?: Record<string, number>;
  attendance_rate: number | null;
  payroll_staff: number;
  open_enquiries: number;
}

function formatCurrency(n?: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function ErpAnalyticsPage() {
  const [data, setData] = useState<ErpAnalytics | null>(null);

  useEffect(() => {
    api.get("/erp/analytics/dashboard").then((r) => setData(r.data.data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Active Students", value: data?.active_students ?? 0, icon: GraduationCap, gradient: "from-indigo-500 to-blue-600", format: "number" as const },
    { label: "Fee Pending", value: data?.fee_pending ?? 0, icon: CreditCard, gradient: "from-rose-500 to-orange-500", format: "currency" as const },
    { label: "Fee Collected", value: data?.fee_collected ?? 0, icon: Wallet, gradient: "from-emerald-500 to-teal-500", format: "currency" as const },
    { label: "Pending Invoices", value: data?.fee_pending_count ?? 0, icon: BarChart3, gradient: "from-amber-500 to-yellow-500", format: "number" as const },
    { label: "Attendance Rate (30d)", value: data?.attendance_rate ?? 0, icon: ClipboardCheck, gradient: "from-green-500 to-emerald-600", format: "percent" as const },
    { label: "Payroll Staff", value: data?.payroll_staff ?? 0, icon: Users, gradient: "from-violet-500 to-purple-600", format: "number" as const },
    { label: "Open Enquiries", value: data?.open_enquiries ?? 0, icon: UserPlus, gradient: "from-fuchsia-500 to-pink-500", format: "number" as const },
  ];

  const att = data?.attendance_30d || {};

  return (
    <div>
      <h1 className="text-3xl font-bold">ERP Analytics</h1>
      <p className="mt-1 text-muted-foreground">School operations metrics — students, fees, attendance, and admissions</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlowCard className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-soft`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {s.format === "currency" ? formatCurrency(Number(s.value)) : s.format === "percent" ? (
                      data?.attendance_rate != null ? `${s.value}%` : "—"
                    ) : (
                      <AnimatedCounter value={String(s.value)} />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {Object.keys(att).length > 0 && (
        <GlowCard className="mt-8 p-6">
          <h2 className="mb-4 font-bold">Attendance Breakdown (Last 30 Days)</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(att).map(([status, count]) => (
              <div key={status} className="rounded-xl bg-muted/60 px-4 py-2 text-sm capitalize">
                {status.replace("_", " ")}: <strong>{count}</strong>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
