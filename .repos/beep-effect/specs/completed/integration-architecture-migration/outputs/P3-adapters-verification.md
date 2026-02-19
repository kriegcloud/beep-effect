# Phase 3 Output: Slice Adapters Verification

*Completed: 2026-02-04*

## Summary

Phase 3 successfully created slice-specific adapters for Google Calendar, Gmail (comms), and Gmail extraction (knowledge). Each adapter follows the Anti-Corruption Layer pattern with proper scope declarations and ACL translation.

## Checklist

- [x] GoogleCalendarAdapter created
- [x] GmailAdapter created
- [x] GmailExtractionAdapter created
- [x] ACL translation implemented
- [x] Scopes declared correctly

## Files Created

### Calendar Slice

| File | Purpose |
|------|---------|
| `packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts` | Google Calendar API adapter |
| `packages/calendar/server/src/adapters/index.ts` | Re-exports adapter |

**GoogleCalendarAdapter**:
- `REQUIRED_SCOPES`: `[CalendarScopes.events]`
- Methods: `listEvents`, `createEvent`, `updateEvent`, `deleteEvent`
- ACL: `CreateEventInput` → Google payload, Google response → `CalendarEvent`

### Comms Slice

| File | Purpose |
|------|---------|
| `packages/comms/server/src/adapters/GmailAdapter.ts` | Gmail API adapter for send/list/get |
| `packages/comms/server/src/adapters/index.ts` | Re-exports adapter |

**GmailAdapter**:
- `REQUIRED_SCOPES`: `[GmailScopes.read, GmailScopes.send]`
- Methods: `listMessages`, `getMessage`, `sendMessage`, `getThread`
- ACL: RFC 2822 message creation, base64url encoding/decoding

### Knowledge Slice

| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` | Read-only email extraction |
| `packages/knowledge/server/src/adapters/index.ts` | Re-exports adapter |

**GmailExtractionAdapter**:
- `REQUIRED_SCOPES`: `[GmailScopes.read]` (read-only for extraction)
- Methods: `extractEmailsForKnowledgeGraph`, `extractThreadContext`
- ACL: Gmail message → `ExtractedEmailDocument` with metadata

## ACL Translation Details

### GoogleCalendarAdapter

```typescript
// Domain → Google
const toGoogleFormat = (input: CreateEventInput): GoogleCalendarEventPayload => ({
  summary: input.summary,
  description: input.description,
  start: { dateTime: DateTime.formatIso(input.startTime), timeZone },
  end: { dateTime: DateTime.formatIso(input.endTime), timeZone },
  attendees: input.attendees?.map(email => ({ email }))
});

// Google → Domain
const fromGoogleFormat = (google: GoogleCalendarEventResponse): CalendarEvent => ({
  id: google.id,
  summary: google.summary ?? "",
  description: O.fromNullable(google.description),
  startTime: parseDateTime(google.start),
  endTime: parseDateTime(google.end),
  // ...
});
```

### GmailAdapter

- Base64url encoding for message bodies
- RFC 2822 format for send operations
- Thread and message list translation

### GmailExtractionAdapter

- Schema-validated API responses
- HTML stripping for plain text extraction
- Thread context aggregation with participant deduplication

## Scope Ownership

| Adapter | Scopes | Rationale |
|---------|--------|-----------|
| GoogleCalendarAdapter | `calendar.events` | Full CRUD on calendar events |
| GmailAdapter | `gmail.readonly`, `gmail.send` | Read and send emails |
| GmailExtractionAdapter | `gmail.readonly` | Read-only for knowledge extraction |

## Dependency Graph

```
GoogleCalendarAdapterLive
  ├── GoogleAuthClient
  └── HttpClient.HttpClient

GmailAdapterLive
  ├── GoogleAuthClient
  └── HttpClient.HttpClient

GmailExtractionAdapterLive
  ├── GoogleAuthClient
  └── HttpClient.HttpClient
```

## Verification Results

### Type Checks

```
✓ @beep/calendar-server - 0 errors
✓ @beep/comms-server - 0 errors
✓ @beep/knowledge-server - 0 errors
```

### Cross-Slice Dependency Check

```bash
$ grep -r "from.*@beep/iam-server" packages/calendar  # No matches
$ grep -r "from.*@beep/iam-server" packages/comms     # No matches
$ grep -r "from.*@beep/iam-server" packages/knowledge # No matches
```

Zero cross-slice dependencies - adapters only depend on:
- `@beep/google-workspace-client` (GoogleAuthClient)
- `@beep/google-workspace-domain` (errors, scopes)
- `@effect/platform` (HttpClient)

## Notes

- All adapters use `Layer.effect` pattern for service creation
- Each adapter includes `Effect.withSpan` for observability
- Error types are properly typed as union: `GoogleApiError | GoogleAuthenticationError | GoogleScopeExpansionRequiredError`
- Knowledge adapter uses Schema validation for API responses
