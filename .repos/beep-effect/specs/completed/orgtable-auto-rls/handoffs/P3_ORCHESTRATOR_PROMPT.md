# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are executing **Phase 3: Cleanup & Verification** of the OrgTable Auto-RLS spec.

### Goal

Remove the manual RLS policy from `member.table.ts` to resolve the duplicate policy conflict with auto-generated RLS, then verify migration generation works.

### Your Mission

Execute these cleanup tasks:

**Task 3.1**: Remove Manual Policy
- Open `packages/iam/tables/src/tables/member.table.ts`
- Remove the `pg.pgPolicy("tenant_isolation_iam_member", {...})` call from the extraConfig callback (lines 64-70)
- Keep all the `pg.index()` calls - only remove the policy

**Task 3.2**: Remove Manual .enableRLS()
- In the same file, remove the `.enableRLS()` call at the end (line 71)
- The closing should just be `);` not `).enableRLS();`
- `OrgTable.make` now handles `.enableRLS()` automatically

**Task 3.3**: Verify Type Checks
```bash
bun run check --filter @beep/iam-tables
```

**Task 3.4**: Test Migration Generation
```bash
bun run db:generate
```
- This should now complete without the `tableKey2` error
- Expected: Empty or minimal migration output

**Task 3.5**: Full Verification
```bash
bun run check
bun run build --filter @beep/iam-tables
```

### Important Context

- The policy `tenant_isolation_iam_member` already exists in the database via migration `0001_enable_rls_policies.sql`
- Removing the manual definition from code does NOT remove it from the database
- `OrgTable.make` will now auto-generate the same policy definition, which Drizzle will recognize as unchanged

### Reference Files

- `specs/orgtable-auto-rls/handoffs/HANDOFF_P3.md` - Full context
- `packages/iam/tables/src/tables/member.table.ts` - File to modify
- `packages/shared/tables/src/org-table/OrgTable.ts` - Auto-RLS implementation

### Deliverables

1. Modified `member.table.ts` with manual RLS removed
2. Passing type checks
3. Successful `db:generate` execution
4. Update `specs/orgtable-auto-rls/REFLECTION_LOG.md` with P3 learnings
5. Create `specs/orgtable-auto-rls/handoffs/HANDOFF_P4.md`
6. Create `specs/orgtable-auto-rls/handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] Manual `pgPolicy()` removed from `member.table.ts`
- [ ] Manual `.enableRLS()` removed from `member.table.ts`
- [ ] `bun run check --filter @beep/iam-tables` passes
- [ ] `bun run db:generate` completes without error
- [ ] P3 learnings documented
- [ ] P4 handoff ready

### Verification

```bash
# Type check iam-tables
bun run check --filter @beep/iam-tables

# Generate migrations (should work now)
bun run db:generate

# Full workspace check
bun run check
```

### Handoff Document

Read full context in: `specs/orgtable-auto-rls/handoffs/HANDOFF_P3.md`
