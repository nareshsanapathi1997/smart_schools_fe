import { MetadataRoute } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api";
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://smartschool.edu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "about", "courses", "admissions", "admission-enquiry", "faculty", "results", "gallery", "events", "announcements", "contact", "faq", "privacy", "terms", "newsletter/unsubscribe"];

  const staticEntries = staticPages.map((p) => ({
    url: `${base}/${p}`,
    lastModified: new Date(),
    changeFrequency: (p === "" ? "daily" : "weekly") as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: p === "" ? 1 : 0.8,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/cms/sitemap-urls`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const courses = (json.data?.courses || []) as Array<{ slug: string; updated_at?: string }>;
      const events = (json.data?.events || []) as Array<{ slug: string; updated_at?: string }>;
      dynamicEntries = [
        ...courses.map((c) => ({
          url: `${base}/courses/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
        ...events.map((e) => ({
          url: `${base}/events/${e.slug}`,
          lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ];
    }
  } catch {
    // fallback to static only
  }

  return [...staticEntries, ...dynamicEntries];
}
