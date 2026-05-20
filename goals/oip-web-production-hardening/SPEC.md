# OIP Web Production Hardening Specification

## Status

**LOCAL IMPLEMENTATION COMPLETE; PROVIDER LAUNCH GATES REMAIN**

## Mission

Make `@beep/oip-web` production-ready for staged deployment at `oip.law`
without approving legal/content launch gates or cutting over production DNS.

The hardened app must keep the current OIP brand and single-page launch shape,
but it must stop being only a static draft. Reviewable text, selected matters,
counsel-of-record entries, client logo visibility, press, SEO/AEO text, legal
notices, and `llms.txt` content become editable through Sanity with repo-local
fallbacks.

## Non-Negotiable Contract

- `oip-web-launch` remains the source for the first migration and launch
  review gates.
- OIP-specific copy, presentation, contact mapping, and content review logic
  stays app-local in `apps/oip-web`.
- `@beep/ui` remains product-agnostic. OIP theme overrides are app-local.
- Runtime/API wrappers for Sanity and HubSpot live in flat repo-level driver
  packages: `@beep/sanity` and `@beep/hubspot`.
- Vercel, Cloudflare, and AWS/Pulumi provisioning lives under `infra`.
- Raw secrets are never committed. Tracked config uses names or 1Password refs.
- HubSpot Personal Access Key is CLI/local only. Runtime uses the HubSpot
  Service Key.
- No Resend dependency and no HubSpot browser tracking scripts in v1.
- Production DNS cutover and final public launch require explicit user approval.

## Architecture Fit

- Sanity and HubSpot drivers expose technical services, typed config, typed
  errors, and testable HTTP boundaries without OIP product vocabulary.
- The OIP app maps Sanity documents into app-local content contracts and maps
  the native contact form into HubSpot. HubSpot Forms are used when a form GUID
  exists; otherwise the app upserts the contact through HubSpot CRM using the
  service key scopes currently available.
- The app resolves content with a fallback-first safety posture: if Sanity is
  not configured, returns no result, or fails decoding, the checked-in launch
  content still renders.
- Pulumi code is import-safe and uses a dedicated OIP infra entrypoint instead
  of expanding the existing AI metrics stack.

## Infrastructure Contract

- Temporary state backend:
  - AWS profile: `codedank-elpresidank`
  - region: `us-east-1`
  - bucket: `opip-law-pulumi-state`
  - public access blocked
  - versioning enabled
  - default SSE-S3 encryption enabled
  - HTTPS-only bucket policy
  - lifecycle policy for noncurrent versions
  - no website hosting and no public assets
- Pulumi S3 backend:
  - `pulumi login s3://opip-law-pulumi-state`
  - no DynamoDB lock table
  - `PULUMI_CONFIG_PASSPHRASE` comes from 1Password
- Dedicated OIP AWS organization migration is a tracked follow-up after OIP
  business email/root account/billing/MFA exist.

## Secret References

- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_VERCEL_TOKEN`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ACCOUNT_ID`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ACCOUNT_IAC_TOKEN`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_SANITY_KRIEG_IACTOKEN`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_SANITY_ORGANIZATION_ID`
- `op://Shared/OIP_SECRETS/CRM_HUBSPOT_ACCOUNT_ID`
- `op://Shared/OIP_SECRETS/CRM_HUBSPOT_SERVICE_KEY`
- `op://Shared/OIP_SECRETS/PULUMI_CONFIG_PASSPHRASE`

## Acceptance Criteria

- Initiative packet and research reports exist in the canonical locations.
- `@beep/sanity`, `@beep/hubspot`, `@beep/oip-web`, and `@beep/infra` pass
  their focused quality lanes.
- `@beep/oip-web` renders with Sanity-backed content when configured and
  repo-local fallback content otherwise.
- The native contact form validates server-side and submits to HubSpot through
  `@beep/hubspot`.
- The app includes `next.config.ts` security headers, PWA manifest/icons,
  robots, sitemap, `llms.txt`, conservative JSON-LD, and optimized production
  metadata.
- Staging infrastructure can be applied; production infrastructure previews
  cleanly but does not cut over DNS without approval.
- Browser QA and Lighthouse/Observatory evidence are recorded before closure.

## Provider Gates

- Cloudflare zones `oip.law` and `opip.law` exist and are active. `opip.law`,
  `www.opip.law`, and `staging.opip.law` are legacy redirect domains after
  cutover. OIP canonical DNS remains pending until provider apply.
- Vercel Authentication is configured disabled for OIP projects; API reads show
  no active password, trusted-IP, or Vercel Authentication protection.
- `https://staging.oip.law` is the new staging target. Historical public proof
  was recorded against `https://staging.opip.law` and must be refreshed after
  OIP staging DNS/TLS cutover. The current static `next.config.ts` CSP
  scores B+ / 80 because MDN Observatory rejects `unsafe-inline`; a strict
  no-unsafe CSP breaks Next App Router runtime scripts and Next/Image inline
  styles unless a request-bound nonce or equivalent generated hashes are added.
- `OIP_SECRETS` does not yet contain OIP Sanity project credentials. The
  Sanity driver and runtime content adapter are ready, but production content
  still falls back to checked-in reviewed content until the project exists.
