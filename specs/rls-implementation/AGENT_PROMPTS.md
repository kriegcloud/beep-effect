# Agent Prompts: RLS Implementation

> Ready-to-use prompts for specialized agents working on this spec.

---

## Phase 0: Research & Discovery

### Codebase Researcher - Table Inventory

```
You are researching the beep-effect codebase for RLS implementation.

## Mission
Identify ALL tables that use OrgTable.make() and require RLS policies.

## Search Targets
1. packages/iam/tables/src/tables/*.table.ts
2. packages/documents/tables/src/tables/*.table.ts
3. packages/shared/tables/src/tables/*.table.ts
4. packages/comms/tables/src/tables/*.table.ts (if exists)
5. packages/customization/tables/src/tables/*.table.ts (if exists)

## For Each Table Found
Document:
- Table name
- Package location
- Whether it uses OrgTable.make() (org-scoped) or Table.make() (global)
- organizationId column presence
- Existing indexes on organizationId

## How to Verify Indexes
Check each table's `extraConfig` function for index definitions:
```typescript
// Look for patterns like:
export const member = OrgTable.make(
  "iam_member",
  { /* columns */ },
  (t) => [pg.index("member_organization_id_idx").on(t.organizationId)]
);
```

To find index definitions:
1. Read the table file (e.g., packages/iam/tables/src/tables/member.table.ts)
2. Look for the third argument to OrgTable.make() - the extraConfig function
3. Check for `pg.index("*_organization_id*").on(t.organizationId)`

If no index exists, document as "No" - we will add indexes in the RLS migration.

## Output Format
Create a table in outputs/codebase-context.md:

| Table  | Package       | Scope      | Has orgId Index |
|--------|---------------|------------|-----------------|
| member | iam-tables    | org-scoped | Yes             |
| user   | shared-tables | global     | N/A             |

## Also Document
1. Current Db service patterns (how queries are executed)
2. Any existing session/context patterns
3. Migration infrastructure location
```

### MCP Researcher - Drizzle RLS

```
You are researching Drizzle ORM's RLS capabilities for beep-effect.

## Mission
Research how Drizzle ORM handles RLS policies and migrations.

## Research Topics

### 1. Drizzle RLS Documentation
- Custom SQL in migrations
- Policy management APIs
- Migration ordering for RLS

### 2. Supabase Integration
- drizzle-orm/supabase module
- Auth context integration (auth.uid(), auth.jwt())
- Built-in RLS helpers
- How it differs from raw PostgreSQL RLS

### 3. Neon Integration
- drizzle-orm/neon module
- RLS support status
- Any limitations

### 4. Effect Integration Patterns
- Setting session variables via @effect/sql
- SqlClient API for raw SQL execution
- Transaction boundaries and session context

## Output
Create outputs/drizzle-research.md with:
- API examples for each approach
- Pros/cons comparison
- Recommended approach for beep-effect
```

### Web Researcher - PostgreSQL RLS

```
You are researching PostgreSQL RLS best practices.

## Mission
Research PostgreSQL RLS patterns for multi-tenant applications.

## Research Topics

### 1. Official Documentation
- CREATE POLICY syntax
- USING vs WITH CHECK clauses
- Permissive vs restrictive policies
- Policy evaluation order

### 2. Session Variables
- SET application.variable patterns
- current_setting() function
- Transaction vs session scope
- Connection pooling implications (PgBouncer, etc.)

### 3. Performance
- Index requirements for RLS predicates
- Query plan impact
- Optimization strategies

### 4. Security Considerations
- Superuser bypass behavior
- Row leakage scenarios
- Common pitfalls

### 5. Multi-tenant Patterns
- Separate schemas vs RLS
- Role-based bypass mechanisms
- Testing strategies

## Output
Update outputs/codebase-context.md with research findings in a
dedicated "PostgreSQL RLS Research" section.
```

### Web Researcher - Provider Comparison

```
You are evaluating database providers for RLS implementation.

## Mission
Compare Supabase, Neon, and self-hosted PostgreSQL for beep-effect.

## Evaluation Criteria

### 1. Self-hosted PostgreSQL (Current State)
- Full control over RLS policies
- Manual session context management
- No provider lock-in
- Operational overhead
- Cost model

### 2. Supabase
- Built-in RLS helpers (auth.uid(), auth.jwt())
- Drizzle integration maturity
- Migration complexity from self-hosted
- Pricing at scale
- Feature limitations

### 3. Neon
- PostgreSQL compatibility
- Branching for development/testing
- Drizzle integration
- Serverless scaling model
- RLS support

### 4. Compatibility Check
- Effect/Drizzle pattern compatibility
- Required code changes
- Testing impact

## Output
Create outputs/provider-comparison.md with:
- Feature comparison table
- Migration complexity assessment
- Cost analysis (if available)
- Recommendation with justification
```

---

## Phase 1: Design & Architecture

### Architecture Pattern Enforcer - Design Validation

