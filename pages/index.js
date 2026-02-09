import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function handleDownload() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (json.error) throw json.error;

      setData(json);
    } catch (e) {
      setError(e.toString());
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>Auto Downloader</h2>
      <p>Support TikTok, IG, FB, X, YT, Threads, Pinterest, Snapchat, Spotify, SoundCloud</p>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste link..."
        style={{
          width: "100%",
          maxWidth: 600,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 8,
          border: "none",
          background: "black",
          color: "white",
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : "Get Media"}
      </button>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {data && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <p>
            <b>Title:</b> {data.title || "-"}
          </p>
          <p>
            <b>Source:</b> {data.source}
          </p>

          <ul>
            {data.medias.map((m, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <a href={m.url} target="_blank" rel="noreferrer">
                  {m.type.toUpperCase()} {m.quality ? `(${m.quality})` : ""}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
    }
