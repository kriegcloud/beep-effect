# @beep/comms-client — Agent Guide

## Overview

Provides the client-side CLIENT layer for the communications slice, enabling frontend applications to interact with messaging, notifications, and communication features.

This package:
- Defines RPC contracts for communication operations (notifications, messaging, email templates)
- Exports client-side type-safe API contracts used by the web app
- Acts as the bridge between `@beep/comms-domain` and `@beep/comms-ui` layers
- Currently a minimal scaffold awaiting contract implementations as the comms feature matures

## Key Exports

**(Scaffold)** — Package is initialized but awaiting contract implementations. Future exports will include:

| Export | Description |
|--------|-------------|
| `NotificationContracts` | RPC contracts for push/in-app notifications (pending) |
| `MessagingContracts` | Real-time messaging contracts (pending) |
| `EmailTemplateContracts` | Transactional email template contracts (pending) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/comms-domain` | Domain entities and value objects for communications |
| `@beep/schema` | Schema utilities for validation |
| `effect` | Core Effect runtime |
| `@effect/rpc` | RPC contract definitions |

## Usage Patterns

### Consuming RPC Contracts (Future)

Once contracts are implemented, frontend apps will import and use them like this:

```typescript
import * as Effect from "effect/Effect"
import { NotificationContracts } from "@beep/comms-client"

// Example: Fetching user notifications
const program = Effect.gen(function* () {
  const client = yield* NotificationContracts.Client
  const notifications = yield* client.list({ userId })
  return notifications
})
```

### WebSocket Streaming (Future)

Real-time features will use streaming contracts:

```typescript
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { NotificationContracts } from "@beep/comms-client"

// Example: Subscribe to live notification updates
const subscribeToNotifications = Effect.gen(function* () {
  const client = yield* NotificationContracts.Client
  return yield* client.subscribe({ userId })
})
```

## Integration Points

- **Consumed by**: `@beep/comms-ui` and `@beep/web` for communication features
- **Depends on**: `@beep/comms-domain` for entity types and value objects
- **Communicates with**: `@beep/comms-server` via RPC contracts

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Maintain typed error channels using `S.TaggedError` for predictable client-side error handling.
- Keep contracts thin — business logic belongs in domain or server layers.
- Use `"use client"` directive for React-specific exports that need client-side bundling.
- Consider real-time contract patterns for WebSocket-based features.

## Verifications
- `bun run check --filter @beep/comms-client`
- `bun run lint --filter @beep/comms-client`
- `bun run test --filter @beep/comms-client`

## Testing

- Run tests: `bun run test --filter=@beep/comms-client`
- Use `@beep/testkit` (located in `tooling/testkit`) for Effect testing utilities
- ALWAYS test contract request/response schemas
- Test error mapping completeness

## Security

### Request Validation
- ALWAYS validate all contract inputs using Effect Schema — never trust client-side data.
- NEVER include sensitive data (passwords, tokens) in contract request payloads — use secure transport mechanisms.
- Contract error responses MUST NOT leak internal implementation details — use typed error channels with safe messages.

### WebSocket Security
- ALWAYS require authentication tokens for WebSocket connection establishment.
- NEVER store authentication tokens in localStorage for WebSocket reconnection — prefer httpOnly cookies or secure session references.
- WebSocket contracts MUST validate message schemas before processing — reject malformed payloads.
- ALWAYS implement exponential backoff for WebSocket reconnection attempts to prevent server overload.

### Data Exposure
- NEVER expose user IDs or internal identifiers in client-facing error messages.
- Contract responses MUST filter sensitive fields — use schema projections to limit exposed data.
- PREFER server-side pagination for notification lists — never fetch unbounded datasets.

## Gotchas

### WebSocket Connection Lifecycle in React
- **Symptom**: Multiple WebSocket connections open; memory leaks; missed messages after component remount.
- **Root Cause**: React's strict mode double-mounts components, and cleanup functions don't properly close WebSocket connections.
- **Solution**: Use Effect's resource management (`Effect.acquireRelease`) for WebSocket lifecycle. Store connection in a singleton layer, not component state. Implement connection pooling for multiple subscribers.

### Real-Time vs Request-Response Contract Patterns
- **Symptom**: Type errors or runtime failures when treating WebSocket message contracts like HTTP contracts.
- **Root Cause**: WebSocket contracts are bidirectional streams, not request-response pairs.
- **Solution**: Define separate contract types for WebSocket messages. Use `S.Union` for message discriminators. Real-time contracts should model the full message envelope, not just payloads.

### Notification Payload Schema Versioning
- **Symptom**: Client crashes or shows broken notifications after server deploys new notification types.
- **Root Cause**: Server adds new notification types that client doesn't recognize.
- **Solution**: Notification schemas MUST use `S.Union` with a catch-all variant for unknown types. Client should gracefully degrade for unrecognized notifications rather than crash.

### Push Notification Token Refresh
- **Symptom**: Push notifications stop arriving after app restart or token expiry.
- **Root Cause**: Device push tokens expire and must be re-registered with the server.
- **Solution**: Implement token refresh logic that re-registers with server on app launch. Contract for token registration should be idempotent (safe to call multiple times with same token).

### Email Template Contract Response Latency
- **Symptom**: UI freezes or timeouts when previewing email templates.
- **Root Cause**: Email template rendering may involve server-side processing that takes longer than typical RPC calls.
- **Solution**: Email preview contracts should use longer timeout configurations. Consider streaming responses for large templates. Provide loading states in UI.

### Message Deduplication
- **Symptom**: Same notification or message appears multiple times in UI.
- **Root Cause**: Network retries or reconnection delivers duplicate messages; client doesn't deduplicate.
- **Solution**: All message contracts MUST include unique `messageId` field. Client implementations should maintain a seen-message set (bounded, e.g., last 1000 IDs) and skip duplicates.

## Quick Recipes

### WebSocket Contract Pattern

```typescript
import * as Rpc from "@effect/rpc/Rpc"
import * as S from "effect/Schema"
import * as F from "effect/Function"
import * as Effect from "effect/Effect"

