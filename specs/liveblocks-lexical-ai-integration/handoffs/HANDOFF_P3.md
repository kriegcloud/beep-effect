# Phase 3 Handoff: AI Streaming Verification

**Date**: 2026-01-29
**From**: P2 (Real Session Integration)
**To**: P3 (AI Streaming Verification)
**Status**: Pending

---

## Objective

Verify that AI streaming works with the real OpenAI API, test presence broadcasting between browser tabs, implement error handling for API failures, and validate end-to-end collaborative AI features.

---

## Prior Work Summary

### Phase 1: Infrastructure Verification (Complete)

P1 fixed infrastructure issues:

| Issue | Resolution |
|-------|------------|
| Room pattern mismatch | Changed `liveblocks:examples:*` to `liveblocks:playground:*` |
| Untyped environment | Replaced `process.env` with `Redacted.value(serverEnv.liveblocks.secretKey)` |
| Auth endpoint | Returns valid Liveblocks JWT token |

### Phase 2: Real Session Integration (Complete)

P2 replaced mock sessions with real better-auth integration:

| Issue | Resolution |
|-------|------------|
| Mock session import | Removed `getSession` from `./_example` |
| Real auth retrieval | Uses `runServerPromise` + `Auth.Service` + `auth.api.getSession()` |
| UserMeta mapping | Maps `user.id`, `name`, `image` with fallbacks |
| Unauthenticated requests | Returns 401 via Effect tagged errors and exhaustive matching |
| Color generation | Hash-based selection from predefined palette |
| Avatar generation | Falls back to Liveblocks numbered avatars |

**Key Files Modified**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts`

**Key Patterns Established (P2)**:
- Effect tagged errors (`SessionRetrievalError`, `LiveblocksAuthError`)
- Tagged enum for result (`AuthResult`)
- Exhaustive match handling with `Match.value` + `Match.tag`
- Effect namespace imports (`Effect`, `Match`, `Data`, `F`, `O`, `A`, `Str`, `Redacted`)

---

## Context for P3

### Current Authentication Flow (P2 Output)

The auth endpoint now uses real better-auth sessions:

```typescript
// apps/todox/src/app/api/liveblocks-auth/route.ts
import { Auth } from "@beep/iam-server";
import { runServerPromise } from "@beep/runtime-server";

export async function POST(request: NextRequest) {
  const cookie = request.headers.get("cookie");

  // Early check for session cookie presence
  if (!cookie || !cookie.includes("better-auth.session_token")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runServerPromise(
    Effect.gen(function* () {
      const auth = yield* Auth.Service;

      const forwardedHeaders = new Headers();
      forwardedHeaders.set("cookie", cookie);

      const sessionData = yield* Effect.tryPromise({
        try: () => auth.api.getSession({ headers: forwardedHeaders }),
        catch: (cause) => new SessionRetrievalError({ cause }),
      });

      if (!sessionData || !sessionData.user) {
        return AuthResult.Unauthorized();
      }

      const { user } = sessionData;

      const userMeta = {
        id: user.id,
        info: {
          name: getDisplayName(user),
          avatar: getAvatarUrl(user.image, user.id),
          color: generateUserColor(user.id),
        },
      };

      const liveblocksSession = liveblocks.prepareSession(userMeta.id, {
        userInfo: userMeta.info,
      });

      liveblocksSession.allow("liveblocks:playground:*", liveblocksSession.FULL_ACCESS);

      const { body, status } = yield* Effect.tryPromise({
        try: () => liveblocksSession.authorize(),
        catch: (cause) => new LiveblocksAuthError({ cause }),
      });

      return AuthResult.Success({ body, status });
    }).pipe(
      Effect.catchTag("SessionRetrievalError", () => Effect.succeed(AuthResult.Unauthorized())),
      Effect.catchTag("LiveblocksAuthError", () => Effect.succeed(AuthResult.Unauthorized()))
    ),
    "api.liveblocks-auth.post"
  );

  return F.pipe(
    result,
    Match.value,
    Match.tag("Unauthorized", () => new Response("Unauthorized", { status: 401 })),
    Match.tag("Success", ({ body, status }) => new Response(body, { status })),
    Match.exhaustive
  );
}
```

### Current AI Integration Architecture

The AI features use Vercel AI SDK (not Effect AI):

**Server Action** (`apps/todox/src/actions/ai.ts`):
```typescript
"use server";

import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText } from "ai";

