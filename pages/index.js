// pages/index.js
import { useEffect, useMemo, useState } from "react";

/**
 * ✅ FULL 1 FILE
 * - Intro (nama website + deskripsi) SEBELUM input
 * - Input/tool card setelah info website
 * - Result: type filter + quality filter (TikTok/umum) + preview + download (SEMUA media)
 * - Long text collapse + "lihat semua"
 * - Join WhatsApp card + logo WA + nama channel yang BENAR + dev name yang BENAR
 * - Empty state sections biar gak kosong (How it works + highlights + join)
 * - Full width, desktop + mobile (DeX friendly)
 * - No header/navbar di atas
 *
 * NOTE:
 * - Tombol download pakai /api/proxy?url=...
 * - Ambil media pakai /api/download (POST {url})
 */

/* ===================== CONFIG ===================== */
const WEBSITE_TITLE_LEFT = "All In One Social Media";
const WEBSITE_TITLE_HIGHLIGHT = "Downloader"; // bagian warna beda
const DEV_NAME = "R_hmt ofc";

const WA_CHANNEL_NAME = "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧";
const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";

// Placeholder background (ganti sesuka lu)
const PLATFORM_BG = {
  default:
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=2400&q=80",
  tiktok:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=2400&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=2400&q=80",
  youtube:
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=2400&q=80",
  facebook:
    "https://images.unsplash.com/photo-1611162618071-b39a2ec05542?auto=format&fit=crop&w=2400&q=80",
  x: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2400&q=80",
  threads:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=2400&q=80",
  pinterest:
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=2400&q=80",
  snapchat:
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2400&q=80",
  spotify:
    "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=2400&q=80",
  soundcloud:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=2400&q=80",
};

