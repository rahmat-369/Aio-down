// pages/index.js
import { useEffect, useMemo, useState } from "react";

// --- KONFIGURASI ---
const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";
const WA_CHANNEL_NAME = "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧";
const DEV_NAME = "R_hmt ofc";
const LOGO_URL = "https://a.top4top.io/p_36880pr920.jpeg"; // Foto Profil & BG

const PLATFORM_BG = {
  default:
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1600&q=80",
  tiktok:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=80",
  youtube:
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80",
  facebook:
    "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=1600&q=80",
  x: "https://images.unsplash.com/photo-1611605698383-ee9845280d39?auto=format&fit=crop&w=1600&q=80",
  threads:
    "https://images.unsplash.com/photo-1690322615367-27b0033c5634?auto=format&fit=crop&w=1600&q=80",
  spotify:
    "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=1600&q=80",
};

// --- LOGIC FUNCTIONS ---
function detectPlatform(url = "") {
  const u = (url || "").toLowerCase();
  if (u.includes("tiktok")) return "tiktok";
  if (u.includes("instagram")) return "instagram";
  if (u.includes("youtu")) return "youtube";
  if (u.includes("facebook") || u.includes("fb.watch")) return "facebook";
  if (u.includes("twitter") || u.includes("x.com")) return "x";
  if (u.includes("spotify")) return "spotify";
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
  return (str || "").replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, " ").trim().slice(0, 80);
}

function normalizeQuality(q = "") {
  const s = (q || "").toLowerCase();
  if (s.includes("no_watermark") || s.includes("nowatermark")) return "No Watermark";
  if (s.includes("watermark")) return "Watermark";
  if (s.includes("hd")) return "HD";
  return q || "";
}

