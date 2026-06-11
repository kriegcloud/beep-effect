# Codex Security Findings (2026-06)

Durable launcher for scan `5138685acf488191ad6a5ee51a84452d`.

This tracked file is intentionally small. It identifies the packet and points
future operators to the current contract without duplicating mutable workflow
instructions in multiple places.

## Packet

- Repo branch: `@slop/june-8-2026`
- Status: see [`README.md`](./README.md)
- Normative contract: [`SPEC.md`](./SPEC.md)
- Active plan: [`PLAN.md`](./PLAN.md)
- Machine ledgers: [`ops/manifest.json`](./ops/manifest.json),
  [`ops/triage.json`](./ops/triage.json)
- Finding index: [`findings/INDEX.md`](./findings/INDEX.md)

## Objective

Triage, remediate by default, and close all 52 findings from the scan in one
mergeable PR. Tracked evidence must stay sanitized; raw captures stay outside
the repository.

## Guardrails

`AGENTS.md`, `CLAUDE.md`, repo standards, and `SPEC.md` outrank this launcher.
Use `PLAN.md` for phase state and stop conditions.

## Minimal Verification

```sh
test "$(wc -m < goals/codex-security-findings-2026-06/GOAL.md)" -le 4000
jq . goals/codex-security-findings-2026-06/ops/manifest.json
jq . goals/codex-security-findings-2026-06/ops/triage.json
git diff --check -- goals/codex-security-findings-2026-06
```
