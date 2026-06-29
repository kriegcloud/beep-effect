# Gold-intake research note: anti-inference "pure-OCR" prompt-mode discipline (2026-06-29)

> Non-invasive Case-A pure-extend note for the `langextract-capability` goal owner.
> It does NOT modify `SPEC.md`, `PLAN.md`, `GOAL.md`, phases, or scope. It records
> reusable prompt-mode + candidate-scoring + chunking patterns that the existing
> P4 Implement surfaces can fold in later, at the owner's discretion.

## Source

- Gold nuggets (this note is limited to the cluster's `alreadyCoveredIds` — the
  pure-extend prompt-mode set only):
  - `TalentScore#1` (repo `TalentScore`, BAML) — "LLM as pure OCR" extraction
    schema + anti-inference prompt. Priority P1, recommendation adopt.
  - `LegalEase#1` (repo `LegalEase`, Python) — risk-scored clause extraction
    prompt + strict "respond ONLY with valid JSON" contract. Priority P2, adopt.
  - `legalmind-ai#1` (repo `legalmind-ai`, TS) — VerdictAnalysis fixed-record
    structured-extraction prompt + required-field validation loop. Priority P2,
    adopt (adjacent reference only — Taiwan jurisdiction, not US IP).
  - `Legal-AI_Project#2` (repo `Legal-AI_Project`, Python) — span-grounded
    extractive QA with n-best ranking + null-score-diff "no answer" handling.
    Priority P3, study.
  - `stenoai#1` (repo `stenoai`, Python) — overlapping map-reduce chunking sized
    to the model context budget. Priority P2, port.
- `explorations/_gold-intake/GOLD_SYNTHESIS.md`:
  - Executive summary, item 5 ("Deterministic ... extraction with char offsets ...
    anti-inference extraction discipline from `TalentScore`").
  - "Anti-inference 'LLM as pure OCR' extraction discipline" (Legal NLP &
    extraction section).
  - "Structured legal-record / risk-scored clause extraction prompts" (same
    section) — covers `LegalEase#1` + `legalmind-ai#1`.
  - "Span-grounded extractive QA with n-best + null-score gate" (Provenance &
    evidence section) — covers `Legal-AI_Project#2`.
  - "Overlapping map-reduce chunking sized to model context" (Legal NLP &
    extraction section) — covers `stenoai#1`.
- Routing cluster: `explorations/_gold-intake/routing.json` cluster
  **"Anti-inference structured extraction + deterministic doc-structure"**,
  `primaryTarget = goals/langextract-capability`, `route = mixed`. This note
  consumes ONLY that cluster's `alreadyCoveredIds`. The cluster's `netNewIds`
  (streaming gate + deterministic regex extractors) are explicitly routed to a
  SEPARATE proposed sibling exploration `deterministic-doc-structure-extraction`
  and are intentionally out of scope here.

## What `goals/langextract-capability` already covers

This is an extend, not a rebuild. `@beep/langextract` already owns the substrate
these patterns slot into:

- The structured-extraction substrate itself: extraction targets, examples,
  requests, options, results, diagnostics, and **prompt/output contracts for
  LangExtract-style extraction** (`research/synthesis.md`, "Domain Direction" /
  package-owns list; `SPEC.md` L77-86 "Accepted Proposal Contract").
- Public export subpaths already planned: `@beep/langextract/Target`,
  `/Extraction`, `/Alignment`, `/Service` (`research/synthesis.md` candidate
  subpaths).
- Deterministic, source-string alignment that **chunks text with source offsets,
  prompts the injected model, then aligns candidates against source text** with
  scores and traces (`research/synthesis.md` "Alignment Direction", steps 1-8).
- Every extraction grounded to exact half-open source character spans;
  V1 public source offsets are JavaScript string indices (`SPEC.md` L5-8, L87).
- Closed tagged errors for parse, schema, model, alignment, and handoff failures;
  model output is treated as untrusted and validated before spans are mapped
  (`research/synthesis.md` "Error Direction" / "Service Direction").

So the anti-inference prompt clause, the JSON-contract record shapes, n-best/
null-score candidate scoring, and context-budget chunking are all refinements of
surfaces that already exist in the accepted proposal — primarily the
prompt/output-contract part of `Extraction` and the scoring/chunking part of
`Alignment`.

## Net-new this contributes

- **Anti-inference "pure-OCR" prompt clause + field-by-field typed extraction
  schema** (`TalentScore#1`). A canonical retrieval-side discipline: instruct the
  model to "extract information EXACTLY as written. DO NOT infer, reason, or add
  information not explicitly present. If a field is not found, leave it empty or
  null," paired with a nested typed output schema (the BAML example breaks
  Resume into Experience/Education/Skill/Certification classes). The exact analog
  for office-action / claim-element extraction: a fallible model proposes typed
  candidates and is told never to fabricate. The source is BAML (BoundaryML),
  which is Apache-2.0 licensed and whose value here is the *prompt pattern + the
  schema-aligned-parsing idea*, not its runtime. [external: BAML / schema-aligned
  parsing, Apache-2.0 — see Cautions citations]
- **Strict JSON-contract candidate-extraction prompt shapes** (`LegalEase#1`,
  `legalmind-ai#1`). Two reference shapes that force a fixed JSON record: a
  risk-scored clause extractor (`clause` + `riskLevel` + `riskReason` +
  `liability_score 1-100`, "You MUST respond ONLY with a valid JSON array") and a
  verdict-analysis record (`caseNumber`, `parties{plaintiff,defendant}`,
  `keyFacts[]`, `legalIssues[]`, `strengths[]`, `weaknesses[]`,
  `suggestedStrategy`) guarded by a required-field validation loop. Reference
  shapes for expressing `Extraction` targets/examples as `effect/Schema`, with
  the explicit "respond only with valid JSON" output contract and a
  decode-or-fail validation step.
