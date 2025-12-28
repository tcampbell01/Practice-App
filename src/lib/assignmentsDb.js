import { supabase } from "@/lib/supabaseClient";

export async function createAssignment({
  classId,
  pieceId,
  customTitle,
  teacherId,
  dueDate,
  instructions,
  targetSkillTags,
}) {
  const payload = {
    teacher_id: teacherId,
    class_id: classId,
    piece_id: pieceId || null,
    custom_title: customTitle || null,
    due_date: dueDate || null,
    instructions: instructions || null,
    target_skill_tags: Array.isArray(targetSkillTags) ? targetSkillTags : [],
  };

  const { data, error } = await supabase
    .from("assignments")
    .insert([payload])
    .select()
    .single();

  return { data, error };
}

export async function createAssignmentItems({ assignmentId, studentIds }) {
  const rows = studentIds.map((studentId) => ({
    assignment_id: assignmentId,
    student_id: studentId,
  }));

  const { data, error } = await supabase
    .from("assignment_items")
    .insert(rows)
    .select("id, assignment_id, student_id, status, created_at");

  return { data, error };
}

export async function getAssignmentsForClass({ classId, teacherId }) {
  const { data, error } = await supabase
    .from("assignments")
    .select("id, teacher_id, class_id, piece_id, custom_title, instructions, due_date, target_skill_tags, created_at")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getStudentsForClass({ classId, teacherId }) {
  // roster: returns enrollmentId + student
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      student:students (
        id,
        teacher_id,
        name,
        instrument,
        email,
        created_at
      )
    `
    )
    .eq("class_id", classId);

  if (error) return { data: null, error };

  const roster = (data || [])
    .filter((row) => row?.student && row.student.teacher_id === teacherId)
    .map((row) => ({ enrollmentId: row.id, student: row.student }));

  return { data: roster, error: null };
}
