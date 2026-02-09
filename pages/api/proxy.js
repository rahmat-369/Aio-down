import axios from "axios";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL kosong");

    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
        Referer: "https://downr.org/",
      },
    });

    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    let ext = "bin";
    if (contentType.includes("video")) ext = "mp4";
    else if (contentType.includes("audio")) ext = "mp3";
    else if (contentType.includes("image")) ext = "jpg";

    const filename = `download-${Date.now()}.${ext}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    response.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal download file");
  }
} 
