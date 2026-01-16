# Phase 1 Orchestrator Prompt - Scratchpad Setup

## Your Mission

You are continuing the **Handler Factory Type Safety** specification. Phase 0 (Discovery) is complete. Your goal in Phase 1 is to set up an isolated scratchpad environment for safe experimentation.

## Summary of Chosen Approach

From Phase 0 research (`outputs/design-proposal.md`):

**Option B: Separate Internal Implementation Functions**

1. Define discriminated config interfaces (`ConfigWithPayload`, `ConfigNoPayload`)
2. Create type guard (`hasPayloadSchema`) that narrows union types
3. Extract `createHandlerWithPayload()` and `createHandlerNoPayload()` functions
4. Main implementation dispatches based on type guard
5. Public API (overloads) remains UNCHANGED

**Why this approach:**
- Effect Match CANNOT narrow generic type parameters (research finding)
- Separate functions allow each variant to have fully constrained types
- Type guard bridges runtime check to compile-time narrowing
- Zero API changes, zero breaking changes

## Phase 1 Tasks

### Task 1.1: Create Scratchpad Directory Structure

Create the following structure:

```
specs/handler-factory-type-safety/scratchpad/
├── src/
│   ├── handler.factory.ts      # Copy of current factory
│   ├── errors.ts               # Copy of error types
│   ├── common.types.ts         # Copy of common types
│   └── schema.helpers.ts       # Copy of schema helpers
├── handlers/
│   ├── sign-in-email.handler.ts   # With-payload example
│   ├── sign-in-email.contract.ts  # Contract schemas
│   ├── sign-out.handler.ts        # No-payload example
│   └── sign-out.contract.ts       # Contract schemas
├── tsconfig.json               # Isolated type checking
└── package.json                # Minimal package config
```

### Task 1.2: Copy Source Files

Copy these files to scratchpad:

| Source | Destination |
|--------|-------------|
| `packages/iam/client/src/_common/handler.factory.ts` | `scratchpad/src/handler.factory.ts` |
| `packages/iam/client/src/_common/errors.ts` | `scratchpad/src/errors.ts` |
| `packages/iam/client/src/_common/common.types.ts` | `scratchpad/src/common.types.ts` |
| `packages/iam/client/src/_common/schema.helpers.ts` | `scratchpad/src/schema.helpers.ts` |
| `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` | `scratchpad/handlers/sign-in-email.handler.ts` |
| `packages/iam/client/src/sign-in/email/sign-in-email.contract.ts` | `scratchpad/handlers/sign-in-email.contract.ts` |
| `packages/iam/client/src/core/sign-out/sign-out.handler.ts` | `scratchpad/handlers/sign-out.handler.ts` |
| `packages/iam/client/src/core/sign-out/sign-out.contract.ts` | `scratchpad/handlers/sign-out.contract.ts` |

### Task 1.3: Adjust Imports

Update imports in copied files to use relative paths:

```typescript
// Before (in handler.factory.ts)
import { client } from "@beep/iam-client/adapters";

// After (in scratchpad - create mock)
// Create a minimal mock or stub the client import
```

**Note**: The scratchpad needs to type-check in isolation. Create minimal mocks for:
- `client` from `@beep/iam-client/adapters`
- Any other external dependencies

### Task 1.4: Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false
  },
  "include": ["src/**/*.ts", "handlers/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Task 1.5: Verify Baseline

Before making any changes, verify the scratchpad type-checks:

```bash
cd specs/handler-factory-type-safety/scratchpad
npx tsc --noEmit
```

If errors occur, fix import/mock issues until baseline passes.

## Success Criteria for Phase 1

- [ ] Scratchpad directory structure created
- [ ] All source files copied
- [ ] Imports adjusted for isolation
- [ ] `tsconfig.json` configured
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Both handler examples (with/without payload) type-check

## Expected Challenges

1. **External Dependencies**
   - `@beep/iam-client/adapters` won't resolve in scratchpad
   - Solution: Create minimal mock that provides required types

2. **Schema Imports**
   - Handler contracts import from `@beep/schema` or `effect/Schema`
   - Solution: Effect is available via workspace, just adjust paths

3. **Effect.fn Typing**
   - Effect.fn has complex generic requirements
   - Solution: Ensure Effect package is accessible

## Files to Create

### scratchpad/src/adapters.mock.ts

```typescript
// Minimal mock for client dependency
export const client = {
  signIn: {
    email: async (_payload: unknown) => ({ data: {}, error: null }),
  },
  signOut: async () => ({ data: {}, error: null }),
  $store: {
    notify: (_signal: string) => {},
  },
};
```

## Handoff to Phase 2

After completing Phase 1, proceed directly to Phase 2 (Design) or Phase 3 (Implementation) since design proposal is already complete.

**Phase 2 can be skipped** - Design proposal is in `outputs/design-proposal.md`.

Proceed to Phase 3: Implement the type-safe factory in scratchpad following the design proposal.

## Verification Commands

```bash
# Verify scratchpad type-checks
cd specs/handler-factory-type-safety/scratchpad && npx tsc --noEmit

# Return to project root
cd /home/elpresidank/YeeBois/projects/beep-effect
```

## Reference Files

| File | Purpose |
|------|---------|
| `outputs/design-proposal.md` | Full implementation plan |
| `outputs/poc-approach.ts` | Working POC code |
| `outputs/call-site-analysis.md` | Handler usage patterns |
| `REFLECTION_LOG.md` | Phase 0 learnings |
