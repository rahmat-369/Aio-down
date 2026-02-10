// pages/index.js
import { useEffect, useMemo, useState } from "react";

/**
 * FULL 1 FILE (based on your 1131 lines version)
 * Update requested:
 * 1) Intro website first (no card) with website name + colored highlight
 * 2) Tool/Input card AFTER intro
 * 3) Remove top header/navbar (none)
 * 4) Join WhatsApp card with WA logo + correct channel name + dev name
 * 5) Keep ALL existing features: preview+download for all items, filters, quality filter, long text collapse
 * 6) Fix responsive spacing so text doesn't smash together on mobile
 */

const DEV_NAME = "R_hmt ofc";
const SITE_NAME_LEFT = "All In One Social Media";
const SITE_NAME_HI = "Downloader";

const WA_CHANNEL_URL =
  "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";
const WA_CHANNEL_NAME = "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧";

const PLATFORM_BG = {
  default:
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=2000&q=80",
  tiktok:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=2000&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=2000&q=80",
  youtube:
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=2000&q=80",
  facebook:
    "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=2000&q=80",
  x: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000&q=80",
  threads:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=2000&q=80",
  pinterest:
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=2000&q=80",
  snapchat:
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80",
  spotify:
    "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=2000&q=80",
  soundcloud:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=2000&q=80",
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

function clampText(text = "", limit = 260) {
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
    .slice(0, 90);
}

function normalizeQuality(q = "") {
  const s = (q || "").toLowerCase();
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark")))
    return "HD • No Watermark";
  if (s.includes("no_watermark") || s.includes("nowatermark") || s.includes("no-watermark"))
    return "No Watermark";
  if (s.includes("watermark")) return "Watermark";
  if (s.includes("hd")) return "HD";
  return q || "";
}

function qualityTagKey(q = "") {
  const s = (q || "").toLowerCase();
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark")))
    return "hd_nw";
  if (s.includes("no_watermark") || s.includes("nowatermark") || s.includes("no-watermark"))
    return "nw";
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
  const platformLabel = platform === "default" ? "UNKNOWN" : platform.toUpperCase();

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
    setTypeFilter("all");
    setShowFullTitle(false);
  }, [data?.source]);

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
        throw new Error("API tidak mengembalikan JSON. Cek /api/download & deploy logs.");
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

  const hasData = !!data;

  return (
    <div className="page">
      {/* INTRO (NO CARD) */}
      <section className="intro">
        <div className="container">
          <div className="kicker">
            <span className="kDot" />
            <span className="kText">Welcome</span>
            <span className="kSep">•</span>
            <span className="kSub">{DEV_NAME}</span>
          </div>

          <h1 className="title">
            {SITE_NAME_LEFT} <span className="titleHi">{SITE_NAME_HI}</span>
          </h1>

          <p className="desc">
            Unduh <b>video</b>, <b>image</b>, dan <b>audio</b> dari berbagai platform sosial media.
            Ada <b>Preview</b> dulu sebelum <b>Download</b>. Tampilan nyaman untuk mobile & desktop (DeX friendly).
          </p>

          <p className="supported">
            <span className="supLabel">Supported:</span>
            <span className="supItems">
              TikTok • Instagram • Facebook • X • YouTube • Threads • Pinterest • Snapchat • Spotify • SoundCloud
            </span>
          </p>

          <div className="pills">
            <span className="pill">Preview-first</span>
            <span className="pill">Download always</span>
            <span className="pill">Minimal UI</span>
          </div>
        </div>
      </section>

      {/* TOOL CARD (AFTER INTRO) */}
      <section className="tool">
        <div className="container">
          <div className="toolCard" style={{ backgroundImage: `url(${bg})` }}>
            <div className="toolOverlay" />

            <div className="toolInner">
              <div className="toolTop">
                <div className="miniBrand">
                  <span className="brandDot" />
                  <span className="brandName">{DEV_NAME}</span>
                  <span className="brandSub">• tool</span>
                </div>

                <div className="badge">
                  Detected: <b>{platformLabel}</b>
                </div>
              </div>

              <div className="toolTitle">
                <div className="toolH">Paste your link</div>
                <div className="toolP">Tempel link → klik Get Media → pilih Preview/Download.</div>
              </div>

              <div className="inputRow">
                <input
                  className="input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  inputMode="url"
                />
                <button className="btnMain" onClick={onSubmit} disabled={loading}>
                  {loading ? "Loading..." : "Get Media"}
                </button>
              </div>

              {error && <div className="error">❌ {error}</div>}

              <div className="hint">
                Tips: YouTube kadang gagal karena URL media expiring/protected (ini dari sumber linknya, bukan UI).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EMPTY STATE (BIAR GA KOSONG) */}
      {!hasData && (
        <>
          <section className="section">
            <div className="container">
              <div className="howCard">
                <div className="howItem">
                  <div className="howNum">①</div>
                  <div>
                    <div className="howTitle">Paste Link</div>
                    <div className="howDesc">Masukkan link sosial media yang kamu mau unduh.</div>
                  </div>
                </div>

                <div className="howItem">
                  <div className="howNum">②</div>
                  <div>
                    <div className="howTitle">Preview</div>
                    <div className="howDesc">Cek dulu kualitas / tipe media sebelum download.</div>
                  </div>
                </div>

                <div className="howItem">
                  <div className="howNum">③</div>
                  <div>
                    <div className="howTitle">Download</div>
                    <div className="howDesc">Download langsung—video, audio, maupun image.</div>
                  </div>
                </div>
              </div>

              <div className="featureGrid">
                <div className="featureCard">
                  <div className="fTitle">⚡ Auto-Select</div>
                  <div className="fDesc">Pilih kualitas terbaik kalau tersedia. Filter tetap ada buat manual.</div>
                </div>
                <div className="featureCard">
                  <div className="fTitle">🔒 Proxy Download</div>
                  <div className="fDesc">Biar file beneran ke-download (bukan cuma kebuka di tab).</div>
                </div>
                <div className="featureCard">
                  <div className="fTitle">🎯 Consistent Buttons</div>
                  <div className="fDesc">Semua media selalu punya tombol Preview + Download (termasuk foto).</div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* RESULT */}
      {hasData && (
        <section className="section">
          <div className="container">
            <div className="panel">
              <div className="panelTop">
                <div>
                  <h2 className="h2">Result</h2>
                  <div className="panelSub">
                    Source:{" "}
                    <a className="link" href={data.source} target="_blank" rel="noreferrer">
                      {shortUrl(data.source, 95)}
                    </a>
                  </div>
                </div>

                <div className="filtersWrap">
                  <div className="filters">
                    {["all", "video", "image", "audio"].map((t) => (
                      <button
                        key={t}
                        className={typeFilter === t ? "chip chipActive" : "chip"}
                        onClick={() => setTypeFilter(t)}
                        type="button"
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {qualityOptions.length > 1 && (
                    <div className="qFilters">
                      <div className="qTitle">Quality Filter</div>
                      <div className="qRow">
                        {qualityOptions.map((q) => (
                          <button
                            key={q.key}
                            className={qualityFilter === q.key ? "qChip qActive" : "qChip"}
                            onClick={() => setQualityFilter(q.key)}
                            type="button"
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

              <div className="list">
                {medias.map((m, i) => (
                  <div className="item" key={i}>
                    <div className="left">
                      <div className="typeRow">
                        <span className="type">{m.type.toUpperCase()}</span>
                        {m.qualityLabel ? <span className="quality">{m.qualityLabel}</span> : null}
                      </div>
                      <div className="small">{shortUrl(m.url, 90)}</div>
                    </div>

                    <div className="actions">
                      <button className="btn preview" type="button" onClick={() => openPreview(m)}>
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
            </div>
          </div>
        </section>
      )}

      {/* JOIN WHATSAPP (ALWAYS SHOW) */}
      <section className="section">
        <div className="container">
          <div className="joinCard">
            <div className="joinLeft">
              <div className="waLogo" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" className="waSvg">
                  <path
                    d="M12 2a9.5 9.5 0 0 0-8.22 14.25L3 22l5.92-1.55A9.5 9.5 0 1 0 12 2z"
                    fill="currentColor"
                    opacity="0.22"
                  />
                  <path
                    d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3l-.5 3.1 3.1-.8A8.2 8.2 0 1 0 12 3.8z"
                    fill="currentColor"
                    opacity="0.18"
                  />
                  <path
                    d="M16.9 13.7c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.8.9-.1.1-.3.1-.5 0s-.9-.3-1.7-1.1c-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 1.9s.9 2.2 1 2.3c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.2-1 0-.1-.2-.2-.4-.3z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <div className="joinTitle">{WA_CHANNEL_NAME}</div>
                <div className="joinDesc">
                  Join WhatsApp Channel untuk update tools, AI, dan perkembangan project.{" "}
                  <span className="joinDev">Dev: <b>{DEV_NAME}</b></span>
                </div>
                <div className="joinBadges">
                  <span className="joinTag">Update</span>
                  <span className="joinTag">Tools</span>
                  <span className="joinTag">Code</span>
                  <span className="joinTag">AI</span>
                </div>
              </div>
            </div>

            <div className="joinRight">
              <a className="joinBtn" href={WA_CHANNEL_URL} target="_blank" rel="noreferrer">
                Join Channel
              </a>
              <div className="joinSmall">WhatsApp Official Channel</div>
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW MODAL */}
      {previewOpen && previewItem && (
        <div className="modalBackdrop" onMouseDown={closePreview}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div className="modalTitle">
                Preview • {previewItem.type.toUpperCase()}
                {previewItem.quality ? ` (${normalizeQuality(previewItem.quality)})` : ""}
              </div>
              <button className="modalClose" onClick={closePreview} type="button">
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

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} <b>{DEV_NAME}</b> • {SITE_NAME_LEFT}{" "}
        <span className="footerHi">{SITE_NAME_HI}</span>
      </footer>

      {/* GLOBAL CSS */}
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #060812;
          overflow-x: hidden;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      {/* PAGE CSS */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(1100px 600px at 18% 0%, rgba(155, 92, 255, 0.18), transparent 60%),
            radial-gradient(1100px 600px at 82% 0%, rgba(55, 245, 255, 0.14), transparent 60%),
            linear-gradient(180deg, #060812, #0b0f1c);
          color: rgba(255, 255, 255, 0.92);
          font-family: Arial, sans-serif;
          padding-bottom: 34px;
        }

        .container {
          width: min(1180px, calc(100% - 24px));
          margin: 0 auto;
        }

        /* INTRO */
        .intro {
          padding-top: 18px;
          padding-bottom: 8px;
        }
        .kicker {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }
        .kDot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(55, 245, 255, 1), rgba(155, 92, 255, 1), rgba(255, 79, 216, 1));
          box-shadow: 0 0 18px rgba(55, 245, 255, 0.18);
        }
        .kText {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.88);
        }
        .kSep {
          opacity: 0.6;
        }
        .kSub {
          opacity: 0.86;
        }

        .title {
          margin: 0;
          font-weight: 950;
          letter-spacing: -0.8px;
          font-size: clamp(30px, 5vw, 54px);
          line-height: 1.08;
        }
        .titleHi {
          background: linear-gradient(90deg, rgba(55, 245, 255, 0.95), rgba(155, 92, 255, 0.95), rgba(255, 79, 216, 0.95));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .desc {
          margin: 12px 0 0;
          max-width: 90ch;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.74);
          font-size: 14px;
        }

        .supported {
          margin: 12px 0 0;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.65);
          font-size: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: baseline;
        }
        .supLabel {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.8);
        }
        .supItems {
          opacity: 0.9;
          word-break: break-word;
        }

        .pills {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pill {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.78);
          font-size: 12px;
          font-weight: 900;
        }

        /* TOOL */
        .tool {
          margin-top: 16px;
        }
        .toolCard {
          position: relative;
          border-radius: 18px;
          min-height: 340px;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .toolCard {
            min-height: 420px;
          }
        }
        .toolOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.76), rgba(0, 0, 0, 0.56), rgba(11, 15, 28, 1));
        }
        .toolInner {
          position: relative;
          z-index: 2;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .toolTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .miniBrand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .brandDot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(55, 245, 255, 1), rgba(155, 92, 255, 1), rgba(255, 79, 216, 1));
          box-shadow: 0 0 18px rgba(55, 245, 255, 0.18);
        }
        .brandName {
          font-weight: 950;
          font-size: 13px;
        }
        .brandSub {
          opacity: 0.65;
          font-size: 12px;
        }

        .badge {
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.86);
          white-space: nowrap;
        }

        .toolH {
          font-size: 22px;
          font-weight: 950;
          margin-bottom: 6px;
        }
        .toolP {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
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
          width: min(820px, 100%);
        }
        .input {
          flex: 1;
          min-width: 240px;
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
          font-weight: 950;
          background: rgba(255, 255, 255, 0.94);
          color: rgba(0, 0, 0, 0.92);
        }
        .btnMain:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          font-weight: 900;
          color: #ff7a7a;
        }
        .hint {
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          line-height: 1.6;
        }

        /* SECTIONS */
        .section {
          margin-top: 14px;
        }

        .howCard {
          margin-top: 10px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          padding: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.22);
        }
        @media (max-width: 860px) {
          .howCard {
            grid-template-columns: 1fr;
          }
        }
        .howItem {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.22);
        }
        .howNum {
          width: 34px;
          height: 34px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .howTitle {
          font-weight: 950;
          margin-bottom: 4px;
        }
        .howDesc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.66);
          line-height: 1.55;
        }

        .featureGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 920px) {
          .featureGrid {
            grid-template-columns: 1fr;
          }
        }
        .featureCard {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.22);
        }
        .fTitle {
          font-weight: 950;
          margin-bottom: 6px;
        }
        .fDesc {
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
        }

        /* RESULT PANEL */
        .panel {
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.32);
          padding: 16px;
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
          font-weight: 950;
        }
        .panelSub {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.66);
          line-height: 1.6;
        }
        .link {
          color: rgba(147, 197, 253, 0.95);
          text-decoration: none;
          word-break: break-word;
        }
        .link:hover {
          text-decoration: underline;
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
          font-weight: 900;
        }
        .chipActive {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.22);
          color: rgba(255, 255, 255, 0.95);
        }

        .qFilters {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.22);
          padding: 10px;
        }
        .qTitle {
          font-size: 12px;
          font-weight: 950;
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
          font-weight: 950;
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
          font-weight: 950;
          margin-left: 6px;
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
          min-width: 260px;
        }
        .typeRow {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .type {
          font-weight: 950;
          font-size: 14px;
        }
        .quality {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.74);
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
          font-weight: 950;
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
          padding: 12px;
          border-radius: 14px;
          border: 1px dashed rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.14);
        }

        /* JOIN CARD */
        .joinCard {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.22);
          padding: 16px;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.26);
        }
        .joinLeft {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          min-width: 280px;
          flex: 1;
        }
        .waLogo {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(45, 255, 143, 0.28);
          background: rgba(45, 255, 143, 0.12);
          color: rgba(45, 255, 143, 0.95);
          flex: 0 0 auto;
        }
        .joinTitle {
          font-weight: 950;
          font-size: 14px;
        }
        .joinDesc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.6;
          margin-top: 6px;
        }
        .joinDev {
          color: rgba(255, 255, 255, 0.85);
        }
        .joinBadges {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .joinTag {
          font-size: 11px;
          font-weight: 950;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.78);
        }
        .joinRight {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        @media (max-width: 900px) {
          .joinRight {
            align-items: flex-start;
          }
        }
        .joinBtn {
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 14px;
          font-weight: 950;
          border: 1px solid rgba(45, 255, 143, 0.32);
          background: rgba(45, 255, 143, 0.16);
          color: rgba(255, 255, 255, 0.95);
        }
        .joinSmall {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
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
          width: min(960px, 100%);
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
          font-weight: 950;
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
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
          font-weight: 950;
        }
        .modalBtnPrimary {
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(45, 255, 143, 0.32);
          background: rgba(45, 255, 143, 0.16);
          color: rgba(255, 255, 255, 0.96);
          font-weight: 950;
        }

        /* FOOTER */
        .footer {
          margin-top: 22px;
          width: min(1180px, calc(100% - 24px));
          margin-left: auto;
          margin-right: auto;
          padding: 10px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
          text-align: center;
        }
        .footerHi {
          background: linear-gradient(90deg, rgba(55, 245, 255, 0.95), rgba(155, 92, 255, 0.95), rgba(255, 79, 216, 0.95));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 950;
        }
      `}</style>
    </div>
  );
}