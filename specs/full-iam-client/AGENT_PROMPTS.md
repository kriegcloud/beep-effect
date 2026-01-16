# Agent Prompts

> Ready-to-use prompts for agents working on `full-iam-client`.

---

## Phase 0: Discovery & Audit

### Codebase Researcher: Method Inventory

```
Research the Better Auth client configuration and available methods.

**CRITICAL**: Better Auth source code is cloned to `tmp/better-auth/`. This is the authoritative source for all method signatures and response shapes.

Target: packages/iam/client/src/adapters/better-auth/client.ts

Tasks:
1. List all enabled plugins and their client namespaces
2. For each plugin, catalog available methods with their signatures
3. Identify core auth methods (not from plugins) that are available
4. Check for: forgetPassword, resetPassword, changePassword, sendVerificationEmail, verifyEmail
5. **MANDATORY**: Verify response types from Better Auth source code (NOT assumptions)

Better Auth Source Reference:
- Response shapes: `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts`
- Usage examples: `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts`
- Method signatures: `tmp/better-auth/packages/better-auth/src/client/index.ts`

Verification Process for Each Method:
1. Locate route implementation in `src/api/routes/{domain}.ts`
2. Extract exact response shape from `ctx.json()` calls
3. Cross-reference with test assertions in `src/client/{domain}.test.ts`
4. Document ALL fields (don't omit `message`, `token`, nested objects)
5. Note `null` vs `undefined` distinctions

Output: A comprehensive method inventory including:
- Method name and namespace (e.g., client.multiSession.listDeviceSessions)
- Parameter types
- **Verified response shape from Better Auth source** (with source file reference)
- Whether response uses `null` or `undefined` for optional fields
- Whether it mutates session state

Focus on methods listed in the handoff:
- Multi-session: listDeviceSessions, setActiveSession, revokeDeviceSession, revokeSessions
- Two-factor: getTOTPURI, enable, disable, verifyTOTP, generateBackupCodes, verifyBackupCode
- Organization: create, update, delete, list, setActive, member operations
- Team: create, update, delete, list, member operations

**CamelCase Path Conversion**: Note that endpoint paths become camelCase client method names:
- `/request-password-reset` → `client.requestPasswordReset()`
- `/verify-email` → `client.verifyEmail()`
```

---

## Phase 1-6: Handler Implementation

### Effect Code Writer: Handler Template

```
Implement Effect handlers for [FEATURE] methods.

Context:
- Read packages/iam/client/src/_common/handler.factory.ts for factory pattern
- Read packages/iam/client/src/_common/errors.ts for error types
- Reference packages/iam/client/src/sign-in/email/ for factory pattern example
- Reference packages/iam/client/src/sign-up/email/ for manual pattern example

For each method, create:

1. Contract file (*.contract.ts):
   - Payload schema (if method takes parameters)
   - Success schema (decoded from response.data)
   - Use S.Struct with appropriate field types
   - Add form annotations for UI fields

2. Handler file (*.handler.ts):
   - Use factory pattern if:
     - Standard request/response shape
     - No computed fields in payload
   - Use manual pattern if:
     - Different response shape
     - Computed fields needed
     - Complex transformation logic

3. Index file (index.ts):
   - Export Handler
   - Export Payload and Success types
   - Export any additional types

========================================
MANDATORY EFFECT PATTERNS
These are REQUIRED, not optional
See: .claude/rules/effect-patterns.md
========================================

Critical rules:
- ALWAYS check response.error before decoding
- ALWAYS notify $sessionSignal for session-mutating operations
- REQUIRED: Namespace imports (import * as S from "effect/Schema")
- REQUIRED: PascalCase constructors (S.String, not S.string)
- REQUIRED: No native JS methods (use A.map not array.map)
- No any types or @ts-ignore

Pattern decision matrix:
| Condition | Pattern | Example |
|-----------|---------|---------|
| Simple request/response | Factory | client.signIn.email |
| No payload | Factory (no-payload) | client.signOut |
| Computed payload fields | Manual | sign-up/email (name computed) |
| Different response shape | Manual | get-session |
```

### Effect Code Writer: Contract Template

```
Create contract schemas for [METHOD_NAME] in [FEATURE] domain.

**MANDATORY**: Verify response shapes from Better Auth source code BEFORE creating schemas.

Better Auth Source Reference:
- Response shape: `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts`
- Test examples: `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts`

Verification Steps:
1. Locate route implementation in `src/api/routes/{domain}.ts`
2. Find the `ctx.json()` call that returns the response
3. Extract exact response shape (include ALL fields)
4. Cross-reference with test assertions in `src/client/{domain}.test.ts`

Better Auth method signature:
[PASTE METHOD SIGNATURE FROM INVENTORY]

**Verified Response Shape** (from source):
[PASTE EXACT RESPONSE SHAPE FROM BETTER AUTH SOURCE]

Create Payload schema:
- Mirror the parameter types from Better Auth
- Add S.annotations for form defaults where appropriate
- Use Redacted<string> for sensitive fields (passwords, tokens)
- Use S.UUID for ID fields

Create Success schema:
- **Use the VERIFIED response shape from Better Auth source** (NOT assumptions)
- Include ALL fields (don't omit `message`, `token`, nested objects)
- Use `S.NullOr()` for fields that can be `null`
- Use `S.optional()` for fields that can be `undefined`
- Handle nested objects with S.Struct
- Handle arrays with S.Array

Example structure:
```typescript
// ========================================
// MANDATORY EFFECT PATTERNS
// See: .claude/rules/effect-patterns.md
// ========================================

