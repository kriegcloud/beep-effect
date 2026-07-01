# Deterministic Doc-Structure Extraction & Streaming Candidate Gate — Sources & Provenance

One-line: the provenance ledger that ties every decision in this packet back to its
mined gold nugget (upstream repo + `file:line`), the upstream repo's license, the
external research citation, and the in-repo `@beep/*` brick it composes. Derived from
the gold-intake cluster **"Anti-inference structured extraction + deterministic
doc-structure"** — this packet owns the **netNew** half (deterministic doc-structure +
streaming gate); the **alreadyCovered** anti-inference prompt-mode half is the sibling
[`goals/langextract-capability`](../../../goals/langextract-capability) Case-A note.

- **Cluster:** `Anti-inference structured extraction + deterministic doc-structure` · route `mixed` · wave `P2` (histogram P1=3 / P2=9 / P3=3) · themeSpan `effect-ts`, `kg-ontology-reasoning`, `legal-nlp`, `provenance-evidence`
- **Scope:** NET-NEW half of a SPLIT cluster — 10 packet-owned nuggets here; 5 sibling-shared (marked `↔ sibling` in §1) live on the langextract Case-A note, listed for reuse context only.
- **Gold-intake provenance:**
  [`explorations/_gold-intake/ROUTING.md`](../../_gold-intake/ROUTING.md) ·
  [`explorations/_gold-intake/routing.json`](../../_gold-intake/routing.json) (cluster `"Anti-inference structured extraction + deterministic doc-structure"`) ·
  [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../_gold-intake/GOLD_SYNTHESIS.md) → `### Legal NLP & extraction` (L894), `#### Deterministic regex contract/structure extraction with char offsets` (L898), `#### Anti-inference "LLM as pure OCR" extraction discipline` (L924)
- **Codex review:** [`reviews/2026-06-29-codex-research.md`](../reviews/2026-06-29-codex-research.md) (research-gate critique, folded into RESEARCH.md)

---

## 1. Mined source corpus (gold nuggets)

15 verified nuggets in the bundle: 10 packet-owned (the netNew build list) + 5
sibling-shared (`↔ sibling`, already a langextract Case-A note — reuse context only,
do NOT re-port here).

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| TalentScore#3 | Partial(candidate) vs Complete(authoritative) streaming gate via tagged ParseEvent | TalentScore | `packages/domain/src/api/resume/resume-rpc.ts:153-193` | provenance-evidence | P2 | port-with-attribution (MIT) — core gate |
| TalentScore#4 | Schema-first partial-vs-final models (`Schema.optionalWith` for streaming) | TalentScore | `packages/domain/src/api/resume/resume-rpc.ts:109-140` | effect-ts | P1 | port-with-attribution (MIT) — adopt schema shape |
| TalentScore#6 | BAML→domain mapper layer with parallel partial-stream mappers | TalentScore | `packages/server/src/public/resume/resume-rpc-live.ts:209-264` | legal-nlp | P2 | study + re-port to Effect v4 Stream (MIT) |
| doc-haus#3 | Deterministic regex contract-structure extraction (defined terms, cross-refs, parties, amendments) w/ char offsets | doc-haus | `services/ingest/src/structure.ts:13-49` | legal-nlp | P1 | design-seed only — repo NOT publicly discoverable; reimplement |
| Juris.AI#3 | Regex legal-entity catalog (statute/case/court/legal-term) + per-type confidence | Juris.AI | `src/app/legal-bert/model.ts:82-100` | legal-nlp | P2 | adopt pattern + extend to `matchAll` spans (MIT) |
| LegalEase#4 | Regex entity-and-relationship extraction into `{nodes,links}` graph | LegalEase | `backend/services/entity_extraction.py:72-110` | kg-ontology-reasoning | P3 | study — port regex families to TS (MIT) |
| doctor#4 | Court caption-line alignment (TX `§`, NY `:`, generic `)`) | doctor | `doctor/lib/text_extraction.py:100-129` | legal-nlp | P3 | reference — port algorithm w/ attribution (BSD-2); separators are empirical |
| doctor#5 | PACER/court document-number extraction from PDF header stamp | doctor | `doctor/tasks.py:673-691` | legal-nlp | P2 | port-with-attribution (BSD-2); needs layout-aware backend |
| harvest-mcp#3 | Layered heuristic-then-LLM classification pipeline | harvest-mcp | `src/agents/ParameterClassificationAgent.ts:417-466` | legal-nlp | P2 | clean-room reimplement — license UNKNOWN |
| mike#5 | Tracked-changes apply with unique-anchor span matching | mike | `backend/src/lib/docxTrackedChanges.ts:930-935` | provenance-evidence | P2 | clean-room reimplement — AGPL-3.0 copyleft |
| TalentScore#1 ↔ sibling | BAML "LLM as pure OCR" extraction schema + anti-inference prompt | TalentScore | `packages/server/baml_src/resume.baml:131-147` | legal-nlp | P1 | sibling note (langextract Case-A) |
| LegalEase#1 ↔ sibling | Risk-scored clause extraction prompt + strict JSON contract | LegalEase | `backend/services/ai_service.py:278-296` | legal-nlp | P2 | sibling note (langextract Case-A) |
| legalmind-ai#1 ↔ sibling | VerdictAnalysis structured-extraction prompt schema | legalmind-ai | `src/services/geminiService.ts:48-108` | legal-nlp | P2 | sibling note — Taiwan jurisdiction, adjacent shape only |
| Legal-AI_Project#2 ↔ sibling | Span-grounded extractive QA w/ n-best + null_score_diff_threshold | Legal-AI_Project | `server/predict.py:108-127` | provenance-evidence | P3 | sibling note — candidate-scoring reference |
| stenoai#1 ↔ sibling | Overlapping map-reduce chunking sized to model context | stenoai | `src/summarizer.py:247-284` | legal-nlp | P2 | sibling note — chunking preprocessor |

