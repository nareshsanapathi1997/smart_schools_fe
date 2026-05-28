"use client";

import { useMemo } from "react";
import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { PLACEHOLDER } from "@/lib/images";
import { useLookups } from "@/hooks/useLookups";

export default function AdminAchievementsPage() {
  const { options: categoryOptions } = useLookups("achievement_category", { all: true });

  const fields = useMemo(
    () => [
      {
        key: "entry_type",
        label: "Entry Type",
        type: "select" as const,
        required: true,
        options: [
          { label: "Top Student (Results page grid)", value: "topper" },
          { label: "School Award / Recognition", value: "award" },
        ],
      },
      { key: "title", label: "Title", required: true },
      { key: "student_name", label: "Student Name (required for toppers)" },
      { key: "rank", label: "Rank Label (e.g. School Rank 1, State Rank 3)" },
      {
        key: "rank_order",
        label: "Display Order (1 = top, up to 24 per year)",
        type: "number" as const,
      },
      { key: "year", label: "Year", type: "number" as const, required: true },
      { key: "description", label: "Description", type: "textarea" as const },
      {
        key: "category",
        label: "Category",
        type: "select" as const,
        options: categoryOptions.length
          ? categoryOptions
          : [
              { label: "Academic", value: "academic" },
              { label: "Sports", value: "sports" },
              { label: "Award", value: "award" },
              { label: "Competition", value: "competition" },
            ],
      },
      { key: "image_url", label: "Photo", type: "image" as const },
      { key: "is_featured", label: "Featured on Home", type: "checkbox" as const },
    ],
    [categoryOptions]
  );

  return (
    <ResourceCrud
      title="Results & Achievements"
      subtitle="Add Top Students for the Results page (entry type: Top Student, set Year + Display Order 1–24). School awards use entry type: School Award."
      endpoint="/cms/achievements"
      deleteEndpoint="/cms/achievements"
      multipart
      imageFallback={PLACEHOLDER.achievement}
      fetchParams={{ all: "true" }}
      fields={fields}
      columns={[
        { key: "entry_type", label: "Type" },
        { key: "student_name", label: "Student" },
        { key: "rank_order", label: "Order" },
        { key: "rank", label: "Rank" },
        { key: "year", label: "Year" },
      ]}
      transformSubmit={(data) => ({
        ...data,
        rank_order: parseInt(String(data.rank_order || 0), 10) || 0,
        year: parseInt(String(data.year || new Date().getFullYear()), 10),
        entry_type: data.entry_type || (data.student_name ? "topper" : "award"),
      })}
    />
  );
}
