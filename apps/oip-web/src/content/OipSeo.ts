/**
 * SEO, AEO, and machine-readable content helpers for OIP.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A } from "@beep/utils";
import type { OipSiteContent } from "./OipContent.model.ts";

/**
 * Builds conservative JSON-LD graph data for the OIP website.
 *
 * @example
 * ```ts
 * import { makeJsonLdGraph, oipSiteContent } from "@beep/oip-web/content"
 *
 * const graph = makeJsonLdGraph(oipSiteContent)
 * console.log(graph["@context"])
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const makeJsonLdGraph = (content: OipSiteContent) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${content.metadata.siteUrl}/#person`,
      "@type": "Person",
      familyName: "Oppold",
      givenName: "Thomas",
      jobTitle: "Patent Attorney",
      knowsAbout: A.map(content.practices, (practice) => practice.title),
      name: "Thomas J. Oppold",
      sameAs: [content.metadata.linkedInUrl],
      url: content.metadata.siteUrl,
    },
    {
      "@id": `${content.metadata.siteUrl}/#legal-service`,
      "@type": "LegalService",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Iowa" },
        { "@type": "AdministrativeArea", name: "Minnesota" },
        { "@type": "Country", name: "United States" },
      ],
      description: content.metadata.description,
      founder: { "@id": `${content.metadata.siteUrl}/#person` },
      name: content.metadata.siteName,
      serviceType: A.map(content.practices, (practice) => practice.title),
      url: content.metadata.siteUrl,
    },
    {
      "@id": `${content.metadata.siteUrl}/#website`,
      "@type": "WebSite",
      description: content.metadata.description,
      inLanguage: "en-US",
      name: content.metadata.siteName,
      publisher: { "@id": `${content.metadata.siteUrl}/#legal-service` },
      url: content.metadata.siteUrl,
    },
  ],
});

/**
 * Builds `llms.txt` content from reviewed OIP site content.
 *
 * @example
 * ```ts
 * import { makeLlmsText, oipSiteContent } from "@beep/oip-web/content"
 *
 * const text = makeLlmsText(oipSiteContent)
 * console.log(text.includes("# OIP - Oppold IP Law"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const makeLlmsText = (content: OipSiteContent): string => {
  const practiceLines = A.map(content.practices, (practice) => `- ${practice.title}: ${practice.body}`);
  const matterLines = A.map(
    content.matters,
    (matter) => `- [${matter.title}](${matter.source.href}): ${matter.source.label}`
  );
  const pressLines = A.map(
    content.press,
    (item) => `- [${item.headline}](${item.source.href}) (${item.publication}): ${item.source.label}`
  );
  const noticeLines = A.map(content.contact.notice, (notice) => `- ${notice}`);

  return A.join(
    [
      "# OIP - Oppold IP Law",
      "",
      "> Patent counsel for the people who build the machines.",
      "",
      "## Site",
      "",
      `- Canonical URL: [${content.metadata.siteUrl}](${content.metadata.siteUrl})`,
      `- Contact: [${content.contact.email}](mailto:${content.contact.email})`,
      `- Description: ${content.metadata.description}`,
      "",
      "## Practice Areas",
      "",
      ...practiceLines,
      "",
      "## Public Matter Sources",
      "",
      ...matterLines,
      "",
      "## Press Sources",
      "",
      ...pressLines,
      "",
      "## Legal Notices",
      "",
      ...noticeLines,
      "",
      "## Review Status",
      "",
      "- Client logos, selected matters, contact details, credentials, and legal notice text remain review-gated before public launch approval.",
    ],
    "\n"
  );
};
