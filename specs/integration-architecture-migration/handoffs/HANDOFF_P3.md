# Handoff P3: Slice-Specific Adapters Implementation

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,800 | OK |
| Episodic Memory | 1,000 tokens | ~900 | OK |
| Semantic Memory | 500 tokens | ~450 | OK |
| Procedural Memory | 500 tokens | Links only | OK |
| **Total** | **4,000 tokens** | **~3,150** | **OK** |

---

## Working Memory (Current Phase)

### Phase 3 Goal

Implement slice-specific adapters that use the Google Workspace infrastructure and IntegrationTokenStore to provide Gmail, Calendar, and Drive functionality to their respective slices.

### Deliverables

1. **GoogleCalendarAdapter** (`@beep/calendar-server`):
   - List, create, update, delete calendar events
   - ACL translation between `CalendarEvent` domain model and Google Calendar API format
   - Scope: `GoogleScopes.Calendar.Events`

2. **GmailAdapter** (`@beep/comms-server`):
   - List messages, send email, get threads
   - ACL translation between `Email` domain model and Gmail API format
   - Scopes: `GoogleScopes.Gmail.ReadOnly`, `GoogleScopes.Gmail.Send`

3. **GmailExtractionAdapter** (`@beep/knowledge-server`):
   - Extract emails for knowledge graph ingestion
   - Thread context extraction for document processing
   - Scope: `GoogleScopes.Gmail.ReadOnly`

4. **GoogleDriveAdapter** (`@beep/documents-server` - optional):
   - List files, download content
   - ACL translation for Drive API
   - Scope: `GoogleScopes.Drive.ReadOnly`

### Success Criteria

- [ ] GoogleCalendarAdapter implemented in `@beep/calendar-server`
- [ ] GmailAdapter implemented in `@beep/comms-server`
- [ ] GmailExtractionAdapter implemented in `@beep/knowledge-server`
- [ ] Each adapter declares `REQUIRED_SCOPES` constant
- [ ] ACL translation functions preserve data integrity
- [ ] All packages compile: `bun run check --filter @beep/calendar-server`
- [ ] All packages compile: `bun run check --filter @beep/comms-server`
- [ ] All packages compile: `bun run check --filter @beep/knowledge-server`

### Blocking Issues

None. Phase 2 provides `AuthContext.oauth` API and `GoogleAuthClientLive`.

### Key Constraints

1. **Scope Declaration**: Each adapter MUST declare required OAuth scopes as a const array
2. **ACL Isolation**: Translation logic lives IN the adapter, not in shared infrastructure
3. **Token via AuthContext**: Adapters call `GoogleAuthClient.getValidToken(REQUIRED_SCOPES)` which internally uses `AuthContext.oauth`
4. **Domain Purity**: Adapters return domain types, never raw Google API responses
5. **Dependency on AuthContext**: `GoogleAuthClientLive` requires `AuthContext` - ensure it's provided in layer composition

---

## Episodic Memory (Previous Context)

### Phase 2 Summary (AuthContext OAuth API)

> ⚠️ **Note**: The original Phase 2 plan for `IntegrationTokenStore` was replaced with extending `AuthContext` with OAuth API methods. See [REFLECTION_LOG.md](../REFLECTION_LOG.md) for details.

**Completed:**
- Extended `AuthContext` in `@beep/shared-domain/Policy` with:
  - `OAuthTokenError` and `OAuthAccountsError` tagged errors
  - `OAuthApi` type with `getAccessToken` and `getProviderAccount` methods
  - `AuthContextShape` updated to include `oauth: OAuthApi`
- Implemented OAuth API in `packages/runtime/server/src/AuthContext.layer.ts`:
  - `getAccessToken` wraps Better Auth's API with Effect.tryPromise
  - `getProviderAccount` queries account table directly for scope information
- Refactored `GoogleAuthClientLive` to use `AuthContext.oauth`:
  - Captures AuthContext at layer construction time
  - Service methods have no additional requirements
  - Uses `oauth.getAccessToken` and `oauth.getProviderAccount` for token/scope retrieval

