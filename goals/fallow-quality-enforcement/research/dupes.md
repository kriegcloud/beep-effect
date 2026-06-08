---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: dupes
status: measured
updated: 2026-06-08
---

# Dupes Research Report

## Summary

- Feature family: dupes
- Fallow docs URLs: https://docs.fallow.tools/cli/dupes, https://docs.fallow.tools/explanations/duplication
- Local commands: `bun run fallow:dupes -- --format json --quiet --top 50`
- Current status: advisory only; useful for agent refactor pressure but not ready for thresholds.

## Baseline

- Command: `bun run fallow:dupes -- --format json --quiet --top 50`
- Exit status: 0
- Runtime: about 12-20s
- Counts: top-bounded JSON report with 50 clone groups, 19 clone families, 536 clone instances, 5.07 percent duplication, 341 files with clones.
- Artifact path: future P1 wrapper writes `.beep/fallow/dupes.json`; current baseline lives in this report and `standards/fallow.pilot.inventory.jsonc`.

## Repo Fit

- Doctrine target refs: `standards/ARCHITECTURE.md#enforcement-and-migration-posture`
- Existing repo lane overlap: complements repo export catalog and reuse standards; Knip does not provide structural duplication detection.
- Config surfaces: `.fallowrc.jsonc`, future `standards/clone.inventory.jsonc`
- Generated metadata needed: accepted-duplication inventory before blocking thresholds.
- Important mismatch: `--top 50` limits surfaced clone groups but JSON remains large because clone fragments are included.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: live dupes report, future clone inventory.
- Suppression class: `accepted-duplication`, `generated-code`
- Expiry or review date: required on every accepted duplication record.
- Preferred fix path: reuse existing exports/helpers first, then extract local abstractions only when duplication reflects real shared behavior.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow dupes`
- Yeet category: `repo-law`
- Parser: `fallow/dupes/v1`
- Default blocking: false
- CI mode: advisory artifact
- Failure envelope behavior: wrapper must capture large reports by path and include raw report refs in Yeet issues.

## Promotion Gate

- Required commands: `bun run fallow:dupes -- --format json --quiet --top 50`
- Required evidence refs: `research/dupes.md`
- Required reviewer roles: Reuse And Duplication Reviewer
- Rollback notes: leave Fallow dupes advisory-only and keep clone inventory as policy authority.
