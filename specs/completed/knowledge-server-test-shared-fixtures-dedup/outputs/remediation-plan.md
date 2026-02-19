# Remediation Plan (Phase 2)

## Migration Sequence

Order is optimized for lowest behavior-risk first, then progressively more coupled helpers.

1. Batch 1 (Low): Family B LLM helper dedup into existing `TestLayers.ts`
2. Batch 2 (Low): Family C RDF layer recipe dedup (`integration` + `benchmark`)
3. Batch 3 (Medium): Family A GraphContext fixture + shared IDs dedup
4. Batch 4 (Medium): Family A domain entity/relation fixture dedup in `ContextFormatter`
5. Batch 5 (Medium): Family C Workflow extraction layer builder adoption
6. Batch 6 (Medium-High): Family D GraphRAG service mock builders (`CitationValidator`)
7. Batch 7 (High): Family D Workflow/Gmail service mock builders

## Batch Plan (File-Level Rollout)

### Batch 1 (Low): LLM helper wrappers

Create/update:
- `packages/knowledge/server/test/_shared/TestLayers.ts`

Migrate call sites:
- `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
- `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts`

Expected changes:
- Remove local `buildTextResponse` and `withTextLanguageModel` duplicates.
- Import `withTextLanguageModel` from `_shared/TestLayers`.

### Batch 2 (Low): RDF layer recipe

Create/update:
- `packages/knowledge/server/test/_shared/LayerBuilders.ts`

Migrate call sites:
- `packages/knowledge/server/test/Rdf/integration.test.ts`
- `packages/knowledge/server/test/Rdf/benchmark.test.ts`

Expected changes:
- Replace duplicated `TestLayer` declaration with shared `makeRdfBuilderSerializerLayer()` output.
- Keep benchmark timing/assertion helpers local.

### Batch 3 (Medium): GraphContext fixtures and canonical IDs

Create/update:
- `packages/knowledge/server/test/_shared/GraphFixtures.ts`

Migrate call sites:
- `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts`
- `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
- `packages/knowledge/server/test/GraphRAG/CitationParser.test.ts`
- `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts`
- `packages/knowledge/server/test/GraphRAG/ConfidenceScorer.test.ts`

Expected changes:
- Replace repeated fixed ID constants with shared `graphRagFixtureIds`.
- Replace local `createTestEntity` / `createTestRelation` / `createTestContext` with shared builders where equivalent.

### Batch 4 (Medium): Domain entity/relation fixture builders

Create/update:
- `packages/knowledge/server/test/_shared/GraphFixtures.ts`

Migrate call sites:
- `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts`

Expected changes:
- Replace `createMockEntity`, `createMockEntityWithId`, `createMockRelation` with shared domain fixture builders.
- Preserve current local `relationRowIdCounter` behavior or encapsulate equivalent deterministic counter semantics in shared helper.

### Batch 5 (Medium): Workflow layer composition builder

Create/update:
- `packages/knowledge/server/test/_shared/LayerBuilders.ts`

Migrate call sites:
- `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`

Expected changes:
- Replace inline `Layer.mergeAll(..., WorkflowEngine.layerMemory)` composition with shared `makeExtractionWorkflowTestLayer(...)`.

### Batch 6 (Medium-High): GraphRAG service mocks

Create/update:
- `packages/knowledge/server/test/_shared/ServiceMocks.ts`

Migrate call sites:
- `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts`

Expected changes:
- Replace `createMockSparqlService` and `createMockReasonerService` with shared layer builders.
- Preserve local `createInferenceResultWithRelation` (intentional non-dedup).

### Batch 7 (High): Workflow + Gmail mock harnesses

Create/update:
- `packages/knowledge/server/test/_shared/ServiceMocks.ts`

