import NewClassAssignmentPage from "@/components/assignments/NewClassAssignmentPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <NewClassAssignmentPage classId={id} />;
}


