# Zero Email Client Port Specification

> Port Zero email client features from tRPC to @effect/rpc within the beep-effect comms slice.

---

## Problem Statement

The Zero email client (tmp/Zero) provides a comprehensive email management solution with:
- Gmail and Microsoft Outlook integration via OAuth
- AI-powered features (compose assist, auto-labeling "Brain", thread summaries, smart search)
- Full email lifecycle management (threads, drafts, labels, attachments)
- User customization (templates, notes, shortcuts, settings)

The goal is to port these features to beep-effect using Effect patterns, replacing:
- **tRPC** with `@effect/rpc` contracts and handlers
- **Zod schemas** with `effect/Schema` definitions
- **Drizzle ORM** with `@effect/sql/Model` entities and beep-effect table patterns
- **Imperative Promise chains** with Effect generators

---

## Scope

### In Scope

| Category | Features |
|----------|----------|
| **Email Core** | Thread listing, message retrieval, send/reply/forward, read/unread, star/archive/delete |
| **Drafts** | Create, get, list, delete, send draft |
| **Labels** | CRUD operations, modify thread labels, system labels (inbox, sent, spam, etc.) |
| **Connections** | OAuth flow (Gmail/Outlook), connection management, default connection |
| **Settings** | User preferences, hotkeys/shortcuts configuration |
| **Templates** | Email template CRUD |
| **Notes** | Thread annotation CRUD |
| **AI Features** | Compose assist, subject generation, smart search, web search, Brain (auto-labeling), summaries |
| **Attachments** | Upload, download, inline display |

### Out of Scope (Future Phases)

- Video meeting integration (meet router)
- BIMI brand identity display
- Cookie preferences management
- OAuth provider server (Zero acts as OAuth server)
- Writing style matrix ML training
- Real-time push notifications (Cloudflare Durable Objects specific)

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | Rapid onboarding, first-session setup |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full workflow coordination, phase gating |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Copy-paste prompts for each agent role |
| [RUBRICS.md](./RUBRICS.md) | Quality gates, acceptance checklists |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Learnings and corrections across sessions |
| [handoffs/](./handoffs/) | Session continuity documents |
| [phases/](./phases/) | Detailed phase specifications |
| [outputs/](./outputs/) | Generated artifacts and reports |

---

## Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| **Type Safety** | All RPC contracts pass `bun run check --filter @beep/comms-*` |
| **Feature Parity** | 16 tRPC routers ported to Effect RPC groups |
| **Test Coverage** | Each RPC handler has unit tests using `@beep/testkit` |
| **Driver Abstraction** | Email providers (Google, Microsoft) as Effect services with Layer composition |
| **AI Integration** | AI features use `@effect/ai` patterns |
| **Documentation** | AGENTS.md files for each comms package |

### Quantitative Acceptance Criteria

- [ ] **Zero `any` types** - `grep -r "any" packages/comms/*/src/ | wc -l` returns 0
- [ ] **Zero `@ts-ignore`** - `grep -r "@ts-ignore" packages/comms/*/src/ | wc -l` returns 0
- [ ] **All EntityIds branded** - No plain `S.String` for ID fields in domain models
- [ ] **100% RPC contract coverage** - All 16 tRPC routers have corresponding Effect RPC groups
- [ ] **Integration test coverage** - Each RPC endpoint has at least one integration test
- [ ] **<100ms P95 email send latency** - Measured via observability spans
- [ ] **Schema validation** - All external API responses decoded through Effect Schema
- [ ] **Resource safety** - All OAuth connections use `Effect.acquireRelease` patterns
- [ ] **Observability** - All public methods have `Effect.withSpan` annotations
- [ ] **Error typing** - All failure modes are `S.TaggedError` subclasses

### Phase-Specific Gates

| Phase | Gate Criteria |
|-------|---------------|
| P0 | `bun run check --filter @beep/comms-domain` passes, all EntityIds defined |
| P1 | Gmail/Outlook drivers compile, OAuth token refresh tested |
| P2 | mail, drafts, labels, connections RPC handlers have unit tests |
| P3 | templates, notes, shortcuts, settings RPC handlers have unit tests |
| P4 | AI features integrated with `@effect/ai`, compose assist working |
| P5 | All UI components render, VMs have integration tests |

---

## Phase Overview

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **P0** | Foundation | EntityIds, domain models, core tables, error types |
| **P1** | Email Drivers | Gmail/Outlook Effect services, OAuth token management |
| **P2** | Core Email RPC | mail, drafts, labels, connections routers |
| **P3** | User Features RPC | templates, notes, shortcuts, settings routers |
| **P4** | AI Features RPC | compose, brain, summaries, search routers |
| **P5** | UI Components | React components with VM pattern |

