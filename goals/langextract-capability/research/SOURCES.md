# LangExtract Capability - Sources & Provenance

Provenance ledger for the gold-intake research note folded into this goal. It
traces the **anti-inference prompt-mode / chunking / candidate-scoring** half of
the mixed cluster *"Anti-inference structured extraction + deterministic
doc-structure"* back to its mined nuggets, upstream repos+licenses, external
citations, and the in-repo bricks `@beep/langextract` composes.

- **Cluster:** Anti-inference structured extraction + deterministic doc-structure (`route = mixed`, `primaryTarget = goals/langextract-capability`, wave P2)
- **This packet owns:** the cluster's `alreadyCovered` half (pure-extend prompt-mode + JSON-contract candidate prompts + n-best/null-score scoring + context-budget chunking). The `netNew` half (streaming gate + deterministic regex extractors) is routed to the **sibling exploration** `explorations/deterministic-doc-structure-extraction` and is marked *sibling-shared* below.
- **Gold-intake provenance:** [`explorations/_gold-intake/ROUTING.md`](../../../explorations/_gold-intake/ROUTING.md), [`explorations/_gold-intake/routing.json`](../../../explorations/_gold-intake/routing.json), [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
- **Folded note (scope owner):** [`research/gold-intake-anti-inference-prompt-mode.md`](./gold-intake-anti-inference-prompt-mode.md)
- **Packet proposal + review:** [`research/synthesis.md`](./synthesis.md), [`research/reports/proposal-review-round-1.md`](./reports/proposal-review-round-1.md) (zero required findings)

## 1. Mined source corpus (gold nuggets)

The bundle binds 15 cluster nuggets. The 5 in **this packet's scope** (the note's
`alreadyCovered` set) drive the langextract extend; the remaining 10 are
**sibling-shared** — they are the cluster's `netNew` ids routed to
`explorations/deterministic-doc-structure-extraction` and are listed here only so
the implementing agent can see the full cluster and avoid pulling them into the
langextract streaming lock.

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| TalentScore#1 | BAML "LLM as pure OCR" extraction schema + anti-inference prompt | TalentScore | `packages/server/baml_src/resume.baml:131-147` | legal-nlp | P1 | **port** (prompt pattern → `Extraction` prompt/output contract) — in-scope |
| LegalEase#1 | Risk-scored clause extraction prompt + strict JSON contract | LegalEase | `backend/services/ai_service.py:278-296` | legal-nlp | P2 | **port** (reference shape for `Extraction` targets; must add spans) — in-scope |
| legalmind-ai#1 | VerdictAnalysis structured-extraction prompt schema | legalmind-ai | `src/services/geminiService.ts:48-108` | legal-nlp | P2 | **reference** (adjacent; Taiwan jurisdiction — shape only, not field set) — in-scope |
| Legal-AI_Project#2 | Span-grounded extractive QA, n-best + null-score offsets | Legal-AI_Project | `server/predict.py:108-127` | provenance-evidence | P3 | **reference** (candidate-scoring for `Alignment` scores/diagnostics) — in-scope |
| stenoai#1 | Overlapping map-reduce chunking sized to model context | stenoai | `src/summarizer.py:247-284` | legal-nlp | P2 | **port** (to `Alignment` chunk step; add char offsets) — in-scope |
| TalentScore#4 | Schema-first partial-vs-final models (`Schema.optionalWith`) | TalentScore | `packages/domain/src/api/resume/resume-rpc.ts:109-140` | effect-ts | P1 | **port** → *sibling-shared* (streaming partial schema) |
| TalentScore#3 | Partial vs Complete streaming gate via tagged `ParseEvent` | TalentScore | `packages/domain/src/api/resume/resume-rpc.ts:153-193` | provenance-evidence | P2 | **study** → *sibling-shared* (CONFLICTS langextract V1 streaming-lock) |
| TalentScore#6 | BAML→domain mapper with separate partial-stream mappers | TalentScore | `packages/server/src/public/resume/resume-rpc-live.ts:209-264` | legal-nlp | P2 | **study** → *sibling-shared* (adapter+gate skeleton) |
| doc-haus#3 | Deterministic regex contract-structure extraction w/ char offsets | doc-haus | `services/ingest/src/structure.ts:13-49` | legal-nlp | P1 | **port** → *sibling-shared* (deterministic LOGIC side) |
| Juris.AI#3 | Regex legal-entity catalog (statute/case/court/legal-term) | Juris.AI | `src/app/legal-bert/model.ts:82-100` | legal-nlp | P2 | **port** → *sibling-shared* (deterministic candidate seeder) |
| LegalEase#4 | Regex entity-and-relationship extraction into node/link graph | LegalEase | `backend/services/entity_extraction.py:72-110` | kg-ontology-reasoning | P3 | **study** → *sibling-shared* (candidate graph) |
| harvest-mcp#3 | Layered heuristic-then-LLM classification pipeline | harvest-mcp | `src/agents/ParameterClassificationAgent.ts:417-466` | legal-nlp | P2 | **reference** → *sibling-shared* (unknown license — study only) |
| mike#5 | Tracked-changes apply with unique-anchor span matching | mike | `backend/src/lib/docxTrackedChanges.ts:930-935` | provenance-evidence | P2 | **clean-room** → *sibling-shared* (AGPL — reimplement only) |
| doctor#5 | PACER/court document-number extraction from PDF header stamp | doctor | `doctor/tasks.py:673-691` | legal-nlp | P2 | **port** → *sibling-shared* (also coordinates `goals/file-processing-capability`) |
| doctor#4 | Court caption-line alignment (TX §, NY :, generic )) | doctor | `doctor/lib/text_extraction.py:100-129` | legal-nlp | P3 | **reference** → *sibling-shared* (law-practice caption parsing) |

