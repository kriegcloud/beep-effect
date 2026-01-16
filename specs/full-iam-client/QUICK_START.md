# Quick Start

> 5-minute triage for `full-iam-client` spec

---

## What This Spec Does

Implements idiomatic Effect wrappers for ALL Better Auth client methods (multi-session, password recovery, 2FA, organizations, teams) using patterns from `iam-effect-patterns`.

## Current Status

| Phase | Name | Status | Output |
|-------|------|--------|--------|
| 0 | Discovery & Audit | **READY** | `outputs/method-inventory.md` |
| 1 | Multi-Session | Pending | `multi-session/*` handlers |
| 2 | Password Recovery | Pending | `password/*` handlers |
| 3 | Email Verification | Pending | `verification/*` handlers |
| 4 | Two-Factor Auth | Pending | `two-factor/*` handlers |
| 5 | Organization | Pending | `organization/*` handlers |
| 6 | Team | Pending | `team/*` handlers |
| 7 | Testing & Docs | Pending | E2E tests, AGENTS.md |

## Start Phase 0

**Copy-paste orchestrator prompt:**

```
Read the Phase 0 orchestrator prompt and execute:
specs/full-iam-client/handoffs/P0_ORCHESTRATOR_PROMPT.md
```

## Key Files

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Current phase instructions |
| 2 | `handoffs/HANDOFF_FROM_IAM_PATTERNS.md` | Context from prior spec |
| 3 | `MASTER_ORCHESTRATION.md` | Full phase workflows |
| 4 | `RUBRICS.md` | Evaluation criteria |

## Patterns Reference

### Handler Factory (simple cases)

```typescript
// ========================================
// MANDATORY EFFECT PATTERNS
// See: .claude/rules/effect-patterns.md
// ========================================

// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./feature-name.contract.ts";

export const Handler = createHandler({
  domain: "domain-name",
  feature: "feature-name",
  execute: (encoded) => client.someMethod(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

### Manual Handler (edge cases)

```typescript
// ========================================
// MANDATORY EFFECT PATTERNS
// See: .claude/rules/effect-patterns.md
// ========================================

// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { client } from "@beep/iam-client/adapters";
import { extractBetterAuthErrorMessage } from "@beep/iam-client/_common";
import { BetterAuthResponseError, IamError } from "../../_common/errors.ts";
import * as Contract from "./feature-name.contract.ts";

export const Handler = Effect.fn("domain/feature/handler")(function* (params: {
  readonly payload: Contract.Payload;
}) {
  const encoded = yield* S.encode(Contract.Payload)(params.payload);
  const response = yield* Effect.tryPromise({
    try: () => client.someMethod(encoded),
    catch: IamError.fromUnknown,
  });
  if (response.error !== null) {
    return yield* new BetterAuthResponseError({
      message: extractBetterAuthErrorMessage(response.error),
      code: response.error.code,
      status: response.error.status,
    });
  }
  client.$store.notify("$sessionSignal");
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

## Critical Rules

**Authoritative Source**: [`.claude/rules/effect-patterns.md`](../../.claude/rules/effect-patterns.md)

1. **Always check `response.error`** before decoding
2. **Notify `$sessionSignal`** after session-mutating operations
3. **REQUIRED: Namespace imports**: `import * as S from "effect/Schema"`
4. **REQUIRED: PascalCase**: `S.String`, not `S.string`
5. **REQUIRED: No native methods**: Use `A.map()`, not `array.map()`

## Verification Commands

```bash
# Handler count
find packages/iam/client/src -name "*.handler.ts" | wc -l

# Type check
bun run --filter @beep/iam-client check

# Lint check
bun run --filter @beep/iam-client lint
```

## After Completing a Phase

1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P[N+1].md` with:
   - What was accomplished
   - What worked/didn't work
   - Pattern improvements discovered
3. Create `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` optimized using lessons learned

## Links

- [README](./README.md) - Full overview
- [MASTER_ORCHESTRATION](./MASTER_ORCHESTRATION.md) - Detailed workflows
- [AGENT_PROMPTS](./AGENT_PROMPTS.md) - Ready-to-use prompts
- [RUBRICS](./RUBRICS.md) - Evaluation criteria
