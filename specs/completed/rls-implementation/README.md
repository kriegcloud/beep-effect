# Row-Level Security (RLS) Implementation Spec

> A comprehensive specification for implementing PostgreSQL Row-Level Security across the beep-effect monorepo, starting with the IAM slice.

---

## Overview

This specification guides the research, design, and implementation of RLS policies for multi-tenant data isolation in beep-effect. The monorepo currently uses `organizationId` foreign keys on all org-scoped tables via `OrgTable.make()`, but lacks RLS enforcement at the database level.

### Current State

| Aspect                      | Status                                           |
|-----------------------------|--------------------------------------------------|
| `organizationId` columns    | Present on all org-scoped tables                 |
| RLS policies                | Not implemented                                  |
| Session context pattern     | Referenced (`app.current_org_id`) but not active |
| Application-level filtering | Manual `WHERE organizationId = ?` clauses        |

### Target State

| Aspect           | Status                                            |
|------------------|---------------------------------------------------|
| RLS enabled      | All org-scoped tables                             |
| Policy pattern   | `tenant_isolation_{table}` using session variable |
| Session context  | Effect service sets `app.current_org_id`          |
| Bypass mechanism | Admin/system operations via separate roles        |
| Documentation    | Reusable pattern for all slices                   |

---

## Problem Statement

Without RLS, tenant isolation relies entirely on application code correctness. A single forgotten `WHERE` clause or a developer mistake could expose data across organizations. RLS provides defense-in-depth by enforcing isolation at the database layer.

### Risks Addressed

1. **Accidental cross-tenant data leakage** via missing WHERE clauses
2. **Malicious data access** via SQL injection or compromised queries
3. **Developer errors** in new code that bypasses ORM patterns
4. **Testing gaps** where integration tests miss isolation bugs

---

## Scope

### In Scope

- PostgreSQL RLS policy design and implementation
- IAM slice tables (Phase 2 implementation)
- Effect service for session context management
- Drizzle migration patterns for RLS
- Admin bypass mechanisms
- Testing utilities for RLS verification
- Pattern documentation for other slices
- Database provider evaluation (Supabase, Neon, self-hosted PostgreSQL)

### Out of Scope

- Application-level authorization (RBAC/ABAC)
- Column-level security
- Data encryption at rest
- Audit logging (separate concern)
- Non-PostgreSQL database support

---

## Success Criteria

### Quantitative

- [ ] 100% of org-scoped IAM tables have RLS enabled
- [ ] 100% of RLS policies use consistent naming (`tenant_isolation_{table}`)
- [ ] Session context set on 100% of org-scoped database operations
- [ ] `bun run db:migrate` completes without errors
- [ ] `bun run check` passes across all affected packages
- [ ] Integration tests verify tenant isolation

### Qualitative

- [ ] Effect service provides type-safe session context management
- [ ] Pattern is documented and replicable for other slices
- [ ] Admin operations can bypass RLS when needed
- [ ] Performance impact is measured and acceptable
- [ ] Migration path is non-destructive for existing data

---

## Phase Overview

| Phase  | Description                                                            | Sessions | Status       |
|--------|------------------------------------------------------------------------|----------|--------------|
| **P0** | Research: RLS patterns, Drizzle integration, provider evaluation       | 1-2      | ✅ Complete  |
| **P1** | Infrastructure: Indexes + TenantContext service                        | 2-3      | ✅ Complete  |
| **P2** | Implement: RLS policies for 20 tables                                  | 2-3      | ✅ Complete  |
| **P3** | Utilities: Test helpers, integration tests                             | 1-2      | ✅ Complete  |
| **P4** | Documentation: Pattern guide for other slices                          | 1        | ✅ Complete  |
| **P5** | Verification: Integration tests, performance benchmarks                | 1-2      | ✅ Complete  |

---

## Key Technology Decisions

### Database Provider

