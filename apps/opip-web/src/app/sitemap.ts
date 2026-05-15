/**
 * Sitemap for opip.law.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { MetadataRoute } from "next";
import { opipSiteContent } from "../content";

/**
 * Returns the OPIP sitemap.
 *
 * @example
 * ```ts
 * import sitemap from "@beep/opip-web/app/sitemap"
 *
 * console.log(sitemap()[0]?.url)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: opipSiteContent.metadata.siteUrl,
      lastModified: "2026-05-14",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
