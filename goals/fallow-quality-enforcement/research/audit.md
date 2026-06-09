---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: audit
status: measured
updated: 2026-06-08
---

# Audit Research Report

## Summary

- Feature family: audit
- Fallow docs URLs: https://docs.fallow.tools/cli/audit
- Local commands: `bun run fallow:audit -- --base origin/main --gate new-only`
- Current status: advisory artifact only; do not promote while introduced findings remain.

## Baseline

- Command: `bun run fallow:audit -- --base origin/main --gate new-only`
- Exit status: 1
- Runtime: about 14s
- Counts: at least 90 changed files in the current dirty worktree, verdict `fail`, 30 changed-scope dead-code issues, 37 raw complexity findings, 143 duplication clone groups.
- Attribution: 3 introduced dead-code issues, 6 introduced complexity findings, 3 introduced duplication clone groups; 37 raw complexity findings = 6 introduced + 30 inherited + 1 unattributed.
- Artifact path: P1 wrapper writes `.beep/fallow/audit.json`; current evidence is live wrapper output plus `standards/fallow.pilot.inventory.jsonc`.
- Volatility note: `changed_files_count` moves as this packet adds files, so `validate-fallow-audit-baseline.ts` asserts a minimum changed-file snapshot while checking finding and attribution counts exactly.

## Repo Fit

- Doctrine target refs: `standards/ARCHITECTURE.md#enforcement-and-migration-posture`
- Existing repo lane overlap: CI now runs repo-cli Fallow envelopes and uploads the advisory artifact tree.
- Config surfaces: `.fallowrc.jsonc`, `standards/fallow.dead-code.regression-baseline.jsonc`, `.github/workflows/check.yml`
- Generated metadata needed: none for audit itself; it consumes sub-analysis policy.
- Important mismatch: raw `fallow audit` still exits nonzero for findings, while `beep quality fallow audit --advisory` exits zero and preserves the raw status in the envelope.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: audit JSON attribution, `standards/fallow.pilot.inventory.jsonc`
- Suppression class: `false-positive`, `transitional-compatibility`, `generated-code`
- Expiry or review date: required on every suppression record.
- Preferred fix path: fix introduced issues first; review inherited-adjacent findings only when cleanup-on-touch triggers are touched.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow audit`
- Yeet category: `repo-law`
- Parser: `fallow/audit/v1`
- Default blocking: false
- CI mode: advisory artifact
- Failure envelope behavior: wrapper must write `tool-failed`, `invalid-json`, `invalid-report`, or `base-resolution-failed` envelopes instead of letting raw Fallow failure disappear.

## Promotion Gate

- Required acceptance command: `bun goals/fallow-quality-enforcement/ops/validate-fallow-audit-baseline.ts`
- Baseline measurement command: `bun run fallow:audit -- --base origin/main --gate new-only`
- Required evidence refs: `research/audit.md`
- Required reviewer roles: Quality Gate Reviewer, Architecture Boundary Reviewer
- Rollback notes: disable advisory packet parsing and keep uploaded artifact only.
