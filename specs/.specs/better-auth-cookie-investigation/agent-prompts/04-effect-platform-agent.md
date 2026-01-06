# Effect Platform HTTP Research Agent

## Objective
Research Effect Platform's HTTP modules to understand:
1. How `HttpServerResponse` handles Set-Cookie headers
2. How `HttpApp.fromWebHandler` preserves response headers
3. The correct way to forward cookies in Effect HTTP responses
4. FetchHttpClient configuration for credentials

## Research Method
Use the Effect documentation MCP tools:
1. `mcp__effect_docs__effect_docs_search` to find relevant docs
2. `mcp__effect_docs__get_effect_doc` to read full documentation

Also explore:
- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect/` - Effect source
- `context7` for Effect platform documentation

## Research Questions

### 1. HttpServerResponse Cookie Handling
- How does `HttpServerResponse.json` handle existing cookies?
- What is `HttpServerResponse.mergeCookies` and how does it work?
- How do you add multiple Set-Cookie headers to a response?
- What is the `Cookies` module from `@effect/platform/Cookies`?

### 2. HttpApp.fromWebHandler Behavior
- When wrapping a web handler, how are response headers preserved?
- Does `fromWebHandler` automatically forward Set-Cookie headers?
- Are there any transformations applied to the response?

### 3. FetchHttpClient Configuration
- How do you configure `credentials: 'include'` in FetchHttpClient?
- What is `FetchHttpClient.RequestInit` and how is it provided?
- Are there any gotchas with cross-origin cookie handling?

### 4. Cookie Module Deep Dive
- How does `Cookies.fromSetCookie` work?
- How do you merge multiple cookies into a response?
- What errors can occur with cookie handling?

### 5. Response Chaining
- How do you take an existing response and add cookies to it?
- What is the proper way to chain response transformations?
- How do you preserve the original response body while adding headers?

## Queries for Effect Docs Search
- "HttpServerResponse cookies"
- "HttpApp fromWebHandler"
- "FetchHttpClient credentials"
- "Cookies module"
- "HttpServerResponse mergeCookies"
- "Set-Cookie headers Effect"

## Output Format
Write findings to: `specs/.specs/better-auth-cookie-investigation/research/04-effect-platform-findings.md`

Include:
1. Correct patterns for cookie handling in HttpServerResponse
2. How to properly use HttpApp.fromWebHandler
3. FetchHttpClient configuration for credentials
4. Code examples from Effect source or documentation
5. Common pitfalls and their solutions
