// src/app/BookList.js

//reuseable UI component

// This component *only* cares about the books it is given via props.
export default function BookList({ books, title = 'My Method Books' }) {
  return (
    <div>
      <h2>{title}</h2>
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> – {book.instrument || 'Instrument?'} –{' '}
              {book.level || 'Level?'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
