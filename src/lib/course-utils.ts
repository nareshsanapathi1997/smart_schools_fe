export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  class_level?: string;
  subjects?: string[] | string;
  features?: string[] | string;
  fee_structure?: { annual?: string; monthly?: string; admission?: string };
  eligibility?: string;
  duration?: string;
  image_url?: string;
  is_featured?: boolean;
  sort_order?: number;
}

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    }
    return value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function parseListText(value: unknown): string[] {
  if (typeof value !== "string") return parseJsonArray(value);
  return value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
}

export function formatListForEdit(value: unknown): string {
  return parseJsonArray(value).join("\n");
}

export function courseToForm(row: Record<string, unknown>) {
  const fee = (row.fee_structure || {}) as { annual?: string };
  return {
    ...row,
    fee_annual: fee.annual || "",
    subjects_text: formatListForEdit(row.subjects),
    features_text: formatListForEdit(row.features),
  };
}

export function formToCoursePayload(data: Record<string, unknown>) {
  const { fee_annual, subjects_text, features_text, ...rest } = data;
  return {
    ...rest,
    fee_structure: {
      annual: String(fee_annual || "Contact us"),
    },
    subjects: parseListText(subjects_text),
    features: parseListText(features_text),
    sort_order: parseInt(String(rest.sort_order || 0), 10) || 0,
    is_active: rest.is_active !== false && rest.is_active !== "false",
    is_featured: Boolean(rest.is_featured),
  };
}
