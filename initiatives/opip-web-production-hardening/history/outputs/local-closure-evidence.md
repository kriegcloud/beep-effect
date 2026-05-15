# OPIP Web Production Hardening Evidence

<!-- cspell:words HSTS nvxfl VWLOD -->

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
- After moving CSP/security headers into `next.config.ts`,
  `bun run --cwd apps/opip-web check`, `bun run --cwd apps/opip-web test`, and
  `bun run --cwd apps/opip-web lint` passed.
- `bun run --cwd apps/opip-web build:pwa` passed after the final CSP and
  `llms.txt` updates; generated service worker files were removed from the
  working tree after verification.
- `bun run audit:github quality` passed after refreshing the repo export
  catalog and sorting dependency keys in `apps/opip-web/package.json` and
  `infra/package.json`.
- Final closeout secret scan over changed existing files passed without
  findings.

## Security Headers And CSP

- CSP/security headers are emitted from `apps/opip-web/next.config.ts`.
- The former `src/proxy.ts` nonce middleware was removed so the response header
  source is the Next config, matching the deployment surface expected by Vercel
  and Observatory.
- Verified local HTTPS header delivery through portless with:
  `curl --cacert "$HOME/.portless/ca.pem" -I https://localhost:1355 -H 'Host: opip-web.localhost:1355'`.
- The same portless HTTPS route returned `x-portless: 1`, HTTP/2 200, CSP,
  HSTS, referrer policy, `x-content-type-options: nosniff`, frame denial,
  permissions policy, COOP, CORP, and origin-agent-cluster headers.
- Verified `https://opip-web.localhost:1355` in Chromium with certificate
  errors ignored for the local portless CA: HTTP 200, CSP present, HSTS present,
  zero console errors, zero page errors, and zero failed requests.
- Portless currently serves a wildcard `*.localhost` certificate that curl and
  Chromium do not accept for `opip-web.localhost`; the verified curl path uses
  `https://localhost:1355` with the OPIP Host header and the portless CA.
- Public staging CSP is deployed to `https://staging.opip.law`.
- MDN HTTP Observatory v2 reports grade B+ / score 80 with 9 of 10 tests
  passing. The failing test is `content-security-policy` with result
  `csp-implemented-with-unsafe-inline`.
- A strict no-unsafe CSP was tested in Chromium by overriding the staging
  document response header. It blocked Next App Router inline scripts,
  Next/Image inline style attributes, and produced a React runtime error. This
  confirms that Observatory A+ is not safe with a static `next.config.ts` CSP
  for this app; it needs request-bound nonces or generated script/style hashes.

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
- Public staging Lighthouse proof at `https://staging.opip.law` reached 100 for
  performance, accessibility, best practices, SEO, and agentic-browsing.
- The first public staging Lighthouse run scored 67 for agentic-browsing because
  `llms.txt` did not contain Markdown links. `llms.txt` now links canonical URL,
  contact email, public matter sources, and press sources.

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
- Vercel Authentication is configured disabled through Pulumi. The Vercel
  project API currently reports `vercelAuthentication: null`,
  `passwordProtection: null`, and `trustedIps: null`, which is the disabled
  posture.
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
- Immediately after DNS creation, `curl -I https://staging.opip.law` returned a
  TLS connect error. A later check returned HTTP/2 200, so Vercel custom-domain
  TLS is active.
- `https://staging.opip.law` and `https://opip-web-staging.vercel.app` respond,
  and now serve the deployment containing the `next.config.ts` CSP and linked
  `llms.txt`.
- The first current-code staging deployment showed Vercel Analytics attempting
  to load `/_vercel/insights/script.js`, which returned 404 and caused a
  browser MIME-type console error. Vercel Analytics and Speed Insights are now
  gated behind `NEXT_PUBLIC_ENABLE_VERCEL_INSIGHTS=1` so the static v1 stays
  console-clean until the Vercel project-side analytics asset is enabled.

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
