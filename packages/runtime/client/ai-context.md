---
path: packages/runtime/client
summary: Browser Effect runtime with OTLP telemetry, ManagedRuntime, effect-atom registry, and worker RPC
tags: [runtime, browser, effect-atom, telemetry, workers]
---

# @beep/runtime-client

Provides the browser-side Effect runtime for all client surfaces. Assembles telemetry exporters, HttpClient, KeyValueStore, NetworkMonitor, and WorkerClient into a unified `clientRuntimeLayer` that powers React components via `BeepProvider` and effect-atom integration.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|   BeepProvider    | --> |  RuntimeProvider  | --> | ManagedRuntime    |
|-------------------|     |-------------------|     |-------------------|
                                    |
                                    v
|-------------------|     |-------------------|     |-------------------|
| clientRuntimeLayer| --> |  ObservabilityLive| --> |   TelemetryLive   |
|-------------------|     |-------------------|     |-------------------|
        |                         |
        v                         v
|-----------|  |-----------|  |-----------|  |-----------|
| HttpClient|  |NetworkMon |  |WorkerClient| | KeyValue  |
|-----------|  |-----------|  |-----------|  |-----------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `layer.ts` | Assembles `clientRuntimeLayer` merging HttpClient, telemetry, storage, workers |
| `runtime.ts` | `ManagedRuntime` helpers, `makeRunClientPromise`, atom runtime setup |
| `beep-provider.tsx` | React provider mounting runtime into component tree |
| `providers/runtime/` | `RuntimeProvider` managing runtime lifecycle and disposal |
| `services/ka-services.ts` | `KaServices` for effect-atom registry integration |
| `services/network-monitor.ts` | `NetworkMonitor` service tracking browser connectivity |
| `workers/worker-client.ts` | `WorkerClient` service for RPC transport to Web Workers |
| `layers/layer-indexed-db.ts` | Optional `KeyValueStore` backed by IndexedDB |

## Usage Patterns

### Create an Effect-backed atom

```typescript
import * as F from "effect/Function";
import * as O from "effect/Option";
import { Atom, useAtom } from "@effect-atom/atom-react";
import { clientRuntimeLayer } from "@beep/runtime-client";

const runtime = Atom.runtime(clientRuntimeLayer);

const myAtom = runtime.fn(
  F.flow(
    MyService.doSomething,
    withToast({ onWaiting: "Working...", onSuccess: "Done" })
  )
);

export const useMyAtom = () => useAtom(myAtom);
```

### Run an Effect with tracing

```typescript
import * as Effect from "effect/Effect";
import { makeRunClientPromise } from "@beep/runtime-client";

const run = makeRunClientPromise(runtime, "myOperation");

await run(
  Effect.gen(function* () {
    const result = yield* SomeService.fetch();
    return result;
  })
);
```

### Extend with IndexedDB storage

```typescript
import * as Layer from "effect/Layer";
import { Atom } from "@effect-atom/atom-react";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { layerIndexedDB } from "@beep/runtime-client/layers/layer-indexed-db";

const durableRuntime = Atom.runtime(
  Layer.mergeAll(
    clientRuntimeLayer,
    layerIndexedDB({ dbName: "my-cache", storeName: "kv" })
  )
);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single RuntimeProvider | Prevents resource leaks from competing runtimes; atoms share services |
| Fetch-based HttpClient | Browser-native, no polyfills needed; works with CORS |
| LocalStorage default | Universal browser support; IndexedDB opt-in for larger data |
| OTLP batch exporters | Reduces network overhead; aligns with Grafana stack |
| Effect-atom integration | Declarative state management with Effect dependency injection |

## Dependencies

**Internal**: `@beep/constants`, `@beep/shared-env`, `@beep/utils`

**External**: `effect`, `@effect/platform`, `@effect/platform-browser`, `@effect/opentelemetry`, `@effect-atom/atom-react`, `@opentelemetry/*`, `react`, `next`

## Related

- **AGENTS.md** - Detailed contributor guidance, gotchas, recipes
- **@beep/runtime-server** - Server-side counterpart with Bun runtime
