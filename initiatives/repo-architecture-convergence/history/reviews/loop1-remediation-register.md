# Loop 1 Remediation Register

This register tracks the loop-1 remediations landed inside `history/`. Broader
packet work outside this subtree still requires separate owners.

## Current Status

- Loop status: `History remediation landed; independent re-review required`
- Blocking scope: `history/` execution and evidence surfaces

## Findings Matrix

| Finding | Primary sources | History remediation | Evidence files | Status | Follow-up outside `history/` |
| --- | --- | --- | --- | --- | --- |
| The initiative lacked a canonical review surface and a required critique -> remediation -> re-review gate. | `loop1-canonical-pattern-and-ops.md` findings 5 and 7; `loop1-architecture-alignment.md` low finding 1 | Added a canonical review index, this remediation register, and an explicit re-review gate artifact. | [README.md](./README.md), [loop1-remediation-register.md](./loop1-remediation-register.md), [loop1-rereview-gate.md](./loop1-rereview-gate.md) | Implemented, pending re-review | Mirror the same loop in `ops/manifest.json`, handoffs, and non-history packet docs. |
| Phase outputs could be mistaken for completed work because the placeholders only described narrative objectives. | `loop1-phases-gates-and-process.md` low finding 1; grounded critique summary | Rewrote every phase output into an execution-record scaffold with explicit status, command-result, evidence, deviation, follow-up, and cutover sections. | `history/outputs/p0-repo-census-and-routing-canon.md` through `history/outputs/p7-export-cutover-and-architecture-verification.md` | Implemented, pending re-review | Non-history handoffs and manifest state still need matching evidence-oriented gates. |
| Quick-start and history guidance omitted Graphiti bootstrap/writeback, repo-law command gates, temporary-exception governance, and evidence capture. | `loop1-repo-law-and-enforcement.md` findings C2, H4, and L1; grounded critique summary | Added a history index, strengthened quick-start, and converted the reflection log to a structured lesson surface tied to evidence and Graphiti. | [../README.md](../README.md), [../quick-start.md](../quick-start.md), [../reflection-log.md](../reflection-log.md) | Implemented, pending re-review | Phase handoffs, prompts, and manifest schema still need the same rules outside `history/`. |
| Compatibility and amendment tracking needed history-facing evidence hooks. | `loop1-phases-gates-and-process.md` critical finding 2; `loop1-repo-law-and-enforcement.md` high finding 1 | Added compatibility and amendment ledgers and linked them from quick-start and the phase output scaffolds. | [../ledgers/compatibility-ledger.md](../ledgers/compatibility-ledger.md), [../ledgers/amendment-register.md](../ledgers/amendment-register.md) | Implemented, pending re-review | Real shim and amendment state must be populated by later execution phases and coordinated with repo-level governance files. |

## Exit Condition

Loop 1 history remediation closes only when
[loop1-rereview-gate.md](./loop1-rereview-gate.md) records a pass or an
explicit approved hold with owner and next review date.