### How these inform this packet

**Anti-inference prompt-mode (in-scope, the core take).** `TalentScore#1` is the
load-bearing pattern: a fallible model is told to extract candidates verbatim and
never fabricate. **Take** the prompt clause + the field-by-field typed output
schema idea; **leave** the BAML runtime. The contract to fold into the
`Extraction` prompt/output module:

```
Extract information EXACTLY as written.
DO NOT infer, reason, or add information not explicitly present.
If a field is not found, leave it empty or null.
```

**JSON-contract candidate shapes (in-scope).** `LegalEase#1` (risk-scored clause:
`clause`/`riskLevel`/`riskReason`/`liability_score`, "respond ONLY with valid
JSON") and `legalmind-ai#1` (fixed verdict record + required-field validation
loop) are **reference shapes** for authoring `Extraction` targets/examples as
`effect/Schema` with a decode-or-fail step replacing the manual loops. **Take**
the structure + output contract; **leave** the field sets verbatim — both emit
free text with **no char offsets**, so adoption must stay downstream of
`Alignment` (the span-supplying step). `legalmind-ai#1` is Taiwan-jurisdiction,
adjacent reference only.

**Candidate scoring (in-scope).** `Legal-AI_Project#2` — n-best ranking +
`version_2_with_negative` / `null_score_diff_threshold` — is the **reference** for
`Alignment` scores/diagnostics and an explicit null/abstain path before the
epistemic candidate→approved gate. Note its `start_position_character` is unused
in the prediction path; the offset realization is via n-best/logit output.

**Chunking (in-scope, port).** `stenoai#1` — `budget = num_ctx - overhead`, overlap
prefix, prefer clean newline breaks — is a clean **port** target for the
`Alignment` "chunk text with source offsets" step. It tracks **no offsets**; add
`charStart`/`charEnd` on port or it breaks the span invariant.

**Sibling-shared (out of scope here).** The streaming gate (`TalentScore#3/#4/#6`)
and the deterministic regex extractors (`doc-haus#3`, `Juris.AI#3`, `LegalEase#4`,
`harvest-mcp#3`, `mike#5`, `doctor#4/#5`) are the cluster's `netNew` and belong to
`explorations/deterministic-doc-structure-extraction`. **Do not** pull the
Partial/Complete streaming gate into `langextract-capability` — it conflicts with
the V1 streaming-lock (SPEC.md L88-89). If streaming is ever pulled in, it must be
schema-backed LangExtract domain events, never raw AI chunks.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| TalentScore | T1 | MIT | port-with-attribution | Anti-inference prompt clause; partial/final schema + streaming gate (sibling) |
| LegalEase | T2 | MIT | port-with-attribution | Risk-scored clause JSON contract; node/link graph extractor (sibling) |
| legalmind-ai | T3 | MIT | port-with-attribution | Fixed-record extraction shape (adjacent ref only) |
| Legal-AI_Project | T3 | ISC | port-with-attribution | n-best + null-score candidate-scoring reference |
| stenoai | T3 | MIT | port-with-attribution | Context-budget overlapping chunker (add offsets) |
| Juris.AI | T2 | MIT | port-with-attribution | Regex legal-entity catalog (sibling) |
| doc-haus | T1 | MIT | port-with-attribution | Deterministic char-offset contract-structure extractor (sibling) |
| doctor | T1 | BSD-2-Clause | port-with-attribution | PDF header-stamp + caption alignment (sibling) |
| mike | T1 | AGPL-3.0-only | **clean-room reimplement only** | Unique-anchor span-resolution algorithm (sibling) — pattern, never code |
| harvest-mcp | T2 | **unknown (no LICENSE)** | **do-not-port / study only** | Heuristic-then-LLM layering pattern (sibling) — observe, do not copy |

