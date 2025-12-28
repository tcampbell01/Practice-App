"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch("/api/books");
        if (!res.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await res.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  if (loading) {
    return <p>Loading books…</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Books</h1>

      {books.length === 0 ? (
        <p>No books yet.</p>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {books.map((book) => (
            <li key={book.id} style={{ marginBottom: 8 }}>
              <Link href={`/books/${book.id}`}>
                {book.title ?? "Untitled Book"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
