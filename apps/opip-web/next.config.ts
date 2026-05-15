import { fileURLToPath } from "node:url";
import { defineBeepNextConfig } from "@beep/repo-configs/next";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const isDevelopment = process.env.NODE_ENV !== "production";
const developmentScriptSources = isDevelopment ? " 'unsafe-eval' https://unpkg.com" : "";
const developmentConnectSources = isDevelopment ? " http://localhost:* https://*.localhost:* ws: wss:" : "";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${developmentScriptSources}`,
  `script-src-elem 'self' 'unsafe-inline'${developmentScriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self'",
  `connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com https://api.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io https://api.hsforms.com https://forms.hsforms.com https://api.hubapi.com${developmentConnectSources}`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Origin-Agent-Cluster",
    value: "?1",
  },
];

export default defineBeepNextConfig({
  repoRoot,
  allowedDevOrigins: ["opip-web.localhost"],
  additionalTranspilePackages: ["@beep/hubspot", "@beep/sanity"],
  next: {
    images: {
      qualities: [50, 60, 75],
    },
  },
  securityHeaders: {
    headers: securityHeaders,
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: false,
    options: {
      disableDevLogs: true,
    },
  },
  env: process.env,
});
