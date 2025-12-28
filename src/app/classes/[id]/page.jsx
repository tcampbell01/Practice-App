import ClassDetailPage from "@/components/classes/ClassDetailPage";

export default function Page({ params }) {
  return <ClassDetailPage classId={params.id} />;
}
