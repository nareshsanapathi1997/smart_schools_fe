"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, MessageSquare, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import api from "@/lib/api";

interface DayPoint { date: string; count: number }

export default function AdminAnalyticsPage() {
  const [chat, setChat] = useState<{ total: number; today: number; escalated: number; by_channel: Array<{ channel: string; count: string }> } | null>(null);
  const [dash, setDash] = useState<{
    new_enquiries: number;
    enquiries_by_day?: DayPoint[];
    contacts_by_day?: DayPoint[];
    chats_by_day?: DayPoint[];
  } | null>(null);

  useEffect(() => {
    api.get("/chatbot/analytics").then((r) => setChat(r.data.data)).catch(() => {});
    api.get("/cms/analytics").then((r) => setDash(r.data.data)).catch(() => {});
  }, []);

  const chartData = useMemo(() => {
    const days = new Set<string>();
    (dash?.enquiries_by_day || []).forEach((d) => days.add(String(d.date).slice(0, 10)));
    (dash?.contacts_by_day || []).forEach((d) => days.add(String(d.date).slice(0, 10)));
    (dash?.chats_by_day || []).forEach((d) => days.add(String(d.date).slice(0, 10)));
    const sorted = Array.from(days).sort();
    const eq = new Map((dash?.enquiries_by_day || []).map((d) => [String(d.date).slice(0, 10), d.count]));
    const ct = new Map((dash?.contacts_by_day || []).map((d) => [String(d.date).slice(0, 10), d.count]));
    const ch = new Map((dash?.chats_by_day || []).map((d) => [String(d.date).slice(0, 10), d.count]));
    return sorted.map((date) => ({
      date: date.slice(5),
      enquiries: eq.get(date) || 0,
      contacts: ct.get(date) || 0,
      chats: ch.get(date) || 0,
    }));
  }, [dash]);

  const stats = [
    { label: "Total AI Chats", value: chat?.total ?? 0, icon: Bot, gradient: "from-violet-500 to-purple-600" },
    { label: "Chats Today", value: chat?.today ?? 0, icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
    { label: "Human Escalations", value: chat?.escalated ?? 0, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
    { label: "New Enquiries", value: dash?.new_enquiries ?? 0, icon: Users, gradient: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Platform usage and engagement metrics</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlowCard className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-soft`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold"><AnimatedCounter value={String(s.value)} /></p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <GlowCard>
            <div className="border-b border-border/50 px-6 py-4">
              <h2 className="font-bold">Last 14 Days Activity</h2>
            </div>
            <div className="h-80 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="enquiries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="contacts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chats" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>
        </motion.div>
      )}

      {chat?.by_channel && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8">
          <GlowCard>
            <div className="border-b border-border/50 px-6 py-4"><h2 className="font-bold">Chats by Channel</h2></div>
            <div className="p-6">
              {chat.by_channel.map((c) => (
                <div key={c.channel} className="flex items-center justify-between border-b border-border/40 py-3 text-sm last:border-0">
                  <span className="font-medium capitalize">{c.channel}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{c.count}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </motion.div>
      )}
    </div>
  );
}
