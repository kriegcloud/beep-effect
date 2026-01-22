# OrgTable Automatic RLS Spec

> Extend `OrgTable.make` factory to automatically include tenant isolation RLS policies.

---

## Quick Links

| Resource | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute orientation |
| [Current Phase Prompt](handoffs/P0_ORCHESTRATOR_PROMPT.md) | Copy-paste to begin |
| [Phase Outputs](outputs/) | Completed research artifacts |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Full workflow details |
| [REFLECTION_LOG.md](REFLECTION_LOG.md) | Session learnings |

---

## Status Dashboard

| Phase | Status | Blockers | Last Updated |
|-------|--------|----------|--------------|
| P0: Research | Not Started | None | 2026-01-21 |
| P1: Design | Not Started | - | - |
| P2: Implementation | Not Started | - | - |
| P3: Cleanup | Not Started | - | - |
| P4: Documentation | Not Started | - | - |

**Current Phase**: P0 - Research & API Analysis
**Next Action**: Run `handoffs/P0_ORCHESTRATOR_PROMPT.md`

---

## Overview

This specification guides the extension of `OrgTable.make()` in `@beep/shared-tables` to automatically generate RLS (Row-Level Security) policies for all organization-scoped tables. Currently, RLS policies are manually defined per-table; this enhancement embeds RLS enforcement into the table factory itself.

### Current State

| Aspect                  | Status                                       |
|-------------------------|----------------------------------------------|
| `OrgTable.make`         | Creates org-scoped tables with FK cascade    |
| RLS policies            | Manually defined in table extra config       |
| Policy naming           | Manual (`tenant_isolation_{table}`)          |
| Opt-out mechanism       | N/A                                          |

### Target State

| Aspect                  | Status                                           |
|-------------------------|--------------------------------------------------|
| `OrgTable.make`         | Auto-generates RLS policies from factory         |
| Policy pattern          | Automatic `tenant_isolation_{tableName}` naming  |
| Options parameter       | `{ rlsPolicy: 'standard' \| 'nullable' \| 'none' }` |
| Default behavior        | `'standard'` (RLS enabled by default)            |

---

## Problem Statement

Manual RLS policy definitions across 20+ org-scoped tables introduce:

1. **Inconsistency risk** - Developers may forget or incorrectly define policies
2. **Boilerplate** - Same policy pattern repeated in every table definition
3. **Maintenance burden** - Policy pattern changes require updates across all tables
4. **Semantic mismatch** - `OrgTable` implies tenant isolation but doesn't enforce it

By embedding RLS into the factory, every `OrgTable.make()` call automatically gets tenant isolation, making the semantic contract explicit.

---

## Scope

### In Scope

- Modify `OrgTable.make()` factory to auto-generate RLS policies
- Add options parameter: `{ rlsPolicy: 'standard' | 'nullable' | 'none' }`
- Remove redundant manual RLS definitions from existing tables
- Verify Drizzle Kit migration generation behavior
- Update type definitions to preserve API compatibility
- Document the new API

### Out of Scope

- Changes to `Table.make()` base factory (no `organizationId`)
- TenantContext service modifications (already complete)
- New testing utilities (existing RLS test patterns apply)
- Performance optimization beyond index verification

### Cross-Spec Dependencies

| Spec | Dependency Type | Coordination Point |
|------|----------------|-------------------|
| `rls-implementation` | Prerequisite (Complete) | Provides RLS research and patterns |

**Coordination Protocol**: Check related spec status via `specs/[name]/README.md` Status Dashboard before phase transitions. This spec builds on the completed `rls-implementation` work.

**No Blocking Dependencies**: This spec can proceed independently as all prerequisite research is complete.

---

## Success Criteria

### Quantitative

- [ ] `OrgTable.make` accepts optional `{ rlsPolicy }` parameter
- [ ] Default `'standard'` generates automatic RLS policy
- [ ] `'nullable'` generates policy handling `NULL` organizationId
- [ ] `'none'` disables automatic RLS generation
- [ ] All 20 existing org-scoped tables compile without changes
- [ ] `bun run db:generate` produces valid migration
- [ ] `bun run check` passes across all affected packages
- [ ] Existing tests continue to pass

