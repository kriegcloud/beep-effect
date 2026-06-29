# Gold-intake research note: Relational grounded-extraction grid with per-cell citations (2026-06-29)

> Non-invasive research note for the goal owner. This does **not** amend `SPEC.md`,
> `PLAN.md`, `GOAL.md`, or the packet's phases/scope. The packet is `complete`
> (P0-P3, PR #265). This is a Case-A *extend* capture: a forward-looking persistence
> pattern to fold into a later doctrine-breadth or persistence rung, recorded now so
> the provenance is not lost.

## Source

- **Gold nugget:** `mike#13` — "Structured grounded-extraction grid (`tabular_cells`
  with per-cell citations + status)" (repo `mike`, `backend/schema.sql:619-628`;
  priority **P2**, recommendation **study**). Companion context: `tabular_reviews`
  defines `columns_config` (the extraction schema) plus a `practice` field.
- **Synthesis section:** `explorations/_gold-intake/GOLD_SYNTHESIS.md` →
  "Legal NLP & extraction" → **"Grounded-extraction grid with per-cell citations +
  status"** (lines 1032-1041). Tagged `adjacent · partial · recommend: study · P2`.
  beep-target named there: "@beep/langextract extraction grid; @beep/law-practice
  OfficeAction/Rejection extraction tables; epistemic Evidence/gate".
- **Routing cluster:** `explorations/_gold-intake/routing.json` →
  "Relational grounded-extraction grid (per-cell citations)" → `route: extend-goal`,
  `primaryTarget: goals/law-practice-office-action-extraction-rung`, `wave: P2`,
  `themeSpan: [legal-nlp]`. Secondary targets it flags: `packages/epistemic/domain`,
  `packages/foundation/capability/langextract`, `packages/law-practice/domain`.

The source repo's own framing (`mike`): an AI legal-document assistant whose
"tabular review" surface stores one extracted value per (document, column) with
`content`, a `citations` jsonb (provenance back to source), and a per-cell `status`.

## What goals/law-practice-office-action-extraction-rung already covers

This packet already built — and proved at PR #265 — the **single-document, in-memory**
grounded-extraction rung that the grid pattern would sit on top of:

- Production `OfficeActionReview` invokes `LangExtractService.extract` and feeds
  `LangExtractResult.extractions` (`GroundedExtraction[]`, span-bearing) into `IrToLaw`
  (SPEC.md Acceptance Criteria; README "Latest Evidence" P1/P2).
- Law extraction *targets* already exist as the column-analogue: `office_action`,
  `claim`, `rejection_reference`, `distinction` (README P1/P2). These are exactly the
  "columns" a grid would index.
