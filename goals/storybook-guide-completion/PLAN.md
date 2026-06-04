# Storybook Guide Completion Plan

This plan executes [SPEC.md](./SPEC.md). The goal is to drive the `@beep/ui`
Storybook Guide (`/settings/guide`) to 100% completion through real repo work,
verified in the live guide UI via Claude-in-Chrome.

Status: `active`. Current phase: **P0**. Current blockers: the P4 Vercel publish
is blocked on interactive auth (`op` signin, an MFA-authenticated AWS session for
the Pulumi `s3://oip-law-pulumi-state` backend, and the Cloudflare token); the P3
Chromatic visual tests need `CHROMATIC_PROJECT_TOKEN`.

Conventions for every phase:

- Start Storybook with `bun run storybook` (portless assigns the port; observed
  at `http://localhost:4884`). Read and act on `/settings/guide` through Chrome.
- Story work lands under `packages/foundation/ui-system/ui/stories/`.
- After UI-triggered completions, re-read the guide to confirm the item flipped
  to "Done" before moving on.

## P0: Bootstrap & Inventory Refresh

Status: pending

Goal: Establish a clean, accurate starting point.

Steps:

- Start Storybook and open `/settings/guide` in Chrome.
- Re-read every item's status; reconcile against the SPEC inventory table and
  add any newly-surfaced items.
- Un-skip all skipped items (skipped → open) so they can be driven to Done.

Exit Criteria:

- [ ] Live statuses match the SPEC inventory (or SPEC updated to match).
- [ ] No item remains in the "Skipped" state.

## P1: Story Authoring (pure repo work)

Status: pending

Goal: Build out the story corpus that completes the basics, development, and
document items.

Steps:

- Author CSF stories under `stories/` for real `@beep/ui` components, reaching
  ≥5 distinct components and ≥20 total stories.
- Use args so `controls` is exercisable; change a control in the UI.
- Exercise the viewport toolbar (`viewports`).
- Use hierarchical titles like `Atoms/Button` (`organizeStories`).
- Add `tags: ['autodocs']` (`autodocs`) and an `introduction.mdx` (`mdxDocs`).

Completes: `renderComponent`, `moreComponents`, `moreStories`, `controls`,
`viewports`, `organizeStories`, `autodocs`, `mdxDocs`.

Exit Criteria:

- [ ] Those eight items read "Done" in the live guide.
- [ ] New stories/MDX are committed and the package lint/check passes.

## P2: In-UI Testing

Status: pending

Goal: Exercise the already-installed test addons (`addon-vitest`, `addon-a11y`).

Steps:

- Add at least one `play()` interaction (`interactionTests`).
- Run component tests from the test widget (`runTests`).
- Enable the Accessibility checkbox and run (`accessibilityTests`).
- Enable the Coverage checkbox and run (`coverage`).

Completes: `runTests`, `interactionTests`, `accessibilityTests`, `coverage`.

Exit Criteria:

- [ ] Those four items read "Done" in the live guide.

## P3: Visual Testing (Chromatic-gated)

Status: pending — requires `CHROMATIC_PROJECT_TOKEN` and per-action approval.

Steps:

- `npx storybook add @chromatic-com/storybook`; restart Storybook
  (`installVisualTests`).
- With the user-supplied token and explicit approval, run visual tests
  (`visualTests`).

Completes: `installVisualTests`, `visualTests`.

Exit Criteria:

- [ ] `@chromatic-com/storybook` is installed and committed.
- [ ] Visual tests have run against a Chromatic project, or the item is reported
  blocked (no token) rather than silently completed.

## P4: Publish & CI

Status: pending — publish requires per-action approval and interactive auth.

The `infra/storybook` Pulumi stack and the A+ `vercel.json` headers are already
implemented; this phase deploys them and wires CI.

Steps:

- Deploy the Storybook to Vercel on `storybook.yeebois.com` via the Pulumi stack
  (`cd infra/storybook && ./deploy.sh up`), then Mark `publishStorybook` complete.
  Prerequisites: a signed-in `op` session, an MFA-authenticated AWS session (the
  Pulumi DIY backend `s3://oip-law-pulumi-state` is behind `ForceMFA`),
  `VERCEL_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, and `STORYBOOK_CLOUDFLARE_ZONE_ID`
  (all from 1Password via `op read`).
- Verify `storybook.yeebois.com` grades A+ on Mozilla Observatory; tune the
  `vercel.json` CSP if the live Storybook needs it (prefer hashes over `unsafe-*`).
- Add a GitHub Actions workflow running the Storybook Vitest project, then Mark
  `ciTests` complete.

Completes: `publishStorybook`, `ciTests`.

Exit Criteria:

- [ ] `storybook.yeebois.com` serves the deployment and grades A+ on Observatory
  (or the item is reported blocked on missing creds/approval).
- [ ] The CI workflow is committed and `ciTests` reads "Done".

## P5: AI Setup, What's-New & Final Verification

Status: pending

Steps:

- Run the guide's AI setup prompt (`aiSetup`).
- View the "What's new?" tab (`whatsNewStorybook10`).
- Re-read `/settings/guide`: confirm every item is "Done" and the guide reports
  100%.

Completes: `aiSetup`, `whatsNewStorybook10`.

Exit Criteria:

- [ ] Live guide reports 100% with no remaining skipped/open items.
- [ ] All supporting repo work is committed and affected gates pass.

## Verification Commands

```sh
test "$(wc -m < goals/storybook-guide-completion/GOAL.md)" -le 4000
jq . goals/storybook-guide-completion/ops/manifest.json
rg -n "storybook-guide-completion|GOAL.md|agentLaunchers|packetAnchorDocument" goals/storybook-guide-completion
git diff --check -- goals/storybook-guide-completion
```
