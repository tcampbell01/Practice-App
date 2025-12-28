import ClassAssignmentsPage from "@/components/assignments/ClassAssignmentsPage";

export default function Page({ params }) {
  return <ClassAssignmentsPage classId={params.id} />;
}

