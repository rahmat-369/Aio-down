export function detectPlatform(url = "") {
  const u = (url || "").toLowerCase();
  if (!u) return "default";

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

export function isSupportedUrl(url = "") {
  const u = (url || "").toLowerCase();
  if (!u.startsWith("http://") && !u.startsWith("https://")) return false;
  return [
    "tiktok.com",
    "instagram.com",
    "facebook.com",
    "fb.watch",
    "twitter.com",
    "x.com",
    "youtube.com",
    "youtu.be",
    "threads.net",
    "threads.com",
    "pinterest.com",
    "pin.it",
    "snapchat.com",
    "spotify.com",
    "soundcloud.com"
  ].some((d) => u.includes(d));
      }
