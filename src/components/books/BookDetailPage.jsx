"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function BookDetailPage({ bookId }) {
  const [book, setBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [bookError, setBookError] = useState("");

  async function loadBook() {
    if (!bookId) return;
    setLoadingBook(true);
    setBookError("");

    try {
      const res = await fetch(`/api/books/${bookId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load book");
      setBook(data);
    } catch (err) {
      setBookError(err?.message || "Failed to load book");
    } finally {
      setLoadingBook(false);
    }
  }

  useEffect(() => {
    loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const title = useMemo(() => {
    if (loadingBook) return "Loading…";
    return book?.title || "Book";
  }, [loadingBook, book]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <Link href="/books" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
        <h1 style={{ margin: 0 }}>{title}</h1>

        <div style={{ marginLeft: "auto" }}>
          <button
            type="button"
            onClick={loadBook}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {bookError ? (
        <div style={{ marginTop: 10, color: "crimson" }}>{bookError}</div>
      ) : null}

      {/* Basic info */}
      {!loadingBook && book ? (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 12,
            background: "white",
          }}
        >
          <div style={{ color: "#666", fontSize: 13 }}>
            <b>Level:</b> {book.level ?? "—"} &nbsp; • &nbsp;
            <b>Instrument:</b> {book.instrument ?? "—"}
          </div>
          {book.created_at ? (
            <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
              <b>Created:</b> {new Date(book.created_at).toLocaleString()}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Placeholder sections for your existing book sub-features */}
      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        <Section title="Pieces">
          <p style={{ color: "#666", margin: 0 }}>
            (This is where your PiecesClient UI goes.)
          </p>
          <p style={{ color: "#666", margin: "8px 0 0" }}>
            API: <code>/api/books/{bookId}/pieces</code>
          </p>
        </Section>

        <Section title="Practice Sessions">
          <p style={{ color: "#666", margin: 0 }}>
            (This is where your PracticeSessionsClient UI goes.)
          </p>
          <p style={{ color: "#666", margin: "8px 0 0" }}>
            API: <code>/api/books/{bookId}/sessions</code>
          </p>
        </Section>

        <Section title="Stats">
          <p style={{ color: "#666", margin: 0 }}>
            (This is where your BookWeeklyStatsClient / stats UI goes.)
          </p>
          <p style={{ color: "#666", margin: "8px 0 0" }}>
            API: <code>/api/books/{bookId}/stats</code> and{" "}
            <code>/api/books/{bookId}/stats/weekly</code>
          </p>
        </Section>

        <Section title="Upload PDF">
          <p style={{ color: "#666", margin: 0 }}>
            (This is where your BookPdfUploadClient UI goes.)
          </p>
          <p style={{ color: "#666", margin: "8px 0 0" }}>
            API: <code>/api/books/{bookId}/upload</code>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section
      style={{
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 12,
        background: "white",
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
