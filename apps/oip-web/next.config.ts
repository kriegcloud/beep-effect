import { fileURLToPath } from "node:url";
import { defineBeepNextConfig } from "@beep/repo-configs/next";
import { oipRedirects } from "./src/config/OipRedirects.ts";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const securityHeaders = [
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
  allowedDevOrigins: ["oip-web.localhost"],
  additionalTranspilePackages: ["@beep/hubspot", "@beep/sanity"],
  next: {
    images: {
      qualities: [50, 60, 75],
    },
    redirects: () => Promise.resolve(oipRedirects()),
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
