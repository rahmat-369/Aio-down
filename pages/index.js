// pages/index.js
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * ✅ 1 FILE ONLY: pages/index.js
 * ✅ Hero (nama web + deskripsi) TANPA CARD
 * ✅ Warna lembut (no lebay)
 * ✅ Input card dirapihkan
 * ✅ Perbaiki "hitam" saat scroll ke atas (theme-color + background konsisten)
 * ✅ Emoji diganti SVG (WhatsApp, link, eye, download, steps)
 * ✅ Result: title collapse, filters, quality filter, Preview+Download for ALL items
 * ✅ Preview modal (img/video/audio) + download button
 *
 * Assumes:
 * - POST /api/download  { url }  -> { title, source, medias:[{type,url,quality?}] }
 * - GET  /api/proxy?url=...&filename=... -> downloads file
 */

const DEV_NAME = "R_hmt ofc";
const SITE_TITLE = "All In One Social Media Downloader";
const SITE_DESC =
  "Unduh video, audio, dan gambar dari berbagai platform sosial media dengan mudah. Cukup paste link, preview, lalu download.";

const WA_CHANNEL_URL = "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";
const WA_CHANNEL_NAME = "✧･ﾟ: [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡 :･ﾟ✧";

const SUPPORTED = [
  "TikTok",
  "Instagram",
  "Facebook",
  "X",
  "YouTube",
  "Threads",
  "Pinterest",
  "Snapchat",
  "Spotify",
  "SoundCloud",
];

const PLATFORM_META = [
  { key: "tiktok", label: "TIKTOK", hint: "Biasanya ada opsi watermark / no-watermark / HD." },
  { key: "instagram", label: "INSTAGRAM", hint: "Reels / post / story tergantung link." },
  { key: "facebook", label: "FACEBOOK", hint: "Post / share / watch tergantung link." },
  { key: "youtube", label: "YOUTUBE", hint: "Kadang protected/expiring (bukan UI)." },
  { key: "x", label: "X", hint: "Video / image tergantung tweet." },
  { key: "threads", label: "THREADS", hint: "Media tergantung post." },
  { key: "pinterest", label: "PINTEREST", hint: "Image / video tergantung pin." },
  { key: "snapchat", label: "SNAPCHAT", hint: "Media tergantung link." },
  { key: "spotify", label: "SPOTIFY", hint: "Biasanya audio/preview tergantung sumber." },
  { key: "soundcloud", label: "SOUNDCLOUD", hint: "Audio tergantung track." },
];

const THEME_COLOR = "#0b1220"; // for mobile browser top bar
const BG = {
  base:
    "radial-gradient(900px 520px at 18% 10%, rgba(111, 151, 255, 0.12), transparent 55%), radial-gradient(900px 520px at 82% 8%, rgba(168, 142, 255, 0.10), transparent 55%), radial-gradient(900px 520px at 56% 98%, rgba(105, 220, 220, 0.08), transparent 55%)",
};

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

function platformLabel(key) {
  if (!key || key === "default") return "UNKNOWN";
  const item = PLATFORM_META.find((x) => x.key === key);
  return item?.label || String(key).toUpperCase();
}

function platformHint(key) {
  if (!key || key === "default") return "Tempel link sosial media yang ingin diunduh.";
  const item = PLATFORM_META.find((x) => x.key === key);
  return item?.hint || "Tempel link sosial media yang ingin diunduh.";
}

function isProbablyUrl(s = "") {
  return /^https?:\/\//i.test((s || "").trim());
}

function clampText(text = "", limit = 260) {
  if (!text) return { short: "", isLong: false };
  const isLong = text.length > limit;
  return { short: isLong ? text.slice(0, limit) + "…" : text, isLong };
}

function shortUrl(url = "", limit = 110) {
  if (!url) return "";
  return url.length > limit ? url.slice(0, limit) + "…" : url;
}

