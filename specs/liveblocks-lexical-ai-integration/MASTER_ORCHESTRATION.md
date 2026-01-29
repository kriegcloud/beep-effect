# Master Orchestration: Liveblocks Lexical AI Integration

> Complete phase workflows, checkpoints, and handoff protocols for completing the Liveblocks + Lexical + AI integration with real API calls.

---

## Overview

This spec completes the partial Liveblocks + Lexical + AI integration in the todox app. The previous `specs/lexical-editor-ai-features` spec implemented the core components (phases 1-5), but left mock authentication and untested API connections. This spec verifies and fixes the infrastructure to enable real-time collaborative AI features with production API calls.

### Key Components Status

| Component | Location | Status |
|-----------|----------|--------|
| Liveblocks auth route | `apps/todox/src/app/api/liveblocks-auth/route.ts` | Exists, uses mock session |
| AI server action | `apps/todox/src/actions/ai.ts` | Working, streams from OpenAI |
| Collaborative AI hook | `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Complete |
| Collaborative panel | `plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | Complete |
| Room provider | `src/app/lexical/context/LiveblocksProvider.tsx` | Wraps RoomProvider |
| Liveblocks config | `apps/todox/liveblocks.config.ts` | Defines presence/storage types |

### Critical Issues to Resolve

1. **Room Pattern Mismatch**: Auth allows `liveblocks:examples:*` but provider uses `liveblocks:playground:*`
2. **Typed Environment**: Auth route uses raw `process.env` instead of `@beep/shared-env`
3. **Mock Session**: Auth endpoint relies on mock user database, needs real session integration

---

## Phase Structure

### Phase 0: Scaffolding (Complete)

**Duration**: 0.5 session
**Status**: Complete
**Agents**: `doc-writer`

#### Deliverables

- [x] `specs/liveblocks-lexical-ai-integration/README.md` created
- [x] `specs/liveblocks-lexical-ai-integration/REFLECTION_LOG.md` created
- [x] `specs/liveblocks-lexical-ai-integration/handoffs/HANDOFF_P1.md` created
- [x] `specs/liveblocks-lexical-ai-integration/handoffs/P1_ORCHESTRATOR_PROMPT.md` created

---

### Phase 1: Infrastructure Verification

**Duration**: 1 session
**Status**: Pending
**Agents**: `codebase-researcher`, `code-reviewer`, `effect-code-writer`

#### Objectives

1. Verify environment configuration
2. Test auth endpoint functionality
3. Fix room pattern mismatch
4. Verify WebSocket connection
5. Implement typed environment access

#### Tasks

##### Task 1.1: Verify Environment

**Agent**: `codebase-researcher`

```
Verify LIVEBLOCKS_SECRET_KEY is configured:

1. Check if key exists in .env (local)
2. Verify key format matches Liveblocks requirements
3. Document how to obtain key from Liveblocks dashboard if missing

Expected output: Confirmation of environment variable status
```

**Verification**:
```bash
# Check env is loaded (do NOT commit actual key)
grep LIVEBLOCKS_SECRET_KEY .env
```

##### Task 1.2: Test Auth Endpoint

**Agent**: Manual/orchestrator

```
Test the auth endpoint returns valid tokens:

1. Start todox dev server
2. POST to /api/liveblocks-auth with mock user
3. Verify response contains valid Liveblocks token

Expected output: JSON response with token field
```

**Verification**:
```bash
# Start dev server in one terminal
cd apps/todox && bun run dev

# Test auth in another terminal
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -d '{"userId": "charlie.layne@example.com"}'
```

##### Task 1.3: Fix Room Pattern Mismatch

**Agent**: `effect-code-writer`

```
Fix the mismatch between auth and provider room patterns:

File: apps/todox/src/app/api/liveblocks-auth/route.ts
Current: session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);
Change to: session.allow(`liveblocks:playground:*`, session.FULL_ACCESS);

This matches the LiveblocksProvider pattern:
File: apps/todox/src/app/lexical/context/LiveblocksProvider.tsx
Pattern: `liveblocks:playground:${roomId}`
```

**Critical Pattern**:
```typescript
// Both must use the same pattern prefix
// Auth route:
session.allow(`liveblocks:playground:*`, session.FULL_ACCESS);

// LiveblocksProvider:
const resolvedRoomId = useMemo(() => `liveblocks:playground:${roomId}`, [roomId]);
```

