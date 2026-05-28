import { formatListForEdit, parseJsonArray, parseListText } from "@/lib/course-utils";

export interface SchoolEvent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  details?: string;
  highlights?: string[] | string;
  location?: string;
  event_date: string;
  end_date?: string;
  image_url?: string;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export function eventToForm(row: Record<string, unknown>) {
  const eventDate = row.event_date ? String(row.event_date).slice(0, 10) : "";
  const endDate = row.end_date ? String(row.end_date).slice(0, 10) : "";
  return {
    ...row,
    event_date: eventDate,
    end_date: endDate,
    highlights_text: formatListForEdit(row.highlights),
  };
}

export function formToEventPayload(data: Record<string, unknown>) {
  const { highlights_text, ...rest } = data;
  return {
    ...rest,
    highlights: parseListText(highlights_text),
    sort_order: parseInt(String(rest.sort_order || 0), 10) || 0,
    is_active: rest.is_active !== false && rest.is_active !== "false",
    is_featured: Boolean(rest.is_featured),
    end_date: rest.end_date || null,
  };
}

export { parseJsonArray };
