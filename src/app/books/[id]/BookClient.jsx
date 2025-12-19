 //In Next.js App Router, every file is Server by default unless you explicitly mark it as a Client Component.

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function BookClient({ initialBook }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [level, setLevel] = useState(initialBook?.level ?? "");
  const [instrument, setInstrument] = useState(initialBook?.instrument ?? "");
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(
    initialBook?.weekly_goal_minutes ?? ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const bookId = initialBook?.id;

  const payload = useMemo(() => {
    const goal =
      weeklyGoalMinutes === "" || weeklyGoalMinutes == null
        ? null
        : Number(weeklyGoalMinutes);

    return {
      title: title.trim(),
      level: level.trim(),
      instrument: instrument.trim(),
      weekly_goal_minutes: goal,
    };
  }, [title, level, instrument, weeklyGoalMinutes]);

  function validate() {
    if (!payload.title) return "Title is required";

    const g = payload.weekly_goal_minutes;
    if (g != null && (!Number.isFinite(g) || g < 0)) {
      return "Weekly goal must be a number ≥ 0";
    }
    return "";
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to save book";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      setSuccess("Saved!");
      // Refresh server components + re-fetch book data
      router.refresh();
    } catch {
      setError("Network error saving book");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      `Delete "${initialBook?.title || "this book"}"? This cannot be undone.`
    );
    if (!ok) return;

    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });

      if (!res.ok) {
        let msg = "Failed to delete book";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      router.push("/books");
      router.refresh();
    } catch {
      setError("Network error deleting book");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2>Edit Book</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSave} style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <label>Title: </label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Level: </label>
          <input value={level} onChange={(e) => setLevel(e.target.value)} />
        </div>

        <div>
          <label>Instrument: </label>
          <input value={instrument} onChange={(e) => setInstrument(e.target.value)} />
        </div>

        <div>
          <label>Weekly goal (minutes): </label>
          <input
            value={weeklyGoalMinutes}
            onChange={(e) => setWeeklyGoalMinutes(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 150"
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            style={{ color: "crimson" }}
          >
            {isDeleting ? "Deleting…" : "Delete Book"}
          </button>
        </div>
      </form>
    </section>
  );
}