```
You are validating the RLS implementation design for beep-effect.

## Mission
Ensure the proposed RLS design follows codebase patterns and best practices.

## Validation Checks

### 1. Effect Patterns
- TenantContext service uses Effect.Service pattern
- Correct namespace imports (import * as Effect from "effect/Effect")
- Dependencies declared correctly
- Accessors enabled

### 2. Layer Architecture
- TenantContext integrates with existing Db layers
- No circular dependencies introduced
- Proper Layer composition

### 3. Migration Patterns
- Custom SQL follows db-admin patterns
- Migration ordering is correct
- No conflicts with existing migrations

### 4. Naming Conventions
- Policy names follow pattern: tenant_isolation_{table}
- Index names are globally unique
- Service names use correct namespacing

## Output
Create outputs/architecture-review.md with:
- Validation results
- Issues found
- Recommended changes
- Approval status
```

---

## Phase 2: IAM Implementation

### Architecture Pattern Enforcer - Implementation Review

```
You are reviewing the RLS implementation for the IAM slice.

## Mission
Validate that the IAM RLS implementation follows all required patterns.

## Review Checklist

### 1. Migration File
- All org-scoped tables have RLS enabled
- Policies use correct naming convention
- Index creation is idempotent (IF NOT EXISTS)
- SQL syntax is correct

### 2. TenantContext Service
- Follows Effect.Service pattern
- Uses SqlClient correctly
- Error handling is appropriate
- Exported from correct location

### 3. Build Verification
Run and verify:
- bun run check --filter @beep/iam-tables
- bun run check --filter @beep/shared-server
- bun run db:generate (no unexpected diffs)

### 4. Pattern Compliance
- No native array/string methods
- Namespace imports used
- Documentation follows standards

## Output
Report any violations and required fixes.
```

---

## Phase 3: Utilities & Testing

### Test Writer - RLS Test Suite

```
You are creating RLS verification tests for beep-effect.

## Mission
Create comprehensive tests that verify RLS policies work correctly.

## Test Categories

### 1. Unit Tests (TenantContext)
```typescript
import { describe, test, expect } from "bun:test";
import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server/TenantContext";

describe("TenantContext", () => {
  test("setOrganizationId executes SET statement", async () => {
    // ...
  });

  test("withOrganization scopes effect to org", async () => {
    // ...
  });
});
```

### 2. Integration Tests (RLS Policies)
```typescript
describe("RLS Integration", () => {
  test("member table enforces tenant isolation", async () => {
    // Insert as org A
    // Switch to org B
    // Verify org A data not visible
  });

  test("cross-tenant insert blocked", async () => {
    // Set context to org A
    // Attempt insert with org B's organizationId
    // Verify policy violation error
  });
});
```

### 3. Edge Cases
- Null organizationId handling
- Invalid session variable
- Context not set
- Transaction boundaries

## Requirements
- Use @beep/testkit patterns
- Follow Effect testing conventions
- Use Testcontainers for database
- Clean up test data after each test

## Output
Test files in appropriate package test directories.
```

---

## Phase 4: Documentation

### Doc Writer - Pattern Guide

```
You are documenting RLS patterns for beep-effect.

## Mission
Create comprehensive documentation for adding RLS to new slices.

## Document: documentation/patterns/rls-patterns.md

### Sections Required

1. **Overview**
   - What is RLS
   - Why beep-effect uses it
   - How it fits with OrgTable

2. **Adding RLS to a New Slice**
   - Step-by-step guide
   - Code examples
   - Migration template

3. **TenantContext Usage**
   - Service API
   - Layer composition
   - Common patterns

4. **Testing RLS**
   - Test utilities
   - Example tests
   - What to verify

5. **Troubleshooting**
   - Common errors
   - Debugging tips
   - Performance issues

### Style Requirements
- Follow existing documentation/patterns/*.md style
- Include complete code examples
- Use Effect patterns in all examples
- Cross-reference relevant AGENTS.md files

## Output
Create documentation/patterns/rls-patterns.md following the outline above.
```

---

## Cross-Phase Prompts

### Reflector - Session Synthesis

```
You are synthesizing learnings from the current RLS implementation phase.

## Mission
Analyze the phase execution and extract actionable improvements.

## Analysis Areas

1. **What worked well?**
   - Effective patterns
   - Useful research sources
   - Smooth implementation areas

2. **What was challenging?**
   - Unexpected issues
   - Documentation gaps
   - Pattern conflicts

3. **What should change?**
   - Prompt improvements
   - Process refinements
   - Documentation updates

4. **Learnings for other slices**
   - Reusable patterns
   - Common pitfalls
   - Time estimates

## Output
Update REFLECTION_LOG.md with structured findings:

## Phase [N] Reflection - [Date]

### Successes
- ...

### Challenges
- ...

### Improvements
- ...

### Learnings
- ...
```

### Handoff Writer - Phase Transition

```
You are creating a handoff document for the next phase.

## Mission
Create HANDOFF_P[N+1].md with complete context for the next session.

## Required Sections

### 1. Phase [N] Summary
- What was accomplished
- Key decisions made
- Artifacts created

### 2. Current State
- Files modified/created
- Build status
- Test status

### 3. Phase [N+1] Objectives
- Specific tasks
- Expected outcomes
- Success criteria

### 4. Context to Preserve
- Important decisions
- Gotchas discovered
- Open questions

### 5. Reference Files
- Key files to examine
- Documentation to read
- Previous phase outputs

### 6. Verification Steps
- Commands to run
- Checks to perform
- Expected results

## Also Create
P[N+1]_ORCHESTRATOR_PROMPT.md - A copy-paste ready prompt to start the next phase.
```
