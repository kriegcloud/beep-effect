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
    name: "opip-web",
    short_name: "opip-web",
    description: "OP/IP web application shell.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