**Key Learnings Applied:**
- Better Auth handles token storage and automatic refresh in the `account` table
- Extending AuthContext avoids cross-slice dependencies from integration packages
- Capturing AuthContext at layer construction time simplifies service method signatures
- `Option<T>` return types are idiomatic for methods that may not find data

### Architectural Decisions Made

| Decision | Rationale |
|----------|-----------|
| Extend AuthContext instead of new service | Avoids cross-slice imports from integration packages to IAM server |
| OAuth API returns Option<T> | Idiomatic Effect, clear semantics for missing data |
| Capture AuthContext at layer construction | Service methods have no requirements, cleaner API |
| Use Better Auth's automatic refresh | Less code, proven implementation |

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| GoogleCalendarAdapter | `packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts` |
| GmailAdapter | `packages/comms/server/src/adapters/GmailAdapter.ts` |
| GmailExtractionAdapter | `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` |
| GoogleAuthClient interface | `packages/integrations/google-workspace/client/src/services/GoogleAuthClient.ts` |
| GoogleAuthClientLive layer | `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts` |
| AuthContext with OAuth API | `packages/shared/domain/src/Policy.ts` |
| Scope constants | `packages/integrations/google-workspace/domain/src/scopes/*.ts` |

### Adapter Interface Pattern

```typescript
// packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpClient } from "@effect/platform";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { CalendarScopes } from "@beep/google-workspace-domain";

export const REQUIRED_SCOPES = [
  CalendarScopes.Events,
] as const;

export class GoogleCalendarAdapter extends Context.Tag("GoogleCalendarAdapter")<
  GoogleCalendarAdapter,
  {
    readonly listEvents: (
      calendarId: string,
      timeMin: Date,
      timeMax: Date
    ) => Effect.Effect<ReadonlyArray<CalendarEvent>, GoogleApiError>;

    readonly createEvent: (
      calendarId: string,
      event: CalendarEvent
    ) => Effect.Effect<CalendarEvent, GoogleApiError>;
  }
>() {}

export const GoogleCalendarAdapterLive = Layer.effect(
  GoogleCalendarAdapter,
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const auth = yield* GoogleAuthClient;

    // ACL translation functions
    const toGoogleFormat = (event: CalendarEvent): GoogleCalendarEvent => ({ ... });
    const fromGoogleFormat = (google: GoogleCalendarEvent): CalendarEvent => ({ ... });

    return GoogleCalendarAdapter.of({
      listEvents: (calendarId, timeMin, timeMax) =>
        Effect.gen(function* () {
          const token = yield* auth.getValidToken(REQUIRED_SCOPES);
          // API call and translation
        }),
    });
  })
);
```

### ACL Translation Pattern

```typescript
// Domain → Google (for sending)
const toGoogleFormat = (event: CalendarEvent): GoogleCalendarEvent => ({
  id: event.id,
  summary: event.title,
  description: O.getOrNull(event.description),
  start: {
    dateTime: DateTime.formatIso(event.startTime),
    timeZone: event.timeZone,
  },
  end: {
    dateTime: DateTime.formatIso(event.endTime),
    timeZone: event.timeZone,
  },
  attendees: A.map(event.attendees, (email) => ({ email })),
});

// Google → Domain (for receiving)
const fromGoogleFormat = (google: GoogleCalendarEvent): CalendarEvent => ({
  id: google.id,
  title: google.summary,
  description: O.fromNullable(google.description),
  startTime: DateTime.unsafeFromString(google.start.dateTime),
  endTime: DateTime.unsafeFromString(google.end.dateTime),
  timeZone: google.start.timeZone,
  attendees: A.map(google.attendees ?? [], (a) => a.email),
});
```

---

## Procedural Memory (Reference Links)

### Effect Patterns (MANDATORY)

- `.claude/rules/effect-patterns.md` - Effect patterns, import conventions
- `documentation/EFFECT_PATTERNS.md` - Detailed Effect patterns

