# Codex research-gate critique — deterministic-doc-structure-extraction (2026-06-29)

## Blocking

### Complete payload is not identical to LangExtract V1
**Claim**: `RESEARCH.md:105` says the terminal `Complete` payload should be "identical to langextract V1's batch result" and defines that as "`GroundedExtraction[]` + `LangExtractDiagnostics`"; `RESEARCH.md:134` repeats that V1's existing result is the `Complete` event.
**Why it's a problem**: The live `LangExtractResult` is larger than that. `packages/foundation/capability/langextract/src/Extraction/index.ts` defines `LangExtractResult` with `annotatedDocument`, `diagnostics`, `documentId`, `extractions`, and `text`. Implementing the research literally would create a payload that is not identical to V1 and would drop the handoff document plus document identity/text needed for downstream compatibility.
**Fix**: Either make `Complete` carry `LangExtractResult` verbatim, or rename the proposal to a new projected `CompleteExtractionPayload` and stop claiming V1 identity. If projection is intentional, document exactly why `annotatedDocument`, `documentId`, and `text` are excluded and how the admission gate recovers them.

### UnitInterval is not type-identical across the gate
**Claim**: `RESEARCH.md:94` says `UnitInterval` is "the established confidence type" and that regex and LLM candidates should emit the same `UnitInterval` so they are "type-identical at the gate."
**Why it's a problem**: The repo currently has two confidence schemas. `@beep/langextract` and `@beep/nlp/Handoff` use `packages/foundation/capability/nlp/src/internal/numbers.ts`, which defines an unbranded finite number check. `EvidenceSpan` imports `@beep/schema/UnitInterval`, which is branded and explicitly documented as the canonical domain-agnostic primitive. A direct boundary from `GroundedExtraction.confidence` to `EvidenceSpan.confidence` is therefore not actually type-identical.
**Fix**: Update the research to name `@beep/schema/UnitInterval` as canonical for epistemic evidence, and require an explicit decode/rebrand step when promoting `@beep/nlp`/`@beep/langextract` confidence into `EvidenceSpan`. Better: plan a small shared-kernel cleanup to make NLP reuse `@beep/schema/UnitInterval`.

### Poppler GPL surface is not flagged
**Claim**: `RESEARCH.md:39` and `RESEARCH.md:144` list Poppler `pdftotext -bbox-layout` as a higher-fidelity or candidate layout-aware backend, while the licensing section at `RESEARCH.md:118-125` does not mention Poppler.
**Why it's a problem**: Poppler is a copyleft/compliance-sensitive backend. Local package metadata for `poppler 26.06.0-1.1` reports GPL-family licenses (`GPL-2.0-only`, `GPL-3.0-or-later`, plus LGPL/MIT/HPND variants), and `/usr/share/licenses/poppler/README-XPDF` explicitly discusses GPL distribution. A shipped service/container that bundles Poppler or links bindings without a licensing plan can introduce legal risk.
**Fix**: Add Poppler to licensing gravity. Treat it as an optional sidecar requiring legal/compliance review, NOTICE/source-offer handling if distributed, and a clear "system dependency vs bundled dependency" decision. Prefer Apache-2.0 PDFBox or pdf.js where their fidelity is sufficient.

## Advisory

### `@beep/agents` is a false package citation
**Claim**: `RESEARCH.md:102` says "`@beep/agents` already streams schema-validated domain values over Effect RPC" and cites `packages/agents/use-cases/src/processes/Chat/Chat.rpc.ts`.
**Why it's a problem**: The capability exists, but the package path is false. Per the required verification command, `rg -l 'export' packages/ | grep -i agents` plus the package manifests show `@beep/agents-domain`, `@beep/agents-use-cases`, `@beep/agents-server`, and `@beep/agents-client`; there is no `@beep/agents` package. The correct import surface for `SendMessageRpc` is `@beep/agents-use-cases/public`.
**Fix**: Replace `@beep/agents` with `@beep/agents-use-cases` for RPC contracts and mention `@beep/agents-domain` only for `AssistantBlock` schemas.

### Existing file-processing PDF/OCR research is overlooked
**Claim**: `RESEARCH.md:109` says header-stamp/caption work is a deferred `goals/file-processing-capability` lane, and `RESEARCH.md:144` leaves the PDF backend choice open among pdf.js, Poppler, and PDFBox.
**Why it's a problem**: The repo already has more specific prior art in `goals/file-processing-capability/research/gold-intake-ocr-pdf-diagnostics.md` and `goals/file-processing-capability/research/engine-selection.md`. Those docs name a future `@beep/poppler` seam for "PDF diagnostics, bbox/text comparison, image extraction" and Docling as the preferred later layout/OCR structured extraction candidate. Ignoring that prior art risks designing a parallel backend selection process.
**Fix**: Cite and reconcile those goal research files. Keep this packet focused on the deterministic legal-structure extractor and route PDF diagnostics/layout backend selection through the existing deferred OCR/diagnostics lane.

