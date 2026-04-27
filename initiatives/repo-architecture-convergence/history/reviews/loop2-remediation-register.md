# Loop 2 Remediation Register

This register tracks the loop-2 remediations landed inside `history/`. Broader
packet alignment still requires separate owners outside this subtree.

## Current Status

- Loop status: `History remediation landed; independent re-review required`
- Blocking scope: `history/` review, ledger, and companion-artifact surfaces
- Severity contract:
  `Critical` and `High` findings block closure; `Medium` and `Low` do not block
  unless explicitly held as blockers in this register or the re-review gate

## Findings Matrix

| Severity | Finding | Primary sources | History remediation | Evidence files | Status | Follow-up outside `history/` |
| --- | --- | --- | --- | --- | --- | --- |
| Critical | The live compatibility and amendment ledgers needed one authoritative history location. | `loop2-phases-gates-and-evidence.md` finding 4; `loop2-architecture-and-repo-law.md` finding C2 | Declared `history/ledgers/` the authoritative live ledger location for history work and reinforced that status from the history entrypoints and ledger files themselves. | [../README.md](../README.md), [../quick-start.md](../quick-start.md), [../ledgers/README.md](../ledgers/README.md), [../ledgers/compatibility-ledger.md](../ledgers/compatibility-ledger.md), [../ledgers/amendment-register.md](../ledgers/amendment-register.md) | Implemented, pending re-review | Align `SPEC.md`, `design/`, `ops/manifest.json`, and handoff references to the same canonical paths. |
| High | The history review surface needed one canonical namespace and active-loop references. | `loop2-canonical-ops-and-prompts.md` finding H3 | Standardized `history/reviews/` on the `loopN-*` namespace, added the active loop-2 register and re-review gate, and updated history outputs to reference the active loop register and gate. | [README.md](./README.md), [loop2-remediation-register.md](./loop2-remediation-register.md), [loop2-rereview-gate.md](./loop2-rereview-gate.md), [../outputs/p0-repo-census-and-routing-canon.md](../outputs/p0-repo-census-and-routing-canon.md), [../outputs/p1-family-groundwork-and-metadata.md](../outputs/p1-family-groundwork-and-metadata.md), [../outputs/p2-shared-kernel-contraction.md](../outputs/p2-shared-kernel-contraction.md), [../outputs/p3-repo-memory-slice-migration.md](../outputs/p3-repo-memory-slice-migration.md), [../outputs/p4-editor-slice-migration.md](../outputs/p4-editor-slice-migration.md), [../outputs/p5-operational-workspace-cutover.md](../outputs/p5-operational-workspace-cutover.md), [../outputs/p6-agent-runtime-adapter-cutover.md](../outputs/p6-agent-runtime-adapter-cutover.md), [../outputs/p7-export-cutover-and-architecture-verification.md](../outputs/p7-export-cutover-and-architecture-verification.md) | Implemented, pending re-review | Align the `ops/` review artifact model and manifest references with the loop-scoped history contract. |
| High | The blocker severity taxonomy needed one vocabulary across the history review loop. | `loop2-phases-gates-and-evidence.md` finding 6 | Declared the canonical severity vocabulary in the review index, normalized the loop-2 routing review headings, and encoded the same blocker rule in the loop-2 gate surfaces. | [README.md](./README.md), [loop2-repo-reality-and-routing.md](./loop2-repo-reality-and-routing.md), [loop2-remediation-register.md](./loop2-remediation-register.md), [loop2-rereview-gate.md](./loop2-rereview-gate.md) | Implemented, pending re-review | Align the same severity taxonomy in `ops/prompt-assets/`, `ops/prompts/agent-prompts.md`, and manifest `openFindings` data. |
| Critical | P0 needed an explicit companion artifact for the consumer and importer census. | `loop2-canonical-ops-and-prompts.md` finding C2; `loop1-phases-gates-and-process.md` finding F-H4 | Added a concrete P0 census placeholder and wired the primary P0 output to treat it as a required companion artifact. | [../outputs/p0-repo-census-and-routing-canon.md](../outputs/p0-repo-census-and-routing-canon.md), [../outputs/p0-consumer-importer-census.md](../outputs/p0-consumer-importer-census.md) | Implemented, pending re-review | Index the P0 census in `ops/manifest.json`, handoffs, and prompt assets so the wider control plane treats it as mandatory. |
| High | P7 needed explicit architecture and repo-law compliance matrix artifacts. | `loop2-phases-gates-and-evidence.md` finding 5; `loop2-canonical-ops-and-prompts.md` finding C2 | Added both P7 matrix placeholders and wired the primary P7 output to treat them as required companion artifacts. | [../outputs/p7-export-cutover-and-architecture-verification.md](../outputs/p7-export-cutover-and-architecture-verification.md), [../outputs/p7-architecture-compliance-matrix.md](../outputs/p7-architecture-compliance-matrix.md), [../outputs/p7-repo-law-compliance-matrix.md](../outputs/p7-repo-law-compliance-matrix.md) | Implemented, pending re-review | Index both matrices in `ops/manifest.json`, the P7 handoff, and prompt assets so final closure cannot bypass them. |

## Exit Condition

Loop 2 history remediation closes only when
[loop2-rereview-gate.md](./loop2-rereview-gate.md) records a pass or an
explicit approved hold with owner and next review date.
