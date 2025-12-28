import { NextResponse } from "next/server";
import { getStudentsForClass } from "@/lib/assignmentsDb";

function getTeacherId() {
  return process.env.DEMO_TEACHER_ID || null;
}

// GET /api/classes/:id/students
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

  const { data, error } = await getStudentsForClass({ classId, teacherId });

  if (error) {
    console.error("Error fetching class students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
