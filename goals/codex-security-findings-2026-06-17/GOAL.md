# Codex Security Findings (2026-06-17)

Durable launcher for scan `f4128216e9c08191b0431ea2a05322bb`.

This tracked file is intentionally small. It identifies the packet and points
future operators to the current contract without duplicating mutable workflow
instructions in multiple places.

## Packet

- Repo branch: `security/6-17-2026`
- Status: see [`README.md`](./README.md)
- Normative contract: [`SPEC.md`](./SPEC.md)
- Active plan: [`PLAN.md`](./PLAN.md)
- Machine ledgers: [`ops/manifest.json`](./ops/manifest.json),
  [`ops/triage.json`](./ops/triage.json)
- Finding index: [`findings/INDEX.md`](./findings/INDEX.md)

## Objective

Triage, remediate by default, and close all 71 findings from the scan in one
mergeable PR. Tracked evidence must stay sanitized; raw captures and the cookie
file stay outside the repository.

## Guardrails

`AGENTS.md`, `CLAUDE.md`, repo standards, and `SPEC.md` outrank this launcher.
Use `PLAN.md` for phase state and stop conditions. Two hard gates: GATE 1 after
triage, GATE 2 before merge.

## Public Artifact Boundary

This tracked packet is not package source, repo-export input, docgen input, or
JSDoc inventory input. Details that would widen the attack window stay in the
private raw capture until their fixes land with verification.

## Minimal Verification

```sh
test "$(wc -m < goals/codex-security-findings-2026-06-17/GOAL.md)" -le 4000
jq . goals/codex-security-findings-2026-06-17/ops/manifest.json
jq . goals/codex-security-findings-2026-06-17/ops/triage.json
git diff --check -- goals/codex-security-findings-2026-06-17
```
