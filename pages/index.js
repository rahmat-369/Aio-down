import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showFullTitle, setShowFullTitle] = useState(false);

  async function handleSubmit() {
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
      setError(String(e));
    }

    setLoading(false);
  }

  const title = data?.title || "";
  const isLong = title.length > 180;

  return (
    <div style={styles.page}>
      <h1>R_hmt ofc — Downloader</h1>

      <input
        style={styles.input}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste link sosial media..."
      />

      <button style={styles.button} onClick={handleSubmit} disabled={loading}>
        {loading ? "Loading..." : "Get Media"}
      </button>

      {error && <p style={styles.error}>❌ {error}</p>}

      {data && (
        <div style={styles.card}>
          <p>
            <b>Title:</b>{" "}
            {isLong && !showFullTitle ? title.slice(0, 180) + "..." : title}
            {isLong && (
              <span
                style={styles.more}
                onClick={() => setShowFullTitle(!showFullTitle)}
              >
                {showFullTitle ? " Sembunyikan" : " Lihat semua"}
              </span>
            )}
          </p>

          <p>
            <b>Source:</b>{" "}
            <a href={data.source} target="_blank" rel="noreferrer">
              {data.source}
            </a>
          </p>

          <ul>
            {data.medias.map((m, i) => (
              <li key={i} style={styles.media}>
                <span>
                  {m.type.toUpperCase()}{" "}
                  {m.quality ? `(${m.quality})` : ""}
                </span>
                <span>
                  <a href={m.url} target="_blank" rel="noreferrer">
                    Preview
                  </a>{" "}
                  |{" "}
                  <a
                    href={`/api/proxy?url=${encodeURIComponent(m.url)}`}
                  >
                    Download
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 720,
    margin: "40px auto",
    fontFamily: "Arial",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
  card: {
    marginTop: 20,
    padding: 15,
    border: "1px solid #ccc",
    borderRadius: 8,
  },
  media: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  more: {
    color: "blue",
    cursor: "pointer",
    marginLeft: 6,
  },
}; 
