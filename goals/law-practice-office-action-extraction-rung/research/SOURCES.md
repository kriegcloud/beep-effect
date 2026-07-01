# Law-Practice Office-Action Extraction Rung - Sources & Provenance

Provenance ledger for the gold-intake material folded into this packet. It derives from the
**"Relational grounded-extraction grid (per-cell citations)"** cluster (route `extend-goal`,
wave **P2**, theme `legal-nlp`), and lets an implementing agent trace each grid/cell decision back to
the mined nugget, the upstream repo + its license, the external review-UX citation, and the in-repo
brick it composes.

- **Cluster:** Relational grounded-extraction grid (per-cell citations) - `nuggetCount: 1`, `themeSpan: [legal-nlp]`
- **Route:** `extend-goal` -> `primaryTarget: goals/law-practice-office-action-extraction-rung` (wave P2)
- **Gold-intake provenance:**
  [`explorations/_gold-intake/ROUTING.md`](../../../explorations/_gold-intake/ROUTING.md) -
  [`explorations/_gold-intake/routing.json`](../../../explorations/_gold-intake/routing.json) -
  [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
  ("Legal NLP & extraction" -> "Grounded-extraction grid with per-cell citations + status", lines 1032-1041)
- **Folded note:** [`research/gold-intake-relational-extraction-grid.md`](./gold-intake-relational-extraction-grid.md)
- **Codex review:** none under this packet (`reviews/` absent); the packet's own normative reasoning lives in
  [`SPEC.md`](../SPEC.md) and [`README.md`](../README.md).

## 1. Mined source corpus (gold nuggets)

Single-nugget cluster. Every bundle nugget appears below.

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `mike#13` | Structured grounded-extraction grid (`tabular_cells` with per-cell citations + status) | `mike` (T1) | `backend/schema.sql:619-628` | legal-nlp | P2 | clean-room reimplement (AGPL-3.0 source; `recommend: study`, `relevance: adjacent`, `gapStatus: partial`) |

**How this informs this packet.** `mike#13` is the *grid* axis on top of the *per-cell* unit this packet
already proved at PR #265. Its load-bearing contract is the relational shape: `tabular_reviews.columns_config`
holds the reusable extraction schema, and `tabular_cells` stores one value per `(document, column)` carrying
`content`, a `citations` jsonb, and a per-cell `status default 'pending'`:

```sql
create table if not exists public.tabular_cells (
  ...
  document_id uuid not null references public.documents(id) on delete cascade,
  column_index integer not null,
  content text,
  citations jsonb,
  status text not null default 'pending',
  ...
);
```

What the implementing agent should **take** (the pattern): (a) the `document x column` matrix where each cell is
one grounded extraction; (b) `columns_config` as a first-class, reusable review template (the
`office_action`/`claim`/`rejection_reference`/`distinction` targets this packet already proved become the seed
columns); (c) per-cell persisted provenance; (d) a per-cell approval `status` lifecycle bit. What to **leave**:
`mike`'s loose `jsonb` citations and free-text `status default 'pending'` - both regress this packet's locked
invariants. Per-cell citations must stay span-bearing (`GroundedExtraction` / `TextAnchor`, never the span-lossy
`AnnotatedDocument` envelope), and `status` must be a closed `LiteralKit` lifecycle, not open text. This is a
study-tier, **net-new** persistence/scale capture - it must not be mistaken for in-scope work on the *complete*
packet, nor pre-empt the still-deferred doctrine breadth (multi-reference 103 + 101/112) the packet names as its
real next frontier. Not a SPLIT cluster; no sibling-shared nuggets.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| `mike` | T1 | **AGPL-3.0-only** | **Clean-room reimplement only** (network copyleft - reimplement from the schema description, never vendor/port code) | The `tabular_cells` / `columns_config` per-cell-citation + status *shape* as a spec reference for a first-party law-practice extraction grid |

> **Caution (echoed from `bundle.cautions`):**
> - Keep per-cell citations span-bearing - do **not** route through the entity-level span-lossy
>   `AnnotatedDocument` envelope.
> - **License:** the sole source `mike#13` is **AGPL-3.0**. AGPL is network-copyleft (closes the SaaS/ASP
>   loophole, obliges source disclosure to anyone interacting with a derivative over a network), so vendoring or
>   porting its code into this public, product-bound repo would virally bind the service. Reimplement the
>   `tabular_cells` / per-cell-citation shape first-party from the spec; do not copy.

`mike` framing (from the bundle): a local-first / self-hostable AI legal-document assistant (chat over docs,
tracked-change `.docx` editing, US case-law research, tabular review) on a Next.js frontend + Express/Supabase
backend; active, last commit 2026-06-27.

## 3. External research sources

These external citations actually appear in this packet's folded note
([`research/gold-intake-relational-extraction-grid.md`](./gold-intake-relational-extraction-grid.md)):

- Harvey - collaborative review tables (cell-level Exact-Quote citations): https://www.harvey.ai/blog/collaborative-review-tables
- Hebbia "Matrix" legal review (documents as rows, prompts as columns, in-line cell citations): https://www.legalintaker.com/blog/hebbia-ai-for-legal-research
- GNU AGPL-3.0 license text: https://www.gnu.org/licenses/agpl-3.0.en.html
- choosealicense - AGPL-3.0 summary: https://choosealicense.com/licenses/agpl-3.0/

The first two ground the claim that a grid-with-cited-cells is the *established* legal-AI review UX (de-risking it
as a target shape); the latter two ground the AGPL clean-room discipline. No other external URLs exist on disk for
this packet; all remaining claims trace to the in-repo `SPEC.md` Constraints, `README.md` Notes, and the gold-intake
provenance files above.

## 4. In-repo capability references

The `@beep/*` bricks this packet (and the folded grid pattern) compose, from `bundle.secondaryTargets` plus the
note's in-repo inventory:

| Capability | Package path | Role | Disposition |
| --- | --- | --- | --- |
| `@beep/langextract` | `packages/foundation/capability/langextract` | Per-cell extraction engine (`LangExtractService.extract` -> `GroundedExtraction[]`) | **reuse** (grid is an orchestration layer over many extract calls; do not push grid concerns down into V1) |
| `@beep/epistemic-domain` | `packages/epistemic/domain` | `Evidence` + claim gate / `ClaimLifecycle` backing per-cell citations and per-cell `status` | **extend** (compose existing gate/lifecycle; add `rejected`/`superseded` only if needed) |
| `@beep/law-practice-domain` | `packages/law-practice/domain` | Existing `OfficeAction`, `Rejection`, `PatentAsset`, `PriorArtReference`, `Claim`; host for a schema-first `tabular_cells` / `columns_config` model | **extend / NET-NEW** (the grid/cell + reusable column-config entity is net-new; dup-check the barrel before declaring) |
| `@beep/provenance` `TextAnchor` | (referenced) | `startChar`/`endChar`/`quote` anchor that per-cell `citations` should persist over (not raw jsonb) | **reuse** |
| `@beep/epistemic-use-cases`, `@beep/epistemic-server/layer` | (referenced) | Public epistemic surface the datum flows through (gate -> lifecycle -> projection) | **reuse** (bounded public-surface composition per SPEC Exception Ledger) |
| `@beep/law-practice-use-cases` | `packages/law-practice/use-cases` | Where production `OfficeActionReview` / `IrToLaw` live (the per-cell unit this packet built) | reuse (already covered by this packet) |

**Net-new (from `bundle.netNew`):** Relational grounded-extraction grid - tabular `columns_config` + `cells`
(content + citations jsonb + status per `document x column`) - a grid of `GroundedExtraction`s with per-cell
provenance at scale. `bundle.alreadyCovered` is empty.

## 5. Cross-links & provenance

- **Exploration <-> goal:** this packet is the cluster's `primaryTarget` via `route: extend-goal`; `bundle.crossref`
  is empty (no sibling packet). Source exploration dir:
  [`explorations/_gold-intake/`](../../../explorations/_gold-intake/).
- **Cluster id:** "Relational grounded-extraction grid (per-cell citations)" (wave P2, theme `legal-nlp`).
- **Packet artifacts:** [`SPEC.md`](../SPEC.md) (normative Constraints + Exception Ledger),
  [`README.md`](../README.md) (Latest Evidence P1/P2/P3), [`PLAN.md`](../PLAN.md), [`GOAL.md`](../GOAL.md),
  [`ops/manifest.json`](../ops/manifest.json). No packet-local `DECISIONS.md` or `reviews/` exist; the folded
  research note is [`research/gold-intake-relational-extraction-grid.md`](./gold-intake-relational-extraction-grid.md).
- **Gold synthesis:** [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
  -> "Legal NLP & extraction" -> "Grounded-extraction grid with per-cell citations + status" (lines 1032-1041).
