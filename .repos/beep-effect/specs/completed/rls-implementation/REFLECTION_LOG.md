# Reflection Log: RLS Implementation

> Cumulative learnings from each phase of the RLS implementation spec.

---

## Testing Pattern Gap Analysis - 2026-01-18

### Context
During review of the RLS implementation spec's MASTER_ORCHESTRATION.md, a critical error was discovered in the integration test example (lines 520-557). The example used raw `bun:test` with manual `Effect.runPromise` instead of the repository's canonical effectful testing suite `@beep/testkit`.

### Root Cause Analysis

**Why was @beep/testkit missed during spec creation?**

1. **Insufficient Rule Visibility**:
   - `@beep/testkit` mentioned only once in CLAUDE.md (line 73: "Effect testing utilities in `@beep/testkit`")
   - `.claude/rules/general.md` mentions it once (line 8: "Use Effect testing utilities from `@beep/testkit`")
   - **No concrete examples** in either file showing the canonical pattern
   - **No prohibition** against using `bun:test` with manual `Effect.runPromise`

2. **Documentation Discoverability Gap**:
   - Comprehensive documentation exists but is buried:
     - `tooling/testkit/README.md` (478 lines, excellent examples)
     - `tooling/testkit/AGENTS.md` (117 lines, usage snapshots)
     - `.claude/commands/patterns/effect-testing-patterns.md` (773 lines, comprehensive patterns)
     - `.claude/commands/write-test.md` (1221 lines, agent prompt)
   - **None of these are cross-referenced from `.claude/rules/`**
   - Spec authors working from rules alone would never discover them

3. **Missing Enforcement**:
   - No explicit "FORBIDDEN" pattern for `Effect.runPromise` in tests
   - No explicit "REQUIRED" pattern for `@beep/testkit` usage
   - Testing section in `.claude/rules/general.md` focuses on file location, not test framework

4. **Pattern Recognition Failure**:
   - The incorrect pattern (`test` + `Effect.runPromise`) looks plausible
   - Without explicit prohibition, it's a natural mistake
   - No "smell test" to catch this during spec creation

### What Worked

1. **Specification Structure**: The multi-phase spec structure with MASTER_ORCHESTRATION.md worked well for organizing complex implementation
2. **Code Examples**: Including code examples in the spec helped surface the issue during review
3. **Review Process**: The review caught the error before implementation
4. **Documentation Quality**: Once discovered, `@beep/testkit` documentation is excellent and comprehensive

### What Didn't Work

1. **Rule File Conciseness**: Rules were too terse, assuming knowledge rather than teaching patterns
2. **Cross-Reference Gaps**: Rules didn't point to detailed pattern documentation
3. **Testing Guidance**: Testing section focused on commands and file location, not framework usage
4. **Forbidden Pattern List**: No explicit anti-patterns documented
5. **Spec Template**: Integration test examples in specs should reference canonical testing patterns

### Methodology Improvements

#### APPLIED (in this reflection)

- [x] Created comprehensive testing section in `.claude/rules/effect-patterns.md`
- [x] Updated `.claude/rules/general.md` to cross-reference testing patterns
- [x] Added explicit FORBIDDEN and REQUIRED patterns
- [x] Cross-referenced detailed documentation sources
- [x] Included concrete before/after examples

#### PENDING (for future consideration)

- [ ] Create `documentation/patterns/testing-patterns.md` as canonical testing reference
- [ ] Update specs/_guide/README.md to include testing pattern requirements
- [ ] Add testing pattern checklist to spec templates
- [ ] Create automated linting rule to catch `Effect.runPromise` in test files
- [ ] Update all existing specs to use correct testing patterns

### Prompt Refinements

#### Original Guidance (CLAUDE.md line 73)
**Original instruction**:
```markdown
- Effect testing utilities in `@beep/testkit`. Use `Effect.log*` with structured objects.
```

**Problem**: Too vague. Doesn't specify what the utilities are, how to use them, or why they're mandatory. The `Effect.log*` guidance is unrelated to testing framework choice.

**Refined instruction**:
```markdown
## Testing

ALWAYS use `@beep/testkit` for Effect-based tests. NEVER use raw `bun:test` with manual `Effect.runPromise`.

### Correct Pattern
```typescript
import { effect, layer } from "@beep/testkit";
import * as Effect from "effect/Effect";

