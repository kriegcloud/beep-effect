# P3 Orchestrator Prompt: Slice-Specific Adapters

> Copy this entire file as your initial prompt to start Phase 3.

---

## Mission

Implement slice-specific Google Workspace adapters that translate between domain models and Google API formats. Each adapter uses the shared `GoogleAuthClient` for token management and declares its required OAuth scopes.

**Primary Deliverables:**
1. `GoogleCalendarAdapter` in `@beep/calendar-server`
2. `GmailAdapter` in `@beep/comms-server`
3. `GmailExtractionAdapter` in `@beep/knowledge-server`

**Success Criteria:**
- All adapters compile without errors
- Each adapter exports `REQUIRED_SCOPES` constant
- ACL translation preserves data integrity
- Type checks pass for all slice server packages

---

## Context from Phase 2

### What Was Built

1. **IntegrationsEntityIds.IntegrationTokenId** in `@beep/shared-domain`:
   - Location: `packages/shared/domain/src/entity-ids/integrations/ids.ts`
   - Pattern: `EntityId.builder("integrations").create("integration_token")`

2. **IntegrationTokenStore Interface** in `@beep/iam-domain`:
   - Location: `packages/iam/domain/src/services/IntegrationTokenStore.ts`
   - Methods: `get`, `store`, `refresh`, `revoke`
   - Associated types: `StoredToken`, `TokenNotFoundError`, `TokenRefreshError`

3. **integrationToken Table** in `@beep/iam-tables`:
   - Location: `packages/iam/tables/src/tables/integration-token.table.ts`
   - Schema: userId, organizationId, provider, encrypted tokens, scopes, lifecycle fields

4. **IntegrationTokenStoreLive Layer** in `@beep/iam-server`:
   - Location: `packages/iam/server/src/services/IntegrationTokenStoreLive.ts`
   - Dependencies: `IamDb.Db`, `EncryptionService.EncryptionService`
   - Pattern: Internal helpers (`getImpl`, `storeImpl`) for self-reference

5. **GoogleAuthClientLive Updated**:
   - Location: `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`
   - Now uses `IntegrationTokenStore` for real token storage
   - Implements token refresh via Google's OAuth endpoint

### Key Patterns Established

```typescript
// Internal helper pattern for service self-reference
const getImpl = (userId, provider) => Effect.gen(function* () { ... });
const storeImpl = (userId, provider, token) => Effect.gen(function* () { ... });

return Service.of({
  get: (userId, provider) => getImpl(userId, provider).pipe(Effect.orDie),
  refresh: (userId, provider, fn) => Effect.gen(function* () {
    const token = yield* getImpl(userId, provider);  // Direct internal call
    // ...
  }),
});
```

---

## Critical Patterns for Phase 3

### 1. Adapter Structure

