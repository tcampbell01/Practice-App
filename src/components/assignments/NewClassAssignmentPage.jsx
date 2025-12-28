"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentPicker from "@/components/assignments/StudentPicker";

export default function NewClassAssignmentPage({ classId }) {
  const router = useRouter();

  const [cls, setCls] = useState(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState("");

  // Roster returns [{ enrollmentId, student }]
  const [roster, setRoster] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  // Pieces list (assumes GET /api/pieces)
  const [pieces, setPieces] = useState([]);
  const [piecesLoading, setPiecesLoading] = useState(true);
  const [piecesError, setPiecesError] = useState("");

  // Form state
  const [pieceMode, setPieceMode] = useState("library"); // "library" | "custom"
  const [pieceId, setPieceId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [skillTagsText, setSkillTagsText] = useState("");

  // Student selection (array of ids)
  const students = useMemo(() => roster.map((r) => r.student), [roster]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState("");

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

  async function loadStudents() {
    if (!classId) return;
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load students");

      const rosterArr = Array.isArray(data) ? data : [];
      setRoster(rosterArr);

      // reset selection when roster loads/changes
      setSelectedStudentIds([]);
    } catch (err) {
      setStudentsError(err?.message || "Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  }

  async function loadPieces() {
    setPiecesLoading(true);
    setPiecesError("");
    try {
      const res = await fetch("/api/pieces", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load pieces");
      setPieces(Array.isArray(data) ? data : []);
    } catch (err) {
      setPiecesError(err?.message || "Failed to load pieces");
    } finally {
      setPiecesLoading(false);
    }
  }

  useEffect(() => {
    loadClass();
    loadStudents();
    loadPieces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function parseTags(text) {
    return text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitOk("");

    const studentIds = selectedStudentIds;
    const chosenPieceId = pieceMode === "library" ? pieceId.trim() : "";
    const chosenCustomTitle = pieceMode === "custom" ? customTitle.trim() : "";

    if (!classId) {
      setSubmitError("Missing classId.");
      return;
    }
    if (!studentIds.length) {
      setSubmitError("Select at least one student.");
      return;
    }
    if (!chosenPieceId && !chosenCustomTitle) {
      setSubmitError("Choose a piece or enter a custom piece title.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentIds,
          pieceId: chosenPieceId || null,
          customTitle: chosenCustomTitle || null,
          dueDate: dueDate || null,
          instructions: instructions.trim() || null,
          targetSkillTags: parseTags(skillTagsText),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create assignment");

      setSubmitOk("Assignment created!");
      setTimeout(() => {
        router.push(`/classes/${classId}/assignments`);
      }, 300);
    } catch (err) {
      setSubmitError(err?.message || "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  }

  const pageTitle = useMemo(() => {
    if (classLoading) return "Loading…";
    return cls?.name ? `New Assignment — ${cls.name}` : "New Assignment";
  }, [classLoading, cls]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <Link
          href={`/classes/${classId}/assignments`}
          style={{ textDecoration: "none" }}
        >
          ← Back
        </Link>
        <h1 style={{ margin: 0 }}>{pageTitle}</h1>
      </div>

      {classError ? (
        <div style={{ marginTop: 10, color: "crimson" }}>{classError}</div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #eee",
          borderRadius: 12,
          background: "white",
        }}
      >
        {/* Piece selection */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Piece</div>

          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name="pieceMode"
                value="library"
                checked={pieceMode === "library"}
                onChange={() => setPieceMode("library")}
              />
              Library piece
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name="pieceMode"
                value="custom"
                checked={pieceMode === "custom"}
                onChange={() => setPieceMode("custom")}
              />
              Custom title
            </label>
          </div>

          {pieceMode === "library" ? (
            <div>
              {piecesLoading ? <div>Loading pieces…</div> : null}
              {piecesError ? (
                <div style={{ color: "crimson" }}>
                  {piecesError} (Check your /api/pieces endpoint)
                </div>
              ) : null}

              {!piecesLoading && !piecesError ? (
                <select
                  value={pieceId}
                  onChange={(e) => setPieceId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="">Select a piece…</option>
                  {pieces.map((p) => {
                    // Adjust label field if needed
                    const label = p.title || p.name || p.filename || p.id;
                    return (
                      <option key={p.id} value={p.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : null}
            </div>
          ) : (
            <div>
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder='e.g., "Suzuki Book 1 - Twinkle"'
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}
        </div>

        {/* Instructions + Due date */}
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Instructions</div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="What should the student focus on?"
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Due date</div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        {/* Skill tags */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Target skill tags</div>
          <input
            value={skillTagsText}
            onChange={(e) => setSkillTagsText(e.target.value)}
            placeholder='Comma-separated (e.g., "rhythm, tone, intonation")'
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Students selection */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Students</div>

          {studentsLoading ? <div>Loading students…</div> : null}
          {studentsError ? (
            <div style={{ color: "crimson" }}>{studentsError}</div>
          ) : null}

          {!studentsLoading && !studentsError ? (
            <StudentPicker
              students={students}
              selectedIds={selectedStudentIds}
              onChange={setSelectedStudentIds}
              disabled={submitting}
            />
          ) : null}
        </div>

        {/* Submit */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: submitting ? "#f5f5f5" : "black",
              color: submitting ? "#666" : "white",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Creating…" : "Create assignment"}
          </button>

          {submitError ? <div style={{ color: "crimson" }}>{submitError}</div> : null}
          {submitOk ? <div style={{ color: "green" }}>{submitOk}</div> : null}
        </div>
      </form>

      <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
        This will create 1 assignment and 1 assignment item per selected student.
      </div>
    </div>
  );
}

