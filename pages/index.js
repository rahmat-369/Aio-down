// pages/index.js
import { useEffect, useMemo, useRef, useState } from "react";

const DEV_NAME = "R_hmt ofc";
const SITE_NAME = "Downloader Lab";
const SITE_TAGLINE = "Preview → Download. Semua media selalu punya tombol Preview + Download.";
const SITE_DESC =
  "Unduh video, image, dan audio dari berbagai platform. Dibuat ringan, enak di mobile, dan tetap rapi di desktop/DeX.";

const WA_CHANNEL_URL =
  "https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p";
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
  { key: "tiktok", label: "TIKTOK", hint: "watermark/no-watermark/HD biasanya tersedia" },
  { key: "instagram", label: "INSTAGRAM", hint: "reel / post / story tergantung link" },
  { key: "facebook", label: "FACEBOOK", hint: "post / share / watch tergantung link" },
  { key: "youtube", label: "YOUTUBE", hint: "kadang protected/expiring (bukan UI)" },
  { key: "x", label: "X", hint: "video / image (tergantung tweet)" },
  { key: "threads", label: "THREADS", hint: "media tergantung post" },
  { key: "pinterest", label: "PINTEREST", hint: "image / video tergantung pin" },
  { key: "snapchat", label: "SNAPCHAT", hint: "media tergantung link" },
  { key: "spotify", label: "SPOTIFY", hint: "biasanya audio/preview (tergantung sumber)" },
  { key: "soundcloud", label: "SOUNDCLOUD", hint: "audio tergantung track" },
];

const BG_BY_PLATFORM = {
  default:
    "radial-gradient(900px 420px at 20% 15%, rgba(124, 58, 237, .26), transparent 55%), radial-gradient(900px 420px at 80% 5%, rgba(34, 211, 238, .20), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(244, 114, 182, .14), transparent 55%)",
  tiktok:
    "radial-gradient(900px 420px at 22% 12%, rgba(34, 211, 238, .22), transparent 55%), radial-gradient(900px 420px at 75% 10%, rgba(244, 114, 182, .18), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .18), transparent 55%)",
  instagram:
    "radial-gradient(900px 420px at 22% 12%, rgba(244, 114, 182, .24), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(249, 115, 22, .18), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .16), transparent 55%)",
  youtube:
    "radial-gradient(900px 420px at 22% 12%, rgba(239, 68, 68, .22), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .14), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .14), transparent 55%)",
  facebook:
    "radial-gradient(900px 420px at 22% 12%, rgba(59, 130, 246, .20), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .14), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .14), transparent 55%)",
  x:
    "radial-gradient(900px 420px at 22% 12%, rgba(148, 163, 184, .18), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .12), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .12), transparent 55%)",
  threads:
    "radial-gradient(900px 420px at 22% 12%, rgba(148, 163, 184, .18), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(244, 114, 182, .12), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .12), transparent 55%)",
  pinterest:
    "radial-gradient(900px 420px at 22% 12%, rgba(239, 68, 68, .20), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .12), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .12), transparent 55%)",
  snapchat:
    "radial-gradient(900px 420px at 22% 12%, rgba(250, 204, 21, .18), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .12), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .12), transparent 55%)",
  spotify:
    "radial-gradient(900px 420px at 22% 12%, rgba(34, 197, 94, .16), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .10), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .12), transparent 55%)",
  soundcloud:
    "radial-gradient(900px 420px at 22% 12%, rgba(249, 115, 22, .18), transparent 55%), radial-gradient(900px 420px at 78% 12%, rgba(34, 211, 238, .10), transparent 55%), radial-gradient(900px 420px at 55% 100%, rgba(124, 58, 237, .12), transparent 55%)",
};

/* ===================== helpers ===================== */
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
  return item?.label || key.toUpperCase();
}

function platformHint(key) {
  if (!key || key === "default") return "Tempel link sosial media yang ingin kamu unduh.";
  const item = PLATFORM_META.find((x) => x.key === key);
  return item?.hint || "Tempel link sosial media yang ingin kamu unduh.";
}

function isProbablyUrl(s = "") {
  return /^https?:\/\//i.test((s || "").trim());
}

function clampText(text = "", limit = 240) {
  if (!text) return { short: "", isLong: false };
  const isLong = text.length > limit;
  return { short: isLong ? text.slice(0, limit) + "…" : text, isLong };
}

