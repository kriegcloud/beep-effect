# Schema-Driven Extraction Redline Validation

Date: 2026-02-18
Scope: `/Users/pooks/Dev/effect-langextract/docs/plans/schema-driven-extraction-targets.md`
Mode: multi-agent (A: pipeline/parser/data, B: provider/runtime, C: Effect API)
Status: validated and refined for additive, library-first rollout

## Section A: Corrections to Existing Plan Doc

### Agent A (core pipeline/parser/data model) claim matrix

Confirmed:
1. Additive request model is implemented: legacy prompt/examples and schema target mode coexist.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/api/Extraction.ts:47`, `/Users/pooks/Dev/effect-langextract/src/api/Extraction.ts:56`, `/Users/pooks/Dev/effect-langextract/src/api/Extraction.ts:66`, `/Users/pooks/Dev/effect-langextract/src/api/Extraction.ts:114`
2. Legacy prompt/examples pipeline behavior remains operational.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:309`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:315`
3. Resolver/parser supports camelCase canonical + snake_case aliases.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Resolver.ts:132`, `/Users/pooks/Dev/effect-langextract/src/Resolver.ts:142`, `/Users/pooks/Dev/effect-langextract/src/Resolver.ts:152`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:234`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:240`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:280`
4. Invalid schema rows are dropped with structured warnings; chunk does not fail.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:260`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:263`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:398`
5. Typed payload is preserved on extraction rows for typed post-processing.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:287`, `/Users/pooks/Dev/effect-langextract/src/TypedExtraction.ts:9`, `/Users/pooks/Dev/effect-langextract/src/TypedExtraction.ts:55`, `/Users/pooks/Dev/effect-langextract/src/TypedExtraction.ts:60`

Partially true:
1. Plan assumptions around parser normalization were only partially true pre-change; direct snake_case alias support required explicit resolver/annotator alias handling.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Resolver.ts:132`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:234`

Incorrect/outdated:
1. Prior plan language implying parser support for schema-discriminated rows as already complete was outdated before this rollout.
   - Evidence: aliases + row routing now explicit in `/Users/pooks/Dev/effect-langextract/src/Resolver.ts:127` and `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:200`

### Agent B (provider/runtime path) claim matrix

Confirmed:
1. Schema mode routes through structured object generation path.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:439`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:449`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:318`
2. Runtime permit behavior is preserved around text/object/stream paths.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:157`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:320`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:370`, `/Users/pooks/Dev/effect-langextract/src/api/ExecutionLayer.ts:214`
3. Schema fingerprinting is included in cache key for schema-mode structured output only.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:96`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:101`

Current vs planned behavior:
1. Current: schema mode uses `generateObject(...structuredOutput.schema...)`; legacy/freeform path remains prompt-text `infer`.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:439`, `/Users/pooks/Dev/effect-langextract/src/Annotator.ts:461`
2. Planned intent was schema constraints where schema mode is selected; this is satisfied for schema-target calls and intentionally not forced onto legacy mode.

Refined finding (implemented in this pass):
1. Cache metadata originally omitted provider-level temperature/format context unless caller manually passed `providerOptions`.
2. Fix applied: provider defaults now inject metadata and key derivation includes optional `temperature`/`formatType`.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:31`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:56`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:103`, `/Users/pooks/Dev/effect-langextract/src/providers/OpenAI.ts:169`, `/Users/pooks/Dev/effect-langextract/src/providers/Gemini.ts:178`, `/Users/pooks/Dev/effect-langextract/src/providers/Anthropic.ts:162`, `/Users/pooks/Dev/effect-langextract/src/providers/Ollama.ts:155`

### Agent C (Effect API feasibility) claim matrix

Confirmed:
1. Effect Schema AST annotations (`identifier`, `description`, `examples`) are available and used to derive class metadata and prompt sections.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:54`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:60`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:174`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:184`
2. JSON Schema generation from structured output schema is valid and wired.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:231`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:244`, `/Users/pooks/Dev/effect-langextract/src/LanguageModel.ts:25`, `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts:324`

Partially true / fragile assumptions:
1. Example annotations are now validated eagerly (invalid annotated examples fail target construction), but there is still no non-throwing warning mode.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:68`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:204`
2. JSON schema union is still `anyOf`-style rows, but now includes discriminator metadata (`propertyName: extractionClass`, mapping to row refs) for stricter provider guidance.
   - Evidence: `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:159`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:177`, `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts:235`

## Section B: Implementation-Ready Spec Replacement

### Scope and compatibility
1. Keep existing `extract(...)` and CLI prompt/examples workflows fully backward compatible.
2. Add schema mode as library-only surface in this iteration (`extract`, `extractStream`, `extractTyped`); no `--schema` CLI flag.
3. Canonical schema row keys: `extractionClass`, `extractionText`; input aliases accepted: `extraction_class`, `extraction_text`, `extraction_index`.
4. Invalid schema rows: drop row + emit structured warning; do not fail chunk.

### Required implementation shape
1. Target + prompt foundation:
   - `/Users/pooks/Dev/effect-langextract/src/ExtractionTarget.ts`
   - `/Users/pooks/Dev/effect-langextract/src/SchemaPromptBuilder.ts`
2. API surface:
   - `/Users/pooks/Dev/effect-langextract/src/api/Extraction.ts`
   - `LegacyExtractRequest` unchanged semantics
   - `SchemaExtractRequest` additive
   - `extractTyped(...)` additive
3. Runtime + provider wiring:
   - `/Users/pooks/Dev/effect-langextract/src/Annotator.ts`
   - `/Users/pooks/Dev/effect-langextract/src/LanguageModel.ts`
   - `/Users/pooks/Dev/effect-langextract/src/providers/AiAdapters.ts`
4. Cache semantics:
   - include schema fingerprint only for structured calls
   - include provider metadata (`temperature`, `formatType`) when available to avoid collisions and respect deterministic policy
5. Typed payload carry-through:
   - `/Users/pooks/Dev/effect-langextract/src/TypedExtraction.ts`
   - payload marker key `__schemaDataJson`

### Residual risks and follow-ups
1. `ExtractionTarget.make(...)` currently fail-fast on invalid annotated examples; if a softer migration is desired, add optional warning-only mode.
2. Field metadata introspection still only covers string-named property signatures; record/index-signature-heavy schemas may have incomplete prompt field hints.

### Validation gates
1. `bun run typecheck`
2. `bun run test`
3. Targeted schema tests:
   - `/Users/pooks/Dev/effect-langextract/test/foundation/extraction-target.test.ts`
   - `/Users/pooks/Dev/effect-langextract/test/foundation/schema-prompt-builder.test.ts`
   - `/Users/pooks/Dev/effect-langextract/test/foundation/resolver.alignment.test.ts`
   - `/Users/pooks/Dev/effect-langextract/test/api/extraction.api.test.ts`
   - `/Users/pooks/Dev/effect-langextract/test/providers/ai-adapters.structured-output.test.ts`
