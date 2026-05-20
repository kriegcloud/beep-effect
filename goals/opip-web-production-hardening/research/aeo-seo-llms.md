# AEO, SEO, And `llms.txt` Research

## Recommendation

Treat answer-engine optimization as disciplined SEO: crawlable HTML, canonical
metadata, conservative structured data, clear authorship, stable source URLs,
and no AI-only markup tricks.

## Decisions

- Canonical origin is `https://opip.law`.
- Add `robots.ts` and `sitemap.ts`.
- Add `llms.txt` as a plain-text Markdown route generated from the same
  reviewed content as the page, including explicit Markdown links for canonical
  URL, contact email, public matter sources, and press sources.
- JSON-LD uses `@graph` with `Person`, `LegalService`, and `WebSite`.
- Do not invent address, hours, ratings, prices, or outcomes.
- Keep client logos, named matters, counsel-of-record language, bar/USPTO
  credentials, and contact/legal notices review-gated.

## Verification

- Metadata and JSON-LD are derived from decoded content.
- Sitemap and robots point at `https://opip.law`.
- `llms.txt` includes contact disclaimers and Markdown source links without
  claiming legal advice or attorney-client formation.