Migrate call sites:
- `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts` (persistence builder)
- `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` (persistence/event harness pieces only where equivalent)
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` (GoogleAuth + HttpClient mock builders)

Expected changes:
- Consolidate reusable service harness builders while preserving scenario payload fixtures and route tables local to the adapter test.

## Verification Steps per Batch

### Global checks after each batch

1. `bun run check`
2. `bun run lint`
3. Run only touched test files first, then a broader suite run for the final batch.

### Batch-specific semantic checks

Batch 1:
- Assert generated LLM outputs still include text + finish parts and usage totals.
- Validate retry/error assertions in `SparqlGenerator` still report `attempts === 3`.

Batch 2:
- Validate RDF integration round-trip counts and benchmark thresholds are unchanged.
- Confirm store-clear behavior remains unaffected.

Batch 3:
- Validate citation parsing order and ID equality assertions stay unchanged.
- Confirm prompt formatting still contains exact expected ID strings.

Batch 4:
- Validate context formatting outputs include relation predicates and literal formatting exactly as before.
- Confirm token-budget truncation tests still pass and relation row ID behavior remains deterministic.

Batch 5:
- Validate workflow success/failure status transitions and output payload assertions.
- Ensure memory engine layer remains included (no runtime missing-service failures).

Batch 6:
- Validate citation entity/relation confidence paths (direct, inferred, missing) all match previous expectations.
- Confirm inferred confidence penalty path still follows depth-based calculation.

Batch 7:
- Validate batch orchestrator event ordering and status transitions in parity tests.
- Validate Gmail scope-failure path and auth token happy path behavior.
- Confirm no regression in adapter parsing of multipart email bodies.

## Rollback/Containment Strategy (Medium/High Risk Batches)

### Batch 3 rollback (Medium)

Trigger:
- Any GraphRAG ID/citation assertion failures after fixture-id consolidation.

Immediate containment:
1. Revert only migrated call sites in the failing file(s) to local fixture constants/builders.
2. Keep shared `GraphFixtures.ts` but mark missing variant in comments for next iteration.
3. Re-run touched file tests before attempting another file.

### Batch 4 rollback (Medium)

Trigger:
- ContextFormatter behavior changes caused by relation/entity default differences.

Immediate containment:
1. Restore local `createMockEntity*` / `createMockRelation` for `ContextFormatter.test.ts`.
2. Keep shared helper additions but narrow scope to `GraphContext` fixtures only.
3. Add explicit TODO in Phase 3 notes for row-id/timestamp determinism gap.

### Batch 5 rollback (Medium)

Trigger:
- Workflow tests fail due to layer order/lifecycle mismatch.

Immediate containment:
1. Restore original local layer composition in `ExtractionWorkflow.test.ts`.
2. Keep `makeExtractionWorkflowTestLayer` unadopted until layer requirements are revalidated.
3. Add explicit dependency-order tests before reattempt.

### Batch 6 rollback (Medium-High)

Trigger:
- CitationValidator confidence semantics drift after mock extraction.

Immediate containment:
1. Keep shared mock builders for Sparql/Reasoner but revert `CitationValidator.test.ts` adoption.
2. Split shared mock API into smaller behavior-specific builders (entity existence, relation direct-hit, inference-hit) before retry.
3. Re-run only `CitationValidator.test.ts` until parity is restored.

### Batch 7 rollback (High)

Trigger:
- Workflow parity or Gmail adapter tests show event/order/auth regressions.

Immediate containment:
1. Revert Workflow and Gmail call-site migrations first; keep shared files for incremental re-adoption.
2. Reintroduce shared mocks one subsystem at a time:
   - Workflow persistence builder only, then event emitter
   - Gmail auth layer only, then HttpClient layer
3. Require per-subsystem green tests before recombining.

## Preserved Non-Dedup Exceptions

Retained exactly from Phase 1:
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`: payload narrative fixtures remain local.
- `packages/knowledge/server/test/Rdf/benchmark.test.ts`: benchmark/perf helpers remain local.
- `packages/knowledge/server/test/Sparql/SparqlService.test.ts:34`: `sparqlServiceLayer` remains local.
- `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts:67`: `createInferenceResultWithRelation` remains local.

## Exit Criteria for Phase 3 Handoff

1. Batches 1-2 complete with no behavior changes.
2. At least one medium-risk batch complete with explicit semantic-equivalence evidence.
3. No intentional non-dedup exception was migrated without a new written justification.
