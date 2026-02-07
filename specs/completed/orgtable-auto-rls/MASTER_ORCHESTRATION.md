# Master Orchestration - OrgTable Auto-RLS

> Detailed phase workflows, checkpoints, and agent delegation for extending `OrgTable.make` with automatic RLS.

---

## Phase Summary

| Phase | Focus                        | Key Deliverables                         | Agents                  | Est. Sessions |
|-------|------------------------------|------------------------------------------|-------------------------|---------------|
| P0    | Research & API Analysis      | `outputs/drizzle-api-analysis.md`        | codebase-researcher, mcp-researcher | 1 |
| P1    | Design & Type Planning       | `outputs/design-decisions.md`            | architecture-pattern-enforcer | 1 |
| P2    | Implementation               | Modified `OrgTable.ts`, verified migration | effect-code-writer, package-error-fixer | 1-2 |
| P3    | Cleanup & Verification       | Removed manual policies, all tests pass  | package-error-fixer | 1 |
| P4    | Documentation                | Updated AGENTS.md, usage examples        | doc-writer | 1 |

---

## Context Preservation Notes

### KV-Cache Optimization

To maximize context reuse across sessions:

- **REFLECTION_LOG**: Uses append-only updates (new phases added to end)
- **Handoff Prompts**: Maintain stable prefixes for cache reuse
- **Session Timestamps**: Placed AFTER phase headers, not before
- **Phase References**: Use phase numbers (P0, P1) instead of dates in cross-references

### Session Continuity

- Load previous handoff via Quick Links (stable relative paths)
- Reference `outputs/` artifacts by consistent filenames
- Handoff documents preserve all context needed to resume
- Each phase is self-contained with explicit inputs/outputs

### Append-Only Patterns

When updating documents during execution:

```markdown
<!-- CORRECT: Append new entries at end -->
## Session History
| Date | Session | Notes |
|------|---------|-------|
| 2026-01-21 | Spec Created | Initial structure |
| 2026-01-22 | P0 Complete | Research findings captured |

<!-- AVOID: Modifying earlier entries -->
```

---

## Phase 0: Research & API Analysis

### Objective

Understand Drizzle's RLS API, policy merging behavior, and type implications for the `OrgTable.make` factory.

### Tasks

#### Task 0.1: Analyze Current OrgTable Implementation

**Agent**: `codebase-researcher`

**Prompt**:
```
Analyze the OrgTable.make factory in packages/shared/tables/src/org-table/OrgTable.ts:

1. Document the current function signature and return type
2. Identify how extraConfig (the second parameter to the inner function) is handled
3. Trace how pg.pgTable() processes the extraConfig callback
4. Document the type flow from custom columns to final table type
5. List any constraints on extraConfig (must return array, order matters, etc.)

Output: Summary of implementation details relevant to adding automatic RLS generation.
```

#### Task 0.2: Research Drizzle pgPolicy API

**Agent**: `mcp-researcher`

**Prompt**:
```
Research the Drizzle ORM pgPolicy API and RLS table configuration:

1. What is the exact signature of pgPolicy()?
2. How does .enableRLS() interact with pgPolicy definitions?
3. Can pgPolicy be combined with other extraConfig items (indexes)?
4. Does Drizzle Kit generate proper migrations for pgPolicy?
5. What happens if multiple policies have the same name?

Focus on Drizzle v0.45+ RLS features. Output: API reference relevant to OrgTable modification.
```

#### Task 0.3: Examine Existing Manual RLS Pattern

**Agent**: `codebase-researcher`

**Prompt**:
```
Find and analyze existing manual RLS policy definitions in the codebase:

1. Search for pgPolicy usage in packages/iam/tables/src/tables/*.ts
2. Document the exact SQL expression used in USING and WITH CHECK clauses
3. Identify any variations in policy structure across tables
4. Note if any tables use 'nullable' organizationId pattern
5. List tables that might need the 'nullable' policy variant

Output: Inventory of current RLS patterns to ensure the automatic generator matches.
```

### Verification Checkpoint

Before proceeding to P1:
- [ ] OrgTable.make signature and type flow documented
- [ ] Drizzle pgPolicy API understood
- [ ] Existing manual RLS patterns cataloged
- [ ] `outputs/drizzle-api-analysis.md` created

### Decision Tree: P0 → P1 Transition

```
All checkpoints pass?
├── YES → Proceed to P1 (Design)
└── NO → Identify failure
    ├── API not understood → Re-run Task 0.2 with refined prompts
    ├── Type flow unclear → Read additional source files
    ├── Blocking issue found → Escalate to user for scope revision
    └── Agent tool failure → Retry with alternative agent
```

