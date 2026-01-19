# Master Orchestration: RLS Implementation

> Complete phase workflows, checkpoints, and handoff protocols for implementing Row-Level Security across beep-effect.

---

## Phase 0: Research & Discovery

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `codebase-researcher`, `mcp-researcher`, `web-researcher`

### Objectives

1. Understand existing table patterns and `OrgTable.make()` usage
2. Research PostgreSQL RLS syntax and best practices
3. Evaluate Drizzle ORM RLS integration approaches
4. Compare database providers (Supabase, Neon, self-hosted PostgreSQL)
5. Document current Db service patterns for session context injection

### Tasks

#### Task 0.1: Codebase Analysis (codebase-researcher)

```
Analyze the beep-effect codebase for RLS-relevant patterns:

1. List all tables using OrgTable.make() that require RLS:
   - packages/iam/tables/src/tables/*.table.ts
   - packages/documents/tables/src/tables/*.table.ts
   - packages/shared/tables/src/tables/*.table.ts

2. Document the Db service pattern:
   - packages/iam/server/src/db/Db/Db.ts
   - packages/shared/server/src/DbClient/

3. Identify current session/context patterns:
   - How is organizationId currently passed through queries?
   - Any existing session context mechanisms?

4. Review migration infrastructure:
   - packages/_internal/db-admin/drizzle.config.ts
   - Existing migration patterns in drizzle/

Output: outputs/codebase-context.md
```

#### Task 0.2: PostgreSQL RLS Research (web-researcher)

```
Research PostgreSQL RLS best practices:

1. Official PostgreSQL RLS documentation
   - Policy syntax (USING, WITH CHECK)
   - Policy types (permissive vs restrictive)
   - Performance implications
   - Index requirements for RLS predicates

2. Multi-tenant RLS patterns
   - Session variable approaches (SET app.current_org_id)
   - Role-based bypass mechanisms

3. Connection pooling and session variables (CRITICAL)
   - How session variables interact with connection pooling
   - PgBouncer transaction mode vs session mode
   - `set_config(name, value, true)` for transaction-local scope
   - `set_config(name, value, false)` for session-level scope
   - When to use RESET vs rely on new connections
   - Impact on beep-effect's @effect/sql pool behavior

3. Common pitfalls and security considerations
   - Policy evaluation order
   - Superuser bypass
   - Testing strategies

Output: Update outputs/codebase-context.md with research findings
```

#### Task 0.3: Drizzle RLS Integration Research (mcp-researcher)

```
Research Drizzle ORM's RLS support:

1. Drizzle RLS documentation (https://orm.drizzle.team/docs/rls)
   - Custom SQL in migrations
   - Policy management APIs
   - Provider-specific integrations

2. Drizzle Supabase integration
   - drizzle-orm/supabase module
   - Auth context integration
   - Built-in RLS helpers

3. Drizzle Neon integration
   - drizzle-orm/neon module
   - Serverless considerations
   - RLS support status

4. Effect patterns for setting session variables
   - How to set session context before queries
   - Layer composition for context injection

Output: outputs/drizzle-research.md
```

#### Task 0.4: Database Provider Comparison (web-researcher)

```
Compare database providers for RLS implementation:

1. Self-hosted PostgreSQL
   - Full control over RLS policies
   - Manual session context management
   - No provider lock-in
   - Operational overhead

2. Supabase
   - Built-in RLS helpers
   - Auth context integration (auth.uid(), auth.jwt())
   - Drizzle integration maturity
   - Migration from self-hosted

3. Neon
   - PostgreSQL-compatible
   - Branching for development
   - Drizzle integration
   - Serverless scaling

4. Evaluation criteria:
   - Effect/Drizzle compatibility
   - Migration complexity
   - Session context mechanisms
   - Cost implications
   - Operational requirements

Output: outputs/provider-comparison.md
```

### Checkpoint

Before proceeding to P1:
- [ ] `outputs/codebase-context.md` documents all org-scoped tables
- [ ] `outputs/drizzle-research.md` captures Drizzle RLS patterns
- [ ] `outputs/provider-comparison.md` evaluates provider options
- [ ] Session context pattern decision documented
- [ ] Database provider recommendation made
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created

### Handoff

Create `handoffs/HANDOFF_P1.md` with:
- Research synthesis
- Recommended provider decision
- Session context pattern selection
- P1 task refinements

---

## Phase 1: Design & Architecture

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `architecture-pattern-enforcer`, `codebase-researcher`

### Objectives