**Evaluation Required** - Compare options for RLS support:

| Provider               | RLS Support      | Drizzle Integration   | Notes                           |
|------------------------|------------------|-----------------------|---------------------------------|
| Self-hosted PostgreSQL | Native           | Direct SQL migrations | Full control, manual management |
| Supabase               | Native + Helpers | Official plugin       | Built-in auth context, managed  |
| Neon                   | Native           | Official plugin       | Serverless, branching           |
| Vercel Postgres        | Limited          | Basic                 | Neon-powered, simplified        |

**Decision criteria:**
- Compatibility with existing Effect/Drizzle patterns
- Migration complexity from current self-hosted PostgreSQL
- Session context mechanisms
- Cost implications
- Operational overhead

### Session Variable Pattern

**Proposed**: PostgreSQL `current_setting('app.current_org_id')` pattern

```sql
-- Set at connection/transaction start
SET app.current_org_id = 'org_uuid_here';

-- Policy uses:
USING (organization_id = current_setting('app.current_org_id')::uuid)
```

**Alternative**: Row-level predicates via runtime parameters (provider-specific)

### RLS Policy Structure

**Proposed**: Separate policies per operation type for granular control

```sql
-- Read operations
CREATE POLICY tenant_read_{table} ON {table}
  FOR SELECT
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- Write operations
CREATE POLICY tenant_write_{table} ON {table}
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

-- Update operations
CREATE POLICY tenant_update_{table} ON {table}
  FOR UPDATE
  USING (organization_id = current_setting('app.current_org_id')::uuid)
  WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

-- Delete operations
CREATE POLICY tenant_delete_{table} ON {table}
  FOR DELETE
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

**Alternative**: Single `FOR ALL` policy (simpler but less flexible)

---

## Directory Structure

```
specs/rls-implementation/
├── README.md                         # This overview
├── QUICK_START.md                    # 5-minute triage
├── MASTER_ORCHESTRATION.md           # Phase workflows & checkpoints
├── AGENT_PROMPTS.md                  # Ready-to-use agent prompts
├── RUBRICS.md                        # Evaluation criteria
├── REFLECTION_LOG.md                 # Session learnings
├── outputs/
│   ├── codebase-context.md           # P0 research findings
│   ├── provider-comparison.md        # Database provider analysis
│   └── architecture-review.md        # Structure validation
├── handoffs/
│   ├── HANDOFF_P0.md                 # Phase 0 starter context
│   ├── P0_ORCHESTRATOR_PROMPT.md     # Phase 0 copy-paste prompt
│   └── ...
└── templates/
    ├── rls-policy.template.sql       # Policy generation template
    └── migration.template.ts         # Drizzle migration template
