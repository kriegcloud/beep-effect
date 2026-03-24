# @repo/presence

Presence tracking service for the [bEvr stack](../../README.md). Maintains
connected client state and publishes presence events for WebSocket flows.

## Overview

This package exposes an Effect service that tracks connected clients, manages
status updates, and publishes events through a PubSub.

## Usage

```typescript
import { PresenceService } from "@repo/presence";
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const presence = yield* PresenceService;
  const clientId = presence.generateClientId();
  yield* presence.addClient(clientId, {
    clientId,
    status: "online",
    connectedAt: Date.now(),
  });
});
```

## Removing From Apps

### Server

1. Remove presence RPC wiring:
   - `apps/server/src/index.ts`: remove `PresenceService` import and the
     `Layer.provide(PresenceService.Default)` call.
2. Remove the presence RPC implementation:
   - `apps/server/src/Rpc/Presence.ts`: delete the file.
   - `apps/server/src/index.ts`: remove `PresenceRpcLive` usage and the
     `WebSocketRpcRouter` block if presence is the only WebSocket RPC.
3. Remove dependencies:
   - `apps/server/package.json`: remove `@repo/presence`.

### Client

1. Remove the presence UI and atoms:
   - `apps/client/src/app.tsx`: remove `<PresencePanel />` and its import.
   - `apps/client/src/components/presence-panel.tsx`: delete the file.
   - `apps/client/src/lib/web-socket-client.ts`: delete the file.
2. Remove any presence-related test mocks:
   - `apps/client/src/app.test.tsx`: remove the `web-socket-client` mock if
     unused.

## Learn More

- [bEvr Stack Overview](../../README.md)