function safeFilename(str = "") {
  return (str || "")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
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
  if (s.includes("hd") && (s.includes("no_watermark") || s.includes("nowatermark"))) return "hd_nw";
  if (s.includes("no_watermark") || s.includes("nowatermark") || s.includes("no-watermark")) return "nw";
  if (s.includes("watermark")) return "wm";
  if (s.includes("hd")) return "hd";
  return "other";
}

function humanType(t = "") {
  if (t === "video") return "VIDEO";
  if (t === "image") return "IMAGE";
  if (t === "audio") return "AUDIO";
  return "ALL";
}

/* ======= icons (SVG) ======= */
function Icon({ children, className = "", size = 20 }) {
  return (
    <span className={`ic ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    </span>
  );
}

function IconWhatsApp({ size = 20 }) {
  return (
    <Icon size={size} className="icWa">
      <path
        d="M12 2a9.5 9.5 0 0 0-8.22 14.25L3 22l5.92-1.55A9.5 9.5 0 1 0 12 2Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3l-.5 3.1 3.1-.8A8.2 8.2 0 1 0 12 3.8Z"
        fill="currentColor"
        opacity="0.10"
      />
      <path
        d="M16.9 13.7c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.8.9-.1.1-.3.1-.5 0s-.9-.3-1.7-1.1c-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 1.9s.9 2.2 1 2.3c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.2-1 0-.1-.2-.2-.4-.3Z"
        fill="currentColor"
      />
    </Icon>
  );
}

function IconLink({ size = 18 }) {
  return (
    <Icon size={size}>
      <path
        d="M10.2 13.8a4.1 4.1 0 0 1 0-5.8l1.8-1.8a4.1 4.1 0 0 1 5.8 5.8l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.8 10.2a4.1 4.1 0 0 1 0 5.8L12 17.8a4.1 4.1 0 0 1-5.8-5.8l1.1-1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function IconEye({ size = 18 }) {
  return (
    <Icon size={size}>
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </Icon>
  );
}

function IconDownload({ size = 18 }) {
  return (
    <Icon size={size}>
      <path
        d="M12 3v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 10.5 12 13.8l4-3.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18.2h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function IconStep({ n = 1, size = 18 }) {
  return (
    <span className="stepDot" style={{ width: size + 10, height: size + 10 }}>
      <span className="stepNum">{n}</span>
    </span>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("default");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null); // { title, source, medias:[{type,url,quality?}] }

  const [typeFilter, setTypeFilter] = useState("all"); // all|video|image|audio
  const [qualityFilter, setQualityFilter] = useState("all"); // all|hd_nw|nw|hd|wm|other
  const [showFullTitle, setShowFullTitle] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    setPlatform(detectPlatformKey(url));
  }, [url]);

  const title = data?.title || "";
  const { short: shortTitle, isLong: titleLong } = clampText(title, 260);

  const totalCounts = useMemo(() => {
    const list = data?.medias || [];
    const c = { all: list.length, video: 0, image: 0, audio: 0 };
    for (const m of list) {
      if (m?.type && c[m.type] !== undefined) c[m.type]++;
    }
    return c;
  }, [data]);

  const qualityOptions = useMemo(() => {
    const medias = data?.medias || [];
    const vids = medias.filter((m) => m?.type === "video");
    const map = new Map();
    for (const v of vids) {
      const raw = v?.quality || "";
      const key = qualityTagKey(raw);
      const label = normalizeQuality(raw) || "Other";
      if (key === "other" && !raw) continue;
      if (!map.has(key)) map.set(key, label);
    }
    const order = ["hd_nw", "nw", "hd", "wm", "other"];
    const arr = [{ key: "all", label: "All Quality" }];
    for (const k of order) if (map.has(k)) arr.push({ key: k, label: map.get(k) });
    return arr;
  }, [data]);

  useEffect(() => {
    setTypeFilter("all");
    setQualityFilter("all");
    setShowFullTitle(false);
  }, [data?.source]);

  const filteredMedias = useMemo(() => {
    const list = (data?.medias || [])
      .filter((m) => m?.url && m?.type)
      .map((m) => ({
        ...m,
        qualityLabel: normalizeQuality(m?.quality || ""),
        qualityKey: qualityTagKey(m?.quality || ""),
      }));

    let out = list;
    if (typeFilter !== "all") out = out.filter((m) => m.type === typeFilter);

    if (qualityFilter !== "all") {
      out = out.filter((m) => (m.type === "video" ? m.qualityKey === qualityFilter : true));
    }
    return out;
  }, [data, typeFilter, qualityFilter]);

  function buildDownloadLink(item) {
    const name = safeFilename(`${item.type}${item.quality ? "-" + item.quality : ""}`);
    return `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(
      name || "download"
    )}`;
  }

  async function onSubmit() {
    setError("");
    setData(null);

    const u = (url || "").trim();
    if (!u) {
      setError("Masukkan URL dulu.");
      inputRef.current?.focus?.();
      return;
    }
    if (!isProbablyUrl(u)) {
      setError("URL harus diawali http:// atau https://");
      inputRef.current?.focus?.();
      return;
    }

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
        throw new Error("API tidak mengembalikan JSON. Cek /api/download di logs Vercel.");
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
    } finally {
      setLoading(false);
    }
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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus?.();
      }
      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        onSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, previewOpen]);

  const hasData = !!data;

  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="theme-color" content={THEME_COLOR} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="page" style={{ backgroundImage: BG.base }}>
        <div className="grain" aria-hidden="true" />

        <main className="container">
          {/* HERO (NO CARD) */}
          <section className="hero">
            <div className="brandRow">
              <div className="brandDot" />
              <div className="brandText">
                <div className="brandDev">{DEV_NAME}</div>
                <div className="brandSub">tools • web</div>
              </div>
            </div>

            <h1 className="heroTitle">
              <span className="tPlain">All In One</span>{" "}
              <span className="tAccent">Social Media</span>{" "}
              <span className="tSoft">Downloader</span>
            </h1>

            <p className="heroDesc">{SITE_DESC}</p>

            <div className="supportedLine">
              <span className="supportedLabel">Supported:</span>
              <span className="supportedText">{SUPPORTED.join(" • ")}</span>
            </div>

            <div className="heroBadges">
              <span className="badge">Preview-first</span>
              <span className="badge">Download always</span>
              <span className="badge">Desktop/DeX ready</span>
              <span className="badge">Ctrl+K focus</span>
            </div>
          </section>

          {/* MAIN GRID */}
          <section className="grid">
            {/* LEFT: TOOL */}
            <div className="toolCol">
              <div className="card toolCard">
                <div className="toolHead">
                  <div className="toolTitle">
                    <div className="toolH">Downloader</div>
                    <div className="toolS">
                      Detected: <span className="det">{platformLabel(platform)}</span>
                      <span className="sep">•</span>
                      <span className="hint">{platformHint(platform)}</span>
                    </div>
                  </div>
                </div>

                <div className="inputRow">
                  <div className="inputWrap">
                    <IconLink size={18} />
                    <input
                      ref={inputRef}
                      className="input"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste link TikTok, Instagram, YouTube, Facebook, dll…"
                      inputMode="url"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  <button className="btnMain" onClick={onSubmit} disabled={loading}>
                    {loading ? "Fetching…" : "Get Media"}
                  </button>
                </div>

                {error && <div className="error">Gagal: {error}</div>}

                <div className="tipsRow">
                  <div className="tip">
                    <span className="tipDot" />
                    Semua item punya tombol <b>Preview</b> + <b>Download</b> (termasuk foto).
                  </div>
                  <div className="tip">
                    <span className="tipDot" />
                    YouTube kadang gagal karena URL media expiring/protected (bukan UI).
                  </div>
                </div>
              </div>

              {/* JOIN WA */}
              <div className="card waCard">
                <div className="waHead">
                  <div className="waIconWrap" aria-hidden="true">
                    <IconWhatsApp size={22} />
                  </div>
                  <div className="waText">
                    <div className="waName">{WA_CHANNEL_NAME}</div>
                    <div className="waDesc">
                      Join channel untuk update tools, AI, dan progress project.{" "}
                      <span className="waDev">
                        Dev: <b>{DEV_NAME}</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="waActions">
                  <a className="btnWa" href={WA_CHANNEL_URL} target="_blank" rel="noreferrer">
                    Join WhatsApp Channel
                  </a>
                  <div className="waNote">Official channel</div>
                </div>
              </div>

              {/* HOW IT WORKS */}
              <div className="card howCard">
                <div className="howTitle">Cara Pakai</div>
                <div className="howGrid">
                  <div className="howItem">
                    <IconStep n={1} />
                    <div>
                      <div className="howH">Paste Link</div>
                      <div className="howP">Masukkan link sosial media yang ingin diunduh.</div>
                    </div>
                  </div>
                  <div className="howItem">
                    <IconStep n={2} />
                    <div>
                      <div className="howH">Preview</div>
                      <div className="howP">Cek dulu kualitas/tipe media sebelum download.</div>
                    </div>
                  </div>
                  <div className="howItem">
                    <IconStep n={3} />
                    <div>
                      <div className="howH">Download</div>
                      <div className="howP">Klik tombol Download pada item yang dipilih.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer">
                © {new Date().getFullYear()} <b>{DEV_NAME}</b> • Minimal UI • Desktop ready
              </div>
            </div>

            {/* RIGHT: RESULT */}
            <div className="resultCol">
              <div className="card resultCard">
                {!hasData ? (
                  <div className="empty">
                    <div className="emptyTitle">Result</div>
                    <div className="emptyText">
                      Tempel link, klik <b>Get Media</b>, lalu pilih <b>Preview</b> atau <b>Download</b>.
                    </div>

                    <div className="emptyStats">
                      <div className="stat">
                        <div className="k">Items</div>
                        <div className="v">—</div>
                      </div>
                      <div className="stat">
                        <div className="k">Video</div>
                        <div className="v">—</div>
                      </div>
                      <div className="stat">
                        <div className="k">Image</div>
                        <div className="v">—</div>
                      </div>
                      <div className="stat">
                        <div className="k">Audio</div>
                        <div className="v">—</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="resultInner">
                    <div className="resultTop">
                      <div>
                        <div className="rTitle">Result</div>
                        <div className="rSource">
                          <span className="rLabel">Source:</span>
                          <a className="rLink" href={data.source} target="_blank" rel="noreferrer">
                            {shortUrl(data.source, 130)}
                          </a>
                        </div>
                      </div>

                      <div className="statsRow">
                        <div className="stat">
                          <div className="k">Items</div>
                          <div className="v">{totalCounts.all}</div>
                        </div>
                        <div className="stat">
                          <div className="k">Video</div>
                          <div className="v">{totalCounts.video}</div>
                        </div>
                        <div className="stat">
                          <div className="k">Image</div>
                          <div className="v">{totalCounts.image}</div>
                        </div>
                        <div className="stat">
                          <div className="k">Audio</div>
                          <div className="v">{totalCounts.audio}</div>
                        </div>
                      </div>
                    </div>

                    {/* filters */}
                    <div className="filters">
                      <div className="filterRow">
                        {["all", "video", "image", "audio"].map((t) => (
                          <button
                            key={t}
                            className={typeFilter === t ? "chip active" : "chip"}
                            onClick={() => setTypeFilter(t)}
                            type="button"
                          >
                            {humanType(t)}
                            <span className="count">
                              {t === "all" ? totalCounts.all : totalCounts[t]}
                            </span>
                          </button>
                        ))}
                      </div>

                      {qualityOptions.length > 1 && (
                        <div className="qualityBox">
                          <div className="qualityTitle">Quality (video)</div>
                          <div className="qualityRow">
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

                    {/* title collapse */}
                    <div className="titleBox">
                      <div className="titleLabel">Title</div>
                      <div className="titleText">
                        {title ? (
                          <>
                            {showFullTitle ? title : shortTitle}
                            {titleLong && (
                              <button
                                className="moreBtn"
                                onClick={() => setShowFullTitle((v) => !v)}
                                type="button"
                              >
                                {showFullTitle ? "Sembunyikan" : "Lihat semua"}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </div>
                    </div>

                    {/* list */}
                    <div className="list">
                      {filteredMedias.map((m, i) => (
                        <div className="item" key={`${m.type}-${i}`}>
                          <div className="iLeft">
                            <div className="iTags">
                              <span className={`tag ${m.type}`}>{m.type.toUpperCase()}</span>
                              {m.qualityLabel ? <span className="qTag">{m.qualityLabel}</span> : null}
                            </div>
                            <div className="iUrl">{shortUrl(m.url, 150)}</div>
                          </div>

                          <div className="iActions">
                            <button className="btn ghost" onClick={() => openPreview(m)} type="button">
                              <IconEye size={18} /> Preview
                            </button>
                            <a className="btn solid" href={buildDownloadLink(m)}>
                              <IconDownload size={18} /> Download
                            </a>
                          </div>
                        </div>
                      ))}

                      {!filteredMedias.length && (
                        <div className="noItems">Tidak ada media untuk filter ini. Coba ganti filter.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Preview Modal */}
        {previewOpen && previewItem && (
          <div className="modalBack" onMouseDown={closePreview}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modalTop">
                <div className="modalTitle">
                  Preview • {previewItem.type.toUpperCase()}
                  {previewItem.quality ? ` (${normalizeQuality(previewItem.quality)})` : ""}
                </div>
                <button className="x" onClick={closePreview} type="button" aria-label="Close">
                  ✕
                </button>
              </div>

              <div className="modalBody">
                {previewItem.type === "image" && (
                  <img className="media" src={previewItem.url} alt="preview" />
                )}
                {previewItem.type === "video" && (
                  <video className="media" src={previewItem.url} controls />
                )}
                {previewItem.type === "audio" && (
                  <audio className="audio" src={previewItem.url} controls />
                )}
              </div>

              <div className="modalActions">
                <a className="mBtn" href={previewItem.url} target="_blank" rel="noreferrer">
                  Open Source
                </a>
                <a className="mBtn primary" href={buildDownloadLink(previewItem)}>
                  <IconDownload size={18} /> Download
                </a>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          html,
          body,
          #__next {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            background: ${THEME_COLOR};
            overflow-x: hidden;
            overscroll-behavior-y: none;
            -webkit-tap-highlight-color: transparent;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>

        <style jsx>{`
          .page {
            min-height: 100vh;
            width: 100%;
            background-color: ${THEME_COLOR};
            background-repeat: no-repeat;
            background-size: cover;
            color: rgba(255, 255, 255, 0.92);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            position: relative;
          }

          /* soft grain */
          .grain {
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: 0.07;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E");
            background-size: 240px 240px;
            z-index: 0;
          }

          .container {
            position: relative;
            z-index: 1;
            width: min(1180px, calc(100% - 28px));
            margin: 0 auto;
            padding: calc(env(safe-area-inset-top) + 16px) 0 26px;
          }

          /* HERO (no card) */
          .hero {
            padding: 10px 2px 14px;
          }

          .brandRow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
          }
          .brandDot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: rgba(168, 190, 255, 0.9);
            box-shadow: 0 0 18px rgba(168, 190, 255, 0.18);
          }
          .brandDev {
            font-weight: 900;
            letter-spacing: 0.2px;
            font-size: 13px;
          }
          .brandSub {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.62);
            margin-top: 1px;
          }

          .heroTitle {
            margin: 16px 0 8px;
            font-size: clamp(28px, 3.6vw, 44px);
            line-height: 1.08;
            font-weight: 950;
            letter-spacing: -0.8px;
          }
          .tPlain {
            color: rgba(255, 255, 255, 0.92);
          }
          .tAccent {
            color: rgba(180, 205, 255, 0.92);
          }
          .tSoft {
            color: rgba(210, 220, 245, 0.86);
          }

          .heroDesc {
            margin: 0 0 14px;
            color: rgba(255, 255, 255, 0.70);
            line-height: 1.75;
            max-width: 760px;
          }

          .supportedLine {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: baseline;
            margin: 0 0 10px;
          }
          .supportedLabel {
            font-weight: 900;
            color: rgba(255, 255, 255, 0.82);
          }
          .supportedText {
            color: rgba(255, 255, 255, 0.62);
            line-height: 1.7;
          }

          .heroBadges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .badge {
            padding: 7px 10px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.70);
            font-size: 12px;
            font-weight: 800;
          }

          /* GRID */
          .grid {
            margin-top: 14px;
            display: grid;
            grid-template-columns: 420px 1fr;
            gap: 14px;
            align-items: start;
          }
          @media (max-width: 980px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }

          .toolCol {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .resultCol {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .card {
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(14px);
            box-shadow: 0 20px 70px rgba(0, 0, 0, 0.22);
            padding: 14px;
          }

          /* TOOL CARD */
          .toolCard {
            background: rgba(0, 0, 0, 0.18);
            border-color: rgba(255, 255, 255, 0.09);
          }

          .toolHead {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            flex-wrap: wrap;
          }
          .toolH {
            font-weight: 950;
            letter-spacing: -0.2px;
            font-size: 16px;
          }
          .toolS {
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.62);
            font-size: 12px;
            line-height: 1.6;
          }
          .det {
            display: inline-flex;
            padding: 4px 9px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.82);
            font-weight: 900;
          }
          .sep {
            margin: 0 8px;
            color: rgba(255, 255, 255, 0.45);
          }
          .hint {
            color: rgba(255, 255, 255, 0.56);
          }

          .inputRow {
            margin-top: 12px;
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
          }

          .inputWrap {
            flex: 1;
            min-width: 240px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 12px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(0, 0, 0, 0.20);
          }

          .ic {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: rgba(215, 225, 255, 0.72);
          }
          .icWa {
            color: rgba(120, 230, 175, 0.95);
          }

          .input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            color: rgba(255, 255, 255, 0.90);
            font-size: 14px;
          }
          .input::placeholder {
            color: rgba(255, 255, 255, 0.40);
          }

          .btnMain {
            padding: 12px 14px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(235, 240, 255, 0.92);
            color: rgba(10, 14, 22, 0.92);
            font-weight: 950;
            cursor: pointer;
            transition: transform 120ms ease, opacity 120ms ease;
            white-space: nowrap;
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
            margin-top: 10px;
            padding: 10px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 120, 120, 0.25);
            background: rgba(255, 120, 120, 0.08);
            color: rgba(255, 200, 200, 0.92);
            font-weight: 850;
            font-size: 12.5px;
            line-height: 1.6;
          }

          .tipsRow {
            margin-top: 10px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .tip {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            padding: 10px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
            color: rgba(255, 255, 255, 0.66);
            font-size: 12px;
            line-height: 1.6;
          }
          .tipDot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            margin-top: 5px;
            background: rgba(180, 205, 255, 0.85);
            box-shadow: 0 0 16px rgba(180, 205, 255, 0.14);
            flex: 0 0 auto;
          }

          /* WA CARD */
          .waCard {
            background: rgba(0, 0, 0, 0.16);
            border-color: rgba(120, 230, 175, 0.20);
          }
          .waHead {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          .waIconWrap {
            width: 42px;
            height: 42px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(120, 230, 175, 0.10);
            border: 1px solid rgba(120, 230, 175, 0.22);
            flex: 0 0 auto;
          }
          .waName {
            font-weight: 950;
            font-size: 13px;
            letter-spacing: 0.2px;
          }
          .waDesc {
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.68);
            font-size: 12px;
            line-height: 1.6;
          }
          .waDev {
            color: rgba(255, 255, 255, 0.82);
          }
          .waActions {
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .btnWa {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            padding: 12px 12px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 950;
            color: rgba(10, 14, 22, 0.92);
            background: rgba(120, 230, 175, 0.92);
            border: 1px solid rgba(120, 230, 175, 0.26);
            transition: transform 120ms ease;
          }
          .btnWa:hover {
            transform: translateY(-1px);
          }
          .waNote {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.55);
          }

          /* HOW */
          .howCard {
            background: rgba(0, 0, 0, 0.16);
          }
          .howTitle {
            font-weight: 950;
            letter-spacing: -0.2px;
            margin-bottom: 10px;
          }
          .howGrid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .howItem {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            padding: 10px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
          }
          .howH {
            font-weight: 950;
            margin-bottom: 4px;
          }
          .howP {
            color: rgba(255, 255, 255, 0.64);
            font-size: 12px;
            line-height: 1.6;
          }

          .stepDot {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(180, 205, 255, 0.10);
            flex: 0 0 auto;
          }
          .stepNum {
            font-weight: 950;
            color: rgba(210, 225, 255, 0.90);
            font-size: 12px;
          }

          .footer {
            text-align: center;
            padding: 6px 0 2px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.55);
          }

          /* RESULT */
          .resultCard {
            background: rgba(0, 0, 0, 0.16);
          }
          .emptyTitle {
            font-weight: 950;
            font-size: 16px;
            margin-bottom: 6px;
          }
          .emptyText {
            color: rgba(255, 255, 255, 0.66);
            font-size: 12.5px;
            line-height: 1.7;
          }
          .emptyStats {
            margin-top: 12px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }
          @media (max-width: 520px) {
            .emptyStats {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          .resultInner {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .resultTop {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            align-items: flex-start;
          }
          .rTitle {
            font-weight: 950;
            font-size: 16px;
            margin-bottom: 6px;
          }
          .rSource {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            color: rgba(255, 255, 255, 0.62);
            font-size: 12px;
          }
          .rLabel {
            font-weight: 850;
            color: rgba(255, 255, 255, 0.72);
          }
          .rLink {
            color: rgba(180, 205, 255, 0.90);
            text-decoration: none;
            word-break: break-word;
          }
          .rLink:hover {
            text-decoration: underline;
          }

          .statsRow {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
            width: min(360px, 100%);
          }
          @media (max-width: 520px) {
            .statsRow {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              width: 100%;
            }
          }
          .stat {
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
            padding: 10px;
          }
          .stat .k {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.58);
            font-weight: 850;
          }
          .stat .v {
            margin-top: 3px;
            font-size: 15px;
            font-weight: 950;
            color: rgba(255, 255, 255, 0.88);
          }

          .filters {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .filterRow {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 12px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(0, 0, 0, 0.16);
            color: rgba(255, 255, 255, 0.72);
            font-weight: 900;
            font-size: 12px;
            cursor: pointer;
          }
          .chip.active {
            background: rgba(180, 205, 255, 0.12);
            border-color: rgba(180, 205, 255, 0.20);
            color: rgba(255, 255, 255, 0.88);
          }
          .count {
            display: inline-flex;
            min-width: 24px;
            height: 20px;
            padding: 0 7px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            justify-content: center;
            align-items: center;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.76);
          }

          .qualityBox {
            border-radius: 16px;
            border: 1px solid rgba(180, 205, 255, 0.16);
            background: rgba(180, 205, 255, 0.06);
            padding: 10px;
          }
          .qualityTitle {
            font-size: 12px;
            font-weight: 950;
            color: rgba(255, 255, 255, 0.82);
            margin-bottom: 8px;
          }
          .qualityRow {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .qChip {
            padding: 9px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.86);
            cursor: pointer;
            font-weight: 900;
            font-size: 12px;
          }
          .qChip.qActive {
            border-color: rgba(120, 230, 175, 0.22);
            background: rgba(120, 230, 175, 0.10);
          }

          .titleBox {
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.14);
            padding: 12px;
          }
          .titleLabel {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.60);
            font-weight: 900;
            margin-bottom: 6px;
          }
          .titleText {
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.82);
            font-size: 13px;
          }
          .moreBtn {
            margin-left: 10px;
            border: none;
            background: transparent;
            color: rgba(180, 205, 255, 0.92);
            font-weight: 950;
            cursor: pointer;
            padding: 0;
          }
          .muted {
            color: rgba(255, 255, 255, 0.55);
          }

          .list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .item {
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.14);
            padding: 12px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
          }
          .iLeft {
            flex: 1;
            min-width: 260px;
          }
          .iTags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }
          .tag {
            padding: 6px 10px;
            border-radius: 999px;
            font-weight: 950;
            font-size: 12px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.82);
          }
          .tag.video {
            border-color: rgba(180, 205, 255, 0.18);
            background: rgba(180, 205, 255, 0.06);
          }
          .tag.image {
            border-color: rgba(210, 220, 245, 0.16);
            background: rgba(210, 220, 245, 0.05);
          }
          .tag.audio {
            border-color: rgba(120, 230, 175, 0.16);
            background: rgba(120, 230, 175, 0.05);
          }
          .qTag {
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
            color: rgba(255, 255, 255, 0.70);
          }
          .iUrl {
            margin-top: 6px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.62);
            word-break: break-word;
            line-height: 1.6;
          }

          .iActions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 14px;
            font-weight: 950;
            font-size: 13px;
            text-decoration: none;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.10);
            transition: transform 120ms ease;
          }
          .btn:hover {
            transform: translateY(-1px);
          }
          .btn.ghost {
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.86);
          }
          .btn.solid {
            background: rgba(235, 240, 255, 0.92);
            color: rgba(10, 14, 22, 0.92);
          }

          .noItems {
            border-radius: 14px;
            padding: 12px;
            border: 1px dashed rgba(255, 255, 255, 0.14);
            color: rgba(255, 255, 255, 0.62);
            background: rgba(0, 0, 0, 0.10);
            line-height: 1.6;
            font-size: 13px;
          }

          /* MODAL */
          .modalBack {
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
            width: min(980px, 100%);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(10, 14, 22, 0.88);
            backdrop-filter: blur(18px);
            box-shadow: 0 22px 90px rgba(0, 0, 0, 0.55);
            overflow: hidden;
          }
          .modalTop {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 12px 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }
          .modalTitle {
            font-weight: 950;
            color: rgba(255, 255, 255, 0.90);
            font-size: 13px;
          }
          .x {
            width: 38px;
            height: 38px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.9);
            cursor: pointer;
          }
          .modalBody {
            padding: 14px;
            display: flex;
            justify-content: center;
          }
          .media {
            width: 100%;
            max-height: 74vh;
            object-fit: contain;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.22);
          }
          .audio {
            width: 100%;
          }
          .modalActions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
            padding: 12px 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }
          .mBtn {
            text-decoration: none;
            padding: 10px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.86);
            font-weight: 950;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .mBtn.primary {
            background: rgba(120, 230, 175, 0.16);
            border-color: rgba(120, 230, 175, 0.22);
          }
        `}</style>
      </div>
    </>
  );
}