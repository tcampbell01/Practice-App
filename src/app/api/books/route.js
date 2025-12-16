// src/app/api/books/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getTeacherId() {
  // MVP until you add real auth (Supabase Auth / NextAuth)
  return process.env.DEMO_TEACHER_ID || null;
}

// GET /api/books → return books for current teacher
export async function GET() {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  // Find the book_ids this teacher can access
  const { data: accessRows, error: accessErr } = await supabase
    .from("teacher_book_access")
    .select("book_id")
    .eq("teacher_id", teacherId);

  if (accessErr) {
    console.error("Error fetching teacher_book_access:", accessErr);
    return NextResponse.json(
      { error: "Failed to fetch teacher access" },
      { status: 500 }
    );
  }

  const bookIds = (accessRows || []).map((r) => r.book_id);

  // No access rows → return empty list (not an error)
  if (bookIds.length === 0) return NextResponse.json([]);

  // Fetch books by those ids
  const { data: books, error: booksErr } = await supabase
    .from("method_books")
    .select("*")
    .in("id", bookIds)
    .order("created_at", { ascending: false });

  if (booksErr) {
    console.error("Error fetching books:", booksErr);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }

  return NextResponse.json(books || []);
}

// POST /api/books → create book + teacher_book_access row
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
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const level = typeof body?.level === "string" ? body.level.trim() : "";
    const instrument =
      typeof body?.instrument === "string" ? body.instrument.trim() : "";

    // Optional fields (safe to send only if your columns exist)
    const sourceType =
      typeof body?.source_type === "string" ? body.source_type.trim() : "";
    const storagePdfUrl =
      typeof body?.storage_pdf_url === "string" ? body.storage_pdf_url.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 1) Create the book
    const { data: book, error: insertErr } = await supabase
      .from("method_books")
      .insert([
        {
          title,
          level: level || null,
          instrument: instrument || null,
          // include only if you added these columns
          ...(sourceType ? { source_type: sourceType } : {}),
          ...(storagePdfUrl ? { storage_pdf_url: storagePdfUrl } : {}),
        },
      ])
      .select()
      .single();

    if (insertErr) {
      console.error("Error inserting book:", insertErr);
      return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
    }

    // 2) Create the access row
    const { error: accessInsertErr } = await supabase
      .from("teacher_book_access")
      .insert([{ teacher_id: teacherId, book_id: book.id }]);

    if (accessInsertErr) {
      console.error("Error inserting teacher_book_access:", accessInsertErr);

      // Attempt to rollback the created book so you don't orphan rows
      try {
        await supabase.from("method_books").delete().eq("id", book.id);
      } catch (rollbackErr) {
        console.error("Rollback failed deleting book:", rollbackErr);
      }

      return NextResponse.json(
        { error: "Failed to grant teacher access to the book" },
        { status: 500 }
      );
    }

    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/books:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
