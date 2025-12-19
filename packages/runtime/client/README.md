# @beep/runtime-client

Browser-side Effect ManagedRuntime with OpenTelemetry observability, effect-atom integration, and RPC worker access for the beep-effect monorepo.

## Overview

`@beep/runtime-client` provides the client-side Effect runtime infrastructure that powers all browser surfaces in the beep-effect application. It assembles a `ManagedRuntime` with:

- **OpenTelemetry Web SDK** for traces, logs, and metrics via OTLP exporters
- **Effect-atom registry** integration for reactive state management
- **RPC worker client** for offloading computation to web workers
- **Network monitoring** service tracking browser connectivity
- **IndexedDB and localStorage** key-value store implementations
- **Browser-safe HTTP client** using Fetch API

The runtime is mounted via `BeepProvider` in the App Router shell and shared across all client components through React context and the effect-atom registry.

## Key Exports

### Runtime Providers

- **`BeepProvider`** — Top-level React provider that instantiates and manages the `LiveManagedRuntime`
- **`KaServices`** — Effect-atom registry mount point that injects `clientRuntimeLayer` into all atoms
- **`useRuntime`** — React hook to access the runtime from within components

### Runtime Layers

- **`clientRuntimeLayer`** — Main composition of all browser-safe Effect services:
  - `HttpClient` (Fetch-based)
  - `ToasterService` for UI notifications
  - `NetworkMonitor` for connectivity tracking
  - `WorkerClient` for RPC worker access
  - `KeyValueStore` (localStorage by default)
  - `ApiClient` for Better Auth HTTP integration
  - `Geolocation` for browser geolocation tracking (when enabled)
  - OpenTelemetry exporters and logging

- **`ObservabilityLive`** — Merged telemetry stack with trace/log/metric exporters
- **`LoggerLive`** — Pretty logs in dev, JSON logs in production
- **`LogLevelLive`** — Debug level in dev, Info level in production

### Runtime Helpers

- **`runClientPromise`** — Execute an Effect within the runtime, wrapped in an observability span
- **`makeRunClientPromise`** — Curried version bound to a specific runtime for reuse
- **`runClientPromiseExit`** — Execute and return the Exit value instead of unwrapping
- **`makeRunClientPromiseExit`** — Curried Exit-returning version

### Services

- **`NetworkMonitor`** — Exposes browser online/offline state via `SubscriptionRef` and `Latch`
- **`WorkerClient`** — RPC client for communicating with the web worker (see `worker/worker.ts`)
- **`layerIndexedDB`** — Optional IndexedDB-backed `KeyValueStore` layer (from `@beep/runtime-client/services/common/layer-indexed-db`)
- **`ApiClient`** — Better Auth HTTP client service (from `@beep/runtime-client/services/common/iam-api-client`)

### SSR Utilities

Re-exported from `./atom`:
- **`urlSearchParamSSR`** — URL search param atoms compatible with SSR

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BeepProvider                            │
│  (apps/web/src/GlobalProviders.tsx)                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            LiveManagedRuntime                           │ │
│  │  (ManagedRuntime.make(clientRuntimeLayer))              │ │
│  │                                                          │ │
│  │  Services:                                               │ │
│  │  • HttpClient (Fetch)                                   │ │
│  │  • ToasterService                                       │ │
│  │  • NetworkMonitor                                       │ │
│  │  • WorkerClient (RPC)                                   │ │
│  │  • KeyValueStore (localStorage)                         │ │
│  │  • ApiClient (Better Auth)                              │ │
│  │  • OpenTelemetry (traces, logs, metrics)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         RuntimeProvider (React Context)                 │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │       RegistryProvider (effect-atom)             │  │ │
│  │  │                                                   │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │        KaServices (useAtomMount)          │  │  │ │
│  │  │  │                                            │  │  │ │
│  │  │  │  All atoms share clientRuntimeLayer       │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │                                                   │  │ │
│  │  │  Application Components                          │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Provider Setup

Mount `BeepProvider` at the root of your Next.js application:

```tsx
// apps/web/src/GlobalProviders.tsx
import { BeepProvider } from "@beep/runtime-client";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <BeepProvider>
      {children}
    </BeepProvider>
  );
}
```

