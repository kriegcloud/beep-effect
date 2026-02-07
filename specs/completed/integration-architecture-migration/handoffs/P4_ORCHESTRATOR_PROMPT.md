# P4 Orchestrator Prompt: Runtime Layer Wiring

Copy this prompt to start Phase 4 execution.

---

## Mission

Wire the slice-specific Google Workspace adapters into their runtime Layer compositions and verify they work with the `GoogleAuthClient` → `AuthContext.oauth` → Better Auth token chain.

**Primary Deliverables:**
1. `GoogleCalendarAdapterLive` wired into calendar runtime
2. `GmailAdapterLive` wired into comms runtime
3. `GmailExtractionAdapterLive` wired into knowledge runtime
4. Integration tests with mock GoogleAuthClient

**Success Criteria:**
- All adapters accessible in their slice runtimes
- Type checks pass for all affected packages
- Tests pass with mock OAuth tokens

---

## Context from Phase 3

### What Was Built

1. **GoogleCalendarAdapter** (`packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts`):
   - `REQUIRED_SCOPES = [CalendarScopes.events]`
   - Methods: `listEvents`, `createEvent`, `updateEvent`, `deleteEvent`
   - Depends on: `HttpClient.HttpClient`, `GoogleAuthClient`

2. **GmailAdapter** (`packages/comms/server/src/adapters/GmailAdapter.ts`):
   - `REQUIRED_SCOPES = [GmailScopes.read, GmailScopes.send]`
   - Methods: `listMessages`, `getMessage`, `sendMessage`, `getThread`
   - Depends on: `HttpClient.HttpClient`, `GoogleAuthClient`

3. **GmailExtractionAdapter** (`packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`):
   - `REQUIRED_SCOPES = [GmailScopes.read]`
   - Methods: `extractEmailsForKnowledgeGraph`, `extractThreadContext`
   - Depends on: `HttpClient.HttpClient`, `GoogleAuthClient`

### Dependency Chain

```
SliceAdapter (e.g., GoogleCalendarAdapter)
  → GoogleAuthClient
    → GoogleAuthClientLive
      → AuthContext (captured at layer construction)
        → Provided by runtime
```

### Key Imports

```typescript
// Adapters
import { GoogleCalendarAdapter, GoogleCalendarAdapterLive } from "@beep/calendar-server/adapters";
import { GmailAdapter, GmailAdapterLive } from "@beep/comms-server/adapters";
import { GmailExtractionAdapter, GmailExtractionAdapterLive } from "@beep/knowledge-server/adapters";

// Google Auth
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { GoogleAuthClientLive } from "@beep/google-workspace-server";

// Error types
import {
  GoogleApiError,
  GoogleAuthenticationError,
  GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
```

---

## Step-by-Step Execution Plan

### Step 1: Research Runtime Patterns (Orchestrator)

Before delegating, gather context on existing runtime Layer compositions:

```bash
# Find runtime Layer files
Glob: packages/*/server/src/*Runtime*.ts
Glob: packages/runtime/server/src/*.ts

# Check existing Layer composition patterns
Grep: "Layer.mergeAll|Layer.provide" path:packages/*/server/src
```

### Step 2: Wire Calendar Adapter (Agent)

**Agent**: `effect-code-writer`

**Prompt**:
```
Wire GoogleCalendarAdapterLive into @beep/calendar-server runtime.

<contextualization>
- GoogleCalendarAdapterLive requires: HttpClient.HttpClient, GoogleAuthClient
- GoogleAuthClientLive requires: AuthContext (captured at construction)
- Use Layer.provide to chain dependencies
- Adapter should be accessible to calendar slice services
</contextualization>

1. Find where calendar server composes its runtime Layer
2. Add GoogleCalendarAdapterLive with proper dependency provision
3. Ensure HttpClient and GoogleAuthClient are available

Expected pattern:
```typescript
const CalendarRuntimeLayer = Layer.mergeAll(
  // ... existing layers
  Layer.provide(
    GoogleCalendarAdapterLive,
    Layer.mergeAll(
      HttpClient.layer,
      GoogleAuthClientLive
    )
  )
);
```
```

### Step 3: Wire Comms Adapter (Agent)

Similar to Step 2, for `@beep/comms-server` with `GmailAdapterLive`.

### Step 4: Wire Knowledge Adapter (Agent)

Similar to Step 2, for `@beep/knowledge-server` with `GmailExtractionAdapterLive`.

### Step 5: Add Integration Tests (Agent)

**Agent**: `test-writer`

**Prompt**:
```
Create integration tests for Google Workspace adapters.

<contextualization>
- Tests should use mock GoogleAuthClient that returns test tokens
- Use @beep/testkit patterns (effect, layer, strictEqual)
- Mock HTTP responses for Google API endpoints
- Test error handling for scope expansion errors
</contextualization>

Create tests:
1. GoogleCalendarAdapter.listEvents with mock token and HTTP
2. GmailAdapter.getMessage with mock token and HTTP
3. GmailExtractionAdapter.extractEmailsForKnowledgeGraph
4. Error case: GoogleScopeExpansionRequiredError handling
```

### Step 6: Verification (Orchestrator)

```bash
bun run check --filter @beep/calendar-server
bun run check --filter @beep/comms-server
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/calendar-server
bun run test --filter @beep/comms-server
bun run test --filter @beep/knowledge-server
```

---

## Mock GoogleAuthClient Pattern

For testing without real OAuth:

```typescript
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { GoogleOAuthToken, GoogleAuthenticationError } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as DateTime from "effect/DateTime";

const MockGoogleAuthClient = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (scopes) =>
      Effect.succeed(
        new GoogleOAuthToken({
          accessToken: O.some("mock-access-token"),
          refreshToken: O.none(),
          scope: O.some(scopes.join(" ")),
          tokenType: O.some("Bearer"),
          expiryDate: O.some(DateTime.now.pipe(DateTime.add({ hours: 1 }))),
        })
      ),
    refreshToken: () =>
      Effect.fail(
        new GoogleAuthenticationError({
          message: "Mock client does not support refresh",
        })
      ),
  })
);
```

---

## Verification Checklist

After implementation:

- [ ] `bun run check --filter @beep/calendar-server` passes
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/calendar-server` passes
- [ ] `bun run test --filter @beep/comms-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] Adapters can be yielded from services in each slice

---

## Post-Phase Actions

1. **Update REFLECTION_LOG.md** with Phase 4 learnings
2. **Update spec README.md** to mark Phase 4 complete
3. **Consider Phase 5** if production hardening needed (monitoring, alerts, etc.)
