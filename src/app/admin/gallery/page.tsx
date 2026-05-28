"use client";

import { useMemo } from "react";
import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { PLACEHOLDER } from "@/lib/images";
import { useLookups } from "@/hooks/useLookups";

function toGalleryPayload(data: Record<string, unknown>) {
  return {
    ...data,
    is_featured: data.is_featured === true || data.is_featured === "true",
  };
}

export default function AdminGalleryPage() {
  const { options: categoryOptions } = useLookups("gallery_category", { all: true });

  const fields = useMemo(
    () => [
      { key: "title", label: "Title", required: true },
      { key: "description", label: "Description", type: "textarea" as const },
      { key: "media_url", label: "Media URL (image path or YouTube embed URL)", type: "image" as const },
      {
        key: "media_type",
        label: "Type",
        type: "select" as const,
        options: [
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
        ],
      },
      {
        key: "category",
        label: "Category",
        type: "select" as const,
        options: categoryOptions.length
          ? categoryOptions
          : [
              { label: "Campus", value: "Campus" },
              { label: "Events", value: "Events" },
              { label: "Sports", value: "Sports" },
            ],
      },
      { key: "sort_order", label: "Display Order", type: "number" as const },
      { key: "is_featured", label: "Featured", type: "checkbox" as const },
    ],
    [categoryOptions]
  );

  return (
    <ResourceCrud
      title="Gallery"
      subtitle="Manage photos and videos. Upload an image file or paste a media URL (YouTube embed for videos)."
      endpoint="/gallery"
      fetchParams={{}}
      defaultValues={{ media_type: "image", category: categoryOptions[0]?.value || "Campus", is_featured: false }}
      multipart
      imageKey="media_url"
      imageFallback={PLACEHOLDER.gallery}
      fields={fields}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "media_type", label: "Type" },
      ]}
      transformSubmit={toGalleryPayload}
    />
  );
}