### Qualitative

- [ ] API remains backward-compatible (no required changes to existing tables)
- [ ] Type inference preserved for custom columns
- [ ] Clear documentation of options and behavior
- [ ] Migration shows correct RLS policy SQL

---

## Phase Overview

| Phase  | Description                                          | Sessions | Status      |
|--------|------------------------------------------------------|----------|-------------|
| **P0** | Research: Drizzle API, policy merging, type impact   | 1        | Not Started |
| **P1** | Design: API signature, policy templates, edge cases  | 1        | Not Started |
| **P2** | Implement: Modify factory, test migration generation | 1        | Not Started |
| **P3** | Cleanup: Remove manual policies, verify all tables   | 1        | Not Started |
| **P4** | Document: Update AGENTS.md, add usage examples       | 1        | Not Started |

---

## Key Design Decisions

### Options Parameter Signature

```typescript
type RlsOptions = {
  rlsPolicy?: 'standard' | 'nullable' | 'none';
};

// Usage
OrgTable.make(EntityId, { rlsPolicy: 'standard' })((columns) => ({ ... }));
```

### Policy Templates

**Standard** (default for NOT NULL organizationId):
```sql
pgPolicy("tenant_isolation_{tableName}", {
  as: "permissive",
  for: "all",
  using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
})
```

**Nullable** (for optional organizationId like SSO/SCIM):
```sql
pgPolicy("tenant_isolation_{tableName}", {
  as: "permissive",
  for: "all",
  using: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  withCheck: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
})
```

---

## Key Reference Files

| File                                               | Purpose                      |
|----------------------------------------------------|------------------------------|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Target file for modification |
| `packages/shared/tables/src/table/Table.ts`        | Base factory pattern         |
| `packages/shared/tables/src/table/types.ts`        | Type definitions             |
| `packages/iam/tables/src/tables/member.table.ts`   | Example with manual RLS      |
| `specs/rls-implementation/outputs/drizzle-research.md` | RLS integration findings |
| `packages/shared/tables/CLAUDE.md`                 | Package agent guidelines     |

---

## Agents Used

| Agent                           | Phase  | Purpose                               |
|---------------------------------|--------|---------------------------------------|
| `codebase-researcher`           | P0     | Analyze OrgTable factory patterns     |
| `mcp-researcher`                | P0     | Drizzle RLS API verification          |
| `effect-code-writer`            | P2     | Implement factory modification        |
| `architecture-pattern-enforcer` | P1, P3 | Validate design and cleanup           |
| `package-error-fixer`           | P2, P3 | Fix type/build errors                 |
| `doc-writer`                    | P4     | Update documentation                  |
| `reflector`                     | All    | Session learnings synthesis           |

---

## Directory Structure

```
specs/orgtable-auto-rls/
├── README.md                     # This overview
├── REFLECTION_LOG.md             # Session learnings
├── MASTER_ORCHESTRATION.md       # Phase workflows
├── outputs/
│   ├── drizzle-api-analysis.md   # P0 research
│   └── design-decisions.md       # P1 design doc
├── handoffs/
│   ├── HANDOFF_P0.md             # Phase 0 context
│   └── P0_ORCHESTRATOR_PROMPT.md # Phase 0 prompt
└── templates/
    └── policy.template.ts        # Policy generation template
```

---

## Quick Start

### For New Agent Instances

1. Read this README for overview
2. Check `handoffs/P0_ORCHESTRATOR_PROMPT.md` for current phase prompt
3. Review `outputs/` for completed research
4. Execute current phase from `MASTER_ORCHESTRATION.md`

### Verification Commands

```bash
# Check affected packages
bun run check --filter @beep/shared-tables

# Generate migration (verify RLS appears)
bun run db:generate

# Lint and format
bun run lint:fix
```

---

## Related Documentation

- [RLS Implementation Spec](../rls-implementation/README.md) - Broader RLS context
- [shared-tables AGENTS.md](../../packages/shared/tables/CLAUDE.md) - Package guidelines
- [Effect Patterns](.claude/rules/effect-patterns.md) - Coding standards
- [Drizzle RLS Research](../rls-implementation/outputs/drizzle-research.md) - API findings