// Define error schema
class CommsError extends S.TaggedError<CommsError>()(
  "CommsError",
  { message: S.String }
) {}

// Define notification event schema
class NotificationEvent extends S.Class<NotificationEvent>("NotificationEvent")({
  id: S.String,
  type: S.Literal("push", "in-app", "email"),
  message: S.String,
  timestamp: S.DateTimeUtc
}) {}

// StreamRequest for real-time updates
export class SubscribeNotifications extends Rpc.StreamRequest<SubscribeNotifications>()(
  "SubscribeNotifications",
  {
    failure: CommsError,
    success: NotificationEvent,
    payload: {
      userId: S.String
    }
  }
) {}
```

### Request-Response Contract Pattern

```typescript
import * as Rpc from "@effect/rpc/Rpc"
import * as S from "effect/Schema"

// Define request/response schemas
class ListNotificationsRequest extends S.Class<ListNotificationsRequest>("ListNotificationsRequest")({
  userId: S.String,
  limit: S.optional(S.Number).withDefault(() => 20),
  offset: S.optional(S.Number).withDefault(() => 0)
}) {}

class ListNotificationsResponse extends S.Class<ListNotificationsResponse>("ListNotificationsResponse")({
  notifications: S.Array(NotificationEvent),
  total: S.Number
}) {}

// Define RPC contract
export class ListNotifications extends Rpc.Request<ListNotifications>()(
  "ListNotifications",
  {
    failure: CommsError,
    success: ListNotificationsResponse,
    payload: ListNotificationsRequest
  }
) {}
```

## Contributor Checklist
- [ ] Ensure all contracts have corresponding server-side implementations in `@beep/comms-server`.
- [ ] Add proper TypeScript doc comments for contract exports.
- [ ] Use Effect Schema for all data validation — no bare type assertions.
- [ ] Consider WebSocket contracts for real-time notification features.
- [ ] Verify error responses do not leak sensitive information.
- [ ] Re-run verification commands above before handing work off.
