"use client";

import { useEffect, useMemo, useState } from "react";

function shortDayLabel(yyyyMmDd) {
  // Render as "Mon 12/09" in user's locale
  const d = new Date(`${yyyyMmDd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "2-digit", day: "2-digit" });
}

export default function BookWeeklyStatsClient({ bookId }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadWeekly() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/stats/weekly`, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load weekly stats");
        setRows([]);
        return;
      }
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error loading weekly stats");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const maxMinutes = useMemo(() => {
    return rows.reduce((m, r) => Math.max(m, Number(r.minutes) || 0), 0);
  }, [rows]);

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Last 7 Days</h2>

      {isLoading ? (
        <p>Loading weekly stats…</p>
      ) : error ? (
        <p style={{ color: "crimson" }}>{error}</p>
      ) : rows.length === 0 ? (
        <p>No data.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rows.map((r) => {
            const minutes = Number(r.minutes) || 0;
            const widthPct = maxMinutes > 0 ? Math.round((minutes / maxMinutes) * 100) : 0;

            return (
              <li key={r.date} style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{shortDayLabel(r.date)}</span>
                  <strong>{minutes} min</strong>
                </div>

                <div
                  style={{
                    height: "8px",
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${widthPct}%`,
                      background: "rgba(255,255,255,0.65)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
