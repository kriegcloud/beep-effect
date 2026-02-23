# Phase 0 Orchestrator Prompt

> Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Research & Discovery) of the RLS Implementation spec for beep-effect.

### Context

The beep-effect monorepo needs PostgreSQL Row-Level Security (RLS) for multi-tenant data isolation. Currently:
- Tables have `organizationId` columns via `OrgTable.make()`
- NO RLS policies are implemented
- Isolation relies on application WHERE clauses (risky)

### Your Mission

Complete these research tasks:

1. **Table Inventory** - Identify ALL org-scoped tables needing RLS across:
   - `packages/iam/tables/src/tables/`
   - `packages/documents/tables/src/tables/`
   - `packages/shared/tables/src/tables/`
   - Any other slice tables

2. **PostgreSQL RLS Research** - Document:
   - Policy syntax (USING, WITH CHECK)
   - Session variable patterns (`SET app.current_org_id`)
   - Performance implications
   - Connection pooling considerations

3. **Drizzle Integration** - Research:
   - Custom SQL migration patterns
   - Supabase/Neon RLS helpers
   - drizzle-orm provider integrations

4. **Provider Evaluation** - Compare:
   - Self-hosted PostgreSQL (current)
   - Supabase (RLS helpers, auth integration)
   - Neon (serverless, branching)

### Critical Patterns

Follow Effect patterns from `.claude/rules/effect-patterns.md`:
- Namespace imports: `import * as Effect from "effect/Effect"`
- No native array/string methods

### Reference Files

```
packages/shared/tables/src/org-table/OrgTable.ts    # Table factory
packages/iam/tables/src/tables/member.table.ts      # Example org table
packages/iam/server/src/db/Db/Db.ts                 # Db service pattern
packages/_internal/db-admin/drizzle.config.ts       # Migration config
```

### Output Files

Update/create:
- `specs/rls-implementation/outputs/codebase-context.md` - Table inventory, patterns
- `specs/rls-implementation/outputs/drizzle-research.md` - Drizzle findings
- `specs/rls-implementation/outputs/provider-comparison.md` - Provider evaluation

### Verification

Before completing Phase 0:
- [ ] All org-scoped tables identified and documented
- [ ] PostgreSQL RLS patterns understood
- [ ] Drizzle integration approach identified
- [ ] Provider recommendation made with justification
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings

### Success Criteria

- Complete table inventory with index status
- Clear recommendation on database provider
- Session variable pattern documented
- Handoff document ready for Phase 1

### Handoff Document

Read full context in: `specs/rls-implementation/handoffs/HANDOFF_P0.md`

After completing, create:
- `specs/rls-implementation/handoffs/HANDOFF_P1.md`
- `specs/rls-implementation/handoffs/P1_ORCHESTRATOR_PROMPT.md`
