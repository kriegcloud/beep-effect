# Handoff P4: Runtime Layer Wiring & Integration Testing

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,500 | OK |
| Episodic Memory | 1,000 tokens | ~800 | OK |
| Semantic Memory | 500 tokens | ~400 | OK |
| Procedural Memory | 500 tokens | Links only | OK |
| **Total** | **4,000 tokens** | **~2,700** | **OK** |

---

## Working Memory (Current Phase)

### Phase 4 Goal

Wire the slice-specific adapters into their respective runtime Layer compositions and add integration tests to verify the OAuth flow works end-to-end.

### Deliverables

1. **Runtime Layer Composition** (per slice):
   - Wire `GoogleCalendarAdapterLive` into `@beep/calendar-server` runtime Layer
   - Wire `GmailAdapterLive` into `@beep/comms-server` runtime Layer
   - Wire `GmailExtractionAdapterLive` into `@beep/knowledge-server` runtime Layer
   - Ensure `GoogleAuthClientLive` is provided in dependency chain

2. **Integration Tests**:
   - Test `GoogleCalendarAdapter.listEvents` with mock OAuth token
   - Test `GmailAdapter.getMessage` with mock OAuth token
   - Test `GmailExtractionAdapter.extractEmailsForKnowledgeGraph`
   - Test error handling for `GoogleScopeExpansionRequiredError`

3. **Documentation Updates**:
   - Update slice CLAUDE.md/AGENTS.md files with adapter usage examples
   - Add adapter quick recipes to each server package

### Success Criteria

- [ ] Calendar runtime Layer includes `GoogleCalendarAdapterLive`
- [ ] Comms runtime Layer includes `GmailAdapterLive`
- [ ] Knowledge runtime Layer includes `GmailExtractionAdapterLive`
- [ ] Integration tests pass with mock OAuth flow
- [ ] `bun run check` passes for all affected packages
- [ ] Documentation updated

---

## Episodic Memory (Phase 3 Summary)

### What Was Done

Created three slice-specific Google Workspace adapters:

1. **GoogleCalendarAdapter** (`packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts`):
   - `REQUIRED_SCOPES = [CalendarScopes.events]`
   - Methods: `listEvents`, `createEvent`, `updateEvent`, `deleteEvent`
   - ACL translation between domain `CalendarEvent` and Google Calendar API format

2. **GmailAdapter** (`packages/comms/server/src/adapters/GmailAdapter.ts`):
   - `REQUIRED_SCOPES = [GmailScopes.read, GmailScopes.send]`
   - Methods: `listMessages`, `getMessage`, `sendMessage`, `getThread`
   - Base64url encoding/decoding for message bodies

3. **GmailExtractionAdapter** (`packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`):
   - `REQUIRED_SCOPES = [GmailScopes.read]` (read-only)
   - Methods: `extractEmailsForKnowledgeGraph`, `extractThreadContext`
   - Outputs `ExtractedEmailDocument` format for knowledge graph pipeline

### Key Files Created

```
packages/calendar/server/src/adapters/
├── GoogleCalendarAdapter.ts
└── index.ts

packages/comms/server/src/adapters/
├── GmailAdapter.ts
└── index.ts

packages/knowledge/server/src/adapters/
├── GmailExtractionAdapter.ts
└── index.ts
```

### Dependencies Added

Each server package now has:
- `@beep/google-workspace-client` (peer + dev)
- `@beep/google-workspace-domain` (peer + dev)
- tsconfig references to both packages

---

## Semantic Memory (Architecture Context)

### Adapter → Service Dependency Chain

```
AdapterLive
  → GoogleAuthClient (Context.Tag)
    → GoogleAuthClientLive (Layer)
      → AuthContext (captured at construction)
        → AuthContextLive (runtime)
          → BetterAuth (account table with OAuth tokens)
```

### Layer Composition Pattern

```typescript
// Example for calendar slice
import { GoogleCalendarAdapter, GoogleCalendarAdapterLive } from "@beep/calendar-server/adapters";
import { GoogleAuthClientLive } from "@beep/google-workspace-server";
import * as Layer from "effect/Layer";

export const CalendarRuntimeLayer = Layer.mergeAll(
  // ... existing calendar layers
  Layer.provide(GoogleCalendarAdapterLive, GoogleAuthClientLive)
);
```

### Test Layer Pattern

```typescript
// Mock GoogleAuthClient for testing
const MockGoogleAuthClient = GoogleAuthClient.of({
  getValidToken: () => Effect.succeed(new GoogleOAuthToken({
    accessToken: O.some("mock-token"),
    refreshToken: O.none(),
    scope: O.some("https://www.googleapis.com/auth/calendar.events"),
    tokenType: O.some("Bearer"),
    expiryDate: O.some(DateTime.unsafeNow().pipe(DateTime.add({ hours: 1 }))),
  })),
  refreshToken: () => Effect.fail(new GoogleAuthenticationError({
    message: "Mock does not support refresh"
  })),
});

const TestLayer = Layer.provide(
  GoogleCalendarAdapterLive,
  Layer.succeed(GoogleAuthClient, MockGoogleAuthClient)
);
```

---

## Procedural Memory (How-To References)

### Runtime Layer Composition
See: `packages/runtime/server/src/` for existing Layer patterns

### Integration Test Patterns
See: `packages/*/server/test/` for existing server test patterns

### HttpClient Mocking
See: `@effect/platform` docs for HttpClient test utilities

---

## Phase 4 Execution Plan

### Step 1: Research Runtime Patterns

```bash
# Find existing runtime Layer compositions
Glob: packages/*/server/src/*Runtime*.ts
Glob: packages/runtime/server/src/*.ts

# Check existing test patterns
Glob: packages/*/server/test/**/*.test.ts
```

### Step 2: Wire Calendar Adapter

1. Locate `@beep/calendar-server` runtime Layer composition
2. Add `GoogleCalendarAdapterLive` to Layer merge
3. Ensure `GoogleAuthClientLive` is provided in dependency chain
4. Verify with `bun run check --filter @beep/calendar-server`

### Step 3: Wire Comms Adapter

1. Locate `@beep/comms-server` runtime Layer composition
2. Add `GmailAdapterLive` to Layer merge
3. Verify with `bun run check --filter @beep/comms-server`

### Step 4: Wire Knowledge Adapter

1. Locate `@beep/knowledge-server` runtime Layer composition
2. Add `GmailExtractionAdapterLive` to Layer merge
3. Verify with `bun run check --filter @beep/knowledge-server`

### Step 5: Add Integration Tests

Create tests for each adapter using mock GoogleAuthClient.

### Step 6: Update Documentation

Add adapter usage examples to each slice's CLAUDE.md/AGENTS.md.

---

## Verification Checklist

After implementation:

- [ ] `bun run check --filter @beep/calendar-server` passes
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/calendar-server` passes
- [ ] `bun run test --filter @beep/comms-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] No cross-slice dependencies from adapters to IAM

---

## Post-Phase Actions

1. **Update REFLECTION_LOG.md** with Phase 4 learnings
2. **Create HANDOFF_P5.md** if additional phases needed (e.g., production readiness, monitoring)
3. **Update spec README.md** with implementation status
