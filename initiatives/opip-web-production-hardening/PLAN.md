# OPIP Web Production Hardening Plan

## Implementation Status

- [x] Create the production-hardening initiative packet.
- [x] Scaffold `@beep/sanity` and `@beep/hubspot` driver workspaces.
- [x] Fill research reports and synthesis.
- [x] Implement driver services, typed errors, tests, and type tests.
- [x] Wire CMS-backed content with fallback in `@beep/opip-web`.
- [x] Add native HubSpot-backed contact form.
- [x] Add security, PWA, SEO/AEO, robots, sitemap, JSON-LD, and `llms.txt`
  hardening.
- [x] Add OPIP Pulumi/IaC for S3 backend, Vercel, and Cloudflare.
- [x] Run quality, browser QA, staging proof, and closure updates.
- [x] Enable Cloudflare staging DNS records after the token has Zone DNS
  read/edit.
- [ ] Provision live Sanity content after OPIP Sanity project credentials exist.

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

bun run --cwd apps/opip-web build
bun run --cwd apps/opip-web build:pwa
bun run --cwd apps/opip-web check
bun run --cwd apps/opip-web test
bun run --cwd apps/opip-web lint
bun run --cwd apps/opip-web type-test

bun run --cwd infra check
bun run --cwd infra test
bun run --cwd infra lint
```

Browser and deployment proof:

```sh
bun run --cwd apps/opip-web start
aws-vault exec codedank-elpresidank --duration=12h -- aws sts get-caller-identity
pulumi login s3://opip-law-pulumi-state
pulumi preview -s staging --non-interactive --diff
pulumi up -s staging --yes --non-interactive
pulumi preview -s production --non-interactive --diff
```

## Closure Rules

- Keep screenshots and raw Lighthouse output in `history/outputs/` only when
  they are intentionally recorded.
- Do not commit generated browser screenshots by accident.
- Do not resolve legal/content launch review gates.
- Do not cut over production DNS without explicit approval.
