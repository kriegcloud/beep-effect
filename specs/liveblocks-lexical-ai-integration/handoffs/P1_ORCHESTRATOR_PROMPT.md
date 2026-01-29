# Phase 1 Orchestrator Prompt: Infrastructure Verification

> **Spec**: Liveblocks Lexical AI Integration
> **Phase**: 1 of 3
> **Focus**: Verify and fix Liveblocks infrastructure for real API calls

Copy-paste this entire prompt to start Phase 1 implementation.

---

## Mission Statement

Verify Liveblocks infrastructure works with real API calls before integrating user authentication. Fix environment access patterns, room ID mismatches, and validate WebSocket connections.

---

## Context

### Current State

The todox app has partial Liveblocks + Lexical + AI integration from `specs/lexical-editor-ai-features` (phases 1-5):

| Component | Status | Location |
|-----------|--------|----------|
| Auth endpoint | Exists, uses mock session | `/api/liveblocks-auth` |
| AI streaming | Working via server action | `src/actions/ai.ts` |
| Collaborative AI hook | Complete | `useCollaborativeAi` |
| Floating panel | Complete with conflict UI | `CollaborativeFloatingAiPanel.tsx` |

### Critical Issues to Resolve

1. **Room Pattern Mismatch**: Auth allows `liveblocks:examples:*` but provider uses `liveblocks:playground:*`
2. **Untyped Environment**: Auth route uses raw `process.env` instead of `@beep/shared-env`
3. **Untested Infrastructure**: WebSocket connection never verified end-to-end

---

## Workflow: Discovery -> Execute -> Check -> Fix -> Verify

### Step 1: Discovery (2 Parallel Agents)

Deploy `codebase-researcher` agents to gather context:

**Agent A: Environment & Auth Patterns**
```
Research how typed environment access works in this codebase:

1. Find examples of @beep/shared-env usage (especially serverEnv)
2. Locate Redacted pattern for secrets
3. Document the correct pattern for LIVEBLOCKS_SECRET_KEY access

Output: Integration approach for typed environment in auth route
Files to examine:
- apps/todox/src/utils/liveblocks.ts (reference pattern)
- packages/shared/env/src/ServerEnv.ts
```

**Agent B: Room Configuration**
```
Research Liveblocks room ID configuration:

1. Find where room IDs are defined in auth route
2. Find where room IDs are used in LiveblocksProvider
3. Identify the mismatch between patterns
4. Document which pattern should be canonical

Output: Room pattern alignment recommendation
Files to examine:
- apps/todox/src/app/api/liveblocks-auth/route.ts
- apps/todox/src/app/lexical/context/LiveblocksProvider.tsx
- apps/todox/liveblocks.config.ts
```

### Step 2: Execute (Sequential)

Deploy `effect-code-writer` for modifications:

**Task 2.1: Fix Room Pattern**
```
Update auth route to use playground pattern:

File: apps/todox/src/app/api/liveblocks-auth/route.ts

Change:
  session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);
To:
  session.allow(`liveblocks:playground:*`, session.FULL_ACCESS);

This matches LiveblocksProvider which uses:
  `liveblocks:playground:${roomId}`
```

**Task 2.2: Fix Typed Environment Access**
```
Update auth route to use typed environment:

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

### Step 3: Check

Run verification:

```bash
bun run check --filter @beep/todox
```

### Step 4: Fix (if needed)

If type errors occur, deploy `package-error-fixer` agent:

```
Fix TypeScript errors in @beep/todox after infrastructure changes.

Focus on:
- Import resolution for @beep/shared-env
- Redacted type compatibility
- serverEnv property types

Run: bun run check --filter @beep/todox
```

### Step 5: Verify (Manual)

Test infrastructure manually:

```bash
# Terminal 1: Start dev server
cd apps/todox && bun run dev

# Terminal 2: Test auth endpoint
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -d '{"userId": "charlie.layne@example.com"}'
```

Expected response: JSON with `token` field (Liveblocks JWT).

Then verify in browser:
1. Navigate to editor page
2. Open DevTools Network tab
3. Filter for WebSocket connections
4. Verify Liveblocks connection established
5. Check Console for any auth errors

---

## Key Files to Examine/Modify

### Primary (Modifications Expected)

| File | Modification |
|------|--------------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Fix room pattern, use typed env |

### Reference (Read Only)

| File | Purpose |
|------|---------|
| `apps/todox/src/utils/liveblocks.ts` | Correct pattern for typed env |
| `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx` | Room pattern to match |
| `apps/todox/liveblocks.config.ts` | Presence/storage type declarations |
| `apps/todox/src/app/api/liveblocks-auth/_example.ts` | Mock session helper (to be replaced in P2) |
| `tmp/nextjs-notion-like-ai-editor/app/api/liveblocks-auth/route.ts` | Reference implementation |

---

## Constraints

### Effect Patterns (REQUIRED)

From `.claude/rules/effect-patterns.md`:

```typescript
// Namespace imports
import * as Redacted from "effect/Redacted";

// Environment access
import { serverEnv } from "@beep/shared-env/ServerEnv";
const secret = Redacted.value(serverEnv.liveblocks.secretKey);

// NEVER use raw process.env
// FORBIDDEN: process.env.LIVEBLOCKS_SECRET_KEY as string
```

### Path Aliases

Always use `@beep/*` path aliases, never relative paths crossing package boundaries.

---

## Agent Assignments

| Step | Agent Type | Task | Output |
|------|------------|------|--------|
| 1a | `codebase-researcher` | Environment patterns research | Integration approach |
| 1b | `codebase-researcher` | Room configuration research | Pattern alignment |
| 2 | `effect-code-writer` | Modify auth route | Updated route.ts |
| 4 | `package-error-fixer` | Fix type errors (if any) | Clean build |

---

## Success Criteria

Phase 1 is COMPLETE when ALL boxes checked:

- [ ] `LIVEBLOCKS_SECRET_KEY` verified in environment
- [ ] Auth endpoint returns valid Liveblocks token (JSON with `token` field)
- [ ] Room pattern matches between auth (`session.allow`) and provider (`resolvedRoomId`)
- [ ] Auth route uses `@beep/shared-env` instead of raw `process.env`
- [ ] WebSocket connection established without errors (verify in DevTools)
- [ ] Type check passes: `bun run check --filter @beep/todox`

---

## Verification Commands

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Dev server for manual testing
cd apps/todox && bun run dev

# Auth endpoint test
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -d '{"userId": "charlie.layne@example.com"}'

# Environment verification
grep LIVEBLOCKS_SECRET_KEY .env
```

---

## Post-Phase Actions

After completing Phase 1:

1. **Update Reflection Log**
   - Add learnings to `specs/liveblocks-lexical-ai-integration/REFLECTION_LOG.md`
   - Document any gotchas discovered
   - Note any deviations from plan

2. **Create Phase 2 Documents**
   - `handoffs/HANDOFF_P2.md` - Full context for user integration
   - `handoffs/P2_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt

---

## Handoff Document

Read full context in: `specs/liveblocks-lexical-ai-integration/handoffs/HANDOFF_P1.md`

---

## Next Phase Preview

**Phase 2: User Integration** will:
- Replace mock users with real better-auth session
- Get actual user info (name, avatar, color) from session
- Handle unauthenticated requests with 401
- Implement user resolution endpoints for presence
