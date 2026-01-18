# Quality Rubrics

Scoring criteria for transformation schema quality assessment.

---

## Overall Scoring

| Grade | Score Range | Description |
|-------|-------------|-------------|
| Excellent | 90-100 | Exceeds all requirements, production-ready |
| Good | 80-89 | Meets all requirements, minor improvements possible |
| Acceptable | 70-79 | Meets core requirements, some gaps |
| Needs Work | 60-69 | Missing key requirements |
| Failing | <60 | Major issues, requires rework |

**Passing Grade**: ≥80 points

---

## Schema Definition (30 points)

| Criteria | Points | Evidence |
|----------|--------|----------|
| Uses `S.Struct + S.Record` extension pattern | 10 | All Better Auth schemas follow `S.Struct({...}, S.Record({ key: S.String, value: S.Unknown }))` |
| All `additionalFields` enumerated | 10 | No fields missing from Options.ts configuration |
| Proper optionality (`S.optional` vs `S.optionalWith`) | 5 | Matches Better Auth nullability semantics |
| Annotations include description | 5 | `$I.annotations()` with meaningful description |

### Schema Definition Checklist

- [ ] `BetterAuthMemberSchema` captures all fields from BA response
- [ ] `BetterAuthInvitationSchema` captures all fields from BA response
- [ ] `BetterAuthOrganizationSchema` captures all fields from BA response
- [ ] `BetterAuthEmbeddedUserSchema` has exactly 4 fields (id, name, email, image)
- [ ] All schemas use `S.Record` extension for plugin passthrough
- [ ] All schemas have proper annotations

---

## Transformation Logic (40 points)

| Criteria | Points | Evidence |
|----------|--------|----------|
| ID validation uses branded type guards | 10 | Uses `EntityId.is()` method, not string prefix checking |
| Role field decoded to branded type | 5 | Uses `S.decode(MemberRole)` for validation |
| Date → DateTime conversion correct | 10 | Uses `toDate()` helper, preserves timezone |
| JSON field handling (permissions) | 5 | Uses `BS.JsonFromStringOption(PolicyRecord)` |
| Encode round-trip implemented | 10 | Both decode AND encode directions complete |

### Transformation Logic Checklist

- [ ] All ID fields validated with `EntityId.is()` guards
- [ ] `role` field decoded to `MemberRole` branded type
- [ ] `status` field preserves Better Auth value (not domain default)
- [ ] Date fields use `toDate()` helper for DateTime conversion
- [ ] `permissions` field uses JSON schema transformation
- [ ] Encode function reverses decode transformations
- [ ] Error messages include field context

---

## Test Coverage (30 points)

| Criteria | Points | Evidence |
|----------|--------|----------|
| ≥90% line coverage | 15 | Coverage report |
| All 13 test case categories covered | 15 | Test file inspection |

### Test Case Categories

Each transformation schema test file MUST include:

1. **Happy Path** (2 pts) - Valid BA response → valid domain model
2. **Default Application** (1 pt) - Missing optional fields → defaults applied
3. **ID Validation** (2 pts) - Invalid branded ID → descriptive error
4. **Date Handling** (2 pts) - Date objects → DateTime.Utc conversion
5. **Encode Round-Trip** (2 pts) - Domain → BA → Domain (equality)
6. **Extra Fields** (1 pt) - Unknown fields via S.Record → passed through
7. **Plugin Fields** (1 pt) - additionalFields → correctly extracted
8. **Configuration Errors** (1 pt) - Missing additionalFields → error
9. **Partial Responses** (1 pt) - Optional fields omitted → handled
10. **Malformed JSON** (0.5 pts) - Invalid permissions → ParseError
11. **Invalid Enum Values** (0.5 pts) - Bad role/status → ParseError
12. **Null vs Undefined** (0.5 pts) - Nullable fields → optional mapping
13. **Timezone Handling** (0.5 pts) - Local Date → UTC DateTime

---

## Code Quality Deductions

| Issue | Deduction |
|-------|-----------|
| Missing `S.Record` extension | -10 |
| Direct role assignment (type mismatch) | -5 |
| Using domain default for status | -5 |
| Missing encode function | -10 |
| Hardcoded ID format strings | -5 |
| Missing error context | -3 |
| No test coverage | -15 |
| Incomplete test categories | -1 per missing |

---

## Evaluation Procedure

### Step 1: Schema Definition Review

```bash
# Verify S.Record extension pattern
grep -A 3 "S.Record" packages/iam/client/src/_internal/member.schemas.ts

# Verify annotations
grep "annotations" packages/iam/client/src/_internal/member.schemas.ts
```

### Step 2: Transformation Logic Review

```bash
# Verify ID validation pattern
grep "EntityId.is" packages/iam/client/src/_internal/member.schemas.ts

# Verify role decoding
grep "S.decode.*MemberRole" packages/iam/client/src/_internal/member.schemas.ts
```

### Step 3: Test Coverage Check

```bash
# Run tests with coverage
bun run test --filter @beep/iam-client --coverage

# Check coverage report
cat packages/iam/client/coverage/lcov.info | grep -A 5 "member.schemas"
```

### Step 4: Calculate Score

1. Sum points from each category
2. Apply deductions for issues
3. Compare against passing grade (≥80)

---

## Example Scoring

### Excellent Implementation (95 points)

| Category | Score | Notes |
|----------|-------|-------|
| Schema Definition | 30/30 | All patterns followed |
| Transformation Logic | 35/40 | Minor: encode function could be more complete |
| Test Coverage | 30/30 | All categories covered, 94% line coverage |
| **Total** | **95/100** | **Excellent** |

### Needs Work Implementation (68 points)

| Category | Score | Notes |
|----------|-------|-------|
| Schema Definition | 20/30 | Missing S.Record extension on some schemas |
| Transformation Logic | 28/40 | Direct role assignment, missing encode |
| Test Coverage | 20/30 | Only 75% coverage, missing 5 test categories |
| **Total** | **68/100** | **Needs Work** |

---

## Remediation Guidance

### Missing S.Record Extension

```typescript
// WRONG
const BetterAuthMemberSchema = S.Struct({
  id: S.String,
  // ...
});

// CORRECT
const BetterAuthMemberSchema = S.Struct(
  {
    id: S.String,
    // ...
  },
  S.Record({ key: S.String, value: S.Unknown })
);
```

### Direct Role Assignment

```typescript
// WRONG (type mismatch)
role: ba.role,

// CORRECT (validates against branded type)
role: yield* S.decode(MemberRole)(ba.role),
```

### Missing Encode Function

```typescript
// INCOMPLETE
encode: Effect.fn(function* (member) {
  return { id: member.id };  // Missing fields
}),

// COMPLETE
encode: Effect.fn(function* (member) {
  return {
    id: member.id,
    organizationId: member.organizationId,
    userId: member.userId,
    role: member.role,
    createdAt: new Date(member.createdAt),
    status: member.status,
    // ... all fields
  };
}),
```
