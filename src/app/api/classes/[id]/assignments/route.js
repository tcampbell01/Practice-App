import { NextResponse } from "next/server";
import { getAssignmentsForClass } from "@/lib/assignmentsDb";

function getTeacherId() {
  return process.env.DEMO_TEACHER_ID || null;
}

// GET /api/classes/:id/assignments
export async function GET(_request, { params }) {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  const classId = params?.id;
  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 });
  }

  const { data, error } = await getAssignmentsForClass({ classId, teacherId });

  if (error) {
    console.error("Error fetching class assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
