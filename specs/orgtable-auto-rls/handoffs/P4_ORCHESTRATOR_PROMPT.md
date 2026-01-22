# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are executing **Phase 4: Documentation** of the OrgTable Auto-RLS spec.

### Goal

Document the auto-RLS feature in `@beep/shared-tables` AGENTS.md so future developers understand how to use the `rlsPolicy` option.

### Your Mission

Update documentation files with auto-RLS guidance:

**Task 4.1**: Update OrgTable.make Documentation

Open `packages/shared/tables/AGENTS.md` and add/update:

1. **Surface Map section**: Add note that OrgTable.make accepts optional `RlsOptions` parameter
2. **New section "Auto-RLS Behavior"**: Document the three policy options

```markdown
### Auto-RLS Behavior

`OrgTable.make` automatically generates tenant isolation policies:

| `rlsPolicy` Value | Behavior | Use Case |
|-------------------|----------|----------|
| `undefined` (default) | Standard policy requiring exact organizationId match | Most tenant-scoped tables |
| `'standard'` | Same as default | Explicit opt-in for clarity |
| `'nullable'` | Policy allowing NULL or matching organizationId | Tables with optional org ownership |
| `'none'` | No auto-policy, no enableRLS | Tables requiring custom policies |
```

**Task 4.2**: Add Quick Recipe

Add to the Quick Recipes section:

```typescript
### Using RLS options with OrgTable.make

// Default: standard tenant isolation (most common)
export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  { title: pg.text("title").notNull() }
);

// Nullable: allows NULL organizationId
export const sharedResource = OrgTable.make(SharedEntityIds.SharedResourceId, {
  rlsPolicy: "nullable"
})(
  { name: pg.text("name").notNull() }
);

// None: custom policy required
import { sql } from "drizzle-orm";

export const auditLog = OrgTable.make(SharedEntityIds.AuditLogId, {
  rlsPolicy: "none"
})(
  { action: pg.text("action").notNull() },
  (t) => [
    pg.pgPolicy("audit_admin_read", {
      for: "select",
      using: sql`current_setting('app.is_admin', TRUE) = 'true'`,
    }),
  ]
);
```

**Task 4.3**: Update Authoring Guardrails

Add these rules to the Authoring Guardrails section:

```markdown
- NEVER add manual `pgPolicy()` for standard tenant isolation - `OrgTable.make` generates this automatically.
- NEVER call `.enableRLS()` manually on OrgTable-based tables - the factory handles this.
- Use `rlsPolicy: 'none'` ONLY when non-standard policies are required (document the reason in comments).
```

**Task 4.4**: Add Gotcha

Add to the Gotchas section:

```markdown
### Auto-RLS Migration Conflicts

- **Duplicate policy error**: If a table already has a manual `tenant_isolation_*` policy in an existing migration, enabling auto-RLS in code creates a duplicate. Resolution: Remove the manual policy from the table code (keep the migration as-is for databases that already applied it).
- **New tables**: Tables created after auto-RLS implementation will have policies generated in their creation migration - no conflict.
```

**Task 4.5**: Verify No Updates Needed to IAM AGENTS.md

Check `packages/iam/tables/AGENTS.md`:
- The existing documentation should still be valid
- No changes needed unless it mentions manual RLS patterns that are now obsolete

**Task 4.6**: Update Reflection Log

Add P4 learnings to `specs/orgtable-auto-rls/REFLECTION_LOG.md`

### Reference Files

- `specs/orgtable-auto-rls/handoffs/HANDOFF_P4.md` - Full context
- `packages/shared/tables/AGENTS.md` - Primary file to update
- `packages/shared/tables/src/org-table/OrgTable.ts` - Implementation reference
- `packages/iam/tables/AGENTS.md` - Review only

### Deliverables

1. Updated `packages/shared/tables/AGENTS.md` with auto-RLS documentation
2. Reviewed `packages/iam/tables/AGENTS.md` (note any needed updates)
3. Updated `specs/orgtable-auto-rls/REFLECTION_LOG.md` with P4 learnings

### Success Criteria

- [ ] AGENTS.md documents `RlsOptions` parameter
- [ ] Quick recipe shows all three option values
- [ ] Guardrails prevent manual RLS patterns
- [ ] Gotcha explains migration conflict resolution
- [ ] P4 reflection logged

### Verification

```bash
# Review markdown rendering in editor
# No commands needed - this is documentation only
```

### Handoff Document

Read full context in: `specs/orgtable-auto-rls/handoffs/HANDOFF_P4.md`