### Verification Failure Protocol

If P0 verification fails:
1. Document the specific failure in `REFLECTION_LOG.md`
2. Identify root cause (missing context, tool limitation, scope issue)
3. Update `handoffs/HANDOFF_P0.md` with refined research questions
4. Re-run failed tasks with updated prompts
5. Do NOT proceed to P1 until all checkpoints pass

### Handoff

Create `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md` with:
- Findings from all three research tasks
- Identified constraints on extraConfig handling
- Recommended approach for policy injection
- Type preservation strategy

---

## Phase 1: Design & Type Planning

### Objective

Design the API signature, policy generation logic, and type definitions.

### Tasks

#### Task 1.1: Design Options Parameter

**Owner**: Orchestrator (direct)

**Work**:
1. Define `RlsOptions` type with `rlsPolicy` field
2. Choose where options parameter fits in curried signature
3. Ensure backward compatibility (options must be optional)
4. Document defaults: `'standard'` when omitted

**Options Considered**:

```typescript
// Option A: Second parameter to outer function
OrgTable.make(entityId, { rlsPolicy: 'standard' })((columns) => ...);

// Option B: Third parameter to inner function
OrgTable.make(entityId)((columns) => ..., (t) => [...], { rlsPolicy: 'standard' });

// Option C: Part of extraConfig callback return
OrgTable.make(entityId)((columns) => ..., (t) => [...configs, { rlsPolicy: 'standard' }]);
```

**Decision Criteria**:
- Minimal disruption to existing call sites
- Clean type inference
- Intuitive API for new users

#### Task 1.2: Design Policy Generation Logic

**Owner**: Orchestrator (direct)

**Work**:
1. Define policy SQL templates for 'standard' and 'nullable' variants
2. Plan policy name generation using `entityId.tableName`
3. Document how generated policy merges with user-provided extraConfig
4. Handle edge case: user provides their own `pgPolicy` in extraConfig

**Policy Templates**:

```typescript
const standardPolicy = (tableName: string) => pgPolicy(`tenant_isolation_${tableName}`, {
  as: "permissive",
  for: "all",
  using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
});

const nullablePolicy = (tableName: string) => pgPolicy(`tenant_isolation_${tableName}`, {
  as: "permissive",
  for: "all",
  using: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  withCheck: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
});
```

#### Task 1.3: Validate Type Preservation

**Agent**: `architecture-pattern-enforcer`

**Prompt**:
```
Review the proposed OrgTable.make modification for type safety:

Current signature:
```typescript
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)
```

Proposed change adds optional second parameter to outer function:
```typescript
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: RlsOptions
): (<TColumnsMap ...>(...) => PgTableWithMergedColumns<...>)
```

Verify:
1. Generic type parameters remain correctly inferred
2. Return type PgTableWithMergedColumns is preserved
3. Existing call sites remain compatible
4. extraConfig callback still works correctly
```

### Verification Checkpoint

Before proceeding to P2:
- [ ] Options parameter signature finalized
- [ ] Policy templates validated against existing patterns
- [ ] Type preservation confirmed
- [ ] `outputs/design-decisions.md` created

### Decision Tree: P1 → P2 Transition

```
All checkpoints pass?
├── YES → Proceed to P2 (Implementation)
└── NO → Identify failure
    ├── Type preservation issue → Explore alternative signatures
    ├── Policy pattern mismatch → Revise templates with P0 findings
    ├── Design ambiguity → Use AskUserQuestion for clarification
    └── Architectural conflict → Consult architecture-pattern-enforcer
```

### Verification Failure Protocol

If P1 verification fails:
1. Document the design challenge in `REFLECTION_LOG.md`
2. Create alternative design options with pros/cons
3. Seek user input if multiple valid approaches exist
4. Update `outputs/design-decisions.md` with rationale
5. Do NOT proceed to P2 until design is validated

### Handoff

Create `handoffs/HANDOFF_P2.md` and `handoffs/P2_ORCHESTRATOR_PROMPT.md` with:
- Final API signature
- Policy templates as code
- Implementation approach (where to add code)
- Test migration command sequence

---

## Phase 2: Implementation

### Objective

Modify `OrgTable.ts` to auto-generate RLS policies and verify migration generation.

### Tasks

#### Task 2.1: Implement Factory Modification

**Agent**: `effect-code-writer`

