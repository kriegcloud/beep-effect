# Cookie Fix Orchestrator Prompt

**For:** Claude 4.5 Opus
**Task:** Fix the Better Auth cookie setting issue in beep-effect

## Context

Sign-up in `apps/web` successfully creates users and sessions in the database (server logs HTTP 200), but:
1. Session cookies are NOT being set in the browser
2. No redirect occurs after successful sign-up

Comprehensive research has been completed. All findings are in:
`/home/elpresidank/YeeBois/projects/beep-effect/specs/.specs/better-auth-cookie-investigation/research/`

## Root Cause Summary

The current implementation uses Better Auth's **programmatic API** (`auth.api.signUpEmail({ returnHeaders: true })`), which may not include cookies in the returned headers. The working reference implementation uses Better Auth's **HTTP handler** directly via `HttpApp.fromWebHandler(auth.handler)`.

## Your Task

Implement the recommended fix: **Use Better Auth's HTTP handler directly** while preserving the existing Effect HttpApi structure for other IAM endpoints.

## Implementation Steps

### Phase 1: Create Better Auth HTTP App Layer

1. **Create a new file:** `packages/iam/server/src/adapters/better-auth/BetterAuthApp.ts`

```typescript
import { HttpApiBuilder, HttpApp } from "@effect/platform"
import { auth } from "./Auth"

/** Better Auth wrapped as an Effect HttpApp - handles cookies natively */
export const BetterAuthApp = HttpApp.fromWebHandler(auth.handler)

/** Layer that mounts Better Auth at /api/auth on the HttpApiBuilder Router */
export const BetterAuthRouterLive = HttpApiBuilder.Router.use((router) =>
  router.mountApp("/api/auth", BetterAuthApp, { includePrefix: true })
)
```

2. **Verify imports work** - You may need to export `auth` from `Auth.ts` or adjust the import path.

### Phase 2: Integrate into Server Runtime

1. **Modify:** `packages/runtime/server/src/HttpRouter.layer.ts`

   - Import `BetterAuthRouterLive` from the new file
   - Add it to the Layer composition

   The layer should be added AFTER the CORS middleware in the composition chain.

### Phase 3: Update Client Configuration (if needed)

1. **Verify** the client calls the correct endpoint:
   - Better Auth routes: `/api/auth/sign-up/email` (handled by Better Auth HTTP handler)
   - The existing API client may need to be updated to call the Better Auth endpoint directly

2. **Check** `packages/iam/client/src/atom/sign-up/sign-up.atoms.ts`:
   - May need to use Better Auth's client directly instead of the Effect HttpApiClient

Consider using Better Auth's official React client:
```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: clientEnv.apiUrl,
  fetchOptions: {
    credentials: "include"
  }
})
```

### Phase 4: Clean Up (Optional)

If the direct Better Auth handler works, you can:
1. Keep the existing Effect HttpApi sign-up handlers for any custom business logic
2. Or remove them if Better Auth handles everything needed

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Auth.ts` | Better Auth instance creation |
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Better Auth configuration |
| `packages/runtime/server/src/HttpRouter.layer.ts` | HTTP router layer composition |
| `packages/iam/client/src/atom/sign-up/sign-up.atoms.ts` | Client sign-up hook |
| `packages/iam/client/src/atom/api-client.ts` | API client configuration |

## Verification Steps

After implementation:

1. **Start dev server:** `bun run dev`

2. **Test sign-up flow:**
   - Go to sign-up page in browser
   - Fill in form and submit
   - Check browser DevTools:
     - Network tab: Verify `Set-Cookie` headers in response
     - Application tab > Cookies: Verify cookies are stored

3. **Check server logs:**
   - Should still show session creation
   - No errors should appear

4. **Test authenticated routes:**
   - After sign-up, cookies should be sent with subsequent requests
   - Protected routes should work

## Cookie Configuration Reference

Current Better Auth configuration (`Options.ts`):

**Development:**
```typescript
{
  httpOnly: true,
  sameSite: "lax",
  secure: false
}
```

**Production:**
```typescript
{
  httpOnly: true,
  partitioned: true,
  sameSite: "none",
  secure: true
}
```

If cookies still don't work after implementing the HTTP handler approach, try:
1. Remove `partitioned: true` temporarily
2. Use HTTPS in development with `sameSite: "none", secure: true`

## Research Documents (for reference)

- `research/01-better-auth-source-findings.md` - Internal cookie handling
- `research/02-better-auth-docs-findings.md` - Official documentation
- `research/03-effect-example-findings.md` - Working implementation pattern
- `research/04-effect-platform-findings.md` - Effect Platform HTTP modules
- `research/05-beep-implementation-findings.md` - Current implementation analysis
- `research/research-master.md` - Synthesized findings

## Success Criteria

1. Sign-up request returns `Set-Cookie` headers
2. Cookies are stored in browser
3. Subsequent requests include cookies
4. Protected routes work after authentication
5. All existing functionality remains intact

## Notes

- The existing `forwardCookieResponse` helper in `schema-helpers.ts` is correctly implemented but may not be receiving cookies from Better Auth's programmatic API
- The Effect Platform `HttpApp.fromWebHandler` automatically preserves all Set-Cookie headers
- CORS is already configured with `credentials: true`
- Client is already configured with `credentials: "include"`
