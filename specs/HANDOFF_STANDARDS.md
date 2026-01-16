# Handoff Standards

> **Project-wide standards for creating phase handoff documents in multi-session specifications.**

---

## Purpose

Phase handoffs are the **primary context transfer mechanism** for multi-session spec execution. A high-quality handoff can save hours of debugging by providing accurate information upfront.

This document establishes mandatory requirements based on learnings from completed specs (notably `full-iam-client`).

---

## When to Create Handoffs

| Spec Complexity | Handoff Required | Location |
|-----------------|------------------|----------|
| Simple (1 session) | No | N/A |
| Medium (2-3 sessions) | Yes | `specs/[name]/handoffs/HANDOFF_P[N].md` |
| Complex (4+ sessions) | Yes | `specs/[name]/handoffs/HANDOFF_P[N].md` |

**Rule**: Any spec spanning multiple Claude sessions MUST use handoffs to preserve context.

---

## Mandatory Requirements

### 1. External API Source Verification (CRITICAL)

**Rule**: ALL response schemas for external APIs MUST be verified against source code. NEVER assume response shapes.

#### Verification Process

For EACH external API method in the handoff:

1. **Locate route/endpoint implementation** in the external library's source code
2. **Extract exact response shape** from return statements
3. **Cross-reference with test files** for usage examples
4. **Document ALL fields** including optional/nullable fields

#### Documentation Format

```markdown
## Source Verification (MANDATORY)

| Method | Source File | Line | Test File | Verified |
|--------|-------------|------|-----------|----------|
| `methodName` | `path/to/routes.ts` | 42 | `path/to/tests.ts:15` | Y |

**Verification Process**:
1. Located implementation in `path/to/routes.ts`
2. Extracted exact response shape from return statements
3. Cross-referenced with test assertions
4. Documented ALL fields including optional/null fields
```

#### Common Mistakes

**WRONG** (assumed response):
```typescript
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,  // Missing 'message' field!
}) {}
```

**RIGHT** (verified from source):
```typescript
// Verified from routes.ts line 42
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  message: S.String,  // Field present in actual response
}) {}
```

---

### 2. Method Name Conventions

**Rule**: Document the naming convention used by the external API's client.

#### Common Patterns

| Pattern | Example | Client Method |
|---------|---------|---------------|
| Kebab-case endpoint | `/request-password-reset` | `client.requestPasswordReset()` |
| Snake-case endpoint | `/request_password_reset` | `client.request_password_reset()` |
| Nested plugin | `/plugin/method` | `client.plugin.method()` |

**Always document the conversion pattern** so implementers know how to find correct client methods.

---

### 3. Response Shape Documentation

**Rule**: Document the EXACT response shape with source line reference.

#### Template

```markdown
### methodName

**Client Method**: `client.methodName()`

**Verified Response Shape** (from `routes.ts` line 42):
```typescript
{
  field1: boolean,
  field2: string | null,
  nestedObject: {
    field3: string
  }
}
```

**Success Schema**:
```typescript
export class Success extends S.Class<Success>("Success")({
  field1: S.Boolean,
  field2: S.NullOr(S.String),
  nestedObject: S.Struct({
    field3: S.String,
  }),
}) {}
```
```

---

### 4. Null vs Undefined Handling

**Rule**: External APIs often use `null` for optional fields. Document this distinction.

| Pattern | Effect Schema |
|---------|---------------|
| Field is `null` or value | `S.NullOr(S.String)` |
| Field is `undefined` or value | `S.optional(S.String)` |
| Field can be `null` OR `undefined` | `S.optionalWith(S.String, { nullable: true })` |

**Example**:
```typescript
// API returns: { token: string | null, user: { ... } }

// Correct schema:
export class Success extends S.Class<Success>("Success")({
  token: S.NullOr(S.String),  // Use NullOr for nullable fields
  user: UserSchema,
}) {}
```

---

### 5. Nested Object Structures

**Rule**: When responses contain nested objects, document the complete structure.

**WRONG** (incomplete):
```typescript
export class Success extends S.Class<Success>("Success")({
  user: S.Any,  // Never use Any!
}) {}
```

**RIGHT** (complete):
```typescript
export class Success extends S.Class<Success>("Success")({
  user: S.Struct({
    id: S.String,
    email: S.String,
    name: S.NullOr(S.String),
    createdAt: S.Date,
    updatedAt: S.Date,
  }),
}) {}
```

