import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books/[id]/pieces  -> list pieces for a book
export async function GET(_request, { params }) {
  const { id: bookId } = await params;

  const { data, error } = await supabase
    .from("pieces")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pieces:", error);
    return NextResponse.json({ error: "Failed to fetch pieces" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/books/[id]/pieces -> create a piece for a book
export async function POST(request, { params }) {
  try {
    const { id: bookId } = await params;
    const body = await request.json();

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const composer = typeof body?.composer === "string" ? body.composer.trim() : "";
    const pageStart =
      body?.page_start === "" || body?.page_start == null ? null : Number(body.page_start);
    const pageEnd =
      body?.page_end === "" || body?.page_end == null ? null : Number(body.page_end);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (pageStart != null && Number.isNaN(pageStart)) {
      return NextResponse.json({ error: "page_start must be a number" }, { status: 400 });
    }
    if (pageEnd != null && Number.isNaN(pageEnd)) {
      return NextResponse.json({ error: "page_end must be a number" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("pieces")
      .insert([
        {
          book_id: bookId,
          title,
          composer: composer || null,
          page_start: pageStart,
          page_end: pageEnd,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting piece:", error);
      return NextResponse.json({ error: "Failed to create piece" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/books/[id]/pieces:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
