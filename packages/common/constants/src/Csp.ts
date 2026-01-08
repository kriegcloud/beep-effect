import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

/**
 * CSP directive configuration for the application.
 * Each directive maps to an array of allowed sources.
 */
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "script-src": ["'self'", "blob:", "https://cdn.jsdelivr.net", "'wasm-unsafe-eval'", "'unsafe-eval'"],
  "worker-src": ["'self'", "blob:"],
  "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  "font-src": ["'self'", "https://fonts.scalar.com"],
  "style-src-elem": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://cdn.jsdelivr.net"],
  "script-src-elem": [
    "'self'",
    "https://unpkg.com",
    "http://unpkg.com",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "blob:",
    "https://vercel.live",
    "https://www.gstatic.com",
    "https://cdn.jsdelivr.net",
    "https://www.google.com",
    "'wasm-unsafe-eval'",
    "'unsafe-eval'",
  ],
  "connect-src": [
    "'self'",
    "https://vercel.live/",
    "https://vercel.com",
    "https://www.google.com",
    "https://www.react-grab.com",
    "ws:",
    "wss:",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://localhost:*",
    "https://127.0.0.1:*",
    "ws://localhost:34437",
    "wss://localhost:34437",
    "http://localhost:4318",
    "http://127.0.0.1:4318",
  ],
  "media-src": ["'self'", "data:"],
  "frame-ancestors": ["'self'", "https://vercel.live", "https://vercel.com"],
  "img-src": [
    "'self'",
    "https://images.unsplash.com",
    "https://www.google-analytics.com",
    "data:",
    "blob:",
    "https://purecatamphetamine.github.io",
    "https://api.dicebear.com",
  ],
  "frame-src": ["'self'", "https://vercel.live", "https://www.google.com", "https://vercel.com"],
} as const;

/**
 * Type for CSP directive names.
 */
export type CspDirective = keyof typeof CSP_DIRECTIVES;

/**
 * Builds a CSP header string from directives.
 */
const buildCspHeader = (directives: Record<string, ReadonlyArray<string>>): string =>
  F.pipe(
    directives,
    Struct.entries,
    A.fromIterable,
    A.map(([directive, values]) => `${directive} ${A.join(" ")(values)}`),
    A.join("; "),
    Str.concat(";")
  );

/**
 * Content Security Policy header string for the application.
 * This constant replaces the dynamic CSP loading from environment variables.
 */
export const CSP_HEADER = buildCspHeader(CSP_DIRECTIVES);