function shortUrl(url = "", limit = 86) {
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

/* ===================== main ===================== */
export default function Home() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("default");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // expected shape: { title, source, medias:[{type,url,quality?}] }
  const [data, setData] = useState(null);

  // UI states
  const [typeFilter, setTypeFilter] = useState("all"); // all|video|image|audio
  const [qualityFilter, setQualityFilter] = useState("all"); // all|hd_nw|nw|hd|wm|other
  const [showFullTitle, setShowFullTitle] = useState(false);

  // preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    setPlatform(detectPlatformKey(url));
  }, [url]);

  const bg = BG_BY_PLATFORM[platform] || BG_BY_PLATFORM.default;

  const title = data?.title || "";
  const { short: shortTitle, isLong: titleLong } = clampText(title, 260);

  const totalCounts = useMemo(() => {
    const list = data?.medias || [];
    const c = { all: list.length, video: 0, image: 0, audio: 0 };
    for (const m of list) if (m?.type && c[m.type] !== undefined) c[m.type]++;
    return c;
  }, [data]);

  const qualityOptions = useMemo(() => {
    const medias = data?.medias || [];
    const vids = medias.filter((m) => m?.type === "video");
    const set = new Map();
    for (const v of vids) {
      const raw = v?.quality || "";
      const key = qualityTagKey(raw);
      const label = normalizeQuality(raw) || "Other";
      if (key === "other" && !raw) continue;
      if (!set.has(key)) set.set(key, label);
    }
    const order = ["hd_nw", "nw", "hd", "wm", "other"];
    const arr = [{ key: "all", label: "All Quality" }];
    for (const k of order) if (set.has(k)) arr.push({ key: k, label: set.get(k) });
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
        throw new Error("API tidak mengembalikan JSON. Cek /api/download & logs Vercel.");
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
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus?.();
      }
      if (e.key === "Enter" && (document.activeElement === inputRef.current || document.activeElement?.id === "urlInput")) {
        onSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, previewOpen]);

  const hasData = !!data;

  return (
    <div className="page" style={{ backgroundImage: bg }}>
      {/* Ambient */}
      <div className="ambient" aria-hidden="true">
        <div className="glow g1" />
        <div className="glow g2" />
        <div className="grain" />
      </div>

      <main className="shell">
        {/* LEFT COLUMN */}
        <aside className="left">
          <div className="brand">
            <div className="dot" />
            <div className="brandText">
              <div className="dev">{DEV_NAME}</div>
              <div className="sub">tools • web</div>
            </div>
          </div>

          <h1 className="heroTitle">
            {SITE_NAME} <span className="hi">Social</span>
          </h1>
          <p className="tagline">{SITE_TAGLINE}</p>

          <div className="card soft">
            <div className="cardTitle">Tentang</div>
            <div className="cardBody">{SITE_DESC}</div>

            <div className="miniRow">
              <span className="pill">Preview-first</span>
              <span className="pill">Download always</span>
              <span className="pill">DeX friendly</span>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Supported Platform</div>
            <div className="chipsWrap">
              {SUPPORTED.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
            <div className="smallNote">
              Total: <b>{SUPPORTED.length}</b> platform • (Ctrl+K untuk fokus input)
            </div>
          </div>

          <div className="card wa">
            <div className="waHead">
              <div className="waIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22">
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
                <div className="waTitle">{WA_CHANNEL_NAME}</div>
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
              <div className="waSmall">Official channel</div>
            </div>
          </div>

          <div className="foot">
            © {new Date().getFullYear()} <b>{DEV_NAME}</b> • {SITE_NAME}
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <section className="right">
          <div className="panel">
            <div className="panelTop">
              <div className="panelTitle">
                <div className="h">Downloader</div>
                <div className="subh">
                  Detected: <span className="det">{platformLabel(platform)}</span> • {platformHint(platform)}
                </div>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="k">Items</div>
                  <div className="v">{hasData ? totalCounts.all : "—"}</div>
                </div>
                <div className="stat">
                  <div className="k">Video</div>
                  <div className="v">{hasData ? totalCounts.video : "—"}</div>
                </div>
                <div className="stat">
                  <div className="k">Image</div>
                  <div className="v">{hasData ? totalCounts.image : "—"}</div>
                </div>
                <div className="stat">
                  <div className="k">Audio</div>
                  <div className="v">{hasData ? totalCounts.audio : "—"}</div>
                </div>
              </div>
            </div>

            <div className="inputWrap">
              <input
                id="urlInput"
                ref={inputRef}
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Tempel link sosial media di sini…"
                inputMode="url"
              />
              <button className="btnMain" onClick={onSubmit} disabled={loading}>
                {loading ? "Fetching..." : "Get Media"}
              </button>
            </div>

            {error && <div className="error">❌ {error}</div>}

            <div className="tips">
              <div className="tip">
                <span className="dotMini" />
                Semua item akan punya tombol <b>Preview</b> + <b>Download</b> (termasuk foto).
              </div>
              <div className="tip">
                <span className="dotMini" />
                YouTube kadang gagal karena URL media expiring/protected (bukan UI).
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`result ${hasData ? "show" : ""}`}>
            {!hasData ? (
              <div className="emptyState">
                <div className="emptyTitle">Siap download?</div>
                <div className="emptyText">
                  Tempel link, klik <b>Get Media</b>, lalu pilih kualitas (kalau ada).
                </div>
                <div className="emptyGrid">
                  <div className="miniCard">
                    <div className="miniH">① Paste Link</div>
                    <div className="miniP">Masukkan link video/image/audio.</div>
                  </div>
                  <div className="miniCard">
                    <div className="miniH">② Preview</div>
                    <div className="miniP">Cek dulu sebelum download.</div>
                  </div>
                  <div className="miniCard">
                    <div className="miniH">③ Download</div>
                    <div className="miniP">Unduh file lewat proxy.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="resultInner">
                <div className="resultTop">
                  <div>
                    <div className="rTitle">Result</div>
                    <div className="rMeta">
                      Source:{" "}
                      <a className="link" href={data.source} target="_blank" rel="noreferrer">
                        {shortUrl(data.source, 110)}
                      </a>
                    </div>
                  </div>

                  <div className="filters">
                    <div className="filterRow">
                      {["all", "video", "image", "audio"].map((t) => (
                        <button
                          key={t}
                          className={typeFilter === t ? "fChip active" : "fChip"}
                          onClick={() => setTypeFilter(t)}
                          type="button"
                        >
                          {humanType(t)}
                          {hasData && (
                            <span className="badgeCount">
                              {t === "all" ? totalCounts.all : totalCounts[t]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {qualityOptions.length > 1 && (
                      <div className="qualityBox">
                        <div className="qHead">
                          <span className="qDot" />
                          Quality Filter (video)
                        </div>
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

                {/* title collapse */}
                <div className="titleBox">
                  <div className="tLabel">Title</div>
                  <div className="tText">
                    {title ? (
                      <>
                        {showFullTitle ? title : shortTitle}
                        {titleLong && (
                          <button
                            className="seeMore"
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

                <div className="list">
                  {filteredMedias.map((m, i) => (
                    <div className="item" key={`${m.type}-${i}`}>
                      <div className="iLeft">
                        <div className="iType">
                          <span className={`tag ${m.type}`}>{m.type.toUpperCase()}</span>
                          {m.qualityLabel ? <span className="qTag">{m.qualityLabel}</span> : null}
                        </div>
                        <div className="iUrl">{shortUrl(m.url, 120)}</div>
                      </div>

                      <div className="iRight">
                        <button className="btnSmall" onClick={() => openPreview(m)} type="button">
                          Preview
                        </button>
                        <a className="btnSmall green" href={buildDownloadLink(m)}>
                          Download
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
        </section>
      </main>

      {/* Preview Modal */}
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

      {/* Global + CSS */}
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
          -webkit-tap-highlight-color: transparent;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          color: rgba(255, 255, 255, 0.92);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          background-color: #070814;
          background-repeat: no-repeat;
          background-size: cover;
          position: relative;
        }

        /* ambient */
        .ambient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(90px);
          opacity: 0.75;
        }
        .g1 {
          width: 560px;
          height: 560px;
          left: -220px;
          top: -240px;
          background: rgba(124, 58, 237, 0.40);
        }
        .g2 {
          width: 560px;
          height: 560px;
          right: -240px;
          top: -240px;
          background: rgba(34, 211, 238, 0.26);
        }
        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E");
          background-size: 240px 240px;
        }

        /* layout */
        .shell {
          position: relative;
          z-index: 2;
          width: min(1220px, calc(100% - 24px));
          margin: 0 auto;
          padding: 18px 0 28px;
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 16px;
          align-items: start;
        }

        @media (max-width: 980px) {
          .shell {
            grid-template-columns: 1fr;
          }
        }

        /* left */
        .left {
          position: sticky;
          top: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (max-width: 980px) {
          .left {
            position: static;
          }
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 1), rgba(124, 58, 237, 1), rgba(244, 114, 182, 1));
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.20);
        }
        .brandText .dev {
          font-weight: 900;
          letter-spacing: 0.2px;
        }
        .brandText .sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
        }

        .heroTitle {
          margin: 2px 0 0;
          font-size: 38px;
          line-height: 1.06;
          letter-spacing: -0.8px;
          font-weight: 950;
        }
        .hi {
          background: linear-gradient(90deg, rgba(34, 211, 238, 0.98), rgba(124, 58, 237, 0.98), rgba(244, 114, 182, 0.98));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tagline {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.7;
          font-size: 14px;
        }

        .card {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(12px);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.28);
          padding: 14px;
        }
        .card.soft {
          background: rgba(255, 255, 255, 0.05);
        }
        .cardTitle {
          font-weight: 900;
          letter-spacing: 0.2px;
          margin-bottom: 8px;
        }
        .cardBody {
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.7;
          font-size: 13px;
        }

        .miniRow {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pill {
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          font-size: 12px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.82);
        }

        .chipsWrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.80);
          font-size: 12px;
          font-weight: 800;
        }
        .smallNote {
          margin-top: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.60);
          line-height: 1.6;
        }

        .wa {
          border-color: rgba(34, 197, 94, 0.20);
          background: rgba(34, 197, 94, 0.06);
        }
        .waHead {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .waIcon {
          width: 42px;
          height: 42px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(34, 197, 94, 0.26);
          background: rgba(34, 197, 94, 0.12);
          color: rgba(34, 197, 94, 0.95);
          flex: 0 0 auto;
        }
        .waTitle {
          font-weight: 950;
          font-size: 13px;
          letter-spacing: 0.2px;
        }
        .waDesc {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 12px;
          line-height: 1.6;
        }
        .waDev {
          color: rgba(255, 255, 255, 0.90);
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
          font-weight: 950;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(34, 197, 94, 0.28);
          background: rgba(34, 197, 94, 0.16);
          transition: transform 120ms ease;
        }
        .btnWa:hover {
          transform: translateY(-1px);
        }
        .waSmall {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.60);
        }

        .foot {
          margin-top: 2px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
          text-align: center;
          padding: 6px 0 2px;
        }

        /* right */
        .right {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .panel {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.26);
          backdrop-filter: blur(14px);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.30);
          padding: 16px;
        }

        .panelTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }
        .panelTitle .h {
          font-weight: 950;
          letter-spacing: -0.3px;
          font-size: 18px;
        }
        .panelTitle .subh {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.66);
          font-size: 12px;
          line-height: 1.6;
        }
        .det {
          display: inline-flex;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.90);
          font-weight: 900;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          width: min(360px, 100%);
        }
        @media (max-width: 520px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
          }
        }
        .stat {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.05);
          padding: 10px;
        }
        .stat .k {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.60);
          font-weight: 800;
        }
        .stat .v {
          margin-top: 3px;
          font-size: 16px;
          font-weight: 950;
        }

        .inputWrap {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .input {
          flex: 1;
          min-width: 240px;
          padding: 14px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.30);
          color: rgba(255, 255, 255, 0.92);
          outline: none;
          font-size: 14px;
        }
        .input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }
        .btnMain {
          padding: 14px 16px;
          border-radius: 16px;
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
          margin-top: 10px;
          font-weight: 900;
          color: #ff7a7a;
          line-height: 1.5;
        }

        .tips {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        @media (max-width: 640px) {
          .tips {
            grid-template-columns: 1fr;
          }
        }
        .tip {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.04);
          padding: 10px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 12px;
          line-height: 1.6;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .dotMini {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          margin-top: 5px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 1), rgba(124, 58, 237, 1));
          flex: 0 0 auto;
        }

        /* result container */
        .result {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(14px);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.22);
          padding: 16px;
        }

        .emptyState {
          padding: 4px 0 0;
        }
        .emptyTitle {
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.2px;
        }
        .emptyText {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.68);
          line-height: 1.7;
          font-size: 13px;
        }
        .emptyGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 760px) {
          .emptyGrid {
            grid-template-columns: 1fr;
          }
        }
        .miniCard {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.22);
          padding: 12px;
        }
        .miniH {
          font-weight: 950;
          margin-bottom: 6px;
        }
        .miniP {
          color: rgba(255, 255, 255, 0.64);
          font-size: 12px;
          line-height: 1.6;
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
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.2px;
        }
        .rMeta {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
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

        .filters {
          width: min(720px, 100%);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .filterRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .fChip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.78);
          cursor: pointer;
          font-weight: 950;
          font-size: 12px;
          transition: transform 120ms ease;
        }
        .fChip:hover {
          transform: translateY(-1px);
        }
        .fChip.active {
          background: rgba(255, 255, 255, 0.10);
          border-color: rgba(255, 255, 255, 0.22);
          color: rgba(255, 255, 255, 0.96);
        }
        .badgeCount {
          display: inline-flex;
          min-width: 24px;
          height: 20px;
          padding: 0 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          justify-content: center;
          align-items: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.86);
        }

        .qualityBox {
          border-radius: 16px;
          border: 1px solid rgba(34, 211, 238, 0.16);
          background: rgba(34, 211, 238, 0.06);
          padding: 10px;
        }
        .qHead {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 950;
          color: rgba(255, 255, 255, 0.86);
          margin-bottom: 8px;
        }
        .qDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.95);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.22);
        }
        .qRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .qChip {
          padding: 9px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.90);
          cursor: pointer;
          font-weight: 950;
          font-size: 12px;
          transition: transform 120ms ease;
        }
        .qChip:hover {
          transform: translateY(-1px);
        }
        .qChip.qActive {
          border-color: rgba(34, 197, 94, 0.28);
          background: rgba(34, 197, 94, 0.16);
        }

        .titleBox {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.22);
          padding: 12px;
        }
        .tLabel {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          font-weight: 900;
          margin-bottom: 6px;
        }
        .tText {
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.86);
          font-size: 13px;
        }
        .seeMore {
          margin-left: 10px;
          border: none;
          background: transparent;
          color: rgba(147, 197, 253, 0.95);
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
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.20);
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
        .iType {
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
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
        }
        .tag.video {
          border-color: rgba(34, 211, 238, 0.20);
          background: rgba(34, 211, 238, 0.08);
        }
        .tag.image {
          border-color: rgba(244, 114, 182, 0.20);
          background: rgba(244, 114, 182, 0.08);
        }
        .tag.audio {
          border-color: rgba(34, 197, 94, 0.20);
          background: rgba(34, 197, 94, 0.08);
        }
        .qTag {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.78);
        }
        .iUrl {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          word-break: break-word;
          line-height: 1.6;
        }
        .iRight {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btnSmall {
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          font-weight: 950;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none;
          transition: transform 120ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btnSmall:hover {
          transform: translateY(-1px);
        }
        .btnSmall.green {
          border-color: rgba(34, 197, 94, 0.26);
          background: rgba(34, 197, 94, 0.16);
        }

        .noItems {
          border-radius: 14px;
          padding: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.16);
          color: rgba(255, 255, 255, 0.62);
          background: rgba(0, 0, 0, 0.16);
          line-height: 1.6;
          font-size: 13px;
        }

        /* modal */
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
          width: min(980px, 100%);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(10, 12, 20, 0.84);
          backdrop-filter: blur(18px);
          box-shadow: 0 22px 90px rgba(0, 0, 0, 0.60);
          overflow: hidden;
        }
        .modalTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
        }
        .modalTitle {
          font-weight: 950;
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
        }
        .modalClose {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
        }
        .modalBody {
          padding: 14px;
          display: flex;
          justify-content: center;
        }
        .modalMedia {
          width: 100%;
          max-height: 74vh;
          object-fit: contain;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.10);
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
          padding: 12px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.10);
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
          border: 1px solid rgba(34, 197, 94, 0.26);
          background: rgba(34, 197, 94, 0.16);
          color: rgba(255, 255, 255, 0.96);
          font-weight: 950;
        }
      `}</style>
    </div>
  );
}
