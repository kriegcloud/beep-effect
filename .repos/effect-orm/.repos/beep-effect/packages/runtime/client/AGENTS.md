# AGENTS — `@beep/runtime-client`

## Purpose & Fit
- Anchors every browser surface that needs Effect services, OTLP telemetry, managed runtime assembly, effect-atom registries, and RPC worker access; `BeepProvider` wires these concerns into the App Router shell (`packages/runtime/client/src/beep-provider.tsx:12`) and mounts inside `apps/web/src/GlobalProviders.tsx:37`.
- Mirrors `@beep/runtime-server` observability defaults while staying browser-safe via Web SDK exporters and local log tuning (`packages/runtime/client/src/services/runtime/live-layer.ts:44`).
- Supplies entry points for IAM/UI slices to run Effects through `ManagedRuntime.make` and `Atom.runtime`, keeping dependency injection aligned with shared domains and worker contracts (`packages/runtime/client/src/services/runtime/live-layer.ts:87`).
- Pairs with the `@effect-atom/atom-react` registry so atoms created with `Atom.runtime` share the same `LiveManagedRuntime` once `KaServices` is mounted under the app-level `RegistryProvider` (`packages/runtime/client/src/services/runtime/ka-services.ts:7`).

## Surface Map
- `BeepProvider` & `RuntimeProvider` — instantiate the `LiveManagedRuntime` from `clientRuntimeLayer` and expose it through context (`packages/runtime/client/src/beep-provider.tsx:12`, `packages/runtime/client/src/services/runtime/runtime-provider.tsx:7`).
- `clientRuntimeLayer` — merges Fetch `HttpClient`, telemetry exporters, log level tuning, network monitor, worker client, and local storage key-value store for browser-safe Effects (`packages/runtime/client/src/services/runtime/live-layer.ts:87`).
- `KaServices` & `makeAtomRuntime` — pre-register a global atom runtime that injects `clientRuntimeLayer` and the default worker services when mounted via `useAtomMount` (`packages/runtime/client/src/services/runtime/ka-services.ts:7`, `packages/runtime/client/src/services/runtime/make-atom-runtime.ts:4`).
- `runClientPromise*` helpers — wrap client Effects in spans and reusable runners for both resolved values and `Exit`s (`packages/runtime/client/src/services/runtime/live-layer.ts:114`).
- `layerIndexedDB` plus browser storage utilities — supply durable `KeyValueStore` implementations when local caching needs IndexedDB over the default `BrowserKeyValueStore.layerLocalStorage` (`packages/runtime/client/src/services/common/layer-indexed-db.ts:9`).
- `NetworkMonitor` & `WorkerClient` — gate network-bound Effects on connectivity and expose the RPC worker transport inside the runtime (`packages/runtime/client/src/services/common/network-monitor.ts:6`, `packages/runtime/client/src/worker/worker-client.ts:23`).

## Usage Snapshots
- `BeepProvider` hosts global providers before UI shells mount (`apps/web/src/GlobalProviders.tsx:37`).
- `KaServices` sits under the `RegistryProvider` at the root layout so all client atoms share the same runtime (`apps/web/src/app/layout.tsx:45`).
- `makeRunClientPromise` wraps imperative handlers to preserve spans when bridging to UI callbacks (`apps/web/src/app/dashboard/_layout-client.tsx:95`).

## Authoring Guardrails
- Namespace Effect imports (`import * as Effect from "effect/Effect";`, `import * as A from "effect/Array";`, `import * as Str from "effect/String";`); native array/string/object helpers remain forbidden—pipe through the Effect collections utilities.
- `BeepProvider` and `KaServices` are `"use client"` surfaces; avoid server-only APIs anywhere under `packages/runtime/client`.
- Let `RuntimeProvider` own `ManagedRuntime.dispose`; do not short-circuit unmount paths or create competing runtimes per component.
- Preserve observability layering: keep trace/log exporters environment-aware and maintain the merged log-level layer when tweaking `clientRuntimeLayer`.
- Effect-atom integration relies on mounting `KaServices` under a single `RegistryProvider`; additional atom contexts should extend `clientRuntimeLayer` rather than rehydrating worker or telemetry services.
- `layerIndexedDB` assumes browser IndexedDB APIs; provide a mock `KeyValueStore` for SSR/tests before running dependent Effects.

## Quick Recipes

- **Compose IAM atoms with the shared runtime**

  ```ts
  import * as F from "effect/Function";
  import * as O from "effect/Option";
  import { clientRuntimeLayer } from "@beep/runtime-client";
  import { withToast } from "@beep/ui/common/with-toast";
  import { SignOutImplementations } from "@beep/iam-client";
  import { Atom, useAtom } from "@effect-atom/atom-react";

  const runtime = Atom.runtime(clientRuntimeLayer);

  const signOutAtom = runtime.fn(
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

- **Extend the runtime with IndexedDB caching**

  ```ts
  import * as Layer from "effect/Layer";
  import { Atom } from "@effect-atom/atom-react";
  import { clientRuntimeLayer } from "@beep/runtime-client";
  import { layerIndexedDB } from "@beep/runtime-client/services/common/layer-indexed-db";

  export const durableRuntime = Atom.runtime(
    Layer.mergeAll(
      clientRuntimeLayer,
      layerIndexedDB({ dbName: "beep-cache", storeName: "kv" })
    )
  );
  ```

- **Execute a worker RPC inside an Effect span**

  ```ts
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

## Verifications
- `bun run check --filter @beep/runtime-client` — type coverage for src and tests.
- `bun run lint --filter @beep/runtime-client` — Biome rules ensure import shape and `"use client"` boundaries.
- `bun run test --filter @beep/runtime-client` — executes Bun tests (extend beyond placeholder `Dummy.test.ts` when adding behaviour).
- `bun run build --filter @beep/runtime-client` — validates worker bundling and emits ESM/CJS outputs.

## Contributor Checklist
- Update this guide when exports or runtime composition change; ensure root `AGENTS.md` references stay accurate.
- Keep `clientRuntimeLayer` providing telemetry, `HttpClient`, and worker wiring when adding optional layers; document any extras (e.g., `layerIndexedDB`).
- If atom runtime wiring changes, adjust `KaServices`, root `RegistryProvider` usage, and note downstream migration steps.
- When altering worker RPC contracts, regenerate consumer snapshots and double-check browser bundler settings (`type: "module"`).
- For new persistence strategies, add fallbacks or mocks for non-browser contexts and describe them here.
