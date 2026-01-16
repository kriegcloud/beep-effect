# Full IAM Client Specification

**Status**: Phase 0 (Scaffolding)

## Purpose

Implement idiomatic Effect wrappers for ALL Better Auth client methods, applying patterns established in `iam-effect-patterns`. This spec systematically wraps every promise-based client method with Effect-first handlers.

## Target Features

| Feature | Better Auth Plugin | Priority |
|---------|-------------------|----------|
| Multi-session management | `multiSessionClient` | P1 |
| Password recovery | Core auth | P2 |
| Email verification | Core auth | P3 |
| Two-factor authentication | `twoFactorClient` | P4 |
| Organization management | `organizationClient` | P5 |
| Team management | `organizationClient` (teams) | P6 |

## Success Criteria

### Quantitative

- [ ] 100% of target Better Auth methods have Effect wrappers
- [ ] All session-mutating handlers call `$sessionSignal`
- [ ] All handlers check `response.error` before decoding
- [ ] Handler boilerplate reduced by 50%+ where factory applies
- [ ] Type coverage 100% (no `any` or `@ts-ignore`)

### Qualitative

- [ ] Consistent naming: `"{domain}/{feature}/handler"`
- [ ] All contracts follow pattern (Payload, Success schemas)
- [ ] Error messages are user-friendly
- [ ] AGENTS.md updated with recipes for each feature
- [ ] Test coverage for each handler

## Phase Overview

| Phase | Description | Status | Output |
|-------|-------------|--------|--------|
| 0 | Discovery & Audit | Pending | `outputs/method-inventory.md` |
| 1 | Multi-Session Implementation | Pending | `multi-session/*` handlers |
| 2 | Password Recovery | Pending | `password/*` handlers |
| 3 | Email Verification | Pending | `verification/*` handlers |
| 4 | Two-Factor Authentication | Pending | `two-factor/*` handlers |
| 5 | Organization Management | Pending | `organization/*` handlers |
| 6 | Team Management | Pending | `team/*` handlers |
| 7 | Integration Testing & Docs | Pending | E2E tests, AGENTS.md |

## Foundation from `iam-effect-patterns`

This spec builds on patterns from `iam-effect-patterns`:

### Handler Factory Pattern

```typescript
// ========================================
// MANDATORY EFFECT PATTERNS
// These patterns are REQUIRED, not optional
// See: .claude/rules/effect-patterns.md
// ========================================

// REQUIRED: Namespace imports (NOT named imports)
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Project imports
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

### Manual Handler Pattern (for edge cases)

```typescript
// ========================================
// MANDATORY EFFECT PATTERNS
// These patterns are REQUIRED, not optional
// See: .claude/rules/effect-patterns.md
// ========================================

// REQUIRED: Namespace imports (NOT named imports)
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Project imports
import { client } from "@beep/iam-client/adapters";
import { extractBetterAuthErrorMessage } from "@beep/iam-client/_common";
import { BetterAuthResponseError, IamError } from "../../_common/errors.ts";
import * as Contract from "./feature-name.contract.ts";

// Reference: packages/iam/client/src/sign-up/email/sign-up-email.handler.ts
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

### Critical Rules

**Authoritative Source**: [`.claude/rules/effect-patterns.md`](../../.claude/rules/effect-patterns.md)

These rules apply project-wide, not just this spec:

1. **Always check `response.error`** before decoding
2. **Notify `$sessionSignal`** after session-mutating operations
3. **Use namespace imports**: `import * as S from "effect/Schema"` (REQUIRED)
4. **Use PascalCase Schema constructors**: `S.String`, not `S.string` (REQUIRED)
5. **No native JS methods**: Use `A.map()`, not `array.map()` (REQUIRED)
6. **Use factory** for simple request/response patterns
7. **Use manual** for computed fields or different response shapes

## Directory Structure

```
specs/full-iam-client/
├── README.md                      # This overview
├── QUICK_START.md                 # 5-minute triage (start here)
├── MASTER_ORCHESTRATION.md        # Phase workflows & checkpoints
├── AGENT_PROMPTS.md               # Ready-to-use agent prompts
├── HANDOFF_CREATION_GUIDE.md      # Mandatory handoff requirements (READ BEFORE CREATING HANDOFFS)
├── RUBRICS.md                     # Evaluation criteria
├── REFLECTION_LOG.md              # Session learnings
├── outputs/
│   ├── spec-review.md             # Phase 0 spec review
│   ├── method-inventory.md        # Phase 0 output
│   └── ...
├── handoffs/
│   ├── HANDOFF_FROM_IAM_PATTERNS.md  # Context from prior spec
│   ├── P0_ORCHESTRATOR_PROMPT.md     # Phase 0 prompt
│   └── ...
└── templates/
    └── ...
```

## Quick Start

### For New Instances

1. Read [QUICK_START.md](./QUICK_START.md) for 5-minute triage
2. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md` for current phase
3. Read `handoffs/HANDOFF_FROM_IAM_PATTERNS.md` for context
4. Execute Phase 0: Discovery & Audit

### Key Reference Files

| File | Purpose |
|------|---------|
| `packages/iam/client/src/_common/handler.factory.ts` | Handler factory pattern |
| `packages/iam/client/src/_common/errors.ts` | Error hierarchy |
| `packages/iam/client/src/sign-in/email/` | Factory pattern example |
| `packages/iam/client/src/sign-up/email/` | Manual pattern example |
| `packages/iam/client/src/adapters/better-auth/client.ts` | Better Auth client config |
| **`tmp/better-auth/`** | **Better Auth source code (authoritative for response shapes)** |
| `tmp/better-auth/packages/better-auth/src/api/routes/{domain}.ts` | Route implementations (response shapes) |
| `tmp/better-auth/packages/better-auth/src/client/{domain}.test.ts` | Test files (usage examples) |

## Agents Used

| Agent | Phase | Purpose |
|-------|-------|---------|
| `codebase-researcher` | 0 | Audit Better Auth methods |
| `effect-code-writer` | 1-6 | Implement handlers |
| `doc-writer` | 7 | Update documentation |
| `test-writer` | 7 | Create test coverage |
| `reflector` | All | Log learnings |

## Implementation Scope

### In Scope

- Effect wrappers for all Better Auth client methods
- Contract schemas (Payload, Success) for each method
- Session signal notifications
- Error handling with typed errors
- AGENTS.md documentation

### Out of Scope

- Server-side Better Auth configuration
- Database/table layer changes
- UI components
- New Better Auth plugin development

## Related Documentation

- **[HANDOFF_CREATION_GUIDE.md](./HANDOFF_CREATION_GUIDE.md)** - **READ BEFORE CREATING HANDOFFS** (mandatory requirements)
- [HANDOFF_FROM_IAM_PATTERNS.md](./handoffs/HANDOFF_FROM_IAM_PATTERNS.md)
- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- [IAM Client AGENTS.md](../../packages/iam/client/AGENTS.md)
- [Effect Patterns](../../.claude/rules/effect-patterns.md)
