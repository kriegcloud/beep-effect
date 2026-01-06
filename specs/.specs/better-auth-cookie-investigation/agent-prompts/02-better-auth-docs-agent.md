# Better Auth Documentation Research Agent

## Objective
Search Better Auth official documentation for guidance on:
1. Cookie handling best practices
2. Cross-origin authentication setup
3. Proxy/gateway configurations
4. Common cookie-related issues and solutions

## Research Method
Use the `context7` MCP tools:
1. First call `mcp__context7__resolve-library-id` with `libraryName: "better-auth"`
2. Then use `mcp__context7__query-docs` with relevant queries

## Queries to Execute

### Query 1: Cookie Configuration
"How to configure cookies in Better Auth including secure, sameSite, httpOnly, and domain settings"

### Query 2: Cross-Origin Setup
"Better Auth CORS configuration and cross-origin cookie handling"

### Query 3: Proxy Configuration
"Better Auth behind a reverse proxy or API gateway cookie forwarding"

### Query 4: Custom Endpoints
"Creating custom endpoints in Better Auth that return session cookies"

### Query 5: returnHeaders Option
"Using returnHeaders option in Better Auth API endpoints"

### Query 6: Session Cookie Flow
"Better Auth session cookie creation flow after sign up or sign in"

### Query 7: Client Configuration
"Better Auth client configuration for cookie-based authentication"

### Query 8: Common Issues
"Better Auth cookies not being set troubleshooting"

## Output Format
Write findings to: `specs/.specs/better-auth-cookie-investigation/research/02-better-auth-docs-findings.md`

Include:
1. Official documentation excerpts for each topic
2. Recommended configurations for cross-origin setups
3. Any warnings or known issues mentioned in docs
4. Client-side configuration requirements
5. Server-side proxy considerations
