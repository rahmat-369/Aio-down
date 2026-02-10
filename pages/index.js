// pages/index.js
import { useEffect, useMemo, useState } from "react";

const PLATFORM_BG = {
  default:
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1600&q=80",
  tiktok:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=80",
  youtube:
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80",
  facebook:
    "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=1600&q=80",
  x: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
  threads:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
  pinterest:
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
  snapchat:
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  spotify:
    "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=1600&q=80",
  soundcloud:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80",
};

function detectPlatform(url = "") {
  const u = (url || "").toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("x.com") || u.includes("twitter.com")) return "x";
  if (u.includes("threads.net") || u.includes("threads.com")) return "threads";
  if (u.includes("pinterest.com") || u.includes("pin.it")) return "pinterest";
  if (u.includes("snapchat.com")) return "snapchat";
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("soundcloud.com")) return "soundcloud";
  return "default";
}

function clampText(text = "", limit = 200) {
  if (!text) return { short: "", isLong: false };
  const isLong = text.length > limit;
  return { short: isLong ? text.slice(0, limit) + "…" : text, isLong };
}

function shortUrl(url = "", limit = 70) {
  if (!url) return "";
  return url.length > limit ? url.slice(0, limit) + "…" : url;
}

function safeFilename(str = "") {
  return (str || "")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState(null); // {title, source, medias:[]}
  const [filter, setFilter] = useState("all"); // all|video|image|audio

  const [showFullTitle, setShowFullTitle] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    setPlatform(detectPlatform(url));
  }, [url]);

  const bg = PLATFORM_BG[platform] || PLATFORM_BG.default;

  const medias = useMemo(() => {
    const list = data?.medias || [];
    if (filter === "all") return list;
    return list.filter((m) => m?.type === filter);
  }, [data, filter]);

  const title = data?.title || "";
  const { short: shortTitle, isLong: titleLong } = clampText(title, 220);

  async function onSubmit() {
    setError("");
    setData(null);
    setShowFullTitle(false);

    const u = url.trim();
    if (!u) {
      setError("Masukkan URL dulu.");
      return;
    }
    if (!/^https?:\/\//i.test(u)) {
      setError("URL harus diawali http:// atau https://");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });

      // anti “Unexpected end of JSON input”
      const txt = await res.text();
      let json;
      try {
        json = JSON.parse(txt);
      } catch {
        throw new Error(
          "API tidak mengembalikan JSON. Pastikan file API ada di pages/api/download.js"
        );
      }

      if (!res.ok || json?.error) throw new Error(json?.error || "Gagal mengambil media.");
      if (!json?.medias?.length) throw new Error("Media tidak ditemukan.");

      // normalize minimal (biar UI gak aneh)
      const normalized = {
        title: json.title || "",
        source: json.source || u,
        medias: (json.medias || [])
          .filter((m) => m?.url && m?.type)
          .map((m) => ({
            type: m.type,
            url: m.url,
            quality: m.quality || "",
          })),
      };

      setData(normalized);
    } catch (e) {
      setError(String(e?.message || e));
    }
    setLoading(false);
  }

  function openPreview(item) {
    setPreviewItem(item);
    setPreviewOpen(true);
  }

  function closePreview() {
    setPreviewOpen(false);
    setPreviewItem(null);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closePreview();
    }
    if (previewOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  function buildDownloadLink(item) {
    const name = safeFilename(
      `${item.type}${item.quality ? "-" + item.quality : ""}`
    );
    return `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(
      name || "download"
    )}`;
  }

  const platformLabel = platform === "default" ? "UNKNOWN" : platform.toUpperCase();

  return (
    <div className="page">
      {/* TOP BAR (minimal) */}
      <header className="nav">
        <div className="brand">
          <span className="dot" />
          <span className="brandText">R_hmt ofc</span>
        </div>
        <div className="navRight">
          <span className="pill">Downloader</span>
        </div>
      </header>

      {/* HERO CARD */}
      <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroTop">
            <div>
              <h1 className="h1">Downloader Lab</h1>
              <p className="sub">
                Paste link sosial media → Preview → Download. Semua media punya tombol
                <b> Preview</b> + <b>Download</b>.
              </p>
            </div>

            <div className="badge">
              Detected: <b>{platformLabel}</b>
            </div>
          </div>

          <div className="inputRow">
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste link..."
              inputMode="url"
            />
            <button className="btnMain" onClick={onSubmit} disabled={loading}>
              {loading ? "Loading..." : "Get Media"}
            </button>
          </div>

          {error && <div className="error">❌ {error}</div>}

          <div className="hint">
            Tips: kalau link YouTube kadang gagal, itu biasanya karena URL media expiring/protected.
          </div>
        </div>
      </section>

      {/* RESULT */}
      {data && (
        <section className="panel">
          <div className="panelTop">
            <h2 className="h2">Result</h2>

            <div className="filters">
              {["all", "video", "image", "audio"].map((t) => (
                <button
                  key={t}
                  className={filter === t ? "chip chipActive" : "chip"}
                  onClick={() => setFilter(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="meta">
            <b>Title:</b>{" "}
            {title ? (
              <>
                {showFullTitle ? title : shortTitle}
                {titleLong && (
                  <span className="seeMore" onClick={() => setShowFullTitle((v) => !v)}>
                    {showFullTitle ? " Sembunyikan" : " Lihat semua"}
                  </span>
                )}
              </>
            ) : (
              "-"
            )}
          </div>

          <div className="meta">
            <b>Source:</b>{" "}
            <a className="link" href={data.source} target="_blank" rel="noreferrer">
              {shortUrl(data.source)}
            </a>
          </div>

          <div className="list">
            {medias.map((m, i) => (
              <div className="item" key={i}>
                <div className="left">
                  <div className="typeRow">
                    <span className="type">{m.type.toUpperCase()}</span>
                    {m.quality ? <span className="quality">{m.quality}</span> : null}
                  </div>
                  <div className="small">{shortUrl(m.url, 55)}</div>
                </div>

                <div className="actions">
                  <button className="btn preview" onClick={() => openPreview(m)}>
                    Preview
                  </button>
                  <a className="btn download" href={buildDownloadLink(m)}>
                    Download
                  </a>
                </div>
              </div>
            ))}

            {!medias.length && <div className="empty">Tidak ada media untuk filter ini.</div>}
          </div>
        </section>
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && previewItem && (
        <div className="modalBackdrop" onMouseDown={closePreview}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div className="modalTitle">
                Preview • {previewItem.type.toUpperCase()}
                {previewItem.quality ? ` (${previewItem.quality})` : ""}
              </div>
              <button className="modalClose" onClick={closePreview}>
                ✕
              </button>
            </div>

            <div className="modalBody">
              {previewItem.type === "image" && (
                <img className="modalMedia" src={previewItem.url} alt="preview" />
              )}
              {previewItem.type === "video" && (
                <video className="modalMedia" src={previewItem.url} controls />
              )}
              {previewItem.type === "audio" && (
                <audio className="modalAudio" src={previewItem.url} controls />
              )}
            </div>

            <div className="modalActions">
              <a className="modalBtn" href={previewItem.url} target="_blank" rel="noreferrer">
                Open Source
              </a>
              <a className="modalBtnPrimary" href={buildDownloadLink(previewItem)}>
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} R_hmt ofc • Minimal UI • Mobile-first
      </footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: radial-gradient(900px 520px at 20% 0%, rgba(155, 92, 255, 0.18), transparent 60%),
            radial-gradient(900px 520px at 80% 0%, rgba(55, 245, 255, 0.14), transparent 60%),
            linear-gradient(180deg, #060812, #0b0f1c);
          color: rgba(255, 255, 255, 0.88);
          font-family: Arial, sans-serif;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(55, 245, 255, 1), rgba(155, 92, 255, 1), rgba(255, 79, 216, 1));
          box-shadow: 0 0 18px rgba(55, 245, 255, 0.18);
        }

        .brandText {
          font-size: 14px;
        }

        .pill {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .hero {
          max-width: 980px;
          margin: 18px auto 0;
          border-radius: 18px;
          min-height: 380px;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);
          position: relative;
          overflow: hidden;
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.55), rgba(11, 15, 28, 1));
        }

        .heroInner {
          position: relative;
          z-index: 2;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.8px;
        }

        .sub {
          margin: 10px 0 0;
          max-width: 70ch;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.72);
          font-size: 14px;
        }

        .badge {
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }

        .inputRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 12px;
          backdrop-filter: blur(12px);
        }

        .input {
          flex: 1;
          min-width: 220px;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.35);
          color: rgba(255, 255, 255, 0.9);
          outline: none;
        }

        .btnMain {
          padding: 12px 14px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.92);
          color: rgba(0, 0, 0, 0.92);
        }

        .btnMain:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          font-weight: 800;
          color: #ff7a7a;
          margin-top: 4px;
        }

        .hint {
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          line-height: 1.6;
          margin-top: 2px;
        }

        .panel {
          max-width: 980px;
          margin: 14px auto 0;
          padding: 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.3);
        }

        .panelTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          font-size: 12px;
        }

        .chipActive {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.92);
        }

        .meta {
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.6;
          font-size: 14px;
        }

        .seeMore {
          color: rgba(96, 165, 250, 0.95);
          cursor: pointer;
          font-weight: 800;
        }

        .link {
          color: rgba(147, 197, 253, 0.95);
          text-decoration: none;
          word-break: break-word;
        }

        .link:hover {
          text-decoration: underline;
        }

        .list {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .item {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.22);
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .left {
          flex: 1;
          min-width: 230px;
        }

        .typeRow {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .type {
          font-weight: 900;
          font-size: 14px;
        }

        .quality {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 8px;
          border-radius: 999px;
        }

        .small {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.52);
          word-break: break-word;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 12px;
          border-radius: 14px;
          font-weight: 900;
          font-size: 13px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn.preview:hover {
          transform: translateY(-1px);
        }

        .btn.download {
          border-color: rgba(45, 255, 143, 0.32);
          background: rgba(45, 255, 143, 0.16);
        }

        .btn.download:hover {
          transform: translateY(-1px);
        }

        .empty {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer {
          max-width: 980px;
          margin: 24px auto 0;
          padding: 18px 16px 28px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
          text-align: center;
        }

        /* MODAL */
        .modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 200;
        }

        .modal {
          width: min(860px, 100%);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(10, 12, 20, 0.82);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }

        .modalTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modalTitle {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.9);
        }

        .modalClose {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
        }

        .modalBody {
          padding: 12px;
          display: flex;
          justify-content: center;
        }

        .modalMedia {
          width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.25);
        }

        .modalAudio {
          width: 100%;
        }

        .modalActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modalBtn {
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.88);
          font-weight: 900;
        }

        .modalBtnPrimary {
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(45, 255, 143, 0.32);
          background: rgba(45, 255, 143, 0.16);
          color: rgba(255, 255, 255, 0.96);
          font-weight: 900;
        }

        @media (max-width: 1020px) {
          .hero,
          .panel {
            margin-left: 12px;
            margin-right: 12px;
          }
        }
      `}</style>
    </div>
  );
                                     } 
