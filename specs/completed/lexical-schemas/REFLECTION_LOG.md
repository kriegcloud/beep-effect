# Reflection Log - Lexical Schemas

## Pre-Phase Research (2026-02-10)

### What Worked
- Parallel web research agents efficiently covered serialization format + validation approaches
- Reading Lexical TypeScript type definitions from `node_modules` gave the most precise schema shapes
- MCP memory observations captured all findings for cross-session reuse

### Key Decisions
- **Hybrid approach chosen** over pure structural or pure discriminated union
  - Domain layer gets structural envelope (infrastructure-agnostic, no Lexical dependency)
  - Application layer gets full discriminated union (Lexical-aware, validates all node types)
  - Server layer gets optional headless Lexical round-trip (defense-in-depth)

### Research Gaps
- Need to verify `S.suspend` works correctly with `M.Class` for recursive schemas
- Need to test whether the `type` field discriminator works with Effect Schema `S.Union`
- TextNode format bitmask validation (0-2047 range) needs confirmation

### Patterns Discovered
- Lexical `SerializedLexicalNode` uses `$` key for NodeState (mapped via `S.fromKey`)
- Element nodes always have `children` array (recursive)
- Text format is a bitmask: bold=1, italic=2, strikethrough=4, underline=8, code=16, subscript=32, superscript=64, highlight=128
- `direction` is `'ltr' | 'rtl' | null`
- Existing `SerializedLexicalNode` in todox schema already handles `$` -> `state` mapping correctly

## Phase 1 Execution (2026-02-11)

### What Worked
- **Swarm parallelization was highly effective**: domain-schemas and app-schemas agents worked simultaneously on independent packages, cutting wall-clock time roughly in half
- **Agent prompts with full context** (from AGENT_PROMPTS.md) enabled agents to work autonomously without needing back-and-forth
- **Verifier agent as a final gate** caught 2 cascading type errors (in tables and RPC layers) that schema agents wouldn't have seen
- **Plain S.Struct for envelopes**: Domain agent correctly chose plain `S.Struct` over `S.Class` for structural validators — simpler, no unnecessary class overhead
- **12 domain tests + 46 app tests** all passed on first run

### What Didn't Work / Gotchas
- **S.Class.extend cannot override fields**: The `type` field on `SerializedLexicalNode` is `S.String`, but discriminated union members need `S.Literal("heading")`. `extend` doesn't allow overriding inherited fields. App-schemas agent solved this by using `S.Struct` with spread field groups (`BaseNodeFields`, `ElementNodeFields`, etc.) instead of class inheritance
- **@beep/todox path alias doesn't resolve at Bun test runtime**: `@beep/todox/*` is a Next.js compile-time path alias, not a real package export. Sibling imports within `apps/todox/src/app/lexical/schema/` needed to use relative paths for tests to run
- **Cascading type errors**: Changing `contentRich` from `S.Unknown` to a typed schema caused downstream failures in `documents-tables` (JSONB column needed `.$type<>()`) and `document.rpc.ts` (RPC payload was still `S.Unknown`). The verifier fixed both
- **Element format is polymorphic**: Lexical's `ElementFormatType` is `'' | 'left' | ... | 'justify'` but serialized data also uses numeric 0. Both domain and app schemas needed `S.Union(S.Literal(...), S.Number)`

### Research Gaps Resolved
- **S.suspend works with plain S.Struct**: Forward-declared schema variable + `S.suspend(() => schema)` compiles and validates correctly for recursive `children`
- **S.Union discriminates on `type` field**: Effect Schema's `S.Union` successfully dispatches based on `S.Literal` type fields in each member — confirmed with 37 node types
- **Text format bitmask**: Plain `S.Number` is sufficient — no need to constrain the range since Lexical itself doesn't validate bitmask bounds

### Patterns Discovered
- **Field group composition pattern**: Export `const ElementNodeFields = { children: ..., direction: ..., format: ..., indent: ... }` then use `S.Struct({ ...BaseNodeFields, ...ElementNodeFields, type: S.Literal("heading"), tag: ... })` for each concrete node. This is more flexible than class inheritance for discriminated unions
- **Envelope vs typed schema separation**: Domain envelope accepts `type: S.String` (any node), while app-layer narrows to `type: S.Literal("heading")`. This two-layer validation enables domain to be Lexical-version-agnostic
- **$type on JSONB columns**: When a domain model field changes from `S.Unknown` to a typed schema, the corresponding Drizzle JSONB column needs `.$type<Schema.Encoded>()` to maintain type alignment

