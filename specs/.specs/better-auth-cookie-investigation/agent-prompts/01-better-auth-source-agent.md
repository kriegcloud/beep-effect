# Better Auth Source Code Research Agent

## Objective
Investigate how Better Auth handles cookie setting internally, specifically focusing on:
1. How `Set-Cookie` headers are generated after successful sign-up
2. The flow from `signUpEmail` API to cookie response
3. Cookie configuration options and their effects
4. How `returnHeaders: true` affects the response

## Target Directory
`/home/elpresidank/YeeBois/projects/beep-effect/tmp/better-auth/`

## Research Questions

### 1. Cookie Generation Flow
- Where are cookies created after successful authentication?
- What function/module is responsible for setting `Set-Cookie` headers?
- How does the session token get converted to a cookie?

### 2. API Response Structure
- When `returnHeaders: true` is passed, what is the exact response structure?
- How are multiple `Set-Cookie` headers handled?
- What headers are returned by default vs with `returnHeaders: true`?

### 3. Cookie Configuration
- What cookie attributes does Better Auth set by default?
- How do `secure`, `sameSite`, `httpOnly`, `partitioned` affect cookie behavior?
- What is the `defaultCookieAttributes` configuration option?

### 4. Sign-Up Specific Flow
- Trace the `signUpEmail` endpoint from request to response
- Identify where session creation triggers cookie setting
- Find where the response headers are assembled

## Files to Investigate
- `packages/better-auth/src/cookies/index.ts` - Cookie handling core
- `packages/better-auth/src/cookies/cookie-utils.ts` - Cookie utilities
- `packages/better-auth/src/api/` - API endpoint implementations
- `packages/better-auth/src/auth/` - Authentication logic
- `packages/better-auth/src/context/` - Request context handling

## Output Format
Write findings to: `specs/.specs/better-auth-cookie-investigation/research/01-better-auth-source-findings.md`

Include:
1. Code snippets showing cookie generation
2. The exact response structure when `returnHeaders: true`
3. How multiple cookies are handled in the response
4. Any relevant configuration options
5. Potential issues with cookie forwarding through a proxy
