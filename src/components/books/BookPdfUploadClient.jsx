"use client";

import { useState } from "react";

export default function BookPdfUploadClient({ bookId, initialUrl }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(initialUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Pick a PDF first.");
      return;
    }

    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`/api/books/${bookId}/upload`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        let msg = "Upload failed";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setError(msg);
        return;
      }

      const data = await res.json();
      setUrl(data?.url || "");
      setFile(null);
    } catch {
      setError("Network error uploading PDF");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>PDF</h2>

      {url ? (
        <p>
          <a href={url} target="_blank" rel="noreferrer">
            Open current PDF
          </a>
        </p>
      ) : (
        <p>No PDF uploaded yet.</p>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleUpload} style={{ display: "grid", gap: "0.75rem" }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading…" : "Upload PDF"}
        </button>
      </form>
    </section>
  );
}