**Prompt**:
```
Modify packages/shared/tables/src/org-table/OrgTable.ts to add automatic RLS policy generation.

Requirements:
1. Add import: import { sql } from "drizzle-orm";
2. Add RlsOptions type: { rlsPolicy?: 'standard' | 'nullable' | 'none' }
3. Add optional second parameter to make(): make(entityId, options?)
4. Default rlsPolicy to 'standard' when undefined
5. Create policy using entityId.tableName for naming
6. Merge auto-generated policy with user extraConfig (auto policy first)
7. Call .enableRLS() on final table

Policy SQL (standard):
using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`
withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`

Policy SQL (nullable):
using: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`
withCheck: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`

If rlsPolicy is 'none', skip policy generation and enableRLS().

Reference: specs/rls-implementation/outputs/drizzle-research.md for RLS syntax
Reference: packages/iam/tables/src/tables/member.table.ts for existing manual pattern
```

#### Task 2.2: Fix Type/Build Errors

**Agent**: `package-error-fixer`

**Prompt**:
```
Fix all type errors, build errors, and lint issues in @beep/shared-tables after the OrgTable.make modification.

Run in order:
1. bun run check --filter @beep/shared-tables
2. bun run build --filter @beep/shared-tables
3. bun run lint:fix

Address any errors related to:
- Generic type parameter inference
- Return type compatibility
- Import statements
```

#### Task 2.3: Verify Migration Generation

**Owner**: Orchestrator (direct)

**Commands**:
```bash
# Generate migration to see RLS policy SQL
bun run db:generate

# Review generated SQL file
ls packages/_internal/db-admin/drizzle/*.sql | tail -1 | xargs cat
```

**Expected Output**:
Migration should include:
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- `CREATE POLICY tenant_isolation_{table} ON {table} ...`

### Verification Checkpoint

Before proceeding to P3:
- [ ] `bun run check --filter @beep/shared-tables` passes
- [ ] `bun run build --filter @beep/shared-tables` succeeds
- [ ] `bun run db:generate` produces valid migration
- [ ] Migration SQL shows correct RLS policy

### Decision Tree: P2 → P3 Transition

```
All checkpoints pass?
├── YES → Proceed to P3 (Cleanup)
└── NO → Identify failure
    ├── Type errors → Run package-error-fixer agent
    ├── Build fails → Check import statements and exports
    ├── Migration invalid → Review Drizzle pgPolicy syntax
    ├── Policy SQL wrong → Compare with manual patterns from P0
    └── Persistent failure → Trigger Rollback Plan
```

### Verification Failure Protocol

If P2 verification fails:
1. Document error messages in `REFLECTION_LOG.md`
2. Run `package-error-fixer` with specific error context
3. If errors persist after 3 attempts, trigger Rollback Plan
4. Update design document with discovered constraints
5. Re-evaluate implementation approach before retry

### Handoff

Create `handoffs/HANDOFF_P3.md` and `handoffs/P3_ORCHESTRATOR_PROMPT.md` with:
- Verification results
- List of tables with manual RLS to clean up
- Any edge cases discovered

---

## Phase 3: Cleanup & Verification

### Objective

Remove redundant manual RLS policies from existing tables and verify all packages compile.

### Tasks

#### Task 3.1: Identify Manual RLS Definitions

**Agent**: `codebase-researcher`

**Prompt**:
```
Find all manual pgPolicy definitions in org-scoped table files that can now be removed:

Search locations:
- packages/iam/tables/src/tables/*.ts
- packages/documents/tables/src/tables/*.ts
- packages/shared/tables/src/tables/*.ts

For each found:
1. File path and line number
2. Policy name
3. Whether table uses OrgTable.make (can remove) or Table.make (keep)
4. Any non-standard policy that should NOT be removed

Output: Prioritized list of files to clean up.
```

#### Task 3.2: Remove Redundant Policies

**Agent**: `effect-code-writer`

**Prompt**:
```
Remove manual RLS policy definitions from tables that now use OrgTable.make automatic RLS.

For each file identified in Task 3.1:
1. Remove the pgPolicy() call from extraConfig
2. Remove the .enableRLS() call (now handled by factory)
3. Keep any other extraConfig items (indexes, unique constraints)
4. Preserve table functionality

Do NOT remove policies from:
- Tables using Table.make (not OrgTable.make)
- Tables with non-standard policy logic
- Tables that explicitly need rlsPolicy: 'none'
```

#### Task 3.3: Full Package Verification

**Agent**: `package-error-fixer`

