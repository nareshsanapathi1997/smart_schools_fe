"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Mail, MessageSquare, Users, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { FilterPills } from "@/components/motion/FilterPills";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import api from "@/lib/api";
import { downloadCsv } from "@/lib/api-error";

interface Enquiry {
  id: string;
  student_name: string;
  parent_name: string;
  mobile: string;
  email: string;
  class_interested: string;
  status: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface LeadStats {
  new_enquiries: number;
  unread_contacts: number;
  subscribers: number;
  total_enquiries: number;
  total_contacts: number;
}

const tabs = ["Overview", "Admission Enquiries", "Contact Messages", "Newsletter"];

export default function AdminLeadsPage() {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [viewMode, setViewMode] = useAdminViewMode("list");

  useEffect(() => {
    api.get("/cms/analytics").then((r) => setStats(r.data.data)).catch(() => {});
    (async () => {
      const all: Enquiry[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const r = await api.get("/enquiries", { params: { page, limit: 100 } });
        all.push(...(r.data.data || []));
        totalPages = r.data.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);
      setEnquiries(all);
    })().catch(() => {});
    api.get("/cms/contacts", { params: { limit: 200 } }).then((r) => setContacts(r.data.data || [])).catch(() => {});
    api.get("/cms/newsletter/subscribers").then((r) => setSubscribers(r.data.data || [])).catch(() => {});
  }, []);

  const exportFile = async (endpoint: string, filename: string) => {
    try {
      await downloadCsv(endpoint, filename);
    } catch {
      alert("Export failed. Please log in again.");
    }
  };

  const toggleSubscriber = async (id: string, is_active: boolean) => {
    await api.patch(`/cms/newsletter/subscribers/${id}`, { is_active });
    setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, is_active } : s)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leads Report</h1>
          <p className="mt-1 text-muted-foreground">
            All form submissions — admission enquiries, contact messages, and newsletter signups
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => exportFile("/enquiries/export", "admission-enquiries.csv")}>
            <Download className="h-4 w-4" /> Enquiries CSV
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => exportFile("/cms/contacts/export", "contact-messages.csv")}>
            <Download className="h-4 w-4" /> Contacts CSV
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => exportFile("/cms/newsletter/export", "newsletter-subscribers.csv")}>
            <Download className="h-4 w-4" /> Newsletter CSV
          </Button>
        </div>
      </div>

      <FilterPills options={tabs} value={tab} onChange={setTab} layoutId="leads-tab" className="mt-8" />

      {tab !== "Overview" && (
        <div className="mt-4 flex justify-end">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      )}

      {tab === "Overview" && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "New Enquiries", value: stats?.new_enquiries ?? 0, icon: MessageSquare },
            { label: "Unread Contacts", value: stats?.unread_contacts ?? 0, icon: Mail },
            { label: "Total Enquiries", value: stats?.total_enquiries ?? enquiries.length, icon: FileSpreadsheet },
            { label: "Newsletter Subscribers", value: stats?.subscribers ?? subscribers.length, icon: Users },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlowCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
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
      )}

      {tab === "Admission Enquiries" && (
        <div className="mt-8">
          {viewMode === "list" ? (
            <AdminListTable
              rows={enquiries}
              rowKey={(e) => e.id}
              emptyMessage="No admission enquiries yet"
              columns={[
                { key: "student_name", label: "Student" },
                { key: "parent_name", label: "Parent" },
                { key: "mobile", label: "Mobile" },
                { key: "email", label: "Email" },
                { key: "class_interested", label: "Class" },
                { key: "status", label: "Status", render: (e) => <span className="capitalize">{e.status}</span> },
                { key: "created_at", label: "Date", render: (e) => new Date(e.created_at).toLocaleString() },
              ]}
            />
          ) : (
            <div className="space-y-3">
              {enquiries.map((e) => (
                <GlowCard key={e.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{e.student_name}</p>
                      <p className="text-sm text-muted-foreground">Parent: {e.parent_name} • Class: {e.class_interested}</p>
                      <p className="text-sm text-muted-foreground">{e.mobile} • {e.email}</p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">{e.status}</span>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </GlowCard>
              ))}
              {!enquiries.length && <GlowCard className="py-16 text-center text-muted-foreground">No admission enquiries yet</GlowCard>}
            </div>
          )}
        </div>
      )}

      {tab === "Contact Messages" && (
        <div className="mt-8">
          {viewMode === "list" ? (
            <AdminListTable
              rows={contacts}
              rowKey={(c) => c.id}
              emptyMessage="No contact messages yet"
              rowClassName={(c) => (!c.is_read ? "bg-primary/5" : undefined)}
              columns={[
                {
                  key: "is_read",
                  label: "Status",
                  render: (c) =>
                    c.is_read ? "Read" : <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">New</span>,
                },
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone", render: (c) => c.phone || "—" },
                { key: "subject", label: "Subject", render: (c) => c.subject || "—" },
                { key: "message", label: "Message", className: "max-w-xs", render: (c) => <span className="line-clamp-2">{c.message}</span> },
                { key: "created_at", label: "Date", render: (c) => new Date(c.created_at).toLocaleString() },
              ]}
            />
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <GlowCard key={c.id} className={`p-5 ${!c.is_read ? "ring-2 ring-primary/20" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {c.name}
                        {!c.is_read && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">New</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{c.email} {c.phone && `• ${c.phone}`}</p>
                      {c.subject && <p className="mt-1 text-sm font-medium">{c.subject}</p>}
                      <p className="mt-2 text-sm leading-relaxed">{c.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                </GlowCard>
              ))}
              {!contacts.length && <GlowCard className="py-16 text-center text-muted-foreground">No contact messages yet</GlowCard>}
            </div>
          )}
        </div>
      )}

      {tab === "Newsletter" && (
        <div className="mt-8">
          {viewMode === "list" ? (
            <AdminListTable
              rows={subscribers}
              rowKey={(s) => s.id}
              emptyMessage="No subscribers yet"
              columns={[
                { key: "email", label: "Email" },
                {
                  key: "is_active",
                  label: "Status",
                  render: (s) => (s.is_active ? "Active" : "Inactive"),
                },
                { key: "created_at", label: "Subscribed", render: (s) => new Date(s.created_at).toLocaleString() },
              ]}
              actions={(s) => (
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => toggleSubscriber(s.id, !s.is_active)}>
                  {s.is_active ? "Deactivate" : "Activate"}
                </Button>
              )}
            />
          ) : (
            <div className="space-y-3">
              {subscribers.map((s) => (
                <GlowCard key={s.id} className="flex items-center justify-between p-5">
                  <p className="font-medium">{s.email}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                </GlowCard>
              ))}
              {!subscribers.length && <GlowCard className="py-16 text-center text-muted-foreground">No subscribers yet</GlowCard>}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/enquiries" className="text-primary hover:underline">Manage enquiries →</Link>
        <Link href="/admin/contacts" className="text-primary hover:underline">Manage contacts →</Link>
      </div>
    </div>
  );
}
