# CMS, CRM, Contact, And Analytics Research

## Recommendation

Use Sanity Free/Growth as the editable content source, HubSpot as the CRM intake
sink, and Vercel-native analytics for site health. Keep outbound email and CRM
tracking scripts deferred.

## Decisions

- Sanity becomes source of truth for all reviewable OPIP content.
- The app keeps repo-local fallback content for build/runtime resilience.
- HubSpot runtime auth uses `CRM_HUBSPOT_SERVICE_KEY`.
- HubSpot Personal Access Key remains CLI/local only.
- Developer API Key is not used for runtime contact submission.
- Native contact form posts to a server route, validates through app-local
  schema, and submits through `@beep/hubspot`.
- HubSpot Forms remain the preferred native form path when a form GUID and
  `forms` scope exist; the current service key supports CRM contact upsert, so
  the implementation falls back to CRM upsert without requiring a form GUID.
- Spam controls start with honeypot and minimum elapsed-time checks.
- No Resend in v1. HubSpot notifications are the first email path.
- No HubSpot tracking script in v1. Use Vercel Web Analytics/Speed Insights
  only after the Vercel project-side analytics asset is enabled; the app gates
  the scripts behind `NEXT_PUBLIC_ENABLE_VERCEL_INSIGHTS=1` to avoid staging
  404/MIME console errors.

## Verification

- Sanity fetch failures fall back to checked-in content.
- HubSpot CRM upsert scope is available on the service key. HubSpot Forms API
  remains gated on adding the `forms` scope or configuring an existing form GUID.
- Contact form cannot submit honeypot-filled or too-fast payloads.
