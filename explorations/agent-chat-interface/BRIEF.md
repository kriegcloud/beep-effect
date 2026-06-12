# Brief

Shape Up pitch for the agent chat interface. Fat-marker fidelity — the goal
packets own the fine lines. Grounded in [`RESEARCH.md`](./RESEARCH.md) and
[`DECISIONS.md`](./DECISIONS.md); back-links, not copies.

## Problem

AI chat inputs — and especially message-*edit* inputs — are impoverished
plain-text boxes. They lose formatting, can't express structured intent, and
make editing destructive. For the professional-desktop control plane this is
not a cosmetic gap: the chat input is the runtime's **command surface**.
Schema-parsed blocks are how the runtime deterministically routes intent —
prose vs artifact references vs slash commands vs (later) proposed writes —
and how thread content becomes exportable, evidence-grade record.

Meanwhile the runtime spine specifies Thread/Turn/Message, ThreadTimeline,
and UsageRecord but none are implemented (`packages/workspace/domain` has no
Thread/Turn), and `apps/professional-desktop` is a shell with no chat UI, no
runtime Layer, and no sidecar. The `effect-lexical-chat` proof repo has
already proven the full stack E2E on the same effect catalog — this work is
a port into doctrine, not an invention.

## Appetite

Three goal packets, each a bounded, independently shippable cycle:

1. foundation rich-text carve (schema + editor kit),
2. workspace thread domain + tables (+ `agents` rename + anthropic driver),
3. E2E desktop chat surface.

Done means: a user opens professional-desktop, starts a thread, sends
rich-block messages, watches a streamed assistant turn render block-by-block,
edits a message (creating a branch), and every turn persists locally in
PGlite with usage recorded. Anything beyond that is a follow-on packet, not
scope creep inside these three.

## Solution sketch (fat marker)

- **`@beep/lexical-schema`** (`packages/foundation/modeling/lexical`):
  Effect Schema models of `SerializedEditorState` + node tagged unions, plus
  Md ↔ Lexical codecs. Zero runtime `lexical` imports (proof:
  `shared/lexical-schema.ts` imports only `effect`); `lexical` as devDep for
  dtslint conformance. `@beep/md`'s AST stays the canonical portable
  document model.
- **`@beep/editor`** (`packages/foundation/ui-system/editor`): React
  composition on raw `lexical` + `@lexical/react` 0.45 — read-only viewer,
  composer primitives, theme, node registration, markdown shortcuts.
  Lobehub's ChatInput/slash-menu UX is design reference only.
- **Workspace domain**: Thread / Turn / Message via `BaseEntity.Class` +
  persisted descriptors; Turn as aggregate with ordered typed items;
  branching as parent-turn lineage. Tables via `EntityTable.pgTableFrom`;
  migrations via `db-admin`; storage on PGlite through `pglite-socket`.
- **Agents slice** (renamed from `agent-capability`): the ported streaming
  turn kernel (forced-tool structured output, `scanChunk` block extraction,
  per-block schema decode) behind one interface with the deterministic
  fixture agent; thin `drivers/anthropic` for acquisition, retry, model pin.
- **Desktop surface**: `apps/professional-desktop` gains sidecar lifecycle +
  app-local runtime `Layer.ts`; chat UI composed from `@beep/editor` +
  AtomRpc patterns from the proof (Atom.family queries, mutation reactivity,
  `Atom.kvs` composer drafts); UsageRecord appended at turn finalization;
  ThreadTimeline rendering with the single-branch degenerate view first.

## Rabbit holes

- **Lexical custom-node scope creep** — the node zoo is open-ended; v1 is
  locked to md-core + artifact-ref, mention/slash as composer affordances.
- **Branching UI complexity** — LibreChat's fork-tree confuses users; render
  branches Claude-style (version selector on edited messages), degenerate
  single-branch first. The *model* branches; the *UI* stays simple.
- **PGlite-in-Tauri lifecycle** — single-connection semantics, sidecar
  spawn/kill, app-data paths; smoke-prove `db-admin` migrations against
  PGlite as an *early* task, not at integration time.
- **Per-model serialization** — XML-for-Claude export is supported by
  existing `@beep/schema` codecs; do not build a general
  serialization-profile system in v1.
- **md-AST lossiness** — Lexical format bitmask / alignment / indent have no
  markdown equivalent; run the lossiness check before locking the
  `@beep/lexical-schema` profile so the canonical-AST decision holds.
- **Lexical version churn** — monthly minor-breaking upstream releases;
  serialized-state durability is app-managed via `importJSON` version
  checks. Owning the persisted AST in `@beep/lexical-schema` is the hedge —
  don't let persisted state couple to raw Lexical serialization.

## No-gos (v1)

- No `@lobehub/editor` dependency (antd/lobe-ui/motion peers, Lexical 0.42
  pin + core patch).
- No ACP session binding — named follow-on after Thread/Turn persistence.
- No proposal blocks (claim/task/draft) — first follow-on; the governance
  hook is decided (thread exempt, blocks gate) but not built in v1.
- No PDF export — md/XML export via existing codecs only.
- No event-sourced turn log — Turn aggregate + typed items, projections stay
  rebuildable.
- No collaboration (`@lexical/yjs`) — single-professional local-first.
