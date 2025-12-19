import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getTeacherId() {
  // MVP until you add real auth (Supabase Auth / NextAuth)
  return process.env.DEMO_TEACHER_ID || null;
}

// GET /api/classes → return classes for current teacher
export async function GET() {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/classes → create a class for current teacher
export async function POST(request) {
  const teacherId = getTeacherId();
  if (!teacherId) {
    return NextResponse.json(
      { error: "DEMO_TEACHER_ID is not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("classes")
      .insert([{ teacher_id: teacherId, name }])
      .select()
      .single();

    if (error) {
      console.error("Error creating class:", error);
      return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/classes:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
