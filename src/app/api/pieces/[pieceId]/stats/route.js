import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function startOfTodayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekUTC() {
  // Monday as start of week
  const d = new Date();
  const day = d.getUTCDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

// GET /api/pieces/[pieceId]/stats
export async function GET(_req, { params }) {
  try {
    const { pieceId } = await params;

    if (!pieceId) {
      return NextResponse.json({ error: "pieceId is required" }, { status: 400 });
    }

    // Ensure piece exists (and return helpful info)
    const { data: piece, error: pieceErr } = await supabase
      .from("pieces")
      .select("id, book_id, title")
      .eq("id", pieceId)
      .single();

    if (pieceErr || !piece) {
      return NextResponse.json({ error: "Piece not found" }, { status: 404 });
    }

    const todayStart = startOfTodayUTC();
    const weekStart = startOfWeekUTC();

    // Pull sessions for this piece
    const { data: sessions, error: sesErr } = await supabase
      .from("practice_sessions")
      .select("id, duration_minutes, practiced_at")
      .eq("piece_id", pieceId)
      .order("practiced_at", { ascending: false });

    if (sesErr) {
      console.error("Error fetching piece sessions:", sesErr);
      return NextResponse.json({ error: "Failed to load piece stats" }, { status: 500 });
    }

    const list = sessions || [];
    const session_count = list.length;

    const total_minutes = list.reduce(
      (sum, s) => sum + (Number(s.duration_minutes) || 0),
      0
    );

    const last_practiced_at = list[0]?.practiced_at || null;

    const today_minutes = list
      .filter((s) => s.practiced_at && s.practiced_at >= todayStart)
      .reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0);

    const week_minutes = list
      .filter((s) => s.practiced_at && s.practiced_at >= weekStart)
      .reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0);

    return NextResponse.json({
      piece_id: piece.id,
      piece_title: piece.title,
      book_id: piece.book_id,
      total_minutes,
      session_count,
      last_practiced_at,
      today_minutes,
      week_minutes,
    });
  } catch (e) {
    console.error("Piece stats error:", e);
    return NextResponse.json({ error: "Failed to load piece stats" }, { status: 500 });
  }
}
