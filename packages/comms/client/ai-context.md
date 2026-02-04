---
path: packages/comms/client
summary: RPC contracts for notifications, messaging, and email templates (scaffold awaiting implementation)
tags: [comms, client, effect, rpc, websocket, contracts]
---

# @beep/comms-client

Client-side layer for the communications slice. Defines RPC contracts for notifications, messaging, and email template operations. Currently a scaffold awaiting implementation as the comms feature matures. Bridges `@beep/comms-domain` to `@beep/comms-ui`.

## Architecture

```
|-------------------|     |-------------------|
| NotificationContr.|---->|   @effect/rpc     |
| MessagingContr.   |     |   (contracts)     |
| EmailTemplateC.   |     |                   |
|-------------------|     |-------------------|
        |
        v
|-------------------|     |-------------------|
|  @beep/comms-ui   |<----|  TanStack Query   |
|  (React hooks)    |     |  (data fetching)  |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `NotificationContracts` | RPC contracts for push/in-app notifications (pending) |
| `MessagingContracts` | Real-time messaging contracts (pending) |
| `EmailTemplateContracts` | Transactional email template contracts (pending) |

## Usage Patterns

### Request-Response Contract

```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

class CommsError extends S.TaggedError<CommsError>()("CommsError", {
  message: S.String
}) {}

class ListNotificationsResponse extends S.Class<ListNotificationsResponse>("ListNotificationsResponse")({
  notifications: S.Array(NotificationEvent),
  total: S.Number
}) {}

export class ListNotifications extends Rpc.Request<ListNotifications>()(
  "ListNotifications",
  {
    failure: CommsError,
    success: ListNotificationsResponse,
    payload: { userId: S.String, limit: S.optional(S.Number), offset: S.optional(S.Number) }
  }
) {}
```

### WebSocket Streaming Contract

```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

class NotificationEvent extends S.Class<NotificationEvent>("NotificationEvent")({
  id: S.String,
  type: S.Literal("push", "in-app", "email"),
  message: S.String,
  timestamp: S.DateTimeUtc
}) {}

export class SubscribeNotifications extends Rpc.StreamRequest<SubscribeNotifications>()(
  "SubscribeNotifications",
  {
    failure: CommsError,
    success: NotificationEvent,
    payload: { userId: S.String }
  }
) {}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `S.TaggedError` for failures | Typed error channels for predictable client-side handling |
| Separate stream vs request contracts | WebSocket contracts are bidirectional streams, not request-response |
| `S.Union` with catch-all for events | Graceful degradation when server adds new notification types |
| `messageId` in all events | Enable client-side deduplication for network retries |

## Dependencies

**Internal**: `@beep/comms-domain` (domain entities, value objects)

**External**: `effect`, `@effect/rpc`

## Related

- **AGENTS.md** - WebSocket lifecycle gotchas, schema versioning, and security guidelines