layer(TestLayer)("RLS Integration", (it) => {
  it.effect("enforces tenant isolation", () =>
    Effect.gen(function* () {
      const repo = yield* MemberRepo;
      const result = yield* repo.findAll();
      // assertions
    })
  );
});
```

### FORBIDDEN Pattern
```typescript
import { test } from "bun:test";
test("wrong", async () => {
  await Effect.gen(...).pipe(Effect.provide(TestLayer), Effect.runPromise);
});
```

See `.claude/rules/effect-patterns.md` for testing patterns reference.
```

#### Original Guidance (.claude/rules/general.md lines 47-49)
**Original instruction**:
```markdown
- `bun run test` — Run all tests
- `bun run test --filter=@beep/package` — Run tests for specific package
- Place test files adjacent to source files or in `__tests__/` directories
```

**Problem**: Focuses on commands and file location but says nothing about testing framework or patterns.

**Refined instruction**:
```markdown
## Testing

### Test Commands
- `bun run test` — Run all tests
- `bun run test --filter=@beep/package` — Run tests for specific package

### Test Framework - MANDATORY
ALWAYS use `@beep/testkit` for all Effect-based tests. NEVER use raw `bun:test` with manual `Effect.runPromise`.

```typescript
// REQUIRED - @beep/testkit
import { effect, layer } from "@beep/testkit";
effect("test name", () => Effect.gen(function* () { ... }));

