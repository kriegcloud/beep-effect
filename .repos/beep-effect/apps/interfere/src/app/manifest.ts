import { assetPaths } from "@beep/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Business Entity & Endpoint Parser",
    short_name: "BEEP",
    icons: [
      {
        src: assetPaths.icons.icon48x48,
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon72x72,
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon96x96,
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon128x128,
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon144x144,
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon152x152,
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon192x192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon256x256,
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon384x384,
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: assetPaths.icons.icon512x512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    start_url: "/",
    display: "standalone",
    background_color: "#141A21",
    theme_color: "#00A76F",
  };
}