##### Task 1.4: Fix Typed Environment Access

**Agent**: `effect-code-writer`

```
Replace raw process.env with typed environment access:

File: apps/todox/src/app/api/liveblocks-auth/route.ts

FROM:
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

TO:
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as Redacted from "effect/Redacted";

const liveblocks = new Liveblocks({
  secret: Redacted.value(serverEnv.liveblocks.secretKey),
});

Reference: apps/todox/src/utils/liveblocks.ts (correct pattern)
```

##### Task 1.5: Verify WebSocket Connection

**Agent**: Manual/orchestrator

```
Verify room connection works:

1. Navigate to editor page in browser
2. Open DevTools Network tab
3. Filter for WebSocket connections
4. Verify Liveblocks connection established
5. Check Console for any auth errors
```

#### Checkpoint

Before proceeding to P2:
- [ ] `LIVEBLOCKS_SECRET_KEY` verified in environment
- [ ] Auth endpoint returns valid Liveblocks token
- [ ] Room pattern matches between auth (`session.allow`) and provider (`resolvedRoomId`)
- [ ] Auth route uses `@beep/shared-env` instead of raw `process.env`
- [ ] WebSocket connection established without errors
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

---

### Phase 2: Integration

**Duration**: 1 session
**Status**: Pending
**Agents**: `codebase-researcher`, `effect-code-writer`

#### Objectives

1. Connect real user sessions to Liveblocks auth
2. Verify AI streaming with real OpenAI API
3. Test presence broadcasting between tabs
4. Implement error handling for API failures

#### Tasks

##### Task 2.1: Session Integration Research

**Agent**: `codebase-researcher`

```
Research how other routes handle session authentication:

1. Find examples of better-auth session usage in todox
2. Identify the session helper/hook pattern
3. Document how to get current user from session
4. Note any middleware patterns used

Output: Integration approach for auth route
```

##### Task 2.2: Update Auth Route for Real Sessions

**Agent**: `effect-code-writer`

```
Update auth route to use real user sessions:

File: apps/todox/src/app/api/liveblocks-auth/route.ts

Requirements:
1. Import session utilities from better-auth
2. Get actual user from request session
3. Extract userInfo (name, avatar, color) from user data
4. Handle unauthenticated requests gracefully

Reference pattern (conceptual):
const session = await auth.api.getSession({ headers: request.headers });
if (!session?.user) {
  return new Response("Unauthorized", { status: 401 });
}
const { id, name, image } = session.user;
```

##### Task 2.3: Verify AI Streaming

**Agent**: Manual/orchestrator

```
Test AI streaming with real OpenAI API:

1. Select text in editor
2. Open AI panel
3. Choose "Improve writing" prompt
4. Verify streaming response appears
5. Verify content can be inserted

Prerequisites:
- OPENAI_API_KEY must be set in environment
```

##### Task 2.4: Test Presence Broadcasting

**Agent**: Manual/orchestrator

```
Test presence between browser tabs:

1. Open editor in two browser tabs (same room)
2. In Tab A: Start AI operation
3. In Tab B: Verify presence indicator shows "User is using AI"
4. In Tab A: Complete AI operation
5. In Tab B: Verify presence clears

Verify in DevTools:
- Liveblocks presence updates in real-time
- No console errors during presence sync
```

##### Task 2.5: Error Handling

**Agent**: `effect-code-writer`

```
Implement error handling for API failures:

1. Auth failures: Return appropriate status codes
2. OpenAI failures: Show user-friendly error in panel
3. WebSocket disconnection: Handle reconnection gracefully

Errors to handle:
- Missing/invalid LIVEBLOCKS_SECRET_KEY
- Missing/invalid OPENAI_API_KEY
- Network timeout
- Rate limiting
```

#### Checkpoint

Before proceeding to P3:
- [ ] Auth route uses real user sessions
- [ ] User info (name, avatar) appears in presence
- [ ] AI streaming works with real OpenAI API
- [ ] Presence broadcasting works between tabs
- [ ] Error handling implemented for common failures
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

---

### Phase 3: End-to-End Testing

**Duration**: 1 session
**Status**: Pending
**Agents**: `test-writer`, `doc-writer`

#### Objectives

1. Perform comprehensive multi-tab testing
2. Test conflict detection scenarios
3. Document edge cases discovered
4. Create testing guide for future verification

