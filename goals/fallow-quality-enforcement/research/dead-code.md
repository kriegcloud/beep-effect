---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: dead-code
status: measured
updated: 2026-06-08
---

# Dead Code Research Report

## Summary

- Feature family: dead-code
- Fallow docs URLs: https://docs.fallow.tools/cli/dead-code, https://docs.fallow.tools/migration/from-knip
- Local commands: `bun run fallow:dead-code:json -- --summary`, `bun run knip --reporter json`, `bun run fallow:migrate:dry-run -- --from knip.jsonc`
- Current status: advisory and parity-research only; Knip remains the reference analyzer.

## Baseline

- Command: `bun run fallow:dead-code:json -- --summary`
- Fallow exit status: 1
- Fallow runtime: about 1-3s warm, depending on cache.
- Fallow counts: 63 total issues: 6 unused files, 25 unused exports, 4 unused types, 21 unused dependencies, 7 unlisted dependencies, 0 unresolved imports, 0 duplicate exports, 0 circular dependencies, 0 boundary violations.
- Knip comparison command: `bun run knip --reporter json`
- Knip exit status: 1
- Knip runtime: about 45-61s
- Knip counts: 31 issue containers with nested totals of 9 files, 13 exports, 4 dependencies, 4 devDependencies, 1 unlisted dependency, and 9 unresolved references.
- Fallow migration dry-run: exit 0, with warnings for `rules.catalog`, `ignoreBinaries`, `ignoreWorkspaces`, and `workspaces`.
- Fallow workspace inventory: `bun run fallow -- list --workspaces --config .fallowrc.jsonc --format json --quiet` reports 89 workspaces, including scaffold workspaces that Knip `ignoreWorkspaces` is meant to suppress.
- Fallow plugin inventory: `bun run fallow -- list --plugins --config .fallowrc.jsonc --format json --quiet` reports 20 active plugins.
- Artifact path: `standards/fallow.dead-code.regression-baseline.jsonc`

## Repo Fit

- Doctrine target refs: `standards/effect-laws-v1.md#rollout`
- Existing repo lane overlap: Knip is tuned through `knip.jsonc`; Fallow should add structured agent feedback without replacing Knip.
- Config surfaces: `.fallowrc.jsonc`, `knip.jsonc`, `standards/fallow.dead-code.regression-baseline.jsonc`
- Generated metadata needed: none for the static dead-code scan.
- Parity caveat: `fallow migrate --dry-run --from knip.jsonc` warns that `ignoreBinaries`, `ignoreWorkspaces`, `workspaces`, and `rules.catalog` are not safely migrated.

## False Positives And Suppressions

- False-positive status: config-gap.
- Owner: `@beep-team`
- Evidence: `research/knip-parity.jsonc`, live Knip/Fallow side-by-side counts.
- Suppression class: `intentional-public-api`, `transitional-compatibility`, `generated-code`
- Expiry or review date: required on every suppression record.
- Preferred fix path: prefer package manifest/export-map corrections, then config tuning, then explicit suppression inventory.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow dead-code`
- Yeet category: `repo-law`
- Parser: `fallow/dead-code/v1`
- Default blocking: false
- CI mode: advisory artifact
- Failure envelope behavior: P1 wrapper must preserve Fallow exit status while `--advisory` exits 0.

## Promotion Gate

- Required acceptance command: `bun goals/fallow-quality-enforcement/ops/validate-knip-parity-baselines.ts`
- Baseline measurement commands: `bun run knip --reporter json`, `bun run fallow:dead-code:json -- --summary`
- Required evidence refs: `research/dead-code.md`, `research/knip-parity.jsonc`
- Required reviewer roles: Quality Gate Reviewer, Reuse And Duplication Reviewer
- Rollback notes: remove Fallow dead-code from advisory packets and keep Knip unchanged.
