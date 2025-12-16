"use client";

import { useEffect, useMemo, useState } from "react";

function formatWhen(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PracticeSessionsClient({ bookId }) {
  const [pieces, setPieces] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [pieceId, setPieceId] = useState("");
  const [practicedAt, setPracticedAt] = useState(""); // optional ISO-ish input
  const [durationMinutes, setDurationMinutes] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const piecesById = useMemo(() => {
    const map = new Map();
    for (const p of pieces) map.set(p.id, p);
    return map;
  }, [pieces]);

  async function loadPieces() {
    try {
      const res = await fetch(`/api/books/${bookId}/pieces`, { cache: "no-store" });
      const data = res.ok ? await res.json() : [];
      setPieces(Array.isArray(data) ? data : []);
    } catch {
      setPieces([]);
    }
  }

  async function loadSessions() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/sessions`, { cache: "no-store" });
      if (!res.ok) {
        setError("Error loading sessions");
        setSessions([]);
        return;
      }
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error loading sessions");
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPieces();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    const duration = Number(durationMinutes);

    try {
      const res = await fetch(`/api/books/${bookId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          piece_id: pieceId || null,
          practiced_at: practicedAt ? new Date(practicedAt).toISOString() : null,
          duration_minutes: duration,
          notes,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to add session";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      setPieceId("");
      setPracticedAt("");
      setDurationMinutes("");
      setNotes("");
      await loadSessions();
    } catch {
      setError("Network error adding session");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(sessionId) {
    const ok = window.confirm("Delete this practice session? This cannot be undone.");
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) {
        let msg = "Failed to delete session";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }
      await loadSessions();
    } catch {
      setError("Network error deleting session");
    }
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2>Practice Sessions</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleAdd} style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <label>Piece (optional): </label>
          <select value={pieceId} onChange={(e) => setPieceId(e.target.value)}>
            <option value="">— None —</option>
            {pieces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Date/time (optional): </label>
          <input
            value={practicedAt}
            onChange={(e) => setPracticedAt(e.target.value)}
            placeholder="2025-12-13 18:30"
          />
          <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            Leave blank to use “now”.
          </div>
        </div>

        <div>
          <label>Duration (minutes): </label>
          <input
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            inputMode="numeric"
            required
          />
        </div>

        <div>
          <label>Notes (optional): </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Log Practice"}
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        {isLoading ? (
          <p>Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p>No sessions yet.</p>
        ) : (
          <ul>
            {sessions.map((s) => {
              const pieceTitle = s.piece_id ? piecesById.get(s.piece_id)?.title : null;

              return (
                <li key={s.id} style={{ marginBottom: "0.75rem" }}>
                  <strong>{s.duration_minutes} min</strong> — {formatWhen(s.practiced_at)}
                  {pieceTitle ? ` — ${pieceTitle}` : ""}
                  {s.notes ? <div style={{ opacity: 0.9 }}>{s.notes}</div> : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    style={{ marginTop: "0.25rem", color: "crimson" }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
