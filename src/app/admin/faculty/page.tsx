"use client";

import { useMemo } from "react";
import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { PLACEHOLDER } from "@/lib/images";
import { useLookups } from "@/hooks/useLookups";

export default function AdminFacultyPage() {
  const { options: deptOptions } = useLookups("department", { all: true });

  const fields = useMemo(
    () => [
      { key: "name", label: "Name", required: true },
      { key: "slug", label: "URL Slug", placeholder: "auto-generated if empty" },
      { key: "sort_order", label: "Sort Order", type: "number" as const },
      { key: "designation", label: "Designation" },
      {
        key: "department",
        label: "Department",
        type: "select" as const,
        options: deptOptions.length
          ? deptOptions
          : [
              { label: "Administration", value: "Administration" },
              { label: "Mathematics", value: "Mathematics" },
              { label: "Science", value: "Science" },
            ],
      },
      { key: "qualification", label: "Qualification" },
      { key: "experience", label: "Experience" },
      { key: "bio", label: "Bio", type: "textarea" as const },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "image_url", label: "Photo", type: "image" as const },
      { key: "is_featured", label: "Featured", type: "checkbox" as const },
      { key: "is_active", label: "Active", type: "checkbox" as const },
    ],
    [deptOptions]
  );

  return (
    <ResourceCrud
      title="Faculty"
      subtitle="Manage faculty profiles displayed on the website"
      endpoint="/faculty"
      fetchParams={{ all: "true" }}
      multipart
      imageFallback={PLACEHOLDER.faculty}
      fields={fields}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "department", label: "Department" },
        { key: "designation", label: "Role" },
        { key: "sort_order", label: "Order" },
      ]}
    />
  );
}
