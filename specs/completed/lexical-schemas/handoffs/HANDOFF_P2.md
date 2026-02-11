# HANDOFF P2 — Lexical Schemas: Integration & Server Validation

<!-- Note: Spec originally planned P1=domain envelope, P2=app schemas, P3=integration.
     P1 execution parallelized domain + app work, so this handoff covers the original P3 scope. -->

## Mission

Verify that Lexical content round-trips correctly through the full stack (editor -> RPC -> database -> RPC -> editor) and optionally add headless Lexical validation in documents-server for defense-in-depth.

## What Was Completed in Phase 1

### Domain Layer (packages/documents/domain)
- `src/value-objects/SerializedEditorState.ts` — 5 envelope schemas (`SerializedLexicalNodeEnvelope`, `SerializedTextNodeEnvelope`, `SerializedElementNodeEnvelope`, `SerializedRootNodeEnvelope`, `SerializedEditorStateEnvelope`)
- `src/entities/document/document.model.ts` — `contentRich` changed from `S.Unknown` to `SerializedEditorStateEnvelope`
- `test/value-objects/SerializedEditorState.test.ts` — 12 tests passing

### Application Layer (apps/todox)
- `src/app/lexical/schema/schemas.ts` — Added `SerializedElementNode`, `SerializedTextNode`, `SerializedDecoratorBlockNode` base classes + exported field groups
- `src/app/lexical/schema/node-types.schema.ts` — 37 concrete node schemas + `SerializedLexicalNodeUnion` discriminated union
- `test/lexical/schema/node-types.schema.test.ts` — 46 tests passing

### Cascading Fixes (by verifier)
- `packages/documents/tables/src/tables/document.table.ts` — JSONB column typed with `.$type<SerializedEditorStateEnvelope.Encoded | null>()`
- `packages/documents/domain/src/entities/document/document.rpc.ts` — RPC payload uses `SerializedEditorStateEnvelope` instead of `S.Unknown`

## Learnings from Phase 1

### Critical Gotchas
1. **S.Class.extend cannot override fields**: Use `S.Struct` with spread field groups for discriminated unions where `type` must narrow from `S.String` to `S.Literal`
2. **Element format is polymorphic**: `S.Union(S.Literal("", "left", "start", "center", "right", "end", "justify"), S.Number)` — Lexical serializes as either string or number
3. **Cascading type changes**: Updating a domain model schema propagates to tables (need `.$type<>()`), RPC (payload schemas), and server (repository types). Run full dependency chain verification
4. **@beep/todox path alias**: Not a real package export — use relative imports within `apps/todox/src/` for Bun test compatibility
5. **S.suspend for recursion**: Works with plain `S.Struct` via forward declaration: `const Schema: S.Schema<Type> = S.suspend(() => _Schema)`

### Schema Architecture
- **Domain envelope** (`SerializedEditorStateEnvelope`): Validates tree structure, accepts any `type: string`. No Lexical dependency. Used in Document model and RPC boundary
- **Application union** (`SerializedLexicalNodeUnion`): Validates specific node types via `S.Literal("heading")` etc. Lexical-aware. Used at application boundary
- **Field groups pattern**: `BaseNodeFields`, `ElementNodeFields`, `TextNodeFields` exported for composition without inheritance constraints

## Phase 2 Work Items

### WI-1: Full-stack persistence round-trip test
Create integration test verifying: editor state -> serialize -> RPC encode -> database insert -> database select -> RPC decode -> deserialize -> editor state matches.

Location: `packages/documents/server/test/` or `e2e/`

Key concerns:
- JSONB storage preserves all fields (no truncation, no type coercion)
- `$` NodeState field survives the round-trip
- Null direction values survive (`direction: null`)
- Numeric format values survive (not coerced to string)
- Optional fields (`textFormat`, `textStyle`) are preserved when present and absent

### WI-2: Optional headless Lexical validation service
Create a validation service in `packages/documents/server/` that uses `@lexical/headless` to parse serialized editor state as an additional validation layer.

Location: `packages/documents/server/src/services/LexicalValidation.ts`

This provides defense-in-depth: even if the schema validates structurally, headless Lexical confirms the content can actually be deserialized by a Lexical editor instance.

Key concerns:
- Must register all PlaygroundNodes in the headless editor
- Should handle gracefully when node types are unregistered (log warning, don't crash)
- Should be optional (not in the critical path for document save)

### WI-3: Document create/update integration
Verify that the Document create and update flows work end-to-end with the typed `contentRich` field.

Key concerns:
- `DocumentRepo.insert` accepts `SerializedEditorStateEnvelope` encoded data
- `DocumentRepo.findById` returns properly decoded data
- Empty content (`contentRich: undefined/null`) still works (field is optional)

### WI-4: Error handling for invalid content
Test that malformed Lexical JSON is rejected at the RPC boundary with a clear error message, not a 500 error.

## Verification

```bash
bun run check --filter=@beep/documents-server
bun run test --filter=@beep/documents-server
bun run test --filter=@beep/documents-domain
bun run test --filter=@beep/todox
```

## Reference Files

| File | Purpose |
|------|---------|
| `packages/documents/domain/src/value-objects/SerializedEditorState.ts` | Domain envelope schemas |
| `packages/documents/domain/src/entities/document/document.model.ts` | Document model with typed contentRich |
| `packages/documents/domain/src/entities/document/document.rpc.ts` | RPC payload schemas |
| `packages/documents/tables/src/tables/document.table.ts` | Drizzle table with typed JSONB |
| `packages/documents/server/src/` | Server layer (repos, services) |
| `apps/todox/src/app/lexical/schema/node-types.schema.ts` | Application union schemas |
| `specs/pending/lexical-schemas/REFLECTION_LOG.md` | Phase 1 learnings |
