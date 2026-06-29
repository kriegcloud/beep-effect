# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Seeded from the gold-intake mining pass. Synthesis pointer:
[`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
— see exec-summary item #3 "eyecite-style citation + verbatim-span grounding"
and the **### Provenance & evidence** section (the cluster's nuggets land as
the "Verbatim quote verification", "Ground-before-cite agent research
contract", "Generation-time verbatim citation contract", "Citation lookup:
eyecite spans + typed result schema", "Span-grounded HTML annotation", and
"UnmatchedCitation status lifecycle" subsections).

### Cluster routing

- **Cluster:** Citation lookup + verbatim-span grounding (hallucination guard)
- **route:** new-exploration → primaryTarget `citation-grounding-hallucination-guard` (targetExists=false)
- **wave:** P1 (waveHistogram P1=7, P2=3, P3=1)
- **themeSpan:** governance-ops, legal-nlp, provenance-evidence
- **secondaryTargets:** goals/epistemic-claim-lifecycle-gate · goals/provenance-shared-claim-kernel · packages/foundation/capability/langextract · packages/epistemic/domain

**Rationale.** The grounding substrate already exists: `@beep/epistemic-domain`
EvidenceSpan + `@beep/provenance` TextAnchor give exact char-span primitives,
`goals/epistemic-claim-lifecycle-gate` gives the candidate→admitted lifecycle +
SHACL gate, and `packages/foundation/capability/langextract` Alignment already
does verbatim quote verification with normalized→raw offset mapping
(findLesser's `lowerWithSourceOffsets`) and fuzzy fallback. What has NO home
anywhere in `packages/**/src` or `goals/**` is the citation layer itself — an
eyecite-style citation parser, the citation candidate→resolved RESOLUTION
lifecycle, the ground-before-cite hallucination-guard contract, and cross-chunk
straddle. So the cluster is mixed: REUSE the epistemic + langextract substrate,
add this new packet for the citation/guard capability. Keep citation/IP-law
vocabulary OUT of the epistemic slice (per epistemic SPEC non-goals); this
packet is a downstream consumer composing epistemic + langextract via their
public surface, alongside law-practice-office-action-spike /
ip-law-knowledge-graph.

### Nuggets (11)

- **courtlistener#1** (courtlistener) — Citation lookup API: eyecite parse + exact character spans. `cl/citations/api_views.py:56-63`. → feeds netNew #1 (eyecite-style citation parser → exact char spans; PROSE-IN candidate-with-provenance model). Snippet: `start,end = citation.span(); {citation: matched_text(), normalized_citations:[corrected_citation()], start_index, end_index}`
- **us-legal-tools#6** (us-legal-tools) — Citation lookup + normalization tool (text-blob in, normalized cites out). `packages/courtlistener-sdk/src/mcp/handlers.ts:143-158`. → feeds netNew #1 (CourtListener lookup driver wrap: prose blob → normalized candidate citations; rate 60 cites/min, 250/request, 10k char cap). Snippet: `postCitationLookupHandler(args) → postCitationLookup(bodyParams) → JSON normalized cites`
- **us-legal-tools#7** (us-legal-tools) — Citation result schema (normalized_citations) for span grounding. `packages/courtlistener-sdk/src/mcp/http-schemas/citationResult.ts:8-12`. → feeds netNew #1 (typed result shape; each normalized citation → CandidateClaim w/ provenance spans). Snippet: `interface CitationResult { normalized_citations?: CitationResultNormalizedCitationsItem[] }`
- **courtlistener#2** (courtlistener) — UnmatchedCitation status lifecycle (candidate → resolved/failed gate). `cl/citations/models.py:11-55`. → feeds netNew #2 (citation RESOLUTION lifecycle: NO_CITATION→FOUND→RESOLVED + FAILED_AMBIGUOUS/FAILED; distinct from generic ClaimLifecycle). Snippet: `class BaseUnmatchedCitation: NO_CITATION=1 FOUND=2 RESOLVED=3 FAILED_AMBIGUOUS=4 FAILED=5; status: SmallIntegerField(choices=STATUS)`
- **mike#1** (mike) — Ground-before-cite case-law research protocol (system prompt). `backend/src/lib/legalSourcesTools/courtlistenerTools.ts:81-90`. → feeds netNew #3 (ground-before-cite CONTRACT: citations must be based on opinion text/snippets supplied IN THIS TURN, never memory/metadata/search/verification output). Snippet: `Final case citations must be based on opinion text or passage snippets supplied in this turn. Do not cite based only on memory, metadata, search results, citationLinks, or verification results.`
- **mike#3** (mike) — Document-citation contract: verbatim quotes + page spans as JSON. `backend/src/lib/chatTools.ts:120-136`. → feeds netNew #3 (generation-time span-grounded contract) + netNew #4 (page-straddle via [[PAGE_BREAK]]). Snippet: `<CITATIONS>[{ref:1, doc_id:"doc-0", quotes:[{page:3, quote:"exact verbatim text"}]}, {ref:2, quotes:[{page:"41-42", quote:"...[[PAGE_BREAK]]..."}]}]</CITATIONS>`
- **research-squad#1** (research-squad) — Exact-text-preservation citation grounding prompt. `baml_src/agents/citations.baml:24-42`. → feeds netNew #3 (PROSE-IN/PROOF-OUT: reproduce synthesized text 100% byte-identical, only insert citation tags at semantic boundaries; reject if non-citation text diverges; EvaluateCitationQuality LLM-judge rubric at line 50+). Snippet: `add citations within <exact_text_with_citation>; do NOT modify synthesized_text, keep 100% identical incl. whitespace; non-citation text compared to original, rejected if not identical`
- **doc-haus#2** (doc-haus) — Verbatim quote verification with normalized→raw offset mapping and cross-chunk straddle. `dochaus/tool/verify-quote.ts:37-56`. → feeds netNew #4 (cross-chunk straddle: reconstruct doc text across chunk boundaries) + REUSE langextract Alignment normalized→raw map; returns VERIFIED-with-location or NOT FOUND, never near match. Snippet: `normalizeWithMap(raw): normalize whitespace/curly-quotes (no case fold), keep normalized-index→raw-offset map; out += “”→\" ‘’→' ; map.push(i)`
- **doc-haus#4** (doc-haus) — Output-side citation re-verification ladder + matter-isolation ethical wall + untrusted-document framing. `dochaus/plugin/legal.ts:214-232`. → feeds netNew #3 (output-side hard wall: re-check each span vs LIVE file via exact→re-anchor(nearest)→reject ladder; drop quotes whose text no longer exists; provenance staleness handling) + governance-ops (matter-dir fencing, official-source webfetch restriction, "documents are untrusted data" block). Snippet: `verifyCitation: text.slice(charStart,charEnd)===excerpt ? verified : findQuote(text, excerpt, charStart) ? re-anchor {charStart,charEnd,excerpt,verified,reanchored} : undefined`
- **courtlistener#3** (courtlistener) — Span-grounded HTML annotation with plain↔markup offset mapping. `cl/citations/annotate_citations.py:77-128`. → feeds netNew #3 (span→source round-trip: render citation annotations back into rich/Lexical markup without corrupting it; Id/Supra use full_span to avoid unbalanced HTML; plain_to_markup offset_updater, unbalanced_tags="skip"). Snippet: `annotation_span = full_span() if Id/Supra else span_with_pincite(); annotate_citations(plain_text, generate_annotations(resolutions), source_text=markup_text, unbalanced_tags="skip", offset_updater=plain_to_markup)`
- **Juris.AI#2** (Juris.AI) — Legal-advice prompt template: assemble retrieved case-law + statute context + mandatory disclaimer. `src/lib/ai-services.ts:566-668`. → feeds netNew #3 (output-contract pattern: numbered context block + Sources Referenced footer + fixed LEGAL_DISCLAIMER constant) — CAUTION: here sources are fabricated mock data with NO spans, exactly what beep must NOT do; re-ground on real provenance-spanned evidence before the LLM sees it. Snippet: `legalContext += "Relevant Case Law:" + numbered "name (date) - court" + "Citation: ..."; return finalResponse + LEGAL_DISCLAIMER`

### netNew (BUILD)

1. **eyecite-style legal citation parser** — detect citations in text and emit exact char spans (no parser exists; `rg` for eyecite/citation/reporter returns only test-reporter and unrelated hits).
2. **UnmatchedCitation candidate→resolved RESOLUTION lifecycle** — resolving a parsed citation to an authority/reporter; distinct from the generic claim-admission ClaimLifecycle. States NO_CITATION→FOUND→RESOLVED + FAILED_AMBIGUOUS/FAILED.
3. **verbatim-citation / ground-before-cite hallucination-guard CONTRACT** — require a verified verbatim span before a citation may be emitted; composes EvidenceSpan + ClaimGate + citation parse but is itself net-new. Includes generation-time exact-text discipline, output-side re-verification ladder, and the prompt/output-contract + disclaimer pattern.
4. **cross-chunk straddle verification** — langextract Alignment matches against a single source string only, so quote verification across chunk (and page) boundaries has no home.

### alreadyCovered (REUSE — cite, do not rebuild)

- **exact char-offset span grounding primitive** — `@beep/provenance` TextAnchor + `@beep/epistemic-domain` EvidenceSpan `{startChar, endChar, quote, confidence}`.
- **candidate→…→admitted lifecycle machinery + SHACL ClaimGate verdict** — `goals/epistemic-claim-lifecycle-gate` (ClaimLifecycle / ClaimGate / ClaimProjection).
- **verbatim quote verification with normalized→raw offset mapping** — langextract Alignment (findExact / findLesser via `lowerWithSourceOffsets` normalized→source offset arrays / findFuzzy Levenshtein), emitting `match_exact | match_lesser | match_fuzzy | unaligned` with char Spans.

### cautions

- **AGPL:** eyecite/courtlistener and mike are AGPL — reimplement the citation-parse + ground-before-cite contract from spec, do NOT copy source.
- **doc-haus license unknown** — treat normalized→raw offset + straddle logic as reference only; note langextract Alignment already implements the normalized→raw mapping in MIT-clean repo code, so prefer EXTENDING it over porting doc-haus.
- **Reuse, don't fork the lifecycle** — reuse (do not rebuild) the existing ClaimLifecycle/ClaimGate pattern and EvidenceSpan/TextAnchor rather than introducing a parallel citation lifecycle.
- **Slice scope** — keep citation/IP-law vocabulary out of the epistemic slice (per epistemic SPEC non-goals); this packet is a downstream consumer composing epistemic + langextract via public surface, alongside law-practice-office-action-spike / ip-law-knowledge-graph.
- **Mock-source anti-pattern** — Juris.AI#2's fabricated mock "sources" are the explicit negative example: never let unspanned sources reach the LLM.
- PatentsView sunset is not relevant to this cluster.