---

## Handoff Template

Use this template for all phase handoffs:

```markdown
# Phase [N] Handoff: [Feature Name]

**Date**: YYYY-MM-DD
**From**: Phase [N-1] ([Previous Feature])
**To**: Phase [N] ([Current Feature])
**Status**: Ready for implementation

---

## Phase [N-1] Summary

[What was accomplished in previous phase]

### Key Learnings Applied

[Specific improvements made based on prior phase experience]

---

## Source Verification (MANDATORY)

**CRITICAL**: All response schemas have been verified against source code.

| Method | Source File | Line | Test File | Verified |
|--------|-------------|------|-----------|----------|
| `methodName` | `path/to/source.ts` | N | `path/to/test.ts:N` | Y |

**Verification Process**:
1. Located implementation in source files
2. Extracted exact response shape from return statements
3. Cross-referenced with test assertions
4. Documented ALL fields including optional/null fields

---

## Methods to Implement

### [Feature Domain]

| Method | Client Call | Parameters | Returns | Pattern |
|--------|-------------|------------|---------|---------|
| methodName | `client.methodName()` | `{ field: type }` | `{ data, error }` | Factory/Manual |

**Naming Convention**: [Document endpoint-to-method conversion]

---

## Schema Shapes

### method-name.contract.ts

**Client Method**: `client.methodName()`

**Verified Response Shape** (from `source.ts` line N):
```typescript
{
  field1: type,
  field2: type | null,
}
```

**Contract Implementation**:
```typescript
import * as S from "effect/Schema";

export class Payload extends S.Class<Payload>("Payload")({
  field1: S.String,
}) {}

export class Success extends S.Class<Success>("Success")({
  field1: S.Boolean,
  field2: S.NullOr(S.String),
}) {}
```

---

## Implementation Order

1. [First item] - [Reason for order]
2. [Second item] - [Reason]
3. [Feature]/index.ts - Barrel file (create LAST)

---

## Verification Steps

After implementing each handler:

```bash
bun run check --filter @beep/[package]
bun run lint:fix --filter @beep/[package]
```

---

## Known Issues & Gotchas

[Document issues discovered in previous phases that this phase should avoid]

---

## Success Criteria

Phase [N] is complete when:
- [ ] All handlers implemented
- [ ] Correct patterns used (Factory/Manual)
- [ ] Feature barrel file exports all handlers
- [ ] Package index.ts exports feature module
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P[N+1].md created (if more phases remain)
```

---

## Verification Checklist for Handoff Authors

Before finalizing any handoff:

- [ ] **Every method's response shape verified from source code**
- [ ] **Source file references included** (file + line numbers)
- [ ] **ALL response fields documented** (no omissions)
- [ ] **Null vs undefined distinctions documented**
- [ ] **Nested objects fully structured** (no `S.Any`)
- [ ] **Naming convention documented**
- [ ] **Test file references included** for usage examples
- [ ] **Known gotchas from previous phases included**
- [ ] **Verification process documented in handoff**

---

## Anti-Patterns

### Assuming Response Shapes

```markdown
## Methods to Implement

| Method | Returns |
|--------|---------|
| doSomething | `{ status: boolean }` |
```

**Problem**: No verification, missing fields.

**Solution**: Always include source verification with file:line references.

### Using S.Any for Complex Types

```typescript
export class Success extends S.Class<Success>("Success")({
  data: S.Any,  // NEVER do this
}) {}
```

**Problem**: Loses type safety, allows runtime errors.

**Solution**: Fully type all nested structures.

### Inconsistent Null Handling

```typescript
// Source returns: { value: string | null }
// Wrong schema:
value: S.optional(S.String)  // Wrong! This expects undefined
```

**Solution**: Match the exact nullability from the source code.

---

## Related Documentation

- [SPEC_CREATION_GUIDE](SPEC_CREATION_GUIDE.md) - Full spec creation workflow
- [Effect Patterns](../.claude/rules/effect-patterns.md) - Schema type selection guide
- [External API Integration](../documentation/patterns/external-api-integration.md) - API wrapper patterns

---

## Origin

This standard was promoted from `specs/full-iam-client/HANDOFF_CREATION_GUIDE.md` based on learnings from implementing 35+ handlers across 6 phases of the full-iam-client specification.