- **n-best ranking + null-score-diff "no answer" handling for candidate scoring**
  (`Legal-AI_Project#2`). A SQuAD-v2-style extractive QA path (CUAD RoBERTa)
  returns n-best candidate answers grounded into the source text, with
  `version_2_with_negative=True` and a `null_score_diff_threshold` so the model
  can return "no answer found" rather than forcing a span. A clean reference for
  scoring fallible candidates before the candidate->approved gate, and for an
  explicit null/abstain path in `Alignment` scoring + diagnostics. [external:
  HuggingFace transformers SQuAD-v2 n-best / null-score params — see Cautions]
- **Context-budget overlapping map-reduce chunking** (`stenoai#1`). `chunk
  budget = num_ctx - prompt/output overhead`; each chunk carries a configurable
  overlap prefix and prefers clean newline breaks (scans backward over the last
  ~20% to avoid tiny leading chunks). A reusable preprocessing recipe for
  map-reduce over long office actions / patents that feeds chunks into the
  existing `Alignment` "chunk text with source offsets" step — note it must be
  ported with char-offset preservation, which the source lacks (see Cautions).

## Recommended integration (non-invasive)

These all attach to existing P4 Implement surfaces; none requires a SPEC/PLAN
rewrite or a scope change. Suggested folding points for the owner:

- Fold the anti-inference clause (`TalentScore#1`) into the **`Extraction`
  prompt/output-contract module** as a reusable prompt-section template
  ("extract exactly as written; never infer; absent field -> empty/null"). It is
  a prompt template over the already-planned prompt/output contract, not a new
  model.
- Treat the JSON-contract record shapes (`LegalEase#1`, `legalmind-ai#1`) as
  **reference shapes when authoring `Extraction` targets/examples as
  `effect/Schema`** plus a decode-or-fail validation step that replaces the
  source's manual required-field loop. Adopt the *structure and output contract*,
  not the field sets verbatim.
- Treat n-best + null-score (`Legal-AI_Project#2`) as an optional
  **candidate-scoring reference for `Alignment` scores/diagnostics** and the
  abstain path, and a downstream input to the epistemic candidate->approved gate.
  No new public surface required to record it.
- Treat the overlapping chunker (`stenoai#1`) as a **port target for the
  `Alignment` "chunk text with source offsets" step**, adding char-offset
  tracking so chunk boundaries stay span-grounded.

In short: the owner can stage these as inputs to the P4 implementation of the
`Extraction` prompt/output contract and the `Alignment` chunk/score modules,
when those modules are built, without amending the packet contract.

## Cautions

- **Streaming lock is untouched (do NOT reopen).** `SPEC.md` L88-89 defers
  streaming ("raw AI stream chunks are not public API"). The cluster's Partial/
  Complete streaming gate (`TalentScore#3/#4/#6`) and the deterministic regex
  extractors are the cluster's `netNewIds` and are routed to the SEPARATE sibling
  exploration `deterministic-doc-structure-extraction`. They are intentionally
  excluded from this note; do not pull them into `langextract-capability`.
- **Provenance wall: prompt nuggets emit no char offsets.** `LegalEase#1` and
  `legalmind-ai#1` (and the BAML schema in `TalentScore#1`) echo "exact text" but
  emit free text with NO source offsets. beep's provenance wall and this goal's
  span guarantee (`SPEC.md` L5-8: every extraction grounded to half-open source
  spans) require that any adopted prompt+schema additionally yield / be aligned
  to a `GroundedExtraction.span` before adoption. The existing `Alignment` step
  is the mechanism that supplies the missing spans — keep adoption downstream of
  it, not in place of it.
- **Port, do not vendor.** Sources are BAML (`TalentScore`) and Python
  (`LegalEase`, `Legal-AI_Project`, `stenoai`); `legalmind-ai` is TS but Taiwan
  jurisdiction. Reimplement the prompt pattern / chunking algorithm in Effect +
  `effect/Schema`; do not vendor the BAML compiler/runtime or a Python QA model
  server. BAML itself is Apache-2.0 (permissive), so the *pattern* is freely
  reusable, but the foundation package stays provider-neutral and BAML-free.
- **`legalmind-ai#1` is adjacent reference only** (Taiwan jurisdiction, not US
  IP). Do not adopt its `VerdictAnalysis` field set verbatim for US office-action
  / patent extraction; use it only as a fixed-record shape exemplar.
- **Chunker lacks offsets.** `stenoai#1`'s splitter tracks no char offsets; the
  `Alignment` surface requires offset-preserving chunking. Add `charStart`/
  `charEnd` (or equivalent) when porting, or it will not satisfy the span
  invariant.
- **Keep it schema-first.** Per repo law and `SPEC.md` L60-63 ("structured data
  models must be schema-first"), express adopted prompt/record shapes as
  `effect/Schema`, not free-text prompt strings alone.

### External citations

- BAML (BoundaryML) is an Apache-2.0, schema-first prompting DSL with a
  schema-aligned-parsing (SAP) algorithm for reliable structured outputs even
  without native tool-calling:
  https://github.com/BoundaryML/baml and
  https://boundaryml.com/blog/schema-aligned-parsing
- SQuAD-v2 extractive-QA n-best / no-answer mechanics (`version_2_with_negative`,
  n-best size, null/min-null score thresholding) as used by the CUAD-style
  RoBERTa path: https://huggingface.co/deepset/roberta-base-squad2
