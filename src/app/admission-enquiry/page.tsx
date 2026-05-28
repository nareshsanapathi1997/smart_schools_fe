import { PageHero } from "@/components/shared/PageHero";
import { AdmissionEnquiryContent } from "@/components/forms/AdmissionEnquiryContent";
import { PLACEHOLDER } from "@/lib/images";

export const metadata = { title: "Admission Enquiry" };

export default function AdmissionEnquiryPage() {
  return (
    <>
      <PageHero
        title="Admission Enquiry"
        subtitle="Fill the form below and our team will contact you within 24 hours"
        backgroundImage={PLACEHOLDER.admissions}
        breadcrumbs={[{ label: "Admissions", href: "/admissions" }, { label: "Enquiry" }]}
      />
      <AdmissionEnquiryContent />
    </>
  );
}
