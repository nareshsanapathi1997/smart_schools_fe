"use client";

import { ResourceCrud } from "@/components/admin/ResourceCrud";
import { PLACEHOLDER } from "@/lib/images";
import { eventToForm, formToEventPayload } from "@/lib/event-utils";

export default function AdminEventsPage() {
  return (
    <ResourceCrud
      title="Events"
      subtitle="Manage events listing and detail pages. Short description shows on cards; full details on the event page. Highlights: one per line."
      endpoint="/cms/events"
      deleteEndpoint="/cms/events"
      fetchParams={{ all: "true" }}
      defaultValues={{ is_active: true, is_featured: false }}
      multipart
      imageFallback={PLACEHOLDER.event}
      fields={[
        { key: "title", label: "Event Title", required: true },
        { key: "slug", label: "URL Slug (e.g. annual-day-2026)", placeholder: "auto-generated if empty on create" },
        { key: "description", label: "Short Summary (listing card)", type: "textarea", rows: 2 },
        { key: "details", label: "Full Details (detail page)", type: "textarea", rows: 6 },
        {
          key: "highlights_text",
          label: "Highlights (one per line)",
          type: "textarea",
          rows: 4,
          placeholder: "Cultural performances\nAward ceremony\nChief guest address",
        },
        { key: "location", label: "Venue / Location" },
        { key: "event_date", label: "Start Date", type: "date", required: true },
        { key: "end_date", label: "End Date (optional)", type: "date" },
        { key: "sort_order", label: "Display Order", type: "number" },
        { key: "image_url", label: "Event Image", type: "image" },
        { key: "is_featured", label: "Featured", type: "checkbox" },
        { key: "is_active", label: "Active (visible on website)", type: "checkbox" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "location", label: "Location" },
        { key: "event_date", label: "Date", render: (r) => String(r.event_date || "").slice(0, 10) },
      ]}
      transformEdit={eventToForm}
      transformSubmit={formToEventPayload}
    />
  );
}