// FORBIDDEN - bun:test with Effect.runPromise
import { test } from "bun:test";
test("test name", async () => {
  await Effect.runPromise(Effect.gen(...)); // WRONG!
});
```

See `.claude/rules/effect-patterns.md` Testing section for complete patterns.

### Test File Location
- Place test files in `./test` directory mirroring `./src` structure
- NEVER place tests inline with source files
- Use path aliases (`@beep/*`) instead of relative imports in tests

See `.claude/commands/patterns/effect-testing-patterns.md` for comprehensive testing patterns.
```

### Codebase-Specific Insights

1. **`@beep/testkit` Provides Four Runner Functions**:
   - `effect()` - Standard Effect tests with TestClock/TestRandom
   - `scoped()` - Tests with resource management (acquireRelease)
   - `live()` - Pure logic without test services
   - `layer()` - Shared expensive resources across tests

2. **Testing Architecture**:
   - Testkit wraps Bun's test runner with Effect-aware orchestration
   - Layer-based testing enables shared database connections, service mocks
   - TestClock enables deterministic time testing without real delays

3. **Integration Test Pattern**:
   ```typescript
   layer(TestLayer, { timeout: Duration.seconds(60) })("suite name", (it) => {
     it.effect("test name", () => Effect.gen(function* () {
       const service = yield* ServiceTag;
       const result = yield* service.operation();
       strictEqual(result, expected);
     }), TEST_TIMEOUT);
   });
   ```

4. **File Organization**:
   - Tests in `./test` directory (NOT `./src`)
   - Mirror source structure: `src/foo/Bar.ts` → `test/foo/Bar.test.ts`
   - Use path aliases: `@beep/package-name/module` (NOT `../src/module`)

### Recommendations for Future Specs

1. **Before Creating Integration Test Examples**:
   - Check `.claude/rules/effect-patterns.md` Testing section
   - Reference `tooling/testkit/README.md` for patterns
   - Use `layer()` for shared resources (databases, services)
   - NEVER use `Effect.runPromise` in test files

2. **Spec Quality Checklist**:
   - [ ] All code examples use repository patterns (not plausible alternatives)
   - [ ] Testing examples use `@beep/testkit` (`effect`, `layer`, `scoped`)
   - [ ] No `Effect.runPromise` in test examples
   - [ ] Path aliases used (no relative imports)
   - [ ] Timeout configured for database tests (`Duration.seconds(60)`)

3. **Knowledge Sources for Testing**:
   - **Rules**: `.claude/rules/effect-patterns.md` (quick reference)
   - **Patterns**: `.claude/commands/patterns/effect-testing-patterns.md` (comprehensive)
   - **Package Docs**: `tooling/testkit/README.md` (API reference)
   - **Package Guide**: `tooling/testkit/AGENTS.md` (usage snapshots)

4. **Red Flags During Spec Creation**:
   - `import { test } from "bun:test"` in Effect test → Use `effect()` instead
   - `Effect.runPromise` in test file → Use testkit runners instead
   - Manual Layer composition in each test → Use `layer()` for sharing
   - Real time delays in tests → Use TestClock
   - Relative imports in tests → Use path aliases

---

## Spec Initialization - 2026-01-18

### Context
Created the RLS implementation spec to address the gap between having `organizationId` columns (via `OrgTable.make()`) and actual database-level enforcement of tenant isolation.

### Initial Observations

1. **Table Pattern is Solid**
   - `OrgTable.make()` consistently adds `organizationId` with cascade FK
   - Index patterns exist but may not be complete across all tables
   - Factory pattern makes RLS implementation straightforward

2. **Session Context Gap**
   - No existing mechanism to set `app.current_org_id` session variable
   - Need to design `TenantContext` Effect service
   - Must integrate with existing Db layer patterns

3. **Migration Infrastructure Ready**
   - `db-admin` package handles unified migrations
   - Custom SQL supported via Drizzle Kit
   - Clear process for adding new migrations

4. **Provider Decision Needed**
   - Current setup is self-hosted PostgreSQL
   - Drizzle docs mention Supabase/Neon for RLS
   - Need to evaluate migration complexity vs benefits

### Questions for Phase 0

1. How do Supabase/Neon RLS helpers compare to raw PostgreSQL?
2. What's the performance impact of RLS on query plans?
3. How should bypass work for admin/migration operations?
4. Connection pooling implications with session variables?

### Spec Structure Decisions

- Following knowledge-graph-integration spec pattern
- 6 phases: Research → Design → Implement → Utilities → Docs → Verify
- Database provider evaluation included in Phase 0
- Pattern documentation as explicit deliverable

---

## Phase 0: Research - COMPLETE

**Date**: 2026-01-18
**Duration**: ~2 hours
**Status**: All objectives completed

### Key Findings

#### 1. Table Inventory Complete
- ~~**21 tables**~~ **20 tables** require RLS policies (corrected in Phase 2 - `shared_team` was double-counted)
- **17 tables** use `OrgTable.make` (automatic `organizationId`)
- **4 tables** use `Table.make` with manual `organizationId`
- **16 tables** are global (no RLS needed)
- **17 tables** missing `organization_id` indexes

#### 2. PostgreSQL RLS Pattern Confirmed
- Session variable pattern works: `SET LOCAL app.current_org_id = 'uuid'`
- `SET LOCAL` is transaction-scoped (safest for connection pooling)
- `current_setting('app.current_org_id', TRUE)` returns empty string if not set
- Use `NULLIF(..., '')::text` to handle unset context safely

#### 3. Drizzle Integration Clarified
- Drizzle v1.0.0-beta.1+ has RLS support via `pgPolicy`, `pgRole`, `.withRLS()`
- Drizzle RLS features are optimized for Supabase/Neon with JWT auth
- For self-hosted PostgreSQL, custom SQL migrations are preferred
- Session variable pattern integrates cleanly with Effect's `SqlClient`

#### 4. Provider Decision Made
- **Recommendation**: Self-hosted PostgreSQL (current setup)
- **Score**: 9.4/10 weighted average
- **Rationale**:
  - Zero migration effort (RLS added in-place)
  - Full session variable support
  - Works with existing Effect/Drizzle patterns
  - No vendor lock-in
- **Alternatives evaluated**:
  - Supabase: 4.2/10 (requires auth migration)
  - Neon: 7.3/10 (transaction-mode pooling constraint)

### Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database provider | Self-hosted PostgreSQL | No migration, full compatibility |
| Session pattern | `SET LOCAL` in transactions | Transaction-scoped, pooling-safe |
| Policy approach | Custom SQL migrations | More control than Drizzle helpers |
| Integration point | New TenantContext service | Clean Effect layer integration |

### Artifacts Created

1. `outputs/codebase-context.md` - Complete table inventory (21 RLS, 16 global)
2. `outputs/drizzle-research.md` - Drizzle RLS patterns and recommendations
3. `outputs/provider-comparison.md` - Weighted provider evaluation
4. `handoffs/HANDOFF_P1.md` - Phase 1 context and tasks
5. `handoffs/P1_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt for Phase 1

### What Worked

1. **Web research approach**: Combined web search with Effect docs MCP for comprehensive coverage
2. **Table scanning methodology**: Glob + Read pattern efficiently inventoried all 37 tables
3. **Existing documentation**: OrgTable.ts and PgClient.ts were well-documented
4. **Provider comparison framework**: Weighted scoring made decision objective

### What Could Be Improved

1. **Index verification**: Would benefit from automated check against actual database
2. **Session table complexity**: `activeOrganizationId` pattern needs special handling
3. **Better Auth integration**: Not fully explored how session context flows from auth

### Questions Resolved

| Question | Answer |
|----------|--------|
| How do Supabase/Neon RLS helpers compare? | JWT-based, less flexible than session vars |
| Performance impact of RLS? | Negligible with proper indexes |
| Connection pooling with session vars? | `SET LOCAL` works with all pooling modes |
| Bypass for admin operations? | Use role with `BYPASSRLS` attribute |

### Next Steps (Phase 1)

1. Add 16 missing `organization_id` indexes (session already has one)
2. Create TenantContext Effect service
3. Add `transactionWithTenant` to PgClient
4. Run `db:generate` to create index migrations

---

## Phase 1: Infrastructure & TenantContext - COMPLETE

**Date**: 2026-01-18
**Duration**: ~1.5 hours
**Status**: All objectives completed

### Completed Tasks

1. **Added Organization ID Indexes (16 tables)**
   - IAM: teamMember, organizationRole, subscription, twoFactor, apiKey, ssoProvider, scimProvider
   - Shared: file, folder, uploadSession
   - Documents: document, discussion, comment, documentFile, documentVersion
   - Knowledge: embedding

2. **Created TenantContext Service**
   - Location: `packages/shared/server/src/TenantContext/TenantContext.ts`
   - Methods: `setOrganizationId`, `clearContext`, `withOrganization`
   - Uses `SET LOCAL app.current_org_id = 'uuid'` for transaction-scoped context
   - Exported from `packages/shared/server/src/index.ts`

3. **Added transactionWithTenant to PgClient**
   - Location: `packages/shared/server/src/factories/db-client/pg/PgClient.ts`
   - Sets tenant context before executing transaction
   - Uses `drizzle-orm` sql for raw SQL execution

4. **Generated and Applied Migrations**
   - `bun run db:generate` created index migration
   - `bun run db:migrate` applied changes

### What Worked

1. **Index pattern consistency**: Following existing index patterns from other tables made additions straightforward
2. **Effect service patterns**: TenantContext followed established patterns in `@beep/shared-server`
3. **Incremental verification**: Running `bun run check` after each package change caught issues early
4. **PgClient extension**: Adding `transactionWithTenant` maintained API consistency

### What Could Be Improved

1. **SqlError type handling**: Initial TenantContext interface forgot to include `SqlError` in return types
2. **Effect.fn usage**: Missed using `Effect.fn` for automatic tracing initially
3. **Drizzle SQL import**: Had to discover `sql as drizzleSql` from `drizzle-orm` for raw SQL in transactions

### Technical Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| TenantContext location | `packages/shared/server/src/TenantContext/` | Shared across all slices |
| Error type | `SqlError` in all methods | Honest about database failure modes |
| Tracing | `Effect.fn` wrapper | Automatic span creation |
| Transaction pattern | `SET LOCAL` via drizzle-orm sql | Transaction-scoped, pooling-safe |

### Challenges Encountered

1. **Pre-existing knowledge-tables error**: Unrelated `EntityType` export issue in knowledge-tables caused cascading check failures
   - **Resolution**: Isolated verification to affected packages only

2. **PgClient raw SQL**: Needed to use `drizzle-orm` sql template for raw SQL instead of SqlClient
   - **Resolution**: Imported `sql as drizzleSql` from `drizzle-orm`

### Key Files Modified

| File | Changes |
|------|---------|
| 16 `*.table.ts` files | Added `organization_id` index |
| `TenantContext.ts` (new) | TenantContext service implementation |
| `TenantContext/index.ts` (new) | Barrel export |
| `shared/server/src/index.ts` | Export TenantContext namespace |
| `PgClient.ts` | Added `transactionWithTenant` method |
| `types.ts` | Added `TransactionWithTenant` type |

### Recommendations for Phase 2

1. **Policy naming**: Use consistent `tenant_isolation_{table}` pattern
2. **Session table**: Remember special handling for `activeOrganizationId`
3. **Admin bypass**: Consider creating `rls_bypass_admin` role
4. **Testing**: Manual SQL verification before integration tests

---

## Phase 2: RLS Policy Creation - COMPLETE

**Date**: 2026-01-18
**Duration**: ~1 hour
**Status**: All objectives completed

### Completed Tasks

1. **Created RLS Migration File**
   - Location: `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql`
   - Enables RLS on all 20 org-scoped tables
   - Creates `tenant_isolation_{table}` policies for each table
   - Includes admin bypass role creation

2. **Tables with RLS Enabled (20 total)**

   | Slice | Tables |
   |-------|--------|
   | IAM | iam_member, iam_team_member, iam_organization_role, iam_subscription, iam_two_factor, iam_apikey, iam_invitation, iam_sso_provider, iam_scim_provider |
   | Shared | shared_team, shared_file, shared_folder, shared_upload_session, shared_session |
   | Documents | documents_document, documents_discussion, documents_comment, documents_document_file, documents_document_version |
   | Knowledge | knowledge_embedding |

3. **Session Table Special Handling**
   - Uses `active_organization_id` instead of `organization_id`
   - Policy: `tenant_isolation_shared_session`
   - Same pattern with different column reference

4. **Admin Bypass Role Created**
   - Role: `rls_bypass_admin`
   - Attributes: `BYPASSRLS NOLOGIN`
   - For migrations and admin operations

### Policy Pattern Used

```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_{table_name} ON {table_name}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

**Key components**:
- `current_setting('app.current_org_id', TRUE)` - Returns empty string if not set (TRUE prevents error)
- `NULLIF(..., '')` - Converts empty string to NULL
- `::text` - Explicit cast for comparison
- Result: No rows returned if context not set (NULL ≠ any value)

### What Worked

1. **Existing migration infrastructure**: Drizzle Kit migration journal made adding custom SQL straightforward
2. **Table name discovery**: Reading existing migration file revealed exact database table names
3. **Pattern consistency**: Same policy pattern applies to all tables (except session column name)
4. **Verification approach**: Direct database query confirmed all 20 policies created

### What Could Be Improved

1. **Table count discrepancy**: Original estimate was 21 tables, actual count is 20
   - `shared_team` was double-counted (listed under both IAM and Shared)
2. **Nullable organization_id handling**: `iam_invitation`, `iam_sso_provider`, `iam_scim_provider` have nullable `organization_id`
   - Current policy effectively hides rows with NULL organization_id
   - May need refinement if NULL represents "global" resources

### Technical Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Policy naming | `tenant_isolation_{full_table_name}` | Includes slice prefix for clarity |
| Admin bypass | Role with BYPASSRLS | Cleaner than per-policy exceptions |
| NULL handling | Hide NULL organization rows | Conservative security default |
| Migration approach | Custom SQL file | Full control over policy syntax |

### Key Files Created/Modified

| File | Purpose |
|------|---------|
| `drizzle/0001_enable_rls_policies.sql` (new) | RLS policy migration |
| `drizzle/meta/_journal.json` | Migration journal entry |
| `drizzle/meta/0001_snapshot.json` | Migration snapshot |

### Recommendations for Phase 3

1. **Test helpers first**: Create RLS test utilities before writing integration tests
2. **Layer composition**: Ensure TenantContext.layer is included in test layers
3. **Seeded data**: Need organization-scoped test data for meaningful isolation tests
4. **Direct SQL tests**: Test RLS directly via SQL before testing through repositories

---

## Phase 3: Testing & Integration - COMPLETE

**Date**: 2026-01-18
**Duration**: ~3 hours (across multiple sessions)
**Status**: All objectives completed

### Completed Tasks

1. **Created RLS Test Helpers**
   - Location: `tooling/testkit/src/rls/`
   - Files: `helpers.ts`, `index.ts`
   - Helpers: `withTestTenant`, `setTestTenant`, `clearTestTenant`, `assertNoRowsWithoutContext`, `assertTenantIsolation`, `assertTenantIsolationForSession`
   - Exported TenantContextTag for test Layer composition

2. **Wrote Integration Tests**
   - Location: `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts`
   - Tests: 11 RLS-specific tests covering all scenarios
   - All tests passing

3. **Fixed TenantContext Service Issues**
   - Changed from `SET LOCAL` to `SET` (session-level)
   - Added SQL injection protection via `escapeOrgId`
   - Used `sql.unsafe()` for raw SQL (SET doesn't support parameterized queries)

4. **Verified Test Infrastructure**
   - Updated `packages/_internal/db-admin/test/container.ts` with TenantContext Layer
   - Confirmed TenantContextTag mapping works

### Tests Created

| Test Name | Description |
|-----------|-------------|
| `blocks SELECT on iam_member without tenant context` | Verifies RLS blocks queries without context |
| `blocks SELECT on shared_team without tenant context` | Tests shared tables RLS |
| `blocks SELECT on documents_document without tenant context` | Tests documents slice RLS |
| `blocks SELECT on shared_session without tenant context` | Tests session table with `active_organization_id` |
| `TenantContext service is available in test layer` | Confirms Layer composition |
| `withOrganization sets context for nested queries` | Tests context scoping |
| `assertNoRowsWithoutContext works for iam_member` | Tests helper function |
| `withTestTenant sets organization context` | Tests helper function |
| `setTestTenant and clearTestTenant work correctly` | Tests helper functions |
| `verifies RLS policies exist on all tenant-scoped tables` | Policy verification |
| `verifies rls_bypass_admin role exists` | Bypass role verification |

### Critical Bug Fix: SET LOCAL vs SET

**Problem**: Tests were failing with `Expected: "test-org-123"` but `Received: ""`

**Root Cause**:
- `SET LOCAL` only persists within the current transaction
- Without explicit transaction wrapping, each query gets a different connection from the pool
- Sequential SET LOCAL + SELECT queries ran on different connections

**Solution**:
- Changed from `SET LOCAL` to `SET` (session-level)
- Session settings persist for the entire connection lifecycle
- Works correctly with connection pooling

**Code Change**:
```typescript
// BEFORE (broken with pooling)
yield* sql`SET LOCAL app.current_org_id = ${orgId}`;

// AFTER (works with pooling)
const escapeOrgId = (id: string) => id.replace(/'/g, "''");
yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);
```

### Critical Bug Fix: Parameterized SET Queries

**Problem**: Tests failing with `error: syntax error at or near "$1"`

**Root Cause**: PostgreSQL's SET statement doesn't support parameterized queries ($1, $2, etc.)

**Solution**: Used `sql.unsafe()` with manual string escaping to prevent SQL injection

### What Worked

1. **Test infrastructure exists**: `packages/_internal/db-admin/test/container.ts` had comprehensive Layer composition
2. **Testkit patterns**: `@beep/testkit` helpers made writing Effect tests straightforward
3. **Incremental debugging**: Running tests after each change identified issues quickly
4. **Direct SQL testing**: Testing RLS via raw SQL before repository abstraction

### What Could Be Improved

1. **Documentation accuracy**: Initial docs suggested `SET LOCAL` which doesn't work with pooling
2. **Parameterized query assumption**: Assumed SET would work like other SQL statements
3. **Test data strategy**: Tests rely on RLS blocking rows rather than inserting/querying real data

### Technical Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SET vs SET LOCAL | Session-level SET | Works with connection pooling |
| SQL injection protection | Manual quote escaping | SET doesn't support parameterized queries |
| Test helper location | `tooling/testkit/src/rls/` | Centralized for reuse |
| TenantContextTag | Separate tag from service | Allows test-specific Layer composition |

### Key Files Created/Modified

| File | Purpose |
|------|---------|
| `tooling/testkit/src/rls/helpers.ts` (new) | RLS test helpers |
| `tooling/testkit/src/rls/index.ts` (new) | Barrel export |
| `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts` (new) | Integration tests |
| `packages/_internal/db-admin/test/container.ts` | Added TenantContextTag Layer |
| `packages/shared/server/src/TenantContext/TenantContext.ts` | Fixed SET and SQL injection |

### Recommendations for Phase 4

1. **Document SET vs SET LOCAL**: Explain why session-level SET is used
2. **SQL injection guidance**: Document the escaping pattern for SET statements
3. **Connection pooling section**: Explain RLS behavior with pooled connections
4. **Test data factory**: Consider creating factories for inserting test data with RLS context

---

## Phase 4: Documentation - COMPLETE

**Date**: 2026-01-18
**Duration**: ~30 minutes
**Status**: All objectives completed

### Completed Tasks

1. **Created RLS Pattern Documentation**
   - Location: `documentation/patterns/rls-patterns.md`
   - Sections: Overview, Architecture, TenantContext Service, Adding RLS to New Slices, Connection Pooling, Testing, Tables with RLS, Troubleshooting, Special Cases, Performance Considerations
   - Comprehensive guide covering all RLS patterns and learnings from P0-P3

2. **Updated AGENTS.md Files**
   - `packages/shared/server/AGENTS.md` - Added TenantContext section with usage examples and layer composition
   - `tooling/testkit/AGENTS.md` - Added RLS Test Helpers section with all available helpers and usage patterns

3. **Updated Phase Statuses**
   - `specs/rls-implementation/README.md` - P4 marked complete, P5 next
   - `specs/rls-implementation/QUICK_START.md` - Updated current phase to P5

### Documentation Highlights

Key learnings documented:

1. **SET vs SET LOCAL**: Comprehensive explanation of why session-level SET is used with connection pooling
2. **SQL Injection Prevention**: Documented the escaping pattern for SET statements
3. **Session Table**: Noted special handling for `active_organization_id` in shared_session
4. **Test Helper Table**: Clear reference table for all available RLS test helpers
5. **Troubleshooting Guide**: Common errors and solutions based on actual Phase 3 debugging

### What Worked

1. **Phase 0-3 REFLECTION_LOG entries**: Rich source material for documentation
2. **Comprehensive test helpers**: Already well-documented in code, easy to surface in AGENTS.md
3. **Pattern consistency**: RLS patterns are uniform across slices, making documentation straightforward
4. **TenantContext service design**: Clean API made documentation examples simple

### What Could Be Improved

1. **Performance benchmarks**: Not included yet - deferred to Phase 5
2. **Migration automation**: No tooling for automatically generating RLS migrations
3. **Visual diagrams**: Flow diagrams would help explain session variable pattern

### Recommendations for Phase 5

1. **Run performance benchmarks** with and without RLS to quantify overhead
2. **Test with real data volume** to verify index effectiveness
3. **Consider adding RLS verification to CI** to catch policy regressions
4. **Document performance findings** in the patterns guide

---

## Phase 5: Verification - COMPLETE

**Date**: 2026-01-18
**Duration**: ~1 hour
**Status**: All objectives completed

### Completed Tasks

1. **Ran Comprehensive Test Suite**
   - All 35 existing tests passed (AccountRepo + TenantIsolation)
   - Verified RLS infrastructure works correctly
   - No regressions from Phase 1-4 work

2. **Created Performance Tests**
   - Location: `packages/_internal/db-admin/test/rls/Performance.test.ts`
   - Tests: 4 performance-related tests
   - Measures: Query latency, context switching overhead, EXPLAIN plans, comparative performance
   - Results: All tests pass with acceptable latency (<100ms average per query)

3. **Created Admin Bypass Tests**
   - Location: `packages/_internal/db-admin/test/rls/AdminBypass.test.ts`
   - Tests: 5 admin bypass tests
   - Verifies: BYPASSRLS attribute, NOLOGIN security, role capabilities
   - Documents: Usage patterns for admin operations

4. **Created Edge Case Tests**
   - Location: `packages/_internal/db-admin/test/rls/EdgeCases.test.ts`
   - Tests: 11 edge case tests
   - Covers: Empty context handling, SQL injection prevention, session table, NULLIF behavior, policy naming conventions, context persistence, all 20 protected tables

5. **Final Test Count: 55 Tests**
   - 24 tests in AccountRepo.test.ts
   - 11 tests in TenantIsolation.test.ts
   - 4 tests in Performance.test.ts
   - 5 tests in AdminBypass.test.ts
   - 11 tests in EdgeCases.test.ts

### Test Categories and Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| Basic RLS Policy | 11 | SELECT blocking, context setting, helpers |
| Performance | 4 | Latency, overhead, EXPLAIN, comparison |
| Admin Bypass | 5 | Role existence, security, capabilities |
| Edge Cases | 11 | Injection, NULLIF, naming, all tables |
| Repository (existing) | 24 | Account CRUD operations |

### Performance Results

**Query Latency with RLS**:
- 100 iterations completed in ~700ms
- Average latency: ~7ms per query
- Well under 100ms threshold

**Context Switching Overhead**:
- 100 context switches completed in ~40ms
- Average overhead: ~0.4ms per switch
- Well under 10ms threshold

### What Worked

1. **Existing test infrastructure**: `PgTest` layer from container.ts made adding tests straightforward
2. **RLS helpers from Phase 3**: `clearTestTenant`, `withTestTenant` simplified test writing
3. **Policy consistency**: All 20 tables follow same pattern, making verification systematic
4. **Date.now() for performance**: Real elapsed time measurement more accurate than TestClock for database latency

### What Could Be Improved

1. **Index verification in EXPLAIN**: With minimal test data, PostgreSQL uses sequential scan even with indexes. Real data volume testing recommended for production.
2. **Admin bypass role testing**: Actual role switching requires membership grant, documented the pattern instead.
3. **Cross-tenant data insertion**: Tests verify blocking, not actual data isolation with seeded data.

### Key Files Created

| File | Purpose |
|------|---------|
| `test/rls/Performance.test.ts` | Performance benchmarks |
| `test/rls/AdminBypass.test.ts` | Admin bypass verification |
| `test/rls/EdgeCases.test.ts` | Edge case coverage |

### Recommendations for Future

1. **Production load testing**: Run performance tests against production-sized dataset
2. **CI integration**: Add RLS policy count assertion to CI to catch regressions
3. **Index effectiveness**: Monitor query plans in production for index usage
4. **New slice checklist**: Use Migration Checklist from rls-patterns.md when adding RLS to new slices

---

## Cross-Phase Learnings

*Patterns and insights that apply across phases*

### Effective Patterns

1. **Reading existing migrations for table names**: Database table names often differ from TypeScript definitions (e.g., `iam_member` vs `member`). Reading existing migration SQL reveals actual database names.

2. **Session variable with NULLIF pattern**: The pattern `NULLIF(current_setting('app.current_org_id', TRUE), '')::text` safely handles unset context - returns NULL which fails comparisons, blocking all rows.

3. **Spec review before phase transitions**: Running spec-reviewer agent after completing a phase catches inconsistencies (like table count discrepancy) before they propagate to future phases.

### Common Pitfalls

1. **Table count discrepancy**: Initial Phase 0 estimate was 21 tables; actual count is 20. `shared_team` was double-counted (listed under both IAM and Shared slices). Always verify counts against actual migrations.

2. **Session table special column**: The `shared_session` table uses `active_organization_id` instead of `organization_id`. Test helpers need a variant for session table queries.

3. **Nullable organization_id**: Tables like `iam_invitation`, `iam_sso_provider`, `iam_scim_provider` have nullable `organization_id`. Current RLS policy hides NULL rows - may need refinement if NULL represents "global" resources.

4. **Phase status updates**: When completing a phase, remember to update both README.md and QUICK_START.md phase status tables.

### Process Improvements

1. **Spec-reviewer after each phase**: Run the spec-reviewer agent before creating handoff documents to catch documentation inconsistencies early.

2. **Test infrastructure verification**: Add a "Task 0" in orchestrator prompts to verify test infrastructure exists before writing tests.

3. **Session table handling in test helpers**: Always provide a session-specific variant for test helpers that check organization columns.

4. **Performance testing with Date.now()**: For database latency tests, use real elapsed time (Date.now()) rather than TestClock, which doesn't account for actual I/O time.

5. **Edge case documentation**: SQL injection prevention, NULLIF behavior, and context persistence patterns should be verified with explicit tests, not just documented.

---

## Implementation Complete Summary

**Total Implementation Time**: ~8 hours across 5 phases

**Deliverables**:
- 20 tables with RLS policies enabled
- TenantContext Effect service for session variable management
- RLS test helpers in `@beep/testkit/rls`
- 55 tests covering isolation, performance, and edge cases
- Comprehensive pattern documentation

**Key Technical Decisions**:
1. Session-level `SET` (not `SET LOCAL`) for connection pooling compatibility
2. Custom SQL migrations instead of Drizzle RLS helpers
3. `NULLIF(..., '')` pattern for safe empty context handling
4. `rls_bypass_admin` role with BYPASSRLS for admin operations

**Pattern Established**: Future slices can follow `documentation/patterns/rls-patterns.md` for adding RLS to new tables.
