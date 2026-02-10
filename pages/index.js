// pages/index.js
import { useEffect, useMemo, useState } from "react";

const PLATFORM_BG = {
  default:
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1600&q=80",
  tiktok:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=1600&q=80",
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

function clampText(text = "", limit = 220) {
  if (!text) return { short: "", isLong: false };
  const isLong = text.length > limit;
  return { short: isLong ? text.slice(0, limit) + "…" : text, isLong };
}

function shortUrl(url = "", limit = 72) {
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

function normalizeQuality(q = "") {
  const s = (q || "").toLowerCase();
  // mapping untuk bikin label yang enak dilihat
  if (s.includes("no_watermark") || s.includes("nowatermark") || s.includes("no-watermark"))
    return "No Watermark";
  if (s.includes("hd_no_watermark") || (s.includes("hd") && s.includes("no_watermark")))
    return "HD • No Watermark";
  if (s.includes("watermark")) return "Watermark";
  if (s.includes("hd")) return "HD";
  return q || "";
}

function qualityTagKey(q = "") {
  const s = (q || "").toLowerCase();
  // untuk filter tikTok
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark"))) return "hd_nw";
  if (s.includes("no_watermark") || s.includes("nowatermark")) return "nw";
  if (s.includes("watermark")) return "wm";
  if (s.includes("hd")) return "hd";
  return "other";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState(null); // {title, source, medias:[]}
  const [typeFilter, setTypeFilter] = useState("all"); // all|video|image|audio
  const [qualityFilter, setQualityFilter] = useState("all"); // all|... (dynamic)
  const [showFullTitle, setShowFullTitle] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    setPlatform(detectPlatform(url));
  }, [url]);

  const bg = PLATFORM_BG[platform] || PLATFORM_BG.default;

  const title = data?.title || "";
  const { short: shortTitle, isLong: titleLong } = clampText(title, 240);

  // Kumpulin opsi quality dari response (khususnya video)
  const qualityOptions = useMemo(() => {
    const medias = data?.medias || [];
    const vids = medias.filter((m) => m.type === "video");
    const set = new Map(); // key -> label
    for (const v of vids) {
      const raw = v.quality || "";
      const key = qualityTagKey(raw);
      const label = normalizeQuality(raw) || "Other";
      // untuk key "other" kita tetep masukin, tapi gak wajib tampil kalau kosong
      if (key === "other" && !raw) continue;
      if (!set.has(key)) set.set(key, label);
    }

    // Urutan preferensi tiktok
    const order = ["hd_nw", "nw", "hd", "wm", "other"];
    const arr = [{ key: "all", label: "All Quality" }];
    for (const k of order) {
      if (set.has(k)) arr.push({ key: k, label: set.get(k) });
    }
    return arr;
  }, [data]);

  // Reset quality filter saat data berubah / platform berubah
  useEffect(() => {
    setQualityFilter("all");
  }, [data?.source, platform]);

  const medias = useMemo(() => {
    const list = (data?.medias || []).map((m) => ({
      ...m,
      qualityLabel: normalizeQuality(m.quality || ""),
      qualityKey: qualityTagKey(m.quality || ""),
    }));

    let out = list;
    if (typeFilter !== "all") out = out.filter((m) => m.type === typeFilter);
    // quality filter hanya relevan untuk video
    if (qualityFilter !== "all") out = out.filter((m) => m.type !== "video" ? true : m.qualityKey === qualityFilter);
    return out;
  }, [data, typeFilter, qualityFilter]);

  async function onSubmit() {
    setError("");
    setData(null);
    setShowFullTitle(false);

    const u = url.trim();
    if (!u) return setError("Masukkan URL dulu.");
    if (!/^https?:\/\//i.test(u)) return setError("URL harus diawali http:// atau https://");

    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });

      const txt = await res.text();
      let json;
      try {
        json = JSON.parse(txt);
      } catch {
        throw new Error("API tidak mengembalikan JSON. Pastikan API ada di pages/api/download.js");
      }

      if (!res.ok || json?.error) throw new Error(json?.error || "Gagal mengambil media.");
      if (!json?.medias?.length) throw new Error("Media tidak ditemukan.");

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
    const name = safeFilename(`${item.type}${item.quality ? "-" + item.quality : ""}`);
    return `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(name || "download")}`;
  }

  const platformLabel = platform === "default" ? "UNKNOWN" : platform.toUpperCase();

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroTop">
            <div className="brandRow">
              <span className="brandDot" />
              <span className="brandText">R_hmt ofc</span>
              <span className="brandSub">• Downloader Lab</span>
            </div>

            <div className="badge">
              Detected: <b>{platformLabel}</b>
            </div>
          </div>

          <h1 className="h1">Downloader Lab</h1>
          <p className="sub">
            Paste link sosial media → Preview → Download. Semua item selalu punya tombol
            <b> Preview</b> + <b>Download</b>.
          </p>

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
            Tips: YouTube kadang gagal karena URL media expiring/protected (bukan UI).
          </div>
        </div>
      </section>

      {/* RESULT */}
      {data && (
        <section className="panel">
          <div className="panelTop">
            <h2 className="h2">Result</h2>

            <div className="filtersWrap">
              {/* Type filter */}
              <div className="filters">
                {["all", "video", "image", "audio"].map((t) => (
                  <button
                    key={t}
                    className={typeFilter === t ? "chip chipActive" : "chip"}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Quality filter (mencolok, muncul kalau ada opsi video quality) */}
              {qualityOptions.length > 1 && (
                <div className="qFilters">
                  <div className="qTitle">Quality</div>
                  <div className="qRow">
                    {qualityOptions.map((q) => (
                      <button
                        key={q.key}
                        className={qualityFilter === q.key ? "qChip qActive" : "qChip"}
                        onClick={() => setQualityFilter(q.key)}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              {shortUrl(data.source, 90)}
            </a>
          </div>

          <div className="list">
            {medias.map((m, i) => (
              <div className="item" key={i}>
                <div className="left">
                  <div className="typeRow">
                    <span className="type">{m.type.toUpperCase()}</span>
                    {m.qualityLabel ? <span className="quality">{m.qualityLabel}</span> : null}
                  </div>
                  <div className="small">{shortUrl(m.url, 70)}</div>
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
                {previewItem.quality ? ` (${normalizeQuality(previewItem.quality)})` : ""}
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

      <footer className="footer">© {new Date().getFullYear()} R_hmt ofc • Full width • Desktop ready</footer>

      {/* Global + Page CSS */}
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #060812;
          overflow-x: hidden; /* ini yang ngehilangin putih di samping */
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(1000px 520px at 20% 0%, rgba(155, 92, 255, 0.18), transparent 60%),
            radial-gradient(1000px 520px at 80% 0%, rgba(55, 245, 255, 0.14), transparent 60%),
            linear-gradient(180deg, #060812, #0b0f1c);
          color: rgba(255, 255, 255, 0.9);
          font-family: Arial, sans-serif;
          padding: 0 0 42px;
        }

        /* Full width container, tapi tetap enak di desktop */
        .hero,
        .panel,
        .footer {
          width: min(1100px, calc(100% - 24px));
          margin-left: auto;
          margin-right: auto;
        }

        .hero {
          margin-top: 14px;
          border-radius: 18px;
          min-height: 420px;
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
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.5), rgba(11, 15, 28, 1));
        }

        .heroInner {
          position: relative;
          z-index: 2;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .brandRow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .brandDot {
          width: 12px;
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(55, 245, 255, 1), rgba(155, 92, 255, 1), rgba(255, 79, 216, 1));
          box-shadow: 0 0 18px rgba(55, 245, 255, 0.18);
        }
        .brandText {
          font-weight: 900;
          letter-spacing: 0.2px;
        }
        .brandSub {
          color: rgba(255, 255, 255, 0.65);
          font-size: 12px;
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

        .h1 {
          margin: 0;
          font-size: clamp(28px, 5vw, 44px);
          letter-spacing: -0.8px;
        }

        .sub {
          margin: 0;
          max-width: 80ch;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.72);
          font-size: 14px;
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
          width: min(720px, 100%);
        }

        .input {
          flex: 1;
          min-width: 220px;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.35);
          color: rgba(255, 255, 255, 0.92);
          outline: none;
        }

        .btnMain {
          padding: 12px 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-weight: 900;
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
        }

        .hint {
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          line-height: 1.6;
          margin-top: 2px;
        }

        .panel {
          margin-top: 14px;
          padding: 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.3);
        }

        .panelTop {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
        }

        .filtersWrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: min(760px, 100%);
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
        }
        .chipActive {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.95);
        }

        /* Quality filters (lebih mencolok, tapi nyatu) */
        .qFilters {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.22);
          padding: 10px;
        }
        .qTitle {
          font-size: 12px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.82);
          margin-bottom: 8px;
        }
        .qRow {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .qChip {
          padding: 9px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.86);
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
        }
        .qActive {
          border-color: rgba(45, 255, 143, 0.32);
          background: rgba(45, 255, 143, 0.16);
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
          font-weight: 900;
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
          min-width: 250px;
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
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 8px;
          border-radius: 999px;
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
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 14px;
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

        .btn.download {
          border-color: rgba(45, 255, 143, 0.32);
          background: rgba(45, 255, 143, 0.16);
        }

        .empty {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer {
          margin-top: 20px;
          padding: 10px 0 0;
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
          width: min(900px, 100%);
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
          max-height: 72vh;
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
      `}</style>
    </div>
  );
}
