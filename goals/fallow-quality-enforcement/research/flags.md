---
schemaVersion: fallow-quality-enforcement/research-report/v1
featureFamily: flags
status: measured
updated: 2026-06-08
---

# Flags Research Report

## Summary

- Feature family: flags
- Fallow docs URLs: https://docs.fallow.tools/cli/flags
- Local commands: `bun run fallow -- flags --config .fallowrc.jsonc --format json --quiet --summary --top 50`
- Current status: measured quiet baseline; no enforcement until a repo feature-flag lifecycle policy exists.

## Baseline

- Command: `bun run fallow -- flags --config .fallowrc.jsonc --format json --quiet --summary --top 50`
- Exit status: 0
- Runtime: about 3s
- Counts: 0 detected flags in the current configured scan.
- Artifact path: P1 wrapper writes `.beep/fallow/flags.json`; current baseline lives in this report.

## Repo Fit

- Doctrine target refs: `standards/architecture/11-evolution-and-deprecation.md`
- Existing repo lane overlap: supports cleanup of long-lived rollout gates but does not replace a flag registry.
- Config surfaces: `.fallowrc.jsonc`, `standards/architecture/11-evolution-and-deprecation.md`
- Generated metadata needed: feature-flag registry or expiry inventory before blocking.
- Important caveat: static detection cannot tell whether an env gate is a real temporary feature flag or permanent runtime configuration.

## False Positives And Suppressions

- False-positive status: doctrine-gap.
- Owner: `@beep-team`
- Evidence: live flags report.
- Suppression class: `active-rollout`, `migration-flag`
- Expiry or review date: required on every flag suppression.
- Preferred fix path: add or reuse a repo-owned flag lifecycle record before any blocking check.

## Yeet And CI

- `beep quality fallow` command: `beep quality fallow flags`
- Yeet category: `repo-law`
- Parser: `fallow/flags/v1`
- Default blocking: false
- CI mode: advisory artifact; P2 uploads the envelope as nonblocking evidence, with promotion blocked until registry policy exists.
- Failure envelope behavior: P1 wrapper may emit advisory envelopes, but no flags finding may become blocking until policy exists.

## Promotion Gate

- Required commands: `bun run fallow -- flags --config .fallowrc.jsonc --format json --quiet --summary --top 50`
- Required evidence refs: `research/flags.md`
- Required reviewer roles: Evolution And Deprecation Reviewer
- Rollback notes: keep flags advisory-only in CI and Yeet until registry policy exists.
