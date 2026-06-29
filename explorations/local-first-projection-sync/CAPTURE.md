# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Source synthesis: [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
→ section `### Desktop & document portal` → subsection `#### Per-user live
connection hub for projection sync` (around lines 1334–1353), beep-target line:
`@beep/workspace-server` EventStreamHub service (projection refresh after
authority write); consumed by `apps/professional-desktop` transport.

**Cluster rationale:** New-exploration: a `@beep/workspace-server`
EventStreamHub for real-time local-first projection sync after authority writes.
Single high-signal desktop nugget; verified absent (zero EventStreamHub exists
today). beep-effect already ships a Tauri `apps/professional-desktop` shell (IPC
chat transport, PGlite runtime, atom provider) and streams chat turns over RPC,
but has no generic fan-out hub — port this alongside `ThreadStore` so authority
writes push graph/claim mutation events to open workspace windows/threads and
keep FalkorDB/UI projections fresh without polling.

route: `new-exploration` · wave: `P2` · themeSpan: `[desktop-portal]` ·
secondaryTargets: `apps/professional-desktop`, `goals/desktop-chat-surface`,
`packages/workspace/server`

### Nuggets (1)

- **TalentScore#10** (TalentScore) — Per-user live connection hub for local-first real-time projection sync. `packages/server/src/public/event-stream/event-stream-hub.ts:83-118`. → feeds netNew "Per-user live connection hub (EventStreamHub) refreshing projections after an authority write"; beep-target `@beep/workspace-server` EventStreamHub service consumed by `apps/professional-desktop` transport. Snippet: `EventStreamHub is a scoped Effect.Service holding a SynchronizedRef<MutableHashMap<UserId, ActiveConnection[]>> of Mailboxes, with register/unregister/notifyUser/notifyCurrentUser; notifyUser fans a typed event out to all of a user's live WebSocket connections via conn.mailbox.offer(event) and prunes dead mailboxes (Clock.currentTimeMillis-gated). recommend: port · P2`

### netNew (build list)

- Per-user live connection hub (EventStreamHub) refreshing projections after an
  authority write — zero EventStreamHub exists today.

### alreadyCovered (reuse)

- (none)

### Cautions

- P2 desktop/local-first concern; coordinate with the authority/projection/cache
  standard.
- Upstream TalentScore is commercial-licensed — reference/port the design shape
  (scoped Service + SynchronizedRef mailbox fan-out), do not copy code verbatim.
