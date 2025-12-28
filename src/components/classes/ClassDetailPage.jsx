"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function ClassDetailPage({ classId }) {
  // Class info
  const [cls, setCls] = useState(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState("");

  // Roster (supports either [student] or [{enrollmentId, student}])
  const [rosterRaw, setRosterRaw] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState("");

  // Add new student form
  const [name, setName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Remove
  const [removingEnrollmentId, setRemovingEnrollmentId] = useState(null);

  // Normalize roster so UI always uses { enrollmentId?, student }
  const roster = useMemo(() => {
    const arr = Array.isArray(rosterRaw) ? rosterRaw : [];

    // Case A: [{ enrollmentId, student }]
    if (arr.length && arr[0]?.student) {
      return arr.map((r) => ({
        enrollmentId: r.enrollmentId || r.id || null,
        student: r.student,
      }));
    }

    // Case B: [student]
    return arr.map((s) => ({ enrollmentId: null, student: s }));
  }, [rosterRaw]);

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

  async function loadRoster() {
    if (!classId) return;
    setRosterLoading(true);
    setRosterError("");
    try {
      // Uses your existing endpoint
      const res = await fetch(`/api/students?classId=${classId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load roster");
      setRosterRaw(Array.isArray(data) ? data : []);
    } catch (err) {
      setRosterError(err?.message || "Failed to load roster");
    } finally {
      setRosterLoading(false);
    }
  }

  useEffect(() => {
    loadClass();
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function handleAddStudent(e) {
    e.preventDefault();
    setAddError("");

    if (!name.trim()) {
      setAddError("Student name is required.");
      return;
    }

    setAdding(true);
    try {
      // 1) create student
      const createRes = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          instrument: instrument.trim() || null,
          email: email.trim() || null,
        }),
      });

      const student = await createRes.json();
      if (!createRes.ok) throw new Error(student?.error || "Failed to create student");

      // 2) enroll student into this class
      const enrollRes = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, studentId: student.id }),
      });

      const enrollment = await enrollRes.json();
      if (!enrollRes.ok) throw new Error(enrollment?.error || "Failed to enroll student");

      // reload roster (ensures enrollmentId shape if your API returns it)
      await loadRoster();

      setName("");
      setInstrument("");
      setEmail("");
    } catch (err) {
      setAddError(err?.message || "Failed to add student");
    } finally {
      setAdding(false);
    }
  }

  async function removeFromClass(enrollmentId) {
    if (!enrollmentId) {
      alert(
        "This roster response does not include enrollmentId yet. Update GET /api/students?classId=... to return { enrollmentId, student }."
      );
      return;
    }

    setRemovingEnrollmentId(enrollmentId);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to remove student");

      setRosterRaw((prev) =>
        (Array.isArray(prev) ? prev : []).filter((r) => {
          const id = r?.enrollmentId || r?.id || null;
          return id !== enrollmentId;
        })
      );
    } catch (err) {
      alert(err?.message || "Failed to remove student");
    } finally {
      setRemovingEnrollmentId(null);
    }
  }

  const title = classLoading ? "Loading…" : cls?.name || "Class";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <Link href="/classes" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
        <h1 style={{ margin: 0 }}>{title}</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link
            href={`/classes/${classId}/assignments`}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              background: "white",
            }}
          >
            Assignments
          </Link>
          <button
            type="button"
            onClick={() => {
              loadClass();
              loadRoster();
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
        </div>
      </div>

      {classError ? (
        <div style={{ marginTop: 10, color: "crimson" }}>{classError}</div>
      ) : null}

      {/* Add new student */}
      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #eee",
          borderRadius: 12,
          background: "white",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add new student</h2>
        <form onSubmit={handleAddStudent} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
          <input
            placeholder="Instrument"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
          <button
            disabled={adding}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: adding ? "#f5f5f5" : "black",
              color: adding ? "#666" : "white",
              cursor: adding ? "not-allowed" : "pointer",
            }}
          >
            {adding ? "Adding…" : "Add + Enroll"}
          </button>
        </form>
        {addError ? <div style={{ marginTop: 10, color: "crimson" }}>{addError}</div> : null}
      </section>

      {/* Roster */}
      <section style={{ marginTop: 20 }}>
        <h2>Roster</h2>

        {rosterLoading ? <div>Loading roster…</div> : null}
        {rosterError ? <div style={{ color: "crimson" }}>{rosterError}</div> : null}

        {!rosterLoading && !rosterError && roster.length === 0 ? (
          <div style={{ color: "#666" }}>No students yet.</div>
        ) : null}

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {roster.map((r) => {
            const s = r.student;
            return (
              <li
                key={r.enrollmentId || s.id}
                style={{
                  marginTop: 10,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  background: "white",
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    {s.instrument ? `Instrument: ${s.instrument}` : "Instrument: —"}
                    {s.email ? ` • ${s.email}` : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromClass(r.enrollmentId)}
                  disabled={!r.enrollmentId || removingEnrollmentId === r.enrollmentId}
                  title={
                    r.enrollmentId
                      ? "Remove from class"
                      : "Enrollment ID missing — update roster API to return enrollmentId"
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: "white",
                    cursor:
                      !r.enrollmentId || removingEnrollmentId === r.enrollmentId
                        ? "not-allowed"
                        : "pointer",
                    opacity: !r.enrollmentId ? 0.5 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {removingEnrollmentId === r.enrollmentId ? "Removing…" : "Remove"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