#### Tasks

##### Task 3.1: Multi-Tab Collaboration Test

**Agent**: Manual/orchestrator

```
Comprehensive multi-tab collaboration test:

Scenario 1: Basic Presence
1. Open two tabs as different users (or same user)
2. Verify cursors visible in both tabs
3. Verify selection highlighting syncs

Scenario 2: Concurrent Editing
1. Tab A: Select text and open AI panel
2. Tab B: Modify the same text area
3. Verify conflict warning appears in Tab A

Scenario 3: Sequential AI Operations
1. Tab A: Complete AI operation
2. Tab B: Start new AI operation on same area
3. Verify no stale state issues
```

##### Task 3.2: Conflict Detection Testing

**Agent**: Manual/orchestrator

```
Test conflict detection edge cases:

Case 1: Selection Invalidation
- Tab A selects text, opens AI panel
- Tab B deletes the selected text
- Expected: Tab A shows warning about invalidated selection

Case 2: Partial Overlap
- Tab A selects "Hello World"
- Tab B starts AI on "World Peace"
- Expected: Conflict warning for overlapping range

Case 3: No Overlap
- Tab A and Tab B work on different paragraphs
- Expected: No conflict warnings
```

##### Task 3.3: Network Edge Cases

**Agent**: Manual/orchestrator

```
Test network failure scenarios:

Case 1: Disconnect During AI
- Start AI operation
- Simulate network disconnect (DevTools offline mode)
- Verify graceful failure and recovery

Case 2: Reconnection
- Disconnect from room
- Reconnect
- Verify presence resumes correctly

Case 3: Stale Token
- Wait for token expiration (or simulate)
- Attempt new operation
- Verify re-authentication works
```

##### Task 3.4: Documentation

**Agent**: `doc-writer`

```
Create testing documentation:

File: specs/liveblocks-lexical-ai-integration/outputs/testing-guide.md

Contents:
1. Prerequisites (API keys, environment)
2. Test scenarios with expected outcomes
3. Edge cases discovered during testing
4. Known limitations
5. Troubleshooting guide
```

#### Checkpoint

Spec complete when:
- [ ] Multi-tab collaboration verified
- [ ] Conflict detection working correctly
- [ ] Network edge cases handled
- [ ] Testing guide documented
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `REFLECTION_LOG.md` finalized with all learnings
- [ ] All success criteria from README.md met

---

## Agent Delegation Matrix

| Phase | Task | Agent | Output |
|-------|------|-------|--------|
| P1 | Env verification | `codebase-researcher` | Verbal confirmation |
| P1 | Room pattern fix | `effect-code-writer` | Modified route.ts |
| P1 | Typed env fix | `effect-code-writer` | Modified route.ts |
| P1 | Code review | `code-reviewer` | Pattern validation |
| P2 | Session research | `codebase-researcher` | Integration approach |
| P2 | Auth update | `effect-code-writer` | Updated route.ts |
| P2 | Error handling | `effect-code-writer` | Error implementations |
| P3 | Testing guide | `doc-writer` | testing-guide.md |

### Orchestrator Direct Actions

The orchestrator MAY directly:
- Read 1-3 small files for quick context verification
- Run manual tests in browser
- Verify WebSocket connections in DevTools
- Update REFLECTION_LOG.md
- Create handoff documents

### Mandatory Delegations

The orchestrator MUST delegate:
- Any code modifications to `effect-code-writer`
- Research requiring >3 file reads to `codebase-researcher`
- Documentation generation to `doc-writer`
- Code review to `code-reviewer`

---

## Verification Commands

### Type Check

```bash
bun run check --filter @beep/todox
```

### Lint

```bash
bun run lint:fix --filter @beep/todox
```

### Dev Server

```bash
cd apps/todox && bun run dev
```

### Auth Endpoint Test

```bash
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -d '{"userId": "charlie.layne@example.com"}'
```

---

## Cross-Phase Considerations

### Environment Variables

Both phases require proper environment configuration:

```bash
# Required in .env
LIVEBLOCKS_SECRET_KEY=sk_...  # From Liveblocks dashboard
OPENAI_API_KEY=sk-...          # For AI streaming
```

### Effect Patterns

All code modifications MUST follow `.claude/rules/effect-patterns.md`:
- Namespace imports (`import * as X from "effect/X"`)
- PascalCase Schema constructors
- TaggedError for error types
- No native JS methods (use Effect utilities)