1. Design RLS policy structure and naming conventions
2. Design Effect service for session context management
3. Create migration templates for RLS policies
4. Define bypass mechanisms for admin operations
5. Document index requirements for RLS performance

### Tasks

#### Task 1.1: RLS Policy Design

```
Design the RLS policy structure for beep-effect:

1. Policy naming convention
   - Pattern: tenant_isolation_{table}
   - Or: tenant_{operation}_{table} for per-operation policies

2. Policy structure decision
   Option A: Single FOR ALL policy per table (simpler)
   Option B: Separate policies per operation (more granular)

3. Policy SQL template:
   ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

   CREATE POLICY tenant_isolation_{table} ON {table}
     FOR ALL
     USING (organization_id = current_setting('app.current_org_id')::uuid);

4. Tables requiring policies (from Phase 0 analysis):
   - IAM slice tables
   - Documents slice tables
   - Future slice tables

Output: Update outputs/architecture-review.md with policy design
```

#### Task 1.2: Session Context Service Design

```
Design the Effect service for setting session context:

1. Service interface:
   export class TenantContext extends Effect.Service<TenantContext>()(
     "@beep/shared-server/TenantContext",
     {
       accessors: true,
       effect: Effect.gen(function* () {
         return {
           setOrganizationId: (orgId: string) =>
             Effect.gen(function* () {
               // Execute: SET app.current_org_id = orgId
             }),

           withOrganization: <R, E, A>(
             orgId: string,
             effect: Effect.Effect<A, E, R>
           ) => Effect.gen(function* () {
             yield* setOrganizationId(orgId);
             return yield* effect;
           }),
         };
       }),
     }
   ) {}

2. Integration points:
   - Request middleware (set context from session)
   - Repository operations (ensure context is set)
   - Test utilities (mock context for isolation)

3. Layer composition:
   - How TenantContext integrates with existing Db layers
   - Dependency injection pattern

Output: templates/tenant-context.template.ts
```

#### Task 1.3: Migration Template Design

```
Design Drizzle migration templates for RLS:

1. Custom migration approach:
   - Use Drizzle's custom SQL migration feature
   - Or: Separate SQL files for RLS policies

2. Template structure:
   -- Enable RLS on table
   ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

   -- Create tenant isolation policy
   CREATE POLICY tenant_isolation_{table} ON {table}
     FOR ALL
     USING (organization_id = current_setting('app.current_org_id')::uuid);

   -- Create index for RLS predicate (if not exists)
   CREATE INDEX IF NOT EXISTS {table}_organization_id_idx
     ON {table} (organization_id);

3. Migration ordering:
   - Tables must exist before RLS policies
   - Extension dependencies (if any)
   - Rollback considerations

Output: templates/rls-policy.template.sql
```

#### Task 1.4: Bypass Mechanism Design

```
Design RLS bypass for admin/system operations:

Option A: Separate database role without RLS
   - Create role 'beep_admin' with BYPASSRLS
   - Use for migrations, seeding, admin tools
   - Production app uses role with RLS enforced

Option B: Conditional policies
   - Check for admin flag in session
   - More complex but single connection pool

Option C: Disable RLS temporarily
   - SET row_security = off (requires privilege)
   - Not recommended for production

Recommendation: Document selected approach

Output: Update outputs/architecture-review.md with bypass design
```

### Checkpoint

Before proceeding to P2:
- [ ] RLS policy structure finalized
- [ ] Session context service designed
- [ ] Migration templates created
- [ ] Bypass mechanism documented
- [ ] Index requirements identified
- [ ] `architecture-pattern-enforcer` validates design
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P2.md` created

---

## Phase 2: IAM Slice Implementation

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: Manual implementation with `architecture-pattern-enforcer` validation

### Objectives

1. Create RLS migration for all IAM tables
2. Add organization_id indexes where missing
3. Implement TenantContext Effect service
4. Update IAM Db layer to use TenantContext
5. Test RLS policies locally

### Tasks

#### Task 2.1: Identify IAM Tables Requiring RLS

```
From Phase 0 analysis, categorize IAM tables:

Org-scoped (require RLS):
- member
- teamMember
- invitation
- organizationRole
- subscription
- ssoProvider
- scimProvider
- [others using OrgTable.make()]

Global (no RLS needed):
- user
- account
- session
- verification
- rateLimit
- jwks
- [others using Table.make()]
```

#### Task 2.2: Create RLS Migration

```sql
// packages/_internal/db-admin/drizzle/0002_rls_iam.sql (or custom migration)

-- Enable RLS on org-scoped IAM tables
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_provider ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_member ON member
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- Repeat for each table...

