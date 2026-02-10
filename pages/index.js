import Link from "next/link";
import { useMemo, useState } from "react";

const BG_DEFAULT =
  "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1400&q=80";

const BG_TIKTOK =
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1400&q=80";

const BG_INSTAGRAM =
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1400&q=80";

const BG_YOUTUBE =
  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1400&q=80";

const BG_FACEBOOK =
  "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=1400&q=80";

const BG_SPOTIFY =
  "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=1400&q=80";

function detectPlatform(url) {
  if (!url) return "default";
  const u = url.toLowerCase();

  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("spotify.com")) return "spotify";
  return "default";
}

function pickBg(platform) {
  if (platform === "tiktok") return BG_TIKTOK;
  if (platform === "instagram") return BG_INSTAGRAM;
  if (platform === "youtube") return BG_YOUTUBE;
  if (platform === "facebook") return BG_FACEBOOK;
  if (platform === "spotify") return BG_SPOTIFY;
  return BG_DEFAULT;
}

function shortUrl(u) {
  if (!u) return "";
  return u.length > 65 ? u.slice(0, 65) + "..." : u;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState("all");
  const [showFullTitle, setShowFullTitle] = useState(false);

  const platform = detectPlatform(url);
  const bg = pickBg(platform);

  async function getMedia() {
    setLoading(true);
    setError("");
    setData(null);
    setShowFullTitle(false);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const text = await res.text();
      let json;

      try {
        json = JSON.parse(text);
      } catch {
        throw "API tidak mengembalikan JSON (cek struktur pages/api)";
      }

      if (!res.ok || json.error) throw json.error || "Gagal mengambil media";

      setData(json);
    } catch (e) {
      setError(e.toString());
    }

    setLoading(false);
  }

  const medias = useMemo(() => {
    const list = data?.medias || [];
    if (filter === "all") return list;
    return list.filter((m) => m.type === filter);
  }, [data, filter]);

  const title = data?.title || "";
  const titleTooLong = title.length > 220;
  const shortTitle = titleTooLong ? title.slice(0, 220) + "..." : title;

  return (
    <div className="page">
      <nav className="nav">
        <div className="logo">R_hmt ofc</div>

        <div className="navlinks">
          <Link href="/" className="navlink active">
            Downloader
          </Link>
          <Link href="/profile" className="navlink">
            Profile
          </Link>
        </div>
      </nav>

      <div className="hero" style={{ backgroundImage: `url(${bg})` }}>
        <div className="overlay"></div>

        <div className="heroContent">
          <h1 className="title">Downloader Lab</h1>
          <p className="sub">
            Paste link sosial media, preview, lalu download dengan kualitas yang tersedia.
          </p>

          <div className="inputBox">
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste link..."
            />
            <button className="btnMain" onClick={getMedia} disabled={loading}>
              {loading ? "Loading..." : "Get Media"}
            </button>
          </div>

          <div className="platformBadge">
            Detected: <b>{platform.toUpperCase()}</b>
          </div>

          {error && <div className="err">❌ {error}</div>}
        </div>
      </div>

      {data && (
        <div className="resultWrap">
          <div className="resultCard">
            <h2 className="resultTitle">Result</h2>

            <div className="meta">
              <b>Title:</b>{" "}
              {title ? (
                <>
                  {showFullTitle ? title : shortTitle}
                  {titleTooLong && (
                    <span
                      className="seeMore"
                      onClick={() => setShowFullTitle((v) => !v)}
                    >
                      {showFullTitle ? " Sembunyikan" : " Lihat selengkapnya"}
                    </span>
                  )}
                </>
              ) : (
                "-"
              )}
            </div>

            <div className="meta">
              <b>Source:</b>{" "}
              <a href={data.source} target="_blank" rel="noreferrer" className="link">
                {shortUrl(data.source)}
              </a>
            </div>

            <div className="filters">
              {["all", "video", "image", "audio"].map((t) => (
                <button
                  key={t}
                  className={filter === t ? "chip active" : "chip"}
                  onClick={() => setFilter(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="list">
              {medias.map((m, i) => (
                <div key={i} className="item">
                  <div className="info">
                    <div className="type">
                      {m.type.toUpperCase()}
                      {m.quality ? <span className="q"> ({m.quality})</span> : null}
                    </div>
                    <div className="small">{shortUrl(m.url)}</div>
                  </div>

                  <div className="actions">
                    <a
                      className="btn preview"
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Preview
                    </a>

                    <a
                      className="btn download"
                      href={`/api/proxy?url=${encodeURIComponent(m.url)}&filename=${encodeURIComponent(
                        `${m.type}${m.quality ? "-" + m.quality : ""}`
                      )}`}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}

              {!medias.length && <div className="empty">Tidak ada media.</div>}
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} R_hmt ofc — Personal Tools Lab</p>
      </footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0b0f19;
          color: white;
          font-family: Arial, sans-serif;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logo {
          font-weight: bold;
          font-size: 18px;
          letter-spacing: 0.5px;
        }

        .navlinks {
          display: flex;
          gap: 12px;
        }

        .navlink {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          padding: 6px 10px;
          border-radius: 10px;
        }

        .navlink:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .navlink.active {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .hero {
          height: 430px;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(0, 0, 0, 0.78),
            rgba(0, 0, 0, 0.6),
            rgba(11, 15, 25, 1)
          );
        }

        .heroContent {
          position: relative;
          z-index: 10;
          max-width: 780px;
          width: 100%;
          padding: 18px;
        }

        .title {
          font-size: 42px;
          margin: 0;
        }

        .sub {
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.6;
          font-size: 14px;
        }

        .inputBox {
          margin-top: 18px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .input {
          flex: 1;
          min-width: 240px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.55);
          color: white;
          outline: none;
        }

        .btnMain {
          padding: 12px 16px;
          border-radius: 14px;
          border: none;
          background: white;
          color: black;
          font-weight: bold;
          cursor: pointer;
        }

        .btnMain:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .platformBadge {
          margin-top: 12px;
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .err {
          margin-top: 14px;
          color: #ff6b6b;
          font-weight: bold;
        }

        .resultWrap {
          max-width: 900px;
          margin: auto;
          padding: 18px;
          margin-top: -70px;
          position: relative;
          z-index: 20;
        }

        .resultCard {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
        }

        .resultTitle {
          margin: 0;
          font-size: 22px;
        }

        .meta {
          margin-top: 12px;
          font-size: 14px;
          line-height: 1.6;
        }

        .link {
          color: #93c5fd;
          text-decoration: none;
          word-break: break-word;
        }

        .link:hover {
          text-decoration: underline;
        }

        .seeMore {
          color: #60a5fa;
          cursor: pointer;
          font-weight: bold;
        }

        .filters {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.4);
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          font-size: 13px;
        }

        .chip.active {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .item {
          border-radius: 16px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .info {
          flex: 1;
          min-width: 240px;
        }

        .type {
          font-weight: bold;
          font-size: 14px;
        }

        .q {
          font-weight: normal;
          color: rgba(255, 255, 255, 0.65);
          font-size: 12px;
        }

        .small {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
          word-break: break-word;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 10px 14px;
          border-radius: 14px;
          font-weight: bold;
          text-decoration: none;
          font-size: 13px;
          color: white;
          transition: 0.2s;
        }

        .btn.preview {
          background: rgba(59, 130, 246, 0.9);
        }

        .btn.download {
          background: rgba(34, 197, 94, 0.9);
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .empty {
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer {
          padding: 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
    }
