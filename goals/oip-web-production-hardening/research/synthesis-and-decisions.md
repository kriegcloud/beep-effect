# Synthesis And Decisions

## Chosen Production Posture

OIP production hardening is managed-first, lean, and review-gated.

- Sanity owns editable reviewed content.
- HubSpot receives intake through a native form and server-side driver. Forms
  API is used when configured; otherwise CRM contact upsert is used with the
  currently granted service-key scopes.
- Vercel hosts the app and provides minimal analytics.
- Cloudflare owns DNS.
- Pulumi manages infrastructure with temporary S3-backed state in codedank.
- Public production cutover waits for explicit approval.

## Architecture Routing

- `packages/drivers/sanity` wraps Sanity API access only.
- `packages/drivers/hubspot` wraps HubSpot API access only.
- `apps/oip-web` owns OIP content contracts, fallback data, form validation,
  legal notices, and product presentation.
- `infra` owns Vercel, Cloudflare, and AWS/Pulumi provisioning.
- `@beep/ui` receives no OIP-specific theme or content.

## Explicitly Deferred

- Dedicated OIP AWS organization.
- Resend/transactional email.
- HubSpot tracking scripts.
- HubSpot Forms API activation until the service key has `forms` scope.
- Production DNS cutover.
- Legal/content review approval.
