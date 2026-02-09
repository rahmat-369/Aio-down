import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

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

  const filteredMedias =
    data?.medias?.filter((m) => {
      if (filter === "all") return true;
      return m.type === filter;
    }) || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Auto Downloader</h1>
        <p style={styles.desc}>
          Download video / image / audio dari TikTok, Instagram, YouTube, Facebook, X, Threads,
          Pinterest, Snapchat, Spotify, SoundCloud.
        </p>

        <div style={styles.inputBox}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste link disini..."
            style={styles.input}
          />
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Get Media"}
          </button>
        </div>

        {error && <p style={styles.error}>❌ {error}</p>}

        {data && (
          <div style={styles.resultCard}>
            <h2 style={styles.resultTitle}>Hasil</h2>

            <p style={styles.meta}>
              <b>Title:</b> {data.title || "-"}
            </p>
            <p style={styles.meta}>
              <b>Source:</b>{" "}
              <a href={data.source} target="_blank" rel="noreferrer">
                {data.source}
              </a>
            </p>

            <div style={styles.filterBox}>
              <button
                onClick={() => setFilter("all")}
                style={filter === "all" ? styles.filterActive : styles.filterBtn}
              >
                All
              </button>
              <button
                onClick={() => setFilter("video")}
                style={filter === "video" ? styles.filterActive : styles.filterBtn}
              >
                Video
              </button>
              <button
                onClick={() => setFilter("image")}
                style={filter === "image" ? styles.filterActive : styles.filterBtn}
              >
                Image
              </button>
              <button
                onClick={() => setFilter("audio")}
                style={filter === "audio" ? styles.filterActive : styles.filterBtn}
              >
                Audio
              </button>
            </div>

            <div style={styles.mediaList}>
              {filteredMedias.map((m, i) => (
                <div key={i} style={styles.mediaItem}>
                  <div>
                    <p style={styles.mediaType}>
                      {m.type.toUpperCase()}{" "}
                      {m.quality ? <span style={styles.quality}>({m.quality})</span> : ""}
                    </p>
                    <p style={styles.mediaExt}>{m.ext || "unknown"}</p>
                  </div>

                  <a
                    href={`/api/proxy?url=${encodeURIComponent(m.url)}`}
                    style={styles.downloadBtn}
                  >
                    Download
                  </a>
                </div>
              ))}

              {!filteredMedias.length && (
                <p style={{ marginTop: 15, color: "#666" }}>Tidak ada media untuk filter ini.</p>
              )}
            </div>
          </div>
        )}

        <p style={styles.footer}>
          Built with Next.js + Vercel 🚀
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 800,
    background: "white",
    padding: 25,
    borderRadius: 14,
    boxShadow: "0px 5px 20px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: "bold",
  },
  desc: {
    marginTop: 10,
    marginBottom: 20,
    color: "#555",
    fontSize: 14,
    lineHeight: 1.6,
  },
  inputBox: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 250,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    outline: "none",
    fontSize: 14,
  },
  button: {
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: "bold",
  },
  error: {
    marginTop: 15,
    color: "red",
    fontWeight: "bold",
  },
  resultCard: {
    marginTop: 25,
    padding: 20,
    borderRadius: 12,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  resultTitle: {
    margin: 0,
    fontSize: 20,
  },
  meta: {
    marginTop: 8,
    marginBottom: 0,
    fontSize: 14,
  },
  filterBox: {
    marginTop: 15,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
    fontSize: 13,
  },
  filterActive: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
  },
  mediaList: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mediaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    background: "white",
    border: "1px solid #e5e7eb",
  },
  mediaType: {
    margin: 0,
    fontWeight: "bold",
    fontSize: 14,
  },
  quality: {
    fontWeight: "normal",
    color: "#6b7280",
    fontSize: 12,
  },
  mediaExt: {
    margin: 0,
    fontSize: 12,
    color: "#6b7280",
  },
  downloadBtn: {
    padding: "8px 14px",
    background: "#16a34a",
    color: "white",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: 13,
  },
  footer: {
    marginTop: 25,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
  },
}; 
