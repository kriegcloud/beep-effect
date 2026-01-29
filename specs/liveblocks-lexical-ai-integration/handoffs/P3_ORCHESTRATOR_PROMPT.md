# Phase 3 Orchestrator Prompt: AI Streaming Verification

> **Spec**: Liveblocks Lexical AI Integration
> **Phase**: 3 of 3
> **Focus**: Verify AI streaming works with real OpenAI API and presence broadcasting

Copy-paste this entire prompt to start Phase 3 implementation.

---

## Mission Statement

Verify that the AI streaming infrastructure works end-to-end with real OpenAI API calls. Test presence broadcasting between browser tabs to confirm collaborative AI features function correctly. This phase focuses on verification and error handling rather than new development.

---

## Context

### Phase 1-2 Completion Summary

| Phase | Focus | Key Outcomes |
|-------|-------|--------------|
| P1 | Infrastructure Verification | Fixed room pattern (`liveblocks:playground:*`), typed env via `Redacted.value(serverEnv.liveblocks.secretKey)` |
| P2 | Real Session Integration | Replaced mock sessions with better-auth, 401 for unauthenticated, UserMeta from real session |

**Files Modified in P1-P2**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts` - Real better-auth session integration

### Current State

The Liveblocks auth endpoint now:
1. Retrieves real user sessions from better-auth cookies
2. Returns 401 for unauthenticated requests
3. Maps session user data to Liveblocks UserMeta (name, avatar, color)
4. Grants room access with pattern `liveblocks:playground:*`

The AI streaming infrastructure exists but uses Vercel AI SDK:
- `apps/todox/src/actions/ai.ts` - Server action using `@ai-sdk/openai`
- `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` - Client hook consuming streams

### Target State

After Phase 3:
1. AI streaming verified working with real OpenAI API key
2. Presence broadcasting tested across multiple browser tabs
3. Error handling implemented for API failures
4. End-to-end collaborative AI workflow validated

---

## Workflow: Discovery -> Execute -> Check -> Verify

### Step 1: Discovery (2 Parallel Agents)

Deploy `codebase-researcher` agents to gather context:

**Agent A: OpenAI API Configuration**
```
Research how OpenAI API key is accessed in this codebase:

1. Find how @ai-sdk/openai is configured in apps/todox
2. Search for OPENAI_API_KEY environment variable usage
3. Check if @beep/shared-env has OpenAI config already
4. Verify the key is available in development environment (.env.local)

