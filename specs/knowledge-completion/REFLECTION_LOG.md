# Reflection Log: Knowledge Completion

> Cumulative learnings from each phase of the knowledge completion spec.

---

## Log Format

Each entry follows this structure:

```markdown
## Phase [N]: [Name] - [Date]

### What Worked
- [Specific technique or approach that succeeded]

### What Didn't Work
- [Approach that failed and why]

### Patterns Discovered
- [New pattern worth promoting to registry]

### Gotchas
- [Specific issue to avoid in future phases]

### Time Estimate Accuracy
- Estimated: [X hours]
- Actual: [Y hours]
- Variance reason: [explanation]
```

---

## Phase Entries

### Phase 0: Spec Creation - 2026-01-22

#### What Worked

- **Deep code analysis before writing spec**: Reading the actual `AiService.ts` revealed 3 methods (`generateObject`, `generateObjectWithSystem`, `generateText`) when initial assumptions only mentioned `generateObject`. This prevented a significant gap in the migration plan.

- **Reference implementation analysis**: Examining `tmp/effect-ontology/packages/@core-v2/` provided concrete patterns for the @effect/ai integration, not just theoretical API knowledge.

- **Pre-flight verification sections**: Adding bash commands to verify file paths before running agents prevents wasted effort on incorrect assumptions.

- **Parallelization diagrams**: ASCII art diagrams showing which tasks can run in parallel improve orchestration efficiency.

#### What Didn't Work

- **Initial scope underestimate**: The original plan file documented only `generateObject` usage. Manual verification found `EntityExtractor` uses `generateObjectWithSystem` (line 171), which has different system prompt requirements.

- **Legacy pattern oversight**: The `Context.GenericTag` usage in AiService (line 124) was not initially flagged as a pattern to avoid replicating.

#### Patterns Discovered

- **AiService interface discovery pattern**: When documenting service interfaces, always verify the actual file contents rather than relying on spec descriptions. Use `grep -n \"readonly\" [file]` to find all methods.

- **Critical question flagging**: Marking certain research questions as "CRITICAL" (e.g., system prompt support, mock Layer pattern) ensures they're answered before design phases.

- **Incremental migration order**: Starting with simplest services (MentionExtractor) before complex ones (EntityExtractor) reduces debugging complexity.

#### Gotchas

- **EntityExtractor is special**: Unlike other extractors that use `generateObject`, EntityExtractor uses `generateObjectWithSystem` for system prompts. This requires special migration handling.

- **@effect/ai system prompt support unclear**: Must verify during P1 research whether @effect/ai has native system prompt support or needs workaround.

- **Mock Layer pattern**: The exact API for creating `Layer.succeed(LanguageModel.LanguageModel, ...)` needs verification - don't assume the pattern without docs.

#### Time Estimate

- Estimated: 1 session
- Actual: 2 sessions (spec creation + spec-reviewer iteration)
- Variance reason: Spec-reviewer identified 5 gaps requiring additional file creation (RUBRICS.md, outputs/, P2-P8 handoffs)

---

### Phase 1: Discovery & Research - 2026-01-22

#### What Worked

- **Parallel agent execution**: Running three research agents in parallel (codebase-researcher for current impl, effect-researcher for @effect/ai, codebase-researcher for reference) maximized efficiency. All three completed within a single orchestration cycle.

- **Pre-flight verification**: Running `ls` and `grep` commands before launching agents confirmed all paths were correct, preventing wasted agent cycles on incorrect file references.

- **Critical question prioritization**: Flagging "system prompt support" and "mock layer pattern" as CRITICAL in agent prompts ensured these blocking questions were answered definitively.

- **Reference implementation analysis**: The `tmp/effect-ontology/packages/@core-v2/` repository provided concrete, working patterns for `Prompt.fromMessages`, `Layer.unwrapEffect`, and test mocking - far more valuable than theoretical documentation.

#### What Didn't Work

- **Initial assumption about `generateObject` usage**: The spec assumed `generateObject` was the primary method. Research revealed ALL 5 LLM calls use `generateObjectWithSystem` - the other two methods (`generateObject`, `generateText`) are never called.

- **Template files needed overwriting**: The output directory had template files that required reading before writing. Future specs should use empty directories or clearly mark templates as "PLACEHOLDER".

