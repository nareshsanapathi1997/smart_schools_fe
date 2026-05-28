import { PLACEHOLDER } from "@/lib/images";

export const FALLBACK_COURSES = [
  { id: "fb1", title: "Primary (I–V)", slug: "primary-i-v", description: "Foundation years with activity-based learning and smart classrooms.", fee_structure: { annual: "₹45,000/yr" }, image_url: PLACEHOLDER.course },
  { id: "fb2", title: "Middle School (VI–VIII)", slug: "middle-vi-viii", description: "Strong academic core with labs, sports, and digital learning.", fee_structure: { annual: "₹55,000/yr" }, image_url: PLACEHOLDER.course },
  { id: "fb3", title: "Secondary (IX–X)", slug: "secondary-ix-x", description: "SSC-focused curriculum with weekly assessments and mentoring.", fee_structure: { annual: "₹65,000/yr" }, image_url: PLACEHOLDER.course },
  { id: "fb4", title: "Senior Secondary (XI–XII)", slug: "senior-xi-xii", description: "Science, Commerce & Arts streams with career counselling.", fee_structure: { annual: "₹75,000/yr" }, image_url: PLACEHOLDER.course },
];

export const FALLBACK_ACHIEVEMENTS = [
  { id: "fa1", title: "100% SSC Pass Rate", year: 2025, image_url: PLACEHOLDER.achievement },
  { id: "fa2", title: "State Rank #3 Science", year: 2025, image_url: PLACEHOLDER.achievement },
  { id: "fa3", title: "National Robotics Champion", year: 2024, image_url: PLACEHOLDER.achievement },
  { id: "fa4", title: "Green School Award", year: 2024, image_url: PLACEHOLDER.achievement },
];

export const FALLBACK_FACULTY = [
  { id: "ff1", name: "Dr. S. Venkatesh", designation: "Principal", department: "Administration", qualification: "Ph.D. Education", image_url: PLACEHOLDER.faculty },
  { id: "ff2", name: "Mrs. Lakshmi Devi", designation: "HOD Mathematics", department: "Mathematics", qualification: "M.Sc, B.Ed", image_url: PLACEHOLDER.faculty },
  { id: "ff3", name: "Mr. Rajesh Kumar", designation: "Senior Teacher", department: "Science", qualification: "M.Sc Physics", image_url: PLACEHOLDER.faculty },
  { id: "ff4", name: "Ms. Anjali Patel", designation: "Senior Teacher", department: "English", qualification: "M.A, TESOL", image_url: PLACEHOLDER.faculty },
];

export const FALLBACK_TESTIMONIALS = [
  { id: "ft1", name: "Priya Sharma", role: "Parent", content: "The AI chatbot answered all our admission queries instantly. Excellent school!", rating: 5, image_url: PLACEHOLDER.testimonial },
  { id: "ft2", name: "Rahul Reddy", role: "Class XII Student", content: "Smart classrooms make learning engaging. Proud to be part of this institution.", rating: 5, image_url: PLACEHOLDER.testimonial },
  { id: "ft3", name: "Dr. Anitha Rao", role: "Alumni Parent", content: "Both my children excelled here with outstanding board results.", rating: 5, image_url: PLACEHOLDER.testimonial },
];

/** Fetch featured items; fall back to first N active items, then static demo data. */
export async function loadHomeSection<T>(
  fetchFeatured: () => Promise<T[]>,
  fetchAll: () => Promise<T[]>,
  staticFallback: T[],
  limit = 4
): Promise<T[]> {
  try {
    const featured = await fetchFeatured();
    if (featured.length) return featured.slice(0, limit);
    const all = await fetchAll();
    if (all.length) return all.slice(0, limit);
  } catch {
    // API unavailable — use static fallback
  }
  return staticFallback.slice(0, limit);
}