- The candidate gate / typed-rejection discipline is in place: `IrToLaw` returns typed
  `IrToLawExtractionError` for missing, empty, or unaligned required labels rather than
  fabricating fallback spans (README P2; SPEC Constraints "Missing or unaligned required
  extraction labels must produce a typed failure... must not fabricate source spans").
- The **span-fidelity rule** is already locked: feed `GroundedExtraction[]`, *not* the
  span-lossy nlp `AnnotatedDocument` envelope (SPEC Constraints; README Notes).
- Downstream the datum flows through the epistemic public surface (gate → lifecycle →
  projection) — `@beep/epistemic-use-cases` + `@beep/epistemic-server/layer`
  (manifest `requiredPublicSurfaces`).

In short: the packet owns the **per-cell unit** (one span-grounded extraction, gated,
typed-failure on miss). What it does **not** yet model is the **grid**: many cells across
a `document × column` matrix, each persisting its own provenance and an approval status.

## Net-new this contributes

Concrete patterns from the gold, each tied to `mike#13`:

- **A relational `document × column` extraction grid** (`mike#13`): promote the existing
  in-memory `GroundedExtraction[]` into a persisted matrix where each cell is one
  (document, label/column) pair. The packet today does columns-as-targets for a *single*
  office action; the grid generalizes this to many documents reviewed against one shared
  column schema.
- **A reusable `columns_config` / review-template entity** (`mike#13`): the extraction
  schema (`office_action`/`claim`/`rejection_reference`/`distinction` today) becomes a
  first-class, named, reusable definition rather than hard-coded targets — so a
  "rejection review" template can be applied across a docket.
- **Per-cell persisted provenance** (`mike#13`): each cell carries its own `citations`
  payload (span/anchor back to source). This is the persistence shape for what the packet
  currently holds only transiently in `GroundedExtraction`; it lands naturally over
  `@beep/provenance` `TextAnchor` (startChar/endChar/quote) and `epistemic.Evidence`.
- **Per-cell approval `status`** (`mike#13`): a `pending`-default lifecycle bit *per datum*
  (not per document). This dovetails with the existing claim gate / `ClaimLifecycle` but
  pins the human-or-machine approval state to the individual extracted cell — the unit an
  attorney actually reviews.

External grounding — this grid-with-cited-cells shape is the **established legal-AI review
UX**, not a one-off in `mike`. Hebbia's "Matrix" presents documents as rows and prompts as
columns and attaches clickable in-line citations to the exact line/cell/paragraph each
value came from. Harvey's "Review" returns tabular per-file answers with cell-level,
sentence/character-level Exact-Quote citations. The pattern beep would be adopting is
the dominant grounded-review interface in the category, which de-risks it as a target
shape. ([Harvey collaborative review tables](https://www.harvey.ai/blog/collaborative-review-tables),
[Hebbia legal review](https://www.legalintaker.com/blog/hebbia-ai-for-legal-research))

## Recommended integration (non-invasive)

These are options for the goal owner; none of them require rewriting this packet's SPEC.

1. **Most aligned home: a successor persistence rung, not this packet.** This packet's
   stated frontier is doctrine breadth (multi-reference 103 + 101/112), explicitly
   deferred (`knownGaps` in manifest; SPEC Non-Goals; README P2). The grid is a separate
   axis — *persistence + scale-out*, not *more doctrine*. Cleanest fit is a new
   sibling/successor packet (e.g. a "law-practice extraction grid" or "office-action
   review-table" rung) that depends on this one, rather than reopening P0-P3.
2. **Schema host:** model `tabular_cells` / `columns_config` as first-party schema-first
   entities in `packages/law-practice/domain` (the routing's `secondaryTargets`), reusing
   `@beep/schema` idioms — `content` (text), `citations` (over `@beep/provenance`
   `TextAnchor`, not raw jsonb), `status` (a `LiteralKit` lifecycle enum, not free `text`).
3. **Provenance/gate reuse, not reinvention:** the per-cell `citations` should be
   `epistemic.Evidence` / `TextAnchor`-backed, and the per-cell `status` should compose the
   existing `ClaimGate` / `ClaimLifecycle` (extend with rejected/superseded if needed) —
   consistent with the synthesis "extend lifecycle, don't reinvent gating" directive and
   this packet's existing epistemic composition exception (SPEC Exception Ledger).
4. **Reuse the existing column vocabulary:** seed `columns_config` from the four targets
   this packet already proved (`office_action`, `claim`, `rejection_reference`,
   `distinction`) so the grid is a continuation of proven labels, not a new taxonomy.
5. **Keep `langextract` as the per-cell engine:** the grid is an orchestration/persistence
   layer over many `LangExtractService.extract` calls; do not push grid concerns down into
   `@beep/langextract` (whose V1 deliberately stays single-extraction and defers streaming).

## Cautions

- **Licensing — reimplement, do not copy (hard).** The sole source `mike` is **AGPL-3.0**
  (confirmed in both `routing.json` cautions and `GOLD_SYNTHESIS.md`: "the two richest
  legal repos (courtlistener, mike) are AGPL-3.0 — study/port-by-reimplementation only").
  AGPL is network-copyleft: it closes the SaaS/ASP loophole and obliges source disclosure
  to anyone interacting with a derivative **over a network**, so vendoring or porting its
  code into this (public, product-bound) repo would virally bind the service. Treat
  `mike#13` as a **spec/shape reference only** — reimplement the `tabular_cells` /
  per-cell-citation model first-party from the schema description, not the source.
  ([GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html),
  [choosealicense AGPL-3.0](https://choosealicense.com/licenses/agpl-3.0/))
- **Span-fidelity locked decision — do not regress.** `mike`'s `citations` is loose `jsonb`.
  This packet's locked rule is span-bearing provenance: route per-cell citations through
  span-true `GroundedExtraction` / `TextAnchor`, **never** through the span-lossy
  `AnnotatedDocument` envelope (SPEC Constraints; README Notes; routing cautions).
- **Don't loosen the typed-failure gate.** `mike` defaults `status` to free-text `'pending'`.
  Keep the packet's invariant that missing/unaligned required labels yield a *typed* failure
  or explicit deferred status and never fabricate spans (SPEC Constraints). Model `status`
  as a closed literal lifecycle, not open text.
- **Scope discipline — this is a study-tier, P2 capture.** `mike#13` is `recommend: study`,
  not `adopt`. It is net-new persistence/scale work; folding it in must not be mistaken for
  in-scope work on the *complete* packet, and must not pre-empt the still-deferred doctrine
  breadth that this packet names as its actual next frontier.
- **No new entity without a dup-check.** `packages/law-practice/domain` already has
  `OfficeAction`, `Rejection`, `PatentAsset`, `PriorArtReference`, `Claim` (live-tree
  snapshot 2026-06-29). Capability-check any grid/cell entity against that barrel and the
  `@beep/epistemic-domain` Evidence/Claim spine before declaring it net-new.
