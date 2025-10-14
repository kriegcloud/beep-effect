# AGENTS — `@beep/runtime-client`

## Purpose & Fit
- Anchors every browser surface that needs Effect services, OTLP telemetry, TanStack Query, and RPC worker access. `BeepProvider` stitches these concerns into the App Router shell (`packages/runtime/client/src/beep-provider.tsx:17`) and is mounted in `apps/web/src/GlobalProviders.tsx:30`.
- Complements `@beep/runtime-server` by mirroring observability defaults (Web SDK exporters, pretty logging in dev) while staying browser-safe (`packages/runtime/client/src/services/runtime/live-layer.ts:39`).
- Supplies a consistent entrypoint for IAM/UI slices and feature forms to run Effects with dependency injection via `ManagedRuntime.make` (`packages/runtime/client/src/services/runtime/live-layer.ts:115`), keeping the layers aligned with shared domains (`packages/runtime/client/src/services/runtime/live-layer.ts:88`).

## Surface Map
- `BeepProvider` — wraps the React tree with TanStack `QueryClientProvider`, runtime context, and Nuqs adapter (`packages/runtime/client/src/beep-provider.tsx:17`).
- `QueryClient` — `Context.Tag` exposing the ambient TanStack client to Effects (`packages/runtime/client/src/services/common/query-client.ts:5`).
- `NetworkMonitor` — scoped service streaming navigator connectivity and gating network-dependent Effects (`packages/runtime/client/src/services/common/network-monitor.ts:6`).
- `layerIndexedDB` — scoped `KeyValueStore` layer backed by IndexedDB; use when durable caching beats `localStorage` (`packages/runtime/client/src/services/common/layer-indexed-db.ts:9`).
- `createClientRuntimeLayer` (`layer`) — assembles Fetch HttpClient, telemetry, worker client, query client, and browser key-value store (`packages/runtime/client/src/services/runtime/live-layer.ts:88`).
- `runClientPromise` / `runClientPromiseExit` and `make*` helpers — decorate Effects with spans and execute them inside a `LiveManagedRuntime` (`packages/runtime/client/src/services/runtime/live-layer.ts:115`, `packages/runtime/client/src/services/runtime/live-layer.ts:125`, `packages/runtime/client/src/services/runtime/live-layer.ts:146`).
- `RuntimeProvider` / `useRuntime` — React context surface for Sharing the `LiveManagedRuntime` (`packages/runtime/client/src/services/runtime/runtime-provider.tsx:7`, `packages/runtime/client/src/services/runtime/use-runtime.tsx:6`).
- `WorkerClient` — RPC client service pointing to the bundled web worker transport (`packages/runtime/client/src/worker/worker-client.ts:23`); pairs with the worker implementation (`packages/runtime/client/src/worker/worker.ts:30`) and schema (`packages/runtime/client/src/worker/worker-rpc.ts:5`).

## Usage Snapshots
- `BeepProvider` hosts global providers before UI shells mount (`apps/web/src/GlobalProviders.tsx:30`).
- `runClientPromiseExit` powers the Effect-aware TanStack hooks, surfacing toastified failures and spans (`apps/web/src/libs/tanstack-query/effect-query.ts:98`).
- `makeRunClientPromise` drives IAM auth flows so UI handlers execute through the runtime (`packages/iam/ui/src/sign-in/sign-in.view.tsx:21`).
- `runClientPromise` wraps upload processing with additional layers and env-aware logging (`apps/web/src/features/upload/form.tsx:47`).
- `QueryClient` tag is provided to other packages for cache priming helpers (`apps/web/src/libs/tanstack-query/query-data-helpers.ts:1`).

