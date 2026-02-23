export type VideoProvider = "youtube" | "vimeo";

export type ParsedVideo =
  | {
      readonly provider: "youtube";
      readonly id: string;
      readonly embedUrl: string;
      readonly originalUrl: string;
      readonly startAt?: undefined | number;
    }
  | {
      readonly provider: "vimeo";
      readonly id: string;
      readonly embedUrl: string;
      readonly originalUrl: string;
      readonly startAt?: undefined | number;
    };

const TIME_RE = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i;

function parseTimeToSeconds(raw: string | null): number | undefined {
  if (!raw) {
    return undefined;
  }
  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }
  if (raw.includes(":")) {
    const parts = raw.split(":").map((p) => Number(p));

    if (parts.some(Number.isNaN)) {
      return undefined;
    }
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
      const power = parts.length - i - 1;
      seconds += parts[i]! * 60 ** power;
    }
    return seconds;
  }

  const m = TIME_RE.exec(raw);
  if (m) {
    const h = m[1] ? Number(m[1]) : 0;
    const min = m[2] ? Number(m[2]) : 0;
    const s = m[3] ? Number(m[3]) : 0;
    return h * 3600 + min * 60 + s;
  }

  return undefined;
}

function parseYoutube(url: URL): ParsedVideo | null {
  const host = url.hostname.toLowerCase();
  let id: string | null | undefined;

  if (host === "youtu.be") {
    const splitPathname = url.pathname.split("/").filter(Boolean);
    id = splitPathname[0] ?? null;
  } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const path = url.pathname.replace(/^\/+/, "");
    const params = url.searchParams;
    if (path === "watch") {
      id = params.get("v");
    } else if (path.startsWith("shorts/")) {
      id = path.split("/")[1] ?? null;
    } else if (path.startsWith("embed/")) {
      id = path.split("/")[1] ?? null;
    }
  }
  if (!id) return null;

  const start =
    parseTimeToSeconds(url.searchParams.get("t") || url.searchParams.get("start")) ||
    (url.hash.startsWith("#t=") ? parseTimeToSeconds(url.hash.slice(3)) : undefined);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${start ? `?start=${start}` : ""}`;

  return {
    provider: "youtube",
    id,
    startAt: start,
    embedUrl,
    originalUrl: url.toString(),
  };
}

function parseVimeo(url: URL): ParsedVideo | null {
  const host = url.hostname.toLowerCase();
  let id: string | null = null;

  if (host === "vimeo.com") {
    const seg = url.pathname.split("/").filter(Boolean);
    if (seg.length >= 1 && /^\d+$/.test(seg[0]!)) id = seg[0]!;
  } else if (host === "player.vimeo.com") {
    const seg = url.pathname.split("/").filter(Boolean);
    if (seg[0] === "video" && /^\d+$/.test(seg[1]!)) id = seg[1]!;
  }

  if (!id) return null;

  const start =
    parseTimeToSeconds(url.searchParams.get("t")) ||
    (url.hash.startsWith("#t=") ? parseTimeToSeconds(url.hash.slice(3)) : undefined);

  const anchor = start ? `#t=${start}s` : "";
  const embedUrl = `https://player.vimeo.com/video/${encodeURIComponent(id)}${anchor}`;

  return {
    provider: "vimeo",
    id,
    startAt: start,
    embedUrl,
    originalUrl: url.toString(),
  };
}

export function parseVideoUrl(raw: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const y = parseYoutube(url);
  if (y) return y;
  const v = parseVimeo(url);
  if (v) return v;
  return null;
}
