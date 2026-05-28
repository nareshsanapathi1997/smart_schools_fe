export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", paths: ["/admin"] },
  { key: "leads", label: "Leads Report", paths: ["/admin/leads"] },
  { key: "enquiries", label: "Enquiries", paths: ["/admin/enquiries"] },
  { key: "courses", label: "Courses", paths: ["/admin/courses"] },
  { key: "faculty", label: "Faculty", paths: ["/admin/faculty"] },
  { key: "gallery", label: "Gallery", paths: ["/admin/gallery"] },
  { key: "announcements", label: "Announcements", paths: ["/admin/announcements"] },
  { key: "events", label: "Events", paths: ["/admin/events"] },
  { key: "testimonials", label: "Testimonials", paths: ["/admin/testimonials"] },
  { key: "achievements", label: "Achievements", paths: ["/admin/achievements"] },
  { key: "chatbot", label: "AI Chatbot", paths: ["/admin/chatbot"] },
  { key: "chat-logs", label: "Chat Logs", paths: ["/admin/chat-logs"] },
  { key: "contacts", label: "Contact Messages", paths: ["/admin/contacts"] },
  { key: "analytics", label: "Analytics", paths: ["/admin/analytics"] },
  { key: "erp-analytics", label: "ERP Analytics", paths: ["/admin/erp-analytics"] },
  { key: "activity-logs", label: "Activity Logs", paths: ["/admin/activity-logs"] },
  { key: "settings", label: "Settings", paths: ["/admin/settings"] },
  { key: "users", label: "Users", paths: ["/admin/users"] },
  { key: "roles", label: "Roles", paths: ["/admin/roles"] },
  { key: "departments", label: "Departments", paths: ["/admin/departments"] },
  { key: "class-levels", label: "Class Levels", paths: ["/admin/class-levels"] },
  { key: "academic-years", label: "Academic Years", paths: ["/admin/academic-years"] },
  { key: "lookups", label: "Other Lookups", paths: ["/admin/lookups"] },
  { key: "students", label: "Students", paths: ["/admin/students"] },
  { key: "attendance", label: "Attendance", paths: ["/admin/attendance"] },
  { key: "timetable", label: "Timetable", paths: ["/admin/timetable"] },
  { key: "homework", label: "Homework", paths: ["/admin/homework"] },
  { key: "exams", label: "Exams", paths: ["/admin/exams"] },
  { key: "fees", label: "Fees", paths: ["/admin/fees"] },
  { key: "transport", label: "Transport", paths: ["/admin/transport"] },
  { key: "library", label: "Library", paths: ["/admin/library"] },
  { key: "payroll", label: "Payroll", paths: ["/admin/payroll"] },
  { key: "certificates", label: "Certificates", paths: ["/admin/certificates"] },
  { key: "alerts", label: "Alerts", paths: ["/admin/alerts"] },
  { key: "portals", label: "Portals", paths: ["/admin/portals"] },
  { key: "features", label: "Features & Modules", paths: ["/admin/features"] },
] as const;

export function routePermission(href: string): string | null {
  const match = PERMISSION_MODULES.find((module) =>
    module.paths.some((path) => href === path || (path !== "/admin" && href.startsWith(`${path}/`)))
  );
  return match?.key || null;
}

export function hasPermission(
  role: string | undefined,
  href: string,
  permissions?: string[] | null
): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;

  const permList = Array.isArray(permissions) ? permissions : [];
  if (permList.includes("*")) return true;

  const moduleKey = routePermission(href);
  if (moduleKey && permList.length > 0) {
    if (moduleKey === "erp-analytics" && permList.includes("analytics")) return true;
    if (moduleKey === "academic-years" && permList.includes("class-levels")) return true;
    return permList.includes(moduleKey);
  }

  return false;
}
