import axios from "axios";

export default async function handler(req, res) {
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
}
