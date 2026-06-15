# Fallow Debt Burn-Down Plan

## Status

Status: `active`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Packet Authoring | done | Create this packet, validator, and current evidence snapshot. | Packet validator and parent validator pass. |
| P1 Boundary Burn-Down | selected | Remove direct internal imports surfaced by Fallow boundary analysis. | Boundary analyzer count drops for remediated imports without encoding new doctrine in Fallow config. |
| P2 Health Burn-Down | seeded | Refactor first critical/high hotspots into smaller named functions. | Selected functions no longer appear as critical/high, with tests or package checks covering touched code. |
| P3 Security Triage | seeded | Classify and fix Fallow security candidates against existing security lanes. | Confirmed risks are fixed; covered false positives have inventory evidence and expiry. |
| P4 Duplication Cleanup | retired | Keep duplication cleanup out of this packet after removing the repo-owned duplication lane. | No custom duplication command is part of verification. |
| P5 Ratchet Wiring | seeded | Wire only new/regressed debt checks after each class has a baseline or inventory. | Repo quality gates reject new debt without failing all inherited advisory findings. |

## Execution Notes

- Keep this packet independent of `goals/fallow-advisory-ratchets` until that PR
  lands; the parent quality-enforcement packet is the canonical source already
  on `main`.
- Favor fixes over `fallow-ignore` comments. Suppression is a last resort and
  must be inventory-backed with an owner and expiry.
- Boundary work starts with direct package-internal imports, not role-legality
  doctrine.
- Health work starts with critical/high functions that are not generated code.
- Security work starts with triage because Fallow reports candidates, not
  proven vulnerabilities.
- Duplication cleanup is not part of this packet after the custom lane removal.
- Quality wiring is a follow-on phase; no raw all-Fallow-finding gate belongs
  in the first remediation pass.

## Verification Commands

```sh
test "$(wc -m < goals/fallow-debt-burndown/GOAL.md)" -le 4000
bun goals/fallow-debt-burndown/ops/validate-packet.ts
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
bun run beep quality fallow command-contract-check --assert audit,dead-code,health,boundaries,flags,security,fix-preview --require-envelope --out-dir .beep/fallow
bun run beep quality fallow boundaries --advisory --base origin/main --out .beep/fallow/boundaries.json --quiet
bun run beep quality fallow health --advisory --base origin/main --out .beep/fallow/health.json --quiet
bun run beep quality fallow security --advisory --base origin/main --out .beep/fallow/security.json --quiet
bun run beep quality github-checks plan-contract-check --mode pre-push --feature-matrix goals/fallow-quality-enforcement/research/feature-matrix.jsonc --expect-promoted-fallow-lanes
git diff --check -- goals/fallow-debt-burndown
```
