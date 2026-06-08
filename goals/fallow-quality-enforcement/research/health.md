---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: health
status: measured
updated: 2026-06-08
---

# Health Research Report

## Summary

- Feature family: health
- Fallow docs URLs: https://docs.fallow.tools/cli/health, https://docs.fallow.tools/explanations/health
- Local commands: `bun run fallow:health -- --format json --quiet --report-only --top 50`
- Current status: advisory report-only; thresholds need Effect-aware calibration.

## Baseline

- Command: `bun run fallow:health -- --format json --quiet --report-only --top 50`
- Exit status: 0
- Runtime: about 15-21s
- Counts: score 73.3, grade B, 1,859 files analyzed, 26,627 functions analyzed, 199 functions above threshold, 36 critical, 50 high, 113 moderate, average maintainability 92.2.
- Artifact path: future P1 wrapper writes `.beep/fallow/health.json`; current baseline lives in this report and `standards/fallow.pilot.inventory.jsonc`.

## Repo Fit

- Doctrine target refs: `standards/architecture/05-layer-composition.md`, `standards/architecture/10-cross-slice-coordination.md`
- Existing repo lane overlap: complements Effect laws and reviewer focus on complex orchestration.
- Config surfaces: `.fallowrc.jsonc`
- Generated metadata needed: none, but threshold policy must distinguish complex generated/schema-heavy code from risky application logic.
- Important mismatch: `--top 50` still emits sizable nested coverage-gap payloads, so P1 envelopes should store raw output by path.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: live health report.
- Suppression class: `tool-threshold`, `legacy-hotspot`
- Expiry or review date: required on every threshold waiver.
- Preferred fix path: reduce newly introduced complexity first; inherited hotspots become cleanup-on-touch when the owning boundary changes.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow health`
- Yeet category: `repo-law`
- Parser: `fallow/health/v1`
- Default blocking: false
- CI mode: advisory artifact
- Failure envelope behavior: wrapper must preserve health output even when future threshold flags fail.

## Promotion Gate

- Required commands: `bun run fallow:health -- --format json --quiet --report-only --top 50`
- Required evidence refs: `research/health.md`
- Required reviewer roles: Effect Law Reviewer
- Rollback notes: keep health out of Yeet packets until thresholds are calibrated.
