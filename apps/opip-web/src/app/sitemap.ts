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
