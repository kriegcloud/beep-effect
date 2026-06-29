# Local-First Projection Sync — Decisions

<!--
Stage 2 (ALIGN seed, pre-drafted 2026-06-29 from RESEARCH.md synthesis).
These are NOT resolved. Each is a branch-closing fork with a RECOMMENDED
answer the user ratifies, amends, or rejects via /grill-with-docs. Resolve
one branch at a time; on resolution flip Status to "resolved <date>" with the
final Answer + Rationale (incl. rejected options), and clear it from
ops/manifest.json openQuestions. Run: /grill-with-docs local-first-projection-sync
-->

## Q1: Build the in-repo per-user fan-out hub, or buy a sync engine?

**Recommended:** Build — an in-repo `EventStreamHub` (per-`UserId` registry +
targeted `notifyUser` + streaming-RPC subscription) reusing the existing
transport. Do not adopt ElectricSQL / PowerSync / Zero / LiveStore / Jazz /
InstantDB.

**Rationale:** Every buy-it engine assumes a shared Postgres plus multi-device
fan-out that is an explicit no-go at one user — Electric keeps a *SQL* projection
fresh and does nothing for a graph projection (writes stay on your own backend);
PowerSync/Zero add bidirectional write-back and their own protocols we do not
need; LiveStore/Jazz/InstantDB import an event-sourcing/CRDT/hosted-backend
runtime that conflicts with the PGlite-in-sidecar local authority and the
privilege posture (RESEARCH "External Landscape" + the lighter-alternatives
table). Decisively, FalkorDB/Redis cannot self-emit reliable change events, so
**the app write path must emit the refresh event itself** — the single strongest
argument for an app-level hub over any DB-feed or sync engine. The build-it path
(per-user `MutableHashMap` registry + streaming RPC) is the right size, and the
transport already exists and is proven (`Chat.rpc.ts` `stream: true`,
`IpcChatClient.ts` `RpcClient.layerProtocolSocket`).

**Status:** open (for /grill-with-docs)

## Q2: Attach as a spike, or graduate a standalone goal packet?

**Recommended:** Attach as a spike onto existing desktop/workspace work — do
**not** graduate a standalone `goals/` packet at this appetite.

