# Phase 2 Handoff: Real Session Integration

**Date**: 2026-01-29
**From**: P1 (Infrastructure Verification)
**To**: P2 (Real Session Integration)
**Status**: Pending

---

## Objective

Replace the mock user session system with real better-auth session retrieval. The current implementation uses `_example.ts` which parses a `userId` from the request body and looks it up in a hardcoded mock database. This phase wires the auth endpoint to extract the actual user from better-auth session cookies.

---

## Prior Work Summary (P1)

P1 completed infrastructure verification with the following outcomes:

- Fixed room pattern: `liveblocks:examples:*` changed to `liveblocks:playground:*`
- Fixed typed environment: `process.env.LIVEBLOCKS_SECRET_KEY` changed to `Redacted.value(serverEnv.liveblocks.secretKey)`
- Auth endpoint returns valid Liveblocks JWT token with correct permissions
- TypeScript passes: 101/101 successful

**Key File Modified**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts`

**Current State**:
```typescript
import { getSession } from "./_example";

export async function POST(request: NextRequest) {
  const user = await getSession(request);  // <-- Still uses mock
  // ...
}
```

---

## Context for P2

### Current Auth Flow (Mock)

```typescript
// route.ts - Current implementation
import { getSession } from "./_example";

export async function POST(request: NextRequest) {
  const user = await getSession(request);  // Gets from mock DB via body.userId
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
  const user = getUser(userId);             // <-- Looks up in mock DB
  if (!user) throw Error("User not found");
  return user;
}
```

```typescript
// _database.ts - Mock user database
const USER_INFO: Liveblocks["UserMeta"][] = [
  { id: "charlie.layne@example.com", info: { name: "Charlie Layne", color: "#D583F0", avatar: "..." }},
  // ... 7 more hardcoded users
];
```

### Target Auth Flow (Real)

```typescript
// route.ts - Target implementation
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as Redacted from "effect/Redacted";
import { Liveblocks } from "@liveblocks/node";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "better-auth.session_token";