// REQUIRED: Namespace imports (NOT named imports)
import * as S from "effect/Schema";

// REQUIRED: PascalCase constructors (S.String, not S.string)
export class Payload extends S.Class<Payload>("Payload")({
  field1: S.String,
  field2: S.optional(S.String),
}) {}

// Success schema MUST match verified response shape from Better Auth source
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  message: S.String,  // Don't omit fields present in actual response
  token: S.NullOr(S.String),  // Use NullOr for nullable fields
}) {}
```
```

---

## Phase 7: Documentation

### Doc Writer: AGENTS.md Update

```
Update packages/iam/client/AGENTS.md with recipes for new handlers.

For each feature area implemented in this spec, add:

1. Feature overview section
2. Handler usage examples with Effect.gen
3. Common patterns (error handling, session management)
4. Type definitions for inputs/outputs
5. Gotchas specific to that feature

Feature areas to document:
- Multi-session management
- Password recovery flow
- Email verification flow
- Two-factor authentication (TOTP + backup codes)
- Organization management (CRUD + membership)
- Team management

Follow the existing AGENTS.md structure and style.
Use Effect patterns (namespace imports, no native methods).
Include both factory and manual pattern examples where relevant.
```

### Test Writer: Handler Tests

```
Create tests for [FEATURE] handlers.

Test file location: packages/iam/client/src/[feature]/__tests__/

For each handler, test:
1. Schema encoding (Payload)
2. Schema decoding (Success)
3. Error handling (BetterAuthResponseError)
4. Session signal notification (if mutatesSession)

Use @beep/testkit patterns:
- effect() for effectful tests
- layer() for layer composition
- scoped() for resource management

Example structure:
```typescript
// ========================================
// MANDATORY EFFECT PATTERNS
// See: .claude/rules/effect-patterns.md
// ========================================

import { describe, it, expect } from "vitest";
// REQUIRED: Namespace imports (NOT named imports)
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { effect } from "@beep/testkit";
import * as Contract from "../feature-name.contract.ts";

describe("FeatureName Contract", () => {
  describe("Payload", () => {
    it("encodes valid payload", () =>
      effect(
        Effect.gen(function* () {
          const encoded = yield* S.encode(Contract.Payload)({
            field: "value",
          });
          expect(encoded).toEqual({ field: "value" });
        })
      ));
  });
});
```
```

---

## Reflector: Phase Handoff

```
Generate handoff document for Phase [N] completion.

Review:
- REFLECTION_LOG.md entries for this phase
- Handlers implemented
- Tests created
- Issues encountered

Generate HANDOFF_P[N+1].md containing:

1. Phase [N] Summary
   - What was accomplished
   - Handlers implemented with pattern used
   - Issues encountered and resolutions

2. What Worked Well
   - Patterns that proved effective
   - Tools that helped
   - Approaches to replicate

3. What Needed Adjustment
   - Issues that required deviation from plan
   - Patterns that didn't fit
   - Improvements made mid-phase

4. Improved Prompts
   - Refined prompts based on learnings
   - More specific instructions
   - Additional context needed

5. Phase [N+1] Preparation
   - Methods to implement
   - Expected patterns to use
   - Known issues to watch for

Also generate P[N+1]_ORCHESTRATOR_PROMPT.md with ready-to-use
prompt for the next session.
```

---

## Quick Reference

### Pattern Selection

```
Use this prompt to determine handler pattern:

Method: [METHOD_NAME]
Parameters: [PARAM_TYPES]
Returns: [RETURN_TYPE]

Questions:
1. Does the method take parameters? (Yes: needs Payload schema)
2. Is the response { data, error } shape? (No: manual pattern)
3. Are there computed fields in the payload? (Yes: manual pattern)
4. Does it mutate session state? (Yes: mutatesSession: true)

Decision:
- Standard shape + no computed fields = Factory pattern
- Different shape OR computed fields = Manual pattern
```

### Error Handling Check

```
Before marking handler complete, verify:

1. [ ] response.error check exists:
   if (response.error !== null) {
     return yield* new BetterAuthResponseError({...});
   }

2. [ ] Session signal notification (if mutating):
   client.$store.notify("$sessionSignal");

3. [ ] Proper span name:
   Effect.fn("{domain}/{feature}/handler")

4. [ ] Type-safe decode:
   yield* S.decodeUnknown(Contract.Success)(response.data)
```
