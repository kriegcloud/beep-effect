# OIP Web Production Hardening Plan

## Implementation Status

- [x] Create the production-hardening initiative packet.
- [x] Scaffold `@beep/sanity` and `@beep/hubspot` driver workspaces.
- [x] Fill research reports and synthesis.
- [x] Implement driver services, typed errors, tests, and type tests.
- [x] Wire CMS-backed content with fallback in `@beep/oip-web`.
- [x] Add native HubSpot-backed contact form.
- [x] Add security, PWA, SEO/AEO, robots, sitemap, JSON-LD, and `llms.txt`
  hardening.
- [x] Add OIP Pulumi/IaC for S3 backend, Vercel, and Cloudflare.
- [x] Run local quality, browser QA, Lighthouse, and closure evidence updates.
- [x] Prove the `next.config.ts` CSP/security headers locally through portless
  HTTPS.
- [x] Migrate the temporary Pulumi S3 backend from `opip-law-pulumi-state` to
  `oip-law-pulumi-state`, then delete the legacy versioned bucket after proof.
- [x] Rename empty OIP asset buckets to `assets.oip.law` and
  `staging-assets.oip.law` through Pulumi.
- [ ] Apply Cloudflare DNS for `staging.oip.law`, `www.oip.law`, and OPIP
  legacy redirect records through the OIP rename IaC.
- [ ] Prove the current hardening on public `staging.oip.law` after a fresh
  Vercel deployment and custom-domain TLS activation.
- [ ] Decide whether Observatory A+ should override the `next.config.ts`-only
  CSP constraint; A+ requires a request-bound nonce/proxy path or equivalent
  generated hashes.
- [ ] Provision live Sanity content after OIP Sanity project credentials exist.

## Proof Commands

```sh
bun run --cwd packages/drivers/sanity build
bun run --cwd packages/drivers/sanity check
bun run --cwd packages/drivers/sanity test
bun run --cwd packages/drivers/sanity lint

bun run --cwd packages/drivers/hubspot build
bun run --cwd packages/drivers/hubspot check
bun run --cwd packages/drivers/hubspot test
bun run --cwd packages/drivers/hubspot lint

bun run --cwd apps/oip-web build
bun run --cwd apps/oip-web build:pwa
bun run --cwd apps/oip-web check
bun run --cwd apps/oip-web test
bun run --cwd apps/oip-web lint
bun run --cwd apps/oip-web type-test

bun run --cwd infra check
bun run --cwd infra test
bun run --cwd infra lint
```

Browser and deployment proof:

```sh
bun run --cwd apps/oip-web start
aws-vault exec codedank-elpresidank --duration=12h -- aws sts get-caller-identity
bun run goals/oip-web-production-hardening/ops/migrate-oip-state-bucket.ts --dry-run
bun run goals/oip-web-production-hardening/ops/migrate-oip-state-bucket.ts --yes
pulumi login s3://oip-law-pulumi-state
pulumi preview -s staging --non-interactive --diff
pulumi up -s staging --yes --non-interactive
pulumi preview -s production --non-interactive --diff
pulumi up -s production --yes --non-interactive
bun run goals/oip-web-production-hardening/ops/migrate-oip-state-bucket.ts --delete-source --yes
bun run goals/oip-web-production-hardening/ops/migrate-oip-state-bucket.ts --dry-run
curl --cacert "$HOME/.portless/ca.pem" -I https://localhost:1355 -H 'Host: oip-web.localhost:1355'
```

## Closure Rules

- Keep screenshots and raw Lighthouse output in `history/outputs/` only when
  they are intentionally recorded.
- Do not commit generated browser screenshots by accident.
- Do not resolve legal/content launch review gates.
- Do not cut over production DNS without explicit approval.
