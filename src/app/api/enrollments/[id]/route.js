import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getTeacherId() {
  return process.env.DEMO_TEACHER_ID || null;
}

// DELETE /api/enrollments/:id
export async function DELETE(_request, { params }) {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const enrollmentId = id;

  if (!enrollmentId) {
    return NextResponse.json(
      { error: "Enrollment id is required" },
      { status: 400 }
    );
  }

  // Safety check: only allow deleting enrollments for this teacher's class
  const { data: enrollment, error: fetchErr } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      class_id,
      classes!inner ( teacher_id )
    `
    )
    .eq("id", enrollmentId)
    .single();

  if (fetchErr || !enrollment) {
    console.error("Error fetching enrollment:", fetchErr);
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  if (enrollment.classes?.teacher_id !== teacherId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: delErr } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", enrollmentId);

  if (delErr) {
    console.error("Error deleting enrollment:", delErr);
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