Output: OpenAI configuration approach for todox app
Files to examine:
- apps/todox/src/actions/ai.ts (current implementation)
- packages/shared/env/src/*.ts (environment configuration)
- apps/todox/.env.example (expected env vars)
- packages/shared/ai/src/providers.ts (Effect AI provider layers)
```

**Agent B: Presence Broadcasting Patterns**
```
Research how Liveblocks presence updates are broadcast and consumed:

1. Find useUpdateMyPresence usage in AiAssistantPlugin
2. Trace how aiActivity presence flows to other users
3. Understand useOthers subscription for presence changes
4. Document the presence update latency expectations

Output: Presence broadcasting verification approach
Files to examine:
- apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts
- apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx
- apps/todox/liveblocks.config.ts (AiActivityPresence type)
- apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx
```

### Step 2: Execute (Sequential)

**Task 2.1: Verify OpenAI Environment Configuration**
```
Ensure OpenAI API key is properly configured for todox app:

1. Check if OPENAI_API_KEY is in @beep/shared-env
2. If not, verify it's available via process.env in server action
3. Confirm .env.example documents required variable
4. Test that key loads correctly at runtime

Output: Configuration verification checklist
```

**Task 2.2: Add Error Handling to AI Server Action**
```
Enhance error handling in apps/todox/src/actions/ai.ts:

Current:
- Uses @ai-sdk/openai streamText without explicit error handling
- Errors propagate as untyped exceptions

Target:
1. Add try/catch around streamText call
2. Return typed error responses for common failures:
   - API key missing/invalid
   - Rate limit exceeded
   - Model not available
   - Network timeout
3. Log errors with structured format for debugging

Note: Full Effect AI migration is out of scope for P3.
Focus on making current implementation production-ready.
```

**Task 2.3: Verify Presence Broadcasting Implementation**
```
Confirm presence broadcasting works in useCollaborativeAi hook:

1. Verify broadcastAiActivity correctly updates presence
2. Confirm clearAiActivity clears the aiActivity field
3. Check that useOthers properly subscribes to presence changes
4. Ensure AiActivityIndicator renders for active AI users

Output: Presence implementation verification
```

### Step 3: Check

Run verification commands:

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Start dev server
cd apps/todox && bun run dev
```

### Step 4: Verify (Manual Testing)

**Test 1: AI Streaming with Real API**
```bash
# Prerequisites:
# 1. Ensure OPENAI_API_KEY is set in apps/todox/.env.local
# 2. Start dev server: cd apps/todox && bun run dev
# 3. Sign in via browser at http://localhost:3000/auth/sign-in

# Manual test:
# 1. Navigate to a document with the Lexical editor
# 2. Select some text in the editor
# 3. Open AI assistant panel (keyboard shortcut or toolbar)
# 4. Select "Improve Writing" prompt
# 5. Observe streaming response appearing
# 6. Verify response is inserted into document

# Success criteria:
# - First token appears within 2 seconds
# - Full response streams without errors
# - Response is inserted at correct position
```

**Test 2: Presence Broadcasting**
```bash
# Prerequisites:
# 1. Start dev server
# 2. Open two browser windows (or one regular + one incognito)
# 3. Sign in with different accounts in each window
# 4. Open same document in both windows

# Manual test:
# 1. In Window A: Select text and start AI generation
# 2. In Window B: Observe:
#    a. AiActivityIndicator appears showing "User A is using AI"
#    b. Indicator shows prompt label (e.g., "Improve Writing")
# 3. In Window A: Complete or cancel AI operation
# 4. In Window B: Observe indicator disappears

# Success criteria:
# - Presence update visible in < 1 second
# - Correct user name displayed
# - Indicator clears when operation completes
```

**Test 3: Conflict Detection**
```bash
# Manual test:
# 1. In Window A: Select text in paragraph 1
# 2. In Window B: Select OVERLAPPING text (same region)
# 3. In Window A: Start AI generation
# 4. In Window B: Attempt to start AI generation on overlapping selection

# Success criteria:
# - Window B shows conflict warning
# - conflictingUsers array populated
# - hasConflict returns true
# - canProceed returns false
```

**Test 4: Error Handling**
```bash
# Test 4a: Invalid API key
# 1. Temporarily set invalid OPENAI_API_KEY
# 2. Attempt AI generation
# 3. Verify meaningful error message displayed

# Test 4b: Network failure (optional)
# 1. Disconnect network after starting generation
# 2. Verify timeout handling
# 3. Verify error state in UI
```

---

## Key Files

### Primary (May Need Modification)

| File | Potential Change |
|------|------------------|
| `apps/todox/src/actions/ai.ts` | Add error handling wrapper |
| `apps/todox/.env.example` | Document OPENAI_API_KEY requirement |

### Reference (Read Only)

| File | Purpose |
|------|---------|
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Client-side stream consumption |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Conflict detection and presence |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx` | Activity display component |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | Main AI panel component |
| `apps/todox/liveblocks.config.ts` | Presence types (AiActivityPresence) |
| `packages/shared/ai/src/providers.ts` | Effect AI provider layers (future reference) |

---

## Constraints

### Effect Patterns (REQUIRED)

From `.claude/rules/effect-patterns.md`:

```typescript
// Namespace imports
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

// NEVER use native methods
// FORBIDDEN: array.filter(x => ...)
// REQUIRED: A.filter(array, x => ...)

// For error handling (current approach - Vercel AI SDK)
try {
  const result = await streamText({ ... });
  return createStreamableValue(result.textStream);
} catch (err) {
  // Return typed error
  return { error: "API_ERROR", message: err.message };
}
```

### OpenAI Configuration

Current implementation uses Vercel AI SDK which reads from `OPENAI_API_KEY` environment variable:

```typescript
// apps/todox/src/actions/ai.ts
import { openai } from "@ai-sdk/openai";

// The SDK reads OPENAI_API_KEY from process.env automatically
const result = streamText({
  model: openai("gpt-4-turbo"),
  // ...
});
```

Future migration (out of scope for P3) will use Effect AI:

```typescript
// packages/shared/ai/src/providers.ts
import { OpenAiClient } from "@effect/ai-openai";
import { Config, Layer } from "effect";

export const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY"),
}).pipe(Layer.provide(NodeHttpClient.layerUndici));
```

### Presence Broadcasting

The `useCollaborativeAi` hook manages presence broadcasting:

```typescript
// Broadcasting AI activity
broadcastAiActivity(
  true,                           // isGenerating
  O.some("Improve Writing"),      // promptLabel
  O.some({ start: 10, end: 50 })  // selectionRange
);

// Clearing activity
clearAiActivity();
```

---

## Agent Assignments

| Step | Agent Type | Task | Output |
|------|------------|------|--------|
| 1a | `codebase-researcher` | OpenAI config research | Configuration approach |
| 1b | `codebase-researcher` | Presence broadcasting patterns | Verification approach |
| 2.2 | `effect-code-writer` | Add error handling to ai.ts | Enhanced server action |
| 3 | Orchestrator | Run type/lint checks | Verification results |
| 4 | Manual | Browser testing | Validation checklist |

---

## Success Criteria

Phase 3 is COMPLETE when ALL boxes checked:

### AI Streaming
- [ ] OpenAI API key configured and accessible
- [ ] AI streaming works with real API (not mocked)
- [ ] First token latency < 2 seconds
- [ ] Error handling implemented for API failures
- [ ] Error messages displayed to user on failure

### Presence Broadcasting
- [ ] AI activity broadcasts to other users
- [ ] AiActivityIndicator displays for active AI users
- [ ] Presence updates visible within 1 second
- [ ] Activity clears when operation completes

### Conflict Detection
- [ ] Overlapping selections detected correctly
- [ ] hasConflict returns true for overlaps
- [ ] conflictingUsers array populated correctly
- [ ] Conflict warning displayed in UI

### Code Quality
- [ ] Type check passes: `bun run check --filter @beep/todox`
- [ ] Lint check passes: `bun run lint --filter @beep/todox`
- [ ] No new TypeScript errors introduced

---

## Verification Commands

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Start dev server for manual testing
cd apps/todox && bun run dev

# Verify OpenAI key is set (development only)
grep OPENAI_API_KEY apps/todox/.env.local

# Test auth endpoint still works (from P2)
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json"
# Expected: 401 Unauthorized

# Test authenticated with cookie
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>"
# Expected: 200 with Liveblocks token
```

---

## Post-Phase Actions

After completing Phase 3:

1. **Update Reflection Log**
   - Add learnings to `specs/liveblocks-lexical-ai-integration/REFLECTION_LOG.md`
   - Document any issues discovered during verification
   - Note latency measurements and performance observations

2. **Create Final Summary**
   - Update `specs/liveblocks-lexical-ai-integration/outputs/README.md`
   - Document all phases completed
   - List any remaining work for future iterations

3. **Optional Cleanup**
   - Remove mock files if not done in P2:
     - `apps/todox/src/app/api/liveblocks-auth/_example.ts`
     - `apps/todox/src/app/api/_database.ts`

4. **Future Work Documentation**
   - Document Effect AI migration path (future spec)
   - Note UI enhancements identified during testing
   - Capture E2E test requirements for P4 (if planned)

---

## Handoff Document

Read full context in: `specs/liveblocks-lexical-ai-integration/handoffs/HANDOFF_P3.md`

---

## Future Phase Preview (Out of Scope)

The original spec planned 4 phases. P3 combines verification tasks, leaving these for future work:

**Effect AI Migration** (separate spec):
- Replace `@ai-sdk/openai` with `@effect/ai-openai`
- Convert server action to Effect.gen
- Implement streaming via Effect Stream
- Add S.TaggedError for typed errors

**Testing & Observability** (future):
- E2E tests for multi-user scenarios
- Effect.log* structured logging
- Performance baseline documentation

---

## Quick Reference: Testing Checklist

```
[ ] Environment Setup
    [ ] OPENAI_API_KEY in .env.local
    [ ] Dev server running
    [ ] Signed in with valid session

[ ] AI Streaming Tests
    [ ] Select text -> AI panel opens
    [ ] Choose prompt -> Stream starts
    [ ] First token < 2s
    [ ] Response inserts correctly
    [ ] Error displays on failure

[ ] Presence Tests (2 windows)
    [ ] Activity indicator appears
    [ ] Correct user name shown
    [ ] Prompt label displayed
    [ ] Indicator clears on complete

[ ] Conflict Tests (2 windows)
    [ ] Overlapping selection detected
    [ ] Warning displayed
    [ ] canProceed returns false
```
