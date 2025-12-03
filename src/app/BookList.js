// src/app/BookList.js

// "props" is an object that holds whatever you pass into <BookList ... />
// Here we pull out `title` and `books` from that object.
export default function BookList({ title, books }) {
  return (
    <section style={{ marginTop: '2rem' }}>
      {/* If a title was passed in, show it */}
      {title && <h2>{title}</h2>}

      {/* If there are books, render the list; otherwise show a fallback message */}
      {books && books.length > 0 ? (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> – {book.instrument} – {book.level}
            </li>
          ))}
        </ul>
      ) : (
        <p>No books to display yet.</p>
      )}
    </section>
  );
}
