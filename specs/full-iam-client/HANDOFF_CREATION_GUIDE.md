# Handoff Creation Guide

> **CRITICAL**: This guide documents mandatory requirements for creating phase handoff documents based on learnings from Phase 0-2 execution.

---

## Purpose

Phase handoffs are the **primary context transfer mechanism** for multi-session spec execution. A high-quality handoff can save hours of debugging by providing accurate information upfront.

---

## Mandatory Requirements

### 1. Better Auth Source Verification (CRITICAL)

**Rule**: ALL response schemas MUST be verified against Better Auth source code. NEVER assume response shapes.

#### Source Location

Better Auth source code is cloned to `tmp/better-auth/`.

| What You Need | Where to Find It |
|---------------|------------------|
| Response shapes | `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts` |
| Usage examples | `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts` |
| Method signatures | `tmp/better-auth/packages/better-auth/src/client/index.ts` |
| Plugin methods | `tmp/better-auth/packages/better-auth/src/plugins/{plugin}/client.ts` |

#### Verification Process

For EACH method in the handoff:

1. **Locate route implementation**:
   ```bash
   # Example: password methods
   cat tmp/better-auth/packages/better-auth/src/api/routes/password.ts
   ```

2. **Extract exact response shape from `ctx.json()` calls**:
   ```typescript
   // Example from password.ts line 42:
   return ctx.json({
     status: true,
     message: "Password reset email sent"
   })
   ```

3. **Cross-reference with test files**:
   ```bash
   # Example: password tests
   cat tmp/better-auth/packages/better-auth/src/client/password.test.ts
   ```

   Test assertions show exact field structures:
   ```typescript
   expect(response.data).toEqual({
     status: true,
     message: expect.any(String)
   })
   ```

4. **Document ALL fields in handoff**:
   - Include ALL fields (don't omit `message`, `token`, nested objects)
   - Note `null` vs `undefined` distinctions
   - Note optional fields with `?` or `| undefined`
   - Include nested object structures
   - Include array element types

#### Common Mistakes

**WRONG** (Phase 2 example):
```typescript
// Assumed response shape (INCORRECT)
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,  // Missing 'message' field!
}) {}
```

**RIGHT** (Verified from source):
```typescript
// Verified from password.ts line 42 (CORRECT)
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  message: S.String,  // Field present in actual response
}) {}
```

---

### 2. CamelCase Path Conversion

**Rule**: Better Auth endpoint paths are converted to camelCase client method names.

| Endpoint Path | Client Method |
|---------------|---------------|
| `/request-password-reset` | `client.requestPasswordReset()` |
| `/reset-password` | `client.resetPassword()` |
| `/verify-email` | `client.verifyEmail()` |
| `/get-session` | `client.getSession()` |
| `/set-active` | `client.setActive()` |

**Document this pattern in handoffs** so implementers know how to find the correct client method.

---

### 3. Source File References

**Rule**: Include Better Auth source file references for each method.

#### Handoff Template Section

```markdown
## Better Auth Source Verification (MANDATORY)

**CRITICAL**: All response schemas in this handoff MUST be verified against Better Auth source code.

| Method | Route File | Test File | Verified |
|--------|-----------|-----------|----------|
| `requestPasswordReset` | `tmp/better-auth/packages/better-auth/src/api/routes/password.ts:42` | `tmp/better-auth/packages/better-auth/src/client/password.test.ts:15` | ✅ |
| `changePassword` | `tmp/better-auth/packages/better-auth/src/api/routes/password.ts:78` | `tmp/better-auth/packages/better-auth/src/client/password.test.ts:45` | ✅ |

**Verification Process**:
1. Located route implementation in `src/api/routes/password.ts`
2. Extracted exact response shape from `ctx.json()` calls
3. Cross-referenced with test assertions in `src/client/password.test.ts`
4. Documented ALL fields including optional/null fields
```

---

### 4. Response Shape Documentation

**Rule**: Document the EXACT response shape with source line reference.

#### Example

```markdown
### requestPasswordReset

**Client Method**: `client.requestPasswordReset()`

**Verified Response Shape** (from `password.ts` line 42):
```typescript
{
  status: boolean,
  message: string
}
```

**Success Schema**:
```typescript
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  message: S.String,
}) {}
```
```

---

### 5. Null vs Undefined Handling

**Rule**: Better Auth often uses `null` for optional fields. Document this distinction.

| Pattern | Schema Type |
|---------|-------------|
| Field is `null` or value | `S.NullOr(S.String)` |
| Field is `undefined` or value | `S.optional(S.String)` |
| Field can be `null` OR `undefined` | `S.optionalWith(S.String, { nullable: true })` |

#### Example from Phase 2