#### Patterns Discovered

- **System prompt migration pattern**: `Prompt.make([{role: "system", ...}, {role: "user", ...}])` is the canonical way to pass system prompts to @effect/ai's `generateObject`. This maps 1:1 with `generateObjectWithSystem`.

- **Mock Layer creation pattern**: `Layer.succeed(LanguageModel.LanguageModel, LanguageModel.LanguageModel.of({...}))` - note the double reference to the service tag and the `.of()` constructor.

- **Unused interface methods**: When migrating service interfaces, check actual usage before implementing all methods. `generateObject` and `generateText` exist in AiService but are never called - they can be removed entirely.

#### Gotchas

- **No production provider exists**: AiService has mock-only implementation. This is actually good news - means no provider migration needed, only new provider creation.

- **ExtractionPipeline missing AiService dependency**: The pipeline declares `dependencies` but AiService isn't listed. This is a pre-existing bug that should be fixed during migration.

- **Context.GenericTag in multiple files**: Found 3 instances of legacy `Context.GenericTag` pattern (AiService, EmbeddingProvider, OpenAiProvider). All need migration to modern `Effect.Service` pattern.

#### Time Estimate

- Estimated: 1 session
- Actual: 1 session
- Variance reason: Parallel agent execution worked well; no blockers encountered

---

### Phase 2: Architecture Review - 2026-01-22

#### What Worked

- **Parallel agent execution**: Running `code-reviewer` and `architecture-pattern-enforcer` agents in parallel maximized efficiency. Both completed their scans within a single orchestration cycle.

- **Verification grep commands**: Running targeted grep commands after agent analysis confirmed 100% accuracy - all import violation checks returned 0 results.

- **Pre-existing issue documentation**: Having P1 findings (3 GenericTag instances) documented in HANDOFF_P2.md meant agents knew what to expect and could classify them correctly as "documented, not blocking".

- **Checklist-based validation**: Using explicit checklists for both Effect patterns and slice structure made the review systematic and comprehensive.

#### What Didn't Work

- **Initial stub files needed overwriting**: The output directory had template files with "PENDING" status that required reading before writing. This added an extra step to the workflow.

#### Patterns Discovered

- **Architecture validation grep sequence**: The 6-command grep sequence for verifying slice boundaries is reusable:
  1. `Effect.Service` in domain (should be 0)
  2. `drizzle-orm` imports in domain (should be 0)
  3. Higher-layer imports in domain (should be 0)
  4. Higher-layer imports in tables (should be 0)
  5. Client/UI imports in server (should be 0)
  6. Cross-slice imports anywhere (should be 0)

- **Client stub is valid architecture**: A client package with only `index.ts` stub is acceptable when the slice focuses on server-side processing. The stub documents intent without blocking progress.

- **Legacy patterns as P1 not P0**: When legacy patterns (like Context.GenericTag) are scheduled for deletion in a known future phase, classify as P1 (fix during that phase) rather than P0 (blocking).

#### Gotchas

- **UI package exists unexpectedly**: The knowledge slice has a UI package not mentioned in the spec. Document it but don't let it block - add to P8 validation scope.

- **Named vs namespace imports**: The codebase allows `import { pipe } from "effect/Function"` even though the standard is `import * as F`. This is acceptable but should be noted as P2 style inconsistency.

- **21 services found**: The knowledge-server package has more services than initially expected (21 vs the ~10 mentioned in P1). Comprehensive scans are essential.

#### Time Estimate

- Estimated: 1 session
- Actual: 1 session
- Variance reason: Parallel agent execution worked well; verification commands were quick

---

### Phase 3: @effect/ai Design - 2026-01-22

#### What Worked

- **Reference implementation verification**: Checking actual @effect/ai type definitions (`node_modules/@effect/ai/dist/dts/`) revealed the exact API signatures, which differed from the P1 research documentation. This prevented template compilation failures.

- **Pattern extraction from working tests**: The `tmp/effect-ontology/packages/@core-v2/test/Service/OntologyAgent.test.ts` file provided copy-paste ready patterns for mock Layer creation using `as unknown as LanguageModel.Service`.

- **Iterative template refinement**: Creating templates, verifying compilation, discovering errors, and iterating led to accurate, copy-paste ready templates.