**Prompt**:
```
Verify all affected packages compile and pass checks after RLS cleanup:

Run in order:
1. bun run check --filter @beep/shared-tables
2. bun run check --filter @beep/iam-tables
3. bun run check --filter @beep/documents-tables
4. bun run check
5. bun run test --filter @beep/iam-tables

Fix any errors that arise from the cleanup.
```

### Verification Checkpoint

Before proceeding to P4:
- [ ] All manual RLS policies removed from OrgTable-based tables
- [ ] `bun run check` passes for all packages
- [ ] `bun run test` passes
- [ ] No duplicate policy warnings in migration

### Decision Tree: P3 → P4 Transition

```
All checkpoints pass?
├── YES → Proceed to P4 (Documentation)
└── NO → Identify failure
    ├── Check fails → Run package-error-fixer on failing package
    ├── Tests fail → Analyze test output, may need service layer updates
    ├── Duplicate policies → Verify cleanup removed all manual policies
    └── Non-OrgTable policy removed → Restore and mark as rlsPolicy: 'none'
```

### Verification Failure Protocol

If P3 verification fails:
1. Document which packages/tests fail in `REFLECTION_LOG.md`
2. Isolate failures to specific table files
3. Restore manual policies if cleanup was overzealous
4. Re-run verification incrementally (one package at a time)
5. Consider partial completion if only documentation tables affected

---

## Phase 4: Documentation

### Objective

Update package documentation and add usage examples.

### Tasks

#### Task 4.1: Update shared-tables AGENTS.md

**Agent**: `doc-writer`

**Prompt**:
```
Update packages/shared/tables/CLAUDE.md to document the new OrgTable.make RLS options:

Add to "Quick Recipes" section:

### OrgTable with automatic RLS (default)
```typescript
// Standard tenant isolation (default behavior)
export const member = OrgTable.make(IamEntityIds.MemberId)(
  { role: pg.text("role").notNull() },
  (t) => [pg.index("member_role_idx").on(t.role)]
);
```

### OrgTable with nullable organizationId RLS
```typescript
// For tables like ssoProvider where organizationId can be NULL
export const ssoProvider = OrgTable.make(IamEntityIds.SsoProviderId, { rlsPolicy: 'nullable' })(
  { domain: pg.text("domain").notNull() },
  (t) => [pg.uniqueIndex("sso_domain_idx").on(t.domain)]
);
```

### OrgTable without RLS (opt-out)
```typescript
// For rare cases needing manual policy control
export const specialTable = OrgTable.make(EntityIds.SpecialId, { rlsPolicy: 'none' })(
  { data: pg.text("data") }
);
```

Add to "Gotchas" section:
- RLS is now automatic: All OrgTable.make tables have tenant isolation by default
- Use rlsPolicy: 'nullable' for tables where organizationId can be NULL
- Use rlsPolicy: 'none' only when you need custom policy logic
```

#### Task 4.2: Create Usage Examples

**Agent**: `doc-writer`

**Prompt**:
```
Add a complete usage example to specs/orgtable-auto-rls/templates/policy.template.ts showing the three RLS modes:

Include:
1. Standard usage (implicit RLS)
2. Nullable usage (explicit option)
3. None usage (opt-out with manual policy)
4. Comments explaining when to use each
```

### Verification Checkpoint

Spec complete when:
- [ ] AGENTS.md updated with new API documentation
- [ ] Usage examples created
- [ ] `REFLECTION_LOG.md` updated with final learnings

---

## Agent Quick Reference

| Agent | When to Use | Tool Hint |
|-------|-------------|-----------|
| `codebase-researcher` | Finding patterns, inventorying files | Read-only exploration |
| `mcp-researcher` | Drizzle/Effect API questions | Effect docs MCP |
| `effect-code-writer` | Implementing TypeScript code | Full write access |
| `architecture-pattern-enforcer` | Validating design decisions | Structure analysis |
| `package-error-fixer` | Fixing compilation errors | Iterative fix loop |
| `doc-writer` | AGENTS.md, README updates | Documentation focus |
| `reflector` | Phase completion learnings | Meta-analysis |

---

## Rollback Plan

If implementation causes issues:

1. **Revert OrgTable.ts** to previous version
2. **Restore manual policies** in affected table files
3. **Delete generated migration** files
4. **Document failure** in REFLECTION_LOG.md
5. **Reassess** approach in new phase

---

## Related Documentation

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) - Spec creation patterns
- [HANDOFF_STANDARDS](../HANDOFF_STANDARDS.md) - Handoff document format
- [RLS Implementation Spec](../rls-implementation/README.md) - Broader RLS context
