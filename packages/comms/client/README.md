# @beep/comms-client

Client SDK layer for the communications slice, providing contracts for messaging, notifications, and communication features.

## Purpose

The communications client package provides the SDK layer for all communications-related features in the beep-effect application. It serves as the bridge between the comms domain logic and UI components, exposing typed RPC contracts for frontend applications to interact with messaging, notifications, email templates, and real-time communication features. The package uses Effect's contract-based architecture to ensure type-safe client-server communication with structured error handling.

This package is currently a minimal scaffold awaiting contract implementations as the communications feature set expands. Future implementations will include notification delivery contracts, real-time messaging contracts, and email template management contracts.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-client": "workspace:*"
```

## Key Exports

This package is currently in scaffold state with no exported contracts yet. Future exports will include:

| Export | Description |
|--------|-------------|
| `NotificationContracts` | Contract kit for push, in-app, and email notifications |
| `MessagingContracts` | Contract kit for real-time messaging features |
| `EmailTemplateContracts` | Contract kit for transactional email management |
| `WebSocketContracts` | Real-time update contracts for live notifications |

## Usage

### Basic Contract Usage (Future)

Once contracts are implemented, they will follow this pattern:

```typescript
import * as NotificationContracts from "@beep/comms-client";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const sendNotification = F.pipe(
  NotificationContracts.Send.implement({
    userId: "user-123",
    message: "Your document was approved",
    type: "success"
  }),
  Effect.catchTag("CommsError", (error) =>
    Effect.log({ message: "Notification failed", error })
  )
);
```

### With TanStack Query (Future)

```typescript
import { useQuery } from "@tanstack/react-query";
import * as NotificationContracts from "@beep/comms-client";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { Atom } from "@effect-atom/atom-react";

const runtime = Atom.runtime(clientRuntimeLayer);

function NotificationList({ userId }: { userId: string }) {
  const { data: notifications } = useQuery({
    queryKey: ["notifications", userId, "unread"],
    queryFn: () => runtime.runPromise(
      NotificationContracts.GetUnread.implement({ userId })
    )
  });

  return <div>{/* Render notifications */}</div>;
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@beep/contract` | Contract system for type-safe request/response schemas |
| `@beep/comms-domain` | Domain models for communications slice |
| `@beep/schema` | Reusable Effect schemas for validation |
| `@beep/errors` | Error handling and telemetry |

## Integration

- **Domain Layer**: Consumes entity models and business logic from `@beep/comms-domain`
- **Server Layer**: Contracts implemented here must have corresponding handlers in `@beep/comms-server`
- **UI Layer**: Components in `@beep/comms-ui` consume these contracts via TanStack Query hooks
- **Shared Client**: Follows patterns established in `@beep/shared-client` for contract structure

## Development

```bash
# Type check
bun run --filter @beep/comms-client check

# Lint
bun run --filter @beep/comms-client lint

# Lint and auto-fix
bun run --filter @beep/comms-client lint:fix

# Build
bun run --filter @beep/comms-client build

# Run tests
bun run --filter @beep/comms-client test

# Test with coverage
bun run --filter @beep/comms-client coverage

# Watch mode for development
bun run --filter @beep/comms-client dev
```

## Notes

### Contract Definition Guidelines

When implementing contracts, follow these patterns:

- Define contracts using `Contract.make` from `@beep/contract` with proper request/response schemas
- Use `S.TaggedError` for structured error types (e.g., `CommsError`)
- Include metadata annotations for domain/method tracking
- Keep contracts thin - business logic belongs in `@beep/comms-domain` and `@beep/comms-server`
- Use `"use client"` directive for React-specific exports that need client-side bundling

### Real-Time Features

For WebSocket-based features like live notifications:

- Consider using WebSocket contracts for bidirectional communication
- Integrate with Effect's streaming primitives (`Stream`, `Queue`)
- Ensure proper connection lifecycle management in client runtime

### Error Handling

All contracts should use structured error channels:

- Define a `CommsError` tagged error type with code, message, and metadata
- Use Effect's `catchTag` for predictable error handling
- Provide detailed error messages for client-side user feedback

### Testing

- Test contract schema validation (payload, success, failure schemas)
- Mock server responses for contract implementations
- Verify error normalization and structured metadata
- Use `@beep/testkit` for Effect-based test utilities
