# Extraction And Alignment Report

Scope: P1 read-only extraction, parsing, chunking, and source-alignment lane.

Status: completed from the reference implementation, `@beep/nlp`, and Effect v4/provider-neutral constraints.

## Facts

- The packet requires source-grounded half-open character spans and deterministic fake-model tests.
- The reference implementation has a clear alignment pipeline in `src/Resolver.ts`: parse model output, order extractions, exact-match text in source, then fall back to lesser/fuzzy matching.
- The reference uses alignment statuses such as exact, lesser, fuzzy, and unaligned.
- The reference chunking model tracks source intervals for chunks and later maps extraction results back to source text.
- `@beep/nlp` already models documents, tokens, character positions, spans, mentions, entities, relations, and handoff documents.
- Existing `@beep/nlp/Handoff.Span` needs stronger validation before it can be the public guarantee for grounded source spans.
- Model output is untrusted: extracted text, labels, attributes, and offsets must be decoded and validated before alignment.

## Evidence

- Reference files: `src/Chunking.ts`, `src/FormatHandler.ts`, `src/Resolver.ts`, `src/Annotator.ts`, `src/Data.ts`, `src/ExtractionTarget.ts`, and `src/TypedExtraction.ts`.
- NLP span and handoff models: `packages/foundation/capability/nlp/src/Handoff/Contract.ts`.
- NLP document/token models: `packages/foundation/capability/nlp/src/Core/Document.ts` and `packages/foundation/capability/nlp/src/Core/Token.ts`.
- Packet source grounding requirements: `goals/langextract-capability/SPEC.md`.

## Inferences

- V1 should align spans after model response parsing instead of accepting provider/model offsets as authoritative.
- Exact matching should be deterministic and explainable; fuzzy matching should be deterministic and bounded.
- The public result should distinguish extraction content from alignment diagnostics, so consumers can use the output without depending on internal scoring details.
- Span helpers belong in `@beep/nlp` if they are generic; parser and scoring details belong in `@beep/langextract`.

## Recommended V1 Pipeline

1. Normalize source input into an NLP document or source-text record with stable identity.
2. Chunk source text with source span metadata.
3. Build schema-guided prompts from extraction targets and examples.
4. Call injected `LanguageModel.LanguageModel` through the LangExtract service.
5. Parse model output through Effect Schema from unknown/text JSON.
6. Normalize candidate extractions into local candidate records.
7. Align candidates against source text:
   - exact match first;
   - lesser/case/whitespace-normalized match second;
   - bounded fuzzy match third;
   - unaligned result if no deterministic threshold passes.
8. Map aligned candidates into `@beep/nlp/Handoff` models.
9. Return result plus optional diagnostics that do not expose raw prompts/completions by default.

## Recommendations

1. Promote or add `@beep/nlp` span helpers for length, overlap, containment, source slicing, and source-bound validation.
2. Treat offsets as JavaScript string indices unless the final proposal chooses a different canonical offset unit. Document that decision explicitly.
3. Keep chunk-local offsets internal and always convert back to source-document offsets before public output.
4. Prefer deterministic parser normalization for fenced JSON, wrapper objects, and top-level arrays.
5. Keep fuzzy matching thresholds explicit and test-driven.
6. Defer `match_greater` or broad overmatching behavior unless a reference test demonstrates a V1 need.
7. Include duplicate and overlapping extraction tests, because these are common failure cases for extraction pipelines.

## Do Not Do

- Do not trust model-provided spans without validating against source text.
- Do not expose chunk-local offsets as public source offsets.
- Do not rely on non-deterministic tokenizer behavior for public span guarantees.
- Do not bury generic span helpers in LangExtract if they should be reusable by `@beep/nlp`.
- Do not include prompt or completion text in normal diagnostics or telemetry.

## Open Questions

- Should V1 use JavaScript UTF-16 indices, Unicode code point offsets, or another offset unit?
- Should V1 include token-aware fuzzy matching through `@beep/nlp` tokenization, or stay source-string based?
- What fuzzy threshold should be the default, and should it be configurable?
- Should unaligned extractions be returned with diagnostics, dropped, or represented as typed failures?
