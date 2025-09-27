import * as Struct from "effect/Struct";

const fallbackOtlpOrigins = ["http://localhost:4318", "http://127.0.0.1:4318"] as const;
const otlpOrigin = process.env.NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL
  ? new URL(process.env.NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL).origin
  : undefined;

const otlpOrigins = Array.from(
  new Set([otlpOrigin, ...fallbackOtlpOrigins].filter((origin): origin is string => Boolean(origin)))
);

const connectSrcBase = [
  "'self'",
  "https://vercel.live/",
  "https://vercel.com",
  "ws:",
  "wss:",
  "http://localhost:*",
  "http://127.0.0.1:*",
  "https://localhost:*",
  "https://127.0.0.1:*",
  "ws://localhost:34437",
  "wss://localhost:34437",
] as const;

const connectSrc = Array.from(new Set([...connectSrcBase, ...otlpOrigins]));

const cspDirectives = (nonce: string) =>
  ({
    "default-src": ["'self'", `'nonce-${nonce}'`],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "blob:", "https://cdn.jsdelivr.net"],
    "worker-src": ["'self'", "blob:"],
    "style-src": ["'self'", `'unsafe-inline'`, "https://cdn.jsdelivr.net"],
    "font-src": ["'self'", "https://fonts.scalar.com"],
    "style-src-elem": ["'self'", `'unsafe-inline'`, "https://cdn.jsdelivr.net"],
    "script-src-elem": [
      "'self'",
      `'unsafe-inline'`,
      `https://www.googletagmanager.com`,
      "blob:",
      "https://vercel.live",
      "https://cdn.jsdelivr.net",
    ],
    "connect-src": connectSrc,
    "media-src": ["'self'", "data:"],
    "frame-ancestors": ["'self'", "https://vercel.live", "https://vercel.com"],
    "img-src": ["'self'", "https://www.google-analytics.com", "data:", "blob:"],
    "frame-src": ["'self'", "https://vercel.live", "https://vercel.com"],
  }) as const;

const genCSP = (nonce: string) => {
  let csp = "";
  for (const [key, value] of Struct.entries(cspDirectives(nonce))) {
    csp += `${key} ${value.join(" ")}; `;
  }
  return csp;
};

export const CSPHeader = (nonce: string) =>
  ({
    key: "Content-Security-Policy",
    value: genCSP(nonce)
      .replace(/\s{2,}/g, " ")
      .trim(),
  }) as const;
