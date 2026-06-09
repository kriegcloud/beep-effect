---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: runtime-coverage
status: researched
updated: 2026-06-08
---

# Runtime Coverage Research Report

## Summary

- Feature family: runtime-coverage
- Fallow docs URLs: https://docs.fallow.tools/cli/coverage, https://docs.fallow.tools/analysis/runtime-coverage, https://docs.fallow.tools/explanations/static-vs-runtime
- Local commands: `bun run fallow -- coverage --help`
- Current status: research-only and deferred from repo quality enforcement.

## Baseline

- Command: `bun run fallow -- coverage --help`
- Exit status: 0 in help probing.
- Runtime: subsecond help probe.
- Counts: no local runtime coverage baseline collected.
- Artifact path: none planned for P0.

## Repo Fit

- Doctrine target refs: `standards/architecture/README.md#known-unknowns`
- Existing repo lane overlap: could later enrich health with hot/cold runtime evidence, but static quality gates remain the current path.
- Config surfaces: runtime coverage collection docs, future coverage artifacts, possible Fallow license/API key configuration.
- Generated metadata needed: privacy, source-map, app-runtime, and 1Password/secret-handling contract before collection.
- Important caveat: coverage setup may require paid/trial licensing and runtime instrumentation, so it is out of scope for blocking CI.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: official docs and help probe.
- Suppression class: `license-deferred`, `privacy-deferred`
- Expiry or review date: required on any future runtime deferral record.
- Preferred fix path: write a separate runtime coverage adoption packet if the repo wants this lane.

## Yeet And CI

- `beep quality fallow` command: none in P1; target remains research-only.
- Yeet category: `repo-law` only if a later packet explicitly adopts it.
- Parser: `fallow/runtime-coverage/v1`
- Default blocking: false
- CI mode: none.
- Failure envelope behavior: no P1 wrapper planned.

## Promotion Gate

- Required commands: `bun run fallow -- coverage --help`
- Required evidence refs: `research/runtime-coverage.md`
- Required reviewer roles: Quality Gate Reviewer
- Rollback notes: runtime coverage remains out of implementation scope.
