# Local-First Projection Sync — Sources & Provenance

Provenance ledger for this packet: it joins the one mined gold nugget in this
packet's cluster to its upstream repo + license, the external research citations
already on disk, and the in-repo bricks the proposed `EventStreamHub` composes
onto. Derived from the gold-intake cluster **"Local-first projection sync
(EventStreamHub)"** (route `new-exploration`, wave `P2`, theme `desktop-portal`).

- Cluster: `Local-first projection sync (EventStreamHub)` — 1 nugget, 1 upstream repo.
- Gold-intake provenance: [`../../_gold-intake/ROUTING.md`](../../_gold-intake/ROUTING.md) · [`../../_gold-intake/routing.json`](../../_gold-intake/routing.json) · [`../../_gold-intake/GOLD_SYNTHESIS.md`](../../_gold-intake/GOLD_SYNTHESIS.md) (`### Desktop & document portal` → `#### Per-user live connection hub for projection sync`, source line `GOLD_SYNTHESIS.md:1341`).
- Packet codex review: [`../reviews/2026-06-29-codex-research.md`](../reviews/2026-06-29-codex-research.md) (research-gate critique, 3 blocking + 5 advisory, folded into RESEARCH.md).

> **License conflict to reconcile (load-bearing) — see §2.** The gold-intake
> catalog (this packet's authoritative source bundle) records TalentScore as
> **MIT**. The packet prose (CAPTURE L48–49, RESEARCH "Licensing gravity",
> DECISIONS, raw research) instead asserts TalentScore is *commercial-licensed*
> and builds the "port the design **shape**, never copy code" discipline on
> that. If the upstream is in fact MIT, port-with-attribution is permissible.
> Resolve the license-of-record at the align stage before the hub graduates; do
> not silently change the prose here.

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| TalentScore#10 | Per-user live connection hub for local-first real-time projection sync | TalentScore | `packages/server/src/public/event-stream/event-stream-hub.ts:83-118` | desktop-portal | P2 | **port (shape only)** — clean-room reimplement the design under Effect v4; see §2 license conflict |

**How this nugget informs the packet.** This is a single-nugget cluster: the
whole packet exists to evaluate and right-size TalentScore#10.

- *The pattern to take* — a **targeted server-push fan-out hub**: a scoped
  `Effect.Service` holding a guarded `MutableHashMap<UserId, ActiveConnection[]>`
  registry with `register` / `unregister` / `notifyUser`, fanning one typed
  event out to only that user's live connections and pruning dead consumers. The
  load-bearing contract is the `notifyUser` entry point the authority write path
  calls *after* it commits (RESEARCH "Authority / projection / offline
  boundary"). The upstream snippet carries the concrete signature:
  `notifyUser(userId, event)` iterating a user's connections and offering the
  event to each connection's queue with `{ discard: true }`.
- *What to leave / adapt* — the upstream's `effect/Mailbox` primitive and
  `conn.mailbox.offer(event)` / `Mailbox.toStream()` calls are a **dead v3 API**
  in this repo's `effect@4.0.0-beta.91`; the concept maps cleanly to one `Queue`
  per connection drained via `Stream.fromQueue` (RESEARCH "Constraints", Q4 in
  DECISIONS). Leave the `Clock.currentTimeMillis`-gated prune as a half-open
  backstop only; prefer `Scope`-based register/unregister finalizers (codex
  gate-1, A2). Leave the upstream's WebSocket transport — the desktop reuses the
  proven Tauri-IPC streaming-RPC surface (§4).
- *Do not over-scope from the nugget* — the hub's remit is narrowed to
  **cross-window / server-originated** invalidation only; in-window UI-projection
  refresh is already covered by the existing Atom/SQL reactivity paths (RESEARCH
  "Existing reactive-invalidation paths vs the hub", DECISIONS Q3). A first slice
  that re-implements in-window invalidation in the hub would overbuild.

This is **not** a split cluster — no sibling packet shares this nugget.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| TalentScore | T1 | **MIT** (per gold-intake catalog/bundle) — packet prose claims "commercial"; conflict, see callout | If MIT: **port-with-attribution** permitted. If commercial (packet's stated assumption): **clean-room reimplement, shape only — never copy code**. Treat as clean-room until reconciled (the safe superset). | The `EventStreamHub` design shape: scoped `Effect.Service` + per-`UserId` registry + targeted `notifyUser` + dead-consumer prune. Adapt the primitive to Effect v4 `Queue`. |

> **Cautions (echoed from the bundle).** `P2 desktop/local-first concern;
> coordinate with the authority/projection/cache standard.` The hub is the
> invalidation *signal* downstream of a committed authority write — it must
> compose with, not pre-empt, that standard's slice-ownership and
> projection/cache decisions.
>
> **Licensing gravity beyond the ported repo (from RESEARCH "Constraints").**
> The buy-it alternatives surveyed in §3 carry their own licenses —
> ElectricSQL **Apache-2.0**, Yjs **MIT**, PowerSync server/CLI **FSL**
> (source-available, non-compete, → Apache-2.0 at each release's 2nd
> anniversary; client SDKs Apache-2.0/MIT), Zero **own protocol** — all are
> explicit no-gos at the current single-user appetite, so their license
> questions are moot until a multi-device roadmap revives them. **FalkorDB ships
> under SSPLv1 (strong copyleft):** internal/single-user use does not trigger
> copyleft, but bundling/hosting/distributing a FalkorDB-backed projection
> triggers SSPL's service-source obligation. This wedge introduces **no FalkorDB
> runtime** (only a typed refresh event); track SSPLv1 as an open licensing gate
> (DECISIONS Q7) and require legal/architecture review before any FalkorDB
> projection ships.

## 3. External research sources

All URLs below are reproduced from this packet's own
[`RESEARCH.md`](../RESEARCH.md) and
[`research/eventstreamhub-projection-fanout-and-attach-vs-standalone.md`](./eventstreamhub-projection-fanout-and-attach-vs-standalone.md)
("Sources" section). Grouped by the claim they ground.

**Effect-native primitives (the build-it path).**
- Effect — PubSub docs (broadcast vs Queue, backpressure variants): https://effect.website/docs/concurrency/pubsub/
- Effect — 3.8 release (experimental `effect/Mailbox`; v3 API, folded into v4 `Queue`): https://effect.website/blog/releases/effect/38/
- Effect — @effect/rpc README (streaming responses, `layerProtocolWebsocket`, server push): https://github.com/Effect-TS/effect/blob/main/packages/rpc/README.md
- Effect — 2.3 release (RPC rewrite adds streaming): https://effect.website/blog/releases/effect/23/
- Effect — @effect/rpc package: https://www.npmjs.com/package/@effect/rpc

**Sync engines (the buy-it alternatives, all rejected at this appetite).**
- ElectricSQL — Postgres Sync product: https://electric-sql.com/products/postgres-sync
- ElectricSQL — Shapes guide: https://electric-sql.com/docs/guides/shapes
- ElectricSQL — 1.0 GA (2025-03-17): https://electric-sql.com/blog/2025/03/17/electricsql-1.0-released
- ElectricSQL — source repo: https://github.com/electric-sql/electric
- ElectricSQL — @electric-sql/client: https://www.npmjs.com/package/@electric-sql/client
- PGlite — Electric sync integration: https://pglite.dev/docs/sync
- PowerSync — Service architecture: https://docs.powersync.com/architecture/powersync-service
- PowerSync — Sync Rules from first principles: https://www.powersync.com/blog/sync-rules-from-first-principles-partial-replication-to-sqlite
- PowerSync — Functional Source License (FSL): https://powersync.com/legal/fsl
- PowerSync — "A New Open Era": https://www.powersync.com/blog/new-open-era-for-powersync
- PowerSync — open-source package licensing: https://powersync.com/open-source
- PowerSync — Service release notes: https://releases.powersync.com/announcements/powersync-service
- Rocicorp Zero — 1.0 (InfoQ, 2026-06): https://www.infoq.com/news/2026/06/zero-version-1/
- Rocicorp Zero — when to use: https://zero.rocicorp.dev/docs/when-to-use

**Lighter local-first / CRDT alternatives (scanned, rejected on scope/posture).**
- Yjs — source repo: https://github.com/yjs/yjs
- Yjs — y-websocket provider + Awareness: https://docs.yjs.dev/ecosystem/connection-provider/y-websocket
- CRDT comparison (Yjs/Automerge/Loro, 2026): https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026

**DB-native triggers (complementary, not sufficient).**
- PostgreSQL — NOTIFY docs (<8000-byte payload, send-the-key pattern): https://www.postgresql.org/docs/current/sql-notify.html
- Stacksync — LISTEN/NOTIFY limit analysis: https://www.stacksync.com/blog/beyond-listen-notify-postgres-request-reply-real-time-sync
- PgBouncer — LISTEN/NOTIFY vs transaction pooling (issue #655): https://github.com/pgbouncer/pgbouncer/issues/655
- Redis — keyspace notifications (disabled by default, fire-and-forget): https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/
- Redis — issue #8782 (module datatypes must call `RM_NotifyKeyspaceEvent` explicitly): https://github.com/redis/redis/issues/8782
- FalkorDB — GRAPH.QUERY command docs (no subscribe/stream): https://docs.falkordb.com/commands/graph.query.html
- FalkorDB — design docs (GraphBLAS internals; no change-feed): https://docs.falkordb.com/design/
- FalkorDB — source repo: https://github.com/FalkorDB/FalkorDB
- FalkorDB — license (SSPLv1): https://docs.falkordb.com/References/license.html · https://github.com/FalkorDB/FalkorDB/blob/master/LICENSE.txt

## 4. In-repo capability references

The bricks the proposed hub composes onto (from the bundle `secondaryTargets`
and RESEARCH "In-Repo Capability Inventory"). Paths verified in RESEARCH on
2026-06-29.

- `@beep/workspace-server` — `packages/workspace/server` — **extend** (hub home; exports the `Thread` server namespace + workspace Layer; co-locate the scoped `EventStreamHub` next to the authority boundary). Bundle `secondaryTargets`.
- `@beep/workspace-use-cases` — `packages/workspace/use-cases/src/aggregates/Thread/ThreadStore.ts` — **reuse** (the single authority write boundary `appendTurn`/`createThread`/`setTitleIfEmpty`; `notifyUser` fires *after* commit). Candidate RPC-contract home (UNRESOLVED vs `@beep/agents-use-cases`).
- `@beep/agents-use-cases` — `packages/agents/use-cases/src/processes/Chat/Chat.rpc.ts` — **reuse** (proven `stream: true` server→client RPC surface, `ChatRpcs` `RpcGroup`; `SubscribeProjectionEvents` lands as a sibling). Alternate RPC-contract home.
- `apps/professional-desktop` — `src/transport/IpcChatClient.ts`, `src/runtime/*`, `src/chat/ui/*` — **extend** (client transport `RpcClient.layerProtocolSocket` over ndjson on Tauri IPC; app-local live-Layer wiring + client subscription land here only — no slice product code in the app). Bundle `secondaryTargets`.
- `@effect/atom-react` + `effect/unstable/reactivity` `Atom` — `apps/professional-desktop/src/runtime/ProfessionalAtomRuntime.ts` — **reuse** (the client substrate that consumes the subscription stream and invalidates UI projections; note the dep is `@effect/atom-react`, not the older `@effect-atom/atom-react`).
- `@beep/drivers-pglite` — `packages/drivers/pglite/src/PgliteClient.service.ts` (`listen`/`notify`) — **reuse / boundary** (single-user PGlite-in-sidecar authority store; in-process only, does not reach a separate renderer — the gap the hub fills).
- `@beep/observability` — `packages/foundation/capability/observability/src/server/DevTools.ts` (`effect/unstable/socket/Socket` `layerWebSocket`) — **reuse** (WS fan-out substrate if a real WebSocket ever replaces the Tauri IPC socket).
- `MutableHashMap` (root `effect`) — **reuse** (in-repo-proven: `@beep/nlp` Graph ops, `@beep/repo-utils` `TSMorph.service.ts`, schema test).
- `EventStreamHub` service + `notifyUser` + `SubscribeProjectionEvents` RPC — **NET-NEW** (zero `EventStreamHub`/`notifyUser`/`PubSub` usage in any `src`; `SynchronizedRef` exists in Effect v4 but has no repo usage — this slice is its first user).
- FalkorDB projection client — **NET-NEW / aspirational** (no `packages/drivers/falkordb`, no in-process projection client; only Graphiti MCP/FalkorDB *proxy orchestration* under `packages/tooling/tool/cli/src/commands/Graphiti/internal/{ProxyOps,ProxyConfig}.ts`, which is dev/infra, not a reusable projection client).

## 5. Cross-links & provenance

- Cluster id: `local-first-projection-sync` (route `new-exploration`, wave `P2`, theme `desktop-portal`). Bundle `crossref`: none.
- Packet exploration trail: [`../CAPTURE.md`](../CAPTURE.md) · [`../RESEARCH.md`](../RESEARCH.md) · [`../DECISIONS.md`](../DECISIONS.md) (Q1–Q7 pre-drafted, open for `/grill-with-docs`) · [`../ops/manifest.json`](../ops/manifest.json).
- Raw per-subtopic research: [`./eventstreamhub-projection-fanout-and-attach-vs-standalone.md`](./eventstreamhub-projection-fanout-and-attach-vs-standalone.md).
- Codex review: [`../reviews/2026-06-29-codex-research.md`](../reviews/2026-06-29-codex-research.md).
- Gold synthesis: [`../../_gold-intake/GOLD_SYNTHESIS.md`](../../_gold-intake/GOLD_SYNTHESIS.md) — `### Desktop & document portal` → `#### Per-user live connection hub for projection sync` (`GOLD_SYNTHESIS.md:1341`).
- Coordinate-with goals (from RESEARCH "Routing cautions", not yet linked in manifest): `goals/desktop-chat-surface` (RPC surface + app-local Layer; SPEC non-goal "No collaboration; no multi-user presence"), `goals/workspace-thread-domain` (`ThreadStore` write hook). Precedent: `explorations/local-first-voice/DECISIONS.md` (attach-as-spike right-sizing).
