"use client";

import { useMemo } from "react";
import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { PLACEHOLDER } from "@/lib/images";
import { courseToForm, formToCoursePayload } from "@/lib/course-utils";
import { useLookups } from "@/hooks/useLookups";

export default function AdminCoursesPage() {
  const { options: classOptions } = useLookups("course_class", { all: true });

  const fields = useMemo(
    () => [
      { key: "title", label: "Course Title", required: true },
      { key: "slug", label: "URL Slug (e.g. primary-i-v)", placeholder: "auto-generated if empty on create" },
      { key: "description", label: "Short Description / Overview", type: "textarea" as const, rows: 3 },
      {
        key: "class_level",
        label: "Class Level",
        type: "select" as const,
        options: classOptions.length
          ? classOptions
          : [
              { label: "Primary", value: "Primary" },
              { label: "Middle", value: "Middle" },
              { label: "Secondary", value: "Secondary" },
              { label: "Senior", value: "Senior" },
            ],
      },
      { key: "duration", label: "Duration (e.g. 5 years)" },
      { key: "fee_annual", label: "Annual Fee (e.g. ₹45000/yr)", required: true },
      {
        key: "subjects_text",
        label: "Subjects (one per line)",
        type: "textarea" as const,
        rows: 4,
        placeholder: "English\nMathematics\nScience",
      },
      {
        key: "features_text",
        label: "Key Features (one per line — shown on detail page)",
        type: "textarea" as const,
        rows: 5,
        placeholder: "Smart classrooms\nActivity-based learning\nWeekly assessments",
      },
      { key: "eligibility", label: "Eligibility Criteria", type: "textarea" as const, rows: 3 },
      { key: "sort_order", label: "Display Order", type: "number" as const },
      { key: "image_url", label: "Course Image", type: "image" as const },
      { key: "is_featured", label: "Featured on Home", type: "checkbox" as const },
      { key: "is_active", label: "Active (visible on website)", type: "checkbox" as const },
    ],
    [classOptions]
  );

  return (
    <ResourceCrud
      title="Courses"
      subtitle="Manage course listings and detail pages. Features & subjects: one item per line. Slug is used in the URL (/courses/your-slug)."
      endpoint="/courses"
      fetchParams={{ all: "true" }}
      defaultValues={{ is_active: true, is_featured: false }}
      multipart
      imageFallback={PLACEHOLDER.course}
      fields={fields}
      columns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "class_level", label: "Class" },
        {
          key: "fee_annual",
          label: "Fee",
          render: (row) => {
            const fee = row.fee_structure as { annual?: string } | undefined;
            return fee?.annual || "—";
          },
        },
      ]}
      transformEdit={courseToForm}
      transformSubmit={formToCoursePayload}
    />
  );
}
