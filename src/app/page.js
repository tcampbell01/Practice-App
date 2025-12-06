//homepage

// src/app/page.js
import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Practice App</h1>
      <p>
        This is the home page of your music practice app. Start by viewing your
        method books.
      </p>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/books">
          {/* simple inline styling so you don’t need Tailwind yet */}
          <button
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            Go to My Method Books
          </button>
        </Link>
      </p>
    </main>
  );
}
