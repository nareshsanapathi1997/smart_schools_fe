import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function StudentsLoading() {
  return <PageSkeleton cards={1} rows={8} />;
}
