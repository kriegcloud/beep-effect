# OPIP Web Launch

## Status

Implementation complete; launch review pending.

## Overview

This initiative migrated the prototype OPIP law-firm website from
`/home/elpresidank/Documents/OP_IP_LAW/site` into the bootstrapped
`@beep/opip-web` app.

The first milestone was a faithful port-and-refactor: preserve the existing
brand story, public sections, assets, SEO posture, and launch copy direction
while making the implementation repo-native through `@beep/ui`, Tailwind v4,
Base UI/shadcn v4 conventions, app-local Effect Schema content contracts, and
repo quality gates.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative initiative contract
- [PLAN.md](./PLAN.md) - implementation plan and proof loop
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing surface

## Closure Goal

The implementation goal is complete. The remaining closure goal is merge-ready
repo state, not public launch approval or deployment:

```text
/goal Complete the OPIP merge-ready closure for goals/opip-web-launch without stopping until the OPIP app proof lane passes, the initiative packet says implementation complete with launch review pending, generated Playwright screenshots are kept out of the commit, and branch opip-web has one focused local commit with a clean working tree. Do not push, do not deploy, do not mark legal/content review gates approved, and do not create new shared/foundation packages.
```

## Launch Notes

- The source prototype is a reviewed draft candidate, not final legal copy.
- Client marks, named matters, credentials, and public claims remain
  review-gated before publishing.
- The v1 public site must not show fake AI widgets or unimplemented product
  features.
- Tailnet, standalone, static export, and production deployment remain
  follow-up decisions.
