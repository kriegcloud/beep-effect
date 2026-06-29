# ground-before-cite-contract-design

Scope: compare the four gold-nugget prompt/output-contract patterns against primary vendor + academic sources, and decide beep's enforced generation-time contract (in-turn-span-only citation, exact-text reproduction, output schema, mandatory disclaimer, LLM-judge rubric), treating unspanned mock sources as the negative example.

## Findings

### 1. The four nugget patterns, restated and adversarially corroborated

- **mike#1 — turn-scoped grounding rule** (CAPTURE.md `backend/src/lib/legalSourcesTools/courtlistenerTools.ts:81-90`): "Final case citations must be based on opinion text or passage snippets supplied in this turn. Do not cite based only on memory, metadata, search results, citationLinks, or verification results." This is the load-bearing rule of the whole packet. It is corroborated structurally by Anthropic's Citations feature, which only lets the model cite from `document`/`search_result` blocks supplied **in the request** ("Ground Claude's responses in your source documents… citations are guaranteed to contain valid pointers to the provided documents") — there is no path to cite from model memory ([Anthropic Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)).
- **research-squad#1 — byte-identical exact-text preservation** (`baml_src/agents/citations.baml:24-42`): add citation tags inside `<exact_text_with_citation>`; do NOT modify `synthesized_text`; keep it 100% identical including whitespace; non-citation text is compared to the original and **rejected if it diverged**. BAML (BoundaryML) is Apache-2.0, so this pattern is portable, not just referenceable ([BAML license](https://github.com/BoundaryML/baml), [BoundaryML org](https://github.com/orgs/BoundaryML/repositories)).
- **mike#3 — verbatim-quote + page JSON schema** (`backend/src/lib/chatTools.ts:120-136`): `<CITATIONS>[{ref:1, doc_id:"doc-0", quotes:[{page:3, quote:"exact verbatim text"}]}, {ref:2, quotes:[{page:"41-42", quote:"...[[PAGE_BREAK]]..."}]}]</CITATIONS>` — a model-authored JSON sidecar carrying verbatim quote + page span, with `[[PAGE_BREAK]]` for page straddle.
- **Juris.AI#2 — disclaimer + Sources footer, mock-source anti-pattern** (`src/lib/ai-services.ts:566-668`): numbered context block + "Sources Referenced" footer + a fixed `LEGAL_DISCLAIMER` constant. CAUTION from CAPTURE: here the "sources" are fabricated mock data with **no spans** — the explicit negative example. Keep the disclaimer-constant pattern; discard the mock-source assembly.

### 2. The canonical vendor implementation of "in-turn-span-only" citation = Anthropic Citations

Anthropic's Citations feature is the closest production-grade instantiation of mike#1's contract and should be the reference wire format. Mechanics ([Anthropic Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)):
- Documents are passed as `document` blocks with `"citations": {"enabled": true}` (all-or-none across documents in a request). Plain text and PDFs are auto-chunked to **sentences**; custom-content documents are used as-is (you control granularity).
- The response is **multiple interleaved `text` blocks**, where a cited block carries a `citations[]` array. Each citation has `cited_text` (the exact source quote), `document_index`, `document_title`, and a location discriminated by `type`:
  - `char_location`: `start_char_index` / `end_char_index` (0-indexed, exclusive end) — plain text.
  - `page_location`: `start_page_number` / `end_page_number` (1-indexed, exclusive end) — PDF.
  - `content_block_location`: `start_block_index` / `end_block_index` (0-indexed, exclusive end) — custom content.
- `cited_text` is **extracted by the API directly from the source** and is "guaranteed to contain valid pointers to the provided documents"; it does **not** count toward output (or, on replay, input) tokens. Anthropic claims this beats pure prompting on citing the most-relevant quote ([Anthropic Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)).
- Streaming: citations arrive as a `citations_delta` inside `content_block_delta` ([Anthropic Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)).
- This shape (`{startChar, endChar, cited_text, document_index}`) is isomorphic to the repo's existing `@beep/epistemic-domain` `EvidenceSpan {startChar, endChar, quote, confidence}` + `@beep/provenance` TextAnchor (tree-snapshot.md lines 10-11), so beep can adopt the Anthropic representation as its internal grounded-answer model without inventing a new one.

### 3. HARD CONSTRAINT (load-bearing): native citations and structured-output JSON are mutually exclusive

