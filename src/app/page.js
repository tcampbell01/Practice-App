// src/app/page.js
import BookList from './BookList';
import { supabase } from '../lib/supabaseClient';

export default async function Home() {
  // Ask Supabase for all method_books
  const { data: books, error } = await supabase
    .from('method_books')
    .select('id, title, instrument, level')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching books:', error.message);
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Practice App</h1>
      <p>These books are coming from Supabase now.</p>

      {error && (
        <p style={{ color: 'red' }}>
          There was a problem loading books. Check the console.
        </p>
      )}

      <section style={{ marginTop: '2rem' }}>
        <BookList books={books ?? []} />
      </section>
    </main>
  );
}
