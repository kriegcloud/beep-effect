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

### Phase 2: Real Session Integration
- [ ] Liveblocks auth endpoint retrieves real session from better-auth
- [ ] User ID, name, avatar sourced from authenticated session
- [ ] Unauthenticated requests return 401
- [ ] Session data flows correctly to Liveblocks presence
- [ ] Auth latency < 200ms

### Phase 3: AI Streaming Verification
- [ ] Effect Stream produces chunks with @effect/ai-openai
- [ ] Server action uses Effect.gen, not async/await
- [ ] Error handling uses S.TaggedError + Effect.catchTag
- [ ] Streaming latency verified in browser console
- [ ] First token latency < 2s

### Phase 3.5: Browser Testing & Error Fixing
- [ ] Lexical version mismatch error resolved
- [ ] Editor loads without runtime errors
- [ ] AI panel opens and displays prompts
- [ ] AI streaming works (tokens appear progressively)
- [ ] First token latency < 2s verified via browser
- [ ] AiActivityOverlay shows collaborator AI activity
- [ ] Conflict warning displays for overlapping selections
- [ ] No console error-level messages
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes

### Phase 4: Effect AI Migration
- [ ] `@effect/ai-openai` replaces `@ai-sdk/openai`
- [ ] LLM Layer follows pattern from `@beep/knowledge-server`
- [ ] Error handling uses S.TaggedError + catchTag flows
- [ ] UI streaming consumes Effect Stream correctly
- [ ] All AI operations follow Effect patterns (no native methods)

### Phase 5: Testing & Observability (Optional)
- [ ] E2E test for multi-user AI conflict detection
- [ ] Effect.log* structured logging in AI operations
- [ ] Span annotations for performance tracing
- [ ] 3+ tabs show consistent presence state

### Acceptance Matrix

