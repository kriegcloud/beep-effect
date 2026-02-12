# Master Orchestration: canonical-domain-entity-migration

> Complete workflow for migrating all 56 non-canonical domain entities to the canonical TaggedRequest contract pattern using swarm-mode parallel agents.

---

## Phase Status

| Phase | Wave | Scope | Status | Entities | Handoff |
|-------|------|-------|--------|----------|---------|
| 1 | Pre | Inventory & Planning | **COMPLETE** | 56 cataloged | `HANDOFF_P2.md` |
| 2 | Wave 1 | IAM + Calendar + Comms + Customization | **COMPLETE** | 23 migrated | `HANDOFF_P3.md` |
| 3 | Wave 2 | Shared + Documents | **COMPLETE** | 14 migrated | `HANDOFF_P3_5.md` |
| 3.5 | Gate | Build fixes & consistency pass | **PENDING** | 0 new | `P3_5_ORCHESTRATOR_PROMPT.md` |
| 4 | Wave 3 | Knowledge | PENDING | 19 entities | `P4_ORCHESTRATOR_PROMPT.md` ready |
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

## Phase 3 Summary (Completed 2026-02-11)

- 14 entities migrated: 8 Shared + 6 Documents using 4-agent swarm
- 65 contracts created, 41 custom repo method extensions
- Key learnings: single barrel owner rule, entity complexity budgets, cleanup as orchestrator step
- **Build errors remain** — committed code references deleted lowercase directories
- Full details: `REFLECTION_LOG.md` Phase 3 entry

## Phase 3.5 Entry Point (Quality Gate)

Copy-paste prompt: `handoffs/P3_5_ORCHESTRATOR_PROMPT.md`

Scope: Fix 2 shared-domain build errors + commit 167 accumulated working tree fixes
- Fix `ListPaginated.contract.ts` GET payload constraint (NumberFromString)
- Fix `UploadSession.errors.ts` import path resolution
- Commit all import path corrections, lint formatting, documentation updates
- Verify ALL domain + downstream packages pass check/build

## Phase 4 Entry Point

Copy-paste prompt: `handoffs/P4_ORCHESTRATOR_PROMPT.md`

Scope: 19 Knowledge entities (46 custom repo methods)
- 5-agent swarm organized by complexity
- Requires Phase 3.5 to pass first (shared-domain build must be clean)
