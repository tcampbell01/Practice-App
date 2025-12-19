import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books/[id] → fetch a single book
export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Book id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("method_books")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in GET /api/books/[id]:", err);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id] → update book fields
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Book id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const level = typeof body?.level === "string" ? body.level.trim() : "";
    const instrument =
      typeof body?.instrument === "string" ? body.instrument.trim() : "";

    const weeklyGoal =
      body?.weekly_goal_minutes === "" || body?.weekly_goal_minutes == null
        ? null
        : Number(body.weekly_goal_minutes);

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (
      weeklyGoal != null &&
      (!Number.isFinite(weeklyGoal) || weeklyGoal < 0)
    ) {
      return NextResponse.json(
        { error: "weekly_goal_minutes must be a number >= 0" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("method_books")
      .update({
        title,
        level: level || null,
        instrument: instrument || null,
        weekly_goal_minutes: weeklyGoal,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating book:", error);
      return NextResponse.json(
        { error: "Failed to update book" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in PUT /api/books/[id]:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/books/[id] → delete book
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Book id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("method_books")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting book:", error);
      return NextResponse.json(
        { error: "Failed to delete book" },
        { status: 500 }
      );
    }

    // 204 = No Content
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error in DELETE /api/books/[id]:", err);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
