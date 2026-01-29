# Liveblocks Lexical AI Integration Spec

> Production-ready integration of Liveblocks collaborative AI features with real authentication and Effect AI infrastructure.

---

## Overview

This spec defines the migration path from mock-authenticated, Vercel AI SDK-based collaborative AI features to production-ready implementation using real better-auth sessions and Effect AI patterns. The existing collaborative infrastructure (presence broadcasting, conflict detection, activity indicators) works correctly; this spec addresses authentication, AI provider, and observability gaps.

**Source Specs**: `specs/lexical-editor-ai-features` (phases 1-5)

### Key Objectives

1. **Real Authentication**: Wire Liveblocks auth to better-auth sessions (not mock database)
2. **Effect AI Migration**: Replace Vercel AI SDK with `@effect/ai-openai` for codebase consistency
3. **UI Completion**: Integrate activity indicators and conflict overlays into editor viewport
4. **Observability**: Add structured logging and E2E tests for multi-user scenarios

---

## Success Criteria

### Phase 1: Authentication
- [ ] Liveblocks auth endpoint retrieves real session from better-auth
- [ ] User ID, name, avatar sourced from authenticated session
- [ ] Unauthenticated requests return 401
- [ ] Session data flows correctly to Liveblocks presence
- [ ] Auth latency < 200ms

### Phase 2: Effect AI Migration
- [ ] `@effect/ai-openai` replaces `@ai-sdk/openai`
- [ ] Streaming uses Effect Stream patterns
- [ ] Server action uses Effect.gen, not async/await
- [ ] Error handling uses S.TaggedError
- [ ] First token latency < 2s

### Phase 3: UI Integration
- [ ] AiActivityIndicator component rendered in editor
- [ ] Visual overlay shows active AI operation region
- [ ] Floating panel uses @floating-ui for positioning
- [ ] Conflict warnings display when ranges overlap

### Phase 4: Testing & Observability
- [ ] E2E test for multi-user AI conflict detection
- [ ] Effect.log* structured logging in AI operations
- [ ] All code follows Effect patterns (no native methods)
- [ ] 3+ tabs show consistent presence state

### Acceptance Matrix

| Test | Criteria | Phase | Status |
|------|----------|-------|--------|
| Auth with valid session | Returns Liveblocks token with userInfo | P1 | [ ] |
| Auth with invalid session | Returns 401 Unauthorized | P1 | [ ] |
| Room connection | WebSocket established within 5 seconds | P1 | [ ] |
| Effect AI streaming | Effect Stream produces chunks | P2 | [ ] |
| TaggedError handling | AI errors use S.TaggedError | P2 | [ ] |
| Presence broadcast | Other users see presence update < 1s | P3 | [ ] |
| Conflict warning | UI shows warning for overlapping selection | P3 | [ ] |
| Activity indicator | Overlay visible during AI operations | P3 | [ ] |
| E2E multi-user | Automated test passes | P4 | [ ] |
| Structured logging | Effect.log* calls present | P4 | [ ] |

---

## Out of Scope

These items are explicitly **out of scope** for this spec:

| Non-Goal | Rationale |
|----------|-----------|
| Multi-turn conversation history | Future enhancement requiring chat state management |
| Custom prompt builder UI | Future enhancement for user-defined prompts |
| AI model selection in UI | Infrastructure concern, not collaboration feature |
| Offline AI operation queue | Requires significant additional architecture |
| Rate limiting per user | Infrastructure/billing concern |
| Cost tracking for AI operations | Analytics feature, separate spec |
| Full collaborative editing | Lexical + Yjs handles this already |
| Custom Liveblocks server | Using Liveblocks cloud infrastructure |
| Mobile optimization | Desktop-first for this iteration |

---

## Current State Analysis

### Working Components

