import DownrScraper from "../../lib/downr";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL kosong" });

    const downr = new DownrScraper();
    const data = await downr.fetch(url);

    if (!data?.medias?.length) {
      return res.status(404).json({ error: "Media tidak ditemukan" });
    }

    const medias = data.medias
      .filter((m) => m?.url && m?.type)
      .map((m) => ({
        type: m.type,
        url: m.url,
        quality: m.quality || ""
      }));

    return res.status(200).json({
      title: data.title || "",
      source: url,
      medias
    });
  } catch (e) {
    console.error("download api error:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
  }