const liveblocks = new Liveblocks({
  secret: Redacted.value(serverEnv.liveblocks.secretKey),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Get session from better-auth (see Technical Constraints for options)
  // Option A: Decode JWT directly if session token is JWT
  // Option B: Call auth.api.getSession() if Effect runtime is available

  // 3. Extract user info with fallbacks
  const { id, name, email, image } = session.user;
  const displayName = name || email?.split("@")[0] || "Anonymous";
  const avatar = image || generateDefaultAvatar(id);
  const color = generateUserColor(id);

  // 4. Create Liveblocks session
  const liveblocksSession = liveblocks.prepareSession(id, {
    userInfo: {
      name: displayName,
      avatar,
      color,
    },
  });

  // 5. Allow access to playground rooms
  liveblocksSession.allow(`liveblocks:playground:*`, liveblocksSession.FULL_ACCESS);

  const { body, status } = await liveblocksSession.authorize();
  return new Response(body, { status });
}
```

### UserMeta Type (Liveblocks Config)

```typescript
// liveblocks.config.ts - UserMeta structure
UserMeta: {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
}
```

The auth endpoint must populate all three `info` fields from the better-auth session.

---

## Key Files to Modify

### Primary Target

**`apps/todox/src/app/api/liveblocks-auth/route.ts`**

Modifications needed:
1. Remove `import { getSession } from "./_example"`
2. Add session cookie detection (see pattern in `apps/todox/src/proxy.ts`)
3. Implement real session retrieval from better-auth
4. Return 401 for unauthenticated requests
5. Map session user to Liveblocks userInfo with fallbacks
6. Generate color from user ID
7. Generate avatar fallback from user ID

### Reference Files

| File | Purpose |
|------|---------|
| `apps/todox/src/proxy.ts` | Shows session cookie detection pattern |
| `apps/web/src/proxy.ts` | Shows known bug workaround for `getSessionCookie` |
| `packages/runtime/server/src/AuthContext.layer.ts` | Shows `auth.api.getSession()` pattern |
| `packages/iam/server/README.md:70-81` | Documents `auth.api.getSession()` usage |
| `apps/todox/liveblocks.config.ts` | UserMeta type definition |

### Files to Delete (After P2 Validation)

These mock files can be removed once real session integration is verified:
- `apps/todox/src/app/api/liveblocks-auth/_example.ts`
- `apps/todox/src/app/api/_database.ts` (if no other consumers)

---

## Technical Constraints

### Session Cookie Detection

From `apps/web/src/proxy.ts`, there is a known bug with `getSessionCookie` from `better-auth/cookies`:

```typescript
// NOTE: getSessionCookie from better-auth/cookies has a known bug in Next.js
// Edge Runtime where it returns null even when the cookie exists.
// See: https://github.com/better-auth/better-auth/issues/2170
// Workaround: manually check for the session cookie.

const SESSION_COOKIE_NAME = "better-auth.session_token";

const hasSessionCookie = (request: NextRequest): boolean =>
  request.cookies.has(SESSION_COOKIE_NAME);

// Or get the value:
const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
```

### Session Retrieval Options

**Option A: Cookie-only validation (simpler, limited data)**

This checks cookie presence but doesn't give user details (name, avatar):

```typescript
const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
if (!sessionCookie) {
  return new Response("Unauthorized", { status: 401 });
}
// Would need to decode JWT or make additional call for user info
```

**Option B: Full session via better-auth API (requires runtime)**

This gives full user data but requires Auth.Service which needs Effect runtime:

```typescript
// Pattern from packages/runtime/server/src/AuthContext.layer.ts
const auth = yield* Auth.Service;
const { user, session } = yield* Effect.tryPromise({
  try: async () => {
    const result = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${sessionCookie.value}`,
      }),
    });
    return result;
  },
  catch: (cause) => new Error("Session retrieval failed", { cause }),
});
```

**Option C: Direct API call without Effect runtime**

For Next.js API routes that don't have Effect runtime wired:

```typescript
// Import the auth client/service directly
import { auth } from "@beep/iam-server"; // or wherever auth instance lives

const session = await auth.api.getSession({
  headers: new Headers({
    cookie: request.headers.get("cookie") || "",
  }),
});

if (!session) {
  return new Response("Unauthorized", { status: 401 });
}

const { user } = session;
```

**Recommendation**: Start with Option C if the auth instance can be imported directly. The existing `proxy.ts` pattern suggests the app already uses cookie-based session detection for routing.

### Avatar Fallback Strategy

Better-auth session may have `image: null`. Options for fallback:

1. **Gravatar from email**:
   ```typescript
   import { createHash } from "crypto";

   const generateGravatar = (email: string) => {
     const hash = createHash("md5").update(email.toLowerCase().trim()).digest("hex");
     return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
   };
   ```

2. **Numbered avatar set** (matches current mock pattern):
   ```typescript
   const generateDefaultAvatar = (userId: string) => {
     const hash = simpleHash(userId);
     const avatarIndex = (Math.abs(hash) % 8) + 1;
     return `https://liveblocks.io/avatars/avatar-${avatarIndex}.png`;
   };
   ```

3. **UI Avatars service**:
   ```typescript
   const generateUIAvatar = (name: string) =>
     `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
   ```

**Recommendation**: Use option 2 (Liveblocks avatars) for consistency with the existing mock users.

### Color Generation

Generate consistent color from user ID:

```typescript
function generateUserColor(userId: string): string {
  // Simple hash to hex color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate pastel colors (lighter, more readable)
  const h = Math.abs(hash) % 360;
  const s = 70 + (Math.abs(hash >> 8) % 20);  // 70-90%
  const l = 75 + (Math.abs(hash >> 16) % 10); // 75-85%

  return `hsl(${h}, ${s}%, ${l}%)`;
}
```

Or use a predefined palette (matches mock data style):

```typescript
const COLOR_PALETTE = [
  "#D583F0", "#F08385", "#F0D885", "#85EED6",
  "#85BBF0", "#8594F0", "#85DBF0", "#87EE85"
];

function generateUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}
```

### Effect Patterns (REQUIRED)

```typescript
// Namespace imports
import * as Redacted from "effect/Redacted";

// Typed environment access (already in place from P1)
import { serverEnv } from "@beep/shared-env/ServerEnv";
const secret = Redacted.value(serverEnv.liveblocks.secretKey);

// NEVER use raw process.env
// FORBIDDEN: process.env.LIVEBLOCKS_SECRET_KEY as string
```

---

## Acceptance Criteria

- [ ] Auth endpoint retrieves real session from better-auth cookies
- [ ] Unauthenticated requests return 401 status
- [ ] User name populated from session (with fallback to email or "Anonymous")
- [ ] Avatar URL generated/defaulted when session lacks image
- [ ] User color generated consistently from user ID
- [ ] Room pattern remains `liveblocks:playground:*`
- [ ] Uses `@beep/shared-env` instead of raw `process.env`
- [ ] Mock files (`_example.ts`, `_database.ts`) removed or deprecated
- [ ] TypeScript passes: `bun run check --filter @beep/todox`
- [ ] Lint passes: `bun run lint --filter @beep/todox`
- [ ] Presence shows real user info in collaborative editor

---

## Known Risks

### Risk 1: Auth Service Import Path

**Risk**: The path to import the better-auth instance may not be straightforward from `apps/todox`.
**Mitigation**: Search codebase for existing auth API call patterns; may need to create a helper.
**Impact**: Medium - could block session retrieval implementation.
**Investigation**: Run `grep -r "auth.api.getSession" apps/` to find existing patterns.

### Risk 2: Session Data Shape

**Risk**: Better-auth session structure may differ from expected User model.
**Mitigation**: The schema in `packages/iam/client/src/core/get-session/contract.ts` shows the expected shape.
**Impact**: Low - field mapping should be straightforward.

### Risk 3: Missing User Fields

**Risk**: Session user may lack `name` or `image` fields.
**Mitigation**: Implement fallback chain: `name || email?.split("@")[0] || "Anonymous"`.
**Impact**: Low - cosmetic only.

### Risk 4: Cookie Not Forwarded in Client Request

**Risk**: Liveblocks client may not forward session cookie when calling auth endpoint.
**Mitigation**: Verify `authEndpoint` in Liveblocks client config includes `credentials: "include"`.
**Impact**: High - would cause all requests to return 401.
**Investigation**: Check `apps/todox/src/liveblocks.config.ts` or client setup for credential handling.

### Risk 5: CORS Issues with Credentials

**Risk**: Cross-origin requests with credentials may fail without proper CORS headers.
**Mitigation**: Auth endpoint is same-origin (`/api/liveblocks-auth`), so CORS should not apply.
**Impact**: Low - same-origin requests bypass CORS.

---

## Agent Recommendations

| Agent | Task | Rationale |
|-------|------|-----------|
| `codebase-researcher` | Find auth import patterns in todox | Locate how to access better-auth session API |
| `effect-code-writer` | Implement auth endpoint changes | Primary code modification |
| `code-reviewer` | Validate implementation | Ensure Effect patterns followed |

### Orchestrator Direct Actions

The orchestrator MAY directly:
- Read reference files (proxy.ts, AuthContext.layer.ts, README.md)
- Search for auth patterns in codebase
- Verify TypeScript compilation after changes
- Test auth endpoint manually via curl

### Mandatory Delegations

The orchestrator MUST delegate:
- All code modifications to `effect-code-writer`
- Complex session pattern research to `codebase-researcher`

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/todox

# Lint
bun run lint --filter @beep/todox

# Start dev server
cd apps/todox && bun run dev

# Test auth endpoint (authenticated)
# 1. Sign in via browser to get session cookie
# 2. Open DevTools > Application > Cookies > copy better-auth.session_token
# 3. Test with real cookie:
curl -X POST http://127.0.0.1:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<token>"

# Expected: 200 response with Liveblocks JWT containing real user info

# Test auth endpoint (unauthenticated - should return 401)
curl -X POST http://127.0.0.1:3000/api/liveblocks-auth \
  -H "Content-Type: application/json"

# Expected: 401 Unauthorized

# Verify user info in Liveblocks token
# Decode JWT payload (middle segment) to check userInfo:
echo "<token_middle_segment>" | base64 -d | jq .

# Presence test
# 1. Open two browser tabs with same document
# 2. Verify each tab shows different user's cursor/avatar
# 3. Verify user info matches signed-in user (not mock data)
```

---

## Files to Create/Update Post-P2

After P2 completion:
- [ ] Update `REFLECTION_LOG.md` with Phase 2 learnings
- [ ] Remove `apps/todox/src/app/api/liveblocks-auth/_example.ts`
- [ ] Remove `apps/todox/src/app/api/_database.ts` (if no consumers)
- [ ] Create `handoffs/HANDOFF_P3.md` for AI Integration phase
- [ ] Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`

---

## Decision Log

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| Session detection method | Manual cookie check | `getSessionCookie` has known bug in Edge Runtime |
| Session retrieval | Direct auth API call | Simplest path; avoid Effect runtime in API route |
| Avatar fallback | Liveblocks numbered avatars | Consistency with existing mock data |
| Color generation | Predefined palette with hash | Deterministic, matches mock data aesthetic |
| Error response | 401 Unauthorized | Standard HTTP semantics for auth failure |

---

## Next Phase Preview

**Phase 3: Presence Foundation** will:
- Verify presence broadcasting between browser tabs
- Test cursor overlay with real user info
- Implement typing indicators
- Validate reconnection behavior after disconnect
- Test presence cleanup when user leaves

**Phase 4: AI Integration** will:
- Wire AI streaming with real OpenAI API
- Implement AI activity presence broadcasting
- Handle conflicts between AI suggestions and concurrent edits
- Add cancellation support for AI operations