export async function improveText(selectedText: string, instruction: string) {
  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

**Client Hook** (`apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts`):
```typescript
import { readStreamableValue } from "@ai-sdk/rsc";

export function useAiStreaming(): UseAiStreamingReturn {
  const streamResponse = useCallback(async (selectedText: string, instruction: string) => {
    const stream = await improveText(selectedText, instruction);

    for await (const chunk of readStreamableValue(stream)) {
      if (chunk !== undefined) {
        setStreamedContent((prev) => prev + chunk);
      }
    }
  }, []);
  // ...
}
```

### Presence System Architecture

**Liveblocks Types** (`apps/todox/liveblocks.config.ts`):
```typescript
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      selection: SerializedRange | null;
      aiActivity: AiActivityPresence | null;  // AI operation tracking
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };
  }
}

type AiActivityPresence = {
  isGenerating: boolean;
  promptLabel: string | null;
  selectionRange: SerializedRange | null;
};
```

**Collaborative AI Hook** (`useCollaborativeAi.ts`):
- Broadcasts AI activity via Liveblocks presence
- Detects conflicts when multiple users operate on overlapping ranges

---

## Phase 3 Requirements

### Primary Objectives

1. **Verify AI streaming works with real OpenAI API**
   - Test that `improveText` server action calls OpenAI correctly
   - Verify streaming tokens arrive progressively in the UI
   - Measure first token latency (target: < 2s)

2. **Test presence broadcasting between browser tabs**
   - Verify `aiActivity` presence updates broadcast to other users
   - Confirm cursor/selection presence shows real user info (from P2)
   - Test 3+ tabs for consistent presence state

3. **Implement error handling for API failures**
   - Handle OpenAI rate limits gracefully
   - Handle network errors during streaming
   - Handle invalid/missing API key configuration

4. **Validate end-to-end collaborative AI features**
   - Test concurrent AI operations from multiple users
   - Verify conflict detection for overlapping selection ranges
   - Test abort/cancellation mid-stream

### Success Criteria

- [ ] AI responses stream correctly (tokens appear progressively)
- [ ] First token latency < 2 seconds
- [ ] Multiple users see each other's presence (cursor, selection, avatar)
- [ ] AI activity presence broadcasts (`isGenerating`, `promptLabel`, `selectionRange`)
- [ ] API errors handled gracefully (error message displayed, not crash)
- [ ] OpenAI rate limit errors show user-friendly message
- [ ] Abort/cancel stops streaming cleanly
- [ ] No console errors in browser during normal operation
- [ ] Type check passes: `bun run check --filter @beep/todox`

---

## Key Files

### Authentication (P2 Output)

| File | Purpose |
|------|---------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Real session auth endpoint |

### AI Integration (P3 Targets)

| File | Purpose |
|------|---------|
| `apps/todox/src/actions/ai.ts` | Server action using Vercel AI SDK |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Client streaming consumption |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/index.tsx` | Main plugin orchestration |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | Multi-user AI UI |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Conflict detection |

### Presence & Config

| File | Purpose |
|------|---------|
| `apps/todox/liveblocks.config.ts` | Presence types (AiActivityPresence, UserMeta) |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx` | Displays collaborator AI activity |

### Error Handling

| File | Purpose |
|------|---------|
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/errors.ts` | AI error definitions |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/types.ts` | AiOperationState type |

### Environment

| File | Purpose |
|------|---------|
| `@beep/shared-env/ServerEnv` | Typed environment access |
| `.env.local` | OpenAI API key configuration |

---

## Testing Strategy

### Manual Verification Tests

**Test 1: Basic AI Streaming**
1. Sign in to the application
2. Navigate to the editor with collaborative features enabled
3. Select some text in the editor
4. Click AI toolbar button and select a prompt (e.g., "Improve Writing")
5. Verify:
   - Loading indicator appears
   - Tokens stream progressively (not all at once)
   - Final result can be inserted/replaced/appended

**Test 2: Presence Broadcasting**
1. Open the editor in two browser tabs (same user or different users)
2. In Tab 1: Select text and trigger AI operation
3. In Tab 2: Verify you see:
   - User's cursor/selection
   - AI activity indicator showing "User is using AI"
   - Prompt label being used
4. Complete the operation in Tab 1
5. In Tab 2: Verify activity indicator disappears

**Test 3: Multi-User Presence**
1. Open browser A: Sign in as User A
2. Open browser B (incognito): Sign in as User B
3. Both navigate to same document
4. Verify:
   - User A sees User B's cursor with correct name/color
   - User B sees User A's cursor with correct name/color
   - Avatars match the actual user (not mock data)

**Test 4: Conflict Detection**
1. User A selects lines 1-5
2. User B selects lines 3-7 (overlapping)
3. User A triggers AI operation
4. Verify User B sees conflict warning
5. Both users can still proceed (warning only, not blocking)

**Test 5: Error Handling**
1. Temporarily invalidate OpenAI API key in `.env.local`
2. Trigger AI operation
3. Verify: Error message displays (not crash)
4. Restore valid API key

**Test 6: Abort/Cancel**
1. Trigger AI operation
2. Click cancel/abort button while streaming
3. Verify:
   - Streaming stops immediately
   - UI returns to idle state
   - No partial content inserted (unless user chooses to)

### Verification Commands

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Start dev server
cd apps/todox && bun run dev

# Test auth endpoint (should return valid token for authenticated user)
curl -X POST http://127.0.0.1:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<token>"

# Check for console errors in browser DevTools
# Open DevTools > Console > Filter for errors
```

### Environment Setup

Ensure `.env.local` contains:
```bash
# Required for AI streaming
OPENAI_API_KEY=sk-...

# Required for Liveblocks (already configured)
LIVEBLOCKS_SECRET_KEY=sk_...
```

---

## Known Risks & Mitigations

### Risk 1: OpenAI API Key Not Configured

**Risk**: AI features fail silently or with cryptic error if `OPENAI_API_KEY` is missing.
**Mitigation**: Check for presence of API key in server action; return descriptive error.
**Impact**: High - blocks all AI functionality.

### Risk 2: Streaming Timeout

**Risk**: Long AI responses may timeout or appear frozen.
**Mitigation**: Add timeout handling and progress indicators.
**Impact**: Medium - UX issue.

### Risk 3: Presence Update Latency

**Risk**: AI activity presence may not broadcast fast enough for real-time feedback.
**Mitigation**: Verify Liveblocks presence updates are immediate (they should be).
**Impact**: Low - cosmetic issue.

### Risk 4: Conflict Detection Edge Cases

**Risk**: Selection range serialization may not capture all Lexical node types correctly.
**Mitigation**: Test with various selection types (text, block, mixed).
**Impact**: Medium - conflict detection may miss some cases.

### Risk 5: Browser Tab Communication

**Risk**: Multiple tabs from same browser may share session unexpectedly.
**Mitigation**: Use different browsers or incognito for true multi-user testing.
**Impact**: Low - test methodology issue only.

---

## Implementation Notes

### Effect AI Migration (Future - Out of P3 Scope)

The spec originally planned to migrate from Vercel AI SDK to Effect AI. This is explicitly **out of scope for P3**, which focuses on verification of the existing implementation.

Current state (Vercel AI SDK):
```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
```

Future state (Effect AI - Phase 4+):
```typescript
import { OpenAI } from "@effect/ai-openai";
import * as Stream from "effect/Stream";
```

### Existing Error Handling

The `useAiStreaming` hook already has basic error handling:

```typescript
try {
  // streaming logic
} catch (err) {
  setOperationState("error");
  setError(err instanceof Error ? err.message : "An unexpected error occurred");
}
```

P3 should verify this works for:
- Network errors
- API errors (rate limits, invalid key)
- Abort/cancel

---

## Agent Recommendations

| Agent | Task | Rationale |
|-------|------|-----------|
| `codebase-researcher` | Trace AI streaming data flow | Understand end-to-end path |
| `codebase-researcher` | Find presence broadcasting patterns | Locate `updateMyPresence` calls |
| `manual-tester` | Execute verification tests | Human-in-the-loop for multi-browser testing |
| `code-reviewer` | Review error handling coverage | Ensure all failure modes handled |

### Orchestrator Direct Actions

The orchestrator MAY directly:
- Run type check commands
- Read AI-related files
- Verify environment configuration
- Document test results

### Manual Testing Required

Phase 3 requires significant manual testing due to:
- Multi-browser presence verification
- Real-time streaming observation
- OpenAI API interaction

---

## Files to Create/Update Post-P3

After P3 completion:
- [ ] Update `REFLECTION_LOG.md` with Phase 3 learnings
- [ ] Document AI streaming latency baseline in `outputs/`
- [ ] Create `handoffs/HANDOFF_P4.md` for UI Integration phase (if continuing)
- [ ] Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`

---

## Decision Log

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| AI SDK migration | Defer to P4+ | P3 focuses on verification, not refactoring |
| Test methodology | Manual + multiple browsers | Real-time collaboration requires human observation |
| Error handling scope | Verify existing, document gaps | Avoid scope creep in verification phase |
| Presence testing | 2-3 browser tabs | Sufficient for presence verification |

---

## Next Phase Preview

**Phase 4: UI Enhancements** (if continuing) will:
- Render AiActivityIndicator in editor container
- Add visual overlay highlighting AI operation region
- Integrate @floating-ui for panel positioning
- Display conflict warning when ranges overlap
- Add loading states and progress indicators

**Phase 5: Effect AI Migration** (if continuing) will:
- Replace `@ai-sdk/openai` with `@effect/ai-openai`
- Convert `improveText` to Effect.gen
- Implement streaming via Effect Stream
- Add S.TaggedError for AI errors
- Replace native `.map()`, `.filter()` with Effect/Array

---

## Handoff Checklist

Before starting Phase 3:

- [x] P2 complete: Real session integration working
- [x] Auth endpoint returns valid Liveblocks token with real user info
- [x] 401 returned for unauthenticated requests
- [ ] OpenAI API key configured in `.env.local`
- [ ] Dev server can be started successfully
- [ ] At least 2 test user accounts available
