"use client";

import { useEffect, useState } from 'react';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [instrument, setInstrument] = useState('');

  // Load books (GET)
  async function loadBooks() {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(data);
  }

  useEffect(() => {
    loadBooks();
  }, []);

  // Handle POST /api/books
  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch('/api/books', {
      method: 'POST',
      body: JSON.stringify({ title, level, instrument }),
    });

    if (res.ok) {
      setTitle('');
      setLevel('');
      setInstrument('');
      loadBooks(); // refresh list after adding
    } else {
      alert('Error creating book');
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>My Method Books</h1>

      {/* --- Add Book Form --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h2>Add a New Book</h2>

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

        <button type="submit">Add Book</button>
      </form>

      {/* --- Book List --- */}
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            {book.title} — {book.level} ({book.instrument})
          </li>
        ))}
      </ul>
    </main>
  );
}