| Test | Criteria | Phase | Status |
|------|----------|-------|--------|
| Auth with valid session | Returns Liveblocks token with userInfo | P2 | [ ] |
| Auth with invalid session | Returns 401 Unauthorized | P2 | [ ] |
| Room connection | WebSocket established within 5 seconds | P2 | [ ] |
| Effect AI streaming | Effect Stream produces chunks | P3 | [ ] |
| TaggedError handling | AI errors use S.TaggedError + catchTag | P3 | [ ] |
| Streaming latency (console) | First token < 2s, verified in console | P3 | [ ] |
| Lexical version alignment | All @lexical/* packages identical version | P3.5 | [ ] |
| Editor loads without errors | No runtime errors on page load | P3.5 | [ ] |
| Editor renders correctly | Lexical content editable area visible | P3.5 | [ ] |
| Console clean | No error-level messages | P3.5 | [ ] |
| AI panel interaction | Panel opens, prompts display | P3.5 | [ ] |
| Streaming latency (browser) | First token < 2s via browser test | P3.5 | [ ] |
| AiActivityOverlay renders | Collaborator activity visible in multi-tab | P3.5 | [ ] |
| Conflict detection multi-tab | Warning displays for overlapping selections | P3.5 | [ ] |
| Effect AI migration | @effect/ai-openai integrated with LLM Layer | P4 | [ ] |
| Pattern compliance | All AI operations follow Effect patterns | P4 | [ ] |
| E2E multi-user | Automated test passes | P5 | [ ] |
| Structured logging | Effect.log* calls present | P5 | [ ] |

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
| Mock auth | Hard-coded user from `_database.ts` | Real session from better-auth | P2 | Blocking for production |
| Vercel AI SDK | `@ai-sdk/openai`, `@ai-sdk/rsc` | `@effect/ai-openai`, Effect patterns | P4 | Inconsistent with codebase |
| No observability | No logging in AI operations | Effect.log* structured logging | P5 | Debugging difficult |
| UI not integrated | AiActivityIndicator exists, not rendered | Visual overlay in editor viewport | P3 | UX incomplete |
| No E2E tests | Manual testing only | Automated multi-user conflict test | P5 | Regression risk |
| Native JS methods | Uses `.map()`, `.filter()` | Effect/Array utilities | P4 | Codebase inconsistency |

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

### Phase 1: Infrastructure Verification (Est. 0.5 session)

**Objective**: Verify existing collaborative infrastructure works correctly.

**Tasks**:
1. Confirm LiveblocksProvider mounts correctly with conditional RoomProvider
2. Verify presence schema (`AiActivityPresence`, `UserMeta`) is properly typed
3. Confirm mock auth endpoint responses structure
4. Verify Lexical editor + AiAssistantPlugin orchestration
5. Document baseline streaming behavior with Vercel AI SDK

**Deliverables**:
- Verified integration baseline
- Test results in `outputs/baseline-verification.md`

**Verification**:
```bash
bun run dev
# Verify Liveblocks connects (check browser console for room connection)
# Verify presence updates in two tabs
# Verify AI streaming works (mock auth sufficient)
```

### Phase 2: Real Session Integration (Est. 1 session)

**Objective**: Wire Liveblocks auth endpoint to better-auth session.

**Tasks**:
1. Create auth utility to extract session from request cookies
2. Replace mock `getSession()` with better-auth session lookup
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

### Phase 3: AI Streaming Verification (Est. 1 session)

**Objective**: Verify Effect Stream patterns work with real-time streaming.

**Tasks**:
1. Confirm Vercel AI SDK streaming produces correct output structure
2. Measure first-token latency (baseline for P4 comparison)
3. Verify presence broadcasting during AI operations works
4. Confirm conflict detection triggers correctly
5. Document streaming behavior for P4 migration reference

**Deliverables**:
- Baseline streaming performance report in `outputs/`
- Verified conflict detection logic

**Verification**:
```bash
bun run dev
# Test AI streaming with multiple tabs
# Measure first-token latency in browser console
# Verify conflict warnings appear on overlapping selections
```

### Phase 3.5: Browser Testing & Error Fixing (Est. 0.5 session)

**Objective**: Fix runtime errors blocking browser testing and validate all features work via browser automation.

**Tasks**:
1. Diagnose and fix Lexical version mismatch error (critical blocker)
2. Use `claude-in-chrome` MCP for automated browser testing
3. Verify editor loads without console errors
4. Test AI panel interactions and streaming
5. Validate AiActivityOverlay renders correctly
6. Test multi-tab presence broadcasting and conflict detection
7. Fix any runtime errors discovered during browser testing

**Deliverables**:
- Fixed `package.json` with aligned Lexical versions
- Browser test results in `outputs/p3.5-browser-tests.md`
- All runtime errors resolved
- Screenshots/GIFs of successful feature validation

**Critical Blocker**:
```
HeadingNode (type heading) does not subclass LexicalNode from the lexical package
used by this editor (version <unknown>). All lexical and @lexical/* packages used
by an editor must have identical versions.

Location: apps/todox/src/app/lexical/App.tsx:127
```

**Resolution Steps**:
1. Analyze `bun.lock` for multiple Lexical version resolutions
2. Check `package.json` files for version inconsistencies
3. Align all `@lexical/*` packages to same exact version
4. Run `bun install` to regenerate lock file
5. Clear dev server cache and verify editor loads

**MCP Tools**:
- `claude-in-chrome` for browser automation and testing
- `next-devtools` for console error monitoring

**Verification**:
```bash
bun run dev
# Navigate to http://localhost:3000/lexical
# Use claude-in-chrome MCP to:
#   - Check console for errors
#   - Interact with editor
#   - Test AI features
#   - Verify overlay rendering
```

### Phase 4: Effect AI Migration (Est. 2 sessions)

**Objective**: Replace Vercel AI SDK with `@effect/ai-openai` and follow Effect patterns.

**Tasks**:
1. Install `@effect/ai` and `@effect/ai-openai` dependencies
2. Create Effect-based AI service layer with LLM Layer pattern
3. Replace `@ai-sdk/openai` with `@effect/ai-openai`
4. Convert `improveText` server action to Effect.gen syntax
5. Implement streaming via Effect Stream patterns
6. Add S.TaggedError for AI operation errors with catchTag handlers
7. Create response schema for type-safe streaming
8. Update `useAiStreaming` hook to consume Effect streams
9. Replace native `.map()`, `.filter()` with Effect/Array utilities
10. Verify pattern compliance with `.claude/rules/effect-patterns.md`

**Deliverables**:
- New `apps/todox/src/services/ai/TextImprovement.ts` service with LLM Layer
- New `apps/todox/src/services/ai/errors.ts` with S.TaggedError definitions
- Modified `apps/todox/src/actions/ai.ts` using Effect.gen patterns
- Modified `hooks/useAiStreaming.ts` consuming Effect streams
- Updated `services/ai/` layer composition following `@beep/knowledge-server`

**Reference Patterns** (from `@beep/knowledge-server`):
```typescript
// LLM Layer definition
export const TextImprovementLive = Layer.succeed(
  TextImprovementService,
  TextImprovementService.of({
    improve: (text, instruction) =>
      Effect.gen(function* () {
        const llm = yield* LanguageModel;
        return yield* llm.stream.text(prompt);
      })
  })
);

// Error handling
export class TextImprovementError extends S.TaggedError<TextImprovementError>()(
  "TextImprovementError",
  { message: S.String, code: S.optional(S.String) }
) {}

// Server action
export const improveText = async (payload) =>
  Effect.gen(function* () {
    const service = yield* TextImprovementService;
    return yield* service.improve(text, instruction).pipe(
      Effect.catchTag("TextImprovementError", handler)
    );
  }).pipe(Effect.provide(TextImprovementLive))
    .pipe(Effect.runPromise);
```

**Verification**:
```bash
bun run check --filter @beep/todox
bun run lint --filter @beep/todox
# Manual: Test AI streaming in editor
# Verify first token latency < 2s (compare to P3 baseline)
# Verify error handling with invalid prompts
```

### Phase 5: Testing & Observability (Optional, Est. 1 session)

**Objective**: Add automated tests and structured logging.

**Tasks**:
1. Create E2E test for multi-user conflict detection
2. Add Effect.log* calls to AI service operations
3. Add span annotations for performance tracing
4. Create unit tests for conflict detection logic (useCollaborativeAi)
5. Document P4 performance improvements vs Vercel AI SDK

**Deliverables**:
- E2E test in `apps/todox/test/e2e/collaborative-ai.spec.ts`
- Unit tests in `apps/todox/test/plugins/AiAssistantPlugin/`
- Logging instrumentation in AI service layer
- Performance comparison report in `outputs/`

**Verification**:
```bash
bun run test --filter @beep/todox
bun run e2e --filter @beep/todox
# Check logs for structured AI operation events
```

---

## Reference Files

### Infrastructure Verification (P1 Targets)

| File | Purpose |
|------|---------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Current auth endpoint with mock data |
| `apps/todox/liveblocks.config.ts` | Presence types (AiActivityPresence, UserMeta) |
| `apps/todox/src/app/api/_database.ts` | Mock database baseline |

### Real Session Integration (P2 Targets)

| File | Purpose |
|------|---------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Auth endpoint - wire to better-auth |
| `apps/todox/src/lib/liveblocks-auth.ts` | NEW - Auth helper with session extraction |
| `apps/todox/src/app/api/_database.ts` | REMOVE - Mock database |

### AI Streaming & Effect AI (P3-P4 Targets)

| File | Purpose |
|------|---------|
| `apps/todox/src/actions/ai.ts` | Server action - migrate to Effect.gen (P4) |
| `apps/todox/src/services/ai/TextImprovement.ts` | NEW - Effect AI service with LLM Layer (P4) |
| `apps/todox/src/services/ai/errors.ts` | NEW - S.TaggedError definitions (P4) |
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
| Phases | 5 | x2 | 10 | P1-P5 with P5 optional |
| Agents | 5 | x3 | 15 | codebase-researcher, code-reviewer, test-writer, doc-writer, reflector |
| Cross-Package | 2 | x4 | 8 | todox app + iam-server + knowledge-server (reference) |
| External Dependencies | 3 | x3 | 9 | Liveblocks, OpenAI, better-auth |
| Uncertainty | 1 | x5 | 5 | Effect AI patterns documented in `@beep/knowledge-server` |
| Research Required | 1 | x2 | 2 | LLM Layer pattern reference available |
| **Total** | | | **49** | HIGH Complexity (41-60) |

**Risk Factors**:
- better-auth session extraction in API routes needs verification
- Real-time conflict detection timing sensitive
- LLM Layer pattern must match `@beep/knowledge-server` conventions

**Mitigation**:
- Reference implementation: `@beep/knowledge-server` for LLM Layer pattern
- Existing Vercel AI SDK code provides working baseline
- Phased approach allows early detection of blockers
- P1 infrastructure verification provides fast feedback loop

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
2. Review Effect AI patterns in `@beep/knowledge-server` for LLM Layer reference
3. Review better-auth integration in `packages/iam/server/`
4. Start with Phase 1 handoff:
   - Full context: `handoffs/HANDOFF_P1.md`
   - Quick start prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
5. Progress through phases:
   - **P1-P3**: Sequential delivery of infrastructure → streaming verification
   - **P3.5 (NEW)**: Browser testing & error fixing using MCP tools (fixes Lexical version mismatch)
   - **P4**: Main implementation using Effect AI patterns from `@beep/knowledge-server`
   - **P5 (optional)**: Testing and observability enhancements
6. Handoff files available:
   - `handoffs/HANDOFF_P2.md` → P2_ORCHESTRATOR_PROMPT.md
   - `handoffs/HANDOFF_P3.md` → P3_ORCHESTRATOR_PROMPT.md
   - `handoffs/HANDOFF_P3.5.md` → P3.5_ORCHESTRATOR_PROMPT.md (NEW)
   - `handoffs/HANDOFF_P4.md` → P4_ORCHESTRATOR_PROMPT.md
   - `handoffs/HANDOFF_P5.md` → P5_ORCHESTRATOR_PROMPT.md (optional)