### How these inform this packet

**Streaming candidate gate (TalentScore#3 / #4 / #6).** The TalentScore triad is the
spine of the transport gate. **Take:** the discriminated-union shape — a stream of many
`Partial` events and a single terminal `Complete`, where only `Complete` is persisted
(`ParseEvent = Schema.Union(TaggedStruct("Partial",{data}), TaggedStruct("Complete",{analysis}))`),
the parallel strict-`Schema.Class` / `Schema.optionalWith(NullOr,{exact:true})` model
pair, and the adapter that wraps an async generator then calls `getFinalResponse()` to
trigger score+persist+single-`Complete`. **Leave:** the Effect v3 `Stream.async((emit)=>…emit.end())`
mechanics and BAML runtime — repo is pinned to `effect@4.0.0-beta.91` where `Stream.async`
is removed; re-port over `Stream.fromAsyncIterable` / `Stream.callback` (RESEARCH.md §"Streaming-event substrate").
This triad is `gapStatus=dup` in the catalog but is actually **net-new-CONFLICTING** with
the langextract V1 streaming-lock (`goals/langextract-capability/SPEC.md` L88-89) — it
routes HERE, do not reopen the lock (see §2 cautions + DECISIONS.md Q7).

**Deterministic regex doc-structure extractors (doc-haus#3, Juris.AI#3, LegalEase#4).**
The non-LLM LOGIC tier. **Take:** doc-haus#3's contract self-graph regexes (quoted defined
terms, `Section|Article|Exhibit` cross-refs, corporate-suffix parties, amendment recitals)
each emitting verbatim text + char offsets with **NO model in the loop**, plus its two
load-bearing invariants — `export const VERSION = "2"` (versioned re-extraction migration)
and "a miss is an absent row, never a wrong fact". Juris.AI#3's typed `{type,text,confidence}[]`
catalog extends trivially to `matchAll` char-span indices as a cheap pre-LLM candidate
seeder; LegalEase#4's obligation patterns (`shall|must|agrees to`) build a `{nodes,links}`
candidate graph for a non-LLM first pass before OWL/SHACL proof. **Leave:** doc-haus is
**not a discoverable public repo** (design seed, not a dependency) and the Python runtimes;
the hand-tuned confidences are pattern-strength **priors, not calibrated probabilities**
(RESEARCH.md §"Heuristic-first cascade" — the calibration trap).

**Court-PDF normalization (doctor#4, doctor#5).** BSD-2 FLP `doctor` — port the algorithm
with attribution. **Take:** the header-stamp isolation predicate (`LiberationSans` font OR
`y0>750`) + the `Document:|Doc:|DktEntry:` document-number regex for the `filing→docket`
provenance edge, and the caption-line column alignment. **Leave:** pdfplumber is pure-Python
(not portable); the `§`=TX / `:`=NY / `)`=generic separator map is `doctor`'s **empirical
docstring heuristic, not a codified court rule**; `y0>750` assumes 792-pt US-Letter and must
be computed from `page.height`. These need a layout-aware backend that the existing Tika
driver cannot supply — route through the deferred `goals/file-processing-capability` OCR
lane (codex advisory, RESEARCH.md §"Court-PDF coordination").

**Heuristic-first cascade + unique-anchor resolver (harvest-mcp#3, mike#5).** **Take:**
harvest-mcp#3's deterministic-wall-then-LLM-fallback discipline (cheap rules decide first
with confidence; LLM only refines) and mike#5's `find + context_before/after` resolver with
explicit `ambiguous` / `not_found` failure modes — the algorithm that turns a fallible
LLM-proposed `find` back into an exact source char span (the LangExtract port currently
lacks this uniqueness check — codex "confirmed sound"). **Leave the source:** harvest-mcp
license is UNKNOWN and `mike` is **AGPL-3.0** — reimplement clean-room from the contract
shape, vendor neither. The escalation trigger must be **confidence/abstention-based, not
"regex returned nothing"** (RESEARCH.md cites a clinical study where naive regex-then-LLM-on-empty
underperformed regex-only).

**Sibling-shared (↔):** TalentScore#1, LegalEase#1, legalmind-ai#1, Legal-AI_Project#2,
stenoai#1 are the anti-inference prompt-mode / chunking / candidate-scoring nuggets. They
are a pure-extend Case-A research note on [`goals/langextract-capability`](../../../goals/langextract-capability)
and are NOT re-ported here. Listed only so the implementing agent sees the full cluster and
the provenance-wall caution that applies to all of them: they emit free text / "exact clause
text" but **no char offsets** — adoption must add `GroundedExtraction.span` first.

---

## 2. Upstream repositories & licenses

One row per `reposUsed` entry. **Port discipline** is dictated by license: copyleft
(AGPL) and unknown-license repos are **clean-room reimplement** (pattern, never vendored
source); permissive (MIT / BSD / ISC) may be **ported with attribution**.

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| TalentScore | T1 | MIT | port-with-attribution | Partial/Complete streaming gate, strict-vs-partial Schema pair, library→domain adapter (re-port to Effect v4 Stream) |
| doc-haus | T1 | MIT (catalog) | **design-seed only** — repo not publicly discoverable | Contract-structure regex families, `VERSION` re-extraction migration, "miss = absent row" invariant |
| doctor | T1 | BSD-2-Clause | port-with-attribution | Header-stamp filter + document-number regex, caption-line alignment (needs layout backend) |
| mike | T1 | **AGPL-3.0-only** | **clean-room reimplement** (copyleft) | Unique-anchor span-resolver contract + ambiguous/not-found failure modes only |
| Juris.AI | T2 | MIT | port-with-attribution | Typed regex legal-entity catalog + per-type confidence priors (extend to `matchAll` spans) |
| LegalEase | T2 | MIT | port-with-attribution | `{nodes,links}` obligation/party/jurisdiction regex graph builder; (sibling) risk-clause prompt |
| harvest-mcp | T2 | **unknown** | **clean-room reimplement** (no LICENSE file) | Heuristic-then-LLM cascade discipline (pattern is trivial string-membership/regex) |
| Legal-AI_Project | T3 | ISC | port-with-attribution (sibling) | n-best + null_score_diff_threshold candidate-scoring reference |
| legalmind-ai | T3 | MIT | port-with-attribution (sibling) | VerdictAnalysis fixed-record extraction shape — Taiwan jurisdiction, adjacent only |
| stenoai | T3 | MIT | port-with-attribution (sibling) | Overlapping map-reduce chunking algorithm |

> **Cautions (echoed from the bundle + RESEARCH.md "Licensing gravity"):**
> - **AGPL / unknown-license → clean-room, never vendor:** `mike` (AGPL-3.0) and `harvest-mcp`
>   (no LICENSE). `doc-haus` is not a discoverable public repo — its `VERSION`/regex snippets
>   are CAPTURE design seeds, not a dependency. **LexNLP** (the closest functional match, surveyed
>   in RESEARCH.md) is AGPLv3+commercial — reimplement the regex families clean-room.
> - **Poppler is GPL-family copyleft** (codex blocking finding). `pdftotext -bbox-layout` is
>   floated as a higher-fidelity court-PDF backend but is **not permissive** — treat as an optional
>   out-of-process sidecar / system dependency requiring legal review + NOTICE/source-offer handling
>   if distributed. Prefer Apache-2.0 PDFBox / pdf.js where fidelity suffices (RESEARCH.md §"Licensing gravity").
> - **Port the algorithm, not the runtime:** Python (doctor, LegalEase, Legal-AI_Project, stenoai)
>   and BAML (TalentScore) sources — port to Effect/TS + `effect/Schema`; do not vendor Python/BAML.
>   pdfplumber is pure-Python (MIT) and not portable into TS.
> - **Provenance wall:** all adopted LLM-prompt nuggets emit free text / "exact clause text" but
>   NO char offsets — beep's provenance wall requires source spans; add `GroundedExtraction.span` before adoption.
> - **`legalmind-ai#1` is Taiwan jurisdiction** (not US IP) — adjacent reference shape only; do not
>   adopt its field set verbatim for office-action/patent extraction.
> - Deterministic extractors must preserve **"a miss is an absent row, never a wrong fact"** and the
>   **versioned re-extraction migration** (doc-haus `VERSION`) when ported.

---

## 3. External research sources

External landscape citations actually present in this packet's RESEARCH.md and
`research/*.md` (titles + the URLs as written on disk; never invented). Grouped by the
research note that carries them.

**Deterministic legal extractors — prior art** (`research/deterministic-legal-regex-prior-art.md`, RESEARCH.md §External):
- LexNLP (LexPredict / ContraxSuite) — AGPLv3+commercial, defined-terms w/ coords: https://github.com/LexPredict/lexpredict-lexnlp · https://lexpredict-lexnlp.readthedocs.io/en/latest/about.html · https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/definitions.py
- Blackstone (ICLR&D) — Apache-2.0, abandoned, UK jurisdiction: https://github.com/ICLRandD/Blackstone · https://research.iclr.co.uk/blackstone
- eyecite (Free Law Project) — BSD-2, citation spans: https://github.com/freelawproject/eyecite · https://free.law/projects/eyecite/
- eyecite-js TS port (`@beshkenadze/eyecite`) — BSD-2, version-refresh caveat: https://www.npmjs.com/package/@beshkenadze/eyecite · https://github.com/beshkenadze/eyecite-js
- courts-db / reporters-db — BSD-2 JSON catalogs (reuse data directly): https://github.com/freelawproject/courts-db · https://github.com/freelawproject/reporters-db
- OpenContracts (MIT) — "source on every field" industry norm: https://github.com/Open-Source-Legal/OpenContracts

**Court-PDF layout extraction** (`research/court-pdf-layout-extraction.md`, RESEARCH.md §Court-PDF):
- FLP `doctor` LICENSE (BSD-2): https://github.com/freelawproject/doctor/blob/main/LICENSE
- LiberationSans header-stamp confirmation: https://github.com/freelawproject/courtlistener/issues/6634
- pdfplumber (coordinate model): https://github.com/jsvine/pdfplumber
- pdf.js fontName-transition loss (TS-port reality): https://github.com/mozilla/pdf.js/issues/7297 · https://github.com/mozilla/pdf.js/issues/12031
- CM/ECF document-stamp / NEF provenance: https://pacer.uscourts.gov/help/faqs/files-pleading-court-automatically-serve-notification · https://www.alsd.uscourts.gov/news/pageid-feature-cmecf-updated

**Span / offset model** (`research/char-offset-provenance-span-model.md`, RESEARCH.md §Span/offset):
- Anthropic Citations API (`char_location`, half-open offsets): https://platform.claude.com/docs/en/build-with-claude/citations
- Anthropic text-editor `str_replace` (unique-anchor / ambiguous-fail contract): https://platform.claude.com/docs/en/agents-and-tools/tool-use/text-editor-tool
- Google LangExtract alignment ladder: https://github.com/google/langextract/blob/main/langextract/resolver.py · https://deepwiki.com/google/langextract
- `matchAll` / `d`-flag `hasIndices`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll · https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/hasIndices · https://github.com/tc39/proposal-regexp-match-indices
- UTF-16 vs Unicode-code-point offset gotcha: https://docs.python.org/3/howto/unicode.html

**Heuristic-first cascade + calibration** (`research/heuristic-first-candidate-gate.md`, RESEARCH.md §Heuristic-first):
- Meta privacy-aware infra asset-classification case study (~85% deterministic / ~15% LLM): https://engineering.fb.com/2026/06/25/security/privacy-aware-infrastructure-in-the-ai-native-era-an-asset-classification-case-study/
- LLM-cascade economics: https://tianpan.co/blog/2025-11-03-llm-routing-model-cascades · https://mbrenndoerfer.com/writing/model-routing-selection-ab-testing-cascades-strategies
- Box Extract confidence bands: https://blog.box.com/confidence-scores-box-extract-api-know-when-rely-your-extractions
- Calibration (Platt / isotonic / temperature): https://www.kdnuggets.com/a-deep-dive-into-calibration-of-language-models-platt-scaling-isotonic-regression-temperature-scaling · https://arxiv.org/html/2411.02988v2
- Selective prediction / abstention: https://aclanthology.org/2402.15610v2 · https://arxiv.org/html/2505.15008v2 · https://www.medrxiv.org/content/10.64898/2026.01.21.26344531.full.pdf
- Rule-driven `{nodes,links}` KG construction: https://neo4j.com/blog/developer/entity-linking-relationship-extraction-relik-llamaindex/ · https://arxiv.org/pdf/2505.00039

**Streaming gate vs langextract lock** (`research/streaming-gate-vs-langextract-lock.md`, RESEARCH.md §Streaming gate):
- Google LangExtract (chunk-batching ≠ partial reveal): https://github.com/google/langextract · https://developers.googleblog.com/introducing-langextract-a-gemini-powered-information-extraction-library/
- Effect v4 beta release notes + Stream API change: https://effect.website/blog/releases/effect/40-beta/ · https://github.com/Effect-TS/effect-smol/issues/1378 · https://effect.website/docs/stream/creating/
- BAML semantic streaming (Partial/Final dichotomy): https://docs.boundaryml.com/guide/baml-basics/streaming · https://boundaryml.com/blog/semantic-streaming
- Effect RPC streaming precedent: https://dev.to/titouancreach/part-2-how-i-replaced-trpc-with-effect-rpc-in-a-nextjs-app-router-application-streaming-responses-566c

---

## 4. In-repo capability references

The `@beep/*` bricks this packet composes (from `secondaryTargets` + RESEARCH.md
§"In-Repo Capability Inventory", verified `ls`/`rg` 2026-06-29). All paths repo-relative.

| Capability | Package path | Posture |
| --- | --- | --- |
| `@beep/provenance` `TextAnchor` (`{startChar,endChar,quote}`, half-open, `slice===quote`) | `packages/foundation/modeling/provenance` | **REUSE** — canonical offset shape; target for all char-offset rows |
| `@beep/epistemic-domain` `EvidenceSpan` / `Confidence` / `ClaimLifecycle` / `ClaimGateResult` / `CandidateClaim` / `ClaimLifecycleTransition` | `packages/epistemic/domain` | **REUSE** — candidate→admitted lifecycle + SHACL gate the seeder feeds; no new vocabulary |
| `@beep/schema` `UnitInterval` (branded canonical `[0,1]`) | `packages/foundation/modeling/schema` | **REUSE + shared-kernel cleanup** — canonical confidence; nlp/langextract use an unbranded copy (codex finding) |
| `@beep/langextract` `Alignment.alignCandidate` / `GroundedExtraction` / `Handoff` | `packages/foundation/capability/langextract` | **EXTEND** — alignment ladder lacks uniqueness / ambiguous / not_found (net-new resolver) |
| `@beep/nlp` `Core/Pattern` + `Handoff/Contract.Span` | `packages/foundation/capability/nlp` | **REUSE conventions, NOT the API** — wink token-bracket infra ≠ raw char-offset regex; build sibling helper |
| `@beep/agents-use-cases` RPC streaming (`Rpc.make(..., {success: AssistantBlock, stream:true})`) | `packages/agents/use-cases` | **REUSE the pattern** — schema-backed domain events over RPC (the reconciliation precedent) |
| `@beep/file-processing` `Extraction.TextSpan` + `tika` driver | `packages/foundation/capability/file-processing`, `packages/drivers/tika` | **EXTEND a DEFERRED lane** — Tika can't supply char-level font/position; adapt `TextSpan`→`TextAnchor` |
| `@beep/nlp-mcp` deterministic pre-tagger seam | `packages/drivers/nlp-mcp` | **coordinate** — deterministic-first then LLM-refine extraction tools |
| Deterministic regex span extractor (`spanFromMatch(regex, source)`, `d`-flag) | (none — `@beep/nlp`-adjacent sibling) | **NET-NEW** — no `matchAll`/`hasIndices` char-offset extractor exists in-repo |
| Unique-anchor span resolver (`find` + context, ambiguous/not_found) | (none — extends `@beep/langextract`) | **NET-NEW** — mike#5 / Anthropic `str_replace` contract, clean-room |
| Partial/Complete streaming gate + versioned re-extraction migration (`VERSION`) | (placement TBD: epistemic vs new streaming module) | **NET-NEW** — physical home is an align/shape question |

---

## 5. Cross-links & provenance

- **Sibling note (anti-inference half of the split cluster):** [`goals/langextract-capability`](../../../goals/langextract-capability) — receives the Case-A research note for TalentScore#1, LegalEase#1, legalmind-ai#1, Legal-AI_Project#2, stenoai#1 (`crossref.sibling-note`). Its SPEC L88-89 LOCKS streaming as deferred — the gate routes here, not there.
- **Cluster id:** `Anti-inference structured extraction + deterministic doc-structure` (routing.json) · primaryTarget `goals/langextract-capability`.
- **Secondary-target coordination:** `goals/file-processing-capability` (court-PDF / header-stamp lane), `explorations/court-vocabulary-resolver` + `goals/official-data-sync-foundation` (courts-db / reporters-db vocab), `explorations/rag-retrieval-projection`, `goals/trustgraph-port`.
- **This packet's own trail:** [`CAPTURE.md`](../CAPTURE.md) (stage 0 nugget dump) · [`RESEARCH.md`](../RESEARCH.md) (External Landscape + In-Repo Inventory + Constraints) · [`DECISIONS.md`](../DECISIONS.md) (Q1–Q8 align forks, streaming-lock DEFERRED) · [`reviews/2026-06-29-codex-research.md`](../reviews/2026-06-29-codex-research.md) (research-gate critique).
- **Supporting research notes:** [`research/deterministic-legal-regex-prior-art.md`](./deterministic-legal-regex-prior-art.md) · [`research/court-pdf-layout-extraction.md`](./court-pdf-layout-extraction.md) · [`research/char-offset-provenance-span-model.md`](./char-offset-provenance-span-model.md) · [`research/heuristic-first-candidate-gate.md`](./heuristic-first-candidate-gate.md) · [`research/streaming-gate-vs-langextract-lock.md`](./streaming-gate-vs-langextract-lock.md).
- **Gold synthesis:** [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../_gold-intake/GOLD_SYNTHESIS.md) → `### Legal NLP & extraction` (L894).
