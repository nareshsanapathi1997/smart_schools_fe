"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Users, Bot, Mail, TrendingUp,
  GraduationCap, CreditCard, ClipboardCheck, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { GlowCard } from "@/components/motion/AnimatedSection";
import Link from "next/link";
import api from "@/lib/api";

interface CmsAnalytics {
  new_enquiries: number;
  unread_contacts: number;
  chats_today: number;
  subscribers: number;
  recent_enquiries: Array<{ student_name: string; class_interested: string; created_at: string }>;
}

interface ErpAnalytics {
  active_students: number;
  fee_pending: number;
  fee_pending_count?: number;
  attendance_rate: number | null;
  open_enquiries: number;
}

function formatCurrency(n?: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const [cms, setCms] = useState<CmsAnalytics | null>(null);
  const [erp, setErp] = useState<ErpAnalytics | null>(null);

  useEffect(() => {
    api.get("/cms/analytics").then((res) => setCms(res.data.data)).catch(() => {});
    api.get("/erp/analytics/dashboard").then((res) => setErp(res.data.data)).catch(() => {});
  }, []);

  const cmsStats = [
    { label: "New Enquiries", value: cms?.new_enquiries ?? 0, icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
    { label: "Unread Contacts", value: cms?.unread_contacts ?? 0, icon: Mail, gradient: "from-amber-500 to-orange-500" },
    { label: "Chats Today", value: cms?.chats_today ?? 0, icon: Bot, gradient: "from-violet-500 to-purple-600" },
    { label: "Subscribers", value: cms?.subscribers ?? 0, icon: Users, gradient: "from-emerald-500 to-teal-500" },
  ];

  const erpStats = [
    { label: "Active Students", value: erp?.active_students ?? 0, icon: GraduationCap, gradient: "from-indigo-500 to-blue-600", format: "number" as const },
    { label: "Fee Pending", value: erp?.fee_pending ?? 0, icon: CreditCard, gradient: "from-rose-500 to-orange-500", format: "currency" as const },
    { label: "Attendance Rate (30d)", value: erp?.attendance_rate ?? 0, icon: ClipboardCheck, gradient: "from-emerald-500 to-green-600", format: "percent" as const },
    { label: "Open Enquiries", value: erp?.open_enquiries ?? 0, icon: UserPlus, gradient: "from-violet-500 to-fuchsia-600", format: "number" as const },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Overview of your school platform</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/erp-analytics">
              <Button variant="outline" className="rounded-xl">ERP Analytics</Button>
            </Link>
            <Link href="/admin/features">
              <Button variant="outline" className="rounded-xl">Browse Features</Button>
            </Link>
            <Link href="/admin/leads">
              <Button variant="outline" className="rounded-xl">View Leads Report</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">ERP Overview</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {erpStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }}>
            <GlowCard className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-soft`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {s.format === "currency" ? formatCurrency(Number(s.value)) : s.format === "percent" ? (
                      erp?.attendance_rate != null ? `${s.value}%` : "—"
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

      <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Website & Communication</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cmsStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}>
            <GlowCard className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-soft`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={String(s.value)} />
                  </p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8">
        <GlowCard className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/50 px-6 py-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-bold">Recent Enquiries</h2>
          </div>
          <div className="p-6">
            {cms?.recent_enquiries?.length ? (
              <div className="space-y-3">
                {cms.recent_enquiries.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div>
                      <p className="font-medium">{e.student_name}</p>
                      <p className="text-sm text-muted-foreground">{e.class_interested}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent enquiries</p>
            )}
          </div>
        </GlowCard>
      </motion.div>
    </div>
  );
}
