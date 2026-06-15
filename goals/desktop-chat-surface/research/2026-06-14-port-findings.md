# Desktop Chat Surface — P0 Port Findings (2026-06-14)

First-hand read-through of the POC (`/home/elpresidank/YeeBois/projects/effect-lexical-chat`)
and the current `beep-effect` foundation, against `SPEC.md` and the binding
standards (`01`, `09`, `12`). Prerequisite packets `rich-text-foundation` and
`workspace-thread-domain` are both `completed-retained` (all phases `complete`)
— prerequisites satisfied.

## 1. The POC is a single-package reference; the repo is a vertical-slice monorepo

The POC (`effect-lexical-chat`) is one flat package:

- `server/AssistantTurn.ts` — the streaming **turn kernel**: forced-tool
  structured output (`Tool.make("respond", { parameters: AssistantContent })
  .annotate(Tool.Strict, false)`, `toolChoice: { tool: "respond" }`,
  `disableToolCallResolution: true`), `scanChunk` incremental extractor that
  pulls each completed element of the top-level `"blocks"` array out of
  `tool-params-delta` text, per-block validate→route, and a **batched repair
  tail** (`Stream.concat`) that only fires on a finished envelope. Valid blocks
  emit immediately as `IndexedBlock`; invalid ones accumulate in a `Ref` and are
  fixed once by `BlockRepair`.
- `server/{BlockValidation,BlockRepair,MermaidValidator,Anthropic,Db,MessageRepo,Handlers,Observability,main}.ts`
- `shared/{assistant-schema,lexical-schema,rpc}.ts` — block union + lexical
  serialized-state schema + the `ChatRpcs` `RpcGroup` (`SendMessage`/`EditMessage`
  are `stream: true`).
- `src/atoms.ts` — `ChatClient` (`AtomRpc.Service`), `Atom.family` per-thread
  queries with reactivity keys, `Reactivity.mutation`, `Atom.kvs` composer
  drafts, and `runTurnAtom`.
- `src/components/{Composer,Thread,StreamingBlocks,MessageView,Sidebar}.tsx`
- `scripts/build-sidecar.ts`, `src-tauri/src/lib.rs`, `tauri.conf.json`.
- `test/scanChunk.test.ts` (fast-check property test), `test/{blocks,repairPipeline,MessageRepo}.test.ts`.

The port re-expresses this on the repo's hexagonal vertical slices
(`domain ← use-cases ← server`, `domain ← client ← ui`, app-local live Layer).

## 2. Key divergences POC → repo (the port is NOT a copy)

| Concern | POC | beep-effect target |
| --- | --- | --- |
| Persistence | one `messages` table (SQLite-bun) + `superseded_at` | `workspace/domain` `Thread` / `Turn` (with `parentTurnId` lineage + typed `items`) / `Message` entities; `workspace/tables` Drizzle projections; **PGlite** |
| Message content | lexical `SerializedEditorState` JSON string | `@beep/md` `Document` (md-aligned AST) — `Message.content` is `Document` |
| Provider | `@effect/ai-anthropic` inline `AnthropicLive`/`AnthropicTurnPlan` | `@beep/anthropic` driver already exports `AnthropicLive`, `makeAnthropicLanguageModelLayer`, `AnthropicLanguageModelLive`, `makeAnthropicTurnPlan`, `AnthropicTurnPlan` |
| Usage | metrics only, no usage row | `epistemic/domain` `UsageRecord` + `TurnFinalizationUsageAppend` + `appendTurnFinalizationUsageRecord` already modeled; needs append path + repo |
| Errors | one `ChatError` (502) | standard 09: driver→port (server-only)→public action→protocol; translate at each boundary |
| Composition | one `main.ts` God-ish Layer | standard 05 + SPEC: **app-local** live Layer in `apps/professional-desktop/src/runtime/Layer.ts`; no God Layers |

## 3. What already exists (delivered by the two closed packets)

- `packages/workspace/domain`: `Thread{title,workspaceId}`, `Turn{items:TurnItems,
  parentTurnId:Option<TurnId>,threadId,turnIndex}`, `Message{content:Document,
  role,threadId,turnId}`, `Workspace`. `TurnItem` is a tagged union
  (`message|tool_call|tool_result|artifact_ref|activity`) — **tool-call
  placeholders and activity links are already first-class**.
- `packages/workspace/tables`: `EntityTable.pgTableFrom(...)` projections for
  Thread/Turn/Message. (Metadata-only: no repos/migrations here.)
- `packages/epistemic/domain`: `UsageRecord` (activityId, actor:Principal,
  costUsdApproxMicros, inputTokens, latencyMillis, model, outputTokens,
  provider, totalTokens, …) + the append constructor.
- `packages/drivers/anthropic` (`@beep/anthropic`): full layer + turn-plan set.
- `@beep/md` (`packages/foundation/modeling/md`): `Document` AST + `Md.render` +
  codecs. `@beep/lexical` (`…/modeling/lexical`): `Lexical.codec`.
  `@beep/editor` (`…/ui-system/editor`): React editor kit.
- `packages/agents/{domain,use-cases}`: domain has `Agent`/`Skill` entities;
  use-cases has the **`ProfessionalRuntime` proof** (a *different* SDK —
  candidate claims/tasks/drafts/gates — NOT the chat kernel) but its
  `makeInMemoryProfessionalRuntimeSdk(fixtures)` is the **deterministic
  fixture-service pattern** to mirror for the chat fixture agent.
- `apps/professional-desktop`: minimal Tauri + React shell (`App.tsx`,
  `main.tsx`, `src-tauri/src/lib.rs`). **No sidecar, no `src/runtime/Layer.ts`,
  no chat UI, no build-sidecar script.**

