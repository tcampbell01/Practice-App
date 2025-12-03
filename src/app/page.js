// src/app/page.js
import BookList from './BookList';

const demoBooks = [
  { id: 1, title: 'Suzuki Violin Book 1', instrument: 'Violin', level: 'Beginner' },
  { id: 2, title: 'Suzuki Violin Book 2', instrument: 'Violin', level: 'Early Intermediate' },
  { id: 3, title: 'Essential Elements Book 1', instrument: 'Violin', level: 'Beginner' },
];

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Practice App (Home)</h1>
      <p>Welcome! This is the home page of your practice app.</p>

      {/* Here we "pass props" into BookList */}
      <BookList title="My Method Books (demo)" books={demoBooks} />
    </main>
  );
}

