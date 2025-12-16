// src/app/api/pieces/[pieceId]/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// PUT /api/pieces/[pieceId]
export async function PUT(request, { params }) {
  try {
    const { pieceId } = await params;
    const body = await request.json();

    if (!pieceId) {
      return NextResponse.json(
        { error: "Piece ID is required" },
        { status: 400 }
      );
    }

    const updates = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.order === "number") updates.order = body.order;
    if (typeof body.skills === "string") updates.skills = body.skills.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pieces")
      .update(updates)
      .eq("id", pieceId)
      .select()
      .single();

    if (error) {
      console.error("Error updating piece:", error);
      return NextResponse.json(
        { error: "Failed to update piece" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT /api/pieces/[pieceId] error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/pieces/[pieceId]
export async function DELETE(_request, { params }) {
  try {
    const { pieceId } = await params;

    if (!pieceId) {
      return NextResponse.json(
        { error: "Piece ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("pieces")
      .delete()
      .eq("id", pieceId);

    if (error) {
      console.error("Error deleting piece:", error);
      return NextResponse.json(
        { error: "Failed to delete piece" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/pieces/[pieceId] error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
