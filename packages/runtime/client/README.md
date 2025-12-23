# @beep/runtime-client

Browser-side Effect ManagedRuntime with OpenTelemetry observability, effect-atom integration, and RPC worker access.

## Purpose

`@beep/runtime-client` provides the client-side Effect runtime infrastructure that powers all browser surfaces in the beep-effect application. It assembles a `ManagedRuntime` with OpenTelemetry Web SDK observability, effect-atom registry integration, RPC worker clients, network connectivity monitoring, browser storage adapters, and a Fetch-based HTTP client.

This package is the browser counterpart to `@beep/runtime-server`, providing a consistent Effect-first runtime environment across the full stack while maintaining browser-safe implementations of platform services.

The runtime is mounted via `BeepProvider` in the Next.js App Router shell and shared across all client components through React context. The `KaServices` component integrates the runtime with the effect-atom registry, enabling all atoms to access runtime services automatically.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/runtime-client": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `BeepProvider` | Top-level React provider that instantiates and manages the `LiveManagedRuntime` |
| `KaServices` | Effect-atom registry mount point that injects `clientRuntimeLayer` into all atoms |
| `useRuntime` | React hook to access the runtime from within components |
| `clientRuntimeLayer` | Main composition of all browser-safe Effect services |
| `clientRuntime` | Pre-instantiated `ManagedRuntime` created from `clientRuntimeLayer` |
| `makeAtomRuntime` | Atom context with `clientRuntimeLayer` pre-configured |
| `runClientPromise` | Execute an Effect within the runtime, wrapped in an observability span |
| `makeRunClientPromise` | Curried version bound to a specific runtime for reuse |
| `runClientPromiseExit` | Execute and return the Exit value instead of unwrapping |
| `makeRunClientPromiseExit` | Curried Exit-returning version |
| `NetworkMonitor` | Service exposing browser online/offline state |
| `WorkerClient` | RPC client for communicating with web workers |
| `urlSearchParamSSR` | URL search param atoms compatible with SSR |

### Runtime Layer Services

The `clientRuntimeLayer` provides these Effect services:

| Service | Description |
|---------|-------------|
| `HttpClient` | Fetch-based HTTP client from `@effect/platform` |
| `ToasterService` | UI toast notifications |
| `NetworkMonitor` | Browser connectivity tracking |
| `WorkerClient` | RPC worker access |
| `KeyValueStore` | Browser localStorage adapter |
| `Geolocation` | Browser geolocation tracking (when `clientEnv.enableGeoTracking` is true) |
| `Registry` | Effect-atom registry layer |
| OpenTelemetry | Trace/log/metric exporters to OTLP endpoints |

### Additional Exports

Available via subpath imports (see `package.json` exports):

| Export Path | Description |
|-------------|-------------|
| `@beep/runtime-client/layers/layer-indexed-db` | IndexedDB-backed `KeyValueStore` layer |
| `@beep/runtime-client/services/unsafe-http-api-client` | Unsafe HTTP client service |
| `@beep/runtime-client/services/network-monitor` | NetworkMonitor service implementation |
| `@beep/runtime-client/workers/worker-client` | WorkerClient service implementation |

## Architecture

The runtime is composed in layers and exposed to the application through React providers:

```
┌─────────────────────────────────────────────────────────────┐
│                      BeepProvider                            │
│  (Instantiates and manages the ManagedRuntime)              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            LiveManagedRuntime                           │ │
│  │  (ManagedRuntime.make(clientRuntimeLayer))              │ │
│  │                                                          │ │
│  │  Services provided by clientRuntimeLayer:               │ │
│  │  • HttpClient (Fetch API)                               │ │
│  │  • ToasterService (UI notifications)                    │ │
│  │  • NetworkMonitor (connectivity tracking)               │ │
│  │  • WorkerClient (RPC to web workers)                    │ │
│  │  • KeyValueStore (localStorage)                         │ │
│  │  • Geolocation (optional, based on env config)          │ │
│  │  • Registry (effect-atom integration)                   │ │
│  │  • OpenTelemetry (traces, logs, metrics)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  └──────────────────> RuntimeProvider (React Context)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              RegistryProvider (effect-atom)                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        KaServices (useAtomMount)                        │ │
│  │                                                          │ │
│  │  Injects clientRuntimeLayer into all atoms created      │ │
│  │  with Atom.fn, making runtime services available        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Application Components & Atoms                              │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Provider Setup

Mount `BeepProvider` at the root of your Next.js application:

```typescript
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

