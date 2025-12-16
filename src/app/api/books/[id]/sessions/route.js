import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books/[id]/sessions -> list sessions for a book
export async function GET(_request, { params }) {
  const { id: bookId } = await params;

  const { data, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("book_id", bookId)
    .order("practiced_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/books/[id]/sessions -> create a session
export async function POST(request, { params }) {
  try {
    const { id: bookId } = await params;
    const body = await request.json();

    const duration = Number(body?.duration_minutes);
    const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
    const pieceId = typeof body?.piece_id === "string" && body.piece_id ? body.piece_id : null;

    // practiced_at can be ISO string; if omitted, DB default now()
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

    const insertRow = {
      book_id: bookId,
      piece_id: pieceId,
      duration_minutes: duration,
      notes: notes || null,
      ...(practicedAt ? { practiced_at: practicedAt } : {}),
    };

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert([insertRow])
      .select()
      .single();

    if (error) {
      console.error("Error inserting session:", error);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/books/[id]/sessions:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