---

## Architecture

### Package Structure

```
packages/comms/
  domain/        # Entity models, value objects, EntityIds (EXISTING - extend)
  tables/        # Drizzle table definitions (CREATE)
  server/        # RPC handlers, email drivers (CREATE)
  client/        # Effect RPC client wrappers (CREATE)
  ui/            # React components with VMs (CREATE)
```

### Layer Dependency Graph

```
                     ┌─────────────────┐
                     │   CommsRpcs     │
                     │  (RPC Handlers) │
                     └────────┬────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │ MailService │    │ConnectionSvc│    │  AiService  │
    │  (Driver)   │    │  (OAuth)    │    │ (LLM Calls) │
    └──────┬──────┘    └──────┬──────┘    └─────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │GmailDriver  │    │ CommsDb     │
    │OutlookDriver│    │ (Repos)     │
    └─────────────┘    └─────────────┘
```

---

## Complexity Score

Using the spec guide complexity calculator:

```
Phase Count:       6 phases    x 2 = 12
Agent Diversity:   6 agents    x 3 = 18
Cross-Package:     4 packages  x 4 = 16
External Deps:     4 (Gmail, Outlook, AI, S3) x 3 = 12
Uncertainty:       3 (medium)  x 5 = 15
Research Required: 2 (Effect patterns known) x 2 = 4
────────────────────────────────────────────────────
Total Score:                         77 -> CRITICAL COMPLEXITY
```

**Recommendation**: Full spec structure with MASTER_ORCHESTRATION, phase handoffs, rubrics.

---

## Current State (Bootstrapped Slice)

The `packages/comms/` slice is partially bootstrapped:

### Existing (30-40%)

| Component | Status | Notes |
|-----------|--------|-------|
| `@beep/comms-domain` | EXISTS | EmailTemplate entity, MailValues, LoggingValues |
| `CommsEntityIds` | EXISTS | EmailTemplateId defined |
| `CommsDb` | EXISTS | Database service configured |
| `EmailTemplateRepo` | SCAFFOLDED | Type definition only |

### Missing (60-70%)

| Component | Status | Notes |
|-----------|--------|-------|
| `@beep/comms-tables` | MISSING | No table definitions |
| `@beep/comms-server` | MISSING | No RPC handlers |
| `@beep/comms-client` | MISSING | No client wrappers |
| `@beep/comms-ui` | MISSING | No React components |
| Email driver services | MISSING | Gmail/Outlook integration |
| Connection management | MISSING | OAuth flow handling |

---

## Key Patterns

### RPC Contract Pattern

```typescript
// packages/comms/domain/src/rpc/v1/mail/list-threads.ts
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/mail/list-threads");

export class Payload extends S.Class<Payload>($I`Payload`)({
  connectionId: CommsEntityIds.ConnectionId,
  folder: S.String,
  query: S.optional(S.String),
  maxResults: S.optional(S.Number),
  cursor: S.optional(S.String),
  labelIds: S.optional(S.Array(S.String)),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  threads: S.Array(ThreadSummary),
  nextPageToken: S.NullOr(S.String),
}) {}

export const Contract = Rpc.make("listThreads", {
  payload: Payload,
  success: Success,
});
```

### Email Driver Service Pattern

```typescript
// packages/comms/server/src/services/mail/MailDriver.ts
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export interface MailDriver {
  readonly listThreads: (params: ListThreadsParams) => Effect.Effect<ThreadsResponse, MailDriverError>;
  readonly getThread: (id: string) => Effect.Effect<ThreadResponse, MailDriverError>;
  readonly sendMail: (data: OutgoingMessage) => Effect.Effect<SendResult, MailDriverError>;
  // ... other methods
}

export const MailDriver = Context.GenericTag<MailDriver>("@beep/comms/MailDriver");

// Gmail implementation
export const GmailDriverLive = Layer.succeed(MailDriver, {
  listThreads: (params) => Effect.gen(function* () {
    // Gmail API calls
  }),
  // ...
});
```

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| [MAPPING.md](./MAPPING.md) | Zero tRPC to Effect RPC mapping |
| [phases/P0-foundation.md](./phases/P0-foundation.md) | EntityIds, models, tables |
| [phases/P1-email-drivers.md](./phases/P1-email-drivers.md) | Gmail/Outlook services |
| [phases/P2-core-email-rpc.md](./phases/P2-core-email-rpc.md) | mail, drafts, labels, connections |
| [phases/P3-user-features-rpc.md](./phases/P3-user-features-rpc.md) | templates, notes, shortcuts, settings |
| [phases/P4-ai-features-rpc.md](./phases/P4-ai-features-rpc.md) | AI compose, brain, summaries |
| [phases/P5-ui-components.md](./phases/P5-ui-components.md) | React components with VMs |
| `.claude/rules/effect-patterns.md` | Effect coding patterns |
| `packages/shared/domain/src/rpc/` | RPC contract examples |

