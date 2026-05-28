"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import { useAdminTable } from "@/hooks/useAdminTable";
import api from "@/lib/api";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  is_active?: boolean;
  priority?: number;
}

const emptyForm = { question: "", answer: "", category: "general", language: "en", priority: 0, is_active: true };

export default function AdminChatbotPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [analytics, setAnalytics] = useState<{ total: number; today: number; escalated: number } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const table = useAdminTable(faqs, ["question", "answer", "category"]);

  const load = () => {
    api.get("/chatbot/faqs", { params: { all: "true" } }).then((res) => setFaqs(res.data.data || [])).catch(() => {});
    api.get("/chatbot/analytics").then((res) => setAnalytics(res.data.data)).catch(() => {});
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category, language: f.language, priority: f.priority || 0, is_active: f.is_active ?? true });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/chatbot/faqs/${editing.id}`, form);
    else await api.post("/chatbot/faqs", form);
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await api.delete(`/chatbot/faqs/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Chatbot Management</h1>
            <p className="text-muted-foreground">Manage FAQs and monitor chat performance</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button className="rounded-xl" onClick={openCreate}><Plus className="h-4 w-4" /> Add FAQ</Button>
        </div>
      </div>

      {analytics && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Chats", value: analytics.total },
            { label: "Today", value: analytics.today },
            { label: "Escalated", value: analytics.escalated },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlowCard className="p-5 text-center">
                <p className="text-3xl font-bold gradient-text"><AnimatedCounter value={String(s.value)} /></p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={table.total} page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} placeholder="Search FAQs..." />
        {viewMode === "list" ? (
          <AdminListTable
            rows={table.paginated}
            rowKey={(f) => f.id}
            emptyMessage="No FAQs yet"
            columns={[
              { key: "question", label: "Question", className: "max-w-xs", render: (f) => <span className="line-clamp-2 font-medium">{f.question}</span> },
              { key: "answer", label: "Answer", className: "max-w-md", render: (f) => <span className="line-clamp-2 text-muted-foreground">{f.answer}</span> },
              { key: "category", label: "Category" },
              { key: "language", label: "Lang", render: (f) => (f.language === "te" ? "Telugu" : "English") },
            ]}
            actions={(f) => (
              <>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4" /></Button>
              </>
            )}
          />
        ) : (
          <div className="space-y-3">
            {table.paginated.map((f) => (
              <GlowCard key={f.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{f.question}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
                    <p className="mt-2 text-xs text-primary">{f.category} • {f.language}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border/50 bg-card p-6 shadow-premium" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editing ? "Edit FAQ" : "Add FAQ"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <form onSubmit={save} className="space-y-3">
                <Input className="rounded-xl" placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
                <Textarea className="rounded-xl" rows={4} placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
                <div className="flex flex-wrap gap-3">
                  <Input className="max-w-xs rounded-xl" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <select className="h-11 rounded-xl border border-border bg-background px-4 text-sm" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    <option value="en">English</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
                <Button type="submit" className="rounded-xl">{editing ? "Update FAQ" : "Add FAQ"}</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
