import ClassDetailPage from "@/components/classes/ClassDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <ClassDetailPage classId={id} />;
}
