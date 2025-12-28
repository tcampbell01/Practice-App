"use client";

import { useEffect, useMemo, useState } from "react";

function formatDate(isoString) {
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
  const [sessions, setSessions] = useState([]);
  const [pieces, setPieces] = useState([]);

  const [durationMinutes, setDurationMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPieceId, setSelectedPieceId] = useState(""); // "" = whole book/general

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const pieceTitleById = useMemo(() => {
    const m = new Map();
    for (const p of pieces) m.set(p.id, p.title);
    return m;
  }, [pieces]);

  async function loadPieces() {
    try {
      const res = await fetch(`/api/books/${bookId}/pieces`, { cache: "no-store" });
      if (!res.ok) {
        setPieces([]);
        return;
      }
      const data = await res.json();
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
    // load pieces + sessions in parallel
    loadPieces();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function handleAddSession(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    const duration = Number(durationMinutes);

    if (!Number.isFinite(duration) || duration <= 0) {
      setError("Duration must be a number > 0");
      setIsSaving(false);
      return;
    }

    const payload = {
      duration_minutes: duration,
      notes: notes.trim() || null,
      piece_id: selectedPieceId || null, // ✅ key addition
    };

    try {
      const res = await fetch(`/api/books/${bookId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to create session";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      setDurationMinutes("");
      setNotes("");
      setSelectedPieceId("");
      await loadSessions();
    } catch {
      setError("Network error creating session");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2>Practice Sessions</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleAddSession} style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <label>Piece: </label>
          <select
            value={selectedPieceId}
            onChange={(e) => setSelectedPieceId(e.target.value)}
          >
            <option value="">Whole book / general</option>
            {pieces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Duration (minutes): </label>
          <input
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 20"
            required
          />
        </div>

        <div>
          <label>Notes (optional): </label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding…" : "Add Session"}
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
              const pieceTitle = s.piece_id ? pieceTitleById.get(s.piece_id) : null;
              return (
                <li key={s.id} style={{ marginBottom: "0.75rem" }}>
                  <div>
                    <strong>{s.duration_minutes} min</strong>
                    {pieceTitle ? ` • ${pieceTitle}` : " • Whole book"}
                  </div>
                  <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>
                    {formatDate(s.practiced_at)}
                    {s.notes ? ` — ${s.notes}` : ""}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
