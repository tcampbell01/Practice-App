import { notFound } from "next/navigation";
import BookClient from "./BookClient";
import BookStatsClient from "./BookStatsClient";
import BookWeeklyStatsClient from "./BookWeeklyStatsClient";
import PracticeSessionsClient from "./PracticeSessionsClient";
import PiecesClient from "./PiecesClient";
import BookPdfUploadClient from "./BookPdfUploadClient";

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function BookDetailPage({ params }) {
  const { id } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

  const res = await fetch(`${baseUrl}/api/books/${id}`, { cache: "no-store" });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load book");

  const book = await res.json();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{book.title}</h1>

      <div style={{ marginTop: "1rem", lineHeight: 1.8 }}>
        <div>
          <strong>Level:</strong> {book.level || "—"}
        </div>
        <div>
          <strong>Instrument:</strong> {book.instrument || "—"}
        </div>
        <div>
          <strong>Created:</strong> {formatDate(book.created_at)}
        </div>
      </div>

      {/* 📊 Stats */}
      <BookStatsClient bookId={book.id} />
      <BookWeeklyStatsClient bookId={book.id} />

      {/* 📄 PDF Upload */}
      <BookPdfUploadClient bookId={book.id} initialUrl={book.storage_pdf_url} />

      {/* 🎻 Pieces */}
      <PiecesClient bookId={book.id} />

      {/* ✏️ Edit book */}
      <BookClient initialBook={book} />

      {/* ⏱ Practice sessions */}
      <PracticeSessionsClient bookId={book.id} />
    </main>
  );
}
