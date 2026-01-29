# Phase 1 Handoff: Real Authentication Integration

**Date**: 2026-01-29
**From**: P0 (Spec Scaffolding)
**To**: P1 (Real Authentication Integration)
**Status**: Pending

---

## Objective

Wire the Liveblocks auth endpoint to use real user sessions from better-auth instead of mock data. The current implementation uses a mock user database with hardcoded users; this phase replaces that with actual session retrieval from better-auth cookies.

---

## Prior Work Summary (P0)

P0 completed spec scaffolding and initial analysis:

- Identified that auth endpoint at `apps/todox/src/app/api/liveblocks-auth/route.ts` uses mock session
- Documented room pattern mismatch (`liveblocks:examples:*` vs `liveblocks:playground:*`)
- Found correct env pattern in `apps/todox/src/utils/liveblocks.ts` using `@beep/shared-env`
- Created spec structure with `README.md`, `REFLECTION_LOG.md`, orchestration docs
- Verified existing collaborative AI components are architecturally complete

**Key Files Identified**:
| File | Current State |
|------|---------------|
| `apps/todox/src/app/api/liveblocks-auth/route.ts` | Uses mock `getSession` from `_example.ts` |
| `apps/todox/src/app/api/liveblocks-auth/_example.ts` | Parses `userId` from request body |
| `apps/todox/src/app/api/_database.ts` | Hardcoded mock users |
| `apps/todox/src/utils/liveblocks.ts` | Correct env pattern (reference) |
| `apps/todox/liveblocks.config.ts` | UserMeta type definition |

---

## Context for P1

### Current Auth Flow (Mock)

```typescript
// route.ts - Current implementation
import { getSession } from "./_example";

export async function POST(request: NextRequest) {
  const user = await getSession(request);  // <-- Gets from mock DB via request body
  const session = liveblocks.prepareSession(`${user.id}`, {
    userInfo: user.info,
  });
  session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);
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

### Target Auth Flow (Real)

```typescript
// route.ts - Target implementation
import { getSessionCookie } from "better-auth/cookies";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as Redacted from "effect/Redacted";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: Redacted.value(serverEnv.liveblocks.secretKey),
});

