# GOAL: Drive the @beep/ui Storybook Guide to 100%

Repo: the `beep-effect` monorepo (run from the repository root).

Outcome: every item in the Storybook **Guide** (`/settings/guide`) for `@beep/ui`
reads "Done" and the guide reports 100% completion, each satisfied by real repo
work and verified in the live guide UI via Claude-in-Chrome.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/storybook-guide-completion/README.md`
- `goals/storybook-guide-completion/SPEC.md`
- `goals/storybook-guide-completion/PLAN.md`
- `goals/storybook-guide-completion/ops/manifest.json`

Read those first, then read `AGENTS.md`, `CLAUDE.md`, and the standards named by
`SPEC.md`. Higher-priority repo standards outrank packet prose when they conflict.
The live `/settings/guide` rendering is the authoritative item set and status.

Scope:

- In: stories under `packages/foundation/ui-system/ui/stories/`, that package's
  `.storybook/` and `vercel.json`, the `infra/storybook` Pulumi stack, a CI
  workflow for the Storybook Vitest project, and this packet's files. Drive guide
  items through the running UI via Claude-in-Chrome.
- Out: unrelated packages and infra stacks, secret values (resolved from
  1Password at runtime, never committed), and the goals packet standard itself.

Workflow:

1. Start Storybook (`bun run storybook`; portless assigns the port) and open
   `/settings/guide`. Reconcile the live inventory with `SPEC.md`; un-skip items.
2. Execute phases P1-P5 from `PLAN.md`, making the smallest real change per item.
3. After each UI-triggered completion, re-read the guide to confirm it flipped to
   "Done" before moving on.
4. Keep decisions tied to evidence (a rendered story, a test run, command output).
5. Update packet status/evidence as readiness changes.

Acceptance:

- [ ] `SPEC.md` acceptance criteria are satisfied.
- [ ] Live `/settings/guide` shows every item "Done" and the guide at 100%.
- [ ] `@beep/ui` and `@beep/infra` lint/check pass; new stories, `vercel.json`,
      the `infra/storybook` stack, and the CI workflow are committed.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/storybook-guide-completion/GOAL.md)" -le 4000
jq . goals/storybook-guide-completion/ops/manifest.json
git diff --check -- goals/storybook-guide-completion
```

Stop and report before any externally-gated or irreversible action: the Vercel
publish (`pulumi up` - needs `op` signin, an MFA-authenticated AWS session, the
Vercel + Cloudflare tokens, plus per-action approval) and any Chromatic visual
baseline (needs `CHROMATIC_PROJECT_TOKEN` plus per-action approval); and before
changing public API, schema, auth, infra, security behavior, dependencies, or
lockfiles unless `SPEC.md` explicitly requires it.

Done only when acceptance passes and verification is complete, or when a blocker
is reported with file/command evidence.