function qualityTagKey(q = "") {
  const s = (q || "").toLowerCase();
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
    const order = ["nw", "hd", "wm", "other"];
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
        throw new Error("API tidak mengembalikan JSON.");
      }
      if (!res.ok || json?.error) throw new Error(json?.error || "Gagal mengambil media.");
      if (!json?.medias?.length) throw new Error("Media tidak ditemukan.");

      setData({
        title: json.title || "",
        source: json.source || u,
        medias: (json.medias || []).filter((m) => m?.url && m?.type).map((m) => ({
          type: m.type, url: m.url, quality: m.quality || "",
        })),
      });
    } catch (e) {
      setError(String(e?.message || e));
    }
    setLoading(false);
  }

  function openPreview(item) { setPreviewItem(item); setPreviewOpen(true); }
  function closePreview() { setPreviewOpen(false); setPreviewItem(null); }
  function buildDownloadLink(item) {
    const name = safeFilename(`${item.type}${item.quality ? "-" + item.quality : ""}`);
    return `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(name || "download")}`;
  }

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <div className="brandLeft">
          <div className="logoWrapper">
            <img src={LOGO_URL} alt="Profile" className="brandLogo" />
          </div>
          <div className="brandText">
            <span className="brandName">{DEV_NAME}</span>
            <span className="brandSub">Developer</span>
          </div>
        </div>
        
        <div className="systemStatus">
          <div className="statusDot" />
          <span className="statusText">System On</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="heroMain" style={{ backgroundImage: `url(${bg})` }}>
        <div className="heroOverlay" />
        
        <div className="heroContent">
          <div className="heroTexts">
            <h1 className="heroTitle">
              Social Media <br />
              <span className="textGradient">Downloader</span>
            </h1>
            <p className="heroDesc">
              Unduh video, audio, dan gambar dari berbagai platform sosial media tanpa watermark dengan kualitas terbaik.
            </p>
          </div>

          <div className="inputCard glass">
            <div className="inputLabel">
              Platform: <span className="platformBadge">{platform === 'default' ? 'Auto Detect' : platform.toUpperCase()}</span>
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
              Support: TikTok • IG • YT • FB • Twitter • Spotify
            </div>
          </div>
        </div>
      </section>

      {/* HASIL DOWNLOAD */}
      {data && (
        <section className="contentSection slideUp">
          <div className="panel">
            <div className="panelTop">
              <h2 className="panelH2">Result Found</h2>
              
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
                          {showFullTitle ? " Hide" : " Show More"}
                        </span>
                      )}
                    </>
                  ) : "-"}
                </span>
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
                    <div className="urlPreview">{shortUrl(m.url, 40)}</div>
                  </div>
                  <div className="actions">
                    <button className="btnSec" onClick={() => openPreview(m)}>Preview</button>
                    <a className="btnPri" href={buildDownloadLink(m)}>Download</a>
                  </div>
                </div>
              ))}
              {!medias.length && <div className="emptyState">Tidak ada media untuk filter ini.</div>}
            </div>
          </div>
        </section>
      )}

      {/* INFO CARDS & WHATSAPP */}
      {!data && (
        <section className="contentSection">
          
          <div className="featureGrid">
            <div className="featureCard">
              <div className="fIconBox">⚡</div>
              <div className="fContent">
                <div className="fTitle">Super Cepat</div>
                <div className="fDesc">Algoritma optimasi terbaru untuk proses download instan.</div>
              </div>
            </div>
            <div className="featureCard">
              <div className="fIconBox">🔒</div>
              <div className="fContent">
                <div className="fTitle">Aman & Privat</div>
                <div className="fDesc">Privasi terjaga, tanpa log history. Aman untuk semua user.</div>
              </div>
            </div>
            <div className="featureCard">
              <div className="fIconBox">💎</div>
              <div className="fContent">
                <div className="fTitle">Kualitas Asli</div>
                <div className="fDesc">Download media resolusi tinggi tanpa kompresi tambahan.</div>
              </div>
            </div>
          </div>

          {/* WHATSAPP CARD TERBARU - REVISI */}
          <div className="waCardWrapper">
            <div className="waCard">
                {/* Background tanpa blur */}
                <div className="waBgImage" style={{backgroundImage: `url(${LOGO_URL})`}}></div>
                <div className="waOverlay"></div>
                
                <div className="waContentInner">
                    <div className="waTop">
                        <div className="waIconCircle">
                            {/* Icon diganti Foto */}
                            <img src={LOGO_URL} alt="WA Icon" className="waIconImg" />
                        </div>
                        <div className="waMeta">
                            <span className="waTag">OFFICIAL CHANNEL</span>
                            <h3 className="waTitle">{WA_CHANNEL_NAME}</h3>
                            <span className="waSub">By: {DEV_NAME}</span>
                        </div>
                    </div>
                    
                    <p className="waDesc">
                        Dapatkan info update fitur terbaru, perbaikan bug, dan tools menarik lainnya langsung dari developer.
                    </p>
                    
                    <a className="waBtn" href={WA_CHANNEL_URL} target="_blank" rel="noreferrer">
                        Gabung Channel
                    </a>
                </div>
            </div>
          </div>

        </section>
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} {DEV_NAME} • Built with Passion</p>
      </footer>

      {/* MODAL */}
      {previewOpen && previewItem && (
        <div className="modalBackdrop" onMouseDown={closePreview}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <span className="modalHTitle">Preview</span>
              <button className="modalClose" onClick={closePreview}>✕</button>
            </div>
            <div className="modalContent">
              {previewItem.type === "image" && <img className="modalMedia" src={previewItem.url} alt="preview" />}
              {previewItem.type === "video" && <video className="modalMedia" src={previewItem.url} controls autoPlay />}
              {previewItem.type === "audio" && <audio className="modalAudio" src={previewItem.url} controls autoPlay />}
            </div>
            <div className="modalFooter">
              <a className="modalBtnDownload" href={buildDownloadLink(previewItem)}>Download File</a>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx global>{`
        html, body {
          margin: 0; padding: 0;
          background: #050505;
          color: #eee;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <style jsx>{`
        .page { min-height: 100vh; display: flex; flex-direction: column; }

        /* HEADER */
        .header {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 20px 24px;
          display: flex; justify-content: space-between; align-items: center;
          z-index: 50;
        }
        .brandLeft { display: flex; align-items: center; gap: 12px; }
        .logoWrapper {
            position: relative;
            width: 40px; height: 40px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.1);
        }
        .brandLogo { width: 100%; height: 100%; object-fit: cover; }
        .brandText { display: flex; flex-direction: column; justify-content: center; }
        .brandName { font-weight: 700; font-size: 14px; color: #fff; letter-spacing: 0.5px; }
        .brandSub { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }

        .systemStatus {
            display: flex; align-items: center; gap: 8px;
            background: rgba(0, 255, 136, 0.08);
            border: 1px solid rgba(0, 255, 136, 0.15);
            padding: 6px 14px; border-radius: 20px;
            backdrop-filter: blur(8px);
        }
        .statusDot {
            width: 6px; height: 6px; background-color: #00ff88;
            border-radius: 50%; box-shadow: 0 0 8px #00ff88;
            animation: pulse 2s infinite;
        }
        .statusText { font-size: 11px; font-weight: 700; color: #00ff88; text-transform: uppercase; }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
            70% { box-shadow: 0 0 0 5px rgba(0, 255, 136, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
        }

        /* HERO */
        .heroMain {
          position: relative; min-height: 85vh;
          display: flex; align-items: center; justify-content: center;
          background-size: cover; background-position: center;
          padding: 80px 20px 40px;
        }
        .heroOverlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(5,5,5,0.85) 0%, #050505 100%);
        }
        .heroContent {
          position: relative; z-index: 2; width: min(700px, 100%);
          display: flex; flex-direction: column; gap: 36px; text-align: center;
        }
        .heroTitle {
          font-size: clamp(32px, 6vw, 56px); margin: 0; line-height: 1.1; font-weight: 800; letter-spacing: -1px;
        }
        .textGradient {
          background: linear-gradient(135deg, #fff 30%, #999 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .heroDesc { font-size: 15px; color: rgba(255,255,255,0.5); margin: 10px 0 0; line-height: 1.6; }

        /* INPUT CARD */
        .inputCard {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .inputLabel { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 12px; text-align: left; }
        .platformBadge { color: #fff; font-weight: 600; }
        .inputRow { display: flex; gap: 10px; }
        .input {
          flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 14px 18px; border-radius: 12px; font-size: 15px; outline: none;
          transition: all 0.2s;
        }
        .input:focus { border-color: rgba(255,255,255,0.3); background: rgba(0,0,0,0.5); }
        .btnMain {
          background: #fff; color: #000; font-weight: 700; border: none;
          padding: 14px 28px; border-radius: 12px; cursor: pointer; font-size: 14px;
          transition: transform 0.1s;
        }
        .btnMain:hover { transform: translateY(-1px); background: #f0f0f0; }
        .btnMain:disabled { opacity: 0.6; cursor: default; transform: none; }
        .errorMsg { text-align: left; color: #ff6b6b; margin-top: 10px; font-size: 13px; font-weight: 500; }
        .inputFooter { margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.3); }

        /* CONTENT */
        .contentSection { width: min(800px, 100%); margin: 0 auto; padding: 40px 20px; }

        /* FEATURE GRID */
        .featureGrid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px; margin-bottom: 40px;
        }
        .featureCard {
          display: flex; align-items: flex-start; gap: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 20px; border-radius: 16px;
          transition: all 0.3s ease;
        }
        .featureCard:hover {
            border-color: rgba(255,255,255,0.1);
            transform: translateY(-4px);
            background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
        }
        .fIconBox {
            font-size: 24px;
            background: rgba(255,255,255,0.05);
            width: 48px; height: 48px;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .fContent { display: flex; flex-direction: column; gap: 4px; }
        .fTitle { font-weight: 700; font-size: 15px; color: #fff; }
        .fDesc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; }

        /* WA CARD REVISI (Tajam & Foto Icon) */
        .waCard {
          position: relative; border-radius: 24px; overflow: hidden;
          min-height: 240px; border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .waBgImage {
            position: absolute; inset: 0; background-size: cover; background-position: center;
            /* Filter blur dihapus */
            transform: scale(1.0);
        }
        .waOverlay {
            position: absolute; inset: 0;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(10px); /* Hanya blur konten belakang, bukan image bg sendiri */
        }
        .waContentInner {
            position: relative; z-index: 2; padding: 32px;
            display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
            height: 100%; gap: 20px;
        }
        .waTop { display: flex; align-items: center; gap: 16px; }
        
        .waIconCircle {
            width: 54px; height: 54px; 
            border-radius: 50%;
            overflow: hidden; /* Penting agar img bulat */
            border: 2px solid rgba(255,255,255,0.2);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: #000;
        }
        .waIconImg {
            width: 100%; height: 100%; object-fit: cover;
        }
        
        .waMeta { display: flex; flex-direction: column; }
        .waTag { font-size: 10px; color: #25D366; font-weight: 800; letter-spacing: 1px; margin-bottom: 2px; }
        .waTitle { font-size: 18px; font-weight: 700; margin: 0; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .waSub { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }
        .waDesc { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.6; max-width: 500px; margin: 0; }
        
        .waBtn {
            background: #25D366; color: #000; text-decoration: none;
            padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px;
            transition: all 0.2s; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
        }
        .waBtn:hover { transform: translateY(-2px); background: #22c35e; }

        @media (max-width: 600px) {
            .inputRow { flex-direction: column; }
            .waContentInner { align-items: center; text-align: center; }
            .waTop { flex-direction: column; gap: 12px; }
        }

        /* RESULT PANEL */
        .panel {
          background: #0a0a0a; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08); padding: 24px;
        }
        .panelH2 { margin: 0; font-size: 18px; font-weight: 700; color: #fff; }
        .filtersWrap { margin-top: 16px; }
        .chip {
          background: rgba(255,255,255,0.05); border: none; color: #888;
          padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: 0.2s;
        }
        .chipActive { background: #fff; color: #000; }
        
        .metaInfo { margin: 20px 0; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .metaRow { display: flex; font-size: 13px; gap: 10px; color: #ccc; }
        .metaLabel { opacity: 0.5; width: 50px; }
        .seeMore { cursor: pointer; opacity: 0.5; font-size: 11px; }

        .list { display: flex; flex-direction: column; gap: 12px; }
        .item {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          padding: 16px; border-radius: 12px;
        }
        .typeTag { font-size: 9px; font-weight: 800; background: #333; color: #fff; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; margin-right: 8px; }
        .qualityTag { font-size: 11px; color: #888; }
        .urlPreview { font-family: monospace; font-size: 11px; color: #555; margin-top: 4px; }
        
        .btnPri, .btnSec {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer;
        }
        .btnSec { background: rgba(255,255,255,0.05); color: #ccc; border: none; }
        .btnPri { background: #fff; color: #000; margin-left: 8px; }

        /* FOOTER */
        .footer { padding: 40px 0 20px; text-align: center; }
        .footer p { font-size: 11px; color: rgba(255,255,255,0.2); }

        /* MODAL */
        .modalBackdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.9);
          backdrop-filter: blur(10px); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal {
          width: min(600px, 100%); background: #111; border: 1px solid #333;
          border-radius: 16px; overflow: hidden;
        }
        .modalHeader { padding: 16px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; }
        .modalClose { background: none; border: none; color: #fff; cursor: pointer; }
        .modalContent { padding: 20px; display: flex; justify-content: center; background: #000; }
        .modalMedia { max-width: 100%; max-height: 50vh; border-radius: 8px; }
        .modalFooter { padding: 16px; border-top: 1px solid #222; display: flex; justify-content: flex-end; }
        .modalBtnDownload { background: #fff; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; }
        
        .slideUp { animation: slideUp 0.4s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}