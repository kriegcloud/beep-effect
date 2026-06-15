# Desktop Chat Surface — Implementation Progress (2026-06-14)

Incremental, bottom-up port of the `effect-lexical-chat` POC onto the
beep-effect vertical slices. Each increment is verified before the next.
Prerequisites confirmed closed (`rich-text-foundation`,
`workspace-thread-domain` both `completed-retained`).

## Increment 1 — agents-domain block schema + md lift ✅ verified

`packages/agents/domain/src/turn/`:
- `AssistantContent.ts` — stratified (non-recursive) forced-tool structured-output
  schema: `InlineNode` (`TextInline`{bold/italic/code}, `LinkInline`),
  `AssistantBlock` tagged union (`ParagraphBlock`, `HeadingBlock` h1–h3,
  `QuoteBlock`, `ListBlock` bullet/number, `CodeBlock`), `AssistantContent`
  envelope. **v1 md-aligned scope only** — table is a SPEC non-goal; mermaid /
  youtube have no `@beep/md` node, deferred.
- `BlockToMd.ts` — pure lift `AssistantBlock`/`InlineNode` → `@beep/md`
  `Md.model` (`assistantContentToDocument`), so assistant turns persist as the
  same md-aligned `Document` AST as authored content. text→Em→Strong wrapping,
  link→A, paragraph→P, heading→H1/H2/H3, quote→BlockQuote[P], list→Ul/Ol[Li],
  code→Pre(Option language).
- Wired `./turn` export + `@beep/md` dep.

Verify: `bun run --cwd packages/agents/domain check` ✅, `lint` ✅.

## Increment 2 — kernel port + deterministic fixture + scanChunk ✅ verified

New package `@beep/agents-server` (`packages/agents/server`, registered in root
`package.json` workspaces + `tsconfig.json` paths; cloned canvas/server scaffold):
- `src/AssistantTurn/ScanState.ts` — `scanChunk`/`ScanState`/`initialScanState`
  ported **byte-for-byte** (property-test-proven brace-depth extractor that
  pulls each completed element of the streamed `"blocks"` array out of
  `tool-params-delta` text).
- `test/scanChunk.test.ts` — the POC fast-check property test
  ("any envelope × any chunking yields exactly the elements", numRuns 200) +
  single-character-chunking test. Uses `effect/testing` `FastCheck` (avoids an
  uncataloged dep).

`@beep/agents-use-cases` (existing) — the kernel **port** + fixture:
- `processes/AssistantTurn/AssistantTurn.kernel.ts` — `AgentTurnKernel`
  `Context.Service`, `streamTurn(history) => Stream<IndexedBlock, TurnGenerationError>`.
  ONE interface, two implementations (Anthropic + fixture).
- `AssistantTurn.contracts.ts` (`TurnHistoryItem`, `IndexedBlock`),
  `AssistantTurn.errors.ts` (`TurnGenerationError`, public-safe per std 09).
- `AssistantTurn.fixture.ts` — `FixtureTurnKernel` Layer (deterministic, total,
  no LLM) + `fixtureBlocksFor`. Powers the app-level **contract tests** (SPEC
  CI acceptance: fixture behind the same kernel interface, no real-LLM in CI).
- New contract tests assert the deterministic block sequence + streamed indices.

Verify: `agents-server` check ✅ / test ✅ (2 pass) / lint ✅;
`agents-use-cases` check ✅ / test ✅ (6 pass) / lint ✅. (Re-run independently.)

## Increment 3 — Anthropic kernel impl ✅ verified

`@beep/agents-server`: `AnthropicTurnKernel` Layer (`requirement = never`,
self-contained via `@beep/anthropic` `AnthropicTurnPlan`) behind the same
`AgentTurnKernel` port — forced-tool `respond` (non-strict, `toolChoice` forced,
`disableToolCallResolution`), `Stream.withExecutionPlan(AnthropicTurnPlan,
{ preventFallbackOnPartialStream })`, `takeUntil tool-params-end`, `scanChunk`
mapAccum, per-block decode via `AnthropicStructuredOutput.toCodecAnthropic`
(`AnthropicTurnCodec.ts`; provider adaptation in server, not domain, per std 04).
v1: invalid slices dropped-and-logged (no batched repair; mermaid/table/youtube
out of scope). CI codec-build + sample-decode test (no real LLM).
Verify: `agents/server` check ✅ / test ✅ (4) / lint ✅.