### Existing Code References

- `packages/integrations/google-workspace/client/src/services/` - GoogleAuthClient interface
- `packages/integrations/google-workspace/domain/src/scopes/` - Scope constants
- `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts` - Token retrieval pattern

### Google API References

- Calendar API: `https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
- Gmail API: `https://gmail.googleapis.com/gmail/v1/users/me/messages`
- Drive API: `https://www.googleapis.com/drive/v3/files`

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check Calendar | `bun run check --filter @beep/calendar-server` | No errors |
| Type check Comms | `bun run check --filter @beep/comms-server` | No errors |
| Type check Knowledge | `bun run check --filter @beep/knowledge-server` | No errors |
| Lint all | `bun run lint --filter @beep/*-server` | No errors |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Adapters compile | Type check passes |
| Scopes declared | `REQUIRED_SCOPES` exported from each adapter |
| ACL translation works | Unit tests for translation functions |
| Token flow works | Integration test calling `auth.getValidToken` |

---

## Tasks Breakdown

### Task 1: Create GoogleCalendarAdapter

**File**: `packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts`

**Agent**: `effect-code-writer`

Create Context.Tag interface and Layer with:
- `listEvents(calendarId, timeMin, timeMax)` - List events in range
- `createEvent(calendarId, event)` - Create new event
- `updateEvent(calendarId, eventId, updates)` - Update existing event
- `deleteEvent(calendarId, eventId)` - Delete event
- ACL translation functions (toGoogleFormat, fromGoogleFormat)

**Dependencies**:
- `GoogleAuthClient` from `@beep/google-workspace-client`
- `HttpClient` from `@effect/platform`
- `CalendarScopes` from `@beep/google-workspace-domain`

### Task 2: Create GmailAdapter

**File**: `packages/comms/server/src/adapters/GmailAdapter.ts`

**Agent**: `effect-code-writer`

Create Context.Tag interface and Layer with:
- `listMessages(query, maxResults)` - Search and list messages
- `getMessage(messageId)` - Get full message
- `sendMessage(to, subject, body)` - Send email
- `getThread(threadId)` - Get full thread
- ACL translation functions

**Dependencies**:
- `GoogleAuthClient` from `@beep/google-workspace-client`
- `HttpClient` from `@effect/platform`
- `GmailScopes` from `@beep/google-workspace-domain`

### Task 3: Create GmailExtractionAdapter

**File**: `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`

**Agent**: `effect-code-writer`

Create Context.Tag interface and Layer with:
- `extractEmailsForKnowledgeGraph(query, maxResults)` - Extract emails as documents
- `extractThreadContext(threadId)` - Extract thread as single document
- Translation to `DocumentContent` format for knowledge pipeline

**Dependencies**:
- `GoogleAuthClient` from `@beep/google-workspace-client`
- `HttpClient` from `@effect/platform`
- `GmailScopes` from `@beep/google-workspace-domain`

### Task 4: Update Package Exports

**Files**:
- `packages/calendar/server/src/index.ts`
- `packages/comms/server/src/index.ts`
- `packages/knowledge/server/src/index.ts`

Export new adapters and their Layers.

### Task 5: Run Verification

```bash
bun run check --filter @beep/calendar-server
bun run check --filter @beep/comms-server
bun run check --filter @beep/knowledge-server
bun run lint:fix
```

---

## Handoff to Phase 4

After completing Phase 3:

1. **Update REFLECTION_LOG.md** with learnings about:
   - ACL translation patterns
   - Scope declaration conventions
   - Any challenges with adapter implementation

2. **Create HANDOFF_P4.md** for:
   - Migrating existing code to new adapters
   - Wiring Layers in runtime composition
   - Import path updates

3. **Note on Database Migrations**:
   - No new migrations needed for Phase 2 - Better Auth's `account` table already has OAuth token columns
   - The original `IntegrationTokenStore` approach (with its `integrationToken` table) was superseded