---

## Agent Assignments

| Phase | Primary Agents | Purpose |
|-------|----------------|---------|
| P0 | `codebase-researcher`, `doc-writer` | Research existing patterns, create domain models |
| P1 | `mcp-researcher`, `effect-code-writer` | Research Effect HTTP client, implement drivers |
| P2-P4 | `test-writer`, `code-observability-writer` | Implement RPC handlers with tests |
| P5 | `architecture-pattern-enforcer`, `doc-writer` | VM pattern implementation, documentation |

---

## Getting Started

1. Read [MAPPING.md](./MAPPING.md) to understand the tRPC to Effect translation
2. Begin with [P0-foundation.md](./phases/P0-foundation.md) to establish domain models
3. Follow phase dependencies strictly (P0 -> P1 -> P2 -> P3 -> P4 -> P5)
4. Create handoff documents after each phase completion

---

## Verification Commands

```bash
# After each phase
bun run check --filter @beep/comms-*
bun run lint --filter @beep/comms-*
bun run test --filter @beep/comms-*

# Full verification
bun run check
bun run lint
bun run test
```

### Diagnostic Commands

```bash
# Check for any types in comms slice
grep -r "any" packages/comms/*/src/ | wc -l
# Expected: 0

# Check for @ts-ignore directives
grep -r "@ts-ignore" packages/comms/*/src/ | wc -l
# Expected: 0

# Check for plain S.String ID fields (should be EntityId)
grep -rn "id: S.String" packages/comms/*/src/
# Expected: no results

# Verify EntityId usage
grep -rn "CommsEntityIds\." packages/comms/*/src/ | wc -l
# Expected: >0 for each package

# Check RPC contract structure
find packages/comms/domain/src/rpc -name "*.ts" | wc -l
# Expected: 16+ (one per router)

# Verify test coverage exists
find packages/comms/*/test -name "*.test.ts" | wc -l
# Expected: matches number of services/handlers

# Check for proper error types
grep -rn "extends S.TaggedError" packages/comms/domain/src/
# Expected: one per error category

# Verify observability spans
grep -rn "Effect.withSpan" packages/comms/server/src/ | wc -l
# Expected: >0 for each public method
```

### Isolated Syntax Verification

When cascading type-check fails due to upstream errors:

```bash
# Check single file syntax (no dependency resolution)
bun tsc --noEmit --isolatedModules packages/comms/domain/src/path/to/file.ts

# Check package independently (if dependencies are stable)
cd packages/comms/domain && bun tsc --noEmit
```

---

## Context Budget

| Metric | Target | Notes |
|--------|--------|-------|
| **Handoff Document Size** | ≤4,000 tokens | Keeps agent context focused |
| **Phase Description** | ≤2,000 tokens | Single-phase working memory |
| **QUICK_START.md** | ≤1,500 tokens | Rapid onboarding |
| **Per-Agent Prompt** | ≤1,000 tokens | Copy-paste efficiency |

### Current Handoff Token Estimates

| Document | Words | Est. Tokens | Budget | Status |
|----------|-------|-------------|--------|--------|
| HANDOFF_P0.md | 1,011 | ~1,314 | ≤4,000 | ✅ |
| HANDOFF_P1.md | 1,329 | ~1,728 | ≤4,000 | ✅ |
| HANDOFF_P2.md | 1,685 | ~2,191 | ≤4,000 | ✅ |
| HANDOFF_P3.md | 981 | ~1,275 | ≤4,000 | ✅ |
| HANDOFF_P4.md | 1,221 | ~1,587 | ≤4,000 | ✅ |
| HANDOFF_P5.md | 1,838 | ~2,389 | ≤4,000 | ✅ |

*Token estimates use 1.3x word count multiplier. All handoffs within budget.*

### Measuring Current Size

```bash
# Estimate tokens (rough: words * 1.3)
wc -w specs/zero-email-port/handoffs/*.md | tail -1
# Multiply by 1.3 for token estimate

# Check individual handoff sizes
for f in specs/zero-email-port/handoffs/*.md; do
  echo "$f: $(wc -w < "$f") words (~$(($(wc -w < "$f") * 13 / 10)) tokens)"
done
```

### Context Optimization Guidelines

1. **Handoffs**: Include only actionable state, not history
2. **Phase docs**: Focus on deliverables, not explanations
3. **Agent prompts**: Terse instructions, link to details
4. **Reflection logs**: Numbered lessons, not narratives