/* ===================== HELPERS ===================== */
function detectPlatformKey(url = "") {
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

function detectPlatformLabel(url = "") {
  const k = detectPlatformKey(url);
  if (k === "default") return "UNKNOWN";
  return k.toUpperCase();
}

function clampText(text = "", limit = 240) {
  if (!text) return { short: "", isLong: false };
  const isLong = text.length > limit;
  return { short: isLong ? text.slice(0, limit) + "…" : text, isLong };
}

function shortUrl(url = "", limit = 80) {
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
  // TikTok style
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark")))
    return "HD • No Watermark";
  if (s.includes("no_watermark") || s.includes("nowatermark") || s.includes("no-watermark"))
    return "No Watermark";
  if (s.includes("watermark")) return "Watermark";
  if (s.includes("hd")) return "HD";
  // fallback
  return q || "";
}

function qualityTagKey(q = "") {
  const s = (q || "").toLowerCase();
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark"))) return "hd_nw";
  if (s.includes("no_watermark") || s.includes("nowatermark") || s.includes("no-watermark")) return "nw";
  if (s.includes("watermark")) return "wm";
  if (s.includes("hd")) return "hd";
  return "other";
}

function isProbablyUrl(s = "") {
  return /^https?:\/\//i.test((s || "").trim());
}

/* ===================== COMPONENT ===================== */
export default function Home() {
  // Tool state
  const [url, setUrl] = useState("");
  const [platformKey, setPlatformKey] = useState("default");
  const [platformLabel, setPlatformLabel] = useState("UNKNOWN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Response state: {title, source, medias:[{type,url,quality}]}
  const [data, setData] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all"); // all|video|image|audio
  const [qualityFilter, setQualityFilter] = useState("all"); // all|hd_nw|nw|hd|wm|other (dynamic)

  // Title collapse
  const [showFullTitle, setShowFullTitle] = useState(false);

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Intro animations (tiny polish)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Detect platform from input
  useEffect(() => {
    setPlatformKey(detectPlatformKey(url));
    setPlatformLabel(detectPlatformLabel(url));
  }, [url]);

  // Background image depends on detected platform
  const heroBg = PLATFORM_BG[platformKey] || PLATFORM_BG.default;

  // Build quality options from current data (video medias)
  const qualityOptions = useMemo(() => {
    const medias = data?.medias || [];
    const vids = medias.filter((m) => m?.type === "video");
    const set = new Map(); // key -> label

    for (const v of vids) {
      const raw = v?.quality || "";
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

  // Reset filters when new data arrives
  useEffect(() => {
    setTypeFilter("all");
    setQualityFilter("all");
    setShowFullTitle(false);
  }, [data?.source]);

  // Filtered medias
  const medias = useMemo(() => {
    const list = (data?.medias || [])
      .filter((m) => m?.url && m?.type)
      .map((m) => ({
        ...m,
        qualityLabel: normalizeQuality(m.quality || ""),
        qualityKey: qualityTagKey(m.quality || ""),
      }));

    let out = list;

    if (typeFilter !== "all") out = out.filter((m) => m.type === typeFilter);

    // Quality filter applies ONLY to video
    if (qualityFilter !== "all") {
      out = out.filter((m) => (m.type === "video" ? m.qualityKey === qualityFilter : true));
    }

    return out;
  }, [data, typeFilter, qualityFilter]);

  // Title display
  const title = data?.title || "";
  const { short: shortTitle, isLong: titleLong } = clampText(title, 260);

  // Submit handler
  async function onSubmit() {
    setError("");
    setData(null);
    setShowFullTitle(false);

    const input = (url || "").trim();
    if (!input) return setError("Masukkan URL dulu.");
    if (!isProbablyUrl(input)) return setError("URL harus diawali http:// atau https://");

    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
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
        source: json.source || input,
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

  // Preview modal controls
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

  // UI flags
  const hasData = !!data;
  const showQualityFilter = qualityOptions.length > 1; // show if any quality exists in videos

  return (
    <div className={`page ${mounted ? "mounted" : ""}`}>
      {/* ===================== BACKDROP / AMBIENCE ===================== */}
      <div className="ambient">
        <div className="glow g1" />
        <div className="glow g2" />
        <div className="grain" />
      </div>

      {/* ===================== INTRO (TANPA CARD) ===================== */}
      <section className="intro">
        <div className="introInner">
          <div className="kicker">
            <span className="kDot" />
            <span className="kText">Welcome</span>
            <span className="kSep">•</span>
            <span className="kSub">{DEV_NAME}</span>
          </div>

          <h1 className="title">
            {WEBSITE_TITLE_LEFT}{" "}
            <span className="titleHi">{WEBSITE_TITLE_HIGHLIGHT}</span>
          </h1>

          <p className="desc">
            Unduh <b>video</b>, <b>image</b>, dan <b>audio</b> dari berbagai platform. Ada{" "}
            <b>Preview</b> dulu sebelum <b>Download</b>. Tampilan dibuat nyaman untuk mobile & desktop (DeX friendly).
          </p>

          <div className="supportRow">
            <span className="supportLabel">Supported:</span>
            <span className="supportItems">
              TikTok • Instagram • Facebook • X • YouTube • Threads • Pinterest • Snapchat • Spotify • SoundCloud
            </span>
          </div>

          <div className="introMeta">
            <span className="metaPill">Preview-first</span>
            <span className="metaPill">Download button always</span>
            <span className="metaPill">Minimal UI</span>
          </div>
        </div>
      </section>

      {/* ===================== TOOL CARD (INPUT SETELAH INFO) ===================== */}
      <section className="toolWrap">
        <div className="toolHero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="toolOverlay" />

          <div className="toolInner">
            <div className="toolTop">
              <div className="brandMini">
                <span className="brandDot" />
                <span className="brandName">{DEV_NAME}</span>
                <span className="brandSub">• tool</span>
              </div>

              <div className="detected">
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
      </section>

      {/* ===================== EMPTY STATE (BIAR GA KOSONG) ===================== */}
      {!hasData && (
        <>
          <section className="sectionPad">
            <div className="howCard">
              <div className="howItem">
                <div className="howIcon">①</div>
                <div className="howText">
                  <div className="howTitle">Paste Link</div>
                  <div className="howDesc">Masukkan link sosial media yang kamu mau unduh.</div>
                </div>
              </div>

              <div className="howItem">
                <div className="howIcon">②</div>
                <div className="howText">
                  <div className="howTitle">Preview</div>
                  <div className="howDesc">Cek dulu kualitas / tipe media sebelum download.</div>
                </div>
              </div>

              <div className="howItem">
                <div className="howIcon">③</div>
                <div className="howText">
                  <div className="howTitle">Download</div>
                  <div className="howDesc">Download langsung—video, audio, maupun image.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="sectionPad">
            <div className="featureGrid">
              <div className="featureCard">
                <div className="fTitle">⚡ Auto-Select</div>
                <div className="fDesc">Pilih kualitas terbaik kalau tersedia (filter quality tetap ada untuk manual).</div>
              </div>
              <div className="featureCard">
                <div className="fTitle">🔒 Proxy Download</div>
                <div className="fDesc">Download via proxy biar image/video tidak “ke-buka doang” tapi benar-benar unduh.</div>
              </div>
              <div className="featureCard">
                <div className="fTitle">🎯 Consistent UI</div>
                <div className="fDesc">Semua media selalu punya tombol Preview + Download (biar nggak ada yang hilang).</div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===================== RESULT ===================== */}
      {hasData && (
        <section className="panelWrap">
          <div className="panel">
            <div className="panelTop">
              <div className="panelTitle">
                <h2 className="h2">Result</h2>
                <div className="panelSub">
                  Source:{" "}
                  <a className="link" href={data.source} target="_blank" rel="noreferrer">
                    {shortUrl(data.source, 95)}
                  </a>
                </div>
              </div>

              <div className="filtersWrap">
                {/* Type Filter */}
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

                {/* Quality Filter (mencolok tapi nyatu) */}
                {showQualityFilter && (
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

            {/* Title collapse */}
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

            {/* List */}
            <div className="list">
              {medias.map((m, i) => (
                <div className="item" key={`${m.type}-${i}`}>
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

              {!medias.length && (
                <div className="empty">
                  Tidak ada media untuk filter ini. Coba ganti filter type/quality.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===================== JOIN CHANNEL (SELALU ADA) ===================== */}
      <section className="sectionPad">
        <div className="joinCard">
          <div className="joinLeft">
            <div className="waLogo" aria-hidden="true">
              {/* simple WA logo (SVG inline) */}
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

            <div className="joinText">
              <div className="joinTitle">{WA_CHANNEL_NAME}</div>
              <div className="joinDesc">
                Join WhatsApp Channel untuk update tools, AI, dan perkembangan project.
                <span className="joinDev">
                  {" "}
                  Dev: <b>{DEV_NAME}</b>
                </span>
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
      </section>

      {/* ===================== PREVIEW MODAL ===================== */}
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

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="footerLine" />
        <div className="footerText">
          © {new Date().getFullYear()} <b>{DEV_NAME}</b> • {WEBSITE_TITLE_LEFT}{" "}
          <span className="footerHi">{WEBSITE_TITLE_HIGHLIGHT}</span>
        </div>
      </footer>

      {/* ===================== GLOBAL CSS ===================== */}
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

      {/* ===================== PAGE CSS ===================== */}
      <style jsx>{`
        /* --------- page & ambient --------- */
        .page {
          min-height: 100vh;
          width: 100%;
          color: rgba(255, 255, 255, 0.92);
          font-family: Arial, sans-serif;
          background: radial-gradient(1100px 600px at 18% 0%, rgba(155, 92, 255, 0.18), transparent 60%),
            radial-gradient(1100px 600px at 82% 0%, rgba(55, 245, 255, 0.14), transparent 60%),
            linear-gradient(180deg, #060812, #0b0f1c);
          position: relative;
        }

        .mounted .introInner,
        .mounted .toolHero,
        .mounted .howCard,
        .mounted .featureGrid,
        .mounted .joinCard,
        .mounted .panel {
          transform: translateY(0);
          opacity: 1;
        }

        .ambient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .glow {
          position: absolute;
          filter: blur(70px);
          opacity: 0.7;
          border-radius: 999px;
        }
        .g1 {
          width: 520px;
          height: 520px;
          left: -160px;
          top: -140px;
          background: rgba(155, 92, 255, 0.35);
        }
        .g2 {
          width: 520px;
          height: 520px;
          right: -170px;
          top: -160px;
          background: rgba(55, 245, 255, 0.24);
        }
        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E");
          background-size: 240px 240px;
        }

        /* --------- layout containers --------- */
        .intro,
        .toolWrap,
        .sectionPad,
        .panelWrap,
        .footer {
          position: relative;
          z-index: 2;
        }

        .introInner,
        .toolHero,
        .howCard,
        .featureGrid,
        .joinCard,
        .panel {
          width: min(1180px, calc(100% - 24px));
          margin-left: auto;
          margin-right: auto;
          transition: opacity 420ms ease, transform 420ms ease;
          transform: translateY(8px);
          opacity: 0.001;
        }

        /* --------- intro section --------- */
        .intro {
          padding-top: 26px;
        }
        .introInner {
          padding: 10px 0 6px;
        }

        .kicker {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          letter-spacing: 0.2px;
        }
        .kDot {
          width: 10px;
          height: 10px;
          border-radius: 6px;
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
          opacity: 0.8;
        }

        .title {
          margin: 0;
          font-weight: 950;
          letter-spacing: -0.8px;
          font-size: clamp(30px, 5vw, 54px);
          line-height: 1.06;
        }
        .titleHi {
          background: linear-gradient(90deg, rgba(55, 245, 255, 0.95), rgba(155, 92, 255, 0.95), rgba(255, 79, 216, 0.95));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .desc {
          margin: 14px 0 0;
          max-width: 88ch;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.74);
          font-size: 14px;
        }

        .supportRow {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: baseline;
          color: rgba(255, 255, 255, 0.65);
          font-size: 12px;
          line-height: 1.7;
        }
        .supportLabel {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.78);
        }
        .supportItems {
          opacity: 0.85;
        }

        .introMeta {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .metaPill {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.78);
          font-size: 12px;
          font-weight: 900;
        }

        /* --------- tool card --------- */
        .toolWrap {
          margin-top: 18px;
        }
        .toolHero {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);
          background-size: cover;
          background-position: center;
          overflow: hidden;
          min-height: 360px;
        }
        @media (min-width: 1024px) {
          .toolHero {
            min-height: 430px;
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
        .brandMini {
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
        .brandName {
          font-weight: 950;
          letter-spacing: 0.2px;
          font-size: 13px;
        }
        .brandSub {
          opacity: 0.65;
          font-size: 12px;
        }
        .detected {
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.86);
          white-space: nowrap;
        }

        .toolTitle {
          margin-top: 2px;
        }
        .toolH {
          font-size: 22px;
          font-weight: 950;
          letter-spacing: -0.3px;
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
          width: min(780px, 100%);
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
        .input::placeholder {
          color: rgba(255, 255, 255, 0.42);
        }
        .btnMain {
          padding: 12px 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-weight: 950;
          background: rgba(255, 255, 255, 0.94);
          color: rgba(0, 0, 0, 0.92);
          transition: transform 120ms ease, opacity 120ms ease;
        }
        .btnMain:hover {
          transform: translateY(-1px);
        }
        .btnMain:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .error {
          font-weight: 900;
          color: #ff7a7a;
          margin-top: 2px;
        }
        .hint {
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          line-height: 1.6;
          margin-top: 2px;
        }

        /* --------- empty state blocks --------- */
        .sectionPad {
          margin-top: 14px;
        }
        .howCard {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          padding: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.26);
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
        .howIcon {
          width: 34px;
          height: 34px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
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

        /* --------- result panel --------- */
        .panelWrap {
          margin-top: 14px;
        }
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
        .panelTitle {
          min-width: 240px;
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
          transition: transform 120ms ease;
        }
        .chip:hover {
          transform: translateY(-1px);
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
          transition: transform 120ms ease;
        }
        .qChip:hover {
          transform: translateY(-1px);
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
          transition: transform 120ms ease;
        }
        .btn:hover {
          transform: translateY(-1px);
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

        /* --------- join card --------- */
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
        .waSvg {
          display: block;
        }
        .joinText {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .joinTitle {
          font-weight: 950;
          font-size: 14px;
          letter-spacing: 0.2px;
        }
        .joinDesc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.6;
        }
        .joinDev {
          color: rgba(255, 255, 255, 0.85);
        }
        .joinBadges {
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
          transition: transform 120ms ease;
        }
        .joinBtn:hover {
          transform: translateY(-1px);
        }
        .joinSmall {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
        }

        /* --------- modal preview --------- */
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

        /* --------- footer --------- */
        .footer {
          margin-top: 22px;
          padding: 16px 0 28px;
          text-align: center;
          z-index: 2;
          position: relative;
        }
        .footerLine {
          width: min(1180px, calc(100% - 24px));
          margin: 0 auto 10px;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }
        .footerText {
          width: min(1180px, calc(100% - 24px));
          margin: 0 auto;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
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
