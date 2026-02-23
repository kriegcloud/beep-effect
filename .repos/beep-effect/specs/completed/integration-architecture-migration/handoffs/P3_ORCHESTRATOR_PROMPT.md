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

> ⚠️ **Note**: Phase 2 pivoted from `IntegrationTokenStore` to extending `AuthContext` with OAuth API methods. Better Auth handles token storage.

### What Was Built

1. **AuthContext extended with OAuth API** (`@beep/shared-domain/Policy`):
   - `OAuthApi` type with `getAccessToken` and `getProviderAccount` methods
   - `OAuthTokenError` and `OAuthAccountsError` tagged errors
   - `AuthContextShape.oauth` provides access to OAuth methods

2. **OAuth API implemented** (`packages/runtime/server/src/AuthContext.layer.ts`):
   - `getAccessToken` wraps Better Auth's API, handles automatic token refresh
   - `getProviderAccount` queries account table for scope information
   - Returns `Option<T>` for methods that may not find data

3. **GoogleAuthClientLive refactored** (`packages/integrations/google-workspace/server/`):
   - Depends only on `AuthContext` (no IAM imports)
   - Captures `AuthContext` at layer construction time
   - Implements scope validation for incremental OAuth
   - Returns `GoogleOAuthToken` with typed error union

### Key Patterns Established

```typescript
// GoogleAuthClient interface (client package)
export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  {
    readonly getValidToken: (
      scopes: ReadonlyArray<string>
    ) => Effect.Effect<GoogleOAuthToken, GoogleAuthenticationError | GoogleScopeExpansionRequiredError>;

    readonly refreshToken: (
      refreshToken: string
    ) => Effect.Effect<GoogleOAuthToken, GoogleAuthenticationError>;
  }
>() {}

// GoogleOAuthToken structure
class GoogleOAuthToken {
  readonly accessToken: Option<string>;      // Use O.getOrThrow or O.map
  readonly refreshToken: Option<Redacted<string>>;
  readonly expiryDate: Option<DateTime.Utc>;
  readonly scope: Option<string>;
  readonly tokenType: Option<string>;
}
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
import * as DateTime from "effect/DateTime";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { CalendarScopes, GoogleApiError, GoogleAuthenticationError } from "@beep/google-workspace-domain";

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
    ) => Effect.Effect<ReadonlyArray<CalendarEvent>, GoogleApiError | GoogleAuthenticationError>;
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
          // getValidToken returns GoogleOAuthToken with Option fields
          const token = yield* auth.getValidToken(REQUIRED_SCOPES);

          // Extract access token from Option (will fail if None)
          const accessToken = O.getOrThrow(token.accessToken);

          const response = yield* http.execute(
            HttpClientRequest.get(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`).pipe(
              HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`),
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
              message: `Failed to list events: ${String(e)}`,
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
From Phase 2 (AuthContext.oauth approach):
- GoogleAuthClient provides getValidToken(scopes) returning GoogleOAuthToken
- GoogleOAuthToken has Option fields: accessToken, refreshToken, expiryDate, scope, tokenType
- Use O.getOrThrow(token.accessToken) to extract the access token string
- CalendarScopes defined in @beep/google-workspace-domain/scopes/calendar.scopes.ts
- Error types: GoogleAuthenticationError, GoogleScopeExpansionRequiredError, GoogleApiError

Patterns:
- Use HttpClientRequest for building requests
- Use HttpClientResponse.json for parsing
- ACL translation functions inside Layer.effect
- Export REQUIRED_SCOPES as const array
- Include auth errors in method error union
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
From Phase 2 (AuthContext.oauth approach):
- GoogleAuthClient provides getValidToken(scopes) returning GoogleOAuthToken
- GoogleOAuthToken has Option fields: accessToken, refreshToken, expiryDate, scope, tokenType
- Use O.getOrThrow(token.accessToken) to extract the access token string
- GmailScopes defined in @beep/google-workspace-domain/scopes/gmail.scopes.ts
- Error types: GoogleAuthenticationError, GoogleScopeExpansionRequiredError, GoogleApiError
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
From Phase 2 (AuthContext.oauth approach):
- GoogleAuthClient provides getValidToken(scopes) returning GoogleOAuthToken
- GoogleOAuthToken has Option fields: accessToken, refreshToken, expiryDate, scope, tokenType
- Use O.getOrThrow(token.accessToken) to extract the access token string
- Uses GmailScopes.ReadOnly only (extraction doesn't need send)
- Error types: GoogleAuthenticationError, GoogleScopeExpansionRequiredError, GoogleApiError
- Outputs DocumentContent format for knowledge graph pipeline
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
2. **Create HANDOFF_P4.md** for migration phase (wiring Layers in runtime)
3. **Note**: No database migrations needed - Better Auth's `account` table already stores OAuth tokens
