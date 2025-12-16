import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// PUT /api/sessions/[sessionId] -> edit a session
export async function PUT(request, { params }) {
  try {
    const { sessionId } = await params;
    const body = await request.json();

    const duration = Number(body?.duration_minutes);
    const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
    const pieceId = typeof body?.piece_id === "string" && body.piece_id ? body.piece_id : null;
    const practicedAt =
      typeof body?.practiced_at === "string" && body.practiced_at
        ? body.practiced_at
        : null;

    if (!Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        { error: "duration_minutes must be a number > 0" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .update({
        duration_minutes: duration,
        notes: notes || null,
        piece_id: pieceId,
        ...(practicedAt ? { practiced_at: practicedAt } : {}),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating session:", error);
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in PUT /api/sessions/[sessionId]:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/sessions/[sessionId] -> delete a session
export async function DELETE(_request, { params }) {
  const { sessionId } = await params;

  const { error } = await supabase
    .from("practice_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
