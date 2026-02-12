# Master Orchestration: canonical-domain-entity-migration

> Complete workflow for migrating all 56 non-canonical domain entities to the canonical TaggedRequest contract pattern using swarm-mode parallel agents.

---

## Phase Status

| Phase | Wave | Scope | Status | Entities | Handoff |
|-------|------|-------|--------|----------|---------|
| 1 | Pre | Inventory & Planning | **COMPLETE** | 56 cataloged | `HANDOFF_P2.md` |
| 2 | Wave 1 | IAM + Calendar + Comms + Customization | **COMPLETE** | 23 migrated | `HANDOFF_P3.md` |
| 3 | Wave 2 | Shared + Documents | PENDING | 14 entities | `P3_ORCHESTRATOR_PROMPT.md` ready |
| 4 | Wave 3 | Knowledge | PENDING | 17 entities | Depends on P3 |
| 5 | Cleanup | Downstream consumers + verification | PENDING | N/A | Depends on P4 |

## Mandatory Handoff Protocol

Every phase MUST create BOTH handoff documents for the next phase:
1. `handoffs/HANDOFF_P[N+1].md` -- Full context document
2. `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` -- Copy-paste orchestrator prompt

## Pattern Source of Truth

1. **Skill**: `.claude/skills/canonical-domain-entity.md`
2. **Reference**: `packages/documents/domain/src/entities/Comment/` (5 contracts)

## Phase 2 Summary (Completed 2026-02-11)

- 23 entities migrated: 20 IAM + CalendarEvent + EmailTemplate + UserHotkey
- All 4 domain packages pass type checks
- 6 downstream import paths fixed (5 IAM client + 1 IAM server)
- Key learning: directory renames break downstream subpath imports (case-sensitive on Linux)
- Full details: `REFLECTION_LOG.md` Phase 2 entry

## Phase 3 Entry Point

Copy-paste prompt: `handoffs/P3_ORCHESTRATOR_PROMPT.md`

Scope: 14 entities (8 Shared + 6 Documents)
- Batch 1: 6 simple CRUD entities
- Batch 2: 3 Shared entities with custom repo methods
- Batch 3: 2 Documents bare entities with custom methods
- Batch 4: 3 Documents entities with legacy RPC dismantle
