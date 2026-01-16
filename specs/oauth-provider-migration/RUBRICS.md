# Scoring Rubrics: OAuth Provider Migration

> Quality assessment criteria for each phase of the spec execution.

---

## Overview

These rubrics help assess the quality and completeness of each phase. Use them for self-assessment before handoff and for final spec review.

---

## Phase 1: Entity IDs

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| ID definitions complete | 3 | All 4 IDs in ids.ts with proper namespace |
| Table names added | 2 | All 4 table names in TableName union |
| AnyId union updated | 2 | All 4 IDs in AnyId union |
| Verification passes | 2 | `bun run check --filter @beep/shared-domain` succeeds |
| Documentation updated | 1 | HANDOFF_P1.md and REFLECTION_LOG.md updated |

### Scoring
- **9-10**: Excellent - Ready for Phase 2
- **7-8**: Good - Minor fixes needed
- **5-6**: Acceptable - Some rework required
- **<5**: Incomplete - Significant gaps

---

## Phase 2: Domain Models

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| All models created | 4 | 4 model files with M.Class definitions |
| Field completeness | 2 | All fields from spec present |
| Barrel exports | 1 | index.ts for each entity folder |
| Main index updated | 1 | entities/index.ts exports all 4 |
| Verification passes | 2 | `bun run check --filter @beep/iam-domain` succeeds |

### Model Quality Checklist
- [ ] Uses makeFields with correct Entity ID
- [ ] Has proper $I annotations
- [ ] modelKit static utility added
- [ ] Sensitive fields use BS.FieldSensitiveOptionOmittable
- [ ] Optional fields use BS.FieldOptionOmittable
- [ ] Required fields have proper types (S.NonEmptyString, etc.)

---

## Phase 3: Database Tables

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| All tables created | 3 | 4 table files with Table.make |
| Column completeness | 2 | All columns match domain models |
| Foreign keys correct | 2 | References clientId, not id |
| Indexes defined | 1 | Appropriate indexes for queries |
| Index exports added | 1 | tables/index.ts updated |
| Verification passes | 1 | `bun run check --filter @beep/iam-tables` succeeds |

### Critical FK Check
```typescript
// CORRECT - References clientId
.references(() => oauthClient.clientId, { onDelete: "cascade" })

// WRONG - References id
.references(() => oauthClient.id, { onDelete: "cascade" })
```

---

## Phase 4: Drizzle Relations

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| OAuth relations added | 4 | 4 new relation exports |
| userRelations updated | 2 | 4 new many() relations |
| sessionRelations updated | 2 | 2 new many() relations |
| FK references correct | 1 | clientId used consistently |
| Verification passes | 1 | `bun run check --filter @beep/iam-tables` succeeds |

### Relation Reference Checklist
- [ ] oauthClientRelations → user, tokens, consents
- [ ] oauthAccessTokenRelations → client, session, user, refreshToken
- [ ] oauthRefreshTokenRelations → client, session, user, accessTokens
- [ ] oauthConsentRelations → client, user

---

## Phase 5: Type Alignment Checks

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| All checks present | 4 | 8 type checks (select + insert × 4) |
| Select types align | 2 | No type errors on select checks |
| Insert types align | 2 | No type errors on insert checks |
| Imports correct | 1 | Domain types imported correctly |
| Verification passes | 1 | `bun run check --filter @beep/iam-tables` succeeds |

### Type Mismatch Debugging

If type check fails, investigate:

1. **Field name mismatch**: Domain `clientId` vs Table `client_id`
   - Resolution: Verify column naming in table definition

2. **Optionality mismatch**: Domain optional, table required
   - Resolution: Align nullability between domain and table

3. **Type mismatch**: Domain `Date`, table `string`
   - Resolution: Use datetime() helper in table

4. **Array type mismatch**: Domain `string[]`, table `text`
   - Resolution: Use `.array()` on column definition

---

## Phase 6: Admin DB Updates

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| Slice relations exported | 3 | 4 new exports in slice-relations.ts |
| User relations updated | 3 | 4 new OAuth relations in relations.ts |
| Session relations updated | 2 | 2 new OAuth relations in relations.ts |
| Old references removed | 1 | oauthApplication references removed |
| Verification passes | 1 | `bun run check --filter @beep/db-admin` succeeds |

---

## Phase 7: Migration

### Criteria (Max: 10 points)

| Criterion | Points | Description |
|-----------|--------|-------------|
| Migration generated | 2 | `bun run db:generate` succeeds |
| Migration reviewed | 2 | Tables/columns/FKs verified |
| Migration applied | 2 | `bun run db:migrate` succeeds |
| Build passes | 1 | `bun run build` succeeds |
| Lint passes | 1 | `bun run lint` succeeds |
| Full check passes | 1 | `bun run check` succeeds |
| Documentation complete | 1 | REFLECTION_LOG.md final entry |

---

## Overall Spec Completion

### Final Score Calculation

| Phase | Weight | Max Points |
|-------|--------|------------|
| Phase 1 | 1.0 | 10 |
| Phase 2 | 1.5 | 15 |
| Phase 3 | 1.5 | 15 |
| Phase 4 | 1.0 | 10 |
| Phase 5 | 1.0 | 10 |
| Phase 6 | 1.0 | 10 |
| Phase 7 | 1.0 | 10 |
| **Total** | - | **80** |

### Completion Grade

| Score | Grade | Status |
|-------|-------|--------|
| 72-80 | A | Exemplary completion |
| 64-71 | B | Complete with minor issues |
| 56-63 | C | Complete with known gaps |
| 48-55 | D | Partially complete |
| <48 | F | Incomplete |

---

## Self-Assessment Template

Use this template before each phase handoff:

```markdown
### Phase [N] Self-Assessment

**Score**: [X]/10

**Criteria Met**:
- [ ] Criterion 1: [status]
- [ ] Criterion 2: [status]
...

**Issues Found**:
- Issue 1: [description] - [resolved/pending]

**Confidence Level**: [High/Medium/Low]

**Ready for Handoff**: [Yes/No]
```
