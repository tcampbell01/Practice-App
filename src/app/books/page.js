"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [instrument, setInstrument] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadBooks() {
    setError("");
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

        {error && (
          <p style={{ color: "crimson", marginTop: "0.5rem" }}>{error}</p>
        )}

        <div>
          <label>Title: </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Level: </label>
          <input value={level} onChange={(e) => setLevel(e.target.value)} />
        </div>

        <div>
          <label>Instrument: </label>
          <input
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          />
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding…" : "Add Book"}
        </button>
      </form>

      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <Link href={`/books/${book.id}`}>
              <strong>{book.title}</strong>
            </Link>
            {book.level ? ` — ${book.level}` : ""}
            {book.instrument ? ` (${book.instrument})` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}

