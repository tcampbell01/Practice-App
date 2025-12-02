// src/app/page.js

// This default function defines a React component
// Next.js uses this as the component for / (the homepage)
// We're using inline style=={{...}} to avoid CSS complexity for now

const demoBooks = [
  {
    id: 1,
    title: "Suzuki Violin School, Book 1",
    instrument: "Violin",
    level: "Book 1",
  },
  {
    id: 2,
    title: "Essential Elements for Strings, Book 1",
    instrument: "Violin",
    level: "Beginner",
  },
  {
    id: 3,
    title: "Custom Rhythm Drills Pack",
    instrument: "Any",
    level: "Multi-level",
  },
];

//{demoBooks.map(...)} is how React loops over an array to render <li> elements
//key={book.id} is a unique key React uses to track list items.

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Practice App – Teacher Dashboard</h1>
      <p>
        Welcome! This will become your home base for managing students and
        pieces.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>My Method Books (demo)</h2>
        <ul>
          {demoBooks.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> – {book.instrument} – {book.level}
            </li>
          ))}
        </ul>
        <button
          onClick={() => alert("Add Method Book form will go here")}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          + Add Method Book
        </button>
      </section>
    </main>
  );
}
