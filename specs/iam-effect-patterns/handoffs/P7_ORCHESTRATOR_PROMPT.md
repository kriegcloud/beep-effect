# Phase 7 Orchestrator Prompt: Documentation & Remaining Migrations

## Instructions

Copy the prompt below and use it to start Phase 7. This phase migrates remaining handlers and updates documentation.

---

## Prompt

```
Execute Phase 7 of the IAM Effect Patterns specification: Documentation & Remaining Migrations.

## Context

Read these files in order:
1. specs/iam-effect-patterns/PLAN.md - Detailed implementation plan
2. specs/iam-effect-patterns/handoffs/HANDOFF_P7.md - Phase 7 requirements
3. specs/iam-effect-patterns/REFLECTION_LOG.md - Phase 6 learnings
4. packages/iam/client/src/_common/handler.factory.ts - Reference implementation

## Implementation Steps

Execute in this exact order:

### Step 1: Migrate get-session handler

File: `packages/iam/client/src/core/get-session/get-session.handler.ts`

Replace with factory pattern:
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./get-session.contract.ts";

/**
 * Handler for getting the current session.
 *
 * Features:
 * - Properly checks for Better Auth errors before decoding response
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "core/get-session/handler"
 */
export const Handler = createHandler({
  domain: "core",
  feature: "get-session",
  execute: () => client.getSession(),
  successSchema: Contract.Success,
  mutatesSession: false,
});
```

Run: `bun run check --filter @beep/iam-client`

### Step 2: Migrate sign-up/email handler

File: `packages/iam/client/src/sign-up/email/sign-up-email.handler.ts`

Replace with factory pattern:
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-up-email.contract.ts";

/**
 * Handler for signing up with email and password.
 *
 * Features:
 * - Automatically encodes payload before sending to Better Auth
 * - Properly checks for Better Auth errors before decoding response
 * - Notifies $sessionSignal after successful sign-up
 * - Uses consistent span naming: "sign-up/email/handler"
 */
export const Handler = createHandler({
  domain: "sign-up",
  feature: "email",
  execute: (encoded) => client.signUp.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

Run: `bun run check --filter @beep/iam-client`

### Step 3: Update IAM Client AGENTS.md

File: `packages/iam/client/AGENTS.md`

Add new section after "Quick Recipes":

```markdown
### Create a handler with the factory pattern

The handler factory (`createHandler`) reduces boilerplate and ensures consistent patterns:

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./my-feature.contract.ts";

// With payload (sign-in, sign-up)
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// Without payload (sign-out, get-session)
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

**Benefits:**
- Auto-generates Effect.fn span name: `"{domain}/{feature}/handler"`
- Properly checks `response.error` before decoding
- Notifies `$sessionSignal` when `mutatesSession: true`
- Reduces handler code from ~20 lines to ~8 lines
```

Add to "Gotchas" section:

```markdown
### Handler Factory Configuration

- **`mutatesSession` flag**: MUST be `true` for sign-in, sign-out, sign-up, verify, passkey, social. Controls `$sessionSignal` notification.
- **`execute` function**: Receives encoded payload (not decoded). Do NOT call `S.encode` manually.
- **Error handling**: Factory automatically checks `response.error`. Do NOT add manual error checks.
- **Span naming**: Factory generates `"{domain}/{feature}/handler"`. Match your directory structure.
```

### Step 4: Export new helpers from _common/index.ts

File: `packages/iam/client/src/_common/index.ts`

Add exports:
```typescript
export * from "./handler.factory.ts";
export * from "./schema.helpers.ts";
```

### Step 5: Final verification

Run all checks:
```bash
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
bunx turbo run build --filter @beep/iam-client
```

## Constraints

- All imports use namespace style: `import * as Effect from "effect/Effect"`
- No native array/string methods - use Effect utilities
- PascalCase Schema constructors: `S.Struct`, `S.String`
- Path aliases in examples: `@beep/*`

## Post-Completion

After implementation:
1. Run full verification commands
2. Update REFLECTION_LOG.md with Phase 7 learnings
3. Update README.md to mark Phase 7 complete
4. Create handoff document for Phase 8 if additional work is needed

## Optional Extensions (if time permits)

- Create `atom.factory.ts` for mutation atom boilerplate reduction
- Create test files for handler factory
- Migrate additional handlers (passkey, social, etc.)

## Next Phase Setup

IMPORTANT: After completing Phase 7, you MUST:
1. Update README.md to mark Phase 7 complete
2. Assess if additional phases are needed
3. If Phase 8 is needed, create:
   - `specs/iam-effect-patterns/handoffs/HANDOFF_P8.md`
   - `specs/iam-effect-patterns/handoffs/P8_ORCHESTRATOR_PROMPT.md`
4. Update REFLECTION_LOG.md with final learnings

If all handlers are migrated and documentation is complete, the spec is DONE.
```

---

## Expected Duration

45-60 minutes

## Phase 7 Success Criteria

| Metric | Target |
|--------|--------|
| get-session handler migrated | Yes |
| sign-up/email handler migrated | Yes |
| AGENTS.md updated with factory pattern | Yes |
| _common/index.ts exports updated | Yes |
| Type errors | 0 |
| Lint errors | 0 |
| Build success | Yes |
