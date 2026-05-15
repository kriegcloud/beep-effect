# OPIP Web Production Hardening Specification

## Status

**LOCAL IMPLEMENTATION COMPLETE; PROVIDER LAUNCH GATES REMAIN**

## Mission

Make `@beep/opip-web` production-ready for staged deployment at `opip.law`
without approving legal/content launch gates or cutting over production DNS.

The hardened app must keep the current OPIP brand and single-page launch shape,
but it must stop being only a static draft. Reviewable text, selected matters,
counsel-of-record entries, client logo visibility, press, SEO/AEO text, legal
notices, and `llms.txt` content become editable through Sanity with repo-local
fallbacks.

## Non-Negotiable Contract

- `opip-web-launch` remains the source for the first migration and launch
  review gates.
- OPIP-specific copy, presentation, contact mapping, and content review logic
  stays app-local in `apps/opip-web`.
- `@beep/ui` remains product-agnostic. OPIP theme overrides are app-local.
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
  errors, and testable HTTP boundaries without OPIP product vocabulary.
- The OPIP app maps Sanity documents into app-local content contracts and maps
  the native contact form into HubSpot. HubSpot Forms are used when a form GUID
  exists; otherwise the app upserts the contact through HubSpot CRM using the
  service key scopes currently available.
- The app resolves content with a fallback-first safety posture: if Sanity is
  not configured, returns no result, or fails decoding, the checked-in launch
  content still renders.
- Pulumi code is import-safe and uses a dedicated OPIP infra entrypoint instead
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
- Dedicated OPIP AWS organization migration is a tracked follow-up after OPIP
  business email/root account/billing/MFA exist.

## Secret References

- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_VERCEL_TOKEN`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ACCOUNT_ID`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ACCOUNT_IAC_TOKEN`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_SANITY_KRIEG_IACTOKEN`
- `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_SANITY_ORGANIZATION_ID`
- `op://Shared/OPIP_SECRETS/CRM_HUBSPOT_ACCOUNT_ID`
- `op://Shared/OPIP_SECRETS/CRM_HUBSPOT_SERVICE_KEY`
- `op://Shared/OPIP_SECRETS/PULUMI_CONFIG_PASSPHRASE`

## Acceptance Criteria

- Initiative packet and research reports exist in the canonical locations.
- `@beep/sanity`, `@beep/hubspot`, `@beep/opip-web`, and `@beep/infra` pass
  their focused quality lanes.
- `@beep/opip-web` renders with Sanity-backed content when configured and
  repo-local fallback content otherwise.
- The native contact form validates server-side and submits to HubSpot through
  `@beep/hubspot`.
- The app includes security headers, PWA manifest/icons, robots, sitemap,
  `llms.txt`, conservative JSON-LD, and optimized production metadata.
- Staging infrastructure can be applied; production infrastructure previews
  cleanly but does not cut over DNS without approval.
- Browser QA and Lighthouse/Observatory evidence are recorded before closure.

## Provider Gates

- Cloudflare zone `opip.law` exists and is active. Staging DNS is applied.
  Production DNS remains preview-only until explicit cutover approval.
- `OPIP_SECRETS` does not yet contain OPIP Sanity project credentials. The
  Sanity driver and runtime content adapter are ready, but production content
  still falls back to checked-in reviewed content until the project exists.
