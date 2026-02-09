import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  async function getMedia() {
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (json.error) throw json.error;

      setData(json);
    } catch (e) {
      setError(e.toString());
    }
  }

  return (
    <div className="wrap">
      <h1>Auto Downloader</h1>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste link..."
      />
      <button onClick={getMedia}>Get Media</button>

      {error && <p className="err">{error}</p>}

      {data && (
        <div className="card">
          <b>Title:</b>{" "}
          {showAll ? data.title : data.title.slice(0, 200)}
          {data.title.length > 200 && (
            <span onClick={() => setShowAll(!showAll)} className="more">
              {showAll ? " Sembunyikan" : " Lihat semua"}
            </span>
          )}

          <p>
            <b>Source:</b>{" "}
            <a href={data.source} target="_blank">{data.source.slice(0,50)}...</a>
          </p>

          {data.medias.map((m, i) => (
            <div key={i} className="item">
              <span>{m.type} {m.quality}</span>
              <a href={`/api/proxy?url=${encodeURIComponent(m.url)}`}>
                Download
              </a>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .wrap { max-width:700px; margin:auto; font-family:Arial }
        input { width:100%; padding:12px; margin-top:10px }
        button { padding:12px; margin-top:10px }
        .card { margin-top:20px; padding:15px; border:1px solid #ccc }
        .item { display:flex; justify-content:space-between; margin-top:10px }
        .more { color:blue; cursor:pointer }
        .err { color:red }
      `}</style>
    </div>
  );
          }
