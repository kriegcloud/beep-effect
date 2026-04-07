# P0: Planning And Document Classification

## Status

**BOOTSTRAPPED**

## Objective

Lock the cleanup contract before destructive work begins.

## Planning Artifacts

- `outputs/grill-log.md`
- `outputs/cleanup-checklist.md`
- `outputs/codex-plan-mode-prompt.md`
- `outputs/manifest.json`

## Seeded Decisions

- Use a dedicated pending spec package for durable artifacts.
- Treat `grill-me` as mandatory during planning.
- Log grilling questions, recommendations, answers, and evidence-backed resolutions.
- Preserve historical/security/research documents by default.
- Treat managed repo commands as part of cleanup completeness.
- Use a canonical phased spec with one Codex session per phase.

## Document Classification Policy

| Class | Default Action | Examples |
|---|---|---|
| Active surface | Clean or remove stale references | current configs, live prompts, current READMEs, generated docs, active standards inventories, CI or test config |
| Historical evidence | Preserve by default | completed specs, security reports, archived research, retrospective notes |
| Ambiguous | Escalate and log | documents with both historical evidence and live navigation roles |

## Required Output of the Next P0 Session

- scope and assumptions
- unresolved blockers
- explicit verification contract
- explicit command matrix
- explicit phase-status and manifest-update rules
- explicit phase order and approval policy
- explicit commit cadence
- document-classification matrix for targeted workspace references

## Execution Rules To Confirm

| Rule | Default |
|---|---|
| Commit cadence | one commit per completed implementation phase in P1-P3 and one commit per approved candidate in P4 |
| Push policy | no push without explicit user confirmation |
| Manifest updates | required whenever phase status changes or active phase advances |
| Out-of-phase discoveries | log to checklist or later phase output instead of deleting opportunistically |

## Verification Command Matrix To Confirm

| Command | Expected Trigger |
|---|---|
| `bun run config-sync` | workspace graph, TS refs, aliases, or managed docgen config changes |
| `bun run version-sync --skip-network` | workspace deletion or dependency graph drift |
| `bun run docgen` | workspace docs or docgen config changes |
| `bun run lint` | any implementation-phase repo changes |
| `bun run check` | any implementation-phase repo changes |
| `bun run test` | any implementation-phase repo changes |
| `bun run check:full` | root TS wiring or workspace references change |
| `bun run lint:repo` | root package graph changes |
| `bun run audit:high` | dependency or security-exception surfaces change |
| `bun run trustgraph:sync-curated` | final closeout |

## Document Classification Matrix

| Surface | Classification | Planned Action | Notes |
|---|---|---|---|
| TBD | TBD | TBD | Populate during the next live P0 session |

## Open Questions

- Populate during the next live P0 session.

## Handoff Notes For P1

- Populate after P0 reaches `COMPLETED`.

## Exit Gate

P0 is complete when the grilling transcript and planning output are explicit enough that P1 can proceed without inventing policy locally.