- **Design documents before templates**: Creating `design-llm-layers.md` and `design-migration.md` first clarified the architecture before writing implementation templates.

#### What Didn't Work

- **P1 research API documentation was incomplete**: The P1 `effect-ai-research.md` documented `Prompt.make()` and `generateObject(prompt, schema)` with positional arguments, but the actual API uses an options object: `generateObject({ prompt, schema, objectName })`.

- **Initial template patterns were wrong**: First template versions used:
  - `yield* LanguageModel` instead of `yield* LanguageModel.LanguageModel`
  - `LanguageModel.LanguageModel.of({...})` instead of `{ ... } as unknown as LanguageModel.Service`
  - Positional arguments instead of options object

- **Isolated tsc compilation**: Running `bun tsc --noEmit file.ts` without proper target flags caused ES2015 iteration errors. Templates need `--target ES2024` or project tsconfig.

#### Patterns Discovered

- **@effect/ai mock pattern**: The canonical pattern from reference implementation is:
  ```typescript
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () => Effect.succeed({ value: response, ...responseFields } as unknown),
    generateText: () => Effect.succeed({ text: "", ...fields } as unknown),
    streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as unknown)
  } as unknown as LanguageModel.Service)
  ```

- **System prompt via Prompt.make()**: Confirmed pattern with literal type assertions:
  ```typescript
  Prompt.make([
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt }
  ])
  ```

- **generateObject options pattern**: Takes an options object, not positional arguments:
  ```typescript
  model.generateObject({
    prompt,
    schema: MySchema,
    objectName: "MyOutput"  // optional but helpful
  })
  ```

#### Gotchas

- **Double LanguageModel reference**: Service injection uses `yield* LanguageModel.LanguageModel` (not `yield* LanguageModel`). The first is the namespace, second is the class/tag.

- **Role literal type assertions**: Must use `as const` for role strings (`{ role: "system" as const, ... }`) or TypeScript will infer `string` instead of the literal union type.

- **Response type complexity**: `GenerateObjectResponse` extends `GenerateTextResponse` and has many fields beyond `.value` including `.text`, `.content`, `.reasoning`, `.toolCalls`, `.finishReason`, etc. Mocks need these fields.

- **Template compilation target**: Templates must be compiled with `--target ES2024` or higher for generator iteration. Use project tsconfig for accurate results.

#### Time Estimate

- Estimated: 1 session
- Actual: 1 session
- Variance reason: API verification iteration added time, but reference implementation patterns accelerated recovery

---

### Phase 4: LLM Refactoring - 2026-01-22

#### What Worked

- **Strict implementation order**: Following the prescribed order (dependencies → LlmLayers → extractors → pipeline → cleanup) enabled incremental verification. Each step built on the previous, preventing cascading failures.

- **One-at-a-time extractor migration**: Migrating MentionExtractor first, verifying it compiles, then proceeding to RelationExtractor, then EntityExtractor ensured each migration was isolated and testable.

- **Template patterns from P3**: The `llm-service.template.ts` provided accurate copy-paste ready patterns. The `as const` for role literals and options object format were especially valuable.

- **Immediate lint:fix after verification**: Running `bun run lint:fix` after type checks pass cleaned up formatting issues before they accumulated.

#### What Didn't Work

- **Initial LlmLayers.ts apiKey type**: First version used `string` for apiKey, but @effect/ai requires `Redacted<string>`. Had to add `Config.redacted()` and update the type signature.

- **Token usage fields optional**: `result.usage.inputTokens` and `result.usage.outputTokens` are optional in @effect/ai (possibly undefined). Required null coalescing: `(result.usage.inputTokens ?? 0)`.

#### Patterns Discovered

- **Redacted API key pattern**: `Config.redacted("LLM_API_KEY")` returns `Redacted<string>`, which is what @effect/ai-anthropic and @effect/ai-openai expect for their `apiKey` parameters.

- **Token counting migration**: Replace `result.usage.totalTokens` with `(result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0)` since @effect/ai doesn't provide totalTokens directly.

- **Configuration removal cascading**: Removing `AiGenerationConfig` from extractors required updating ExtractionPipelineConfig to remove `aiConfig` field and removing `aiConfig` from all `filterUndefined()` calls.

#### Gotchas

