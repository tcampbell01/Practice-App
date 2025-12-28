"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await res.json();
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  if (loading) {
    return <p>Loading classes…</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Classes</h1>

      {classes.length === 0 ? (
        <p>No classes yet.</p>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {classes.map((cls) => (
            <li key={cls.id} style={{ marginBottom: 8 }}>
              <Link href={`/classes/${cls.id}`}>
                {cls.name ?? "Untitled Class"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
