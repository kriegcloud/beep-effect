# Storybook Guide Completion Specification

## Status

Lifecycle: **`active`** (execution-capable).

Live inventory captured 2026-06-04. No guide items have been completed yet (0%).

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-06-04
- **Updated:** 2026-06-04

## Purpose

`@beep/ui` ships Storybook with a built-in onboarding/learning **Guide**
(`/settings/guide`). The guide is a high-signal checklist of the practices that
make a Storybook genuinely useful: rendered components, broad story coverage,
controls, viewports, organized hierarchy, component/interaction/a11y/visual
tests, coverage, CI, autodocs, and MDX. Today the guide is at 0% — every item is
skipped and the package has no stories. This goal turns the guide into a forcing
function for building out the `@beep/ui` Storybook properly, with the guide's own
UI as the acceptance surface.

## Live Inventory

Captured via Claude-in-Chrome against the running Storybook on 2026-06-04. Every
item below is currently in the **"Skipped"** state. Item IDs are Storybook's
internal checklist task IDs; the guide renders them under the sections shown.

| # | Section | ID | Item | Current | Completion mechanism | External-gated |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | AI | `aiSetup` | Set up Storybook with AI | Skipped | Run the guide's "Copy prompt" AI setup prompt against the codebase | no |
| 2 | Basics | `renderComponent` | Render your first component | Skipped | Author first CSF story for a real `@beep/ui` component; auto-detected on render | no |
| 3 | Basics | `moreComponents` | Add 5 components | Skipped | Stories covering ≥5 distinct components | no |
| 4 | Basics | `moreStories` | Add 20 stories | Skipped | Reach ≥20 stories total | no |
| 5 | Basics | `whatsNewStorybook10` | See what's new | Skipped | View the "What's new?" tab | no |
| 6 | Development | `controls` | Change a story with Controls | Skipped | Args-driven story; change a value in the Controls panel | no |
| 7 | Development | `viewports` | Check responsiveness with Viewports | Skipped | Exercise the viewport toolbar on a story | no |
| 8 | Development | `organizeStories` | Group your components | Skipped | Hierarchical story titles (e.g. `Atoms/Button`) | no |
| 9 | Share | `publishStorybook` | Publish your Storybook for feedback | Skipped | Deploy to Vercel on `storybook.yeebois.com` via the `infra/storybook` Pulumi stack, then Mark as complete | **yes** |
| 10 | Testing | `runTests` | Test your components | Skipped | Run component tests via the test widget (`addon-vitest`) | no |
| 11 | Testing | `interactionTests` | Test functionality with interactions | Skipped | Add `play()` functions; run interaction tests | no |
| 12 | Testing | `accessibilityTests` | Run accessibility tests | Skipped | Enable the a11y checkbox and run (`addon-a11y`) | no |
| 13 | Testing | `installVisualTests` | Install Visual Tests addon | Skipped | `npx storybook add @chromatic-com/storybook`, restart | **yes** |
| 14 | Testing | `visualTests` | Run visual tests | Skipped | Run visual tests via the widget | **yes** |
| 15 | Testing | `coverage` | Generate a coverage report | Skipped | Enable the coverage checkbox and run | no |
| 16 | Testing | `ciTests` | Automate tests in CI | Skipped | Add a GH Actions workflow running the Storybook Vitest project; Mark as complete | no |
| 17 | Document | `autodocs` | Automatically document your components | Skipped | Add `tags: ['autodocs']` to a component meta / preview | no |
| 18 | Document | `mdxDocs` | Custom content with MDX | Skipped | Add an `introduction.mdx` docs page | no |

Notes:

- The Storybook 10.4.2 source also defines `installVitest`, `installA11y`,
  `installDocs`, `guidedTour`, and `onboardingSurvey`. These are **not** rendered
  as discrete items in this install (the addons are pre-installed / the items are
  pre-resolved), so they are out of the active inventory. The **rendered guide is
  the source of truth** — if a refresh surfaces new items, add them here.
- "Skipped" is not "Done". Reaching 100% requires moving each item to **Done**,
  which generally means un-skipping it first (skipped → open), then performing
  the real work the item represents.

## Completion Mechanics

