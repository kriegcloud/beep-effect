# Changesets + Turborepo Release Setup

## Status

- Status: `completed`
- Slice: `repo root (release tooling + CI)`
- Type: `workflow setup`
- Started: `2026-02-20`
- Completed: `2026-02-20`
- Release Mode: `release PR automation on push to main + manual publish approval via workflow_dispatch`

## Problem Statement

At the start of this spec, the repo did not have a formal Changesets release workflow. This is now implemented and documented. The standardized process now covers:

- authoring release notes/version bumps,
- generating release PRs,
- publishing from CI,
- and keeping release steps aligned with Turborepo task orchestration.

Because the release guide was intentionally reset in this branch, this spec is written as a **discovery-first** setup plan: capture decisions first, then apply the minimum viable implementation.

## Context

- A reference subtree exists at `.repos/beep-effect/`.
- Target style for this spec follows `.repos/beep-effect/specs/pending/*`.
- Current workspace package surface includes both private tooling packages and at least one publishable package.

## Goals

1. Define a repo-specific Changesets policy (what releases, what stays private, and from which branch).
2. Implement a Turborepo-aligned release flow where package build/test tasks run through `turbo run`.
3. Add CI automation for release PR creation and publish.
4. Document a lightweight contributor flow for adding changesets.

## Implementation Outcome

- Release decisions captured in:
  - `outputs/current-release-surface.md`
  - `outputs/release-decisions.md`
- Changesets configured in `.changeset/config.json` with `baseBranch: main` and private workspace packages ignored for publish.
- Root release scripts implemented in `package.json`:
  - `changeset`
  - `changeset:status`
  - `changeset:version`
  - `release` (`build + test + lint + changeset publish`)
- GitHub Actions release workflow implemented in `.github/workflows/release.yml` with:
  - automatic release PR create/update on `push` to `main`
  - manual publish gate on `workflow_dispatch` with `confirm_publish=PUBLISH`
  - environment approval gate via `release-publish`
- Maintainer/contributor docs and verification artifacts added under `outputs/`.

## Non-Goals

- Deciding long-term package visibility strategy for all tooling packages in this pass.
- Adding prerelease channels (`next`, canary) unless explicitly chosen during decision capture.
- Changing package naming, scope, or registry strategy.

## Scope

In scope:

- Capture explicit release decisions in `outputs/` before implementation.
- Add and initialize `@changesets/cli`.
- Add root release scripts that delegate package work via Turborepo.
- Add CI release workflow (Release PR + publish).
- Add release documentation for contributors/maintainers.

Out of scope:

- Converting private packages to public.
- Multi-registry publishing.
- Repo-wide CI redesign beyond release path needs.

## Decision Gates (Must Be Explicit)

1. **Base release branch**: confirm `main` or an alternative.
2. **Publish surface**: confirm exactly which packages are expected to publish now.
3. **Pre-publish quality gates**: decide required commands (`build` only vs `build + test + lint`).
4. **CI release host**: confirm GitHub Actions workflow assumptions.

## Proposed Approach

### Phase 1: Inventory + Decision Capture (No Mutations)

Produce the following:

- `outputs/current-release-surface.md`
- `outputs/release-decisions.md`

Minimum required contents:

- Package inventory (`name`, `private`, `version`, publish intent).
- Decision Gate outcomes (branch, publish surface, quality gates, CI host).
- Explicit notes for deferred decisions.

### Phase 2: Bootstrap Changesets

- Add `@changesets/cli` as a root dev dependency.
- Run `changeset init`.
- Update `.changeset/config.json` with captured decisions.
- Keep `fixed` and `linked` empty unless lockstep versioning is intentionally selected.

### Phase 3: Turborepo-Aligned Scripts

Add root scripts for:

- `changeset`
- `changeset:status`
- `changeset:version`
- `release`

Release script rule:

- Use Turborepo for package work (`turbo run ...`) before `changeset publish`.
- Keep publish/version mutation as root-level workflow steps.

### Phase 4: CI Release Automation

- Add release workflow (expected path: `.github/workflows/release.yml`).
- Use Changesets release PR flow.
- Ensure required secrets/vars are documented (`NPM_TOKEN`, cache vars if used).

### Phase 5: Verification + Docs

- Validate local release flow commands.
- Validate CI creates/updates release PR correctly.
- Add maintainer release checklist and contributor quick steps.

## Entry Points

- Start execution: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- Full Phase 1 context: `handoffs/HANDOFF_P1.md`
- Ongoing learnings: `REFLECTION_LOG.md`

## Verification

Run from repo root:

```bash
# Inspect pending release state
bun run changeset:status

# Apply version updates from pending changesets
bun run changeset:version

# Build using turbo task graph
bun run build

# Publish path (requires registry auth)
bun run release
```

## Acceptance Criteria

- [x] Decision outputs exist and capture all four Decision Gates.
- [x] `.changeset/config.json` is present and reflects decisions.
- [x] Root scripts for changeset + release flow are present.
- [x] Release workflow is present and wired for PR + publish behavior.
- [x] Release documentation exists for contributors and maintainers.

## Open Questions (Resolved)

1. Is `main` confirmed as release branch?  
   Yes. `baseBranch` is `main`.
2. Should private tooling packages remain private for this initial rollout?  
   Yes. Private packages remain excluded in `.changeset/config.json` `ignore`.
3. Should release gating require tests/lint in addition to build for publish?  
   Yes. `release` enforces `build + test + lint` before publish.

## Related References

- `.repos/beep-effect/specs/README.md`
- `.repos/beep-effect/specs/SPEC_STATUS_POLICY.md`
- `.repos/beep-effect/specs/pending/knowledge-schema-standardization/README.md`
- `.repos/beep-effect/specs/pending/knowledge-nonfatal-effect-lint-cleanup/README.md`
