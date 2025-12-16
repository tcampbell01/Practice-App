 //In Next.js App Router, every file is Server by default unless you explicitly mark it as a Client Component.

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookClient({ initialBook }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialBook.title ?? "");
  const [level, setLevel] = useState(initialBook.level ?? "");
  const [instrument, setInstrument] = useState(initialBook.instrument ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSavedMsg("");

    if (!canSave) {
      setError("Title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/books/${initialBook.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          level: level.trim(),
          instrument: instrument.trim(),
        }),
      });

      if (!res.ok) {
        let msg = "Failed to update book";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      setSavedMsg("Saved!");
      router.refresh(); // refresh server-rendered bits if any
    } catch {
      setError("Network error updating book");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      `Delete "${initialBook.title}"?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setError("");
    setSavedMsg("");
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/books/${initialBook.id}`, {
        method: "DELETE",
      });

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
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Edit Book</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {savedMsg && <p style={{ color: "green" }}>{savedMsg}</p>}

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

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button type="submit" disabled={isSaving || !canSave}>
            {isSaving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ color: "crimson" }}
          >
            {isDeleting ? "Deleting…" : "Delete Book"}
          </button>
        </div>
      </form>
    </section>
  );
}
