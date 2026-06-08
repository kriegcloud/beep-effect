---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: fix-preview
status: measured
updated: 2026-06-08
---

# Fix Preview Research Report

## Summary

- Feature family: fix-preview
- Fallow docs URLs: https://docs.fallow.tools/cli/fix
- Local commands: `bun run fallow -- fix --dry-run --format json --no-create-config`
- Current status: dry-run preview only; no hidden Yeet repair mutation.

## Baseline

- Command: `bun run fallow -- fix --dry-run --format json --no-create-config`
- Exit status: 0
- Runtime: about 3s
- Counts: dry-run output reported 42 proposed fix entries, 0 applied fixes, 0 skipped content-changed files, 0 low-confidence export skips, and 0 mixed-line-ending skips.
- Artifact path: P1 wrapper writes `.beep/fallow/fix-preview.json`; current baseline lives in this report.

## Repo Fit

- Doctrine target refs: `standards/effect-laws-v1.md#rollout`
- Existing repo lane overlap: useful for agent cleanup planning, but Yeet repair must stay explicit and reviewable.
- Config surfaces: `.fallowrc.jsonc`
- Generated metadata needed: none for dry-run preview.
- Important caveat: non-dry-run `fallow fix` can edit source files, package manifests, catalog entries, and config; this goal forbids hidden mutation.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: live dry-run output.
- Suppression class: `unsafe-fix-preview`
- Expiry or review date: required if a preview is ignored because it is unsafe.
- Preferred fix path: use preview as a report only; humans or explicit agent edits perform the actual changes.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow fix-preview`
- Yeet category: `repo-law`
- Parser: `fallow/fix-preview/v1`
- Default blocking: false
- CI mode: advisory artifact; P2 CI hardening is still blocked until `fqe-005` uploads the dry-run envelope as nonblocking evidence.
- Failure envelope behavior: wrapper must never run non-dry-run fix and must include the exact dry-run command in the envelope.

## Promotion Gate

- Required commands: `bun run fallow -- fix --dry-run --format json --no-create-config`
- Required evidence refs: `research/fix-preview.md`
- Required reviewer roles: Quality Gate Reviewer
- Rollback notes: remove fix-preview from Yeet packets; never run non-dry-run fix.