```typescript
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

```typescript
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

```typescript
import * as Effect from "effect/Effect";
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

### Using IndexedDB Storage

For persistent browser storage, use the IndexedDB layer:

```typescript
import * as Effect from "effect/Effect";
import * as KeyValueStore from "@effect/platform/KeyValueStore";
import { layerIndexedDB } from "@beep/runtime-client/layers/layer-indexed-db";

// Use IndexedDB in an Effect
const storeData = Effect.gen(function* () {
  const store = yield* KeyValueStore.KeyValueStore;
  yield* store.set("myKey", "myValue");
  const value = yield* store.get("myKey");
  return value;
}).pipe(Effect.provide(layerIndexedDB({ dbName: "beep-cache", storeName: "kv" })));
```

### Executing Worker RPC

Offload computation to a web worker:

```typescript
import * as Effect from "effect/Effect";
import { makeRunClientPromise } from "@beep/runtime-client";
import { WorkerClient } from "@beep/runtime-client/workers/worker-client";
import type { LiveManagedRuntime } from "@beep/runtime-client";

export const runWorkerFilter = (runtime: LiveManagedRuntime) =>
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

```typescript
import * as Effect from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { NetworkMonitor } from "@beep/runtime-client/services/network-monitor";

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

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and data structures |
| `@effect/platform` | Cross-platform HTTP client and KeyValueStore abstractions |
| `@effect/platform-browser` | Browser-specific implementations (Fetch, localStorage, IndexedDB, Geolocation) |
| `@effect/rpc` | RPC protocol for web worker communication |
| `@effect/opentelemetry` | OpenTelemetry observability integration |
| `@effect-atom/atom-react` | Reactive atom state management for React |
| `react` / `react-dom` | React framework for UI components |
| `next` | Next.js App Router integration |
| `@beep/shared-env` | Client environment configuration schema |
| `@beep/ui` | ToasterService and UI utilities |
| `@beep/constants` | Shared constants and environment values |
| Various domain packages | Type definitions for IAM and Documents entities |

## Integration

This package integrates with:

- **`apps/web`** — Next.js frontend mounts `BeepProvider` and `KaServices` in the App Router shell
- **`@beep/runtime-server`** — Server-side runtime counterpart with similar observability patterns
- **`@beep/iam-client`** / **`@beep/documents-client`** — SDK packages consume the runtime to execute client contracts
- **`@beep/iam-ui`** / **`@beep/documents-ui`** — UI packages use atoms powered by the runtime
- **`@beep/ui`** — Provides `ToasterService` integrated into the runtime layer
- **`@beep/shared-env`** — Supplies client environment configuration schema

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

## Notes

### Observability

The runtime automatically instruments all Effects with OpenTelemetry:

- **Traces** exported to `clientEnv.otlpTraceExporterUrl` via OTLP HTTP
- **Logs** exported to `clientEnv.otlpLogExporterUrl` via OTLP HTTP
- **Metrics** exported to `clientEnv.otlpMetricExporterUrl` via OTLP Proto

Spans are automatically created when using `runClientPromise` or `makeRunClientPromise`:

```typescript
// Automatically wrapped in span "myOperation"
makeRunClientPromise(runtime, "myOperation")(
  Effect.gen(function* () {
    yield* Effect.log("Inside traced operation");
  })
);
```

Log level is dynamically tuned based on environment:
- **Development**: `LogLevel.Debug` with pretty console output
- **Production**: `LogLevel.Info` with structured JSON logs

### Runtime Lifecycle

- `BeepProvider` creates a single `LiveManagedRuntime` instance for the entire application lifecycle
- `RuntimeProvider` handles automatic cleanup via `ManagedRuntime.dispose` on unmount
- `KaServices` should be mounted once under `RegistryProvider` so all atoms share the same runtime services

### Testing

When testing components that use the runtime:
- Provide mock layers for browser-only services (IndexedDB, WorkerClient, NetworkMonitor)
- Use `Layer.succeed` to create test implementations of services
- Consider using `@beep/testkit` for Effect testing utilities

### TypeScript Types

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
