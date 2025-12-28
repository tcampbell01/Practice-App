import { NextResponse } from "next/server";
import { createAssignment, createAssignmentItems } from "@/lib/assignmentsDb";

function getTeacherId() {
  return process.env.DEMO_TEACHER_ID || null;
}

// POST /api/assignments
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

    const classId = typeof body?.classId === "string" ? body.classId : "";
    const studentIds = Array.isArray(body?.studentIds) ? body.studentIds : [];
    const pieceId = typeof body?.pieceId === "string" ? body.pieceId : null;
    const customTitle =
      typeof body?.customTitle === "string" ? body.customTitle.trim() : null;

    const dueDate = typeof body?.dueDate === "string" ? body.dueDate : null;
    const instructions =
      typeof body?.instructions === "string" ? body.instructions.trim() : null;
    const targetSkillTags = Array.isArray(body?.targetSkillTags)
      ? body.targetSkillTags
      : [];

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }
    if (studentIds.length < 1) {
      return NextResponse.json(
        { error: "At least 1 student is required" },
        { status: 400 }
      );
    }
    if (!pieceId && !customTitle) {
      return NextResponse.json(
        { error: "pieceId or customTitle is required" },
        { status: 400 }
      );
    }

    const { data: assignment, error: aErr } = await createAssignment({
      classId,
      pieceId,
      customTitle,
      teacherId,
      dueDate,
      instructions,
      targetSkillTags,
    });

    if (aErr || !assignment?.id) {
      console.error("Error creating assignment:", aErr);
      return NextResponse.json(
        { error: "Failed to create assignment" },
        { status: 500 }
      );
    }

    const { data: items, error: iErr } = await createAssignmentItems({
      assignmentId: assignment.id,
      studentIds,
    });

    if (iErr) {
      console.error("Error creating assignment items:", iErr);
      return NextResponse.json(
        { error: "Failed to create assignment items" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { assignmentId: assignment.id, items: items || [] },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/assignments error:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
