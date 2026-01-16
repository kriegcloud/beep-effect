# Phase 7: Database Migration - Orchestrator Prompt

## Context (Stable Prefix)
- **Spec**: oauth-provider-migration
- **Phase**: 7 of 7 (Final)
- **Package**: All
- **Prerequisites**: All previous phases (1-6) complete

---

## Objective

Generate and apply database migrations, then perform final verification of the complete implementation.

---

## Pre-Migration Checklist

Before generating migrations, verify all prior phases:

```bash
# Phase 1 verification
bun run check --filter @beep/shared-domain

# Phase 2 verification
bun run check --filter @beep/iam-domain

# Phases 3-5 verification
bun run check --filter @beep/iam-tables

# Phase 6 verification
bun run check --filter @beep/db-admin
```

All commands should pass with no errors.

---

## Migration Generation

### Step 1: Generate Migration

```bash
bun run db:generate
```

**Expected Output**:
- New migration file(s) in `packages/_internal/db-admin/drizzle/`
- Migration should create tables:
  - `iam_oauth_client`
  - `iam_oauth_access_token`
  - `iam_oauth_refresh_token`
  - `iam_oauth_consent`

### Step 2: Review Migration

Read the generated migration file to verify:
- All 4 tables are created
- Column types match expectations
- Foreign keys are correctly defined
- Indexes are created

### Step 3: Apply Migration

```bash
bun run db:migrate
```

**Note**: This requires a running PostgreSQL database. If using local development:
```bash
bun run services:up  # Start Docker services first
```

---

## Final Verification

### Build Verification

```bash
bun run build
```

**Expected**: Clean build with no errors

### Lint Verification

```bash
bun run lint
```

**Expected**: No new lint errors

### Type Check (Full)

```bash
bun run check
```

**Expected**: No type errors across entire monorepo

### Test Verification (Optional)

```bash
bun run test --filter @beep/iam-domain
bun run test --filter @beep/iam-tables
```

---

## Troubleshooting

### Migration Generation Fails

1. Check for circular dependencies in table definitions
2. Verify all foreign key references are valid
3. Ensure `db-admin/drizzle.config.ts` includes all tables

### Migration Application Fails

1. Check PostgreSQL is running
2. Verify database connection string in environment
3. Check for conflicts with existing tables (if re-running)

### Type Errors After Migration

1. Regenerate types if using drizzle-kit introspection
2. Verify domain model matches applied schema

---

## Post-Migration Checklist

- [ ] `bun run db:generate` produced migration files
- [ ] Migration file reviewed and tables correct
- [ ] `bun run db:migrate` applied successfully
- [ ] `bun run build` passes
- [ ] `bun run lint` passes
- [ ] `bun run check` passes (full monorepo)
- [ ] Updated REFLECTION_LOG.md with final learnings
- [ ] Spec marked as complete

---

## Spec Completion

Upon successful Phase 7 completion:

1. **Update REFLECTION_LOG.md** with final summary:
   - Total execution time across sessions
   - Key learnings
   - Pattern improvements discovered
   - Recommendations for similar future specs

2. **Archive handoff documents** - They serve as reference for similar work

3. **Optional**: Create summary in `outputs/completion-summary.md`

---

## Success Criteria (Final)

All items must be checked for spec completion:

- [ ] 4 Entity IDs in `@beep/shared-domain`
- [ ] 4 Domain Models in `@beep/iam-domain`
- [ ] 4 Tables in `@beep/iam-tables`
- [ ] Relations defined for all entities
- [ ] Type checks passing
- [ ] Admin DB updated
- [ ] Migrations generated and applied
- [ ] Full build passing
- [ ] Lint passing
- [ ] REFLECTION_LOG.md complete

---

## Congratulations!

If all checks pass, the OAuth Provider migration is complete. The better-auth `oauthProvider` plugin tables are ready for use.