-- Ensure indexes exist for RLS predicates
CREATE INDEX IF NOT EXISTS member_organization_id_rls_idx
  ON member (organization_id);

-- Repeat for each table...
```

#### Task 2.3: Implement TenantContext Service

```typescript
// packages/shared/server/src/TenantContext/TenantContext.ts
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { SqlClient } from "@effect/sql";

export class TenantContext extends Effect.Service<TenantContext>()(
  "@beep/shared-server/TenantContext",
  {
    dependencies: [SqlClient.SqlClient],
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      return {
        setOrganizationId: (orgId: string) =>
          Effect.gen(function* () {
            yield* sql`SET app.current_org_id = ${orgId}`;
          }),

        withOrganization: <R, E, A>(
          orgId: string,
          effect: Effect.Effect<A, E, R>
        ) =>
          Effect.gen(function* () {
            yield* sql`SET app.current_org_id = ${orgId}`;
            return yield* effect;
          }),

        clearContext: () =>
          Effect.gen(function* () {
            yield* sql`RESET app.current_org_id`;
          }),
      };
    }),
  }
) {}
```

#### Task 2.4: Update IAM Db Layer

```typescript
// Ensure TenantContext is set before org-scoped operations
// This may require updating DbClient.make or adding middleware

// Option: Compose with request handler
const withTenant = (orgId: string) =>
  <R, E, A>(effect: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext;
      yield* ctx.setOrganizationId(orgId);
      return yield* effect;
    });
```

### Checkpoint

Before proceeding to P3:
- [ ] RLS migration created and tested locally
- [ ] TenantContext service implemented
- [ ] IAM Db layer updated
- [ ] `bun run db:migrate` succeeds
- [ ] `bun run check --filter @beep/iam-*` passes
- [ ] Manual verification of RLS enforcement
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P3.md` created

---

## Phase 3: Shared Utilities & Test Helpers

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `test-writer`, `codebase-researcher`

### Objectives

1. Create reusable RLS test utilities
2. Add TenantContext to shared server exports
3. Create RLS verification test helpers
4. Document integration patterns

### Tasks

#### Task 3.1: Test Utilities

```typescript
// packages/shared/testkit/src/rls/index.ts

import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server/TenantContext";

/** Test helper to verify RLS isolation */
export const verifyTenantIsolation = <T extends { organizationId: string }>(
  query: Effect.Effect<T[], never, TenantContext>,
  orgId: string
) =>
  Effect.gen(function* () {
    const ctx = yield* TenantContext;
    yield* ctx.setOrganizationId(orgId);
    const results = yield* query;

    // Verify all results belong to the expected organization
    for (const row of results) {
      if (row.organizationId !== orgId) {
        return yield* Effect.fail(
          new Error(`RLS violation: expected org ${orgId}, got ${row.organizationId}`)
        );
      }
    }

    return results;
  });

/** Test helper to verify cross-tenant isolation */
export const verifyCrossTenantBlocked = <T>(
  insertEffect: Effect.Effect<T, unknown, TenantContext>,
  queryEffect: Effect.Effect<T[], never, TenantContext>,
  orgA: string,
  orgB: string
) =>
  Effect.gen(function* () {
    const ctx = yield* TenantContext;

    // Insert as org A
    yield* ctx.setOrganizationId(orgA);
    yield* insertEffect;

    // Query as org B - should not see org A's data
    yield* ctx.setOrganizationId(orgB);
    const results = yield* queryEffect;

    // Verify no results from org A
    // ...
  });
```

#### Task 3.2: Integration Test Example

```typescript
// packages/_internal/db-admin/test/RlsIntegration.test.ts

import { expect } from "bun:test";
import { layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Either from "effect/Either";
import { TenantContext } from "@beep/shared-server/TenantContext";
import { IamDb } from "@beep/iam-server/db";
import { IamRepos } from "@beep/iam-server";

// Create test layer with required services
const TestLayer = Layer.mergeAll(
  TenantContext.layer,
  IamDb.layer,
  IamRepos.layer
);

layer(TestLayer)("RLS Integration", (it) => {
  it.effect("member table enforces tenant isolation", () =>
    Effect.gen(function* () {
      const memberRepo = yield* IamRepos.MemberRepo;
      const ctx = yield* TenantContext;

      // Create member in org A
      yield* ctx.setOrganizationId("org-a-uuid");
      yield* memberRepo.insert({
        userId: "user-1",
        organizationId: "org-a-uuid",
        role: "member",
      });

      // Switch to org B - should not see org A's member
      yield* ctx.setOrganizationId("org-b-uuid");
      const members = yield* memberRepo.findAll();

      expect(members).toHaveLength(0);
    })
  );

  it.effect("cannot insert member for different org than context", () =>
    Effect.gen(function* () {
      const memberRepo = yield* IamRepos.MemberRepo;
      const ctx = yield* TenantContext;

      yield* ctx.setOrganizationId("org-a-uuid");

      // Attempt to insert with mismatched org - should fail
      const result = yield* memberRepo.insert({
        userId: "user-2",
        organizationId: "org-b-uuid", // Different from context!
        role: "member",
      }).pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
    })
  );
});
```