```typescript
// packages/{slice}/server/src/adapters/{Provider}Adapter.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { CalendarScopes, GoogleApiError } from "@beep/google-workspace-domain";

// REQUIRED: Declare scopes as const array
export const REQUIRED_SCOPES = [
  CalendarScopes.Events,
] as const;

// Context.Tag interface
export class GoogleCalendarAdapter extends Context.Tag("GoogleCalendarAdapter")<
  GoogleCalendarAdapter,
  {
    readonly listEvents: (
      calendarId: string,
      timeMin: Date,
      timeMax: Date
    ) => Effect.Effect<ReadonlyArray<CalendarEvent>, GoogleApiError>;
  }
>() {}

// Layer implementation
export const GoogleCalendarAdapterLive = Layer.effect(
  GoogleCalendarAdapter,
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const auth = yield* GoogleAuthClient;

    // ACL translation functions (defined inside Layer)
    const toGoogleFormat = (event: CalendarEvent): GoogleCalendarEvent => ({ ... });
    const fromGoogleFormat = (google: GoogleCalendarEvent): CalendarEvent => ({ ... });

    return GoogleCalendarAdapter.of({
      listEvents: (calendarId, timeMin, timeMax) =>
        Effect.gen(function* () {
          const token = yield* auth.getValidToken(REQUIRED_SCOPES);

          const response = yield* http.execute(
            HttpClientRequest.get(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`).pipe(
              HttpClientRequest.setHeader("Authorization", `Bearer ${token.accessToken}`),
              HttpClientRequest.setUrlParams({
                timeMin: DateTime.formatIso(DateTime.unsafeMake(timeMin)),
                timeMax: DateTime.formatIso(DateTime.unsafeMake(timeMax)),
                singleEvents: "true",
                orderBy: "startTime",
              })
            )
          ).pipe(
            Effect.flatMap(HttpClientResponse.json),
            Effect.mapError((e) => new GoogleApiError({
              message: `Failed to list events: ${e.message}`,
              statusCode: 500,
              method: "GET",
              endpoint: `/calendars/${calendarId}/events`,
            }))
          );

          return A.map(response.items ?? [], fromGoogleFormat);
        }).pipe(Effect.withSpan("GoogleCalendarAdapter.listEvents")),
    });
  })
);
```

### 2. ACL Translation Pattern

```typescript
// Domain → Google (outbound)
const toGoogleFormat = (event: CalendarEvent): GoogleCalendarEvent => ({
  id: event.id,
  summary: event.title,
  description: O.getOrUndefined(event.description),
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

// Google → Domain (inbound)
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

### 3. HttpClient Usage

```typescript
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";

// GET with query params
const response = yield* http.execute(
  HttpClientRequest.get(url).pipe(
    HttpClientRequest.setHeader("Authorization", `Bearer ${token.accessToken}`),
    HttpClientRequest.setUrlParams({ param1: "value1" })
  )
).pipe(
  Effect.flatMap(HttpClientResponse.json)
);

// POST with JSON body
const response = yield* http.execute(
  HttpClientRequest.post(url).pipe(
    HttpClientRequest.setHeader("Authorization", `Bearer ${token.accessToken}`),
    HttpClientRequest.jsonBody(payload)
  )
).pipe(
  Effect.flatMap(Effect.flatMap(HttpClientResponse.json))
);
```

---

## Step-by-Step Execution Plan

### Step 1: Research Existing Patterns (Orchestrator)

Before delegating, gather context:

```bash
# Find existing adapter patterns
Glob: packages/**/adapters/**/*.ts

# Find domain models for each slice
Grep: "export class.*Event" path:packages/calendar/domain
Grep: "export class.*Email" path:packages/comms/domain
Grep: "export class.*Document" path:packages/knowledge/domain

# Check GoogleAuthClient interface
Read: packages/integrations/google-workspace/client/src/services/GoogleAuthClient.ts
```

### Step 2: Create GoogleCalendarAdapter (Agent)

**Agent**: `effect-code-writer`

**Prompt**:
```
Create GoogleCalendarAdapter for @beep/calendar-server.

<contextualization>
From Phase 2:
- GoogleAuthClient provides getValidToken(scopes) returning StoredToken
- StoredToken has: accessToken, refreshToken (Option), expiresAt, scopes, provider
- CalendarScopes defined in @beep/google-workspace-domain/scopes/calendar.scopes.ts

Patterns:
- Use HttpClientRequest for building requests
- Use HttpClientResponse.json for parsing
- ACL translation functions inside Layer.effect
- Export REQUIRED_SCOPES as const array
</contextualization>

Create:
1. REQUIRED_SCOPES constant with CalendarScopes.Events
2. GoogleCalendarAdapter Context.Tag with methods:
   - listEvents(calendarId, timeMin, timeMax)
   - createEvent(calendarId, event)
   - updateEvent(calendarId, eventId, updates)
   - deleteEvent(calendarId, eventId)
3. GoogleCalendarAdapterLive Layer
4. ACL translation functions (toGoogleFormat, fromGoogleFormat)

File: packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts
```

### Step 3: Create GmailAdapter (Agent)

**Agent**: `effect-code-writer`

**Prompt**:
```
Create GmailAdapter for @beep/comms-server.

<contextualization>
Same patterns as GoogleCalendarAdapter.
GmailScopes defined in @beep/google-workspace-domain/scopes/gmail.scopes.ts
</contextualization>

Create:
1. REQUIRED_SCOPES with GmailScopes.ReadOnly, GmailScopes.Send
2. GmailAdapter Context.Tag with methods:
   - listMessages(query, maxResults)
   - getMessage(messageId)
   - sendMessage(to, subject, body)
   - getThread(threadId)
3. GmailAdapterLive Layer
4. ACL translation functions

File: packages/comms/server/src/adapters/GmailAdapter.ts
```

### Step 4: Create GmailExtractionAdapter (Agent)

**Agent**: `effect-code-writer`

**Prompt**:
```
Create GmailExtractionAdapter for @beep/knowledge-server.

<contextualization>
Uses GmailScopes.ReadOnly only (extraction doesn't need send).
Outputs DocumentContent format for knowledge graph pipeline.
</contextualization>

Create:
1. REQUIRED_SCOPES with GmailScopes.ReadOnly only
2. GmailExtractionAdapter Context.Tag with methods:
   - extractEmailsForKnowledgeGraph(query, maxResults)
   - extractThreadContext(threadId)
3. GmailExtractionAdapterLive Layer
4. Translation to DocumentContent format

File: packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts
```

### Step 5: Update Package Exports (Agent)

**Agent**: `effect-code-writer`

Update index.ts files to export new adapters.

### Step 6: Verification (Orchestrator)

```bash
bun run check --filter @beep/calendar-server
bun run check --filter @beep/comms-server
bun run check --filter @beep/knowledge-server
bun run lint:fix
```

---

## File Locations

| Item | Path |
|------|------|
| GoogleCalendarAdapter | `packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts` |
| GmailAdapter | `packages/comms/server/src/adapters/GmailAdapter.ts` |
| GmailExtractionAdapter | `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` |
| CalendarScopes | `packages/integrations/google-workspace/domain/src/scopes/calendar.scopes.ts` |
| GmailScopes | `packages/integrations/google-workspace/domain/src/scopes/gmail.scopes.ts` |
| GoogleAuthClient | `packages/integrations/google-workspace/client/src/services/GoogleAuthClient.ts` |

---

## Verification Checklist

After implementation:

- [ ] `bun run check --filter @beep/calendar-server` passes
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] Each adapter exports `REQUIRED_SCOPES`
- [ ] Each adapter exports `{Name}AdapterLive` Layer
- [ ] ACL functions handle null/undefined from Google API
- [ ] `bun run lint:fix` completes without errors

---

## Post-Phase Actions

1. **Update REFLECTION_LOG.md** with Phase 3 learnings
2. **Create HANDOFF_P4.md** for migration phase
3. **Run database migrations** (if not done in P2):
   ```bash
   bun run db:generate
   bun run db:migrate
   ```
