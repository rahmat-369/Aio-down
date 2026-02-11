import axios from "axios";
import { rateLimit } from "../../lib/rateLimit";

export default async function handler(req, res) {
  // RATE LIMIT CHECK
  const limit = rateLimit(req, {
    cooldownMs: 30 * 1000, // proxy lebih ringan, cooldown 30 detik aja
    maxPerDay: 200,        // limit proxy lebih tinggi
  });

  if (!limit.allowed) {
    return res.status(limit.status).json({
      error: limit.message,
      remaining: limit.remaining,
      waitSeconds: limit.waitSeconds,
    });
  }

  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL kosong");

    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Referer: "https://downr.org/",
      },
      maxRedirects: 10,
    });

    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="download-${Date.now()}"`
    );

    response.data.pipe(res);
  } catch (err) {
    console.error("PROXY ERROR:", err.message);
    res.status(500).send("Gagal download media");
  }
}// pages/api/proxy.js
import axios from "axios";

const ALLOWED_HOSTS = [
  "tiktokcdn.com",
  "muscdn.com",
  "fbcdn.net",
  "fbsbx.com",
  "instagram.com",
  "cdninstagram.com",
  "googlevideo.com",
  "ytimg.com",
  "pinimg.com",
  "sndcdn.com",
  "soundcloud.com"
];

function isAllowed(urlString) {
  try {
    const url = new URL(urlString);

    if (url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();

    return ALLOWED_HOSTS.some(domain =>
      hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  if (!isAllowed(url)) {
    return res.status(403).json({ error: "Domain not allowed" });
  }

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || "download"}"`
    );
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );

    response.data.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch media" });
  }
      }
