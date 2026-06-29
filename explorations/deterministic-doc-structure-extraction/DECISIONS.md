# Deterministic Doc-Structure Extraction & Streaming Candidate Gate — Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.

PRE-DRAFT SEED (research-complete, 2026-06-29): the "Pre-drafted align
questions" section below poses each load-bearing fork with a RECOMMENDED
answer and grounded rationale, but leaves every one `open`. The user resolves
them via `/grill-with-docs deterministic-doc-structure-extraction`, which
rewrites each Status and records the chosen branch. Do NOT treat these
recommendations as settled. Grounding: RESEARCH.md (synthesized 2026-06-29,
codex gate-1 folded) + CAPTURE.md.
-->

## 2026-06-29 — streaming-gate vs langextract V1 streaming-lock (DEFERRED)

**Question:** Where does the `Partial`(candidate)/`Complete`(authoritative)
streaming gate (TalentScore#3/#4/#6) live, given `goals/langextract-capability`
SPEC L88-89 LOCKS streaming as deferred ("raw AI stream chunks are not public
API")?

**Answer:** DEFERRED to the research/align stages. Seed position (from
gold-intake routing): the gate is **net-new-CONFLICTING**, not a langextract
dup — it routes to THIS sibling exploration and must NOT reopen the langextract
V1 streaming lock. The catalog's `gapStatus=dup` tag is wrong for this nugget.

**Rationale:** The conflict is a standards decision, surfaced here per the
gold-intake SPECIAL NOTE so it is not silently lost during capture. It is held
as a DEFERRED entry (not a manifest `openQuestion`) because the packet is at
`capture` and ready to enter research clean. Constraint to carry forward: IF
streaming is ever pulled into langextract, it must be exposed as schema-backed
LangExtract domain events, never raw AI chunks — so keep this sibling's stream
surface schema-first (strict `Schema.Class` Complete + `Schema.optionalWith`
Partial) to stay reconcilable with the locked V1. Resolve at align before any
graduation into a goal packet. (Carried forward into Q1 scope boundary and Q7
Complete payload below.)

---

# Pre-drafted align questions (research-complete seed — all `open`)

## Q1: Scope boundary — which of the 10 netNew themes does THIS packet own, vs route to neighbor goals?

**Recommended:** This packet owns the **deterministic provenance-wall core**: the regex span-extractor family (#4 contract-structure defined-terms/cross-refs/parties/amendments, #5 legal-entity catalog, #6 entity/relationship `{nodes,links}` graph), the unique-anchor span resolver (#10), the heuristic-then-LLM cascade discipline (#9), and the `Partial`/`Complete` streaming candidate gate (#1–#3). It does **not** own: court-PDF layout extraction (#7 caption alignment, #8 PACER header-stamp) → route to `goals/file-processing-capability`'s deferred OCR/diagnostics lane; citation extraction (eyecite-js) → coordinate with the proposed `citation-grounding-hallucination-guard`; court/reporter vocab datasets (courts-db / reporters-db JSON) → `goals/official-data-sync-foundation`.

**Rationale:** RESEARCH places the two genuinely net-new, no-current-home themes here — the no-model regex doc-structure extractors (`@beep/nlp`'s `PatternParsers` are wink token-bracket infra, not char-offset contract structure) and the Partial/Complete gate (it CONFLICTS the langextract V1 streaming lock at `goals/langextract-capability/SPEC.md` L88-89, so it cannot attach there). Court-PDF, citations, and vocab data each already have a routing home with prior decisions (the file-processing lane reserves a `@beep/poppler` seam + prefers Docling; eyecite-js is a maintained BSD-2 TS port; official-data-sync owns static datasets) — pulling them in would spin up the parallel selection processes RESEARCH explicitly warns against. Drawing the boundary at "local deterministic span → epistemic candidate gate" keeps the packet privilege-safe and dependency-light.

**Status:** open (for /grill-with-docs)

## Q2: First slice — what is the first vertical slice shipped?

**Recommended:** Ship the **deterministic regex span extractor + unique-anchor resolver onto the existing `@beep/epistemic-domain` candidate→admitted gate** first (netNew #4/#5/#10 → `CandidateClaim` at `lifecycle:"candidate"` → SHACL `ClaimGate` → `admitted`). Defer the Partial/Complete streaming gate (#1–#3) and the heuristic→LLM cascade (#9) to a second slice.

**Rationale:** The deterministic path is local, no-model-in-the-loop, privilege-safe, and effectively free (single-digit ms), crossing no auth/secret boundary — the cleanest first cut. It reuses the most existing substrate (`TextAnchor`, the `@beep/langextract` alignment ladder, `ClaimLifecycle`/`ClaimGateResult`/`CandidateClaim`), so the net-new surface is just the `matchAll`/`d`-flag span extractor (NOT FOUND in repo) plus the uniqueness check the alignment port is missing. The streaming gate's terminal `Complete` payload depends on resolved spans existing first, and the cascade's escalation must be confidence/abstention-based (Q8) — both are cheaper to build once the deterministic wall and gate boundary are proven.

**Status:** open (for /grill-with-docs)

## Q3: Package placement — where do the deterministic extractor, unique-anchor resolver, and streaming gate physically live?

**Recommended:** Build the deterministic extractor as a **new `@beep/nlp`-adjacent sibling capability package** (e.g. `packages/foundation/capability/doc-structure`) that reuses `@beep/nlp` conventions (`$NlpId` identity composer, Schema-first models, `VERSION` discipline) but does **not** route raw-text regex through wink's token-bracket `PatternParsers` API. **Extend `@beep/langextract` `Alignment`** in place for the unique-anchor resolver — add `ambiguous` / `not_found` members to `AlignmentStatus` and an occurrence-count check on the exact rung — rather than a new package. Leave the streaming gate's **physical home as an explicit align/shape question** (epistemic-domain vs a new streaming module vs langextract-adjacent), while fixing now that its candidate→approved boundary feeds the existing `@beep/epistemic-domain` lifecycle/gate. Exact package names/paths are a decompose-stage detail.

**Rationale:** RESEARCH is explicit that the wink `PatternParsers` reuse steered by the raw note is an impedance mismatch (bracket token patterns over a tokenized `Document`, not `RegExp.matchAll`/`d`-flag char offsets) — so a sibling that reuses conventions, not the wink API, is the authoritative call. The alignment ladder already exists and "fails closed to `unaligned`" but lacks the uniqueness / ambiguous-vs-not-found distinction (verified NOT FOUND) that mike#5 + Anthropic `str_replace` both require — extending it is less duplication than a parallel resolver. RESEARCH names the streaming gate's physical home as "an align/shape question, NOT a research fact," so it stays open by design.

**Status:** open (for /grill-with-docs)

## Q4: Build-vs-buy on citations — reuse eyecite-js, re-port from Python, or treat as out-of-scope?

**Recommended:** Treat citation extraction as **coordinate-not-build for this packet**: adopt the **eyecite-js TS port** (`@beshkenadze/eyecite`, BSD-2-Clause) under the `citation-grounding-hallucination-guard` lane — NOT a from-scratch port and NOT a clean-room reimplement. Before depending, re-verify the npm `latest` dist-tag vs the GitHub tag vs the tarball license, pin a specific version, and run its parity suite. Import courts-db / reporters-db JSON catalogs directly (BSD-2) through `effect/Schema` via `official-data-sync-foundation`.

**Rationale:** eyecite (FLP) is BSD-2, actively maintained, tested against 50M+ citations, powers CourtListener/CAP, and uses tuned regex with no model in the matching loop — every citation exposes `span()`/`fullSpan()` offsets. A TS port with self-reported full parity already exists, and the npm `latest` is now a stable `2.7.6` (BSD-2 per registry metadata, verified 2026-06-29), superseding the stale alpha snapshot — re-porting Python would be wasted effort. RESEARCH routes citation extraction to the citation-guard lane, so owning it here would violate Q1's scope boundary; the version/license re-check guards against the GitHub README's lingering alpha framing.

**Status:** open (for /grill-with-docs)

## Q5: Court-PDF extractor backend — pick now, and how do copyleft/auth boundaries land?

**Recommended:** **Defer the backend choice to the `goals/file-processing-capability` OCR/diagnostics lane; do not run a parallel selection here.** When a backend is forced, default to **Apache-2.0 pdf.js or PDFBox**, and treat **Poppler `-bbox-layout` as an optional out-of-process sidecar only** — GPL-family copyleft, so a bundled / statically-linked build inherits the obligation; require legal/compliance review + NOTICE/source-offer handling if it ships in a distributed service/container, never a bundled lib. Compute the header-band threshold from `page.height` (not a hardcoded `y0>750`). No auth/secret boundary is crossed by the deterministic core; only the LLM refinement stage is network/secret-bearing.

**Rationale:** The header-stamp/caption features cannot ride the existing tika driver — Tika abstracts away the char-level `{fontname, x0, y0}` the `LiberationSans`/top-band predicate needs (HARD GAP, verified). RESEARCH already holds more specific backend prior art in `goals/file-processing-capability/research/` (reserved `@beep/poppler` seam, Docling preferred for later layout work) and explicitly says this packet's choice must reconcile with and route through that lane, not duplicate it. Poppler's local metadata reports GPL-2.0-only / GPL-3.0-or-later — the sidecar-vs-bundled call plus legal review is a Licensing-gravity constraint, and `y0>750` breaks on legal-size (1008 pt) / rotated pages. Per Q1 this is routed-out scope, so the recommendation is to defer rather than decide here.

**Status:** open (for /grill-with-docs)

## Q6: Confidence type — canonical branded `UnitInterval` + shared-kernel cleanup, or adapt at the boundary?

**Recommended:** Name the **branded `@beep/schema/UnitInterval` (re-exported as epistemic `Confidence`) as the canonical confidence type** at the candidate gate. Require both the regex/heuristic seeder and the LLM path to **decode/rebrand into the branded type before the gate**. Schedule a **small shared-kernel cleanup** so `@beep/nlp` and `@beep/langextract` reuse `@beep/schema/UnitInterval` instead of their local unbranded copy — sequenced as its own change, not blocking the first slice.

**Rationale:** The repo has TWO non-identical `UnitInterval`s (verified): the canonical branded `@beep/schema/UnitInterval` carried by `EvidenceSpan.confidence`/`Confidence`, and an unbranded `@beep/nlp internal/numbers` copy that `GroundedExtraction`/`ExtractionCandidate` `confidence` actually use. A boundary straight from `GroundedExtraction.confidence` into `EvidenceSpan.confidence` is therefore not type-identical and needs an explicit decode step — RESEARCH recommends naming the branded type canonical, decoding both paths into it, and a small shared-kernel cleanup. Doing the cleanup as a separate, non-blocking change keeps the first slice (Q2) from absorbing a cross-package refactor.

**Status:** open (for /grill-with-docs)

## Q7: Streaming `Complete` payload — carry V1 `LangExtractResult` verbatim, or a projected subset?

**Recommended:** Make the terminal **`Complete` event carry langextract V1's `LangExtractResult` verbatim** — the full five-field class `{ annotatedDocument, diagnostics, documentId, extractions, text }` — not a projected subset. Keep the stream surface schema-first (strict `S.Class` `Complete` + `S.optionalWith(S.NullOr(...))` `Partial`). Only `Complete` seeds a `CandidateClaim` at `lifecycle:"candidate"`; `Partial` events are UI/transport-only, never persisted, never cross into `@beep/epistemic-domain`. If a narrower projection is chosen instead, it is explicitly a NEW payload type and the "identical to V1" framing must be dropped.

**Rationale:** Carrying `LangExtractResult` verbatim keeps the handoff `annotatedDocument`, document identity, and `text` that downstream consumers need, and makes the reconciliation by construction: if streaming is ever pulled into langextract V-next, V1's existing result IS the `Complete` event — so this sibling never reopens the V1 streaming lock (carries forward the 2026-06-29 DEFERRED entry above). RESEARCH corrected the earlier "GroundedExtraction[] + diagnostics" framing (the real result is the five-field class, verified L336-347) and named verbatim-carry the preferred option. The one-directional authority boundary (`Complete`-only into epistemic, terminal `Complete` ≠ admitted) is locked by research.

**Status:** open (for /grill-with-docs)

## Q8: Heuristic→LLM cascade — escalation trigger and confidence-calibration posture?

**Recommended:** Make the escalation trigger **confidence/abstention-based, NOT "regex returned nothing."** Ship the hand-tuned per-type confidences (doc-haus / Juris.AI literals) as **priors / pattern-strength weights, explicitly NOT calibrated probabilities**, and **defer the post-hoc monotonic calibration map** (isotonic preferred; Platt/temperature alternatives) until candidate→admitted outcome data exists to learn it per entity type. Preserve "a miss is an absent row, never a wrong fact" as enforced selective prediction with explicit abstention.

**Rationale:** RESEARCH flags the CALIBRATION TRAP — the hand-tuned literals (statute 0.85, case 0.90; 0.95/0.9/0.8) are priors, and raw self-assessed confidence is poorly calibrated, so wiring them as probabilities would be wrong. It also cites a measured clinical study where naive regex-then-LLM-on-empty UNDERPERFORMED regex-only (F1 .152 vs .283), so the escalation trigger must be confidence/abstention-based; an explicit abstain/defer outcome is formally Chow's optimal reject rule and is both cheaper and more accurate than a low-confidence guess. Calibration cannot be learned without admitted/rejected outcomes, so deferring it (while shipping the abstention discipline now) is the correct sequencing.

**Status:** open (for /grill-with-docs)