> **Caution callout (from bundle.cautions):**
> - **Streaming lock:** `TalentScore#3/#4/#6` are net-new-conflicting, not dup — route to the sibling, do **not** reopen the langextract streaming lock. Any future streaming must surface as schema-backed LangExtract domain events.
> - **Provenance wall:** all adopted prompt nuggets emit free text / "exact clause text" but **no char offsets**. beep's provenance wall requires source spans — the extend must add `GroundedExtraction.span` (via `Alignment`) before adoption.
> - **Port, do not vendor:** sources are Python (`doctor`, `stenoai`, `Legal-AI_Project`, `LegalEase`) and BAML (`TalentScore`). Reimplement in Effect/TS + `effect/Schema`; never vendor Python or BAML runtimes.
> - **`legalmind-ai#1` is Taiwan jurisdiction** (not US IP) — adjacent shape only; do not adopt its field set verbatim.
> - **Deterministic extractors (sibling)** must preserve "a miss is an absent row, never a wrong fact" and the versioned re-extraction migration (doc-haus `VERSION` const).
> - **AGPL (`mike`) is clean-room only.** Unknown-license (`harvest-mcp`) is study-only until a license is confirmed.

## 3. External research sources

The only external citations with URLs on disk in this packet are in the folded
note's "External citations" section:

- **BAML (BoundaryML)** — Apache-2.0 schema-first prompting DSL with schema-aligned parsing (SAP) for reliable structured outputs: <https://github.com/BoundaryML/baml> and <https://boundaryml.com/blog/schema-aligned-parsing>
- **SQuAD-v2 extractive-QA n-best / no-answer mechanics** (`version_2_with_negative`, n-best size, null/min-null score thresholding) via the CUAD-style RoBERTa path: <https://huggingface.co/deepset/roberta-base-squad2>

Supporting in-repo synthesis claims (no external URL) live in
[`GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md):
Executive summary item 5; "Anti-inference 'LLM as pure OCR' extraction
discipline" and "Structured legal-record / risk-scored clause extraction prompts"
and "Overlapping map-reduce chunking" (Legal NLP & extraction section);
"Span-grounded extractive QA with n-best + null-score gate" (Provenance &
evidence section).

## 4. In-repo capability references

The bricks this packet composes (from `bundle.secondaryTargets` + the note's
in-repo inventory):

- `packages/foundation/capability/langextract` (**@beep/langextract**) — **extend** (Case-A home): anti-inference prompt clause folds into the `Extraction` prompt/output contract; chunker + n-best scoring fold into `Alignment`.
- `packages/foundation/capability/nlp` (**@beep/nlp**) — **reuse / extend**: deterministic regex/pattern infra (Core/PatternParsers) to coordinate with so the sibling's extractors reuse pattern infra; chunking Tools.
- `packages/foundation/modeling/provenance` (**@beep/provenance**) — **reuse**: `TextAnchor`/`EvidenceSpan` target for resolved LLM spans (and the sibling's char-offset rows).
- `packages/epistemic/domain` (**@beep/epistemic-domain**) — **reuse / extend**: `CandidateClaim` / Claim→Evidence candidate→approved lifecycle the scored candidates feed.
- `packages/law-practice/domain` (**@beep/law-practice**) — **reuse** (sibling-leaning): clause/party models, docket/caption parsing.
- `packages/drivers/nlp-mcp` (**@beep/nlp-mcp**) — **reuse** (sibling-leaning): deterministic-first-then-LLM extraction tools.
- `packages/agents` (**@beep/agents**) — **reuse** (sibling-leaning): streaming turn kernel the streaming gate mirrors.
- `goals/file-processing-capability` — coordinates the PDF header-stamp extraction (`doctor#5`, sibling).

## 5. Cross-links & provenance

- **Sibling exploration (net-new half):** [`explorations/deterministic-doc-structure-extraction`](../../../explorations/deterministic-doc-structure-extraction) — owns `TalentScore#3/#4/#6`, `doc-haus#3`, `Juris.AI#3`, `LegalEase#4`, `harvest-mcp#3`, `mike#5`, `doctor#4/#5`.
- **Cluster id:** "Anti-inference structured extraction + deterministic doc-structure" in [`routing.json`](../../../explorations/_gold-intake/routing.json) / [`ROUTING.md`](../../../explorations/_gold-intake/ROUTING.md).
- **This packet's own research:** [`research/gold-intake-anti-inference-prompt-mode.md`](./gold-intake-anti-inference-prompt-mode.md) (folded note), [`research/synthesis.md`](./synthesis.md) (accepted proposal), [`SPEC.md`](../SPEC.md) (normative contract — read-only here).
- **Codex/proposal review:** [`research/reports/proposal-review-round-1.md`](./reports/proposal-review-round-1.md) (zero required findings); supporting audits under [`research/reports/`](./reports/).
- **Gold synthesis:** [`GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md) — Legal NLP & extraction + Provenance & evidence sections.
