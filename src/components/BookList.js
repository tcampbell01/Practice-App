// src/components/BookList.js

export default function BookList({ books, title = "My Method Books" }) {
    // books will be an array of rows from the method_books table
    // example row: { id, title, level, instrument, created_at }
    //this file is purely presentational: it doesn't fetch anything, it just receives books as a prop
  
    if (!books || books.length === 0) {
      return (
        <section style={{ marginTop: "2rem" }}>
          <h2>{title}</h2>
          <p>No books yet. Add one from the dashboard later.</p>
        </section>
      );
    }
  
    return (
      <section style={{ marginTop: "2rem" }}>
        <h2>{title}</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong>{" "}
              {" – "}
              {book.instrument || "Unknown instrument"}
              {" – "}
              {book.level || "No level set"}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  