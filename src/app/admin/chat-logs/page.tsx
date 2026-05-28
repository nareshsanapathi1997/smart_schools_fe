"use client";

import { useEffect, useState } from "react";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import api from "@/lib/api";

interface ChatLog {
  id: string;
  session_id: string;
  channel: string;
  user_message?: string;
  bot_response?: string;
  language: string;
  escalated: boolean;
  created_at: string;
}

export default function AdminChatLogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/chatbot/logs", { params: { page, limit: 50, search: search || undefined } })
      .then((r) => {
        setLogs(r.data.data || []);
        if (r.data.pagination) {
          setTotalPages(r.data.pagination.totalPages || 1);
          setTotal(r.data.pagination.total || 0);
        }
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Chat Logs</h1>
      <p className="mt-1 text-muted-foreground">Website and WhatsApp chatbot conversations</p>
      <div className="mt-8">
        <AdminTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} total={total} page={page} totalPages={totalPages} onPageChange={setPage} placeholder="Search chats..." />
        {loading ? (
          <p className="py-10 text-center text-muted-foreground">Loading...</p>
        ) : (
          <AdminListTable
            rows={logs}
            rowKey={(l) => l.id}
            emptyMessage="No chat logs yet"
            rowClassName={(l) => (l.escalated ? "bg-amber-500/5" : undefined)}
            columns={[
              { key: "created_at", label: "Time", render: (l) => new Date(l.created_at).toLocaleString() },
              { key: "channel", label: "Channel", render: (l) => <span className="capitalize">{l.channel}</span> },
              { key: "user_message", label: "User", className: "max-w-xs", render: (l) => <span className="line-clamp-2">{l.user_message || "—"}</span> },
              { key: "bot_response", label: "Bot Reply", className: "max-w-md", render: (l) => <span className="line-clamp-2">{l.bot_response || "—"}</span> },
              { key: "escalated", label: "Escalated", render: (l) => (l.escalated ? "Yes" : "No") },
            ]}
          />
        )}
      </div>
    </div>
  );
}
