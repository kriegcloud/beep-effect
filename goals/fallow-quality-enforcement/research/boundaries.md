---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: boundaries
status: measured
updated: 2026-06-08
---

# Boundaries Research Report

## Summary

- Feature family: boundaries
- Fallow docs URLs: https://docs.fallow.tools/analysis/boundaries, https://docs.fallow.tools/configuration/boundaries
- Local commands: `bun run fallow:boundaries:check`, `bun run fallow -- dead-code --boundary-violations --config standards/fallow.boundaries.generated.jsonc --format json --quiet --summary`
- Current status: generated config freshness is green; direct boundary analysis reports advisory violations and must not block yet.

## Baseline

- Command: `bun run fallow -- dead-code --boundary-violations --config standards/fallow.boundaries.generated.jsonc --format json --quiet --summary`
- Config freshness command: `bun run fallow:boundaries:check`
- Config freshness exit status: 0
- Analyzer command: `bun run fallow -- dead-code --boundary-violations --config standards/fallow.boundaries.generated.jsonc --format json --quiet --summary`
- Analyzer exit status: 0
- Runtime: about 3s for analyzer, about 10s for repo helper.
- Counts: 89 generated zones and 89 generated rules; direct analyzer reports 26 boundary violations. `fallow list --boundaries` also shows zero-file zones for scaffold packages.
- Artifact path: `standards/fallow.boundaries.generated.jsonc`, `standards/fallow.boundaries.provenance.jsonc`

## Repo Fit

- Doctrine target refs: `standards/ARCHITECTURE.md#package-dependency-graph`, `standards/architecture/07-non-slice-families.md`
- Existing repo lane overlap: generated from package manifests and repo export catalog; does not replace architecture doctrine.
- Config surfaces: `standards/fallow.boundaries.generated.jsonc`, `standards/fallow.boundaries.provenance.jsonc`, package manifests.
- Generated metadata needed: architecture-derived hard-check metadata before enforcing role legality beyond declared dependency consistency.
- Important mismatch: `fallow:boundaries:check` proves generated policy is current; it does not prove the repo has zero boundary violations.

## False Positives And Suppressions

- False-positive status: doctrine-gap.
- Owner: `@beep-team`
- Evidence: direct boundary analyzer output, provenance sidecar.
- Suppression class: `transitional-compatibility`, `review-gate-only`
- Expiry or review date: required on every suppression record.
- Preferred fix path: keep manifest-derived dependency consistency separate from architecture-role legality; do not encode new doctrine in Fallow config.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow boundaries`
- Yeet category: `repo-law`
- Parser: `fallow/boundaries/v1`
- Default blocking: false
- CI mode: advisory artifact
- Failure envelope behavior: wrapper must distinguish config generation drift from Fallow boundary findings.

## Promotion Gate

- Required commands: `bun run fallow:boundaries:check`, `bun run fallow -- dead-code --boundary-violations --config standards/fallow.boundaries.generated.jsonc --format json --quiet --summary`
- Required evidence refs: `research/boundaries.md`
- Required reviewer roles: Architecture Boundary Reviewer
- Rollback notes: keep boundary-violation at warn and revert to advisory generated config.
