"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function ClassAssignmentsPage({ classId }) {
  const [cls, setCls] = useState(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function loadClass() {
    if (!classId) return;
    setClassLoading(true);
    setClassError("");
    try {
      const res = await fetch(`/api/classes/${classId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load class");
      setCls(data);
    } catch (err) {
      setClassError(err?.message || "Failed to load class");
    } finally {
      setClassLoading(false);
    }
  }

  async function loadAssignments() {
    if (!classId) return;
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/classes/${classId}/assignments`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load assignments");
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClass();
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const title = useMemo(() => {
    if (classLoading) return "Loading…";
    return cls?.name || "Class";
  }, [classLoading, cls]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <Link href={`/classes/${classId}`} style={{ textDecoration: "none" }}>
          ← Back
        </Link>
        <h1 style={{ margin: 0 }}>{title} — Assignments</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              loadClass();
              loadAssignments();
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>

          <Link
            href={`/classes/${classId}/assignments/new`}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "black",
              color: "white",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            New Assignment
          </Link>
        </div>
      </div>

      {classError ? (
        <div style={{ marginTop: 10, color: "crimson" }}>{classError}</div>
      ) : null}

      <div style={{ marginTop: 18 }}>
        {loading ? <div>Loading assignments…</div> : null}

        {!loading && loadError ? (
          <div style={{ color: "crimson" }}>
            {loadError}{" "}
            <button
              type="button"
              onClick={loadAssignments}
              style={{
                marginLeft: 8,
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !loadError && assignments.length === 0 ? (
          <div style={{ color: "#666" }}>
            No assignments yet. Click <b>New Assignment</b>.
          </div>
        ) : null}

        {!loading && !loadError && assignments.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignments.map((a) => (
              <li
                key={a.id}
                style={{
                  marginTop: 10,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  background: "white",
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700 }}>
                    {a.custom_title || (a.piece_id ? "Piece assignment" : "Assignment")}
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 13, color: "#666" }}>
                    Created{" "}
                    {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                  </div>
                </div>

                <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
                  {a.due_date ? (
                    <span>
                      <b>Due:</b> {a.due_date}
                    </span>
                  ) : (
                    <span style={{ color: "#666" }}>No due date</span>
                  )}
                  {a.piece_id ? (
                    <span style={{ marginLeft: 10, color: "#666" }}>
                      <b>pieceId:</b> {a.piece_id}
                    </span>
                  ) : null}
                </div>

                {a.instructions ? (
                  <div style={{ marginTop: 8, color: "#333" }}>
                    {a.instructions}
                  </div>
                ) : (
                  <div style={{ marginTop: 8, color: "#666" }}>
                    No instructions.
                  </div>
                )}

                {Array.isArray(a.target_skill_tags) && a.target_skill_tags.length ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {a.target_skill_tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid #eee",
                          color: "#444",
                          background: "#fafafa",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