- **Auto-detected items** (`renderComponent`, `moreComponents`, `moreStories`,
  `controls`, `viewports`, `organizeStories`, `autodocs`, `mdxDocs`,
  `runTests`, `interactionTests`, `accessibilityTests`, `coverage`): Storybook
  marks these done from real activity (a story renders, a control changes, a test
  run completes, the configured threshold is met). The work is authored in the
  repo (`stories/`, `.storybook/`) and triggered in the running UI via Chrome.
- **Mark-as-complete items** (`publishStorybook`, `ciTests`): the guide exposes a
  "Mark as complete" button. The real artifact is produced first, then the button
  records completion. For `publishStorybook` the artifact is the live Vercel
  deployment on `storybook.yeebois.com` (provisioned by the `infra/storybook`
  Pulumi stack); for `ciTests` it is the GitHub Actions workflow.
- **Addon-install item** (`installVisualTests`): completed by adding
  `@chromatic-com/storybook` and restarting Storybook.
- **View items** (`aiSetup`, `whatsNewStorybook10`): completed by running the AI
  setup prompt / viewing the What's-new tab.

## Locked Decisions

| Decision | Locked answer |
| --- | --- |
| Completion scope | Literal 100% — every rendered guide item, including the externally-gated ones. |
| Work depth | Real repo work that legitimately satisfies each item, verified in the live guide UI; not UI-only state flips. |
| Publish provider | Vercel, via the `infra/storybook` Pulumi stack, served on `storybook.yeebois.com` (Cloudflare DNS). Satisfies `publishStorybook`. Not Chromatic. |
| Visual-tests provider | Chromatic, via `@chromatic-com/storybook`. Satisfies `installVisualTests` and `visualTests` only. |
| Publish security posture | A+ Mozilla Observatory headers shipped via `packages/foundation/ui-system/ui/vercel.json` (mirrors `@beep/oip-web`, with `X-Frame-Options: SAMEORIGIN` / CSP `frame-ancestors 'self'` so the preview iframe works). |
| Credentials | Chromatic: `CHROMATIC_PROJECT_TOKEN`. Vercel: `VERCEL_API_TOKEN`. Cloudflare: `CLOUDFLARE_API_TOKEN` + zone id. All resolved from 1Password (`op read`) at execution time; never committed. |
| External-action gating | The Vercel publish (`pulumi up`) and any Chromatic visual-baseline run require explicit per-action approval. |
| Target package | `@beep/ui` at `packages/foundation/ui-system/ui`; stories live under its `stories/` directory. |
| Inventory source of truth | The live `/settings/guide` rendering, re-read at execution start. |

## External-Service Contract

Externally-gated items split across two providers.

### Publish — Vercel via Pulumi (`publishStorybook`)

