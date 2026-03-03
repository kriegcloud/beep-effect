# P2 Conflict Register

## Objective

Track conceptual or factual conflicts discovered during synthesis, including ownership, status, disposition, and closure evidence required for gate decisions.

## Status Legend

- `open`: unresolved and blocking if severity is `high`.
- `resolved`: closed in this phase with explicit closure evidence.
- `deferred`: non-blocker conflict intentionally carried with owner and downstream target.

## Blocker Rule

Any `high` severity conflict left in `open` status is blocker-level and prevents P2 exit.

## Conflict Entries

| Conflict ID | Area | Description | Severity | Owner | Status | Disposition | Linked Facts | Resolution Path | Closure Evidence | Downstream Carry |
|---|---|---|---|---|---|---|---|---|---|---|
| C-001 | Taxonomy | Prior mismatch between constrained canonical classification and broader exploratory taxonomy sets. | high | Domain Model Lead | resolved | Closed in P2 by adopting a normative 5-axis taxonomy and deterministic mapping rules. | F-006, F-010, F-011 | Normalize all source taxonomies to canonical axes with primary/secondary precedence. | `outputs/p2/taxonomy-crosswalk.md` sections `Canonical Axes (Normative)` + `Deterministic Crosswalk` + `C-001 Closure Record`. | none |
| C-002 | Script reliability | Path mismatch risk in `repo-codegraph-jsdoc` `validate-jsdoc-exhaustiveness.mjs` local imports versus `outputs/jsdoc-exhaustiveness-audit/*` artifact location. | medium | Strategy Lead | deferred | Accepted as non-blocker for P2; tracked for governance/evidence follow-through. | F-014 | Carry as known reliability risk with explicit owner and downstream obligations. | This register entry plus P1 evidence linkage. | D11 risk register owner/action/deadline; D12 evidence note with risk disposition. |
| C-003 | Terminology | Overlap between `corpus`, `knowledge base`, and `reference base` naming across source narratives. | medium | Domain Model Lead | resolved | Closed in P2 by locking Tier-1 canonical term definitions and collision matrix rules. | F-010, F-015 | Enforce canonical `corpus` language with synonym restrictions and D03 reproduction requirement. | `outputs/p2/term-model.md` sections `Tier-1 Canonical Terms` + `Collision Resolution Matrix`. | none |

## P2 Exit Assertions

| Assertion | Result | Evidence |
|---|---|---|
| No blocker-level concept conflict remains unresolved. | pass | C-001 is `resolved`; no `high/open` row exists. |
| Tier-1 term collisions are resolved or explicitly logged. | pass | C-003 resolved via `term-model.md`; status documented above. |
| `repo-codegraph-jsdoc` path-mismatch risk is resolved or explicitly carried with owner/disposition. | pass | C-002 is `deferred` with owner, linked fact, and D11/D12 carry path. |

## Exit Rule

P2 is exit-ready only when every assertion above remains `pass`.
