# Effect-NLP Entity Extraction MVP Plan

## Objectives
- Deliver a production-ready MVP for entity extraction backed by Effect Schema AST traversal and @effect/ai prompting.
- Reduce the public API to the minimal surface necessary to support deterministic extraction, provenance, and storage.

## Critical Fixes
1. Remove all invalid `Function.dual(1, ...)` usages; replace with plain functions or valid dual arities.
2. Eliminate `as any` casts in core modules (AnnotationParser, PatternBuilders, WinkUtils, etc.).
3. Make optional utilities (wink-nlp-utils) injectable layers rather than hard requirements.
4. Ensure tokenizer offsets and branded indices remain correct (already addressed, keep regression tests).

## Annotation Specification
- Introduce `src/Extraction/Annotations.ts` defining typed schemas for annotations:
  - `CoreAnnotations`: title?, description?, examples?, constraints?, documentation?, default?
  - `RoleAnnotation`: role.
  - `SemanticAnnotation`: semanticType.
  - `IdentifierAnnotation`: identifier.
  - Optional `ProvenanceAnnotation`: source?, comment?.
- Provide helpers: `annotate(schema, annotations)` and typed getters using `SchemaAST.getAnnotation`.
- Refactor existing annotations to use encoded typed structures.

## Schema AST Transformations
- Refactor `src/Extraction/ASTTraverse.ts` to produce a pure `SchemaAstTree`:
  ```ts
  interface SchemaAstNode {
    readonly path: ReadonlyArray<string>;
    readonly ast: SchemaAST.AST;
    readonly context: Annotations.Context;
    readonly children: ReadonlyArray<SchemaAstNode>;
  }
  ```
- Implement folds/compilers:
  - `buildSchemaAstTree(schema): SchemaAstTree`.
  - `foldSchemaAst(node, algebra)` for recursive transformations.
  - `extractLeaves(node)` returning typed leaf descriptions.
- Guarantee immutability (no in-place stamping or mutation).

## Prompt Builder
- Add `src/Extraction/Prompt.ts` mapping AST tree to prompt structures:
  - `PromptPart = { label, description, path, examples, constraints, children }`.
  - `schemaToPromptParts(tree): PromptPart` (functor-like traversal).
  - `renderPromptText(parts, options): string` producing deterministic prompts with JSON output instructions.
- Include configuration (verbose vs compact, include constraints/examples flags).

## Extractor Service (@effect/ai)
- Create `src/Extraction/ExtractorService.ts` composing WinkTokenizer, SchemaPrompt, and AI client layers.
- Core methods:
  - `plan(schema, document): ExtractionPlan` (prompt, expected schema, provenance skeleton).
  - `extract(schema, document): Effect<ExtractedEntity, ExtractionError, R>` performing prompt generation, LLM call, JSON decode, schema validation, and provenance attachment.
- Define canonical LLM output schema:
  ```ts
  interface FieldResult {
    readonly value?: unknown;
    readonly span?: { start: number; end: number };
    readonly confidence?: number;
  }
  ```
  with recursive structures matching the Effect schema.

## Provenance Tracking
- Add `src/Extraction/Provenance.ts` to encode provenance:
  - `Provenance = { documentId, spans: Array<{ path, start, end }>, extractedAt, modelInfo }`.
  - Helpers to map character offsets to token indices and sentences.

## Entity Store Redesign
- Replace `Schema.Unknown` storage with canonical JSON schema representation:
  - `StoredSchema = { schemaId, hash, annotations, format, spec }`.
  - Persist entity values as validated JSON strings with provenance.
- Round-trip helpers: `encodeEntityValue`, `decodeEntityValue`.
- Update `EntityStoreEntry` to include provenance, schema metadata, and value snapshot.

## API Surface Reduction
- Public exports should include only stable components:
  - Core data types (`Document`, `Sentence`, `Token`) and `WinkTokenizer` service.
  - Extraction utilities (`Annotations`, `SchemaAst`, `SchemaPrompt`, `ExtractorService`, `EntityStore`).
- Move experimental APIs under `internal/` namespaces.
- Update README and documentation to reflect the reduced surface.

## Testing Strategy
- **Unit Tests**
  - Annotations encode/decode and getters.
  - AST traversal immutability and leaf extraction.
  - Prompt rendering snapshots.
  - Extractor service with mocked AI returning JSON.
  - Wink tokenizer offsets and provenance mapping.
- **Integration Tests**
  - Full pipeline: schema → prompt → mocked AI JSON → entity validation → storage round-trip.
  - Optional smoke test against real AI (skipped in CI).
- **Property/Snapshot Tests**
  - Prompt rendering idempotence.
  - Span bounds validation.

## Milestones
- **M0: Base Hygiene (1–2 days)**
  - Remove invalid `Function.dual` usage; replace `as any` in core modules.
  - Optional layer injection for wink utilities.
  - ✅ Acceptance: `pnpm tsc`, targeted tests, lint (touched files).

- **M1: Annotations & AST (2–3 days)**
  - Implement typed annotation spec and refactor parser.
  - Pure AST traversal with typed tree and fold.
  - ✅ Acceptance: unit tests + snapshots for annotations/AST.

- **M2: Prompt Builder (2 days)**
  - Implement prompt functor/renderer with deterministic output.
  - ✅ Acceptance: snapshot prompts for example schemas.

- **M3: Extractor Service (3–4 days)**
  - Integrate @effect/ai, plan/extract pipeline, JSON decoding.
  - ✅ Acceptance: integration test with mocked AI.

- **M4: Storage & Provenance (2–3 days)**
  - Redesign EntityStore with canonical schema JSON and provenance.
  - ✅ Acceptance: round-trip tests ensuring reconstruction and provenance integrity.

- **M5: API & Documentation (1–2 days)**
  - Narrow exports, mark internals, update README/docgen.
  - ✅ Acceptance: `pnpm docgen`, updated README, stable public API summary.

## Risks & Mitigations
- **LLM determinism**: enforce strict JSON schema in prompt, add repair/validation via `Schema.decodeUnknownEffect`.
- **Span accuracy**: regression tests for tokenizer offsets, including Unicode and whitespace edge cases.
- **Annotation sprawl**: typed annotation schemas and controlled helper APIs.
- **Performance**: cache prompt renderings and schema hashes to avoid redundant traversals.

## Immediate Next Steps
1. Implement `src/Extraction/Annotations.ts` and refactor `AnnotationParser` to use typed annotations.
2. Refactor `ASTTraverse` to pure typed tree with unit tests.
3. Scaffold `Prompt.ts` rendering logic with initial snapshots.

