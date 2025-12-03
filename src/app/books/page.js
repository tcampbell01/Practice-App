// src/app/books/page.js
import BookList from '../BookList';

// You can reuse the same demoBooks or define a different set here
const demoBooks = [
  { id: 1, title: 'Suzuki Violin Book 1', instrument: 'Violin', level: 'Beginner' },
  { id: 2, title: 'Suzuki Cello School 1', instrument: 'Cello', level: 'Beginner' },
  { id: 3, title: 'Introducing the Positions', instrument: 'Violin', level: 'Intermediate' },
];

export default function BooksPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Books Page</h1>
      <p>This is the /books route, reusing the same BookList component.</p>

      <BookList title="All Available Method Books (demo)" books={demoBooks} />
    </main>
  );
}
