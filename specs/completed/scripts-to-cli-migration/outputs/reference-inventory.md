# Reference Inventory: scripts/ to CLI Migration

> **Phase 1 COMPLETE** -- Verified 2026-02-05. All seed references confirmed current. No stale entries.

---

## Summary

| Metric | Count |
|--------|-------|
| Total unique files with references (excl. migration spec + source) | 16 |
| Total reference lines (excl. migration spec + source) | 65 |
| Operational references (MUST update) | 3 lines across 2 files |
| Spec-guide references (SHOULD update) | 1 line across 1 file |
| Archival references (MAY leave as-is) | 61 lines across 13 files |
| Stale/wrong references | 0 |

---

## Operational References (MUST update in Phase 5)

These references are in active documentation used by agents and contributors.

| File | Line | Current Content | Script | New Command |
|------|------|----------------|--------|-------------|
| `CLAUDE.md` | 88 | `bun run scripts/sync-cursor-rules.ts` | sync-cursor-rules | `bun run repo-cli sync-cursor-rules` |
| `.claude/standards/documentation.md` | 122 | `bun run scripts/find-missing-agents.ts` | find-missing-agents | `bun run repo-cli find-missing-docs` |
| `.claude/standards/documentation.md` | 125 | `bun run scripts/analyze-agents-md.ts` | analyze-agents-md | `bun run repo-cli analyze-agents` |

## Spec-Guide References (SHOULD update in Phase 5)

| File | Line | Current Content | Script | New Command |
|------|------|----------------|--------|-------------|
| `specs/_guide/PATTERN_REGISTRY.md` | 798 | `bun run scripts/sync-cursor-rules.ts` | sync-cursor-rules | `bun run repo-cli sync-cursor-rules` |

---

## Archival References (leave as historical)

### `scripts/sync-cursor-rules.ts` -- 11 archival files, 17 lines

| File | Lines | Context | Status |
|------|-------|---------|--------|
| `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P4.md` | 130, 197 | Phase 4 migration task | verified |
| `specs/agent-infrastructure-rationalization/handoffs/P4_ORCHESTRATOR_PROMPT.md` | 158 | Orchestrator prompt | verified |
| `specs/agent-infrastructure-rationalization/outputs/migration-checklist.md` | 51, 94, 197 | Migration checklist | verified |
| `specs/agent-infrastructure-rationalization/outputs/conflict-matrix.md` | 82, 105 | Conflict analysis | verified |
| `specs/agent-infrastructure-rationalization/outputs/P2_ARCHITECTURE.md` | 292, 526, 606 | Architecture doc | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P1.md` | 85, 176, 189 | Phase 1 handoff | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P2.md` | 83 | Phase 2 KEEP list | verified |
| `specs/artifact-file-cleanup/README.md` | 163 | Spec readme validation | verified |
| `specs/artifact-file-cleanup/outputs/artifact-candidates.md` | 68, 140, 201 | Artifact tracking | verified |
| `specs/artifact-file-cleanup/outputs/validation-report.md` | 53 | Final validation | verified |

### `scripts/analyze-agents-md.ts` -- 9 archival files, 14 lines

| File | Lines | Context | Status |
|------|-------|---------|--------|
| `specs/agent-config-optimization/REFLECTION_LOG.md` | 207 | Scripts created | verified |
| `specs/agent-config-optimization/handoffs/HANDOFF_P2.md` | 56 | Verification command | verified |
| `specs/agent-config-optimization/outputs/QUICK_REFERENCE.md` | 119 | Quick reference | verified |
| `specs/agent-config-optimization/outputs/inventory-summary.md` | 168, 175 | Inventory summary | verified |
| `specs/agent-config-optimization/outputs/README.md` | 124, 126, 139, 242 | Output README | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P1.md` | 89 | Script inventory | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P2.md` | 85 | KEEP list | verified |
| `specs/artifact-file-cleanup/outputs/artifact-candidates.md` | 56, 70, 141, 203 | Artifact tracking | verified |
| `specs/artifact-file-cleanup/outputs/validation-report.md` | 55 | Final validation | verified |

### `scripts/find-missing-agents.ts` -- 7 archival files, 12 lines

| File | Lines | Context | Status |
|------|-------|---------|--------|
| `specs/agent-config-optimization/outputs/QUICK_REFERENCE.md` | 122 | Quick reference | verified |
| `specs/agent-config-optimization/outputs/inventory-summary.md` | 169, 178 | Inventory summary | verified |
| `specs/agent-config-optimization/outputs/README.md` | 148, 150, 162, 245 | Output README | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P1.md` | 90 | Script inventory | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P2.md` | 87 | KEEP list | verified |
| `specs/artifact-file-cleanup/outputs/artifact-candidates.md` | 58, 72, 142, 205 | Artifact tracking | verified |
| `specs/artifact-file-cleanup/outputs/validation-report.md` | 57 | Final validation | verified |

### `scripts/analyze-readme-simple.ts` -- 6 archival files, 16 lines

| File | Lines | Context | Status |
|------|-------|---------|--------|
| `specs/agent-config-optimization/REFLECTION_LOG.md` | 208 | Scripts created | verified |
| `specs/agent-config-optimization/handoffs/HANDOFF_P2.md` | 59 | Verification command | verified |
| `specs/artifact-file-cleanup/REFLECTION_LOG.md` | 127, 135 | Cleanup decisions | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P1.md` | 92 | Script inventory | verified |
| `specs/artifact-file-cleanup/handoffs/HANDOFF_P2.md` | 56, 86 | Duplicate investigation + KEEP | verified |
| `specs/artifact-file-cleanup/outputs/artifact-candidates.md` | 47, 57, 71, 143, 151, 204, 222 | Artifact tracking | verified |
| `specs/artifact-file-cleanup/outputs/validation-report.md` | 41, 56 | DELETE/KEEP lists | verified |

---

## Notable Finding

`analyze-readme-simple.ts` has **zero operational references**. All its references are archival. No documentation updates needed for this script beyond deleting the source file and updating the migration spec's own command mapping table.

---

## Category Summary (for Phase 5 planning)

| Category | Files | Update Action |
|----------|-------|---------------|
| **Operational** (MUST update) | `CLAUDE.md`, `.claude/standards/documentation.md` | Replace `scripts/<name>.ts` with `repo-cli <command>` |
| **Spec Guide** (SHOULD update) | `specs/_guide/PATTERN_REGISTRY.md` | Update example command |
| **Archival** (leave as-is) | 13 files across `specs/agent-config-optimization/`, `specs/agent-infrastructure-rationalization/`, `specs/artifact-file-cleanup/` | Historical artifacts |

---

## Additional References (migration spec internal)

~55 additional reference lines exist within `specs/scripts-to-cli-migration/` itself (README, handoffs, orchestrator prompts, this inventory). These are part of the migration spec and need no external updating.
