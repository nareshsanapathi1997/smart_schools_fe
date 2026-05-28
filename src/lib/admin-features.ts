export type FeatureStatus = "live" | "planned" | "coming_soon" | "partial";

export interface AdminFeature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  href?: string;
  category: "Academics" | "Admissions" | "Communication" | "CMS" | "System" | "Finance" | "Operations";
}

export const ADMIN_FEATURES: AdminFeature[] = [
  { id: "students", title: "Student Records", description: "Add students individually or bulk import via CSV.", status: "live", href: "/admin/students", category: "Academics" },
  { id: "attendance", title: "Attendance", description: "Daily class attendance with parent WhatsApp alerts on absence.", status: "live", href: "/admin/attendance", category: "Operations" },
  { id: "timetable", title: "Class Timetable", description: "Period-wise schedules per class and teacher.", status: "live", href: "/admin/timetable", category: "Operations" },
  { id: "homework", title: "Homework & Assignments", description: "Teachers post homework visible in portals.", status: "live", href: "/admin/homework", category: "Academics" },
  { id: "exams", title: "Exams & Report Cards", description: "Exam schedules, marks entry, term report cards, and print.", status: "live", href: "/admin/exams", category: "Academics" },
  { id: "courses", title: "Courses & Programs", description: "Manage academic programs and course pages.", status: "live", href: "/admin/courses", category: "Academics" },
  { id: "faculty", title: "Faculty Profiles", description: "Staff profiles with departments and photos.", status: "live", href: "/admin/faculty", category: "Academics" },
  { id: "achievements", title: "Results & Achievements", description: "Top students and school awards.", status: "live", href: "/admin/achievements", category: "Academics" },
  { id: "class-levels", title: "Class Levels", description: "Admission grades and course bands.", status: "live", href: "/admin/class-levels", category: "Academics" },
  { id: "departments", title: "Departments", description: "Master list of faculty departments.", status: "live", href: "/admin/departments", category: "Academics" },
  { id: "academic-years", title: "Academic Years", description: "Define academic year periods and set the current year.", status: "live", href: "/admin/academic-years", category: "Academics" },
  { id: "certificates", title: "Certificate Generator", description: "Bonafide, TC, and character certificates with print.", status: "live", href: "/admin/certificates", category: "Operations" },
  { id: "library", title: "Library", description: "Book catalog, issue/return, and fines.", status: "live", href: "/admin/library", category: "Operations" },
  { id: "transport", title: "Transport Routes", description: "Bus routes, stops, and student assignments.", status: "live", href: "/admin/transport", category: "Operations" },
  { id: "enquiries", title: "Admission Enquiries", description: "Track enquiry pipeline and export CSV.", status: "live", href: "/admin/enquiries", category: "Admissions" },
  { id: "leads", title: "Leads Report", description: "Combined enquiries, contacts, newsletter.", status: "live", href: "/admin/leads", category: "Admissions" },
  { id: "fees", title: "Fee Management", description: "Fee heads, invoices, and payment tracking.", status: "live", href: "/admin/fees", category: "Finance" },
  { id: "online-payments", title: "Online Fee Payments", description: "Razorpay checkout from parent/student portal (mock mode when keys not set).", status: "partial", href: "/portal/dashboard", category: "Finance" },
  { id: "payroll", title: "Staff Payroll", description: "Salary processing and payslip generation.", status: "live", href: "/admin/payroll", category: "Finance" },
  { id: "announcements", title: "Announcements", description: "Header ticker and announcements page.", status: "live", href: "/admin/announcements", category: "Communication" },
  { id: "events", title: "Events", description: "School events with detail pages.", status: "live", href: "/admin/events", category: "Communication" },
  { id: "contacts", title: "Contact Messages", description: "Inbound contact form submissions.", status: "live", href: "/admin/contacts", category: "Communication" },
  { id: "chatbot", title: "AI Chatbot FAQs", description: "Chatbot knowledge base.", status: "live", href: "/admin/chatbot", category: "Communication" },
  { id: "chat-logs", title: "Chat Logs", description: "Review chatbot conversations.", status: "live", href: "/admin/chat-logs", category: "Communication" },
  { id: "alerts", title: "SMS / WhatsApp Alerts", description: "Templates, manual WhatsApp/SMS send, and automated fee/homework alerts.", status: "partial", href: "/admin/alerts", category: "Communication" },
  { id: "parent-portal", title: "Parent Portal", description: "Parent login for attendance, fees, homework.", status: "live", href: "/admin/portals", category: "Communication" },
  { id: "student-portal", title: "Student Portal", description: "Student login for homework, timetable, results.", status: "live", href: "/admin/portals", category: "Communication" },
  { id: "teacher-portal", title: "Teacher Portal", description: "Faculty login for timetable and homework overview.", status: "live", href: "/teacher/login", category: "Communication" },
  { id: "gallery", title: "Gallery", description: "Photos and videos by category.", status: "live", href: "/admin/gallery", category: "CMS" },
  { id: "testimonials", title: "Testimonials", description: "Homepage quotes.", status: "live", href: "/admin/testimonials", category: "CMS" },
  { id: "settings", title: "Website Settings", description: "School info, SEO, brochure.", status: "live", href: "/admin/settings", category: "CMS" },
  { id: "users", title: "Admin Users", description: "Admin and editor accounts.", status: "live", href: "/admin/users", category: "System" },
  { id: "roles", title: "Roles & Permissions", description: "Custom roles with module access.", status: "live", href: "/admin/roles", category: "System" },
  { id: "lookups", title: "Lookups", description: "Statuses, categories, types.", status: "live", href: "/admin/lookups", category: "System" },
  { id: "activity-logs", title: "Activity Logs", description: "Admin audit trail.", status: "live", href: "/admin/activity-logs", category: "System" },
  { id: "analytics", title: "Analytics Dashboard", description: "Platform metrics.", status: "live", href: "/admin/analytics", category: "System" },
  { id: "erp-analytics", title: "ERP Analytics", description: "Students, fees, attendance, and admissions KPIs.", status: "live", href: "/admin/erp-analytics", category: "System" },
  { id: "features", title: "Features & Modules", description: "Full module catalog.", status: "live", href: "/admin/features", category: "System" },
];

export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  live: "Available Now",
  coming_soon: "Coming Soon",
  planned: "Planned",
  partial: "Partially Available",
};

export const FEATURE_STATUS_STYLES: Record<FeatureStatus, string> = {
  live: "bg-emerald-500/10 text-emerald-700",
  coming_soon: "bg-violet-500/10 text-violet-700",
  planned: "bg-amber-500/10 text-amber-700",
  partial: "bg-blue-500/10 text-blue-700",
};
