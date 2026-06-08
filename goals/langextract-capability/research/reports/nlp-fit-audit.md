# NLP Fit Audit

Scope: P1 read-only fit lane for `@beep/nlp` integration and required primitive promotions.

Status: completed from `@beep/nlp` package source, README, package exports, and packet reuse requirements.

## Facts

- `@beep/nlp` is an existing foundation capability and is the packet's highest-priority local reuse target.
- `packages/foundation/capability/nlp/src/Handoff/Contract.ts` defines public handoff models for `Span`, `Provenance`, `TextChunk`, `Mention`, `Entity`, `Relation`, and `AnnotatedDocument`.
- Handoff `Span` documents half-open `[start, end)` semantics, but the schema fields are plain integers. It does not currently encode non-negative offsets or `start <= end`.
- Handoff `Provenance` documents confidence as `[0, 1]`, but the schema uses finite numbers without an explicit bounded range.
- `AnnotatedDocument` groups text chunks, entities, and relations, but it is not a complete LangExtract result shape by itself because it lacks clear top-level mention/source text semantics.
- `Core/Token.ts` already provides branded character and token index primitives, including non-negative `CharPosition`.
- `Core/Document.ts` already provides a source document model with text, tokens, sentences, and document-level metadata.
- `Tools/ChunkBySentences.ts` is an AI tool contract, not the canonical reusable chunking implementation for source-grounded extraction.
- `@beep/nlp/README.md` requires public subpath additions to document owner, tests, and consumers.

## Evidence

- Handoff contract: `packages/foundation/capability/nlp/src/Handoff/Contract.ts`.
- Core character/document primitives: `packages/foundation/capability/nlp/src/Core/Token.ts` and `packages/foundation/capability/nlp/src/Core/Document.ts`.
- NLP package policy and consumers: `packages/foundation/capability/nlp/README.md`.
- NLP package exports: `packages/foundation/capability/nlp/package.json`.
- Existing AI-tool import shape: `packages/foundation/capability/nlp/src/Tools`.

## Inferences

- `@beep/nlp/Handoff` is the correct public destination for generic annotation output, but it needs small invariant upgrades before it can safely serve as a grounded LangExtract handoff.
- LangExtract should not own generic NLP vocabulary. It should own a typed extraction request/result and provide conversion into NLP handoff models.
- Some alignment internals belong in LangExtract even if they mention spans, because they represent parser/alignment state rather than generic NLP concepts.
- Sentence or token chunking should be reused or promoted in `@beep/nlp` only when it becomes a general document-processing helper.

## Recommendations

1. Strengthen `@beep/nlp/Handoff.Span` so it represents half-open source character spans with non-negative offsets and a validated order invariant.
2. Strengthen `@beep/nlp/Handoff.Provenance.confidence` to enforce `[0, 1]` if it remains public confidence metadata.
3. Consider adding small span helper functions in `@beep/nlp`, such as length, overlap, containment, slice, and source-bound validation.
4. Keep `@beep/langextract` alignment traces and candidate-match metadata local; expose only stable grounded output or diagnostics.
5. If LangExtract needs span-preserving sentence chunking as a public utility, promote it to `@beep/nlp/Core` or a documented NLP subpath instead of hiding it in LangExtract.
6. Update `@beep/nlp` README consumer/subpath policy if new public exports are added.

## Proposed Promotion Set

- `Span` invariants: `start >= 0`, `end >= 0`, and `start <= end`.
- `Provenance` confidence: finite and bounded from 0 through 1.
- Optional `Span` helpers: `length`, `isEmpty`, `contains`, `overlaps`, `sliceSource`, and `withinSource`.
- Optional document handoff addition: stable source identity for converting LangExtract results into an `AnnotatedDocument`.

## LangExtract-Local Set

- Extraction target and example definitions.
- Prompt sections and output-format instructions.
- Raw model-response parser state.
- Alignment candidate scoring and traces.
- Model retry/pass orchestration.
- Deterministic fake language-model scripts or test fixtures.

## Do Not Do

- Do not duplicate `@beep/nlp/Handoff` models under new LangExtract names.
- Do not use `@beep/nlp/Tools` as the public extraction IR.
- Do not rely on model-provided offsets without validating against source text.
- Do not put LangExtract prompt templates into `@beep/nlp`.

## Open Questions

- Should the final public `extract` result return only a LangExtract result, only an NLP `AnnotatedDocument`, or both?
- Should `@beep/nlp` define a source-bound span refinement that validates against document text length?
- Should `AnnotatedDocument` include top-level mentions, or are mentions only evidence attached to entities and relations?