### File-processing `TextSpan` is omitted from the offset inventory
**Claim**: `RESEARCH.md:79` says only three offset shapes exist: `TextAnchor`, `Contract.Span`, and Anthropic's citation offsets.
**Why it's a problem**: `@beep/file-processing` already defines `Extraction.TextSpan` with `{ startOffset, endOffset, text }` and describes it as "byte or character offsets supplied by the engine." That does not invalidate the canonical-`TextAnchor` recommendation, but it is a real in-repo offset-like shape in the same file-processing lane that court-PDF work is supposed to coordinate with.
**Fix**: Add `TextSpan` to the inventory and explicitly classify it as engine-output IR with ambiguous offset units. Then state whether layout extractors should adapt `TextSpan` into `TextAnchor`, retire it, or keep it separate.

### eyecite-js version data is stale
**Claim**: `RESEARCH.md:27`, `RESEARCH.md:129`, and `research/deterministic-legal-regex-prior-art.md:12` call eyecite-js alpha-tagged `v2.7.6-alpha.28` from 2025-08-21.
**Why it's a problem**: Current package metadata should be refreshed before dependency selection. The npm package page for `@beshkenadze/eyecite` (https://www.npmjs.com/package/@beshkenadze/eyecite) currently reports version `2.7.6`, while the GitHub README still describes alpha status; the research's exact alpha pin is therefore stale or at least not the whole publish story.
**Fix**: Re-check npm, GitHub tags/releases, and package tarball license before choosing a pin. Record the exact version to test, then run the upstream parity suite before depending on it.

### Raw note contradicts the aggregate on wink PatternParsers
**Claim**: `RESEARCH.md:90` correctly says raw-text regex should not route through wink token-pattern APIs, but `research/heuristic-first-candidate-gate.md:31` says to reuse `@beep/nlp Core/Pattern*` infra "for the regex/pattern layer rather than duplicating a parser."
**Why it's a problem**: `PatternParsers.ts` parses bracket token patterns such as `[ADJ|NOUN]`, `[DATE|TIME]`, and literal token choices over tokenized documents. It is not a raw `RegExp.matchAll` char-offset layer. The raw note can mislead implementation toward the exact impedance mismatch the synthesis warns against.
**Fix**: Amend the raw note to match the synthesis: reuse `@beep/nlp` conventions and optionally feed wink downstream, but build raw regex span extraction as a sibling helper.

### Court-PDF empirical caveats are softened in synthesis
**Claim**: `RESEARCH.md:38` states the caption separators as "`§`=TX, `:`=NY, `)`=generic" and `RESEARCH.md:37` discusses document-number stamp formats as provenance recovery.
**Why it's a problem**: The raw court-PDF note is more cautious: `research/court-pdf-layout-extraction.md:101-105` marks literal stamp formats, the TX/NY separator mapping, `DktEntry:` distribution, `y0 > 750` page-size assumptions, and LiberationSans over-capture as open or unverified. The synthesis keeps some backend caveats but drops the empirical/not-codified warning around the jurisdiction mapping and stamp variants.
**Fix**: Carry the raw note's caveats into `RESEARCH.md`: treat separator mapping as doctor's empirical heuristic, require real PACER samples before locking regex constants, and compute top-band thresholds from page dimensions.

## Confirmed sound

### Regex span extractor gap is real
**Claim**: `RESEARCH.md:89` says no `matchAll`/`d`-flag/`hasIndices` char-offset regex span extractor exists in `@beep/nlp` or `@beep/langextract`.
**Why it's a problem**: No problem found. Verified with `rg "matchAll|hasIndices|\\.indices"` over the relevant packages; hits were only unrelated `Graph.indices` graph operations.
**Fix**: Keep the gap as net-new, but include the `TextSpan` advisory above so the new helper has a clear relationship to file-processing output.

### LangExtract uniqueness gap is real
**Claim**: `RESEARCH.md:85` says `alignCandidate` uses `sourceText.indexOf(query)` and lacks an ambiguous-vs-not-found distinction.
**Why it's a problem**: No problem found. The live `Alignment/index.ts` exact rung calls `indexOf`, returns the first match, and the `AlignmentStatus` literals are only `match_exact`, `match_lesser`, `match_fuzzy`, and `unaligned`.
**Fix**: Keep the unique-anchor resolver as net-new and add explicit `ambiguous` / `not_found` handling or a richer resolver result union.

### Tika layout gap is real
**Claim**: `RESEARCH.md:110` says the existing Tika driver cannot provide char-level `{fontname, x0, y0}` for the header-stamp predicate and that no layout-aware char-level PDF extractor exists in-repo.
**Why it's a problem**: No problem found. `packages/drivers/tika/src/Tika.service.ts` exposes detect/extract-text/extract-metadata and deferred PDF text-layer handling; targeted searches in `@beep/file-processing` and `@beep/tika` found no pdf.js/pdfplumber/PDFBox `TextPosition`-style layout extractor.
**Fix**: Keep the gap, but route backend selection through the existing file-processing OCR/diagnostics research.

### Effect v4 Stream API warning is sound
**Claim**: `RESEARCH.md:65-66` says repo-pinned Effect v4 beta.91 has `Stream.callback` / `Stream.fromAsyncIterable` and no `Stream.async` / `asyncPush` / `asyncEffect`.
**Why it's a problem**: No problem found. `package.json` and `node_modules/effect/package.json` pin `effect@4.0.0-beta.91`; `node_modules/effect/src/Stream.ts` exports `callback` and `fromAsyncIterable`, and targeted search found no `Stream.async` family export.
**Fix**: Keep the recommendation to use `Stream.fromAsyncIterable` for async-generator bridges and pin/re-check Effect APIs at implementation time.