## Tooling & Docs Shortcuts
- Effect docs refresher (ManagedRuntime): `effect_docs__get_effect_doc` with payload `{ "documentId": 7293 }`.
- Effect website deep dive (ManagedRuntime patterns): `context7__get-library-docs` with payload `{ "context7CompatibleLibraryID": "/llmstxt/effect_website_llms-small_txt", "topic": "ManagedRuntime", "tokens": 800 }`.
- Repository scripts:
  - `bun run check --filter @beep/runtime-client`
  - `bun run lint --filter @beep/runtime-client`
  - `bun run test --filter @beep/runtime-client`
  - `bun run build --filter @beep/runtime-client`
- Worker rebuild (when touching `src/worker/*`): `bun run build --filter @beep/runtime-client#worker`.

## Authoring Guardrails
- Always namespace Effect imports (`import * as Effect from "effect/Effect";`, `import * as A from "effect/Array";`, `import * as Str from "effect/String";`). Native array/string/object helpers are forbidden; pipe through the Effect collections utilities.
- `BeepProvider` is a `"use client"` component. Avoid server-only APIs (e.g., Node-only env access) anywhere under `packages/runtime/client`.
- Preserve `ManagedRuntime.dispose` semantics. `RuntimeProvider` already handles cleanup (`packages/runtime/client/src/services/runtime/runtime-provider.tsx:15`); never short-circuit unmount paths.
- `createClientRuntimeLayer` wires OTLP exporters using env URLs. When adjusting observability, ensure both trace and log exporters stay environment-aware and keep the merged `LogLevel` layer (`packages/runtime/client/src/services/runtime/live-layer.ts:58`).
- Worker contracts must remain serialisable. Only use schema-safe payloads and return types defined via `effect/Schema` (`packages/runtime/client/src/worker/worker-rpc.ts:5`). When adding RPC methods, keep concurrency budgets conservative (`packages/runtime/client/src/worker/worker-client.ts:11`).
- `layerIndexedDB` assumes the browser has IndexedDB APIs. For SSR or tests, provide an alternative (`KeyValueStore` mock) before running Effects that depend on it.
- Maintain alignment with sibling docs (`packages/runtime/server/AGENTS.md`, `packages/runtime/shared/AGENTS.md` if/when added) to avoid drift in observability or layer naming.

## Quick Recipes

- **Map runtime runners to IAM intents inside a client hook**

  ```ts
  import * as F from "effect/Function";
  import * as A from "effect/Array";
  import type { LiveManagedRuntime } from "@beep/runtime-client";
  import { makeRunClientPromise } from "@beep/runtime-client";

  type Intent = { readonly span: string; readonly action: string };

  export const useIamRunners = (runtime: LiveManagedRuntime) =>
    F.pipe(
      [
        { span: "iam.signIn.email", action: "Email" },
        { span: "iam.signIn.passkey", action: "Passkey" },
      ] as const satisfies ReadonlyArray<Intent>,
      A.map((intent) => ({
        label: intent.action,
        run: makeRunClientPromise(runtime, intent.span),
      }))
    );
  ```

- **Provide IndexedDB-backed persistence in the runtime layer**

  ```ts
  import * as Layer from "effect/Layer";
  import { createClientRuntimeLayer } from "@beep/runtime-client";
  import { layerIndexedDB } from "@beep/runtime-client/services/common/layer-indexed-db";

  export const withDurableCache = (queryClient: import("@tanstack/react-query").QueryClient) =>
    createClientRuntimeLayer(queryClient).pipe(
      Layer.provide(layerIndexedDB({ dbName: "beep-cache", storeName: "kv" }))
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
- Update this guide when adding exports or changing runtime composition; ensure root `AGENTS.md` references stay accurate.
- Confirm new Effects receive the necessary layers (telemetry, HttpClient, QueryClient) through `createClientRuntimeLayer`; document any optional layers.
- If you alter worker RPC contracts, regenerate consumer snapshots and double-check browser bundler settings (module type `module`).
- For new persistence strategies, add fallbacks or mocks for non-browser contexts and describe them here.
- Coordinate with `packages/runtime/server` and `packages/runtime/shared` docs so observability and Layer naming remain consistent.
