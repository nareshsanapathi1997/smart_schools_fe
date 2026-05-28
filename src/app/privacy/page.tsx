import { PageHero } from "@/components/shared/PageHero";
import { PrivacyContent } from "@/components/legal/PrivacyContent";
import { PLACEHOLDER } from "@/lib/images";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle="How we protect and use your information" backgroundImage={PLACEHOLDER.legal} breadcrumbs={[{ label: "Privacy" }]} />
      <PrivacyContent />
    </>
  );
}
