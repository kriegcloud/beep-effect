# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are executing **Phase 2: Migration Testing & Validation** of the OrgTable Auto-RLS spec.

### Goal

Validate that the auto-RLS implementation generates correct migrations and works at runtime.

### Your Mission

Execute these validation tasks:

**Task 2.1**: Generate Migrations
- Run `bun run db:generate`
- Capture the output and note new migration file(s)

**Task 2.2**: Review Generated SQL
- Read the generated migration file
- Verify it contains `ENABLE ROW LEVEL SECURITY` statements
- Verify it contains `CREATE POLICY` statements with correct SQL

**Task 2.3**: Analyze member table conflict
- The member table already has manual RLS (lines 64-70 in member.table.ts)
- Check if Drizzle generates duplicate policies
- Document the conflict resolution strategy

**Task 2.4**: Create Integration Test (Optional)
- If time permits, create a simple test verifying RLS enforcement
- Use `@beep/testkit` patterns

### Important Context

The implementation is already complete in Phase 1. This phase is about **testing and validation**, not code changes to OrgTable.ts.

### Reference Files

- `specs/orgtable-auto-rls/outputs/design-decisions.md` - Design rationale
- `specs/orgtable-auto-rls/handoffs/HANDOFF_P2.md` - Full context
- `packages/shared/tables/src/org-table/OrgTable.ts` - Implementation
- `packages/iam/tables/src/tables/member.table.ts` - Manual RLS example

### Deliverables

1. Run migration generation and capture output
2. Document generated SQL patterns
3. Analyze policy conflict with member table
4. Update `specs/orgtable-auto-rls/REFLECTION_LOG.md` with P2 learnings
5. Create `specs/orgtable-auto-rls/handoffs/HANDOFF_P3.md`
6. Create `specs/orgtable-auto-rls/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `db:generate` produces valid migration SQL
- [ ] Migration SQL contains correct RLS statements
- [ ] Policy conflict analysis complete
- [ ] P2 learnings documented
- [ ] P3 handoff ready

### Verification

```bash
# Generate migrations
bun run db:generate

# View latest migration
ls -la packages/_internal/db-admin/drizzle/

# Type check (should still pass)
bun run check --filter @beep/shared-tables
```

### Handoff Document

Read full context in: `specs/orgtable-auto-rls/handoffs/HANDOFF_P2.md`
