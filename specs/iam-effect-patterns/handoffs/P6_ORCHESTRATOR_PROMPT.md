# Phase 6 Orchestrator Prompt: Reference Implementation

## Instructions

Copy the prompt below and use it to start Phase 6. This phase implements the canonical patterns and creates reference implementations.

---

## Prompt

```
Execute Phase 6 of the IAM Effect Patterns specification: Reference Implementation.

## Context

Read these files in order:
1. specs/iam-effect-patterns/PLAN.md - Detailed implementation plan
2. specs/iam-effect-patterns/handoffs/HANDOFF_P6.md - Phase 6 requirements
3. specs/iam-effect-patterns/outputs/pattern-proposals.md - Full code implementations
4. specs/iam-effect-patterns/outputs/pattern-review.md - Validation results
5. specs/iam-effect-patterns/REFLECTION_LOG.md - Prior learnings

## Implementation Steps

Execute in this exact order:

### Step 1: Enhance errors.ts

File: `packages/iam/client/src/_common/errors.ts`

1. Add import: `import * as Data from "effect/Data";`
2. Add after line 46:
   - BetterAuthResponseError (Data.TaggedError)
   - SessionExpiredError (Data.TaggedError)
   - InvalidCredentialsError (Data.TaggedError)
   - RateLimitedError (Data.TaggedError)
   - EmailVerificationRequiredError (Data.TaggedError)
   - HandlerError type union
3. Run: `bun run check --filter @beep/iam-client`

### Step 2: Create schema.helpers.ts

File: `packages/iam/client/src/_common/schema.helpers.ts`

1. Implement BetterAuthSuccessFrom transform
2. Re-export withFormAnnotations from common.annotations.ts
3. Run: `bun run check --filter @beep/iam-client`

### Step 3: Create handler.factory.ts

File: `packages/iam/client/src/_common/handler.factory.ts`

1. Implement createHandler with TypeScript overloads
2. Overload 1: With payload schema
3. Overload 2: Without payload schema
4. Run: `bun run check --filter @beep/iam-client`

### Step 4: Migrate sign-out handler

File: `packages/iam/client/src/core/sign-out/sign-out.handler.ts`

Replace with factory pattern:
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-out.contract.ts";

export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

### Step 5: Migrate sign-in-email handler

File: `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts`

Replace with factory pattern:
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-in-email.contract.ts";

export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

### Step 6: Final verification

Run all checks:
```bash
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
bun run build --filter @beep/iam-client
```

## Constraints

- All imports use namespace style: `import * as Effect from "effect/Effect"`
- No native array/string methods - use Effect utilities
- PascalCase Schema constructors: `S.Struct`, `S.String`
- Path aliases in examples: `@beep/*`

## Post-Completion

After implementation:
1. Run full verification commands
2. Update REFLECTION_LOG.md with Phase 6 learnings
3. Update README.md to mark Phase 6 complete
4. Create handoff document for Phase 7

## Optional Extensions (if time permits)

- Create atom.factory.ts
- Create state-machine.ts
- Create test files in __tests__/
```

---

## Expected Duration

60-90 minutes

## Phase 6 Success Criteria

| Metric | Target |
|--------|--------|
| errors.ts enhanced | Yes |
| schema.helpers.ts created | Yes |
| handler.factory.ts created | Yes |
| sign-out handler migrated | Yes |
| sign-in-email handler migrated | Yes |
| Type errors | 0 |
| Lint errors | 0 |
| Build success | Yes |