### Typed Environment Access

ALWAYS use `@beep/shared-env` instead of raw `process.env`:

```typescript
// WRONG
const key = process.env.LIVEBLOCKS_SECRET_KEY;

// RIGHT
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as Redacted from "effect/Redacted";
const key = Redacted.value(serverEnv.liveblocks.secretKey);
```

### Room ID Patterns

Room IDs MUST be consistent between auth and provider:

| Component | Pattern | Example |
|-----------|---------|---------|
| Auth route | `liveblocks:playground:*` | Wildcard for all playground rooms |
| LiveblocksProvider | `liveblocks:playground:{roomId}` | Specific room ID |

---

## Iteration Protocol

After each phase:

1. **Verify** - Confirm all checkpoint items complete
2. **Test** - Run `bun run check --filter @beep/todox`
3. **Manual Test** - Verify in browser with DevTools
4. **Reflect** - Update `REFLECTION_LOG.md` with learnings
5. **Handoff** - Create `HANDOFF_P[N+1].md`
6. **Prompt** - Create `P[N+1]_ORCHESTRATOR_PROMPT.md`

### Phase Failure Recovery

If a phase fails:

1. Document the failure in `REFLECTION_LOG.md`
2. Identify root cause
3. Create remediation tasks
4. Either:
   - Fix and retry current phase
   - Create sub-phase (P1a, P1b) if scope expanded
5. Update handoff with lessons learned

---

## Success Metrics

### Functional Requirements

- [ ] Liveblocks auth works with real user sessions
- [ ] AI streaming works with real OpenAI API
- [ ] Presence broadcasting shows AI activity to other users
- [ ] Conflict detection warns about overlapping selections
- [ ] End-to-end flow works across multiple browser tabs

### Technical Requirements

- [ ] Auth route uses `@beep/shared-env` for typed environment
- [ ] Room patterns consistent between auth and provider
- [ ] Error handling covers common failure scenarios
- [ ] No TypeScript errors (`bun run check` passes)
- [ ] No lint errors (`bun run lint` passes)

### Documentation Requirements

- [ ] `REFLECTION_LOG.md` contains learnings from all phases
- [ ] Testing guide documents verification procedures
- [ ] All handoff documents created for phase transitions

---

## Reference Files

### Core Implementation

| File | Purpose |
|------|---------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Auth endpoint (needs fixing) |
| `apps/todox/src/app/api/liveblocks-auth/_example.ts` | Mock session helper |
| `apps/todox/src/app/api/_database.ts` | Mock user database |
| `apps/todox/src/utils/liveblocks.ts` | Server utils (correct pattern) |
| `apps/todox/liveblocks.config.ts` | Type declarations |

### AI Plugin

| File | Purpose |
|------|---------|
| `plugins/AiAssistantPlugin/index.tsx` | Main plugin entry |
| `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Presence management |
| `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | AI response streaming |
| `plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | Collab-aware UI |

### Context Provider

| File | Purpose |
|------|---------|
| `src/app/lexical/context/LiveblocksProvider.tsx` | Room provider wrapper |
| `src/actions/ai.ts` | Server action for AI |

### Reference Implementation

| File | Purpose |
|------|---------|
| `tmp/nextjs-notion-like-ai-editor/app/api/liveblocks-auth/route.ts` | Production auth pattern |
| `tmp/nextjs-notion-like-ai-editor/app/Providers.tsx` | Provider setup with resolvers |

---

## Known Gotchas

### 1. Room ID Pattern Mismatch

**Issue**: Auth allows `liveblocks:examples:*` but provider uses `liveblocks:playground:*`
**Impact**: WebSocket connections fail with auth errors
**Fix**: Update auth route to match provider pattern

### 2. Mock User Database

**Issue**: Auth endpoint relies on `_database.ts` mock users
**Impact**: Cannot authenticate real users
**Fix**: Replace with real session lookup in Phase 2

### 3. Environment Access

**Issue**: Auth route uses `process.env` directly
**Impact**: Inconsistent with codebase patterns, no type safety
**Fix**: Use `serverEnv` from `@beep/shared-env`

### 4. Request Body Parsing

**Issue**: Mock session expects `userId` in request body
**Impact**: Client must send userId, not ideal for real auth
**Fix**: Get user from session/headers instead of body
