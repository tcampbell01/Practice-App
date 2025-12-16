"use client";

import { useEffect, useState } from "react";

export default function PiecesClient({ bookId }) {
  const [pieces, setPieces] = useState([]);

  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
      await loadPieces();
    } catch {
      setError("Network error deleting piece");
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
            {pieces.map((p) => (
              <li key={p.id} style={{ marginBottom: "0.5rem" }}>
                <strong>{p.title}</strong>
                {p.composer ? ` — ${p.composer}` : ""}
                {p.page_start != null || p.page_end != null
                  ? ` (pp. ${p.page_start ?? "?"}-${p.page_end ?? "?"})`
                  : ""}
                {" "}
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.title)}
                  style={{ marginLeft: "0.5rem", color: "crimson" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

