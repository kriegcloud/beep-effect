# OPIP Web Production Hardening

## Status

Implementation is wired and staging infrastructure has been applied to the
temporary S3 Pulumi backend, including Cloudflare DNS for `staging.opip.law`.
The local app now proves its CSP/security headers through the portless HTTPS
route. Remaining launch blockers are external content/deployment operations,
not local app or IaC module shape:

- Sanity live content remains unconfigured because no OPIP Sanity project/token
  is present in `OPIP_SECRETS`; the app renders checked-in reviewed fallback
  content until that is provisioned.
- Vercel TLS activation for `https://staging.opip.law` is now live.
- MDN HTTP Observatory reports B+ / 80 on staging because the static
  `next.config.ts` CSP must keep `unsafe-inline` for Next App Router runtime
  scripts and Next/Image inline styles. A+ requires a request-bound nonce CSP
  path or equivalent script/style hashes.

## Overview

This initiative hardens `@beep/opip-web` after the first OPIP website migration.
It keeps the launch review gates from `opip-web-launch`, then adds production
security, search/AEO assets, PWA support, CMS-backed editable content, native
CRM intake, and deployable infrastructure for staging and gated production.

The first production path is managed-first and lean:

- Sanity owns reviewed editable content.
- HubSpot receives native intake through the service key. The app uses a
  HubSpot Form when a form GUID is configured and otherwise falls back to CRM
  contact upsert, which matches the currently granted scopes.
- Vercel hosts staging and production.
- Cloudflare owns DNS for `opip.law`, with the staging CNAME now managed by
  Pulumi.
- Pulumi is configured for a temporary private S3 state bucket in codedank until
  a dedicated OPIP AWS organization exists.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative initiative contract
- [PLAN.md](./PLAN.md) - implementation plan and proof loop
- [research/synthesis-and-decisions.md](./research/synthesis-and-decisions.md)
  - chosen production posture
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing surface

## Closure Goal

```text
/goal Complete initiatives/opip-web-production-hardening end to end without stopping until the canonical initiative packet is created and filled, the temporary encrypted S3 Pulumi backend exists in codedank us-east-1, Sanity and HubSpot drivers are implemented with tests, @beep/opip-web renders Sanity-backed reviewed content with repo fallbacks, the native contact form submits to HubSpot through the driver, security/PWA/SEO/AEO/llms.txt hardening is implemented, staging infrastructure is applied for Vercel, Cloudflare DNS automation is either applied or blocked with exact provider evidence, production infrastructure has a clean preview, all repo quality gates pass, browser QA and Lighthouse proof are recorded, and the working tree is ready for focused commits. Do not expose raw secrets, do not use HubSpot Personal Access Key at runtime, do not add Resend in v1, do not add HubSpot tracking scripts, do not use AWS MCP for bootstrap, do not mark legal/content review gates approved, and do not cut over opip.law production DNS without explicit user approval.
```

## Deferred Decisions

- A dedicated OPIP AWS organization remains deferred until the preferred OPIP
  business email, root account, billing, and MFA are ready.
- Resend or another transactional email service remains deferred until HubSpot
  notifications are insufficient or branded acknowledgment emails are approved.
- HubSpot tracking scripts remain deferred until the privacy and performance
  tradeoff is explicitly accepted.

## Closure Notes

- Local app, driver, infra, repo quality, browser QA, PWA build, and Lighthouse
  proof are recorded in [history/outputs/local-closure-evidence.md](./history/outputs/local-closure-evidence.md).
- The encrypted S3 backend, staging Vercel project/domain/env, disabled Vercel
  Authentication posture, and staging asset bucket have been applied from
  `infra/opip-web`.
- The production stack has been initialized and previews cleanly; it has not
  been applied.
- Cloudflare staging DNS is applied and the staging stack has reached a no-diff
  preview after DNS creation.
- Staging Lighthouse proof is 100 across performance, accessibility, best
  practices, SEO, and agentic-browsing after adding Markdown links to
  `llms.txt`.
- Production DNS records preview cleanly but have not been applied.
- Production DNS cutover remains explicitly out of scope until the user approves
  it after staging review.
