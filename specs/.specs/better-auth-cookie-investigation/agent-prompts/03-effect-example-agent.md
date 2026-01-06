# Effect-Better-Auth Example Research Agent

## Objective
Analyze the working example in `tmp/effect-better-auth-example/` to understand:
1. How Better Auth is integrated with Effect Platform
2. How cookies are handled in the Effect HTTP layer
3. The routing and middleware patterns used
4. How auth responses are proxied/forwarded

## Target Directory
`/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/`

## Research Questions

### 1. Better Auth Integration Pattern
- How is `auth.handler` exposed as an Effect HttpApp?
- What is the relationship between Better Auth's web handler and Effect's HTTP server?
- Are cookies automatically forwarded or manually handled?

### 2. HttpApp.fromWebHandler Behavior
- What does `HttpApp.fromWebHandler` do with Set-Cookie headers?
- Are response headers preserved when wrapping a web handler?
- How does Effect Platform handle multiple Set-Cookie headers?

### 3. Middleware Layer
- How does the `AuthMiddleware` work?
- How are auth cookies read from incoming requests?
- Is there any cookie transformation happening?

### 4. Server Configuration
- How is the HTTP server configured?
- What CORS settings are used?
- Are there any special header configurations?

## Files to Investigate
- `src/server/middleware/BetterAuthApp.ts` - BetterAuth Effect wrapper
- `src/server/middleware/AuthMiddleware.ts` - Auth middleware
- `src/server/middleware/Auth.ts` - Auth helpers
- `src/server/auth.ts` - Better Auth configuration
- `src/server/main.ts` - Server entry point
- `src/server/ApiLive.ts` - API implementation
- `src/client/auth.ts` - Client-side auth setup

## Key Comparison Points
Compare this example with beep-effect's implementation:
- How does the example mount Better Auth vs how beep-effect does it?
- What's different about cookie handling between the two?
- Are there any Effect Platform patterns missing in beep-effect?

## Output Format
Write findings to: `specs/.specs/better-auth-cookie-investigation/research/03-effect-example-findings.md`

Include:
1. The exact pattern used to wrap Better Auth
2. How cookies flow through the Effect HTTP layer
3. Any middleware or interceptor patterns
4. Client-side configuration for cookie handling
5. Key differences from beep-effect's approach