| Component | Location | Status |
|-----------|----------|--------|
| LiveblocksProvider | `context/LiveblocksProvider.tsx` | Working - conditional RoomProvider wrapping |
| AiAssistantPlugin | `plugins/AiAssistantPlugin/index.tsx` | Working - orchestrates AI features |
| CollaborativeFloatingAiPanel | `components/CollaborativeFloatingAiPanel.tsx` | Working - multi-user aware UI |
| useCollaborativeAi | `hooks/useCollaborativeAi.ts` | Working - conflict detection via range overlap |
| useAiStreaming | `hooks/useAiStreaming.ts` | Working - Vercel AI SDK streaming |
| AiActivityIndicator | `components/AiActivityIndicator.tsx` | Working - displays collaborator AI usage |
| Presence schema | `liveblocks.config.ts` | Working - AiActivityPresence type |
| 10 predefined prompts | `prompts.ts` | Working - Improve, Simplify, Grammar, etc. |
| Three insertion modes | `types.ts` | Working - Replace, Inline, Below |

### Gap Analysis

| Gap | Current State | Required State | Phase | Impact |
|-----|---------------|----------------|-------|--------|
| Mock auth | Hard-coded user from `_database.ts` | Real session from better-auth | P1 | Blocking for production |
| Vercel AI SDK | `@ai-sdk/openai`, `@ai-sdk/rsc` | `@effect/ai-openai`, Effect patterns | P2 | Inconsistent with codebase |
| No observability | No logging in AI operations | Effect.log* structured logging | P4 | Debugging difficult |
| UI not integrated | AiActivityIndicator exists, not rendered | Visual overlay in editor viewport | P3 | UX incomplete |
| No E2E tests | Manual testing only | Automated multi-user conflict test | P4 | Regression risk |
| Native JS methods | Uses `.map()`, `.filter()` | Effect/Array utilities | P2 | Codebase inconsistency |

### Authentication Flow (Current)

```
Client Request
    |
    v
POST /api/liveblocks-auth
    |
    v
getSession(request) --> reads userId from JSON body
    |
    v
getUser(userId) --> looks up in mock _database.ts
    |
    v
liveblocks.prepareSession(user.id, { userInfo: user.info })
    |
    v
session.authorize() --> returns token
```

**Problem**: User data comes from mock database, not authenticated session.

### AI Streaming Flow (Current)

```
User selects text + picks prompt
    |
    v
CollaborativeFloatingAiPanel --> broadcasts presence { isGenerating, promptLabel, selectionRange }
    |
    v
useAiStreaming --> calls improveText server action
    |
    v
improveText() --> @ai-sdk/openai streamText()
    |
    v
createStreamableValue(result.textStream)
    |
    v
Client consumes stream --> inserts into editor
```

**Problem**: Uses Vercel AI SDK instead of Effect AI; async/await instead of Effect.gen.

---

## Phase Breakdown

### Phase 1: Real Authentication (Est. 1 session)

**Objective**: Wire Liveblocks auth endpoint to better-auth session.

**Tasks**:
1. Create auth utility to extract session from request cookies
2. Replace `getSession()` with better-auth session lookup
3. Map better-auth user fields to Liveblocks UserMeta (id, name, avatar, color)
4. Return 401 for unauthenticated requests
5. Handle session expiry gracefully
6. Remove mock `_database.ts` and `_example.ts`

**Deliverables**:
- Modified `apps/todox/src/app/api/liveblocks-auth/route.ts`
- New auth helper in `apps/todox/src/lib/liveblocks-auth.ts`
- Removed mock files

**Verification**:
```bash
bun run dev
# Sign in via UI, verify Liveblocks connection in browser console
# Verify presence shows real user name/avatar in second tab
curl -X POST http://localhost:3000/api/liveblocks-auth  # Should return 401
```

### Phase 2: Effect AI Migration (Est. 2 sessions)

**Objective**: Replace Vercel AI SDK with Effect AI patterns.

