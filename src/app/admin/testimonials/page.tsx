"use client";

import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { PLACEHOLDER } from "@/lib/images";

export default function AdminTestimonialsPage() {
  return (
    <ResourceCrud
      title="Testimonials"
      subtitle="Manage parent and student testimonials"
      endpoint="/cms/testimonials"
      deleteEndpoint="/cms/testimonials"
      imageFallback={PLACEHOLDER.testimonial}
      fetchParams={{ all: "true" }}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "role", label: "Role" },
        { key: "content", label: "Testimonial", type: "textarea", required: true },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "image_url", label: "Photo URL", type: "image" },
        { key: "is_featured", label: "Featured", type: "checkbox" },
        { key: "is_active", label: "Active", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "rating", label: "Rating" },
      ]}
    />
  );
}
