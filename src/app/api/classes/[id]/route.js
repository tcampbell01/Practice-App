import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getTeacherId() {
  return process.env.DEMO_TEACHER_ID || null;
}

// GET /api/classes/:id
export async function GET(_request, { params }) {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const classId = id;

  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("classes")
    .select("id, teacher_id, name, description, created_at")
    .eq("id", classId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (data.teacher_id !== teacherId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(data);
}

