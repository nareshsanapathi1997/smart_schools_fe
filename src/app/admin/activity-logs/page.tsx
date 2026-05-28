"use client";

import { useEffect, useState } from "react";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { useAdminTable } from "@/hooks/useAdminTable";
import api from "@/lib/api";

interface ActivityLog {
  id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const table = useAdminTable(logs, ["action", "entity_type", "user_name", "user_email"]);

  useEffect(() => {
    api.get("/cms/activity-logs").then((r) => setLogs(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Activity Logs</h1>
      <p className="mt-1 text-muted-foreground">Admin actions and audit trail</p>
      <div className="mt-8">
        <AdminTableToolbar search={table.search} onSearchChange={table.setSearch} total={table.total} page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} placeholder="Search logs..." />
        <AdminListTable
          rows={table.paginated}
          rowKey={(l) => l.id}
          emptyMessage="No activity logged yet"
          columns={[
            { key: "created_at", label: "Time", render: (l) => new Date(l.created_at).toLocaleString() },
            { key: "user_name", label: "User", render: (l) => l.user_name || "System" },
            { key: "action", label: "Action" },
            { key: "entity_type", label: "Entity", render: (l) => l.entity_type || "—" },
          ]}
        />
      </div>
    </div>
  );
}
