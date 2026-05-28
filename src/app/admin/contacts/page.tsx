"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { AdminViewToggle, useAdminViewMode } from "@/components/admin/AdminViewToggle";
import api from "@/lib/api";
import { downloadCsv } from "@/lib/api-error";

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

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [viewMode, setViewMode] = useAdminViewMode("list");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/cms/contacts", { params: { page, limit: 25, search: search || undefined } })
      .then((r) => {
        setContacts(r.data.data || []);
        if (r.data.pagination) {
          setTotalPages(r.data.pagination.totalPages || 1);
          setTotal(r.data.pagination.total || 0);
        }
      })
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page, search]);

  const markRead = async (id: string) => {
    await api.patch(`/cms/contacts/${id}`, { is_read: true });
    load();
  };

  const unread = contacts.filter((c) => !c.is_read).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="mt-1 text-muted-foreground">
            Messages from the contact form {unread > 0 && `• ${unread} unread`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminViewToggle value={viewMode} onChange={setViewMode} />
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => downloadCsv("/cms/contacts/export", "contact-messages.csv").catch(() => alert("Export failed"))}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <AdminTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} total={total} page={page} totalPages={totalPages} onPageChange={setPage} placeholder="Search messages..." />
        {loading ? (
          <p className="py-10 text-center text-muted-foreground">Loading...</p>
        ) : viewMode === "list" ? (
          <AdminListTable
            rows={contacts}
            rowKey={(c) => c.id}
            emptyMessage="No messages yet"
            rowClassName={(c) => (!c.is_read ? "bg-primary/5" : undefined)}
            columns={[
              {
                key: "is_read",
                label: "Status",
                className: "w-24",
                render: (c) =>
                  c.is_read ? (
                    <span className="text-xs text-muted-foreground">Read</span>
                  ) : (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">New</span>
                  ),
              },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone", render: (c) => c.phone || "—" },
              { key: "subject", label: "Subject", render: (c) => c.subject || "—" },
              {
                key: "message",
                label: "Message",
                className: "max-w-xs",
                render: (c) => <span className="line-clamp-2">{c.message}</span>,
              },
              {
                key: "created_at",
                label: "Date",
                render: (c) => new Date(c.created_at).toLocaleString(),
              },
            ]}
            actions={(c) =>
              !c.is_read ? (
                <Button size="sm" className="rounded-xl" onClick={() => markRead(c.id)}>
                  Mark Read
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="space-y-3">
            {contacts.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlowCard className={!c.is_read ? "ring-2 ring-primary/25" : ""}>
                  <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.is_read ? "bg-muted" : "bg-primary/10"}`}>
                        {c.is_read ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {c.name}
                          {!c.is_read && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">New</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{c.email} {c.phone && `• ${c.phone}`}</p>
                        {c.subject && <p className="mt-1 text-sm font-medium">{c.subject}</p>}
                        <p className="mt-2 text-sm leading-relaxed">{c.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                      {!c.is_read && (
                        <Button size="sm" className="mt-3 rounded-xl" onClick={() => markRead(c.id)}>
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
            {!contacts.length && (
              <GlowCard className="py-16 text-center text-muted-foreground">No messages yet</GlowCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
