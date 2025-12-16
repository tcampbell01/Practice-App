import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function safeFilename(name = "book.pdf") {
  // keep it simple and safe for paths
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// POST /api/books/[id]/upload
// Expects multipart/form-data with field: file (PDF)
export async function POST(request, { params }) {
  try {
    const { id: bookId } = await params;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // In Next route handlers, uploaded file is typically a Web File
    if (typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
    }

    // Basic validation
    const contentType = file.type || "";
    const originalName = safeFilename(file.name || "book.pdf");

    // Allow PDFs only
    if (contentType !== "application/pdf" && !originalName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Please upload a PDF" }, { status: 400 });
    }

    const bucket = "book-pdfs";
    const path = `${bookId}/${Date.now()}-${originalName}`;

    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicData?.publicUrl || null;

    if (!publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
    }

    // Store URL (and optionally path) on the book row
    const { data: updatedBook, error: updateErr } = await supabase
      .from("method_books")
      .update({
        storage_pdf_url: publicUrl,
        storage_pdf_path: path,
      })
      .eq("id", bookId)
      .select()
      .single();

    if (updateErr) {
      console.error("DB update error:", updateErr);
      return NextResponse.json(
        { error: "Uploaded, but failed to save URL to book" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, book: updatedBook, url: publicUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
