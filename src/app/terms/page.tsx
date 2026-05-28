import { PageHero } from "@/components/shared/PageHero";
import { TermsContent } from "@/components/legal/TermsContent";
import { PLACEHOLDER } from "@/lib/images";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms & Conditions" subtitle="Rules and guidelines for using our website" backgroundImage={PLACEHOLDER.legal} breadcrumbs={[{ label: "Terms" }]} />
      <TermsContent />
    </>
  );
}