- **Double LanguageModel still applies**: The P3 pattern `yield* LanguageModel.LanguageModel` was correct and necessary. Don't try to simplify to `yield* LanguageModel`.

- **generateObject options, not positional**: Must use `model.generateObject({ prompt, schema, objectName })` not `model.generateObject(prompt, schema)`.

- **Result access via .value not .data**: `result.value.entities` instead of `result.data.entities` - this mapping affects all extractor code.

- **FetchHttpClient required**: LlmLayers requires `FetchHttpClient.layer` from `@effect/platform` - easy to forget in Layer composition.

#### Time Estimate

- Estimated: 2 hours
- Actual: 1 session (~30 minutes)
- Variance reason: Well-prepared templates and incremental verification made migration straightforward

---

### Phase 5: Test Coverage - 2026-01-22

#### What Worked

- **Mock response registry pattern**: Using a `Map<string, unknown>` for mock responses keyed by `objectName` enabled per-test customization of LLM outputs without rebuilding the Layer.

- **Gradual test complexity**: Starting with pure logic tests (NlpService, GraphAssembler) that don't need LLM mocks, then P0 extraction tests (MentionExtractor, EntityExtractor, RelationExtractor), enabled incremental progress.

- **Type casting for @effect/ai mocks**: The `as unknown as LanguageModel.Service` cast pattern from P3 worked perfectly for mock Layer creation.

- **Simple test pattern**: Using `effect("name", () => Effect.gen(...).pipe(Effect.provide(TestLayer)))` is cleaner and more reliable than `Effect.fn(function* () {...}).pipe(...)`.

#### What Didn't Work

- **ExtractionPipeline tests were too complex**: The pipeline requires composing many services (NlpService, OntologyParser, OntologyCache, OntologyService, all extractors, GraphAssembler, MockLlmLive). The Layer composition became error-prone and was deferred.

- **`Effect.fn(function* () {...}).pipe(...)` pattern incorrect**: Initially used this pattern which doesn't work - `Effect.fn` returns a function, not an Effect. Must use `effect("name", () => Effect.gen(...).pipe(...))`.

- **OntologyCache mock return type wrong**: First mock returned `{ size, hits, misses }` but actual interface is `{ total, active, expired }`. Always check actual interface types.

- **ClassifiedEntity getter in tests**: Testing `triple.isLiteralTriple` getter didn't work because mock data bypasses schema class methods. Had to check underlying fields instead.

#### Patterns Discovered

- **Global mock response pattern**: The `clearMockResponses()` / `setMockResponse(key, value)` pattern allows per-test mock customization:
  ```typescript
  clearMockResponses();
  setMockResponse("MentionOutput", { mentions: [...] });
  // run test
  ```

- **Schema class constructor in tests**: Use `new ExtractedMention({...})` not plain objects when APIs expect schema class instances with methods.

- **Effect test pattern correction**: The correct pattern is:
  ```typescript
  effect("test name", () =>
    Effect.gen(function* () {
      // test body
    }).pipe(Effect.provide(TestLayer))
  );
  ```

#### Gotchas

- **Mock interface must match exactly**: When mocking services, copy the exact method signatures including parameter names and optional flags. TypeScript's exact optional property checks are strict.

- **Effect.fn vs Effect.gen**: `Effect.fn` creates a function that returns an Effect. For tests, use `() => Effect.gen(...)` directly, not `Effect.fn(function* () {...})`.

- **Option fields in mocks**: When interfaces use `O.Option<string>`, mock data must use `O.none()` not `undefined` for those fields.

- **Schema class getters bypass**: Mock data passed through `setMockResponse` bypasses schema class getters like `isLiteralTriple`. Test the underlying fields instead.

#### Time Estimate

- Estimated: 1 session
- Actual: 1 session
- Variance reason: ExtractionPipeline tests deferred due to complex Layer composition; 6 test files with 36 passing tests achieved target

#### Coverage Results

| Metric | Target | Achieved |
|--------|--------|----------|
| Test file count | 6 | 6 |
| Test count | - | 36 |
| Pass rate | 100% | 100% |

---

### Phase 6: GraphRAG Implementation - 2026-01-22

#### What Worked