## Increment 4 — workspace persistence + ThreadTimeline ✅ verified (incl. PGlite)

- `@beep/workspace-tables`: `to{Thread,Turn,Message}Insert` / `from*Row`
  converters (entity-as-row-codec).
- NEW `@beep/workspace-use-cases`: cross-concept `ThreadStore` port
  (`createThread`/`listThreads`/`appendTurn`/`timeline`) + server-only port
  errors (std 09) + `ThreadTimeline` read-model (turns → items → cost rollup).
- NEW `@beep/workspace-server`: in-memory + `PostgresDrizzle` repo impls +
  `ThreadTimeline` projection + Layer; driver→port error translation.
- Registered `$WorkspaceUseCasesId` / `$WorkspaceServerId` identity composers.
- Verify: tables/use-cases/server check ✅ / test ✅; **PGlite integration test
  PASS** (create thread → user turn idx0 → assistant turn idx1 parent=turn0 →
  timeline ordered, costMicros 0).

## Increment 5 — ChatRpcs + agents/client atoms ✅ verified

- `@beep/agents-use-cases`: `ChatRpcs` RpcGroup (ListThreads, CreateThread,
  GetTimeline, SendMessage⋆stream, EditMessage⋆stream) + `ChatActionError`
  (public action error, std 09) + contract test (stream-flag assertions).
- NEW `@beep/agents-client`: `ChatClient` (`AtomRpc.Service`), `threadsAtoms`,
  `threadTimelineAtoms` (`Atom.family`), `createThreadAtom` (`Reactivity.mutation`),
  `streamingTurnAtom`, `editTargetAtom`, `draftAtoms` (`Atom.kvs`), `runTurnAtom`
  with the **AtomRegistry interrupt-cleanup pattern** (registry.set +
  invalidateUnsafe in `Effect.onInterrupt`, never `ctx.set`) + perceived-latency
  / decode-failure metrics.
- Verify: agents/use-cases check ✅ / test ✅ (9) / lint ✅; agents/client
  check ✅ / lint ✅.

## Increment 6a — chat orchestration handler + app-level contract test ✅ verified