### Checkpoint

Before proceeding to P4:
- [ ] Test utilities implemented in `@beep/testkit`
- [ ] Integration tests pass
- [ ] TenantContext exported from `@beep/shared-server`
- [ ] `bun run test` passes
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P4.md` created

---

## Phase 4: Documentation

**Duration**: 1 session
**Status**: Pending
**Agents**: `doc-writer`

### Objectives

1. Create RLS pattern documentation
2. Document replication steps for other slices
3. Update AGENTS.md files with RLS guidance
4. Add troubleshooting guide

### Tasks

#### Task 4.1: Pattern Documentation

Create `documentation/patterns/rls-patterns.md`:

```markdown
# Row-Level Security Patterns

## Overview
RLS provides database-level multi-tenant isolation...

## Adding RLS to a New Slice

### Step 1: Identify Org-Scoped Tables
Tables using `OrgTable.make()` require RLS policies.

### Step 2: Create Migration
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_{table} ON {table}
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Step 3: Ensure Index Exists
```sql
CREATE INDEX IF NOT EXISTS {table}_organization_id_rls_idx
  ON {table} (organization_id);
```

### Step 4: Test Isolation
Use `@beep/testkit` RLS test utilities...

## TenantContext Usage

```typescript
import { TenantContext } from "@beep/shared-server/TenantContext";

const myOperation = Effect.gen(function* () {
  const ctx = yield* TenantContext;
  yield* ctx.setOrganizationId(orgId);
  // Subsequent queries are scoped to orgId
});
```

## Troubleshooting

### "permission denied" errors
Ensure TenantContext is set before org-scoped queries...
```

### Checkpoint

Before proceeding to P5:
- [ ] `documentation/patterns/rls-patterns.md` created
- [ ] Relevant AGENTS.md files updated
- [ ] README updated with RLS status
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P5.md` created

---

## Phase 5: Verification & Performance

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `test-writer`, `codebase-researcher`

### Objectives

1. Run comprehensive RLS integration tests
2. Measure performance impact
3. Verify admin bypass works correctly
4. Final documentation review

### Tasks

#### Task 5.1: Comprehensive Testing

- Run full test suite with RLS enabled
- Verify all org-scoped operations work correctly
- Test edge cases (null orgId, invalid orgId, etc.)

#### Task 5.2: Performance Benchmarks

- Measure query latency with RLS enabled
- Compare to pre-RLS baseline
- Optimize indexes if needed

#### Task 5.3: Final Verification

- [ ] All IAM tables have RLS enabled
- [ ] All RLS policies follow naming convention
- [ ] TenantContext is set for all org-scoped operations
- [ ] Admin operations bypass RLS when needed
- [ ] Documentation is complete
- [ ] Pattern is ready for other slices

### Checkpoint

Spec complete when:
- [ ] All success criteria met
- [ ] No test failures
- [ ] Performance acceptable
- [ ] Documentation reviewed
- [ ] `REFLECTION_LOG.md` finalized

---

## Cross-Phase Considerations

### Effect Patterns (Mandatory)

All code must follow `.claude/rules/effect-patterns.md`:

```typescript
// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// REQUIRED: Effect.Service for services
export class TenantContext extends Effect.Service<TenantContext>()(
  "@beep/shared-server/TenantContext",
  {
    dependencies: [...],
    accessors: true,
    effect: Effect.gen(function* () { ... }),
  }
) {}
```

### Testing Requirements

Each phase must include:
- Unit tests for new functionality
- Integration tests for RLS policies
- Regression tests for existing behavior

### Documentation Requirements

Each phase updates:
- REFLECTION_LOG.md with learnings
- HANDOFF_P[N+1].md for next phase
- Relevant AGENTS.md files if patterns change

---

## Iteration Protocol

After each phase:

1. **Verify** - Run `bun run check` and `bun run test`
2. **Reflect** - Update REFLECTION_LOG.md
3. **Handoff** - Create HANDOFF_P[N+1].md
4. **Review** - Run `architecture-pattern-enforcer` if structure changed
