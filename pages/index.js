 // pages/index.js
import { useEffect, useMemo, useState } from "react";

// --- KONFIGURASI & LOGIKA (TIDAK BERUBAH) ---

const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";
const WA_CHANNEL_NAME = "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧";
const DEV_NAME = "R_hmt ofc";

const PLATFORM_BG = {
  default:
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1600&q=80", // Abstract Dark
  tiktok:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=80",
  youtube:
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80",
  facebook:
    "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=1600&q=80",
  x: "https://images.unsplash.com/photo-1611605698383-ee9845280d39?auto=format&fit=crop&w=1600&q=80", // Twitter/X abstract
  threads:
    "https://images.unsplash.com/photo-1690322615367-27b0033c5634?auto=format&fit=crop&w=1600&q=80",
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

// Icon WhatsApp SVG
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="32"
    height="32"
    fill="currentColor"
    className="waIcon"
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.005.54 1.961.884 2.806.884 3.182 0 5.769-2.586 5.769-5.766.001-3.18-2.584-5.767-5.769-5.767zm.992 9.079c-1.745.975-2.859.39-3.078.17-.674-.675-1.928-2.316-1.523-3.692.174-.593.593-.846.858-.888.312-.05.513-.03.626.241.135.324.457 1.106.505 1.196.068.128.02.32-.132.502-.134.16-.184.22-.303.366-.129.158-.291.24-.132.52.164.29.728 1.189 1.564 1.934 1.057.94 1.84 1.137 2.193 1.026.19-.06.772-.821.892-1.053.13-.252.193-.201.442-.086.249.115 1.583.749 1.708.811.125.062.208.093.24.156.031.062.067 1.157-.597 1.638-.597.432-1.393.188-1.393.188zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

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

  return (
    <div className="page">
      {/* HEADER UTAMA */}
      <header className="header">
        <div className="brandName">{DEV_NAME}</div>
        <div className="brandTag">Dev Tools</div>
      </header>

      {/* HERO SECTION BESAR (Welcome Area) */}
      <section className="heroMain" style={{ backgroundImage: `url(${bg})` }}>
        <div className="heroOverlay" />
        
        <div className="heroContent">
          <div className="heroTexts">
            <h1 className="heroTitle">
              Universal Social Media <br />
              <span className="textGradient">Downloader</span>
            </h1>
            <p className="heroDesc">
              Tools canggih untuk download video, audio, dan gambar dari berbagai platform sosial media tanpa watermark. Gratis, cepat, dan mudah digunakan.
            </p>
          </div>

          {/* INPUT CARD SEKARANG DISINI */}
          <div className="inputCard glass">
            <div className="inputLabel">
              Platform detected: <span className="platformBadge">{platform === 'default' ? 'Auto Detect' : platform.toUpperCase()}</span>
            </div>
            
            <div className="inputRow">
              <input
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste link video/post disini..."
                inputMode="url"
              />
              <button className="btnMain" onClick={onSubmit} disabled={loading}>
                {loading ? "Process..." : "Download"}
              </button>
            </div>
            
            {error && <div className="errorMsg">⚠️ {error}</div>}
            
            <div className="inputFooter">
              Support: TikTok • IG • YT • FB • Twitter • Spotify & more
            </div>
          </div>
        </div>
      </section>

      {/* HASIL DOWNLOAD */}
      {data && (
        <section className="contentSection slideUp">
          <div className="panel">
            <div className="panelTop">
              <h2 className="panelH2">Download Result</h2>
              
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
                    <div className="qTitle">Pilih Kualitas</div>
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
                <span className="metaLabel">Title:</span>
                <span className="metaValue">
                  {title ? (
                    <>
                      {showFullTitle ? title : shortTitle}
                      {titleLong && (
                        <span className="seeMore" onClick={() => setShowFullTitle((v) => !v)}>
                          {showFullTitle ? " Sembunyikan" : " Selengkapnya"}
                        </span>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
              <div className="metaRow">
                <span className="metaLabel">Source:</span>
                <a className="link" href={data.source} target="_blank" rel="noreferrer">
                  {shortUrl(data.source, 60)} ↗
                </a>
              </div>
            </div>

            <div className="list">
              {medias.map((m, i) => (
                <div className="item" key={i}>
                  <div className="left">
                    <div className="typeRow">
                      <span className={`typeTag ${m.type}`}>{m.type}</span>
                      {m.quality ? <span className="qualityTag">{normalizeQuality(m.quality)}</span> : null}
                    </div>
                    <div className="urlPreview">{shortUrl(m.url, 50)}</div>
                  </div>

                  <div className="actions">
                    <button className="btnSec" onClick={() => openPreview(m)}>
                      Preview
                    </button>
                    <a className="btnPri" href={buildDownloadLink(m)}>
                      Download File
                    </a>
                  </div>
                </div>
              ))}

              {!medias.length && <div className="emptyState">Tidak ada media untuk filter ini.</div>}
            </div>
          </div>
        </section>
      )}

      {/* INFO CARDS (Tampil jika belum ada data) */}
      {!data && (
        <section className="contentSection">
          {/* JOIN WHATSAPP CARD - REVISED */}
          <div className="waCard">
            <div className="waIconBox">
              <WhatsAppIcon />
            </div>
            <div className="waContent">
              <div className="waLabel">Join Official Channel</div>
              <div className="waChannelName">{WA_CHANNEL_NAME}</div>
              <div className="waDevName">By: {DEV_NAME}</div>
              <div className="waDesc">
                Dapatkan info update fitur terbaru, perbaikan bug, dan tools menarik lainnya langsung dari developer.
              </div>
            </div>
            <a className="waBtn" href={WA_CHANNEL_URL} target="_blank" rel="noreferrer">
              Gabung Sekarang
            </a>
          </div>

          <div className="featureGrid">
            <div className="featureCard">
              <div className="fIcon">⚡</div>
              <div className="fTitle">Super Cepat</div>
              <div className="fDesc">Proses scraping data yang dioptimalkan untuk kecepatan maksimal.</div>
            </div>
            <div className="featureCard">
              <div className="fIcon">🔒</div>
              <div className="fTitle">Aman & Privat</div>
              <div className="fDesc">Kami tidak menyimpan log history download Anda. Privacy first.</div>
            </div>
            <div className="featureCard">
              <div className="fIcon">💎</div>
              <div className="fTitle">High Quality</div>
              <div className="fDesc">Mendukung resolusi HD, 4K, hingga Audio 320kbps jika tersedia.</div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footerLine"></div>
        <p>© {new Date().getFullYear()} {DEV_NAME} • Built with Passion</p>
      </footer>

      {/* PREVIEW MODAL */}
      {previewOpen && previewItem && (
        <div className="modalBackdrop" onMouseDown={closePreview}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <span className="modalHTitle">Preview Media</span>
              <button className="modalClose" onClick={closePreview}>✕</button>
            </div>
            <div className="modalContent">
              {previewItem.type === "image" && (
                <img className="modalMedia" src={previewItem.url} alt="preview" />
              )}
              {previewItem.type === "video" && (
                <video className="modalMedia" src={previewItem.url} controls autoPlay />
              )}
              {previewItem.type === "audio" && (
                <audio className="modalAudio" src={previewItem.url} controls autoPlay />
              )}
            </div>
            <div className="modalFooter">
              <a className="modalBtnDownload" href={buildDownloadLink(previewItem)}>
                Download Sekarang
              </a>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL CSS */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #02040a;
          color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow-x: hidden;
        }
        * { box-sizing: border-box; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0b0f19; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      {/* PAGE CSS */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* HEADER */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 50;
        }
        .brandName {
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.5px;
          color: rgba(255,255,255,0.9);
        }
        .brandTag {
          font-size: 11px;
          font-weight: 700;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 20px;
          color: rgba(255,255,255,0.7);
        }

        /* HERO MAIN */
        .heroMain {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: cover;
          background-position: center;
          padding: 80px 20px 40px;
          transition: background-image 0.5s ease;
        }
        .heroOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(2,4,10,0.8) 0%, rgba(2,4,10,0.95) 100%);
        }
        .heroContent {
          position: relative;
          z-index: 2;
          width: min(800px, 100%);
          display: flex;
          flex-direction: column;
          gap: 40px;
          text-align: center;
        }

        .heroTexts {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .heroTitle {
          margin: 0;
          font-size: clamp(32px, 6vw, 64px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -1.5px;
        }

        .textGradient {
          background: linear-gradient(135deg, #00f2ff, #00c3ff, #6a00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .heroDesc {
          margin: 0;
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          max-width: 600px;
          line-height: 1.6;
        }

        /* GLASS INPUT CARD */
        .inputCard {
          background: rgba(20, 25, 40, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          width: 100%;
        }

        .inputLabel {
          text-align: left;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .platformBadge {
          color: #00f2ff;
          font-weight: 700;
        }

        .inputRow {
          display: flex;
          gap: 12px;
        }
        
        @media (max-width: 600px) {
          .inputRow { flex-direction: column; }
        }

        .input {
          flex: 1;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          padding: 16px;
          border-radius: 14px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #00f2ff;
        }

        .btnMain {
          background: white;
          color: black;
          font-weight: 800;
          border: none;
          padding: 16px 32px;
          border-radius: 14px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        }
        .btnMain:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255,255,255,0.15);
        }
        .btnMain:disabled {
          opacity: 0.7;
          transform: none;
          cursor: not-allowed;
        }

        .errorMsg {
          text-align: left;
          color: #ff5555;
          margin-top: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        .inputFooter {
          margin-top: 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }

        /* CONTENT SECTION */
        .contentSection {
          width: min(800px, 100%);
          margin: 0 auto;
          padding: 40px 20px;
        }

        /* WA CARD */
        .waCard {
          display: flex;
          align-items: center;
          gap: 20px;
          background: linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(18, 140, 126, 0.05));
          border: 1px solid rgba(37, 211, 102, 0.3);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 40px;
        }
        @media (max-width: 700px) {
          .waCard { flex-direction: column; text-align: center; }
        }

        .waIconBox {
          width: 60px;
          height: 60px;
          background: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
        }
        .waContent { flex: 1; }
        .waLabel {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #25D366;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .waChannelName {
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin-bottom: 4px;
        }
        .waDevName {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 10px;
        }
        .waDesc {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
        }
        .waBtn {
          display: inline-block;
          background: #25D366;
          color: #0b141a;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 14px;
          transition: transform 0.2s;
        }
        .waBtn:hover { transform: scale(1.05); }

        /* FEATURE GRID */
        .featureGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .featureCard {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 24px;
          border-radius: 18px;
          transition: background 0.2s;
        }
        .featureCard:hover { background: rgba(255,255,255,0.06); }
        .fIcon { font-size: 24px; margin-bottom: 12px; }
        .fTitle { font-weight: 700; font-size: 16px; margin-bottom: 8px; }
        .fDesc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }

        /* RESULT PANEL */
        .panel {
          background: #0e121b;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 24px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }
        
        .panelTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 20px;
        }
        
        .panelH2 { margin: 0; font-size: 20px; font-weight: 800; }
        
        .filtersWrap { flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
        @media (max-width: 600px) { .filtersWrap { align-items: flex-start; } }

        .filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .chipActive { background: white; color: black; border-color: white; }

        .qFilters {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.05);
          padding: 6px 12px;
          border-radius: 12px;
        }
        .qTitle { font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 700; }
        .qRow { display: flex; gap: 6px; }
        .qChip {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }
        .qActive { background: rgba(0, 242, 255, 0.2); color: #00f2ff; }

        .metaInfo {
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .metaRow { display: flex; gap: 12px; font-size: 14px; }
        .metaLabel { width: 60px; color: rgba(255,255,255,0.4); }
        .metaValue { flex: 1; color: rgba(255,255,255,0.9); font-weight: 500; }
        .link { color: #00f2ff; text-decoration: none; }
        .seeMore { color: #aaa; cursor: pointer; font-size: 12px; margin-left: 6px; }

        /* LIST ITEMS */
        .list { display: flex; flex-direction: column; gap: 12px; }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 16px;
          border-radius: 16px;
          flex-wrap: wrap;
        }
        .left { flex: 1; min-width: 200px; }
        .typeRow { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
        
        .typeTag {
          font-size: 10px; font-weight: 900; text-transform: uppercase;
          padding: 4px 8px; border-radius: 6px; background: #333; color: #fff;
        }
        .typeTag.video { background: #E1306C; }
        .typeTag.image { background: #5851DB; }
        .typeTag.audio { background: #1DB954; }
        
        .qualityTag { font-size: 11px; color: rgba(255,255,255,0.7); }
        .urlPreview { font-size: 12px; color: rgba(255,255,255,0.4); font-family: monospace; }
        
        .actions { display: flex; gap: 10px; }
        .btnSec, .btnPri {
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
        }
        .btnSec {
          background: rgba(255,255,255,0.08);
          color: white;
          border: none;
        }
        .btnPri {
          background: white;
          color: black;
          border: none;
        }
        .emptyState { text-align: center; padding: 20px; color: rgba(255,255,255,0.4); font-size: 14px; }

        /* FOOTER */
        .footer {
          margin-top: auto;
          padding: 40px 20px 20px;
          text-align: center;
        }
        .footerLine { height: 1px; background: rgba(255,255,255,0.1); width: 100%; max-width: 200px; margin: 0 auto 20px; }
        .footer p { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }

        /* MODAL */
        .modalBackdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(5px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          padding: 20px;
        }
        .modal {
          width: min(700px, 100%);
          background: #111;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .modalHeader {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .modalHTitle { font-weight: 700; font-size: 16px; }
        .modalClose { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
        .modalContent {
          padding: 20px;
          display: flex; justify-content: center;
          background: #000;
        }
        .modalMedia { max-width: 100%; max-height: 60vh; border-radius: 8px; }
        .modalAudio { width: 100%; }
        .modalFooter {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex; justify-content: flex-end;
          background: #151515;
        }
        .modalBtnDownload {
          background: #00f2ff;
          color: #000;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 800;
          text-decoration: none;
          font-size: 14px;
        }
        
        /* Animations */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slideUp { animation: slideUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}