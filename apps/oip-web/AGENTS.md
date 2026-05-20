# @beep/oip-web Agent Guide

## Purpose & Fit
- Public Next.js app for the OIP solo-practice intellectual property law firm
  website.
- Uses `@beep/ui` as the product-agnostic Tailwind/shadcn/Base UI foundation.
- Keeps OIP-specific content, launch review gates, and presentation app-local
  unless reuse proves a slice or shared-kernel package is needed.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |
| `src/content` | `oipSiteContent`, schemas, review gates | static launch content and public-claim review status |
| `src/components` | `OipHomePage` | app-local public site composition |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Follow `initiatives/oip-web-launch` for launch scope and review gates.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/oip-web"
```

## Verifications
- `bunx turbo run test --filter=@beep/oip-web`
- `bunx turbo run lint --filter=@beep/oip-web`
- `bunx turbo run check --filter=@beep/oip-web`
- `bunx turbo run build --filter=@beep/oip-web`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
