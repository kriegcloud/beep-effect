# OIP Web Launch Plan

## Implementation Status

The first migration milestone is implementation-complete and launch-review
pending.

- [x] Create the initiative packet and agent enablement notes.
- [x] Configure shadcn MCP for global and repo-local Codex.
- [x] Copy only launch-needed runtime assets into `apps/oip-web/public/oip/*`.
- [x] Replace the starter `@beep/oip-web` page with the migrated OIP site.
- [x] Move section content into app-local Effect Schema contracts and tests.
- [x] Update metadata, manifest, app guidance, and package tests.
- [x] Run package quality commands and browser smoke verification.

## UI Rules

- Use `@beep/ui/styles/globals.css` as the global Tailwind/shadcn base.
- Use shadcn/Base UI primitives from `@beep/ui` where they naturally fit.
- Keep OIP-specific layout, section composition, and brand tokens app-local.
- Keep MUI compatibility available through `@beep/ui`; do not force visible MUI
  components into the v1 marketing page.
- Preserve the prototype's core visual intent: soil-black editorial hero,
  prairie-cream page ground, burgundy/gold accents, real imagery, legal
  citations, and concise practice copy.

## Content Rules

- Treat the Claude site as a launch draft.
- Keep copy reviewable in typed content modules rather than buried in component
  constants.
- Mark client logos and named matters as `needs_review` until Tom/family/legal
  review confirms publication comfort.
- Keep source URLs for public matters and press links.
- Keep legal notice text visible near contact and in footer-adjacent context.

## Proof Commands

```sh
bun run --cwd apps/oip-web build
bun run --cwd apps/oip-web check
bun run --cwd apps/oip-web test
bun run --cwd apps/oip-web lint
bun run --cwd apps/oip-web type-test
```

Browser smoke:

```sh
bun run --cwd apps/oip-web dev
```

Then verify `https://oip-web.localhost:1355` with desktop and mobile
screenshots, anchor navigation, media rendering, contact links, no blocking
browser console errors, and no obvious text overlap. Keep generated screenshots
as local proof only; do not commit `output/playwright/*`.

## Closure Goal Command

Use this for merge-ready closure. It must not approve legal/content gates, push,
deploy, or create new shared/foundation packages:

```text
/goal Complete the OIP merge-ready closure for goals/oip-web-launch without stopping until the OIP app proof lane passes, the initiative packet says implementation complete with launch review pending, generated Playwright screenshots are kept out of the commit, and branch oip-web has one focused local commit with a clean working tree. Do not push, do not deploy, do not mark legal/content review gates approved, and do not create new shared/foundation packages.
```