- **Entity/Relation repo creation before service**: Creating `EntityRepo` and `RelationRepo` with the specific query methods needed for traversal (`findBySourceIds`, `findByTargetIds`, `findByEntityIds`) before building GraphRAGService enabled clean dependency composition.

- **Utility modules before main service**: Creating `RrfScorer.ts` and `ContextFormatter.ts` as pure utility modules first made testing easier and the main service simpler. Pure functions are easier to test than effect-laden services.

- **BS.toOptionalWithDefault pattern**: Using `BS.toOptionalWithDefault(schema)(defaultValue)` for schema fields with defaults is cleaner than trying to use S.optional with a second argument (which doesn't work).

- **Order.mapInput for sorting**: Using `Order.mapInput(Num.Order, (e) => -e.score)` for descending sorts with Effect's A.sort is the correct pattern, not `{ compare: (a, b) => b - a }`.

#### What Didn't Work

- **S.optional with default argument**: Initial attempt used `S.optional(schema, { default: () => value })` which is not valid in Effect Schema. Had to switch to `BS.toOptionalWithDefault(schema)(value)`.

- **A.sort with compare object**: Tried to use `A.sort(items, { compare: (a, b) => ... })` but Effect's A.sort takes an `Order`, not a comparator object. Required using `Order.mapInput`.

- **Direct EmbeddingError import**: Importing `EmbeddingError` directly from `EmbeddingService.ts` didn't work because it's only re-exported from the module index. Fixed by importing from `../Embedding`.

- **Relation objectId as direct string**: The Relation model's `objectId` field is an Option type (via BS.FieldOptionOmittable), requiring special handling with type guards rather than simple undefined checks.

#### Patterns Discovered

- **Order.mapInput for custom sorting**: The canonical Effect pattern for sorting by a derived value:
  ```typescript
  A.sort(items, Order.mapInput(Num.Order, (item) => -item.score))
  ```

- **BS.toOptionalWithDefault for schema defaults**: Curried pattern for optional fields with defaults:
  ```typescript
  topK: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThan(0)))(10)
  ```

- **SQL IN clause with sql.in()**: For queries with array parameters:
  ```typescript
  sql`SELECT * FROM ${sql(tableName)} WHERE id IN ${sql.in(ids)}`
  ```

- **BFS traversal with bidirectional edges**: For N-hop graph traversal:
  ```typescript
  const outgoing = yield* relationRepo.findBySourceIds(frontier, orgId);
  const incoming = yield* relationRepo.findByTargetIds(frontier, orgId);
  ```

#### Gotchas

- **S.TaggedError signature**: The correct pattern is `S.TaggedError<T>()("Tag", { ... })` with empty parens before the tag string, not `S.TaggedError<T>("Tag")({ ... })`.

- **Option type handling in formatters**: When accessing fields that may be Option types from domain models, use type guards or pattern matching rather than simple undefined checks.

- **Effect module imports**: Import from module index files (e.g., `../Embedding`) rather than directly from implementation files to get proper type exports.

- **Test file count**: Adding 2 new test files (RrfScorer, ContextFormatter) increased total from 6 to 8 test files, with 55 passing tests.

#### Time Estimate

- Estimated: 1 session
- Actual: 1 session
- Variance reason: Type errors required multiple fix iterations, but the overall implementation was straightforward

#### Coverage Results

| Metric | Target | Achieved |
|--------|--------|----------|
| Test file count | +1 | +2 |
| Test count | - | 55 |
| Pass rate | 100% | 100% |

---

### Phase 7: Todox Integration - 2026-01-22

#### Status: DEFERRED

Phase 7 was deferred due to missing infrastructure dependencies.

#### Blocking Dependencies

- **Email processing pipeline not implemented**: The comms package (`packages/comms/`) only contains email template infrastructure (`email-template.model.ts`, `email-template.table.ts`), not email reception/processing handlers.

- **No email-to-text extraction interface**: The integration design assumes an `onEmailReceived` handler that doesn't exist.

- **Event emission system incomplete**: While Effect has event patterns, the specific extraction event emission infrastructure isn't implemented.

#### Decision Rationale

1. Phase 7 requires cross-package coordination with comms maintainer
2. GraphRAG (Phase 6) is complete and functional without email integration
3. Proceeding to Phase 8 (Finalization) provides immediate value
4. Phase 7 can be resumed when comms email pipeline is ready

#### Recommended Future Work

1. Implement email receive handler in `packages/comms/server/`
2. Create email body extraction interface
3. Resume Phase 7 with existing GraphRAG and ExtractionPipeline services

---

### Phase 8: Finalization - 2026-01-22

#### What Worked

- **Comprehensive README updates**: Documenting all modules (Runtime, Extraction, GraphRAG, Embedding, Ontology, EntityResolution, Grounding, Nlp) with usage examples made the README useful for consumers.

- **AGENTS.md authoring guardrails**: Including DO/DON'T patterns for LLM integration, schema defaults, sorting, and repository queries provides clear guidance for future contributors.

- **Domain README accuracy check**: Verifying actual exports against documentation prevented stale references to non-existent entities like `KnowledgeGraph` or `mergeGraphs`.

#### What Didn't Work

- **lint:fix with --filter flag**: The `bun run lint:fix --filter @beep/knowledge-server` command runs lint on multiple packages and the lint:deps:fix has issues with --filter. The workaround is to run check and test separately.

- **Test file any casts**: Mock factory patterns like `{ ... } as any` trigger Biome warnings. These are acceptable in test code but create noise in lint output.

#### Patterns Discovered

- **Documentation verification**: Before finalizing documentation, verify exports against `src/index.ts` and glob for actual file structure.

- **README structure for services**: Module Reference → Usage Examples → Database Repositories → Testing → Dependencies → Related Packages provides a logical reading order.

#### Time Estimate

- Estimated: 1 session
- Actual: 1 session
- Variance reason: Documentation updates were straightforward; lint warnings were pre-existing

---

## Spec Completion Summary

### Final Status

| Phase | Name | Status |
|-------|------|--------|
| P1 | Discovery & Research | ✅ Complete |
| P2 | Architecture Review | ✅ Complete |
| P3 | @effect/ai Design | ✅ Complete |
| P4 | LLM Refactoring | ✅ Complete |
| P5 | Test Coverage | ✅ Complete |
| P6 | GraphRAG Implementation | ✅ Complete |
| P7 | Todox Integration | ⏸️ Deferred (blocked on comms email pipeline) |
| P8 | Finalization | ✅ Complete |

### Quantitative Results

| Metric | Target | Achieved |
|--------|--------|----------|
| Test file count | 6 | 8 |
| Test count | - | 55 |
| Pass rate | 100% | 100% |
| Type errors | 0 | 0 |
| AiService references | 0 | 0 |

### Key Deliverables

1. **@effect/ai Integration**: All extractors migrated to `LanguageModel.LanguageModel` with `Prompt.make()` pattern
2. **GraphRAG Service**: k-NN + N-hop traversal + RRF scoring + context formatting
3. **Test Infrastructure**: Mock LLM layer with response registry pattern
4. **Documentation**: Comprehensive README.md and AGENTS.md for server package

### Deferred Work

Phase 7 (Todox Integration) deferred pending:
- Email receive handler in comms package
- Email body extraction interface
- Event emission system

Phase 7 can be resumed when comms email pipeline is implemented

---

## Pattern Candidates

Patterns scoring 75+ on the quality rubric should be promoted to `specs/_guide/PATTERN_REGISTRY.md`.

| Pattern | Score | Status |
|---------|-------|--------|
| Pre-flight verification in handoffs | 78 | Candidate |
| Parallelization diagrams in orchestrator prompts | 72 | Review |
| Critical question flagging for research phases | 80 | Candidate |
| Reference implementation verification for API patterns | 85 | Candidate |
| Iterative template compilation testing | 76 | Candidate |

---

## Anti-Patterns Discovered

| Anti-Pattern | Phase | Mitigation |
|--------------|-------|------------|
| Trusting spec descriptions without code verification | P0 | Always read actual source files before documenting interfaces |
| Single-method assumption for services | P0 | Use `grep -n "readonly"` to find all interface methods |
| Migrating all files at once | P4 | Migrate one file at a time with verification between |
| Context.GenericTag replication | P4 | Check for legacy patterns and flag as "DO NOT REPLICATE" |
| Trusting research phase API docs without verification | P3 | Check actual type definitions in node_modules before creating templates |
| Compiling templates without project tsconfig | P3 | Use `--target ES2024` or project config for accurate compilation |
