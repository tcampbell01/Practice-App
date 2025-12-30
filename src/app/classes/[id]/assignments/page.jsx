import ClassAssignmentsPage from "@/components/assignments/ClassAssignmentsPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <ClassAssignmentsPage classId={id} />;
}