Full-stack archetypes to clone: `packages/canvas/{server,client}` +
`apps/canvas` (server uses per-aggregate `.rpc.ts`/`.repo.ts`/`.layer.ts` +
top-level `Layer.ts`; client is currently a stub). No `iam` package exists (the
memory note citing `iam/client` is stale).

## 4. Architecture fork: agents kernel ↔ workspace persistence

Standard 01 forbids slice-to-slice direct imports across
`domain/use-cases/server/tables/client/ui`. So `agents/server` **cannot** import
`@beep/workspace-domain` Thread/Turn/Message directly. Resolution options:

- **(A, recommended)** Persistence repositories live in the **workspace** slice's
  own server surface (new `workspace/use-cases` ports + `workspace/server`
  repos, or wired via `_internal/db-admin`). The **agents** slice owns only the
  turn-generation **kernel** (history → streamed blocks) as a port with two
  implementations (Anthropic + fixture). The **app** composes both slices'
  Layers app-locally and the rpc handler orchestrates kernel + workspace repos.
- (B) Put the whole chat feature in the workspace slice and treat agents as a
  pure LLM-streaming driver. Rejected: SPEC explicitly scopes rpc/atoms to the
  agents slice.

The block→`Document` lift and the `AssistantContent` block union are agents-slice
domain vocabulary; UsageRecord append crosses into epistemic via a
shared/use-cases command or app-local wiring.

## 5. Kernel port specifics to preserve (proof-proven invariants)

- `scanChunk`/`ScanState` ported verbatim with its fast-check property test
  ("any envelope × any chunking yields exactly the elements", + single-char
  chunking). This is the contract test of the streaming extractor.
- Per-block decode via `AnthropicStructuredOutput.toCodecAnthropic` on the
  per-block union (checked Mermaid/Table/YouTube variants live ONLY on the
  per-block codec, never on the classes that feed the provider tool schema).
- Only **completed blocks** persist; deltas are ephemeral wire format.
- **Cancel leaves no partial assistant row** — POC persists on exit only when
  ≥1 block arrived, guarded single-shot via `Ref`; SPEC additionally wants cancel
  to leave *no* assistant row. Reconcile: in the repo, cancel → no Turn/Message
  insert (the user Turn already persisted). Confirm against SPEC's "no partial
  assistant row" wording during P1.
- **Atom interrupt lesson**: `Atom.Interrupt` disposes the node Lifetime before
  the fiber unwinds, so interrupt cleanup writes go through `AtomRegistry`
  (`registry.set(...)`, `reactivity.invalidateUnsafe(...)`), never `ctx.set` in
  `Effect.onInterrupt`. Keep `useAtomMount(runTurnAtom)` so the turn fiber stays
  subscribed.

## 6. Sequenced increments (smallest SPEC-satisfying steps first)

1. **Kernel core (CI-verifiable, no infra/deps):** `agents/domain`
   `AssistantContent` block union + inline union + checked codecs + block→`@beep/md`
   `Document` lift; `scanChunk`/`ScanState` + ported property test; the kernel
   interface (`history → Stream<IndexedBlock>`); the **deterministic fixture
   agent** behind it. Lands in existing `agents/domain` (+ `agents/server` for
   the kernel per SPEC).
2. **Anthropic kernel impl:** wire `@beep/anthropic` `AnthropicTurnPlan` +
   forced-tool stream + BlockValidation/BlockRepair/MermaidValidator.
3. **rpc contracts:** `agents/use-cases` `.rpc.ts` `RpcGroup`
   (ListThreads/CreateThread/GetTimeline/SendMessage⋆/EditMessage⋆) + public/port
   errors per standard 09.
4. **workspace persistence:** Thread/Turn/Message repositories + `ThreadTimeline`
   projection (history + tool-call placeholders + cost rollup) on PGlite;
   UsageRecord append at finalization.
5. **agents/client `.atoms.ts`:** ChatClient AtomRpc + atoms + `runTurn` with
   AtomRegistry interrupt cleanup + perceived-latency/decode-failure metrics.
6. **app:** sidecar server main (bun-compiled `externalBin`, PGlite via
   `pglite-socket`), `src/runtime/Layer.ts` (app-local), chat UI (Composer via
   `@beep/editor`, Thread, StreamingBlocks, Sidebar, version selector),
   `build-sidecar.ts`, `src-tauri/src/lib.rs` spawn/kill + DB path + `op read`
   secrets, `tauri.conf.json` externalBin + capabilities, vite proxy.
7. **verify:** scanChunk property test + fixture-agent app-level contract
   harness (CI, no real LLM); `bun run beep yeet verify`; E2E stepwise evidence.

## 7. GOAL-flagged footprint (checkpoint boundary)

Increments 4–6 necessarily touch GOAL-flagged surfaces — **new packages**
(`agents/server`, `agents/client`, possibly `workspace/use-cases`+`workspace/server`),
**new dependencies + lockfile** (`pglite-socket`, `@electric-sql/pglite`,
lexical/editor in the app, tauri shell/log plugins), **data migration** (PGlite
chat schema), and **infra** (Tauri sidecar + Rust lifecycle). SPEC explicitly
names these target surfaces, so they are in-scope, but the dependency/lockfile/
migration footprint is the natural checkpoint per GOAL's "stop and report"
guardrail. Increments 1–3 are CI-verifiable and free of that footprint.

## 8. Verification reality

Real-LLM E2E needs an Anthropic key (`env`-or-`op read op://BEEP_SECRETS/...`).
CI acceptance is satisfied by the **fixture agent** + scanChunk property test +
the app-level contract harness — no real-LLM dependency. The full Tauri/Rust
E2E is a dev-machine proof, captured as stepwise evidence in `history/`.