Mount `KaServices` under the effect-atom `RegistryProvider`:

```tsx
// apps/web/src/app/layout.tsx
import { RegistryProvider } from "@effect-atom/atom-react";
import { KaServices } from "@beep/runtime-client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegistryProvider>
      <KaServices />
      {children}
    </RegistryProvider>
  );
}
```

### Using the Runtime in Components

Access the runtime via the `useRuntime` hook:

```tsx
import * as Effect from "effect/Effect";
import { useRuntime, makeRunClientPromise } from "@beep/runtime-client";

function MyComponent() {
  const runtime = useRuntime();

  const handleClick = () => {
    const run = makeRunClientPromise(runtime, "myComponent.handleClick");

    run(
      Effect.gen(function* () {
        // Your Effect logic here
        yield* Effect.log("Button clicked");
        return "success";
      })
    );
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Creating Effect-Atom State

Create atoms that automatically have access to the client runtime through `KaServices`:

```tsx
import * as F from "effect/Function";
import * as O from "effect/Option";
import { Atom, useAtom } from "@effect-atom/atom-react";
import { withToast } from "@beep/ui/common/with-toast";
import { SignOutImplementations } from "@beep/iam-client";

// Atoms created with Atom.fn automatically have access to clientRuntimeLayer
// when KaServices is mounted in the app
const signOutAtom = Atom.fn(
  F.flow(
    SignOutImplementations.SignOutContract,
    withToast({
      onWaiting: "Signing out",
      onSuccess: "Signed out successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (error) => error.message,
      }),
    })
  )
);

export const useSignOut = () => useAtom(signOutAtom);
```

### Extending the Runtime with IndexedDB

For atoms that need persistent storage, you can provide additional layers:

```tsx
import * as Effect from "effect/Effect";
import { layerIndexedDB } from "@beep/runtime-client/services/common/layer-indexed-db";
import * as KeyValueStore from "@effect/platform/KeyValueStore";

// Use IndexedDB in an Effect
const storeData = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;
  yield* store.set("myKey", "myValue");
}).pipe(Effect.provide(layerIndexedDB({ dbName: "beep-cache", storeName: "kv" })));
```

### Executing Worker RPC

Offload computation to a web worker:

```tsx
import * as Effect from "effect/Effect";
import { makeRunClientPromise } from "@beep/runtime-client";
import { WorkerClient } from "@beep/runtime-client/worker/worker-client";

export const runWorkerFilter = (runtime: import("@beep/runtime-client").LiveManagedRuntime) =>
  makeRunClientPromise(runtime, "worker.filterData")(
    Effect.gen(function* () {
      const worker = yield* WorkerClient;
      const payload = {
        data: [1, 2, 3, 4, 5] as const,
        threshold: 2,
      };
      return yield* worker.client.filterData(payload);
    })
  );
```

### Monitoring Network Connectivity

React to online/offline state changes:

```tsx
import * as Effect from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { NetworkMonitor } from "@beep/runtime-client/services/common/network-monitor";

const checkConnectivity = Effect.gen(function* () {
  const monitor = yield* NetworkMonitor;

  // Current state
  const isOnline = yield* SubscriptionRef.get(monitor.ref);

  // Wait until online
  if (!isOnline) {
    yield* monitor.latch.await;
  }

  // Proceed with network request
  yield* Effect.log("Network is available");
});
```

## Effect Patterns

### Namespace Imports (Required)

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as O from "effect/Option";
```

### Never Use Native Methods

```typescript
// ❌ FORBIDDEN
items.map(x => x.id);
str.toUpperCase();
Object.keys(obj);

// ✅ REQUIRED
F.pipe(items, A.map(x => x.id));
F.pipe(str, Str.toUpperCase);
F.pipe(obj, Struct.keys);
```

### Effect-First Development

```typescript
// ❌ Avoid async/await
async function fetchData() {
  const response = await fetch("/api/data");
  return response.json();
}

// ✅ Use Effect
import * as HttpClient from "@effect/platform/HttpClient";

const fetchData = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient;
  const response = yield* client.get("/api/data");
  return yield* response.json;
});
```

## Service Boundaries

### What Lives Here

