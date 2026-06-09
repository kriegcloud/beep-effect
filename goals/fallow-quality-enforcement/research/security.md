---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: security
status: measured
updated: 2026-06-08
---

# Security Research Report

## Summary

- Feature family: security
- Fallow docs URLs: https://docs.fallow.tools/cli/security
- Local commands: `bun run fallow -- security --config .fallowrc.jsonc --format json --quiet --summary`
- Current status: candidate surfacing only; existing security lanes remain authoritative.

## Baseline

- Command: `bun run fallow -- security --config .fallowrc.jsonc --format json --quiet --summary`
- Exit status: 0
- Runtime: about 2-3s
- Counts: 23 security candidates, 0 unresolved edge files, 26,844 unresolved callee sites.
- Artifact path: P1 wrapper writes `.beep/fallow/security.json`; current baseline lives in this report.

## Repo Fit

- Doctrine target refs: `standards/effect-laws-v1.md#scope`
- Existing repo lane overlap: complements security audit output but does not prove vulnerabilities.
- Config surfaces: `.fallowrc.jsonc`, `.github/workflows/check.yml`
- Generated metadata needed: candidate triage inventory before mapping any finding to blocking security-audit.
- Important caveat: Fallow docs call these findings candidates; a clean finding list with unresolved counts is not a clean bill.

## False Positives And Suppressions

- False-positive status: unknown.
- Owner: `@beep-team`
- Evidence: live security report.
- Suppression class: `verified-false-positive`, `covered-by-existing-security-lane`
- Expiry or review date: required on every security suppression.
- Preferred fix path: verify reachability and existing security coverage before creating a suppression.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow security`
- Yeet category: `security-audit`
- Parser: `fallow/security/v1`
- Default blocking: false
- CI mode: advisory artifact; hosted CI uploads the envelope as nonblocking evidence.
- Failure envelope behavior: wrapper must preserve `unresolved_edge_files` and `unresolved_callee_sites` as triage metadata.

## Promotion Gate

- Required commands: `bun run fallow -- security --config .fallowrc.jsonc --format json --quiet --summary`
- Required evidence refs: `research/security.md`
- Required reviewer roles: Quality Gate Reviewer
- Rollback notes: keep existing security lanes as authority and remove Fallow security advisory output.
