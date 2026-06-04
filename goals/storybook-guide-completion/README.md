# Storybook Guide Completion

## Status

Lifecycle: `active` — execution-capable. Live inventory captured 2026-06-04; no
guide items completed yet (0%).

Source: [`ops/manifest.json`](./ops/manifest.json)

## Launch

Execution-capable sessions launch with:

```text
/goal follow the instructions in goals/storybook-guide-completion/GOAL.md
```

`GOAL.md` is the compact launcher; `SPEC.md` remains the normative contract.

## Mission

Drive the Storybook **Guide** checklist (`/settings/guide`) for `@beep/ui` from
its current all-skipped, 0%-complete state to **100% completion** by doing real
repo work for every item — authoring stories, wiring tests, documenting
components, and publishing — then confirming each item reads "Done" in the live
guide UI through Claude-in-Chrome.

This is not a checklist-flipping exercise. Each guide item is satisfied by the
genuine work it represents (a rendered story, a passing test run, a published
build), and completion is verified against the running Storybook, not asserted.

## Reading Order

- [GOAL.md](./GOAL.md) - compact `/goal` launcher for execution agents
- [SPEC.md](./SPEC.md) - authoritative goal contract, live inventory, and
  per-item completion mechanics
- [PLAN.md](./PLAN.md) - phased execution roadmap
- [ops/manifest.json](./ops/manifest.json) - machine-readable item, phase,
  launcher, and verification metadata

For repo conventions, package placement, and quality lanes, `CLAUDE.md`,
`standards/ARCHITECTURE.md`, and `standards/architecture/*` outrank this packet.

## Target

- Package: `@beep/ui` at `packages/foundation/ui-system/ui`.
- Storybook: 10.4.2 via `@storybook/react-vite`, launched with
  `portless storybook.beep` (dynamic port; observed at
  `http://localhost:4884` on 2026-06-04).
- Stories home: `packages/foundation/ui-system/ui/stories/**/*.stories.@(ts|tsx)`
  (currently empty — zero stories exist).
- Installed addons: `@storybook/addon-docs`, `@storybook/addon-a11y`,
  `@storybook/addon-themes`, `@storybook/addon-vitest`. **Not** installed:
  `@chromatic-com/storybook` (required by the Visual Tests items).

## Completion Standard

This goal is complete when a live Chrome read of `/settings/guide` shows every
inventoried item in the "Done" state (none "Skipped" or "open") and the guide
reports 100% completion, with the underlying repo work (stories, tests, docs,
CI workflow, `vercel.json`, the `infra/storybook` stack, and the live
deployment) committed and its quality gates passing.

Externally-gated items split across two providers (see [SPEC.md](./SPEC.md)):

- `publishStorybook` → a **Vercel** deployment on `storybook.yeebois.com` via the
  `infra/storybook` Pulumi stack, graded **A+** on Mozilla Observatory. Needs an
  `op` session, an MFA-authenticated AWS session (Pulumi S3 backend), the Vercel
  + Cloudflare tokens, and explicit approval before `pulumi up`.
- `installVisualTests` / `visualTests` → **Chromatic** (`@chromatic-com/storybook`),
  needing a user-supplied `CHROMATIC_PROJECT_TOKEN` and per-action approval for the
  baseline run.

## Current Phase

P0 — Bootstrap & inventory refresh. Next action: start Storybook, re-read
`/settings/guide` via Claude-in-Chrome, reconcile the inventory, and un-skip all
items.

## Latest Evidence

Not started. The publish infrastructure (the `infra/storybook` Pulumi stack and
`packages/foundation/ui-system/ui/vercel.json`) is implemented but undeployed —
`pulumi up` is blocked on interactive auth (`op` signin, an MFA-authenticated AWS
session, and the Cloudflare token). See [`ops/manifest.json`](./ops/manifest.json)
`knownGaps`.
