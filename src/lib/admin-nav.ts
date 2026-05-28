import { hasPermission } from "@/lib/permissions";

export interface AdminNavItem {
  href: string;
  label: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/erp-analytics", label: "ERP Analytics" },
      { href: "/admin/leads", label: "Leads Report" },
    ],
  },
  {
    title: "ERP & Academics",
    items: [
      { href: "/admin/students", label: "Students" },
      { href: "/admin/attendance", label: "Attendance" },
      { href: "/admin/timetable", label: "Timetable" },
      { href: "/admin/homework", label: "Homework" },
      { href: "/admin/exams", label: "Exams" },
      { href: "/admin/certificates", label: "Certificates" },
    ],
  },
  {
    title: "Finance & Operations",
    items: [
      { href: "/admin/fees", label: "Fees" },
      { href: "/admin/payroll", label: "Payroll" },
      { href: "/admin/transport", label: "Transport" },
      { href: "/admin/library", label: "Library" },
    ],
  },
  {
    title: "Admissions",
    items: [
      { href: "/admin/enquiries", label: "Enquiries" },
    ],
  },
  {
    title: "Website CMS",
    items: [
      { href: "/admin/courses", label: "Courses" },
      { href: "/admin/faculty", label: "Faculty" },
      { href: "/admin/gallery", label: "Gallery" },
      { href: "/admin/announcements", label: "Announcements" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/achievements", label: "Achievements" },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin/chatbot", label: "AI Chatbot" },
      { href: "/admin/chat-logs", label: "Chat Logs" },
      { href: "/admin/contacts", label: "Contact Messages" },
      { href: "/admin/alerts", label: "Alerts" },
      { href: "/admin/portals", label: "Portals" },
    ],
  },
  {
    title: "Master Data",
    items: [
      { href: "/admin/departments", label: "Departments" },
      { href: "/admin/class-levels", label: "Class Levels" },
      { href: "/admin/academic-years", label: "Academic Years" },
      { href: "/admin/lookups", label: "Lookups" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/features", label: "Features" },
      { href: "/admin/roles", label: "Roles" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/activity-logs", label: "Activity Logs" },
    ],
  },
];

/** Legacy fallback when permissions are not loaded on the user object */
export const ADMIN_NAV_ROLES: Record<string, string[] | "*"> = {
  super_admin: "*",
  admin: [
    "/admin", "/admin/leads", "/admin/enquiries", "/admin/courses", "/admin/faculty",
    "/admin/gallery", "/admin/announcements", "/admin/events", "/admin/testimonials",
    "/admin/achievements", "/admin/chatbot", "/admin/contacts", "/admin/analytics",
    "/admin/erp-analytics", "/admin/academic-years",
    "/admin/settings", "/admin/users", "/admin/activity-logs", "/admin/chat-logs",
    "/admin/departments", "/admin/class-levels", "/admin/lookups", "/admin/students", "/admin/features",
    "/admin/attendance", "/admin/timetable", "/admin/homework", "/admin/exams", "/admin/fees",
    "/admin/transport", "/admin/library", "/admin/payroll", "/admin/certificates", "/admin/alerts", "/admin/portals",
  ],
  editor: [
    "/admin", "/admin/gallery", "/admin/announcements", "/admin/events",
    "/admin/testimonials", "/admin/achievements", "/admin/contacts", "/admin/leads",
    "/admin/analytics", "/admin/erp-analytics", "/admin/chat-logs",
  ],
};

export function canAccessAdminRoute(
  role: string | undefined,
  href: string,
  permissions?: string[] | null
): boolean {
  if (!role) return false;
  if (href === "/admin/roles" && role !== "super_admin") return false;
  if (role === "super_admin") return true;

  if (permissions && permissions.length > 0) {
    return hasPermission(role, href, permissions);
  }

  const allowed = ADMIN_NAV_ROLES[role];
  if (!allowed || allowed === "*") return true;
  return allowed.includes(href);
}
