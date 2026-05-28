"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LookupCrud } from "@/components/admin/LookupCrud";
import { LookupType } from "@/lib/lookups";

const tabs: { id: LookupType; label: string }[] = [
  { id: "enquiry_status", label: "Enquiry Statuses" },
  { id: "announcement_type", label: "Announcement Types" },
  { id: "gallery_category", label: "Gallery Categories" },
  { id: "achievement_category", label: "Achievement Categories" },
];

export default function AdminLookupsPage() {
  const [tab, setTab] = useState<LookupType>("enquiry_status");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Other Lookups</h1>
        <p className="mt-1 text-muted-foreground">Manage statuses, categories, and types used across the admin panel and website</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              tab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <LookupCrud type={tab} showColor={tab === "enquiry_status"} hideHeader />
    </div>
  );
}
