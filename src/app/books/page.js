"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [instrument, setInstrument] = useState("");
  const [sourceType, setSourceType] = useState("manual"); // manual | pdf | external

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadBooks() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/books", { cache: "no-store" });
      if (!res.ok) {
        setError("Error loading books");
        setBooks([]);
        return;
      }
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error loading books");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      level: level.trim(),
      instrument: instrument.trim(),
      source_type: sourceType, // ✅ new
    };

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTitle("");
        setLevel("");
        setInstrument("");
        setSourceType("manual");
        await loadBooks();
      } else {
        let msg = "Error creating book";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
      }
    } catch {
      setError("Network error creating book");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>My Method Books</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <h2>Add a New Book</h2>

        {error && <p style={{ color: "crimson", marginTop: "0.5rem" }}>{error}</p>}

        <div>
          <label>Title: </label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Level: </label>
          <input value={level} onChange={(e) => setLevel(e.target.value)} />
        </div>

        <div>
          <label>Instrument: </label>
          <input value={instrument} onChange={(e) => setInstrument(e.target.value)} />
        </div>

        <div>
          <label>Source type: </label>
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            <option value="manual">Manual (typed)</option>
            <option value="pdf">PDF upload</option>
            <option value="external">External link</option>
          </select>
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding…" : "Add Book"}
        </button>
      </form>

      <h2>Books</h2>

      {isLoading ? (
        <p>Loading books…</p>
      ) : books.length === 0 ? (
        <p>No books yet. Add your first method book above.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/books/${book.id}`}>
                <strong>{book.title}</strong>
              </Link>
              {book.level ? ` — ${book.level}` : ""}
              {book.instrument ? ` (${book.instrument})` : ""}
              {book.source_type ? ` • ${book.source_type}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