`apps/professional-desktop/src/chat/`:
- `ChatOrchestrator.ts` — `ChatHandlersLive = ChatRpcs.toLayer(...)` wiring
  `AgentTurnKernel | ThreadStore | UsageRecordSink`. SendMessage: persist user
  turn → derive history (Document→plain-text) → `kernel.streamTurn` → **persist
  assistant turn + UsageRecord on `Stream.onEnd` ONLY** (single-shot `Ref`
  guard, NO `onExit`) → **cancel/interrupt persists nothing** (SPEC: no partial
  assistant row; diverges from the POC's partial-persist). std-09 error
  translation, std-12 snake_case spans.
- `UsageRecordSink.ts` — append port + in-memory impl (real PGlite sink + a
  `usage_record` migration are deferred to the live-sidecar increment).
- `test/chat-contract.test.ts` — the **fixture-agent app-level contract test**
  (SPEC CI acceptance): happy path (streams fixture blocks, persists user+
  assistant turns, exactly 1 UsageRecord), **cancel leaves no partial row +
  no UsageRecord**, timeline ordering.
- Verify: app check ✅ / test ✅ (5: 3 contract + 2 existing) / lint ✅.

## Verified milestone (CI-verifiable scope COMPLETE)

`bunx turbo run check` across all 8 touched packages + transitive graph:
**23 successful, 23 total**. CI-verifiable SPEC acceptance met:
- ✅ Fixture agent behind the kernel interface powers app-level contract tests
  (no real-LLM in CI).
- ✅ Cancel-in-flight leaves no partial assistant row (contract-tested).
- ✅ UsageRecord appended at turn finalization (logic + in-memory sink;
  persisted PGlite row deferred to the live sidecar).
- ✅ ThreadTimeline (single-branch degenerate view) — history + tool-call
  placeholders + cost-rollup field.
- ✅ scanChunk extractor with its property test (numRuns 200).
- ✅ Local PGlite persistence proven (workspace integration test).

## Increment 6b-1 — real UsageRecord persistence ✅ verified (incl. PGlite)

- NEW `@beep/epistemic-tables`: `UsageRecord` Drizzle projection +
  `to/fromUsageRecord` converters + `DbSchema`.
- `epistemic_usage_record` migration (`db-admin/drizzle/20260613000010_epistemic_usage_record/`)
  + `EpistemicUsageMigrationTarget` registered in `db-admin` targets.
- App `UsageRecordSinkDrizzle` (PostgresDrizzle-backed; in-memory sink kept for
  the contract test). Total append (driver errors logged, never fail the turn).
- Verify: epistemic-tables check/test/lint ✅; db-admin check/test/lint +
  integration ✅; app jsdom 5/5 ✅; **app PGlite integration test PASS** (append
  UsageRecord → select back → provider/model persisted). Table is
  `epistemic_usage_record` (slice-prefixed via the EntityId factory).

## Increment 6b-2 — chat UI ✅ verified

`apps/professional-desktop/src/chat/ui/`: `StreamingBlocks`, `MessageView`
(`documentToEditorState` → `EditorViewer`), `Composer` (`EditorComposer`; submit
→ `editorStateToDocument` → `runTurn`), `Thread` (timeline + in-flight streaming +
**Stop** `runTurn(Atom.Interrupt)` + edit + degenerate version selector),
`Sidebar`, `ChatApp`. App.tsx → ChatApp; App.test updated + `chat-ui.test.tsx`.
check ✅ / test 9 ✅ / lint ✅.

## Increment 6b-3 — live runtime Layer + bun sidecar ✅ verified (boots here)

`src/runtime/Layer.ts` (`RuntimeLive` req `never`; `CHAT_AGENT` toggles
Anthropic/fixture), `Pglite.ts` (PGlite + `pglite-socket` + migrations-on-boot),
`Observability.ts` (env-gated OTLP); `server/main.ts` (`RpcServer(ChatRpcs)` over
`/rpc` ndjson + BunHttpServer:3939). **In-process rpc smoke + LIVE HTTP boot both
ran here** (listened, pglite-socket up, migrations applied,
CreateThread→SendMessage→GetTimeline persisted).

## Increment 6b-4 — Tauri packaging + joined-trace wiring ✅ verified (builds here)

`scripts/build-sidecar.ts` (**bun-compiled the 97MB sidecar binary here**),
`src-tauri/src/lib.rs` (spawn/kill, `CHAT_DB_PATH` dir, `op read` secrets) —
**`cargo check` PASS**; `tauri.conf.json` externalBin + shell plugin;
`capabilities/default.json`; `vite.config.ts` `/rpc`+`/otlp` proxies;
`@beep/agents-client` `ClientObservability` global layer (joined-trace
span-context propagation, env-gated).

## Quality-gate cleanup + fallow

All 5 new packages: docgen proof + repo-exports catalog shards + dtslint
generated; root `repo-exports:catalog:check` ✅; many feature-caused
lint/law/schema-first/test/config findings fixed. **`fallow:dead-code` lane →
GREEN** (20 → 0: 9 internal-only exports unexported, 1 dead deleted, 11 unused
deps removed — behavior-preserving; feature packages still check ✅ + contract
tests 9/9 ✅).

## Remaining

1. **`bun run beep yeet verify` blocked solely by `fallow:audit`** (pilot lane):
   1 complexity (`scanChunk` — a property-test-proven byte-exact scanner) + 13
   duplication that are the new packages' **standard test/config boilerplate**
   (the per-package `vitest.config.ts` wrapper — already extends the shared base;
   the locally-copied `provideScopedLayer` helper — a pre-existing repo pattern in
   10+ files; pglite-integration-test scaffolds; table column-assertion tests),
   flagged `introduced` only because the files are new. Unlike its sibling
   `fallow:dead-code` (which has `deadCodeRegressionBaseline`), the `fallow:audit`
   lane has **no baseline/waiver wired** into the beep wrapper. Resolution is a
   repo-tooling decision (recommended: wire a symmetric `fallow:audit`
   dupes/complexity baseline — completing the pilot tooling, not weakening it),
   deferred to the repo owner. This is a tooling-gap blocker, NOT a feature defect;
   every other lane is green.
2. **Real-LLM E2E + full `tauri build` bundle** — need an Anthropic key + the full
   Tauri bundle run (the fixture path is keyless; sidecar/cargo/bun-compile all
   succeed here). A keyless fixture-mode browser E2E of the UI flow is feasible in
   dev (`CHAT_AGENT=fixture` + vite + browser).
