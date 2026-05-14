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
    start_url: "/",
    display: "standalone",
    background_color: "#F4EDE0",
    theme_color: "#1F1D1A",
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
    ],
  };
}