### Phase Completion Summary
- **Scope exceeded plan**: P1 orchestrator prompt included both domain envelope (originally P1) AND application discriminated union (originally P2) work. Both completed in a single session via parallel execution
- **58 total tests**: 12 domain envelope + 46 application schema tests
- **37 node type schemas**: Full coverage of all PlaygroundNodes types
- **3 packages verified**: documents-domain, documents-tables, todox — all check/lint/test green
- **Remaining work**: Phase 2 (Integration & Server Validation) — full-stack persistence round-trips and optional headless Lexical validation

## Phase 2 Execution (2026-02-11)

### What Worked
- **3-agent parallel swarm** completed all work items concurrently: schema round-trip tests, DB integration tests, and headless Lexical service
- **Schema round-trip tests (34 new tests)** confirmed encode/decode identity for all envelope schemas, including JSONB simulation via `JSON.stringify`/`JSON.parse`
- **DB integration tests** used existing `PgTest` Testcontainers infrastructure from `db-admin` — no new test infrastructure needed
- **Headless Lexical service** works in Bun without DOM shims — `@lexical/headless` loads and `parseEditorState` runs correctly
- **Lazy module loading** via `Effect.tryPromise(() => import("@lexical/headless"))` keeps the dependency optional at runtime

### What Didn't Work / Gotchas
- **`editor.setEditorState` hangs in Bun**: After `parseEditorState` succeeds, calling `setEditorState` triggers a DOM reconciliation cycle that never resolves in headless Bun. Solution: use `parseEditorState` alone — it fully deserializes the JSON into Lexical's internal `EditorState` graph, which is sufficient to prove structural validity
- **Envelope schema strips child-level fields**: `SerializedLexicalNodeEnvelope` (the recursive base) only retains `type`, `version`, `$`. Element-specific fields (`direction`, `format`, `indent`, `children`) on nested children are stripped during decode. This is by design — the domain envelope validates tree structure, not node-specific fields. The round-trip tests document this behavior explicitly
- **PlaygroundNode registration requires architectural decision**: Full headless Lexical validation with all 37 node types would require importing from `apps/todox/` into `packages/documents/server/`, violating the architecture boundary. Two paths forward documented: extract to shared package or accept node list as parameter
- **TS44 suggestions in JSONB tests**: The custom linting plugin flags `JSON.parse`/`JSON.stringify` usage suggesting Effect Schema alternatives. These are intentional in round-trip tests (simulating JSONB storage behavior)

### Architecture Decisions
- **DB integration tests in `db-admin`**: Written in `packages/_internal/db-admin/test/DocumentContentRich.test.ts` because that's where the PgTest Testcontainers infrastructure lives. Proper `documents-server` test harness setup deferred to future work
- **LexicalValidation service is optional**: Not wired into the document save path. Consumers opt in by including the Layer. This preserves backward compatibility and avoids blocking saves on headless Lexical quirks
- **`@lexical/headless` added to catalog at 0.40.0**: Aligned with other Lexical packages in the monorepo catalog

### Patterns Discovered
- **`Effect.fn` for service methods**: Using `Effect.fn("name")(function* (state) { ... })` provides automatic span creation and structured tracing on service methods
- **`Effect.annotateCurrentSpan`**: Adding span attributes like `lexical.rootType` and `lexical.rootChildrenCount` for observability
- **Test data setup with `PgTest`**: Create prerequisite user + organization records, call `setTestTenant` for RLS, then exercise document CRUD — pattern now proven for future integration tests
- **`O.getOrThrowWith` in tests**: Unwraps `Option` values with descriptive failure messages, cleaner than type casting

### Phase Completion Summary
- **97 total tests** across the spec: 46 domain (12 original + 34 new round-trip), 47 todox app schemas, 4 documents-server (1 existing + 3 new Lexical validation)
- **DB integration tests**: 4 test groups covering insert/retrieve, null contentRich, update flow, and JSONB edge cases (written in db-admin, require Docker)
- **1 new service**: `LexicalValidation` in documents-server with lazy `@lexical/headless` loading
- **4 packages verified green**: documents-domain, documents-server, documents-tables, todox
- **All Phase 2 work items complete**: WI-1 (round-trip), WI-2 (headless validation), WI-3 (create/update integration), WI-4 (error handling)
- **No Phase 3 remaining**: All planned lexical-schemas spec work is complete
