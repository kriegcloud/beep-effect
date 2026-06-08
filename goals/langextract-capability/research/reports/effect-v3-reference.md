# Effect v3 Reference Report

Scope: P1 read-only behavior audit of `/home/elpresidank/YeeBois/ontology_research/ontology_ts_repos/effect-langextract`.

Status: completed. The reference checkout was dirty during research, so it is treated as a behavior snapshot, not a source of exact current truth.

## Facts

- The reference project is a standalone Effect v3 TypeScript LangExtract-style package with CLI, ingestion, providers, formatting, resolver/alignment, typed extraction, rendering, and tests.
- The reference package depends on Effect v3-era packages and concrete provider/runtime dependencies.
- The working tree in the reference checkout had unrelated local modifications and untracked output during research, including `bun.lock`, `package.json`, ingestion files, a test file, and `demo-output/`.
- The useful behavioral spine is: source text -> chunking -> prompt construction -> model inference -> format parsing -> deterministic alignment -> merged annotated output.
- `src/Data.ts` defines behavioral concepts such as `AlignmentStatus`, `CharInterval`, `Extraction`, `Document`, `AnnotatedDocument`, and `ExampleData`.
- `src/Chunking.ts` defines fixed character-buffer chunking with source intervals.
- `src/Prompting.ts` and `src/SchemaPromptBuilder.ts` show prompt construction and schema-driven extraction instructions.
- `src/FormatHandler.ts` handles JSON/YAML, fenced responses, wrappers, top-level lists, and strict parsing modes.
- `src/Resolver.ts` is the primary alignment reference: exact matching, lesser/fuzzy matching, ordering, and alignment statuses.
- `src/Annotator.ts` orchestrates multiple passes and merges extraction results.
- `src/LanguageModel.ts` contains a v3 local language-model abstraction and deterministic fake/test model ideas.
- The reference also contains provider adapters, CLI workflows, ingestion readers, rendering, visualization, and live-provider concepts that are out of V1 scope for this packet.

## Evidence

- Reference root: `/home/elpresidank/YeeBois/ontology_research/ontology_ts_repos/effect-langextract`.
- Key behavior files: `src/Data.ts`, `src/Chunking.ts`, `src/Prompting.ts`, `src/SchemaPromptBuilder.ts`, `src/FormatHandler.ts`, `src/Resolver.ts`, `src/Annotator.ts`, `src/ExtractionTarget.ts`, `src/TypedExtraction.ts`, and `src/LanguageModel.ts`.
- Out-of-scope topology: reference `src/providers/**`, CLI entrypoints, ingestion services, rendering/visualization assets, and package provider dependencies.
- Packet exclusions: provider-specific SDK adapters, provider env/config loading, live provider tests, CLI, rendering, and visualization are explicitly out of V1.

## Inferences

- The v3 reference should guide behavior and test cases, not package structure, service wiring, imports, or public API topology.
- Alignment behavior is the highest-value part to port because grounded source spans are the core acceptance criterion.
- Prompt and parser behavior should be adapted into schema-first Effect v4 modules, then constrained to provider-neutral model output.
- Deterministic fake language-model behavior is valuable, but it should be rebuilt against Effect v4 `LanguageModel.LanguageModel`.
- Ingestion, provider adapters, and rendering are tempting but would violate the V1 boundary.

## Recommendations

1. Port the algorithmic spine in small pure/effectful pieces: chunk, prompt, parse, align, orchestrate, adapt to NLP handoff.
2. Use the reference resolver tests as behavioral inspiration for exact, lesser, fuzzy, duplicate, and overlapping-match cases.
3. Implement response parsing for fenced JSON, wrapper objects, top-level arrays, and schema-decoded outputs.
4. Rebuild deterministic fake model support using Effect v4 `LanguageModel.make` or a repo-local test layer.
5. Keep reference status names only if they remain useful after mapping to stricter grounded-span semantics.
6. Convert reference data classes into schema-first repo models rather than copying TypeScript interfaces/classes.

## Do Not Do

- Do not copy the v3 package topology wholesale.
- Do not import or port concrete provider adapters into `@beep/langextract`.
- Do not add CLI, rendering, visualization, or live provider tests in V1.
- Do not use Effect v3 service/tag patterns such as `Effect.Service`, generated `.Default`, or `Context.Tag`.
- Do not carry over native JSON parsing at public boundaries where Effect Schema decoding should be used.
- Do not trust the reference checkout's dirty files as a stable baseline without re-verification.

## Open Questions

- Which alignment statuses should be public in V1: exact, lesser, fuzzy, unaligned, or a smaller set?
- Should the first pass support multipass extraction, or should multipass orchestration wait until the single-pass contract is stable?
- Should YAML response handling remain in V1, or should V1 stay JSON-only until provider compatibility proves a need?
