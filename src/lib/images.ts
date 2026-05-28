// School-themed images bundled locally in /public/images (reliable + on-brand)
const local = (file: string) => `/images/${file}`;

export const PLACEHOLDER = {
  hero: local("hero.jpg"),
  campus: local("campus.jpg"),
  classroom: local("classroom.jpg"),
  lab: local("lab.jpg"),
  library: local("library.jpg"),
  sports: local("sports.jpg"),
  event: local("event.jpg"),
  course: local("course.jpg"),
  faculty: local("faculty1.jpg"),
  faculty2: local("faculty2.jpg"),
  faculty3: local("faculty3.jpg"),
  faculty4: local("faculty4.jpg"),
  faculty5: local("faculty5.jpg"),
  faculty6: local("faculty6.jpg"),
  testimonial: local("testimonial1.jpg"),
  testimonial2: local("testimonial2.jpg"),
  testimonial3: local("testimonial3.jpg"),
  achievement: local("achievement.jpg"),
  gallery: local("gallery1.jpg"),
  gallery2: local("gallery2.jpg"),
  gallery3: local("gallery3.jpg"),
  gallery4: local("gallery4.jpg"),
  gallery5: local("gallery5.jpg"),
  gallery6: local("gallery6.jpg"),
  videoThumb: local("video-thumb.jpg"),
  videoPoster: local("hero.jpg"),
  admissions: local("admissions.jpg"),
  contact: local("contact.jpg"),
  faq: local("faq.jpg"),
  legal: local("legal.jpg"),
  default: local("default.jpg"),
};

export const DEMO_VIDEO = "https://www.youtube.com/embed/ScMzIvxBSi4";

const facultyKeys = ["faculty", "faculty2", "faculty3", "faculty4", "faculty5", "faculty6"] as const;
const testimonialKeys = ["testimonial", "testimonial2", "testimonial3"] as const;
const galleryKeys = ["gallery", "gallery2", "gallery3", "gallery4", "gallery5", "gallery6"] as const;

export function facultyFallback(index = 0): string {
  return PLACEHOLDER[facultyKeys[index % facultyKeys.length]];
}

export function testimonialFallback(index = 0): string {
  return PLACEHOLDER[testimonialKeys[index % testimonialKeys.length]];
}

export function galleryFallback(index = 0): string {
  return PLACEHOLDER[galleryKeys[index % galleryKeys.length]];
}

function isValidImageUrl(url: string) {
  if (!url || url.trim() === "") return false;
  if (/youtube|youtu\.be|embed|vimeo|\.mp4/i.test(url)) return false;
  if (/picsum\.photos|images\.unsplash\.com/i.test(url)) return false;
  return url.startsWith("http") || url.startsWith("/");
}

/** Normalize API/DB image URLs; invalid or missing values use fallback */
export function resolveMediaUrl(url?: string | null, fallback: string = PLACEHOLDER.default): string {
  if (!url || !isValidImageUrl(url)) return fallback;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/images/")) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api").replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export function youtubeEmbed(url: string) {
  if (url.includes("embed")) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

/** Map legacy external URLs to local themed assets */
export function normalizeImageUrl(url?: string | null, fallback: string = PLACEHOLDER.default): string {
  return resolveMediaUrl(url, fallback);
}
