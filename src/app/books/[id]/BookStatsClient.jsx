"use client";

import { useEffect, useState } from "react";

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

export default function BookStatsClient({ bookId }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadStats() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/stats`, {
        cache: "no-store",
      });

      if (!res.ok) {
        let msg = "Failed to load stats";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        setStats(null);
        return;
      }

      const data = await res.json();
      setStats(data);
    } catch {
      setError("Network error loading stats");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Weekly goal progress (safe even if API doesn't include weekly_goal_minutes yet)
  const goal = typeof stats?.weekly_goal_minutes === "number" ? stats.weekly_goal_minutes : null;
  const week = Number(stats?.week_minutes) || 0;

  const hasGoal = typeof goal === "number" && goal > 0;
  const pct = hasGoal ? Math.min(100, Math.round((week / goal) * 100)) : 0;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Stats</h2>

      {isLoading ? (
        <p>Loading stats…</p>
      ) : error ? (
        <p style={{ color: "crimson" }}>{error}</p>
      ) : !stats ? (
        <p>No stats available.</p>
      ) : (
        <div style={{ lineHeight: 1.8 }}>
          <div>
            <strong>Total minutes:</strong> {stats.total_minutes ?? 0}
          </div>
          <div>
            <strong>Sessions:</strong> {stats.session_count ?? 0}
          </div>
          <div>
            <strong>Avg/session:</strong> {stats.average_minutes ?? 0} min
          </div>
          <div>
            <strong>Last practiced:</strong> {formatWhen(stats.last_practiced_at)}
          </div>
          <div>
            <strong>Today:</strong> {stats.today_minutes ?? 0} min
          </div>
          <div>
            <strong>This week:</strong> {stats.week_minutes ?? 0} min
          </div>

          {/* Weekly Goal Progress */}
          {hasGoal ? (
            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Weekly goal progress:</strong>
                <span>
                  {week} / {goal} min ({pct}%)
                </span>
              </div>

              <div
                style={{
                  height: "12px",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginTop: "6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "rgba(255,255,255,0.75)",
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "0.75rem", opacity: 0.85 }}>
              <strong>Weekly goal:</strong> Not set
            </div>
          )}
        </div>
      )}
    </section>
  );
}
