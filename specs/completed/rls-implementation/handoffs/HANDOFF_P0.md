# Handoff: Phase 0 - Research & Discovery

> Context document for starting Phase 0 of RLS Implementation.

**Created**: 2026-01-18
**Target Phase**: P0 - Research & Discovery
**Estimated Sessions**: 1-2

---

## Context

The beep-effect monorepo requires database-level multi-tenant isolation via PostgreSQL Row-Level Security (RLS). Currently, all org-scoped tables have `organizationId` columns (via `OrgTable.make()`), but no RLS policies enforce isolation - this relies entirely on application code.

### Current Risk

Without RLS, a forgotten WHERE clause or a bug could expose data across organizations. RLS provides defense-in-depth by enforcing isolation at the database layer.

---

## Phase 0 Objectives

1. **Complete table inventory** - List ALL tables requiring RLS
2. **Research PostgreSQL RLS** - Best practices, session variables, performance
3. **Research Drizzle integration** - Custom SQL migrations, provider plugins
4. **Evaluate database providers** - Compare Supabase, Neon, self-hosted PostgreSQL
5. **Document findings** - Update `outputs/codebase-context.md`

---

## Key Decisions to Make

### 1. Database Provider
| Option                 | Pros                                   | Cons                             |
|------------------------|----------------------------------------|----------------------------------|
| Self-hosted PostgreSQL | Full control, no lock-in               | Manual RLS management            |
| Supabase               | Built-in RLS helpers, auth integration | Vendor lock-in, migration effort |
| Neon                   | PostgreSQL-compatible, serverless      | Less mature, fewer RLS helpers   |

**Decision criteria (prioritized):**
1. **[HIGH]** Compatibility with Effect/Drizzle patterns - Must work with existing service architecture
2. **[HIGH]** Migration complexity from current setup - Lower complexity strongly preferred
3. **[MEDIUM]** Session context mechanisms - How RLS context is established per request
4. **[MEDIUM]** Connection pooling compatibility - Session variables must work with pooling strategy
5. **[LOW]** Cost implications - Consider at scale, but not primary factor

### 2. Session Variable Pattern
```sql
-- Standard PostgreSQL pattern
SET app.current_org_id = 'uuid';

-- Policy uses:
USING (organization_id = current_setting('app.current_org_id')::uuid)
```

**Questions:**
- How does this work with connection pooling?
- Transaction vs session scope?
- What happens if not set?

### 3. Policy Granularity
| Option         | Description                                      |
|----------------|--------------------------------------------------|
| Single FOR ALL | One policy per table for all operations          |
| Per-operation  | Separate SELECT, INSERT, UPDATE, DELETE policies |

---

## Research Tasks

### Task 0.1: Codebase Analysis
```
Use codebase-researcher agent to:
1. List all tables using OrgTable.make()
2. Check existing organizationId indexes
3. Document current Db service patterns
4. Identify any existing session/context mechanisms
```

### Task 0.2: PostgreSQL RLS Research
```
Use web-researcher agent to research:
1. PostgreSQL RLS documentation
2. Session variable patterns
3. Performance implications
4. Multi-tenant best practices
```

### Task 0.3: Drizzle RLS Research
```
Use mcp-researcher agent to research:
1. Drizzle RLS documentation
2. Custom SQL migrations
3. Supabase/Neon integrations
4. Effect patterns for session context
```

### Task 0.4: Provider Comparison
```
Use web-researcher agent to:
1. Compare Supabase, Neon, self-hosted PostgreSQL
2. Evaluate migration complexity
3. Assess RLS helper availability
4. Check pricing/operational requirements
```

---

## Files to Examine

| File                                               | Purpose                   |
|----------------------------------------------------|---------------------------|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Table factory pattern     |
| `packages/iam/tables/src/tables/*.table.ts`        | All IAM table definitions |
| `packages/iam/server/src/db/Db/Db.ts`              | Db service pattern        |
| `packages/_internal/db-admin/drizzle.config.ts`    | Migration configuration   |
| `packages/shared/server/src/DbClient/`             | DbClient factory          |

---

## Output Deliverables

| File                             | Contents                                 |
|----------------------------------|------------------------------------------|
| `outputs/codebase-context.md`    | Complete table inventory, patterns found |
| `outputs/drizzle-research.md`    | Drizzle RLS integration findings         |
| `outputs/provider-comparison.md` | Database provider evaluation             |

---

## Verification

Before completing Phase 0:
- [ ] All org-scoped tables documented
- [ ] PostgreSQL RLS patterns understood
- [ ] Drizzle integration approach identified
- [ ] Provider recommendation made
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P1.md` created

---

## Reference Links

- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Drizzle RLS Docs](https://orm.drizzle.team/docs/rls)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Neon Security Overview](https://neon.tech/docs/security/security-overview)

---

## Handoff to Phase 1

After completing Phase 0, create `handoffs/HANDOFF_P1.md` with:
- Research synthesis
- Recommended provider
- Session context pattern decision
- Refined Phase 1 tasks