- Browser-only runtime infrastructure
- Client-side ManagedRuntime assembly
- OpenTelemetry Web SDK configuration
- Effect-atom integration
- Worker RPC client setup
- Network connectivity monitoring
- Browser storage adapters

### What Lives Elsewhere

- **Server runtime**: `@beep/runtime-server`
- **Business logic**: Domain packages (`@beep/iam-domain`, `@beep/documents-domain`)
- **Data access**: Infra packages (`@beep/iam-server`, `@beep/documents-server`)
- **React components**: UI packages (`@beep/iam-ui`, `@beep/documents-ui`, `@beep/ui`)
- **API contracts**: SDK packages (`@beep/iam-client`, `@beep/documents-client`)

## Development

```bash
# Type check
bun run --filter @beep/runtime-client check

# Lint
bun run --filter @beep/runtime-client lint
bun run --filter @beep/runtime-client lint:fix

# Test
bun run --filter @beep/runtime-client test

# Build
bun run --filter @beep/runtime-client build
```

## Dependencies

### Core Runtime
- `effect` — Effect runtime
- `@effect/platform` — Cross-platform HTTP, KeyValueStore
- `@effect/platform-browser` — Browser-specific implementations
- `@effect/rpc` — RPC protocol for worker communication
- `@effect/opentelemetry` — Observability integration

### Telemetry
- `@opentelemetry/sdk-trace-web` — Web tracing
- `@opentelemetry/exporter-trace-otlp-http` — OTLP trace export
- `@opentelemetry/exporter-logs-otlp-http` — OTLP log export
- `@opentelemetry/exporter-metrics-otlp-proto` — OTLP metric export

### UI Integration
- `@effect-atom/atom-react` — Reactive atom state management
- `react` / `react-dom` — React framework
- `next` — Next.js App Router

### Workspace Dependencies
- `@beep/shared-server` — Environment configuration
- `@beep/ui` — ToasterService and UI utilities
- Various domain/table packages for typing

## Type Exports

```typescript
import type {
  LiveManagedRuntime,
  LiveRuntimeContext,
  ClientRuntimeLayer,
} from "@beep/runtime-client";

// The runtime type used throughout the application
type MyRuntime = LiveManagedRuntime;

// The context type containing all available services
type MyContext = LiveRuntimeContext;
```

## Observability

The runtime automatically instruments all Effects with:

- **Traces** exported to `clientEnv.otlpTraceExporterUrl`
- **Logs** exported to `clientEnv.otlpLogExporterUrl`
- **Metrics** exported to `clientEnv.otlpMetricExporterUrl`

Spans are automatically created when using `runClientPromise` or `makeRunClientPromise`:

```typescript
// Automatically wrapped in span "myOperation"
makeRunClientPromise(runtime, "myOperation")(
  Effect.gen(function* () {
    yield* Effect.log("Inside traced operation");
  })
);
```

## Best Practices

1. **Single Runtime Instance**: `BeepProvider` creates one runtime for the entire application lifecycle
2. **Atom Registry**: Mount `KaServices` once under `RegistryProvider` so all atoms share the same runtime
3. **Proper Cleanup**: `RuntimeProvider` handles `ManagedRuntime.dispose` on unmount
4. **Span Naming**: Use descriptive span names in `makeRunClientPromise` for observability
5. **Error Handling**: Use `Effect.catchTag` for typed error recovery
6. **Testing**: Provide mock layers for browser-only services (IndexedDB, WorkerClient) in tests

## Migration Notes

If upgrading from a previous runtime setup:

1. Replace manual `ManagedRuntime.make` calls with `BeepProvider`
2. Move atom runtime initialization to use `KaServices` under `RegistryProvider`
3. Update any direct telemetry configuration to use `clientRuntimeLayer` merging
4. Replace `runPromise` calls with `makeRunClientPromise` for automatic span wrapping
5. Migrate localStorage usage to the provided `KeyValueStore` service

## Further Reading

- `AGENTS.md` — Detailed implementation guidance for AI agents
- `@beep/runtime-server` — Server-side runtime counterpart
- `@effect/platform-browser` — Browser platform documentation
- Effect documentation: https://effect.website

## License

MIT
