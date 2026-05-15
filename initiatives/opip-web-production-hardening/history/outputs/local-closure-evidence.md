# OPIP Web Production Hardening Evidence

## Local App And Quality

- `bun run config-sync:check` passed.
- `bun run check` passed across 60 packages.
- `bun run lint` passed after encrypted OPIP Pulumi stack YAML files were
  excluded from spellcheck.
- `bun run build` passed across 60 packages.
- `bun run test` passed across unit, type-test, and integration lanes. The
  known PGLite Testcontainers checks skipped because Docker/Testcontainers were
  unavailable or redundant.
- `bun run --cwd apps/opip-web check` passed after the HubSpot CRM fallback.
- `bun run --cwd apps/opip-web test` passed: 1 file, 8 tests.
- `bun run --cwd apps/opip-web lint` passed.
- `bun run --cwd packages/drivers/hubspot check` passed.
- `bun run --cwd packages/drivers/hubspot test` passed: 1 file, 3 tests.
- `bun run --cwd packages/drivers/hubspot lint` passed.
- `bun run --cwd infra check`, `bun run --cwd infra test`, and
  `bun run --cwd infra lint` passed after the Vercel branch-domain fix.
- After the Cloudflare token update, `bun run --cwd infra check` and
  `bun run --cwd infra lint` passed again.

## Browser And Lighthouse

- Local QA used `https://opip-web.localhost:1355`.
- The theme toggle worked without the earlier Next canary
  `Unexpected Fiber popped` console error.
- The contact form rendered as a progressive HTML form posting to
  `/api/contact`.
- Lighthouse local proof reached 100 for accessibility, best practices, and SEO.
  Performance varied under local Next 16 canary/Turbopack runs; the best
  observed run reached 99, while later fresh-profile runs landed in the high
  80s because of local total blocking time variance.

## Pulumi State Backend

- AWS identity: `arn:aws:iam::832907639880:user/elpresidank`.
- Backend bucket: `opip-law-pulumi-state`.
- Region: `us-east-1`.
- `pulumi login s3://opip-law-pulumi-state` succeeded.
- Bucket hardening applied:
  - public access block enabled
  - versioning enabled
  - default SSE-S3 encryption enabled
  - HTTPS-only bucket policy applied
  - noncurrent version lifecycle expiration set to 90 days
  - incomplete multipart uploads aborted after 7 days
- `op://Shared/OPIP_SECRETS/PULUMI_CONFIG_PASSPHRASE` was created and used for
  passphrase-encrypted stack config.

## Staging

- Stack: `staging`.
- Vercel project id: `prj_orJn2nvxflBiJqPF0VWLOD0RFAzE`.
- Vercel project name: `opip-web-staging`.
- Staging domain attached in Vercel: `staging.opip.law`.
- Asset bucket created and hardened: `staging-assets.opip.law`.
- Runtime env applied:
  - `NEXT_DISABLE_PWA`
  - `CRM_HUBSPOT_ACCOUNT_ID`
  - `CRM_HUBSPOT_SERVICE_KEY`
- Cloudflare DNS record applied:
  - name: `staging.opip.law`
  - type: `CNAME`
  - target: `cname.vercel-dns.com`
  - proxied: `false`
- Local resolver proof after DNS creation returned Vercel addresses for
  `staging.opip.law`.
- Final staging preview after DNS apply reported 13 unchanged resources.
- Initial Vercel domain apply failed because branch `staging` did not exist.
  The staging stack now points the staging project domain at `main`; the IaC
  omits `gitBranch` when the requested branch is the production branch, matching
  Vercel provider requirements.
- Immediately after DNS creation, `curl -I https://staging.opip.law` still
  returned a TLS connect error, consistent with Vercel certificate/deployment
  propagation not being ready yet.

## Production

- Stack: `production`.
- Production preview succeeded and was not applied.
- Previewed resources include:
  - Vercel project `opip-web`
  - production domain `opip.law`
  - redirect domain `www.opip.law`
  - Cloudflare CNAME records for `opip.law` and `www.opip.law`
  - hardened S3 asset bucket `assets.opip.law`
  - Vercel runtime env for PWA and HubSpot intake

## Provider Gates

- Cloudflare zone `opip.law` exists and is active:
  `0d26e874202f4579081926dc38b3bf80`.
- The updated Cloudflare token can read DNS records and Pulumi created the
  staging CNAME.
- Production DNS remains unapplied until explicit cutover approval.
- HubSpot service key works for account info and CRM contact batch upsert.
- HubSpot Forms API access is blocked by missing `forms` scope, so the app now
  falls back to CRM contact upsert when no form GUID exists.
- `OPIP_SECRETS` does not currently contain OPIP Sanity project credentials.
  Sanity-backed runtime loading is implemented, but live editable content falls
  back to checked-in content until those credentials exist.
