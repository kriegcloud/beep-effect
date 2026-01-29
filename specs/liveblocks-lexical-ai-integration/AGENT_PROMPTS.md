# Agent Prompts: Liveblocks Lexical AI Integration

> Ready-to-use prompts for specialized agents completing the Liveblocks + Lexical + AI integration.

---

## Overview

This document contains structured prompts for each phase of completing the Liveblocks Lexical AI integration. The integration goal is to enable real-time collaborative AI features with proper authentication, presence broadcasting, and conflict detection.

**Available Agents**:
- `codebase-researcher`: Explore code patterns (read-only)
- `mcp-researcher`: Effect documentation lookup (read-only)
- `code-reviewer`: Review implementations (write-reports)
- `architecture-pattern-enforcer`: Validate Effect patterns (write-reports)
- `test-writer`: Create tests (write-files)
- `doc-writer`: Write documentation (write-files)
- `reflector`: Meta-learning and pattern extraction (write-reports)

---

## Phase 1: Infrastructure Verification

### codebase-researcher: Auth Implementation Analysis

**Mission**: Systematically explore the current Liveblocks auth implementation and identify all gaps between current state and working integration.

**Search Targets**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts`
- `apps/todox/src/app/api/liveblocks-auth/_example.ts`
- `apps/todox/src/app/api/_database.ts`
- `apps/todox/liveblocks.config.ts`
- `apps/todox/src/utils/liveblocks.ts`
- Any files importing from `@liveblocks/*`

**Research Questions**:
1. How does the current auth endpoint construct the Liveblocks session?
2. What room pattern is allowed in `session.allow()` call?
3. How does the auth endpoint access environment variables?
4. What user data is passed to `userInfo` in the session?
5. Where is `LiveblocksProvider` from `@liveblocks/react` configured?
6. What room ID pattern does the provider use?

**Output Format**:
```markdown
## Auth Implementation Analysis

### Current Auth Endpoint
- File: [path]
- Session construction: [details]
- Room pattern allowed: [pattern]
- Environment access: [method]

### Mock Session Helper
- File: [path]
- User resolution: [method]
- Request body expected: [schema]

### LiveblocksProvider Configuration
- File: [path]
- Room ID pattern: [pattern]
- authEndpoint: [configuration]
- Resolver functions: [present/missing]

### Issues Identified
1. [Issue]: [Description]
2. [Issue]: [Description]

### Recommendations
1. [Fix]: [Details]
2. [Fix]: [Details]
```

---

### codebase-researcher: LiveblocksProvider Location

**Mission**: Find exactly where LiveblocksProvider is configured and how rooms are created.

**Search Targets**:
- Files importing `LiveblocksProvider` from `@liveblocks/react`
- Files importing `RoomProvider` from `@liveblocks/react`
- `apps/todox/src/app/lexical/context/`
- `apps/todox/src/app/providers.tsx` or similar

**Research Questions**:
1. Where is the top-level `LiveblocksProvider` configured?
2. Is `authEndpoint` prop set? What value?
3. Are resolver functions (`resolveUsers`, `resolveMentionSuggestions`) configured?
4. Where is `RoomProvider` used and what room ID pattern does it use?
5. Is the room ID pattern consistent with the auth endpoint's `session.allow()` pattern?

**Output Format**:
```markdown
## LiveblocksProvider Analysis

### Provider Locations
| Component | File | Room Pattern |
|-----------|------|--------------|
| LiveblocksProvider | [path] | N/A (config only) |
| RoomProvider | [path] | [pattern] |

### Configuration Details
- authEndpoint: [value or "not set"]
- resolveUsers: [configured/missing]
- resolveMentionSuggestions: [configured/missing]

### Room Pattern Analysis
- Auth allows: `[pattern]`
- Provider uses: `[pattern]`
- Match status: [MATCH/MISMATCH]

### Files Modified By Fix
1. [file]: [what to change]
```

---

### code-reviewer: Room Pattern Consistency

**Mission**: Review and verify room pattern consistency across the auth endpoint and provider configuration.

**Files to Review**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts`
- `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx`
- `apps/todox/liveblocks.config.ts`

**Check For**:
1. Pattern mismatch between auth `session.allow()` and provider room ID
2. Hardcoded patterns vs configurable patterns
3. Security considerations (wildcard scope too broad?)
4. Error handling for invalid room IDs

**Output Format**:
```markdown
## Room Pattern Review

### Pattern Comparison
| Source | Pattern | Location |
|--------|---------|----------|
| Auth endpoint | `liveblocks:examples:*` | route.ts line X |
| RoomProvider | `liveblocks:playground:${roomId}` | LiveblocksProvider.tsx line Y |

### Severity: [HIGH/MEDIUM/LOW]

### Issue Analysis
[Detailed description of the mismatch and its consequences]

### Recommended Fix
[Code example showing the fix]

### Security Assessment
[Are wildcard patterns appropriately scoped?]
```

---

### architecture-pattern-enforcer: Effect Pattern Compliance

**Mission**: Verify the auth implementation follows Effect patterns for environment access.

**Files to Check**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts`
- `apps/todox/src/utils/liveblocks.ts`

**Patterns to Validate**:

1. **Environment Access Pattern**:
```typescript
// WRONG
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

// CORRECT
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as Redacted from "effect/Redacted";

const liveblocks = new Liveblocks({
  secret: Redacted.value(serverEnv.liveblocks.secretKey),
});
```

2. **Error Handling Pattern**:
```typescript
// WRONG
if (!user) throw Error("User not found");

// CORRECT (for Effect context)
import * as S from "effect/Schema";

class UserNotFoundError extends S.TaggedError<UserNotFoundError>()("UserNotFoundError", {
  userId: S.String,
}) {}
```

**Output Format**:
```markdown
## Effect Pattern Compliance

### Environment Access
| File | Pattern | Status |
|------|---------|--------|
| route.ts | Uses `process.env` directly | VIOLATION |
| liveblocks.ts | Uses `serverEnv` with Redacted | COMPLIANT |

### Error Handling
| File | Pattern | Status |
|------|---------|--------|
| _example.ts | Uses `throw Error()` | VIOLATION |

### Violations Summary
1. [File]: [Violation]: [Recommended fix]

### Compliant Patterns Found
1. [File]: [Pattern description]

### Remediation Priority
1. [Highest priority fix]
2. [Second priority fix]
```

---

## Phase 2: User Integration

### codebase-researcher: Session Integration Analysis

**Mission**: Analyze how to connect real user sessions from better-auth to Liveblocks authentication.

**Search Targets**:
- `packages/iam/client/src/` - Auth client patterns
- `packages/iam/server/src/` - Auth server patterns
- `apps/todox/src/app/api/` - API route patterns
- Files containing `getSession`, `auth`, or `better-auth`

**Research Questions**:
1. How does better-auth provide session information in API routes?
2. What user data is available from the session (id, name, email, avatar)?
3. How do other API routes in todox verify authentication?
4. Is there a standard pattern for getting user info in API routes?
5. What color/avatar logic exists for user presence?

**Output Format**:
```markdown
## Session Integration Analysis

### Better-Auth Session Access
- Server pattern: [code example]
- Available fields: [list]
- Import path: [package]

### Existing API Route Patterns
| Route | Auth Method | User Fields Used |
|-------|-------------|------------------|
| [route] | [method] | [fields] |

### User Info Mapping
| Liveblocks Field | Better-Auth Source | Transform Needed |
|------------------|-------------------|------------------|
| id | session.user.id | None |
| info.name | session.user.name | Fallback to email |
| info.avatar | session.user.image | Default avatar |
| info.color | N/A | Generate from ID |

### Color Generation Approach
[Describe deterministic color generation from user ID]

### Integration Plan
1. [Step 1]
2. [Step 2]
```

---

### codebase-researcher: User Resolver Patterns

**Mission**: Find patterns for user resolution endpoints needed by LiveblocksProvider.

**Search Targets**:
- `apps/todox/src/app/api/users/` (if exists)
- Reference: `tmp/nextjs-notion-like-ai-editor/app/Providers.tsx`
- Reference: `tmp/nextjs-notion-like-ai-editor/app/api/users/`

**Research Questions**:
1. Does todox have a `/api/users` endpoint for resolving user IDs?
2. Does todox have a `/api/users/search` endpoint for mentions?
3. What format does LiveblocksProvider expect from resolvers?
4. Can we use existing user services or need new endpoints?

**Output Format**:
```markdown
## User Resolver Analysis

### Required Resolvers
| Resolver | Purpose | Endpoint Needed |
|----------|---------|-----------------|
| resolveUsers | Avatar/name lookup | /api/users?userIds=... |
| resolveMentionSuggestions | @mention search | /api/users/search?text=... |
| resolveRoomsInfo | Room metadata | /api/rooms?roomIds=... |

### Existing Endpoints
- /api/users: [EXISTS/MISSING]
- /api/users/search: [EXISTS/MISSING]

### Reference Implementation Format
```typescript
// resolveUsers response
[{ name: string, avatar: string }]

// resolveMentionSuggestions response
[string] // user IDs
```

### Implementation Recommendation
[New endpoints needed or existing services to expose]
```

---

### mcp-researcher: Liveblocks Auth Patterns

**Mission**: Research official Liveblocks authentication patterns and best practices.

**Search Topics**:
1. Liveblocks `prepareSession` API and options
2. `session.allow()` room patterns and wildcards
3. UserInfo type requirements
4. Handling unauthenticated users
5. Room permission levels (FULL_ACCESS vs READ_ONLY)

**Output Format**:
```markdown
## Liveblocks Auth Patterns

### Session Preparation
```typescript
const session = liveblocks.prepareSession(`user_${userId}`, {
  userInfo: {
    name: string,      // Required
    avatar: string,    // Optional, URL
    color: string,     // Optional, hex color
  }
});
```

### Room Permissions
| Method | Description |
|--------|-------------|
| session.allow(roomPattern, FULL_ACCESS) | Read/write |
| session.allow(roomPattern, READ_ONLY) | Read only |

### Room Pattern Syntax
- `room-name` - Exact match
- `room-*` - Prefix match
- `*` - All rooms (not recommended)

### Best Practices
1. [Practice 1]
2. [Practice 2]
```

---

## Phase 3: End-to-End Testing

### test-writer: Integration Test Creation

**Mission**: Create Effect-based integration tests for Liveblocks + AI workflow.

**Test File Location**: `apps/todox/src/__tests__/liveblocks-ai-integration.test.ts`

**Test Scenarios**:

1. **Auth Endpoint Basic**:
```typescript
effect("auth endpoint returns valid token for mock user", () =>
  Effect.gen(function* () {
    // POST to /api/liveblocks-auth with valid userId
    // Assert response contains token
  })
);
```

2. **Auth Endpoint Error Cases**:
```typescript
effect("auth endpoint rejects invalid user", () =>
  Effect.gen(function* () {
    // POST with non-existent userId
    // Assert error response
  })
);
```

3. **Room Pattern Matching**:
```typescript
effect("room pattern allows playground rooms", () =>
  Effect.gen(function* () {
    // Verify token grants access to liveblocks:playground:* rooms
  })
);
```

**Output Format**:
```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("description", () =>
  Effect.gen(function* () {
    // Test body
  })
);
```

**Requirements**:
- Use `@beep/testkit` patterns
- Effect.gen for all test bodies
- No manual Effect.runPromise
- Mock external services appropriately

---

### doc-writer: Test Documentation

**Mission**: Document end-to-end testing procedures for manual verification.

**Target File**: `specs/liveblocks-lexical-ai-integration/outputs/E2E_TEST_GUIDE.md`

**Sections**:

1. **Prerequisites**:
   - Environment variables required
   - Dev server running
   - Browser with DevTools

2. **Test Setup**:
   - Open two browser tabs/windows
   - Navigate to editor page
   - Open DevTools Network tab

3. **Test Scenarios**:
   | Scenario | Steps | Expected Result |
   |----------|-------|-----------------|
   | Auth flow | Open page, check network | WebSocket connects |
   | Presence | Select text in tab 1 | Selection visible in tab 2 |
   | AI activity | Start AI in tab 1 | Activity indicator in tab 2 |
   | Conflict | Select same text, both use AI | Warning shown |

4. **Troubleshooting**:
   - WebSocket fails to connect: [checklist]
   - Presence not updating: [checklist]
   - AI streaming errors: [checklist]

---

### code-reviewer: AI Component Integration Review

**Mission**: Review the integration between AI components and Liveblocks presence.

**Files to Review**:
- `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts`
- `plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx`
- `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts`

**Check For**:

1. **Presence Broadcasting**:
   - Is `broadcastAiActivity` called when AI operation starts?
   - Is `clearAiActivity` called when AI operation completes?
   - Is cleanup done on unmount?

2. **Conflict Detection**:
   - Does `rangesOverlap` correctly detect overlapping selections?
   - Are conflicting users properly identified?
   - Is conflict warning displayed appropriately?

3. **Effect Patterns**:
   - Are Effect utilities used for array operations (`A.filter`, `A.map`)?
   - Is `pipe` used instead of method chaining?
   - Are Option types used appropriately?

**Output Format**:
```markdown
## AI Component Integration Review

### Presence Broadcasting
- Start broadcast: [CORRECT/ISSUE]
- End broadcast: [CORRECT/ISSUE]
- Cleanup on unmount: [CORRECT/ISSUE]

### Conflict Detection
- Range overlap logic: [CORRECT/ISSUE]
- User identification: [CORRECT/ISSUE]
- Warning display: [CORRECT/ISSUE]

### Effect Pattern Compliance
| Pattern | File | Status |
|---------|------|--------|
| A.filter for arrays | useCollaborativeAi.ts | COMPLIANT |
| O.Option for nullables | useCollaborativeAi.ts | COMPLIANT |
| pipe for composition | useCollaborativeAi.ts | COMPLIANT |

### Issues Found
1. [Issue description and location]

### Recommendations
1. [Recommendation]
```

---

## Cross-Phase Prompts

### reflector: Phase Completion Reflection

**Mission**: Capture learnings at the end of each phase for continuous improvement.

**Input**: Review work completed in the phase, issues encountered, patterns discovered.

**Template**:
```markdown
## Phase [N] Reflection: [Phase Name]

**Date**: YYYY-MM-DD

### What Worked
- [Effective approach 1]
- [Effective approach 2]

### What Didn't Work
- [Challenge 1]: [Why it was difficult]
- [Challenge 2]: [Why it was difficult]

### Pattern Candidates

| Pattern | Score | Description |
|---------|-------|-------------|
| Liveblocks room pattern naming | 75 | Use `{app}:{feature}:{id}` format |
| Typed env for secrets | 90 | Always use serverEnv with Redacted |

### Gotchas
- Room pattern in auth MUST match pattern used by RoomProvider
- Mock users require userId in request body

### Learnings for Future Specs
- [Reusable insight 1]
- [Reusable insight 2]

### Next Phase Adjustments
- [Adjustment based on learnings]
```

**Scoring Guide**:
- 90-100: Production-ready, promote to skills
- 75-89: Validated, add to pattern registry
- 50-74: Promising, iterate in spec
- 0-49: Needs more work

---

### handoff-writer: Create Phase Handoff

**Mission**: Create handoff documents for the next phase.

**Required Files**:

1. **`HANDOFF_P[N+1].md`** - Full context document
   - Previous phase summary
   - Key learnings applied
   - Detailed task specifications
   - Schema shapes and code patterns
   - Verification steps
   - Success criteria checklist

2. **`P[N+1]_ORCHESTRATOR_PROMPT.md`** - Copy-paste ready prompt
   - Context (1-2 sentences)
   - Mission statement
   - Tasks (numbered)
   - Critical patterns (code examples)
   - Reference files
   - Verification commands
   - Success criteria

**Handoff Context Budget**:
| Section | Max Tokens |
|---------|------------|
| Working (current tasks) | 2,000 |
| Episodic (previous phases) | 1,000 |
| Semantic (tech stack) | 500 |
| Procedural | Links only |
| **Total** | **4,000** |

---

### codebase-researcher: Reference Implementation Comparison

**Mission**: Compare todox implementation against reference implementation for gaps.

**Files to Compare**:

| todox File | Reference File |
|------------|----------------|
| apps/todox/src/app/api/liveblocks-auth/route.ts | tmp/nextjs-notion-like-ai-editor/app/api/liveblocks-auth/route.ts |
| apps/todox/src/app/lexical/context/LiveblocksProvider.tsx | tmp/nextjs-notion-like-ai-editor/app/Providers.tsx |
| apps/todox/liveblocks.config.ts | tmp/nextjs-notion-like-ai-editor/liveblocks.config.ts |

**Research Questions**:
1. What differences exist in auth endpoint implementation?
2. What resolver functions does reference have that todox lacks?
3. How does reference handle room ID generation?
4. What presence types differ between implementations?

**Output Format**:
```markdown
## Reference Implementation Comparison

### Auth Endpoint Differences
| Aspect | todox | Reference | Gap |
|--------|-------|-----------|-----|
| Session construction | [impl] | [impl] | [diff] |
| Room pattern | [pattern] | [pattern] | [diff] |
| User resolution | [method] | [method] | [diff] |

### Provider Configuration Differences
| Aspect | todox | Reference | Gap |
|--------|-------|-----------|-----|
| resolveUsers | [impl] | [impl] | [diff] |
| resolveMentionSuggestions | [impl] | [impl] | [diff] |

### Presence Type Differences
[Comparison of liveblocks.config.ts types]

### Adoption Recommendations
1. [Feature to adopt from reference]
2. [Feature to adopt from reference]
```

---

## Environment Verification Prompts

### architecture-pattern-enforcer: Environment Variable Check

**Mission**: Verify all required environment variables are documented and accessible.

**Required Variables**:
- `LIVEBLOCKS_SECRET_KEY`: Liveblocks API secret
- `OPENAI_API_KEY`: OpenAI API key (for AI streaming)

**Files to Check**:
- `.env.example`: Variable documentation
- `packages/shared/env/src/ServerEnv.ts`: Typed access
- `apps/todox/.env.local` (if accessible): Actual values

**Output Format**:
```markdown
## Environment Variable Verification

### Required Variables
| Variable | In .env.example | In ServerEnv | Status |
|----------|-----------------|--------------|--------|
| LIVEBLOCKS_SECRET_KEY | YES | YES | OK |
| OPENAI_API_KEY | YES | YES | OK |

### Access Pattern Verification
```typescript
// ServerEnv should expose:
serverEnv.liveblocks.secretKey // Redacted<string>
serverEnv.openai.apiKey       // Redacted<string>
```

### Missing Configurations
1. [Variable]: [What's missing]

### Documentation Updates Needed
1. [Update needed]
```

---

## Debugging Prompts

### codebase-researcher: WebSocket Connection Debug

**Mission**: Trace the WebSocket connection flow from client to server.

**Search Targets**:
- Client: `@liveblocks/react` usage, RoomProvider, authEndpoint
- Server: `/api/liveblocks-auth` route, response format

**Trace Points**:
1. Client calls authEndpoint
2. Server receives request, extracts userId
3. Server creates Liveblocks session
4. Server returns token
5. Client connects WebSocket with token

**Debug Questions**:
1. Is authEndpoint called? (Network tab)
2. What request body is sent?
3. What response is received?
4. Does response contain valid token?
5. Does WebSocket connect after auth?

---

### code-reviewer: Error Response Analysis

**Mission**: Review error handling in auth and AI endpoints.

**Files to Review**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts`
- `apps/todox/src/actions/ai.ts`

**Check For**:
1. Are errors caught and handled?
2. Are error responses properly formatted?
3. Are errors logged appropriately?
4. Are sensitive details hidden from responses?

---

## Usage Notes

### Launching Agents

Use the Task tool with appropriate subagent_type:

```
Task tool:
  subagent_type: "codebase-researcher"
  prompt: [paste prompt from above]
```

### Agent Output Handling

| Agent Type | Output Location | Action |
|------------|-----------------|--------|
| read-only | Informs orchestrator | Use findings for decisions |
| write-reports | `outputs/` directory | Review and apply recommendations |
| write-files | Source files | Verify creation, run tests |

### Parallel Execution

**Safe to run in parallel**:
- Multiple `codebase-researcher` prompts on different areas
- `codebase-researcher` + `mcp-researcher`
- `code-reviewer` on different files

**Must run sequentially**:
- `architecture-pattern-enforcer` AFTER code changes
- `reflector` AFTER phase completion
- `test-writer` AFTER implementation complete

### Phase Completion Checklist

Before moving to next phase:
- [ ] All tasks completed
- [ ] REFLECTION_LOG.md updated
- [ ] `HANDOFF_P[N+1].md` created
- [ ] `P[N+1]_ORCHESTRATOR_PROMPT.md` created
- [ ] Verification commands pass
- [ ] No blocking issues remain

### Key File References

| Purpose | File |
|---------|------|
| Auth endpoint | `apps/todox/src/app/api/liveblocks-auth/route.ts` |
| Mock session | `apps/todox/src/app/api/liveblocks-auth/_example.ts` |
| Mock users | `apps/todox/src/app/api/_database.ts` |
| Liveblocks types | `apps/todox/liveblocks.config.ts` |
| Server utils | `apps/todox/src/utils/liveblocks.ts` |
| LiveblocksProvider | `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx` |
| Collaborative AI hook | `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` |
| Collaborative panel | `plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` |
| AI streaming | `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` |
| Server action | `apps/todox/src/actions/ai.ts` |
| Reference auth | `tmp/nextjs-notion-like-ai-editor/app/api/liveblocks-auth/route.ts` |
| Reference provider | `tmp/nextjs-notion-like-ai-editor/app/Providers.tsx` |

### Verification Commands

```bash
# Type check
bun run check --filter @beep/todox

# Start dev server
cd apps/todox && bun run dev

# Test auth endpoint
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -d '{"userId": "charlie.layne@example.com"}'

# Check env variable is set
grep LIVEBLOCKS_SECRET_KEY .env
```
