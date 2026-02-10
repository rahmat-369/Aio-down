// pages/index.js
import { useEffect, useMemo, useState } from "react";

const WA_CHANNEL = "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";

const PLATFORM_BG = {
  default: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1600&q=80",
  tiktok: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80",
  instagram: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=80",
  youtube: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80",
  facebook: "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=1600&q=80",
  x: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
  threads: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
  pinterest: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
  snapchat: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  spotify: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=1600&q=80",
  soundcloud: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80",
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

function clampText(text = "", limit = 240) {
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
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark")))
    return "HD • No Watermark";
  if (s.includes("no_watermark") || s.includes("nowatermark")) return "No Watermark";
  if (s.includes("watermark")) return "Watermark";
  if (s.includes("hd")) return "HD";
  return q || "";
}

function qualityTagKey(q = "") {
  const s = (q || "").toLowerCase();
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark")))
    return "hd_nw";
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

  const [data, setData] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [showFullTitle, setShowFullTitle] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    setPlatform(detectPlatform(url));
  }, [url]);

  const bg = PLATFORM_BG[platform] || PLATFORM_BG.default;

  const title = data?.title || "";
  const { short: shortTitle, isLong: titleLong } = clampText(title, 260);

  const qualityOptions = useMemo(() => {
    const medias = data?.medias || [];
    const vids = medias.filter((m) => m.type === "video");
    const set = new Map();

    for (const v of vids) {
      const raw = v.quality || "";
      const key = qualityTagKey(raw);
      const label = normalizeQuality(raw) || "Other";
      if (key === "other" && !raw) continue;
      if (!set.has(key)) set.set(key, label);
    }

    const order = ["hd_nw", "nw", "hd", "wm", "other"];
    const arr = [{ key: "all", label: "All Quality" }];
    for (const k of order) {
      if (set.has(k)) arr.push({ key: k, label: set.get(k) });
    }
    return arr;
  }, [data]);

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

    if (qualityFilter !== "all") {
      out = out.filter((m) => (m.type === "video" ? m.qualityKey === qualityFilter : true));
    }

    return out;
  }, [data, typeFilter, qualityFilter]);

  async function onSubmit() {
    setError("");
    setData(null);
    setShowFullTitle(false);

    const u = url.trim();
    if (!u) return setError("Masukkan URL dulu.");
    if (!/^https?:\/\//i.test(u))
      return setError("URL harus diawali http:// atau https://");

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
        throw new Error(
          "API tidak mengembalikan JSON. Pastikan API ada di pages/api/download.js"
        );
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
    return `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(
      name || "download"
    )}`;
  }

  const platformLabel = platform === "default" ? "UNKNOWN" : platform.toUpperCase();

  return (
    <div className="page">
      <header className="siteHeader">
        <div className="headerInner">
          <h1 className="siteTitle">Social Media Downloader</h1>
          <p className="siteTagline">
            Download video, audio, dan gambar dari berbagai platform sosial media dengan mudah dan cepat.
            Cukup paste link, preview, dan download!
          </p>
        </div>
      </header>

      <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroTop">
            <div className="badge">
              Platform: <b>{platformLabel}</b>
            </div>
          </div>

          <div className="inputCard">
            <div className="inputTitle">Paste Link Media</div>
            <div className="inputGroup">
              <input
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Contoh: https://tiktok.com/@user/video/123456789"
                inputMode="url"
              />
              <button className="btnMain" onClick={onSubmit} disabled={loading}>
                {loading ? "Memproses..." : "Ambil Media"}
              </button>
            </div>
            
            {error && <div className="error">⚠️ {error}</div>}

            <div className="supportedList">
              <span className="supportedItem">TikTok</span>
              <span className="supportedItem">Instagram</span>
              <span className="supportedItem">YouTube</span>
              <span className="supportedItem">Facebook</span>
              <span className="supportedItem">X/Twitter</span>
              <span className="supportedItem">Threads</span>
              <span className="supportedItem">Pinterest</span>
              <span className="supportedItem">Snapchat</span>
              <span className="supportedItem">Spotify</span>
              <span className="supportedItem">SoundCloud</span>
            </div>

            <div className="hint">
              * YouTube mungkin gagal jika video terlindungi atau URL sudah expired.
            </div>
          </div>
        </div>
      </section>

      {!data && (
        <>
          <section className="miniWrap">
            <div className="howCard">
              <div className="howItem">
                <div className="howIcon">1</div>
                <div className="howContent">
                  <div className="howTitle">Paste Link</div>
                  <div className="howDesc">Salin link dari platform sosial media dan tempel di atas.</div>
                </div>
              </div>

              <div className="howItem">
                <div className="howIcon">2</div>
                <div className="howContent">
                  <div className="howTitle">Preview Media</div>
                  <div className="howDesc">Lihat preview video, audio, atau gambar sebelum download.</div>
                </div>
              </div>

              <div className="howItem">
                <div className="howIcon">3</div>
                <div className="howContent">
                  <div className="howTitle">Download</div>
                  <div className="howDesc">Download file dengan kualitas yang tersedia.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="miniWrap">
            <div className="joinCard">
              <div className="joinContent">
                <div className="joinHeader">
                  <div className="joinIcon">📱</div>
                  <div>
                    <div className="joinTitle">Join WhatsApp Channel</div>
                    <div className="joinSubtitle">Update terbaru dan tools downloader</div>
                  </div>
                </div>
                <div className="joinDesc">
                  Dapatkan notifikasi update fitur, tools baru, dan informasi project dari developer.
                </div>

                <div className="joinTags">
                  <span className="tag">Update Tools</span>
                  <span className="tag">Tips Download</span>
                  <span className="tag">Project Update</span>
                </div>
              </div>

              <div className="joinAction">
                <a className="joinBtn" href={WA_CHANNEL} target="_blank" rel="noreferrer">
                  Join Channel
                </a>
                <div className="joinInfo">
                  <div><b>Channel:</b> [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄</div>
                  <div><b>Developer:</b> R_hmt ofc</div>
                </div>
              </div>
            </div>
          </section>

          <section className="miniWrap">
            <div className="featuresGrid">
              <div className="featureCard">
                <div className="featureIcon">⚡</div>
                <div className="featureTitle">Proses Cepat</div>
                <div className="featureDesc">Ekstrak media dalam hitungan detik dengan sistem yang optimal.</div>
              </div>

              <div className="featureCard">
                <div className="featureIcon">🔒</div>
                <div className="featureTitle">Aman & Private</div>
                <div className="featureDesc">Data tidak disimpan, proses langsung dari sumber asli.</div>
              </div>

              <div className="featureCard">
                <div className="featureIcon">🎯</div>
                <div className="featureTitle">Preview Dulu</div>
                <div className="featureDesc">Lihat dulu konten sebelum download, pastikan sesuai kebutuhan.</div>
              </div>
            </div>
          </section>
        </>
      )}

      {data && (
        <section className="panel">
          <div className="panelHeader">
            <h2 className="h2">Hasil Media</h2>
            <div className="filtersWrap">
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

              {qualityOptions.length > 1 && (
                <div className="qFilters">
                  <div className="qTitle">Filter Kualitas</div>
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

          <div className="metaInfo">
            <div className="metaRow">
              <span className="metaLabel">Judul:</span>
              <span className="metaValue">
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
              </span>
            </div>
            
            <div className="metaRow">
              <span className="metaLabel">Sumber:</span>
              <a className="metaLink" href={data.source} target="_blank" rel="noreferrer">
                {shortUrl(data.source, 90)}
              </a>
            </div>
          </div>

          <div className="mediaList">
            {medias.map((m, i) => (
              <div className="mediaItem" key={i}>
                <div className="mediaInfo">
                  <div className="mediaTypeRow">
                    <span className="mediaType">{m.type.toUpperCase()}</span>
                    {m.quality && <span className="mediaQuality">{normalizeQuality(m.quality)}</span>}
                  </div>
                  <div className="mediaUrl">{shortUrl(m.url, 70)}</div>
                </div>

                <div className="mediaActions">
                  <button className="btnPreview" onClick={() => openPreview(m)}>
                    Preview
                  </button>
                  <a className="btnDownload" href={buildDownloadLink(m)}>
                    Download
                  </a>
                </div>
              </div>
            ))}

            {!medias.length && (
              <div className="emptyState">
                Tidak ada media yang sesuai dengan filter yang dipilih.
              </div>
            )}
          </div>
        </section>
      )}

      {previewOpen && previewItem && (
        <div className="modalBackdrop" onMouseDown={closePreview}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
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

            <div className="modalFooter">
              <a className="modalBtn" href={previewItem.url} target="_blank" rel="noreferrer">
                Buka Sumber
              </a>
              <a className="modalBtnPrimary" href={buildDownloadLink(previewItem)}>
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footerContent">
          © {new Date().getFullYear()} R_hmt ofc • Social Media Downloader
        </div>
      </footer>

      <style jsx global>{`
        html, body, #__next {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #0a0f1a;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        * {
          box-sizing: border-box;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(180deg, #0a0f1a 0%, #111827 100%);
          color: #e5e7eb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
        }

        .siteHeader {
          width: 100%;
          padding: 40px 20px 30px;
          background: linear-gradient(180deg, rgba(10, 15, 26, 0.95) 0%, rgba(10, 15, 26, 0) 100%);
          position: relative;
          z-index: 10;
        }

        .headerInner {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .siteTitle {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .siteTagline {
          margin: 16px auto 0;
          max-width: 600px;
          color: #9ca3af;
          font-size: 1.1rem;
        }

        .hero {
          width: 100%;
          min-height: 400px;
          position: relative;
          background-size: cover;
          background-position: center;
          margin-top: 0;
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10, 15, 26, 0.7) 0%, rgba(10, 15, 26, 0.9) 100%);
        }

        .heroInner {
          position: relative;
          z-index: 2;
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .heroTop {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .badge {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 0.9rem;
          color: #d1d5db;
        }

        .badge b {
          color: #60a5fa;
        }

        .inputCard {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          max-width: 800px;
          margin: 0 auto;
        }

        .inputTitle {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #f3f4f6;
          text-align: center;
        }

        .inputGroup {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .input {
          flex: 1;
          padding: 14px 18px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: #f9fafb;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .input:focus {
          border-color: #6366f1;
        }

        .input::placeholder {
          color: #9ca3af;
        }

        .btnMain {
          padding: 14px 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
          white-space: nowrap;
        }

        .btnMain:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        .btnMain:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error {
          padding: 12px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px;
          color: #f87171;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .supportedList {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .supportedItem {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .hint {
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
          margin-top: 10px;
        }

        .miniWrap {
          max-width: 1000px;
          margin: 30px auto;
          padding: 0 20px;
        }

        .howCard {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .howCard {
            grid-template-columns: 1fr;
          }
        }

        .howItem {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: transform 0.2s;
        }

        .howItem:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .howIcon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 1.2rem;
        }

        .howContent {
          flex: 1;
        }

        .howTitle {
          font-weight: 600;
          color: #f3f4f6;
          margin-bottom: 8px;
          font-size: 1.1rem;
        }

        .howDesc {
          color: #9ca3af;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .joinCard {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .joinCard {
            flex-direction: column;
            text-align: center;
          }
        }

        .joinContent {
          flex: 1;
        }

        .joinHeader {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .joinIcon {
          font-size: 2rem;
        }

        .joinTitle {
          font-weight: 600;
          color: #f3f4f6;
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .joinSubtitle {
          color: #6366f1;
          font-size: 0.9rem;
        }

        .joinDesc {
          color: #9ca3af;
          margin-bottom: 20px;
          max-width: 500px;
        }

        .joinTags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 6px 12px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 0.85rem;
          color: #818cf8;
        }

        .joinAction {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .joinBtn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .joinBtn:hover {
          transform: translateY(-2px);
        }

        .joinInfo {
          font-size: 0.85rem;
          color: #9ca3af;
          text-align: center;
        }

        .joinInfo b {
          color: #d1d5db;
        }

        .featuresGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .featuresGrid {
            grid-template-columns: 1fr;
          }
        }

        .featureCard {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: transform 0.2s;
        }

        .featureCard:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .featureIcon {
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .featureTitle {
          font-weight: 600;
          color: #f3f4f6;
          margin-bottom: 8px;
          font-size: 1.1rem;
        }

        .featureDesc {
          color: #9ca3af;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .panel {
          max-width: 1000px;
          margin: 40px auto;
          padding: 30px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
        }

        .panelHeader {
          margin-bottom: 30px;
        }

        .h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f3f4f6;
          margin: 0 0 20px 0;
        }

        .filtersWrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          color: #9ca3af;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .chipActive {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
          color: #818cf8;
        }

        .qFilters {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }

        .qTitle {
          font-size: 0.9rem;
          font-weight: 600;
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .qRow {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .qChip {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          color: #9ca3af;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qChip:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .qActive {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
          color: #818cf8;
        }

        .metaInfo {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .metaRow {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .metaRow:last-child {
          margin-bottom: 0;
        }

        .metaLabel {
          font-weight: 600;
          color: #d1d5db;
          min-width: 60px;
        }

        .metaValue {
          flex: 1;
          color: #f3f4f6;
          word-break: break-word;
        }

        .metaLink {
          flex: 1;
          color: #60a5fa;
          text-decoration: none;
          word-break: break-word;
        }

        .metaLink:hover {
          text-decoration: underline;
        }

        .seeMore {
          color: #60a5fa;
          cursor: pointer;
          margin-left: 8px;
          font-weight: 500;
        }

        .mediaList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mediaItem {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          transition: border-color 0.2s;
        }

        .mediaItem:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 640px) {
          .mediaItem {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
        }

        .mediaInfo {
          flex: 1;
        }

        .mediaTypeRow {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 8px;
        }

        .mediaType {
          font-weight: 600;
          color: #f3f4f6;
          font-size: 0.95rem;
        }

        .mediaQuality {
          padding: 4px 8px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          font-size: 0.85rem;
          color: #818cf8;
        }

        .mediaUrl {
          color: #9ca3af;
          font-size: 0.9rem;
          word-break: break-all;
        }

        .mediaActions {
          display: flex;
          gap: 10px;
        }

        .btnPreview {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #f3f4f6;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btnPreview:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btnDownload {
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .btnDownload:hover {
          transform: translateY(-2px);
        }

        .emptyState {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
          font-size: 1.1rem;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal {
          width: 100%;
          max-width: 800px;
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modalTitle {
          font-weight: 600;
          color: #f3f4f6;
          font-size: 1.1rem;
        }

        .modalClose {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #f3f4f6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modalClose:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modalBody {
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .modalMedia {
          width: 100%;
          max-height: 60vh;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        .modalAudio {
          width: 100%;
        }

        .modalFooter {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modalBtn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #f3f4f6;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .modalBtn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modalBtnPrimary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 8px;
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: transform 0.2s;
        }

        .modalBtnPrimary:hover {
          transform: translateY(-2px);
        }

        .footer {
          margin-top: 60px;
          padding: 30px 20px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footerContent {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
          color: #9ca3af;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}