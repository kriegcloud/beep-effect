# Phase 2 Orchestrator Prompt: User Session Integration

> **Spec**: Liveblocks Lexical AI Integration
> **Phase**: 2 of 3
> **Focus**: Replace mock user sessions with real better-auth sessions

Copy-paste this entire prompt to start Phase 2 implementation.

---

## Mission Statement

Replace mock user sessions in the Liveblocks auth endpoint with real better-auth session data. Implement proper 401 responses for unauthenticated requests and map session user data to Liveblocks UserMeta.

---

## Context

### Phase 1 Completion Summary

Phase 1 fixed infrastructure issues:

| Issue | Resolution |
|-------|------------|
| Room pattern mismatch | Changed `liveblocks:examples:*` to `liveblocks:playground:*` |
| Untyped environment | Replaced `process.env` with `Redacted.value(serverEnv.liveblocks.secretKey)` |
| Auth endpoint | Returns valid Liveblocks JWT token |

**File Modified**: `apps/todox/src/app/api/liveblocks-auth/route.ts`

### Current State (Mock Sessions)

The auth endpoint currently uses a mock session system:

```typescript
// route.ts - Current implementation (Phase 1)
import { getSession } from "./_example";

export async function POST(request: NextRequest) {
  const user = await getSession(request);  // <-- Mock: parses userId from request body
  const session = liveblocks.prepareSession(`${user.id}`, {
    userInfo: user.info,
  });
  session.allow(`liveblocks:playground:*`, session.FULL_ACCESS);
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}
```

```typescript
// _example.ts - Mock session retrieval
export async function getSession(request: Request) {
  const { userId } = await request.json();  // <-- Expects userId in body
  const user = getUser(userId);             // <-- Hardcoded mock users
  if (!user) throw Error("User not found");
  return user;
}
```

### Target State (Real Sessions)

Replace mock with better-auth session retrieval:

```typescript
// route.ts - Target implementation
import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Check for session cookie
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Get full session via auth.api.getSession()
  // 3. Map session.user to Liveblocks UserMeta
  // 4. Generate Liveblocks token
}
```

---

## Workflow: Discovery -> Execute -> Check -> Fix -> Verify

### Step 1: Discovery (2 Parallel Agents)

Deploy `codebase-researcher` agents to gather context:

**Agent A: Better-Auth Session Patterns**
```
Research how better-auth sessions are retrieved server-side in this codebase:

1. Find examples of `getSessionCookie` usage in apps/todox
2. Find examples of `auth.api.getSession()` usage
3. Document the session shape (user.id, user.name, user.image, etc.)
4. Identify whether runServerPromise or direct API calls are needed

Output: Session retrieval pattern for API routes
Files to examine:
- apps/todox/src/proxy.ts (cookie check example)
- packages/runtime/server/src/AuthContext.layer.ts (getSession pattern)
- packages/iam/client/src/core/get-session/contract.ts (session shape)
```

**Agent B: UserMeta Mapping Research**
```
Research how to map better-auth session data to Liveblocks UserMeta:

1. Examine UserMeta type in liveblocks.config.ts
2. Find session.user shape from better-auth
3. Identify mapping for: id, name, avatar, color
4. Document fallback strategies for null fields

Output: UserMeta mapping implementation approach
Files to examine:
- apps/todox/liveblocks.config.ts (UserMeta type)
- apps/todox/src/app/api/_database.ts (current mock user shape)
- packages/iam/client/src/_internal/user.schemas.ts (user field definitions)
```

### Step 2: Execute (Sequential)

Deploy `effect-code-writer` for modifications:

**Task 2.1: Update Auth Route for Real Sessions**
```
Update auth route to use real better-auth session:

File: apps/todox/src/app/api/liveblocks-auth/route.ts

Changes:
1. Remove import of `getSession` from `./_example`
2. Add import: `import { getSessionCookie } from "better-auth/cookies"`
3. Add import: `import { Auth } from "@beep/iam-server"`
4. Add import: `import { runServerPromise } from "@beep/runtime-server"` (if Effect runtime needed)
5. Check for session cookie first, return 401 if missing
6. Retrieve full session with user data via auth.api.getSession()
7. Map session user to Liveblocks userInfo

Reference: packages/runtime/server/src/AuthContext.layer.ts (getAuthContext pattern)
```

**Task 2.2: Implement UserMeta Mapping**
```
Create helper functions for UserMeta field mapping:

File: apps/todox/src/app/api/liveblocks-auth/route.ts

Functions needed:
1. generateUserColor(userId: string): string
   - Hash userId to consistent hex color
   - Example: #D583F0, #F08385 (from mock data)

2. getAvatarUrl(image: string | null, userId: string): string
   - Return image if present
   - Fallback to numbered avatar or gravatar

3. getUserDisplayName(user: SessionUser): string
   - Return name if present
   - Fallback to email prefix or "Anonymous"

Pattern: Use deterministic generation for consistent per-user values
```

**Task 2.3: Handle 401 for Unauthenticated**
```
Ensure proper 401 handling:

File: apps/todox/src/app/api/liveblocks-auth/route.ts

Requirements:
1. Check sessionCookie BEFORE any Liveblocks operations
2. Return new Response("Unauthorized", { status: 401 }) if no cookie
3. Handle auth.api.getSession() returning null/undefined
4. Return 401 if session validation fails

Pattern from proxy.ts:
if (!sessionCookie && isPrivateRoute) {
  // redirect or return 401
}
```

### Step 3: Check

Run verification:

```bash
bun run check --filter @beep/todox
```

### Step 4: Fix (if needed)

If type errors occur, deploy `package-error-fixer` agent:

```
Fix TypeScript errors in @beep/todox after session integration changes.

Focus on:
- Import resolution for @beep/iam-server, @beep/runtime-server
- Session type compatibility with Liveblocks userInfo
- Nullable field handling for user.name, user.image

Run: bun run check --filter @beep/todox
```

### Step 5: Verify (Manual)

Test with real authentication:

```bash
# Terminal 1: Start dev server
cd apps/todox && bun run dev

# Terminal 2: Test unauthenticated (should return 401)
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json"

# Test authenticated:
# 1. Sign in via browser at http://localhost:3000/auth/sign-in
# 2. Open DevTools > Application > Cookies
# 3. Copy the better-auth.session_token value
# 4. Test:
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>"
```

Expected responses:
- Unauthenticated: `401 Unauthorized`
- Authenticated: JSON with `token` field (Liveblocks JWT)

Browser verification:
1. Navigate to editor page while signed in
2. Check DevTools Console for user presence
3. Verify your actual name appears (not mock name)
4. Open second browser tab - verify both users visible

---

## Key Files to Examine/Modify

### Primary (Modifications Expected)

| File | Modification |
|------|--------------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Replace mock session with real better-auth session |

### Reference (Read Only)

| File | Purpose |
|------|---------|
| `apps/todox/src/proxy.ts` | `getSessionCookie` usage pattern |
| `apps/todox/src/app/api/liveblocks-auth/_example.ts` | Mock implementation to replace |
| `apps/todox/src/app/api/_database.ts` | Mock user data structure |
| `apps/todox/liveblocks.config.ts` | UserMeta type definition |
| `packages/runtime/server/src/AuthContext.layer.ts` | `auth.api.getSession()` pattern |
| `packages/iam/client/src/core/get-session/contract.ts` | Session shape definition |

### Post-Phase Cleanup (Optional)

Files that can be deleted after P2 verification:
- `apps/todox/src/app/api/liveblocks-auth/_example.ts`
- `apps/todox/src/app/api/_database.ts` (check for other consumers first)

---

## Constraints

### Effect Patterns (REQUIRED)

From `.claude/rules/effect-patterns.md`:

```typescript
// Namespace imports
import * as Redacted from "effect/Redacted";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

// Typed environment access
import { serverEnv } from "@beep/shared-env/ServerEnv";
const secret = Redacted.value(serverEnv.liveblocks.secretKey);

// Option handling for nullable fields
const displayName = O.fromNullable(user.name).pipe(
  O.getOrElse(() => "Anonymous")
);

// NEVER use raw process.env
// FORBIDDEN: process.env.LIVEBLOCKS_SECRET_KEY as string
```

### Session Retrieval Approach

**Recommended Pattern** (from `AuthContext.layer.ts`):

```typescript
// Browser Headers construction for Better Auth
const forwardedHeaders = new Headers();
const cookie = request.headers.get("cookie");
if (cookie) forwardedHeaders.set("cookie", cookie);

// Get session from Better Auth
const session = await auth.api.getSession({
  headers: forwardedHeaders,
});

if (!session) {
  return new Response("Unauthorized", { status: 401 });
}

// Access user data
const { id, name, image } = session.user;
```

### UserMeta Type Alignment

```typescript
// From liveblocks.config.ts
UserMeta: {
  id: string;
  info: {
    name: string;    // Required - use fallback if null
    avatar: string;  // Required - use fallback if null
    color: string;   // Required - generate from userId
  };
}
```

### Path Aliases

Always use `@beep/*` path aliases, never relative paths crossing package boundaries.

---

## Agent Assignments

| Step | Agent Type | Task | Output |
|------|------------|------|--------|
| 1a | `codebase-researcher` | Better-auth session patterns | Session retrieval approach |
| 1b | `codebase-researcher` | UserMeta mapping research | Field mapping strategy |
| 2 | `effect-code-writer` | Modify auth route | Updated route.ts |
| 4 | `package-error-fixer` | Fix type errors (if any) | Clean build |

---

## Success Criteria

Phase 2 is COMPLETE when ALL boxes checked:

- [ ] Real user session retrieved from better-auth cookies
- [ ] Unauthenticated requests return 401 status
- [ ] User info (name) populated from session (with fallback)
- [ ] Avatar URL populated from session or generated default
- [ ] User color generated consistently from user ID
- [ ] Presence in editor shows real user name (not mock)
- [ ] Type check passes: `bun run check --filter @beep/todox`

---

## Verification Commands

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Dev server for manual testing
cd apps/todox && bun run dev

# Test unauthenticated request (expect 401)
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json"

# Test authenticated request (with session cookie)
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>"
```

---

## Post-Phase Actions

After completing Phase 2:

1. **Update Reflection Log**
   - Add learnings to `specs/liveblocks-lexical-ai-integration/REFLECTION_LOG.md`
   - Document session retrieval approach chosen
   - Note any avatar/color generation decisions

2. **Create Phase 3 Documents**
   - `handoffs/HANDOFF_P3.md` - Full context for AI streaming verification
   - `handoffs/P3_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt

3. **Optional Cleanup**
   - Delete `apps/todox/src/app/api/liveblocks-auth/_example.ts`
   - Delete `apps/todox/src/app/api/_database.ts` (if unused elsewhere)

---

## Handoff Document

Read full context in: `specs/liveblocks-lexical-ai-integration/handoffs/HANDOFF_P1.md`

---

## Next Phase Preview

**Phase 3: AI Streaming Verification** will:
- Verify AI streaming works with real OpenAI API
- Test presence broadcasting between browser tabs
- Implement error handling for API failures
- Validate end-to-end collaborative AI features