**Tasks**:
1. Create Effect-based AI service layer
2. Replace `@ai-sdk/openai` with `@effect/ai-openai`
3. Convert `improveText` server action to Effect.gen
4. Implement streaming via Effect Stream
5. Add S.TaggedError for AI operation errors
6. Create response schema for type-safe streaming
7. Update `useAiStreaming` to consume Effect streams
8. Replace native `.map()`, `.filter()` with Effect/Array

**Deliverables**:
- New `apps/todox/src/services/ai/TextImprovement.ts` service
- New `apps/todox/src/services/ai/errors.ts` tagged errors
- Modified `apps/todox/src/actions/ai.ts` using Effect patterns
- Modified `hooks/useAiStreaming.ts` consuming Effect streams

**Reference Patterns**:
```typescript
// Service definition
export class TextImprovementService extends Context.Tag(
  "TextImprovementService"
)<TextImprovementService, {
  readonly improve: (
    text: string,
    instruction: string
  ) => Stream.Stream<string, TextImprovementError>
}>() {}

// Error schema
export class TextImprovementError extends S.TaggedError<TextImprovementError>()(
  "TextImprovementError",
  { message: S.String, cause: S.optional(S.Unknown) }
) {}
```

**Verification**:
```bash
bun run check --filter @beep/todox
bun run lint --filter @beep/todox
# Manual: Test AI streaming in editor, verify first token < 2s
```

### Phase 3: UI Enhancements (Est. 1 session)

**Objective**: Integrate activity indicators and improve positioning.

**Tasks**:
1. Render AiActivityIndicator in editor container (Editor.tsx)
2. Add visual overlay highlighting AI operation region
3. Integrate @floating-ui for panel positioning
4. Display conflict warning when ranges overlap
5. Add loading states and progress indicators
6. CSS animations for overlay appearance

**Deliverables**:
- Modified `Editor.tsx` to render AiActivityIndicator
- New `components/AiOperationOverlay.tsx` for visual region
- Modified `CollaborativeFloatingAiPanel.tsx` with floating-ui
- CSS for overlay animations in `themes/`

**Verification**:
```bash
# Visual testing with two browser windows
# Verify overlay appears during AI operations
# Verify conflict warning displays on selection overlap
```

### Phase 4: Testing & Observability (Est. 1 session)

**Objective**: Add automated tests and structured logging.

**Tasks**:
1. Create E2E test for multi-user conflict detection
2. Add Effect.log* calls to AI service operations
3. Add span annotations for performance tracing
4. Create unit tests for conflict detection logic (useCollaborativeAi)
5. Measure and document streaming latency baseline

**Deliverables**:
- E2E test in `apps/todox/test/e2e/collaborative-ai.spec.ts`
- Unit tests in `apps/todox/test/plugins/AiAssistantPlugin/`
- Logging instrumentation in AI service layer
- Performance baseline documentation in `outputs/`

**Verification**:
```bash
bun run test --filter @beep/todox
bun run e2e --filter @beep/todox
# Check logs for structured AI operation events
```

---

## Reference Files

### Core Implementation (P1 Targets)

| File | Purpose |
|------|---------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Auth endpoint - primary P1 target |
| `apps/todox/src/app/api/liveblocks-auth/_example.ts` | Mock session helper - remove in P1 |
| `apps/todox/src/app/api/_database.ts` | Mock user database - remove in P1 |
| `apps/todox/liveblocks.config.ts` | Presence types (AiActivityPresence, UserMeta) |

### AI Infrastructure (P2 Targets)

| File | Purpose |
|------|---------|
| `apps/todox/src/actions/ai.ts` | Server action - migrate to Effect AI |
| `apps/todox/src/actions/liveblocks.ts` | Room management actions |
| `apps/todox/src/utils/liveblocks.ts` | Server-side Liveblocks utilities |

### Plugin Structure