```typescript
// changePassword returns:
{
  token: string | null,  // Can be null
  user: { ... }
}

// Correct schema:
export class Success extends S.Class<Success>("Success")({
  token: S.NullOr(S.String),  // Use NullOr for nullable fields
  user: S.Struct({
    id: S.String,
    email: S.String,
    // ... other fields
  }),
}) {}
```

---

### 6. Nested Object Structures

**Rule**: When responses contain nested objects, document the complete structure.

#### Example

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
    image: S.NullOr(S.String),
    emailVerified: S.Boolean,
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

## Better Auth Source Verification (MANDATORY)

**CRITICAL**: All response schemas in this handoff have been verified against Better Auth source code.

| Method | Route File | Test File | Verified |
|--------|-----------|-----------|----------|
| `methodName` | `tmp/better-auth/.../routes/{domain}.ts:line` | `tmp/better-auth/.../client/{domain}.test.ts:line` | ✅ |

**Verification Process**:
1. Located route implementation in `src/api/routes/{domain}.ts`
2. Extracted exact response shape from `ctx.json()` calls
3. Cross-referenced with test assertions in `src/client/{domain}.test.ts`
4. Documented ALL fields including optional/null fields

---

## Methods to Implement

### [Feature Domain]

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| methodName | `client.methodName()` | `{ field: type }` | `{ data, error }` | Yes/No | Factory/Manual |

**CamelCase Conversion**:
- Endpoint: `/method-name` → Client: `client.methodName()`

---

## Schema Shapes

### method-name.contract.ts

**Client Method**: `client.methodName()`

**Verified Response Shape** (from `{domain}.ts` line [N]):
```typescript
{
  field1: type,
  field2: type | null,
  nestedObject: {
    field3: type
  }
}
```

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("{domain}/{feature}");

export class Payload extends S.Class<Payload>($I`Payload`)({
  field1: S.String,
  field2: S.optional(S.String),
}, $I.annotations("Payload", {
  description: "Payload description"
})) {}

export class Success extends S.Class<Success>($I`Success`)({
  field1: S.Boolean,
  field2: S.NullOr(S.String),  // Use NullOr for nullable fields
  nestedObject: S.Struct({
    field3: S.String,
  }),
}, $I.annotations("Success", {
  description: "Success description"
})) {}
```

---

## Implementation Order

1. [First method] - [Reason for order]
2. [Second method] - [Reason for order]
3. [Feature]/index.ts - Barrel file (create LAST)

---

## Verification Steps

After implementing each handler:

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint
bun run lint:fix --filter @beep/iam-client
```

---

## Known Issues & Gotchas

[Document issues discovered in previous phases that this phase should avoid]

---

## Success Criteria

Phase [N] is complete when:
- [ ] [N] handlers implemented
- [ ] All handlers use correct pattern (Factory/Manual)
- [ ] Session-mutating handlers have `mutatesSession: true`
- [ ] `{feature}/index.ts` barrel file exports all handlers
- [ ] Package `index.ts` exports `{Feature}` module
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with Phase [N] learnings
- [ ] HANDOFF_P[N+1].md created with verified schemas
```

---

## Verification Checklist for Handoff Authors

Before finalizing any handoff:

- [ ] **Every method's response shape verified from Better Auth source**
- [ ] **Source file references included** (route file + test file + line numbers)
- [ ] **ALL response fields documented** (no omissions)
- [ ] **Null vs undefined distinctions documented**
- [ ] **Nested objects fully structured** (no `S.Any`)
- [ ] **CamelCase conversion pattern documented**
- [ ] **Test file references included** for usage examples
- [ ] **Known gotchas from previous phases included**
- [ ] **Verification process documented in handoff**

---

## Anti-Patterns

### ❌ WRONG: Assuming Response Shapes

```markdown
## Methods to Implement

| Method | Returns |
|--------|---------|
| requestPasswordReset | `{ status: boolean }` |
```

**Problem**: No verification, missing fields.

### ✅ RIGHT: Verified Response Shapes

```markdown
## Methods to Implement

| Method | Returns (verified from password.ts:42) |
|--------|----------------------------------------|
| requestPasswordReset | `{ status: boolean, message: string }` |

**Source Verification**:
- Route: `tmp/better-auth/packages/better-auth/src/api/routes/password.ts:42`
- Test: `tmp/better-auth/packages/better-auth/src/client/password.test.ts:15`
```

**Solution**: Explicit verification with source references.

---

## Summary

**Golden Rule**: Never assume response shapes. Always verify from Better Auth source code.

**Key Files**:
- `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts` - Response shapes
- `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts` - Usage examples

**Core Principle**: A few extra minutes verifying response shapes during handoff creation saves hours of debugging during implementation.
