import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/books/[id]/stats
export async function GET(_request, { params }) {
  try {
    const { id: bookId } = await params;

    if (!bookId) {
      return NextResponse.json({ error: "Book id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("duration_minutes, practiced_at")
      .eq("book_id", bookId);

    if (error) {
      console.error("Error fetching stats sessions:", error);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const sessions = Array.isArray(data) ? data : [];

    const sessionCount = sessions.length;
    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (Number(s.duration_minutes) || 0),
      0
    );

    const avgMinutes =
      sessionCount > 0 ? Math.round((totalMinutes / sessionCount) * 10) / 10 : 0;

    // Last practiced
    let lastPracticedAt = null;
    for (const s of sessions) {
      if (!s.practiced_at) continue;
      if (!lastPracticedAt || new Date(s.practiced_at) > new Date(lastPracticedAt)) {
        lastPracticedAt = s.practiced_at;
      }
    }

    // Optional: Today + This Week minutes (nice for immediate feedback)
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of week (Mon). If you prefer Sun, change this logic.
    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay(); // 0=Sun,1=Mon...
    const diffToMon = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMon);

    let todayMinutes = 0;
    let weekMinutes = 0;

    for (const s of sessions) {
      if (!s.practiced_at) continue;
      const t = new Date(s.practiced_at);
      const mins = Number(s.duration_minutes) || 0;

      if (t >= startOfToday) todayMinutes += mins;
      if (t >= startOfWeek) weekMinutes += mins;
    }

    return NextResponse.json({
      book_id: bookId,
      total_minutes: totalMinutes,
      session_count: sessionCount,
      average_minutes: avgMinutes,
      last_practiced_at: lastPracticedAt,
      today_minutes: todayMinutes,
      week_minutes: weekMinutes,
    });
  } catch (err) {
    console.error("Error in GET /api/books/[id]/stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
