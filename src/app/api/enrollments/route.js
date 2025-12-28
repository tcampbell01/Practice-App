import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getTeacherId() {
  return process.env.DEMO_TEACHER_ID || null;
}

// POST /api/enrollments
// body: { classId, studentId }
export async function POST(request) {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const classId = typeof body?.classId === "string" ? body.classId.trim() : "";
    const studentId =
      typeof body?.studentId === "string" ? body.studentId.trim() : "";

    if (!classId || !studentId) {
      return NextResponse.json(
        { error: "classId and studentId are required" },
        { status: 400 }
      );
    }

    // Safety: verify the class belongs to this teacher
    const { data: cls, error: classErr } = await supabase
      .from("classes")
      .select("id, teacher_id")
      .eq("id", classId)
      .single();

    if (classErr || !cls) {
      console.error("Error verifying class:", classErr);
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    if (cls.teacher_id !== teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Safety: verify the student belongs to this teacher
    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id, teacher_id")
      .eq("id", studentId)
      .single();

    if (studentErr || !student) {
      console.error("Error verifying student:", studentErr);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    if (student.teacher_id !== teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create enrollment (unique constraint prevents duplicates if you added it)
    const { data, error } = await supabase
      .from("enrollments")
      .insert([{ class_id: classId, student_id: studentId }])
      .select("id, class_id, student_id, created_at")
      .single();

    if (error) {
      // If you have unique(class_id, student_id), this is a common duplicate message
      console.error("Error creating enrollment:", error);
      return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/enrollments:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
