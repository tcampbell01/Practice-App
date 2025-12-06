// src/app/api/books/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/books  → return all books
export async function GET() {
  const { data, error } = await supabase
    .from('method_books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// POST /api/books  → create a new book
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, level, instrument } = body;

    // Basic validation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('method_books')
      .insert([
        {
          title,
          level: level || null,
          instrument: instrument || null,
        },
      ])
      .select()
      .single(); // return the inserted row

    if (error) {
      console.error('Error inserting book:', error);
      return NextResponse.json(
        { error: 'Failed to create book' },
        { status: 500 }
      );
    }

    // 201 = "created"
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/books:', err);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
