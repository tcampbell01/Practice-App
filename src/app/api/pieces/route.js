import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getTeacherId() {
  // MVP until real auth is added
  return process.env.DEMO_TEACHER_ID || null;
}

// GET /api/pieces
export async function GET() {
  const teacherId = getTeacherId();

  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    // Attempt to fetch pieces scoped to teacher
    const { data, error } = await supabase
      .from("pieces")
      .select("id, title, created_at")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    // If this succeeds, return the data
    if (!error) {
      return NextResponse.json(data || []);
    }

    // If teacher_id column doesn't exist, fallback to all pieces
    const message = String(error.message || "").toLowerCase();
    const missingTeacherIdColumn =
      message.includes("teacher_id") ||
      message.includes("column") ||
      message.includes("does not exist");

    if (missingTeacherIdColumn) {
      const fallback = await supabase
        .from("pieces")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (fallback.error) {
        console.error("Error fetching pieces (fallback):", fallback.error);
        return NextResponse.json(
          { error: "Failed to fetch pieces" },
          { status: 500 }
        );
      }

      return NextResponse.json(fallback.data || []);
    }

    // Other unexpected error
    console.error("Error fetching pieces:", error);
    return NextResponse.json(
      { error: "Failed to fetch pieces" },
      { status: 500 }
    );
  } catch (err) {
    console.error("GET /api/pieces error:", err);
    return NextResponse.json(
      { error: "Failed to fetch pieces" },
      { status: 500 }
    );
  }
}

