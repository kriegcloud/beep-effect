/**
 * Web app manifest for the opip web app shell.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { MetadataRoute } from "next";

/**
 * Returns the static web manifest for opip web.
 *
 * @category constructors
 * @since 0.0.0
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "opip.law",
    short_name: "opip.law",
    description: "Patent counsel for the people who build the machines.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#11100e",
    categories: ["business", "legal", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/opip/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/opip/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/opip/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