Anthropic returns **HTTP 400** if you enable `citations` on any `document`/`search_result` block **and** also set `output_config.format` (or the deprecated `output_format`). Reason given: "citations require interleaving citation blocks with text output, which is incompatible with the strict JSON schema constraints of structured outputs" ([Anthropic Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations); corroborated in the claude-api skill's tool-use-concepts: "Structured Outputs… Incompatible with: Citations (returns 400 error)"). 

Decision consequence: beep cannot get **both** mike#3's strict JSON citation sidecar **and** native-grounded `cited_text` from a single provider-native call. The contract must pick: (a) interleaved cited text-blocks as the grounded answer, then derive any JSON projection downstream, OR (b) a model-authored JSON sidecar (mike#3 shape) that is **re-verified** server-side (not provider-guaranteed). Recommended: (a) for the grounded answer; reserve strict JSON schema for a separate, non-citation structured pass (e.g. extracting the UnmatchedCitation lifecycle fields). This is a real, dated gotcha that a naive "give me citations AND a JSON schema" design will hit.

### 4. The canonical way to feed *spanned* evidence (the anti-mock-source) = `search_result` blocks

The fix for Juris.AI's mock-source anti-pattern has a first-class vendor primitive: `search_result` content blocks, designed exactly for passing RAG-retrieved passages as citable evidence ([Anthropic search_result docs](https://platform.claude.com/docs/en/build-with-claude/search-results)). Shape:
```json
{ "type": "search_result", "source": "https://… or identifier", "title": "…",
  "content": [{ "type": "text", "text": "…actual retrieved passage…" }],
  "citations": { "enabled": true } }
```
Required: `type`, `source`, `title`, `content[]` (text blocks). Optional: `citations`, `cache_control`. Returnable from a tool call (dynamic RAG) or as top-level user content (pre-fetched). beep's design follows directly: **re-ground on real provenance-spanned evidence (EvidenceSpan-backed `search_result` blocks) before the LLM sees it; never assemble unspanned prose "sources."** An evidence block with no backing char-span is rejected upstream of generation — that is the enforced negative of Juris.AI#2.

### 5. Exact-text reproduction discipline: two tiers, with deterministic quoting as the hard floor

Two complementary disciplines, both needed:
- **Generation-time (soft):** instruct the model to reproduce the answer prose 100% byte-identical and only insert citation tags at semantic boundaries; reject the output if non-citation text diverged (research-squad#1). This makes the model's own copy auditable.
- **Post-generation (hard wall):** the strongest articulation is "Deterministic Quoting" — *the quoted text must never pass through the LLM* ("The only way to guarantee that an LLM has not transformed text: don't send it through the LLM in the first place"). The model emits only a **reference ID** inside `<quote>` tags; a deterministic post-step looks up the reference in the chunk index and **substitutes the true source text**; verbatim quotes are rendered in a visually distinct box marked "deterministically generated," with model commentary kept separate; the model is told to "answer exclusively from provided materials" and "always quote whole sections verbatim, not a subset" ([Deterministic Quoting, Matt Yeung](https://mattyyeung.github.io/deterministic-quoting)). Anthropic's `cited_text` (extracted by the API, not by the model) is the same idea implemented in the platform. 

Decision: beep should treat any model-emitted quote text as **untrusted**, and re-resolve every cited span against the live source slice using the repo's existing langextract `Alignment` normalized→raw offset map (`lowerWithSourceOffsets`, tree-snapshot.md line 9; CAPTURE doc-haus#2). The byte-exact source slice — not the model's copy — is what gets persisted/rendered. This is precisely the doc-haus#4 "output-side re-verification ladder" (exact → re-anchor nearest → reject), and it composes the existing `EvidenceSpan`/`Alignment` substrate rather than rebuilding it.

### 6. Output schema decision

- **Internal canonical model:** Anthropic's interleaved shape — an ordered list of `{text, citations[]}` segments, each citation `{cited_text, document_index, location}` where `location` is the discriminated union `char_location | page_location | content_block_location`. This maps 1:1 onto `EvidenceSpan` and survives the structured-output 400 because it is not a strict-JSON-schema call.
- **JSON sidecar (when needed, e.g. provider without native citations):** mike#3's `[{ref, doc_id, quotes:[{page, quote}]}]`, with `[[PAGE_BREAK]]` as the page-straddle sentinel — but every `quote` is verified post-hoc by §5's hard wall (the JSON is a *claim*, not a guarantee, when it comes from the model).
- **Page/cross-chunk straddle:** native `page_location` handles single-doc page ranges; cross-*chunk* straddle (reconstructing text across retrieval-chunk boundaries) is netNew #4 in CAPTURE and has no home in langextract `Alignment` (which matches one source string) — note it as a separate component, do not assume the schema alone solves it.

### 7. Mandatory disclaimer — keep the constant, ground it in professional-responsibility law

Append a **fixed, non-model-authored** disclaimer constant deterministically (the only salvageable half of Juris.AI#2's `LEGAL_DISCLAIMER`). The imperative is not cosmetic: in *Mata v. Avianca* (S.D.N.Y., June 2023) the court fined plaintiff's counsel **$5,000** under Fed. R. Civ. P. Rule 11 for submitting ChatGPT-fabricated cases with fake quotations and citations; Rule 11's "inquiry reasonable under the circumstances" duty applies **regardless of AI involvement**, and at least 15 further hallucinated-citation sanction cases were documented in the following ~30 months (e.g. *Johnson v. Dunn*, N.D. Ala., Jul 2025) ([Mata v. Avianca, Wikipedia](https://en.wikipedia.org/wiki/Mata_v._Avianca,_Inc.); [ACC — Practical Lessons from Mata v. Avianca](https://www.acc.com/resource-library/practical-lessons-attorney-ai-missteps-mata-v-avianca)). The disclaimer is the user-facing surface of the ground-before-cite + verify-before-cite contract; it must be deterministic so it cannot be omitted or paraphrased by the model.

### 8. LLM-judge citation-quality rubric — adopt ALCE's NLI-based precision/recall, plus a generation-time judge

The canonical, peer-reviewed rubric is **ALCE** (EMNLP 2023), which scores three dimensions — fluency (MAUVE), correctness, and citation quality — and reports strong correlation with human judgement ([ALCE repo](https://github.com/princeton-nlp/ALCE); [arXiv 2305.14627](https://arxiv.org/abs/2305.14627)). Citation quality is NLI-entailment-based ([ar5iv 2305.14627](https://ar5iv.labs.arxiv.org/html/2305.14627)):
- **Citation recall** (per statement `s_i`) = 1 iff there is ≥1 citation (`C_i ≠ ∅`) AND the NLI model entails: `φ(concat(C_i), s_i) = 1` — i.e. the union of cited passages supports the statement.
- **Citation precision** (per citation `c_i,j`) penalizes irrelevant citations: `c_i,j` is irrelevant iff `φ(c_i,j, s_i) = 0` AND `φ(concat(C_i \ {c_i,j}), s_i) = 1` (it alone doesn't support, and removing it changes nothing).
- NLI model: **TRUE** (a T5-11B fine-tuned on NLI datasets). Citation format in prompts: bracketed `[1][2]`.

Layer two judges:
- **Offline eval gate:** ALCE precision/recall (NLI) as a regression metric on a held-out set.
- **Generation-time judge:** research-squad's `EvaluateCitationQuality` (CAPTURE `citations.baml:50+`) — reject outputs where non-citation text diverged from source, or where a citation's cited span does not entail its claim. This is the runtime analog of ALCE's metric and the gate that stops a bad answer from shipping. The broader literature (RAGAS faithfulness = LLM extracts claims → NLI-checks each vs. context → proportion verified; "Cite Before You Speak"'s grounding-before-generation paradigm reports +13.83% grounding) confirms the decompose-into-claims-then-NLI-entail shape as the field-standard rubric ([RAGAS/faithfulness overview](https://arxiv.org/html/2412.05579v2); [Cite Before You Speak, arXiv 2503.04830](https://arxiv.org/abs/2503.04830)).

### 9. The enforced contract — decision summary

A citation may be emitted **iff** all hold (composing the substrate in tree-snapshot.md, not rebuilding it):
1. **In-turn span only.** It references a span supplied **this turn** as an `EvidenceSpan`-backed `search_result`/`document` block — never model memory, metadata, prior search, citationLinks, or verification output (mike#1; structurally enforced by Anthropic Citations). Unspanned/mock evidence is rejected before generation (anti-Juris.AI).
2. **Exact text is source-derived, not model-derived.** The persisted/rendered quote is the byte-exact source slice re-resolved via langextract `Alignment` normalized→raw map; the model's copy is untrusted and replaced or rejected (Deterministic Quoting + research-squad + doc-haus#4 ladder).
3. **Schema = interleaved `{text, citations[]}` blocks** (Anthropic shape ≅ `EvidenceSpan`); strict-JSON citation schema only via a *separate* non-citation pass (because native-citations XOR `output_config.format` — the 400).
4. **Disclaimer is a deterministic constant**, appended outside the model (Juris.AI constant pattern; Mata v. Avianca / Rule 11 rationale).
5. **Quality gate = ALCE NLI precision/recall offline + `EvaluateCitationQuality` judge at generation time**; fail-closed (drop the citation/answer) on non-entailment or text divergence.

### 10. Licensing for any porting

- **AGPL — reimplement from spec, do not copy source:** mike, eyecite, CourtListener (CAPTURE cautions; consistent with CourtListener/eyecite being AGPL projects).
- **Apache-2.0 — pattern (and code) portable:** BAML / research-squad's BAML grammar ([BAML license](https://github.com/BoundaryML/baml)). Note: BAML the framework is Apache-2.0; verify the `research-squad` repo's own license before porting its `.baml` files verbatim — UNVERIFIED here.
- **Unknown:** doc-haus — treat normalized→raw offset + straddle logic as reference only; prefer extending langextract `Alignment` (MIT-clean repo code) per CAPTURE.
- **Slice scope:** keep citation/IP-law vocabulary OUT of the epistemic slice; this packet is a downstream consumer composing `@beep/epistemic-domain` + `@beep/langextract` + `@beep/provenance` via their public surface (CAPTURE; tree-snapshot.md).

## Sources

- Anthropic Citations docs (cited_text, char/page/content_block_location, citations.enabled, structured-output 400, streaming citations_delta): https://platform.claude.com/docs/en/build-with-claude/citations
- Anthropic search_result content blocks (RAG-spanned citable evidence; source/title/content/citations fields): https://platform.claude.com/docs/en/build-with-claude/search-results
- ALCE repo (3-dimension eval: fluency/correctness/citation quality; ASQA/QAMPARI/ELI5): https://github.com/princeton-nlp/ALCE
- ALCE paper (NLI citation precision/recall formulas, TRUE/T5-11B): https://arxiv.org/abs/2305.14627 · https://ar5iv.labs.arxiv.org/html/2305.14627
- Cite Before You Speak (grounding-before-generation, +13.83%): https://arxiv.org/abs/2503.04830
- Deterministic Quoting, Matt Yeung (verbatim text never passes through the LLM; reference-ID substitution; healthcare trust gap): https://mattyyeung.github.io/deterministic-quoting
- LLMs-as-Judges survey (RAGAS faithfulness = claim-extract → NLI; rubric/JSON judge practices): https://arxiv.org/html/2412.05579v2
- Mata v. Avianca, Inc. (Rule 11, $5,000 sanction, fabricated citations): https://en.wikipedia.org/wiki/Mata_v._Avianca,_Inc.
- ACC — Practical Lessons from the Attorney AI Missteps in Mata v. Avianca: https://www.acc.com/resource-library/practical-lessons-attorney-ai-missteps-mata-v-avianca
- BAML (BoundaryML) Apache-2.0 license: https://github.com/BoundaryML/baml · https://github.com/orgs/BoundaryML/repositories
- Repo substrate: explorations/citation-grounding-hallucination-guard/CAPTURE.md; routing/tree-snapshot.md (EvidenceSpan, TextAnchor, langextract Alignment, ClaimGate, slice-scope caution)

## Open / Unverified

- **research-squad repo license** — BAML the framework is Apache-2.0, but the `research-squad` repo's own license (governing its `citations.baml`/`EvaluateCitationQuality` prompt text) is NOT independently verified here; check before porting verbatim. The byte-identical-preservation *pattern* is reusable regardless.
- **mike / doc-haus / Juris.AI source** — not independently re-fetched; patterns taken from CAPTURE gold-nuggets. mike is AGPL (reimplement from spec); doc-haus license unknown.
- **Anthropic `cited_text` exact-match guarantee strength** — docs say citations are "guaranteed to contain valid pointers" and `cited_text` is extracted by the API; whether the extracted slice is always byte-for-byte (whitespace/curly-quote normalization) is not specified in the docs. beep's own hard wall (§5) should not depend on the provider; re-resolve against the live source regardless of provider.
- **ALCE NLI judge cost/latency at generation time** — TRUE is a T5-11B model; using full ALCE as a *runtime* gate (vs. offline eval) may be too heavy. A lighter LLM-judge (research-squad's `EvaluateCitationQuality`) is the runtime path; ALCE-NLI is the offline regression metric. Exact runtime judge model/threshold is a beep design choice, UNVERIFIED.
- **Cross-chunk straddle** (netNew #4) — confirmed to have no home in langextract `Alignment` (single-string match); the output schema (`[[PAGE_BREAK]]`, `page_location` ranges) addresses page straddle but not retrieval-chunk-boundary straddle. Separate component; not solved by the contract schema alone.
