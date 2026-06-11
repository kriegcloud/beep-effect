# Codex Security Findings (2026-06)

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

Supersedes the deleted `goals/codex-security-findings/` packet only in spirit —
that packet covered a different scan (`3ccb…`, 64 findings, merged via PRs
#164/#169). This packet is a new batch: scan `5138…`, 52 findings.

## Mission

Triage, remediate-by-default, and close all 52 Codex Cloud security findings from
scan `5138685acf488191ad6a5ee51a84452d` (3 High / 15 Medium / 18 Low / 16
Informational) in a single, mergeable PR on `@slop/june-8-2026`.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/codex-security-findings-2026-06/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`ops/triage.json`](./ops/triage.json) - per-finding run-state ledger.
6. [`findings/INDEX.md`](./findings/INDEX.md) - finding catalog index.

## Current Phase

`P1 extract` - capture Report + Patch for all 52 findings via the authenticated
Codex tab. Next action: lock the 52-id manifest, then capture each finding.

## Latest Evidence

`Not started` - packet bootstrapped 2026-06-08; extraction pending.

## Notes

- One human approval gate after triage (disposition matrix). Do not start
  closures or remediation before approval.
- Raw captures stay untracked in `/tmp/codex-security-findings-2026-06`; commit
  only sanitized markdown + patches.
- The PR on `@slop/june-8-2026` will also carry that branch's pre-existing
  effect-v4/yeet commits; the security work is additive on top.