**Rationale:** Direct in-repo precedent: `explorations/local-first-voice/DECISIONS.md`
right-sized comparable desktop work to an attached spike ("do NOT graduate a goal
packet yet"). Single-workspace / single-user today means the per-`UserId` map is
degenerate (one key, N windows), so a thin hub suffices and a standalone packet
would over-frame the appetite. The hub instead coordinates with
`goals/desktop-chat-surface` (RPC surface + app-local Layer) and
`goals/workspace-thread-domain` (`ThreadStore` write hook). Escalation to a
standalone packet / sync engine is reserved for explicit no-gos: multi-device
fan-out, a generic cross-slice event bus, or real-time co-editing.

**Status:** open (for /grill-with-docs)

## Q3: What does the first slice nail?

**Recommended:** Cross-window, server-originated UI-projection refresh **only** —
after a `ThreadStore` write commits, push one typed event to the user's *other*
live desktop connections so their UI projections invalidate without polling. Do
**not** build the FalkorDB projection consumer, and do **not** re-implement
in-window invalidation in the hub.

**Rationale:** The repo already owns three reactive-invalidation paths (Atom RPC
`reactivityKeys`/`Reactivity.mutation`, `SqlClient.reactive`, `PgliteClient.listen`/
`notify`), and all three handle *in-window / in-process* refresh; the unique remit
the hub leaves uncovered is bridging a server-side post-commit event to a
*separate* live connection (RESEARCH comparison table). A first slice that
re-implements in-window invalidation would overbuild. The FalkorDB projection is
**aspirational, not a built consumer** — no `packages/drivers/falkordb`, no
in-process projection client exists today (only dev/infra orchestration of an
external container), so the only real downstream now is the UI projection.

**Status:** open (for /grill-with-docs)

## Q4: What is the core fan-out primitive under Effect v4 beta?

**Recommended:** One `Queue` per live connection, drained as a `Stream` via
`Stream.fromQueue` by that connection's streaming-RPC handler; keep `PubSub`
(`effect/PubSub`) as the documented broadcast fallback only if Queue done-signal
semantics churn. Use a `MutableHashMap<UserId, connection[]>` registry guarded by
`SynchronizedRef`.

**Rationale:** This repo is on `effect@4.0.0-beta.91` and there is **no
`effect/Mailbox` module** — the CAPTURE nugget's `conn.mailbox.offer` /
`Mailbox.toStream()` is a dead v3 API. The concept maps cleanly to v4 `Queue`
(`offer`/`takeAll`/`end`/`fail`/`shutdown`) + `Stream.fromQueue` (verified in
`node_modules/effect/dist/Queue.d.ts` + `Stream.d.ts`). A per-user registry does
*targeted* fan-out; a single global `PubSub` would broadcast-then-filter every
event to every connection — wrong shape unless topic/broadcast semantics are
later wanted. `MutableHashMap` is in-repo-proven (`@beep/nlp`, `@beep/repo-utils`);
`SynchronizedRef` exists in v4 but is **NOT FOUND** in any repo `src` — this slice
is its first user, so pin the done-signal / single-vs-multi-consumer guarantees to
beta.91 before committing the hub to `Queue`.

**Status:** open (for /grill-with-docs)

## Q5: Where does the subscription RPC contract live? (placement)

**Recommended:** Hub **service** lands in `@beep/workspace-server` (settled — next
to the `ThreadStore` authority boundary it serves). The subscription **RPC
contract** placement — `@beep/agents-use-cases` (beside `ChatRpcs`) vs
`@beep/workspace-use-cases` — is the genuinely open fork; recommend
`@beep/workspace-use-cases` so the contract co-locates with the workspace authority
that emits the event, **pending** the authority/projection/cache standard's
slice-ownership call. Live-Layer wiring + client subscription land **only** in
`apps/professional-desktop`.

**Rationale:** "App-local live Layer; no God Layers" (`desktop-chat-surface/SPEC.md`)
plus the vertical-slice rule (no slice product code in the app) fix the service home
and the app's role. RESEARCH flags the RPC-contract home as explicitly
**UNRESOLVED** — `ChatRpcs` already lives in `@beep/agents-use-cases` (proven
streaming RPC), but the event originates from the workspace write boundary, which
argues for `@beep/workspace-use-cases`. This is a standard-owned routing call, so do
not pre-commit; ratify the home before the contract lands.

**Status:** open (for /grill-with-docs)

## Q6: How does a live connection resolve identity, and who may subscribe? (auth)

**Recommended:** Resolve each live connection to a `UserId` server-side and key the
registry on it; under Tauri, map N renderer windows to one user. Author the typed
event `Schema` and a subscribe-authorization rule that gates "who may subscribe to
whose events" — even though it is single-user today, the wire contract must **not**
assume single-user.

**Rationale:** RESEARCH's implementation-surface checklist makes identity +
authorization load-bearing, not boilerplate: the registry key *is* the user/session
identity, and the multi-window Tauri case (N renderers → one user) is real design
work, not an afterthought. Hard-coding single-user into the wire contract would bake
a refactor into the first escalation (multi-device/multi-user is the named escalation
trigger). Keeping the authorization rule explicit now costs little and keeps the swap
cheap behind the small port the hub sits behind.

**Status:** open (for /grill-with-docs)

## Q7: Does the first event contract anticipate a FalkorDB projection, and how is SSPL handled?

**Recommended:** Design the typed refresh event so a *future* FalkorDB projection
**could** consume the same event the UI projection consumes (one event, multiple
downstreams), but ship **no FalkorDB runtime** in this wedge. Track SSPLv1 as an
**open licensing gate**, not a settled "clean" item, and require explicit legal /
architecture review before bundling, hosting, or distributing any FalkorDB-backed
projection.

**Rationale:** FalkorDB ships under **SSPLv1** (strong copyleft); internal/single-user
use does not trigger copyleft, but offering its functionality as a service or
bundling/hosting/distributing a FalkorDB-backed projection triggers SSPL's
service-source obligation — material in the privilege-sensitive legal-AI context.
This wedge introduces no FalkorDB code, so no obligation attaches now; designing the
event as a shared post-commit signal (the write path emits one event both projections
consume) keeps the future consumer cheap without committing to the backend. A
non-SSPL graph backend may be warranted if the projection ever ships in a
hosted/distributed product — a decision for that later gate, not this one.

**Status:** open (for /grill-with-docs)
