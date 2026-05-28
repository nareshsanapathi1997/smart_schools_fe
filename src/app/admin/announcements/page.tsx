"use client";

import { useMemo } from "react";
import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { useLookups } from "@/hooks/useLookups";

export default function AdminAnnouncementsPage() {
  const { options: typeOptions } = useLookups("announcement_type", { all: true });

  const fields = useMemo(
    () => [
      { key: "title", label: "Title", required: true },
      { key: "content", label: "Content", type: "textarea" as const },
      {
        key: "type",
        label: "Type",
        type: "select" as const,
        options: typeOptions.length
          ? typeOptions
          : [
              { label: "General", value: "general" },
              { label: "Admission", value: "admission" },
              { label: "Event", value: "event" },
              { label: "News", value: "news" },
            ],
      },
      { key: "is_pinned", label: "Pinned", type: "checkbox" as const },
      { key: "is_active", label: "Active", type: "checkbox" as const },
    ],
    [typeOptions]
  );

  return (
    <ResourceCrud
      title="Announcements"
      subtitle="Manage ticker announcements on the website header"
      endpoint="/cms/announcements"
      deleteEndpoint="/cms/announcements"
      fetchParams={{ all: "true" }}
      fields={fields}
      columns={[
        { key: "title", label: "Title" },
        { key: "type", label: "Type" },
        { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
      ]}
      imageKey=""
    />
  );
}
