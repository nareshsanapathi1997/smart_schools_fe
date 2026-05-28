import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";

const VideoIntroSection = dynamic(() =>
  import("@/components/home/VideoIntroSection").then((m) => ({ default: m.VideoIntroSection }))
);
const FeaturedCourses = dynamic(() =>
  import("@/components/home/FeaturedCourses").then((m) => ({ default: m.FeaturedCourses }))
);
const AchievementsPreview = dynamic(() =>
  import("@/components/home/AchievementsPreview").then((m) => ({ default: m.AchievementsPreview }))
);
const FacultyPreview = dynamic(() =>
  import("@/components/home/FacultyPreview").then((m) => ({ default: m.FacultyPreview }))
);
const TestimonialsSection = dynamic(() =>
  import("@/components/home/TestimonialsSection").then((m) => ({ default: m.TestimonialsSection }))
);
const CTASection = dynamic(() =>
  import("@/components/home/CTASection").then((m) => ({ default: m.CTASection }))
);
const MapSection = dynamic(() =>
  import("@/components/home/MapSection").then((m) => ({ default: m.MapSection }))
);
const NewsletterSection = dynamic(() =>
  import("@/components/home/NewsletterSection").then((m) => ({ default: m.NewsletterSection }))
);

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <VideoIntroSection />
      <FeaturedCourses />
      <AchievementsPreview />
      <FacultyPreview />
      <TestimonialsSection />
      <CTASection />
      <MapSection />
      <NewsletterSection />
    </>
  );
}
