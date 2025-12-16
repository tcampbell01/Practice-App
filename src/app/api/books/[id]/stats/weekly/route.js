import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books/[id]/stats/weekly
// Returns last 7 days (including today) as [{ date: "YYYY-MM-DD", minutes: number }]
export async function GET(_request, { params }) {
  try {
    const { id: bookId } = await params;

    if (!bookId) {
      return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    }

    // Build a 7-day window (UTC midnight boundaries)
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)); // tomorrow 00:00 UTC
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6)); // 6 days ago 00:00 UTC

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("duration_minutes, practiced_at")
      .eq("book_id", bookId)
      .gte("practiced_at", start.toISOString())
      .lt("practiced_at", end.toISOString());

    if (error) {
      console.error("Error fetching weekly stats:", error);
      return NextResponse.json({ error: "Failed to fetch weekly stats" }, { status: 500 });
    }

    // Initialize map with 7 days set to 0
    const dayTotals = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dayTotals.set(key, 0);
    }

    // Sum minutes into the correct day bucket (UTC date)
    for (const s of data ?? []) {
      const mins = Number(s.duration_minutes) || 0;
      if (!s.practiced_at) continue;
      const key = new Date(s.practiced_at).toISOString().slice(0, 10);
      if (dayTotals.has(key)) dayTotals.set(key, dayTotals.get(key) + mins);
    }

    const result = Array.from(dayTotals.entries()).map(([date, minutes]) => ({
      date,
      minutes,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in GET /api/books/[id]/stats/weekly:", err);
    return NextResponse.json({ error: "Failed to fetch weekly stats" }, { status: 500 });
  }
}
