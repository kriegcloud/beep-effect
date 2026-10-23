# #1875 Effect Vitest canon wave 3: record

Lane `residue-vitest-canon`, branch `feat/residue-vitest-canon-wave3` off `main`
`4dc0d2a97e`. Scope: the `@beep/law-practice-server` EV002/EV004 rows named by wave 1,
plus the small leaf packages whose open rows are not EV010 or EV015. The detector lane
#1855 owns detector policy. This wave changes no detector and adds no exception.

Wave 2 (#2153) was still open when this wave started, so its four files
(`AssistantTurn`, `Streaming.functions`, `intake-atoms`, `ThreadStore`) are left out.
#2153 merged during this wave (`1174b549b6`). The only file both waves touch is the
generated inventory: regenerate it with `lint effect-vitest --write` after merging `main`.

## Fresh measurement at `4dc0d2a97e`

`bun run beep lint effect-vitest`: 2,473 files, 1,358 findings, `introduced=0
resolved=1`. The inventory held 1,359 rows (596 open, 763 exceptions). The one resolved
row is the same inherited `worktree-command.test.ts` EV014 exception that wave 2 recorded.

Open rows in scope (not `@beep/repo-cli`, not EV010/EV015, not wave 2's files): 49 rows
in 21 files.

| Package | Rule and class | Open before | Open after |
| --- | --- | --- | --- |
| `@beep/law-practice-server` | EV004 shorter/inner-helper scope lifetime | 9 | 0 |
| `@beep/law-practice-server` | EV002 unresolved-layer-provide | 13 | 12 |
| `@beep/documents-server` | EV002 unresolved-layer-provide | 3 | 0 |
| `@beep/semantica` | EV002 unresolved-layer-provide | 3 | 2 |
| `@beep/practice-kg-mcp` | EV002 unresolved-layer-provide | 1 | 1 |
| `@beep/epistemic-server` | EV002 unresolved-layer-provide | 1 | 1 |
| `@beep/dock-react` | EV004 shorter-scope-lifetime-review | 2 | 0 |
| `@beep/mcp-kit` | EV004 inner-helper-scope-lifetime-review | 1 | 0 |
| `@beep/ontology-server` | EV004 inner-helper-scope-lifetime-review | 1 | 0 |
| `@beep/obs` | EV004 inner-helper-scope-lifetime-review | 1 | 0 |
| `@beep/observability` | EV004 inner-helper / helper scope lifetime | 2 | 1 |
| `@beep/duckdb` | EV004 inner-helper-scope-lifetime-review | 1 | 1 |
| `@beep/qa-capture` | EV004 shorter-scope-lifetime-review | 1 | 1 |
| `@beep/professional-desktop` | EV006 hand-rolled-data-assertion | 2 | 0 |
| `@beep/technical-drawing` | EV006 hand-rolled-data-assertion | 2 | 0 |
| `@beep/ontology-client` | EV006 hand-rolled-data-assertion (browser) | 4 | 4 |
| `@beep/agents-server`, `@beep/epistemic-server` | EV012 unproven-module-mock-review | 2 | 2 |

By rule across the scope: EV004 18 to 3, EV002 21 to 16, EV006 8 to 4, EV012 2 to 2
(49 to 25).

After the migrations, `lint effect-vitest` reports `introduced=0 resolved=28`. The
inventory was regenerated with `lint effect-vitest --write`. It shrinks from 1,359 to
1,331 rows (open 596 to 572, exceptions 763 to 759), and the next scan reports
`introduced=0 resolved=0`. Of the 28 retired rows, 27 belong to this wave: 24 open rows
and three exceptions (DmsMirrorBox `mirrorLayer(unavailable)` and `mirrorLayer(thrown)`,
PracticeKg's DDL read-back). The 28th is the inherited worktree-command row. No row was
added. The rewrite also refreshes line numbers and occurrence hashes for rows in edited
files and in files that moved on `main`; those rows keep their status and reason.

## Per-file migrations

| Package | File | Rows | Change |
| --- | --- | --- | --- |
| `@beep/law-practice-server` | `test/DocumentIdentification/Identification.adapters.test.ts` | 9 EV004 | Every `Effect.scoped` around `withService` (a `Layer.build` plus `Context.get`) is deleted, and the nested generator is inlined into the test body. The services are an HTTP client stub over `Uspto`/RDAP, a no-op `FileSystem` and the extraction batch reader. They hold nothing whose release an assertion observes, so `it.effect`'s own Scope owns them. The `probe` helper becomes `Effect.fn("probe")`. The not-found test keeps `Effect.flip(s.byPatent(...))` as a statement, so a query that succeeds still fails the test. |
| `@beep/law-practice-server` | `test/PracticeKg.projections.test.ts` | 1 EV002 open, 1 EV002 exception | Two tests move their setup into a nested `it.layer(Layer.unwrap(...), { timeout: "2 minutes" })`. That is the form the same file already uses for its mail-run and claims-reader blocks. "Serves the ten graph and document tools" builds the fixture bundle and the MCP host in the layer and reads the manifest through `PracticeKgBundle`. "Keeps the hand-written bundle DDL equal" builds the bundle and provides its PGlite store. In both tests everything before the provide was setup, and the provide was the last use of the store. The test bodies are unchanged. |
| `@beep/documents-server` | `test/DmsMirrorBox.test.ts` | 3 EV002 open, 2 EV002 exceptions | The name-conflict test and the four failure classifications use the file's `withFakeBox` it.layer form. A new `mirrorLayerWith(overrides)` adapter gives the fixture fake a client that answers with the overrides; `makeFakeBox` reuses the same `overrideClient` merge. The two failure tests each held two separate fakes, so each splits in two: "translates a rate-limited Box upload / an unavailable Box rename as retryable" and "translates a rejected Box upload / a thrown Box event poll as non-retryable". Every assertion is kept. `withFakeBox` is unchanged, so its EV003 exception keeps its reason. |
| `@beep/semantica` | `test/Gold.test.ts` | 1 EV002 | "Routes command options through Command.runWith" builds `makeGoldTestLayer` from the committed fixture files in a nested `it.layer(Layer.unwrap(...))`, and reads the manifest from the stubbed `CorpusManifestBuilder`. |
| `@beep/dock-react` | `test/DockviewReact.test.tsx`, `test/Gestures.test.tsx` | 2 EV004 | Each test held two independent mounts and used a shorter scope to dispose the first before the second. Each splits into two tests: "renders missing-renderer diagnostics" and "renders the empty watermark"; "docks to a group left edge" and "docks to the container bottom edge". The test scope and the file's `afterEach(cleanup)` now separate the mounts. |
| `@beep/mcp-kit` | `test/SanitizedToolkit.test.ts` | 1 EV004 | `Effect.scoped` dropped from `Layer.build, Effect.exit`. The build fails by design, so no scope outlives it. |
| `@beep/ontology-server` | `test/SessionServer.test.ts` | 1 EV004 | Same change for the four failing workspace-root configurations. |
| `@beep/obs` | `test/integration/Obs.live.test.ts` | 1 EV004 | `Effect.scoped` dropped. The connection was already the last thing the test body did. The probe-and-skip still runs before any connection. |
| `@beep/observability` | `test/DevTools.test.ts` | 1 EV004 | `Effect.scoped` dropped. The recording client pushes each message synchronously, so the assertions never depended on the tracer's scope closing. |
| `@beep/professional-desktop` | `test/dock-shell.test.tsx`, `test/tauri-youtube-security.test.ts` | 2 EV006 | `expect(x).toEqual(O.some({...}))` becomes `assertSome(x, {...})`, with the same expected operand. |
| `@beep/technical-drawing` | `test/FigureSet.test.ts` | 2 EV006 | The label-finding tuple check becomes `deepStrictEqual` with the same operands, and `expect(O.isNone(...)).toBe(true)` becomes `assertNone(...)`. |

No assertion was removed or weakened and no test was skipped. The splits turn four tests
into eight (DmsMirrorBox +2, dock-react +2). The name-conflict, Gold, DDL and ten-tools
tests keep their names.

## Exceptions re-checked

- `PracticeKg.projections.test.ts` (20 EV002 exceptions left): the claims-batch,
  read-back, carry and host provisions each open a store that the same test body
  created, then close it before a later reopen of that store or a failure injection.
  PGlite and DuckDB lock their files, so one `it.layer` connection cannot stay open
  across the reopen. Kept. Only the DDL read-back, which had no reopen, migrated.
- `DmsMirrorBox.test.ts` (6 EV002 exceptions left): the availability cases close over
  body-owned mutable markers, counters or a per-status loop of fakes. Kept. The two
  exceptions inside the split failure tests migrated with them.
- `Gold.test.ts` (32 EV002 exceptions): rerun and mixed-proposer cases run two
  provisions over one temp output directory. Kept.

## Not migrated: handed to #1855

No exception was added, so these rows stay open, each with a counterexample for #1855.

1. **EV002 body-derived store with a reopen boundary (16 rows).** The provided layer's
   arguments are bindings declared in the test callback (a temp bundle, data directory
   or fake). The test closes that connection before something later in the same body
   reopens the same store or runs the subject against it. `it.layer` builds before the
   body runs, so it cannot take those arguments. Hoisting the whole body into the layer
   would move the subject's own builds and assertions into a hook. Rows:
   - `PracticeKg.projections.test.ts:1121` (dump then reopen `firstOut`), `:1776`,
     `:2011`, `:2202`, `:2206`, `:2213` (open, close, reopen `carriedOut`), `:2369`,
     `:2399`, `:2433`, `:2443`, `:2453` (three sequential carry writes over one store),
     `:2468`;
   - `Gold.test.ts:547` and `:560` (a full run, then a replay-miss run over the same
     output directory), the same shape as the excepted `:511`/`:522`;
   - `practice-kg-mcp/test/Host.test.ts:328` (drop a column, close, then the
     self-check reopens the store);
   - `EdgeAuthority.restart.pglite.test.ts:280` (persistent close and reopen, the same
     shape as the excepted `:226`).

   Proposed repair: when the provided layer expression references a binding declared in
   the enclosing test callback, emit a distinct judgment class, for example
   `body-derived-layer-provide`, with a sketch that does not recommend `it.layer`. Paired
   fixtures: a body-built data directory reopened later (finding in the new class), and
   a module-level layer provided per test (`per-test-layer-provide`, unchanged).
2. **EV004 shorter scope observed by later assertions (3 rows).** Each test asserts
   after the scope closes, and the close is the subject:
   - `DuckDb.service.test.ts:731` (connection and instance close counts);
   - `LocalLgtmServer.test.ts:53` (closing the layer flushes the OTLP exporters; the
     helper's comment says so);
   - `qa-capture/test/Collector.test.ts:183` (the collector must finish before the test
     inspects its files and handle; the comment says so).

   Proposed repair: when the enclosing test body has statements after the
   `Effect.scoped` that read state the scoped resources wrote, classify the row as a
   deliberate shorter lifetime (no finding, or an info class). Paired fixtures: a scope
   followed by a close-count assertion, and a scope with nothing observable after it.
3. **EV006 in real-browser tests (4 rows).** In
   `ontology/client/test/browser/graph-renderer-toggle.test.ts:291`, `:301`, `:311`
   and `:317`, the replacement `utils.assertNone` imports `node:assert`, which fails in
   Chromium. The file's three EV006 exceptions record this. A first attempt here swapped
   in `assertNone` and was reverted for that reason. Proposed repair: skip the
   `@effect/vitest/utils` primitives for files that run in a browser project
   (`test/browser/**`), or route them to `expect` matchers.

## Remaining for later waves

- EV012 (2): `AnthropicTurnKernel.test.ts:33` mocks `@beep/anthropic` because the
  kernel imports `AnthropicTurnPlan` and `generateAnthropicToolJson` directly.
  `BoundedShaclValidator.test.ts:25` mocks a codec factory. Neither has an Effect
  service seam, and `Layer.mock` needs one. Wave 4 (the EV012 family) takes them, with
  a production seam where the owner accepts one.
- `ThreadStore.test.ts:301` EV004: left out because it was a wave 2 file. It is free
  now that #2153 has merged; wave 4 or 5 takes it.
- In-scope rows still open after this wave: 16 EV002, 3 EV004 and 4 EV006 (the #1855
  hand-offs above), plus 2 EV012.
- Next: wave 4, the repo-cli assertion and harness families (EV006, EV005, EV007,
  EV011, EV012, EV013, EV008), as wave 1 planned.

## Verification

Route: S39/S41 Claude chain, `claude-opus-5-5` child (Claude Code Agent tool), no
cross-provider lane. Every heavy command ran alone through `beep-heavy` with stdin from
`/dev/null`. Dependency dists were built first with
`bunx turbo run build --filter="<pkg>^..."` for the ten changed packages (91 tasks).

| Check | Result |
| --- | --- |
| `bun run beep lint effect-vitest` | base `introduced=0 resolved=1`; after the migrations `introduced=0 resolved=28`; after `--write`, `introduced=0 resolved=0` (1,359 to 1,331 rows) |
| `check` (with the test overlay where the package has one) for `@beep/law-practice-server`, `@beep/documents-server`, `@beep/semantica`, `@beep/professional-desktop`, `@beep/obs`, `@beep/mcp-kit`, `@beep/observability`, `@beep/technical-drawing`, `@beep/dock-react`, `@beep/ontology-server` | exit 0, 0 errors each. The first run flagged `nestedEffectGenYield`/`effectFnOpportunity` in the Identification adapters and an unused `O` import in dock-shell; both were fixed before the rerun. |
| Changed suites, Bun / Node | law-practice-server 49 + 1 env-gated skip; documents-server 26; semantica 15; professional-desktop 14; obs 1 skipped (no live OBS); mcp-kit 20; observability 2; technical-drawing 49; dock-react 21; ontology-server 15. Identical on both runtimes. |
| dock-react suites repeated | three more Bun runs, 21/21 each (global `sequence.concurrent`) |
| Negative probes (16 mutations, Bun) | every probed test failed and none hung: the ten-tools count and DDL column lists, two Identification assertions, the DmsMirrorBox 429 override removed and the version count, Gold reason, left-edge axis, missing-renderer text, both `assertSome` payloads, the FigureSet tuple and `assertNone` target, DevTools end attributes, mcp-kit cause text, SessionServer die check. Files restored from backups afterwards. |
| coverage ratchet (`bun run coverage --filter=...`, two runs of five packages) | `ok: compared 5 package(s) with epsilon 0.001` twice |
| `quality package-verify` for all ten packages | exit 0 each (audit and docgen) |
| `lint:schema-first` | introduced=0 |
| `quality fallow audit --check --base origin/main` | `status ok`, 0 findings |
| Biome / oxlint on changed files; root `lint:oxlint` | clean (Biome formatted SessionServer; inventory unchanged after a rescan) |
| `jsdoc:inventory:check` + `jsdoc:ratchet:check` | `increased=0`, zero-legacy ok |
| `lint:retired-effect-paths` | findings=0 |
| `goals:doctor` | no new blocking findings |

## Reversal

Revert the PR. The 27 rows come back with their previous status, and the three
exception reasons come back with the inventory. No source, detector or baseline outside
these test files and the inventory changes.