export async function POST(request: NextRequest) {
  // 1. Get session from better-auth
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Validate session and get user (requires auth service)
  // Pattern from packages/iam/server/README.md:
  // const session = await authService.auth.api.getSession({ headers: request.headers });

  // 3. Extract user info
  const { id, name, image } = session.user;

  // 4. Generate Liveblocks token
  const liveblocksSession = liveblocks.prepareSession(id, {
    userInfo: {
      name: name || "Anonymous",
      avatar: image || generateDefaultAvatar(id),
      color: generateUserColor(id),
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

The auth endpoint must populate all three `info` fields. Better-auth session provides:
- `id` - User ID (direct mapping)
- `name` - User display name (may be null)
- `image` - Avatar URL (may be null)

**Color generation**: Must generate a consistent color for each user. Options:
1. Hash user ID to hex color
2. Use predefined palette with modulo selection
3. Store in user preferences (out of scope for P1)

---

## Key Files to Modify

### Primary Target

**`apps/todox/src/app/api/liveblocks-auth/route.ts`**

Modifications needed:
1. Remove `import { getSession } from "./_example"`
2. Import `getSessionCookie` from `better-auth/cookies`
3. Import `serverEnv` from `@beep/shared-env/ServerEnv`
4. Import `Redacted` from `effect/Redacted`
5. Replace `process.env.LIVEBLOCKS_SECRET_KEY` with typed env
6. Implement session validation from cookies
7. Map session user to Liveblocks userInfo
8. Change room pattern from `liveblocks:examples:*` to `liveblocks:playground:*`
9. Return 401 for unauthenticated requests

### Reference Files

| File | Purpose |
|------|---------|
| `apps/todox/src/proxy.ts` | Shows `getSessionCookie` usage pattern |
| `apps/todox/src/utils/liveblocks.ts` | Shows correct `serverEnv` + `Redacted` pattern |
| `packages/iam/server/README.md:70-81` | Shows `auth.api.getSession()` pattern |
| `apps/todox/liveblocks.config.ts` | UserMeta type definition |

### Files to Delete (Optional Cleanup)

After P1 validation, these mock files can be removed:
- `apps/todox/src/app/api/liveblocks-auth/_example.ts`
- `apps/todox/src/app/api/_database.ts` (if no other consumers)

---

## Technical Constraints

### Effect Patterns (REQUIRED)

```typescript
// Namespace imports
import * as Redacted from "effect/Redacted";
import * as Effect from "effect/Effect";

// Typed environment access
import { serverEnv } from "@beep/shared-env/ServerEnv";
const secret = Redacted.value(serverEnv.liveblocks.secretKey);

// NEVER use raw process.env
// FORBIDDEN: process.env.LIVEBLOCKS_SECRET_KEY as string
```

### Session Retrieval Options

**Option A: Cookie-only validation (simpler, limited data)**
```typescript
import { getSessionCookie } from "better-auth/cookies";

const sessionCookie = getSessionCookie(request);
if (!sessionCookie) {
  return new Response("Unauthorized", { status: 401 });
}
// Note: Cookie alone doesn't give user details (name, avatar)
// Would need to decode JWT or make additional call
```

**Option B: Full session via Auth.Service (requires runtime)**
```typescript
// Requires Effect runtime and Auth.Service Layer
// Pattern from packages/iam/server/README.md
const authService = yield* Auth.Service;
const session = yield* Effect.tryPromise(() =>
  authService.auth.api.getSession({ headers: request.headers })
);
```

**Recommendation**: Start with Option A + fallback defaults, then evaluate if Option B is needed for full user data.

### Session Cookie Format

From `apps/todox/src/proxy.ts`, the app already uses `getSessionCookie`:
```typescript
import { getSessionCookie } from "better-auth/cookies";
const sessionCookie = getSessionCookie(request);
```

The cookie contains session token; full user info requires either:
1. JWT decoding (if session token is JWT)
2. API call to better-auth `getSession`
3. Database lookup

### Avatar Handling

Better-auth session may have `image: null`. Fallback options:
1. Generate gravatar URL from email hash
2. Use generic avatar with user initials
3. Use numbered avatar set (current mock uses `liveblocks.io/avatars/avatar-N.png`)

### Color Generation

Generate consistent color from user ID:
```typescript
function generateUserColor(userId: string): string {
  // Simple hash to hex color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${((hash >> 24) & 0xFF).toString(16).padStart(2, '0')}${((hash >> 16) & 0xFF).toString(16).padStart(2, '0')}${((hash >> 8) & 0xFF).toString(16).padStart(2, '0')}`;
  return color;
}
```

---

## Acceptance Criteria

- [ ] Auth endpoint retrieves real session from better-auth cookies
- [ ] Unauthenticated requests return 401 status
- [ ] User info (name) populated from session when available
- [ ] Avatar URL generated/defaulted when session lacks image
- [ ] User color generated consistently from user ID
- [ ] Room pattern changed to `liveblocks:playground:*`
- [ ] Uses `@beep/shared-env` instead of raw `process.env`
- [ ] Existing collaboration features still work
- [ ] TypeScript passes: `bun run check --filter @beep/todox`
- [ ] Lint passes: `bun run lint --filter @beep/todox`

---

## Known Risks

### Risk 1: Session Data Availability

**Risk**: `getSessionCookie` only returns cookie presence, not user details (name, avatar).
**Mitigation**: May need to decode JWT or call `auth.api.getSession()` for full user data.
**Impact**: Medium - affects user info display in collaboration UI.

### Risk 2: Auth Service Layer Requirements

**Risk**: Using `Auth.Service` requires Effect runtime which API routes may not have configured.
**Mitigation**: Option A uses cookie-only check; evaluate if full auth service is needed.
**Impact**: High if full user data is required.

### Risk 3: Cookie Parsing in App Router

**Risk**: Next.js App Router may handle cookies differently than Pages Router.
**Mitigation**: Reference `apps/todox/src/proxy.ts` which successfully uses `getSessionCookie`.
**Impact**: Low - pattern already proven in codebase.

### Risk 4: Avatar URL Format

**Risk**: Better-auth `image` field format may differ from Liveblocks expectations.
**Mitigation**: Implement URL validation/normalization before passing to Liveblocks.
**Impact**: Low - cosmetic only.

---

## Agent Recommendations

| Agent | Task | Rationale |
|-------|------|-----------|
| `codebase-researcher` | Find better-auth session patterns in todox | Understand existing auth patterns |
| `effect-code-writer` | Implement auth endpoint changes | Primary code modification |
| `code-reviewer` | Validate implementation | Ensure Effect patterns followed |

### Orchestrator Direct Actions

The orchestrator MAY directly:
- Read reference files (proxy.ts, liveblocks.ts, README.md)
- Verify TypeScript compilation after changes
- Test auth endpoint manually

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
# 2. Copy cookie from DevTools
# 3. Test:
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<token>"

# Test auth endpoint (unauthenticated - should return 401)
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json"
```

---

## Files to Create/Update Post-P1

After P1 completion:
- [ ] Update `REFLECTION_LOG.md` with Phase 1 learnings
- [ ] Create `handoffs/HANDOFF_P2.md` for Client Wiring phase
- [ ] Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`

---

## Decision Log

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| Session retrieval method | Cookie-only + defaults first | Simpler, avoids runtime dependencies |
| Room pattern | `liveblocks:playground:*` | Match existing LiveblocksProvider |
| Environment access | `@beep/shared-env` with `serverEnv` | Codebase standard |
| Avatar fallback | Generate from user ID | Consistent per-user default |
| Color generation | Hash user ID to hex | Deterministic, no storage needed |

---

## Next Phase Preview

**Phase 2: Client Wiring** will:
- Verify AI streaming works with real OpenAI API
- Test presence broadcasting between browser tabs
- Implement error handling for API failures
- Configure user resolution endpoints if needed