| File | Purpose |
|------|---------|
| `plugins/AiAssistantPlugin/index.tsx` | Main plugin entry |
| `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Conflict detection logic |
| `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Stream consumption - P2 target |
| `plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | Multi-user UI |
| `plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx` | Activity display - P3 integration |
| `plugins/AiAssistantPlugin/prompts.ts` | 10 predefined AI prompts |
| `plugins/AiAssistantPlugin/types.ts` | InsertionMode, AiPrompt types |

### Auth Integration Reference

| File | Purpose |
|------|---------|
| `packages/iam/server/src/` | better-auth server integration |
| `packages/iam/server/AGENTS.md` | IAM server patterns |
| `apps/todox/src/lib/auth.ts` | App auth client (if exists) |

### Effect AI Reference

| File | Purpose |
|------|---------|
| `.context/ai-repo/` | Effect AI source code reference |
| `packages/*/src/services/` | Service layer patterns |
| `.claude/rules/effect-patterns.md` | Effect pattern requirements |

---

## Technology Stack

| Category | Current | Target |
|----------|---------|--------|
| **Auth** | Mock `_database.ts` | better-auth session via `@beep/iam-server` |
| **AI Provider** | `@ai-sdk/openai` | `@effect/ai-openai` |
| **Streaming** | `@ai-sdk/rsc` createStreamableValue | Effect Stream + `@effect/ai` |
| **Error Handling** | throw Error() | S.TaggedError |
| **Logging** | None | Effect.log* structured |
| **Testing** | Manual | @beep/testkit + Playwright |

### Infrastructure (Unchanged)

| Technology | Version | Purpose |
|------------|---------|---------|
| Liveblocks | @liveblocks/react, @liveblocks/node | Real-time collaboration |
| Lexical | @lexical/react | Rich text editor |
| Next.js | 16 (App Router) | Framework |
| @floating-ui | latest | Panel positioning (P3) |

---

## Verification Commands

```bash
# Type checking
bun run check --filter @beep/todox

# Linting
bun run lint --filter @beep/todox
bun run lint:fix --filter @beep/todox

# Unit tests
bun run test --filter @beep/todox

# E2E tests (after P4)
bun run e2e --filter @beep/todox

# Build verification
bun run build --filter @beep/todox

# Dev server
cd apps/todox && bun run dev

# Test auth endpoint (should return 401 without session)
curl -X POST http://localhost:3000/api/liveblocks-auth
```

---

## Complexity Assessment

| Factor | Value | Weight | Score | Notes |
|--------|-------|--------|-------|-------|
| Phases | 4 | x2 | 8 | P1-P4 clearly defined |
| Agents | 5 | x3 | 15 | codebase-researcher, code-reviewer, test-writer, doc-writer, reflector |
| Cross-Package | 2 | x4 | 8 | todox app + iam-server |
| External Dependencies | 3 | x3 | 9 | Liveblocks, OpenAI, better-auth |
| Uncertainty | 2 | x5 | 10 | Effect AI streaming patterns need research |
| Research Required | 2 | x2 | 4 | Effect AI docs, better-auth integration |
| **Total** | | | **54** | HIGH Complexity (41-60) |

**Risk Factors**:
- Effect AI streaming integration may have undocumented edge cases
- better-auth session extraction in API routes needs verification
- Real-time conflict detection timing sensitive

**Mitigation**:
- Reference implementation available in `.context/ai-repo/`
- Existing Vercel AI SDK code provides working baseline
- Phased approach allows early detection of blockers

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `.claude/rules/effect-patterns.md` | Effect pattern requirements |
| `specs/_guide/README.md` | Spec execution guide |
| `specs/_guide/HANDOFF_STANDARDS.md` | Handoff requirements |
| `packages/iam/server/AGENTS.md` | IAM server patterns |
| `specs/lexical-editor-ai-features/` | Previous AI features implementation |

---

## Getting Started

1. Read current implementation files listed in Reference Files
2. Review Effect AI patterns in `.context/ai-repo/`
3. Review better-auth integration in `packages/iam/server/`
4. Start with Phase 1 handoff:
   - Full context: `handoffs/HANDOFF_P1.md`
   - Quick start prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
