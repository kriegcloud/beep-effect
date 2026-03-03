# P2 Conflict Register

## Objective

Track conceptual or factual conflicts discovered during synthesis.

## Status Legend

- `open`: unresolved and blocking if Tier-1.
- `resolved`: resolved with documented rationale.
- `deferred`: accepted for roadmap treatment in D11.

## Conflict Entries

| Conflict ID | Area | Description | Severity | Owner | Status | Resolution Path |
|---|---|---|---|---|---|---|
| C-001 | Taxonomy | 8-category canonical classification vs broader exploratory taxonomy sets | high | Domain Model Lead | open | Crosswalk + scoped canonical axes for D08 |
| C-002 | Script reliability | Path mismatch in jsdoc exhaustiveness validation script import paths | medium | Strategy Lead | deferred | Track in D11 risk register and D12 evidence notes |
| C-003 | Terminology | Overlap between "corpus", "knowledge base", and "reference base" terms | medium | Domain Model Lead | open | Lock Tier-1 definitions in term model and D03 |

## Exit Rule

No `high` severity conflict can remain `open` at P2 exit.
