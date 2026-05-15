/**
 * Robots policy for opip.law.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { MetadataRoute } from "next";
import { opipSiteContent } from "../content";

/**
 * Returns the robots policy for OPIP.
 *
 * @category constructors
 * @since 0.0.0
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${opipSiteContent.metadata.siteUrl}/sitemap.xml`,
  };
}
