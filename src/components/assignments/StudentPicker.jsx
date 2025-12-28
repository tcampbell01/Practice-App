"use client";

export default function StudentPicker({
  students,
  selectedIds,
  onChange,
  disabled = false,
}) {
  const allSelected =
    students.length > 0 && students.every((s) => selectedIds.includes(s.id));

  function toggleAll(checked) {
    if (checked) {
      onChange(students.map((s) => s.id));
    } else {
      onChange([]);
    }
  }

  function toggleOne(studentId, checked) {
    if (checked) {
      onChange([...selectedIds, studentId]);
    } else {
      onChange(selectedIds.filter((id) => id !== studentId));
    }
  }

  if (!students.length) {
    return <div style={{ color: "#666" }}>No students available.</div>;
  }

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={allSelected}
          disabled={disabled}
          onChange={(e) => toggleAll(e.target.checked)}
        />
        Select all
      </label>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {students.map((s) => (
          <label
            key={s.id}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: 8,
              borderRadius: 10,
              border: "1px solid #f2f2f2",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(s.id)}
              disabled={disabled}
              onChange={(e) => toggleOne(s.id, e.target.checked)}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {s.instrument || "—"}
                {s.email ? ` • ${s.email}` : ""}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
