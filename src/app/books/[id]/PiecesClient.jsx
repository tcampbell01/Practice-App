"use client";

import { useEffect, useState } from "react";

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

export default function PiecesClient({ bookId }) {
  const [pieces, setPieces] = useState([]);

  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // pieceId -> { loading, data, error, open }
  const [statsByPieceId, setStatsByPieceId] = useState({});

  async function loadPieces() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/pieces`, { cache: "no-store" });
      if (!res.ok) {
        setError("Error loading pieces");
        setPieces([]);
        return;
      }
      const data = await res.json();
      setPieces(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error loading pieces");
      setPieces([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPieces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const res = await fetch(`/api/books/${bookId}/pieces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          composer,
          page_start: pageStart,
          page_end: pageEnd,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to add piece";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      setTitle("");
      setComposer("");
      setPageStart("");
      setPageEnd("");
      await loadPieces();
    } catch {
      setError("Network error adding piece");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(pieceId, pieceTitle) {
    const ok = window.confirm(`Delete piece "${pieceTitle}"?`);
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/pieces/${pieceId}`, { method: "DELETE" });
      if (!res.ok) {
        let msg = "Failed to delete piece";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      // remove any cached stats for this piece
      setStatsByPieceId((prev) => {
        const next = { ...prev };
        delete next[pieceId];
        return next;
      });

      await loadPieces();
    } catch {
      setError("Network error deleting piece");
    }
  }

  async function toggleStats(pieceId) {
    setStatsByPieceId((prev) => {
      const cur = prev[pieceId];
      // If already open, close it (keep cached data)
      if (cur?.open) return { ...prev, [pieceId]: { ...cur, open: false } };
      // If closed but already has data, open it
      if (cur?.data) return { ...prev, [pieceId]: { ...cur, open: true } };
      // Else mark as open + loading and fetch below
      return {
        ...prev,
        [pieceId]: { open: true, loading: true, data: null, error: "" },
      };
    });

    // If we already have data, no need to refetch
    const existing = statsByPieceId[pieceId];
    if (existing?.data) return;

    try {
      const res = await fetch(`/api/pieces/${pieceId}/stats`, { cache: "no-store" });
      if (!res.ok) {
        let msg = "Failed to load stats";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setStatsByPieceId((prev) => ({
          ...prev,
          [pieceId]: { open: true, loading: false, data: null, error: msg },
        }));
        return;
      }

      const data = await res.json();
      setStatsByPieceId((prev) => ({
        ...prev,
        [pieceId]: { open: true, loading: false, data, error: "" },
      }));
    } catch {
      setStatsByPieceId((prev) => ({
        ...prev,
        [pieceId]: { open: true, loading: false, data: null, error: "Network error" },
      }));
    }
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2>Pieces</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleAdd} style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <label>Title: </label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Composer (optional): </label>
          <input value={composer} onChange={(e) => setComposer(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div>
            <label>Page start: </label>
            <input
              value={pageStart}
              onChange={(e) => setPageStart(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div>
            <label>Page end: </label>
            <input
              value={pageEnd}
              onChange={(e) => setPageEnd(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding…" : "Add Piece"}
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        {isLoading ? (
          <p>Loading pieces…</p>
        ) : pieces.length === 0 ? (
          <p>No pieces yet.</p>
        ) : (
          <ul>
            {pieces.map((p) => {
              const statsState = statsByPieceId[p.id] || { open: false };
              return (
                <li key={p.id} style={{ marginBottom: "1rem" }}>
                  <div>
                    <strong>{p.title}</strong>
                    {p.composer ? ` — ${p.composer}` : ""}
                    {p.page_start != null || p.page_end != null
                      ? ` (pp. ${p.page_start ?? "?"}-${p.page_end ?? "?"})`
                      : ""}
                  </div>

                  <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.5rem" }}>
                    <button type="button" onClick={() => toggleStats(p.id)}>
                      {statsState.open ? "Hide stats" : "View stats"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      style={{ color: "crimson" }}
                    >
                      Delete
                    </button>
                  </div>

                  {statsState.open && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.75rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        maxWidth: "520px",
                      }}
                    >
                      {statsState.loading ? (
                        <p>Loading stats…</p>
                      ) : statsState.error ? (
                        <p style={{ color: "crimson" }}>{statsState.error}</p>
                      ) : statsState.data ? (
                        <div style={{ lineHeight: 1.7 }}>
                          <div>
                            <strong>Total minutes:</strong> {statsState.data.total_minutes}
                          </div>
                          <div>
                            <strong>Sessions:</strong> {statsState.data.session_count}
                          </div>
                          <div>
                            <strong>This week:</strong> {statsState.data.week_minutes} min
                          </div>
                          <div>
                            <strong>Today:</strong> {statsState.data.today_minutes} min
                          </div>
                          <div>
                            <strong>Last practiced:</strong>{" "}
                            {formatDate(statsState.data.last_practiced_at)}
                          </div>
                        </div>
                      ) : (
                        <p>No stats available.</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
