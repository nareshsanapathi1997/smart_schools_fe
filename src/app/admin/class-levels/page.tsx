"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LookupCrud } from "@/components/admin/LookupCrud";

const tabs = [
  { id: "admission_class", label: "Admission Grades", subtitle: "Nursery through Class XII — used on enquiry forms" },
  { id: "course_class", label: "Course Bands", subtitle: "Primary, Middle, Secondary, Senior — used on courses" },
  { id: "subject", label: "Subjects", subtitle: "Mathematics, English, Science — used in timetable, homework, exams" },
  { id: "section", label: "Sections", subtitle: "Class sections A, B, C — used in students and ERP modules" },
] as const;

export default function AdminClassLevelsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("admission_class");
  const active = tabs.find((t) => t.id === tab)!;

  return (
    <div>
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
      <p className="mb-6 text-sm text-muted-foreground">{active.subtitle}</p>
      <LookupCrud type={tab} />
    </div>
  );
}
