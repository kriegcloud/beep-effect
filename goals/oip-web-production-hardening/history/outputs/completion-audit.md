# OPIP Web Production Hardening Completion Audit

## Objective

Complete `goals/oip-web-production-hardening` end to end: create and
fill the initiative packet and research reports; implement Sanity and HubSpot
drivers; harden `@beep/opip-web` with CMS-backed content, native HubSpot contact
form, security/PWA/SEO/AEO/`llms.txt` improvements; add a temporary encrypted
S3 Pulumi backend plus Vercel/Cloudflare staging/prod IaC; verify quality,
browser QA, Lighthouse/staging proof; and leave a clean working tree without
exposing secrets or cutting over production DNS.

## Prompt-To-Artifact Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Initiative packet exists and is filled | `README.md`, `SPEC.md`, `PLAN.md`, `ops/manifest.json`, and `history/outputs/local-closure-evidence.md` under this initiative | Complete |
| Research reports exist | `research/aeo-seo-llms.md`, `research/cms-crm-contact-analytics.md`, `research/deployment-iac-vercel-cloudflare-pulumi.md`, `research/security-pwa-lighthouse.md`, `research/synthesis-and-decisions.md` | Complete |
| Sanity driver implemented with tests | `packages/drivers/sanity/src/*`, `packages/drivers/sanity/test/Sanity.service.test.ts`, package quality commands recorded as passing | Complete |
| HubSpot driver implemented with tests | `packages/drivers/hubspot/src/*`, `packages/drivers/hubspot/test/HubSpot.service.test.ts`, package quality commands recorded as passing | Complete |
| CMS-backed OPIP content with fallback | `apps/opip-web/src/content/OpipContent.runtime.ts` loads Sanity when configured and falls back to checked-in launch content | Complete |
| Native HubSpot contact form | `apps/opip-web/src/contact/ContactSubmission.service.ts` and `apps/opip-web/src/app/api/contact/route.ts` validate submissions and call HubSpot Forms or CRM upsert through the driver | Complete |
| Security headers and CSP | `apps/opip-web/next.config.ts`; local portless and public staging header proof recorded in `local-closure-evidence.md` | Complete with Observatory caveat |
| PWA support | `apps/opip-web/src/app/manifest.ts`, app icons, `next-pwa` build path, and `bun run --cwd apps/opip-web build:pwa` proof | Complete |
| SEO/AEO and `llms.txt` | `robots.ts`, `sitemap.ts`, JSON-LD in `page.tsx`, `llms.txt` route, and Markdown-link `llms.txt` content | Complete |
| Temporary encrypted S3 Pulumi backend | AWS proof confirms `opip-law-pulumi-state` has SSE-S3 encryption, public access block, and versioning enabled | Complete |
| Vercel/Cloudflare staging IaC | `infra/src/OpipWeb.ts`, `infra/opip-web/Pulumi.staging.yaml`, applied staging stack, `staging.opip.law` HTTPS proof | Complete |
| Production IaC without DNS cutover | `infra/opip-web/Pulumi.production.yaml` and manifest record production preview only; production DNS cutover remains blocked without explicit approval | Complete |
| Vercel Authentication disabled for previews | Manifest and Vercel API evidence record no active password, trusted-IP, or Vercel Authentication protection | Complete |
| Quality gates | Root `check`, `lint`, `build`, `test`, app `check`/`test`/`lint`/`build:pwa`, infra and driver checks recorded in evidence | Complete |
| Browser QA and Lighthouse proof | `local-closure-evidence.md` records clean browser QA and staging Lighthouse 100 across performance, accessibility, best practices, SEO, and agentic-browsing | Complete |
| No raw secrets exposed | Pulumi secrets remain encrypted; final closeout secret scan over changed existing files passed | Complete |
| Clean working tree | Final closeout commit and post-commit `git status --short --branch` proof are required | Complete after closure commit |

## Caveats And Explicit Non-Goals

- MDN HTTP Observatory is B+ / 80 because a static `next.config.ts` CSP still
  needs `unsafe-inline` for the current Next app. A+ requires request-bound
  nonces or generated hashes.
- OPIP Sanity live project credentials are not present yet, so live Sanity
  publishing is blocked while the driver and app fallback path are complete.
- HubSpot Forms are deferred until a form GUID/scope exists; CRM contact upsert
  is active through the service key path.
- Production DNS cutover is intentionally not performed.