```

---

## Key Reference Files

| File                                                            | Purpose                                                         |
|-----------------------------------------------------------------|-----------------------------------------------------------------|
| `packages/shared/tables/src/org-table/OrgTable.ts`              | Org-scoped table factory                                        |
| `packages/iam/tables/src/tables/*.table.ts`                     | IAM table definitions                                           |
| `packages/iam/tables/src/schema.ts`                             | IAM schema aggregation                                          |
| `packages/iam/server/src/db/Db/Db.ts`                           | IAM Db service pattern                                          |
| `packages/shared/server/src/factories/db-client/pg/PgClient.ts` | DbClient factory (critical for TenantContext Layer composition) |
| `packages/_internal/db-admin/drizzle.config.ts`                 | Migration configuration                                         |
| `packages/_internal/db-admin/src/schema.ts`                     | Unified migration schema                                        |
| `specs/knowledge-graph-integration/outputs/codebase-context.md` | RLS pattern reference                                           |
| `.claude/rules/effect-patterns.md`                              | Effect coding standards                                         |

## DbClient Integration Example

TenantContext service must be composed with the database layer. Here's the pattern:

```typescript
import { TenantContext } from "@beep/shared-server/TenantContext";
import { DbClient } from "@beep/shared-server/factories";
import { IamDb } from "@beep/iam-server/db";
import * as Layer from "effect/Layer";

// TenantContext requires SqlClient.SqlClient
const TenantContextLive = TenantContext.TenantContextLive.pipe(
  Layer.provide(DbClient.layer)
);

// Compose with slice-specific Db layers
const AppLayer = Layer.mergeAll(
  TenantContextLive,
  IamDb.layer,
  IamRepos.layer
);

// Usage in request handler
const handler = Effect.gen(function* () {
  const ctx = yield* TenantContext;
  yield* ctx.setOrganizationId(session.organizationId);

  // All subsequent queries are filtered by RLS
  const members = yield* MemberRepo.findAll();
  return members;
});
```

---

## Agents Used

| Agent                           | Phase  | Purpose                                            |
|---------------------------------|--------|----------------------------------------------------|
| `codebase-researcher`           | P0, P1 | Explore existing table/db patterns                 |
| `mcp-researcher`                | P0     | Effect/Drizzle documentation                       |
| `web-researcher`                | P0     | PostgreSQL RLS best practices, provider comparison |
| `architecture-pattern-enforcer` | P1, P2 | Validate design against codebase                   |
| `test-writer`                   | P5     | RLS verification tests                             |
| `doc-writer`                    | P4     | Pattern documentation                              |
| `reflector`                     | All    | Session learnings synthesis                        |

---

## Quick Start

### For New Instances

1. Read [QUICK_START.md](QUICK_START.md) for 5-minute orientation
2. Review `outputs/codebase-context.md` for current state analysis
3. Check `handoffs/HANDOFF_P0.md` for current phase context
4. Execute current phase tasks from `MASTER_ORCHESTRATION.md`

### Key Commands

```bash
# Verify table definitions
bun run check --filter @beep/iam-tables

# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Run all checks
bun run check
```

---

## Research Topics (Phase 0)

1. **PostgreSQL RLS Documentation**
   - Policy syntax and semantics
   - Session variable patterns
   - Performance implications
   - Index requirements

2. **Drizzle ORM RLS Integration**
   - Custom SQL in migrations
   - Provider-specific plugins (Supabase, Neon)
   - Policy management patterns

3. **Effect Service Patterns**
   - Setting session context before queries
   - Layer composition for context injection
   - Testing with mocked context

4. **Multi-tenant Best Practices**
   - Defense-in-depth strategies
   - Bypass mechanisms for admin operations
   - Performance optimization

5. **Database Provider Evaluation**
   - Supabase RLS helpers and auth context
   - Neon branching and RLS support
   - Self-hosted PostgreSQL considerations
   - Migration complexity from current setup

---

## Deliverables

| Phase | Deliverable             | Location                                 |
|-------|-------------------------|------------------------------------------|
| P0    | Research findings       | `outputs/codebase-context.md`            |
| P0    | Provider comparison     | `outputs/provider-comparison.md`         |
| P1    | RLS policy design       | `outputs/architecture-review.md`         |
| P1    | Migration templates     | `templates/*.sql`                        |
| P2    | IAM RLS migration       | `packages/_internal/db-admin/drizzle/`   |
| P3    | Session context service | `packages/shared/server/src/`            |
| P3    | Test utilities          | `packages/shared/testkit/src/`           |
| P4    | Pattern documentation   | `documentation/patterns/rls-patterns.md` |
| P5    | Integration tests       | `packages/_internal/db-admin/test/`      |

---

## Related Documentation

- [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) - Detailed phase workflows
- [AGENT_PROMPTS.md](AGENT_PROMPTS.md) - Sub-agent prompts
- [RUBRICS.md](RUBRICS.md) - Evaluation criteria
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Table/repo patterns
- [Drizzle RLS Docs](https://orm.drizzle.team/docs/rls) - Official Drizzle RLS guide
