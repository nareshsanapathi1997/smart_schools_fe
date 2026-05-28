export type LookupItem = {
  id: number;
  type: string;
  code: string;
  label: string;
  metadata?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
};

export const LOOKUP_TYPES = {
  department: { title: "Departments", subtitle: "Used in faculty profiles and department filters", valueField: "label" as const },
  admission_class: { title: "Admission Classes", subtitle: "Grades shown on admission enquiry forms", valueField: "label" as const },
  course_class: { title: "Course Levels", subtitle: "Program bands for courses (Primary, Middle, etc.)", valueField: "label" as const },
  enquiry_status: { title: "Enquiry Statuses", subtitle: "Pipeline statuses for admission enquiries", valueField: "code" as const, showColor: true },
  announcement_type: { title: "Announcement Types", subtitle: "Categories for announcements and ticker", valueField: "code" as const },
  gallery_category: { title: "Gallery Categories", subtitle: "Photo and video gallery groupings", valueField: "label" as const },
  achievement_category: { title: "Achievement Categories", subtitle: "Result and award categories", valueField: "label" as const },
  subject: { title: "Subjects", subtitle: "Academic subjects for timetable, homework, and exams", valueField: "label" as const },
  section: { title: "Sections", subtitle: "Class sections (A, B, C...) used across ERP modules", valueField: "label" as const },
};

export type LookupType = keyof typeof LOOKUP_TYPES;

export function lookupValue(item: LookupItem, type: LookupType) {
  const field = LOOKUP_TYPES[type].valueField;
  return field === "code" ? item.code : item.label;
}

export function lookupOptions(items: LookupItem[], type: LookupType, activeOnly = true) {
  return items
    .filter((item) => (activeOnly ? item.is_active !== false : true))
    .map((item) => ({
      label: item.label,
      value: lookupValue(item, type),
      code: item.code,
      metadata: item.metadata,
    }));
}
