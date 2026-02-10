import axios from "axios";

function pickExt(contentType) {
  if (!contentType) return "bin";
  const ct = contentType.toLowerCase();
  if (ct.includes("image/")) return ct.split("image/")[1].split(";")[0] || "jpg";
  if (ct.includes("video/")) return ct.split("video/")[1].split(";")[0] || "mp4";
  if (ct.includes("audio/")) return ct.split("audio/")[1].split(";")[0] || "mp3";
  return "bin";
}

export default async function handler(req, res) {
  try {
    const { url, filename } = req.query;
    if (!url) return res.status(400).send("URL kosong");

    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Referer: "https://downr.org/",
        Origin: "https://downr.org",
        Accept: "*/*"
      },
      maxRedirects: 10,
      timeout: 25000
    });

    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    const ext = pickExt(contentType);
    const safeName =
      (typeof filename === "string" && filename.trim().length
        ? filename.trim()
        : `download-${Date.now()}`) + `.${ext}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName.replace(/"/g, "")}"`
    );

    response.data.pipe(res);
  } catch (e) {
    console.error("proxy error:", e?.message || e);
    return res.status(500).send("Gagal download (blocked/expired)");
  }
}
