# Quick Start: RLS Implementation

> 5-minute orientation for new sessions working on this spec.

---

## What is this spec?

This spec guides implementing **PostgreSQL Row-Level Security (RLS)** across beep-effect to enforce multi-tenant data isolation at the database level.

## Current State

- Tables have `organizationId` columns via `OrgTable.make()`
- **NO** RLS policies currently enabled
- Application relies on manual WHERE clauses for isolation
- Risk: A forgotten WHERE clause could leak data across tenants

## Target State

- All org-scoped tables have `tenant_isolation_{table}` policies
- Effect service sets `app.current_org_id` session variable
- Database enforces isolation regardless of application code
- Pattern is documented and replicable for all slices

---

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| P0 | Research | ✅ Complete |
| P1 | Infrastructure | ✅ Complete |
| P2 | RLS Policy Creation | ✅ Complete |
| P3 | Test Utilities | ✅ Complete |
| P4 | Documentation | ✅ Complete |
| P5 | Verification | ✅ Complete |

---

## Implementation Complete

All phases of the RLS implementation are complete. The implementation includes:

- **20 tables** with RLS policies enabled
- **TenantContext service** for session variable management
- **Test utilities** in `@beep/testkit/rls`
- **55+ tests** verifying tenant isolation, performance, and edge cases
- **Pattern documentation** for future slices

### Key Files

```
documentation/patterns/rls-patterns.md                                 # RLS pattern documentation
packages/shared/server/src/TenantContext/TenantContext.ts              # TenantContext service
tooling/testkit/src/rls/helpers.ts                                     # RLS test helpers
packages/_internal/db-admin/test/rls/                                  # Integration tests
```

### RLS Policy Template

```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_{table_name} ON {table_name}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

---

## Key Decisions Made (P0-P3)

1. **Database Provider**: Self-hosted PostgreSQL ✅ (no migration needed)
2. **Session Variable Pattern**: `SET app.current_org_id = 'uuid'` ✅ (session-level, NOT `SET LOCAL`)
3. **Policy Approach**: Custom SQL migrations (not Drizzle RLS helpers) ✅
4. **Integration Point**: TenantContext Effect service ✅
5. **SQL Injection Prevention**: Manual quote escaping in SET statements (SET doesn't support parameterized queries)
6. **Test Helpers**: Located in `@beep/testkit/rls` with TenantContextTag for test Layer composition

---

## Quick Commands

```bash
# Check table definitions
bun run check --filter @beep/iam-tables

# Generate migrations (after schema changes)
bun run db:generate

# Apply migrations
bun run db:migrate

# Run all checks
bun run check
```

---

## Output Files

| File | Purpose |
|------|---------|
| `outputs/codebase-context.md` | Pre-research findings |
| `outputs/provider-comparison.md` | Database provider analysis |
| `outputs/drizzle-research.md` | Drizzle RLS integration |
| `handoffs/HANDOFF_P1.md` | Phase 1 context |

---

## Need Help?

- Full spec: [README.md](./README.md)
- Phase details: [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- Session learnings: [REFLECTION_LOG.md](./REFLECTION_LOG.md)
