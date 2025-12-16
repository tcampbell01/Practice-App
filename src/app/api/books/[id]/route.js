import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books/[id]
export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("method_books")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in GET /api/books/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

// PUT /api/books/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    }

    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const level = typeof body?.level === "string" ? body.level.trim() : "";
    const instrument =
      typeof body?.instrument === "string" ? body.instrument.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("method_books")
      .update({
        title,
        level: level || null,
        instrument: instrument || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating book:", error);
      return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in PUT /api/books/[id]:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/books/[id]
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    }

    const { error } = await supabase.from("method_books").delete().eq("id", id);

    if (error) {
      console.error("Error deleting book:", error);
      return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
    }

    // 204 = No Content
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error in DELETE /api/books/[id]:", err);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