`publishStorybook` is satisfied by a real deployment, not Chromatic. The
deployment is owned by the `infra/storybook` Pulumi stack (see
[Deployment Infrastructure](#deployment-infrastructure)):

- A git-connected `vercel.Project` builds `storybook-static/` and serves it on
  `storybook.yeebois.com` (Cloudflare CNAME → `cname.vercel-dns.com`).
- A+ security headers ship from `packages/foundation/ui-system/ui/vercel.json`.

Prerequisites before `pulumi up` (all interactive / user-owned):

- A signed-in 1Password session (`op signin`) so `op read` can resolve secrets.
- An MFA-authenticated AWS session — the Pulumi DIY backend
  (`s3://oip-law-pulumi-state`) is behind a `ForceMFA` policy.
- `VERCEL_API_TOKEN` ← `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_VERCEL_API_TOKEN`.
- `CLOUDFLARE_API_TOKEN` (the credential `@beep/oip-web` uses for Cloudflare;
  required for the CNAME — without it the project + domain are created but the
  DNS record is skipped).
- Cloudflare zone id ←
  `op://BEEP_SECRETS/BEEP_SECRETS/CLOUD_CLOUDFLARE_ZONE_ID_YEEBOIS_COM`, injected
  via `STORYBOOK_CLOUDFLARE_ZONE_ID` so it is never committed.
- Explicit per-action approval before `pulumi up`.

### Visual tests — Chromatic (`installVisualTests`, `visualTests`)

- `installVisualTests` adds the `@chromatic-com/storybook` addon (local, no upload).
- `visualTests` captures and uploads snapshots to a Chromatic project.
- Requires `CHROMATIC_PROJECT_TOKEN` in the environment (never committed) and
  explicit per-action approval for the baseline run.

If a provider's credential is unavailable, the affected item stays open and is
reported as blocked — it is never silently marked complete.

## Deployment Infrastructure

The publish path is implemented (deployment pending the auth above):

- `infra/src/Storybook.ts` — `StorybookStack` component + schema-first config.
- `infra/src/internal/storybook-entry.ts` — Pulumi entrypoint.
- `infra/storybook/` — Pulumi sub-project (`Pulumi.yaml`,
  `Pulumi.production.yaml`, `deploy.sh`, `README.md`).
- `packages/foundation/ui-system/ui/vercel.json` — A+ security headers.

The static CSP (`script-src 'self'`, `style-src 'self' 'unsafe-inline'`) targets
an A+ Observatory score but must be verified against the live deployment; if
Storybook fails to boot under it, prefer adding script **hashes** over
`'unsafe-inline'`/`'unsafe-eval'` (see `infra/storybook/README.md`).

## Verification

Acceptance is verified against the running Storybook, not asserted from repo
state alone:

- Start Storybook (`bun run storybook`, portless assigns the port) and read
  `/settings/guide` via Claude-in-Chrome.
- Confirm every inventoried item renders as **"Done"** (no "Skipped"/"open"
  remaining) and the guide reports 100%.
- Confirm the supporting repo work is committed: stories under
  `packages/foundation/ui-system/ui/stories/`, the `@chromatic-com/storybook`
  dependency, the CI workflow, `packages/foundation/ui-system/ui/vercel.json`,
  the `infra/storybook` stack, and any `.storybook` changes.
- Confirm `storybook.yeebois.com` serves the deployed Storybook and that
  <https://developer.mozilla.org/en-US/observatory> grades it **A+**.
- Confirm affected quality gates pass for the changed packages (`@beep/ui` and
  `@beep/infra` lint/check, and the Storybook Vitest run where applicable).

## Source-Of-Truth Order

When sources disagree, use this order (per the `goals/README.md` Source
Hierarchy):

1. The user objective that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `standards/ARCHITECTURE.md` and `standards/architecture/*`.
4. this `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md` (the compact `/goal` launcher).
7. `ops/manifest.json` and the live `/settings/guide` rendering (for the current
   item set and statuses).

## Acceptance Criteria

- All 18 inventoried guide items read "Done" in a live Chrome read of
  `/settings/guide`, and the guide reports 100% completion.
- `@beep/ui` has ≥5 distinct components covered by stories and ≥20 stories total
  under `packages/foundation/ui-system/ui/stories/`.
- At least one story uses args/Controls, exercises viewports, uses hierarchical
  (grouped) titles, carries the `autodocs` tag, and at least one story defines a
  `play()` interaction.
- An `introduction.mdx` docs page exists.
- Component tests, interaction tests, accessibility tests, and coverage have been
  run from the test widget with completion reflected in the guide.
- `publishStorybook` is satisfied by a live Vercel deployment on
  `storybook.yeebois.com` (via the `infra/storybook` Pulumi stack) that grades
  **A+** on Mozilla Observatory; the item is then marked complete (or reported
  blocked if the deploy credentials/approval are unavailable).
- `@chromatic-com/storybook` is installed; visual tests have been produced via
  Chromatic with the user's token and per-action approval (or the blocked item is
  explicitly reported if no token was supplied).
- A CI workflow runs the Storybook Vitest project, and `ciTests` is marked
  complete.
- Affected `lint`/`check` gates pass for the changed packages (`@beep/ui`,
  `@beep/infra`); new stories, `vercel.json`, the `infra/storybook` stack, and the
  workflow are committed.

## Stop Conditions

- The live `/settings/guide` item set materially contradicts this inventory and
  cannot be reconciled.
- Completing an item would exceed the named scope or require unrelated refactors.
- An externally-gated action lacks its credential or approval: the Vercel publish
  (`op` signin + MFA-authenticated AWS session + Vercel/Cloudflare tokens +
  per-action approval) or a Chromatic baseline (`CHROMATIC_PROJECT_TOKEN` +
  per-action approval). The affected item stays open and is reported blocked —
  never silently marked complete.
- The same blocker repeats after reasonable investigation.
