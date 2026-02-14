# Cloudflare Remote Sync (Worker + Durable Object)

This package provides a Cloudflare Worker entrypoint and Durable Object that implement the
EventLogRemote protocol for syncing SDK replicas. The Durable Object uses Effect’s
`EventLogDurableObject` and a configurable `EventLogServer.Storage` layer.

## Quick Start
1. Copy `wrangler.toml` and adjust `name`, `account_id`, and `compatibility_date`.
2. Ensure Durable Object SQLite is enabled:
   - `migrations = [{ tag = "v1", new_sqlite_classes = ["SyncDurableObject"] }]`
3. Bind the Durable Object:
   - `SYNC_DO` → `SyncDurableObject`
4. Decide on a tenant naming scheme (required for all client connections).

From the repo root:

```bash
bun install --cwd cloudflare
bun run sync:dev
```

Optional: bind a D1 database as `SYNC_DB` to use D1 storage instead of DO SQLite.

## Deploy (Wrangler)
Ensure you are authenticated (`bunx wrangler whoami`) and then deploy from the
`cloudflare` directory:

```bash
cd cloudflare
bunx wrangler deploy
```

If you set `SYNC_AUTH_TOKEN`, also add it as a worker secret or `vars` entry.

## Storage Mode
- **Default:** D1 if `SYNC_DB` is bound, otherwise Durable Object SQLite (`ctx.storage.sql`)
- **Force DO SQLite:** set `SYNC_STORAGE="do"`
- **Force D1:** set `SYNC_STORAGE="d1"` (requires `SYNC_DB` binding)

## Auth
Set `SYNC_AUTH_TOKEN` (Worker env var). The worker accepts:
- `Authorization: Bearer <token>`
- `Sec-WebSocket-Protocol: sync-auth.<token>` (browser-friendly, avoids query params)

Query token auth (`?token=`) is **disabled by default**. Enable it explicitly with
`SYNC_ALLOW_QUERY_TOKEN="true"` if you need it.

If you pass `authToken` into `buildRemoteUrl` or `withRemoteSync`, it will use
`?token=`. For the default Cloudflare config, prefer `protocols: "sync-auth.<token>"`
instead.

## Client Notes
Cloudflare DO does **not** implement Ping/Pong or StopChanges. For Cloudflare endpoints,
clients should set `disablePing: true` unless the DO is extended to handle Ping/Pong.

## Client Usage
```ts
import * as Effect from "effect/Effect"
import { AgentRuntime } from "effect-claude-agent-sdk"

const runtimeLayer = AgentRuntime.layerWithRemoteSync({
  provider: "cloudflare",
  url: "wss://<your-worker>.workers.dev/event-log/<tenant>",
  // optional auth: use Authorization header or protocols
  protocols: "sync-auth.<token>",
  syncInterval: "5 seconds",
  syncChatHistory: true,
  syncArtifacts: true
})

const program = Effect.gen(function*() {
  const runtime = yield* AgentRuntime
  return runtime
}).pipe(Effect.provide(runtimeLayer))
```

If you need a custom sync interval with `SyncService`, provide `SyncConfig.layer`:

```ts
import * as Layer from "effect/Layer"
import { SyncConfig, SyncService } from "effect-claude-agent-sdk/Sync"

const layer = SyncService.layerWebSocket("wss://<worker>.workers.dev/event-log/<tenant>", {
  disablePing: true,
  protocols: "sync-auth.<token>"
}).pipe(Layer.provide(SyncConfig.layer({ syncInterval: "5 seconds" })))
```

## Smoke Test
Run the Cloudflare integration test against the deployed worker:

```bash
CLOUDFLARE_SYNC_URL="wss://effect-sync.kokokessy.workers.dev/event-log" \
CLOUDFLARE_SYNC_TENANT="smoke-test" \
  bun test test/sync-cloudflare-integration.test.ts
```

If you set an auth token, also provide:

```bash
CLOUDFLARE_SYNC_TOKEN="your-token"
```

## Files
- `src/worker.ts` — Worker entrypoint (routing + auth)
- `src/do/SyncDurableObject.ts` — Durable Object class
- `src/storage/StorageDo.ts` — DO SQLite storage layer
- `src/storage/StorageD1.ts` — D1 storage layer
