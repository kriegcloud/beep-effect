# Gold-intake research note: CPC/IPC classification taxonomy as a SKOS seed for the S7 WIPO-IPC slot (2026-06-29)

> Non-invasive Case-A extend. This is a research note for the goal owner to act
> on later. It does **not** modify `SPEC.md`, `PLAN.md`, `GOAL.md`, the manifest
> phases, or the locked scope. It records where an external pattern can seed an
> already-specced slot.

## Source

- **Gold nugget:** `patents-mcp-server#7` (repo `patents-mcp-server`) —
  "CPC classification taxonomy (section + class maps) as a local lookup."
  Source file `src/tools/utility.tools.ts:48-100`. Priority P2,
  recommendation `adopt`.
- **GOLD_SYNTHESIS section:**
  `explorations/_gold-intake/GOLD_SYNTHESIS.md` →
  "Knowledge graph, ontology & reasoning" → subsection
  "CPC classification taxonomy (section + class maps) as a local lookup"
  (lines ~424-427). The synthesis records the beep-target as a
  "WIPO-IPC/CPC taxonomy seed in @beep/rdf Vocab + lookup helper; optional MCP
  resource via @beep/nlp-mcp." It also names the gap explicitly in the
  gap map: "CPC/IPC classification + jurisdiction taxonomy | not present"
  (sourced from `uspto-patents-mcp`, `patents-mcp-server`).
- **Routing cluster:** `explorations/_gold-intake/routing.json` →
  cluster "IPC/CPC classification SKOS taxonomy seed", route `extend-goal`,
  `primaryTarget: goals/ip-law-knowledge-graph`, wave P2. Secondary targets:
  `court-vocabulary-resolver`, `packages/drivers/nlp-mcp`,
  `packages/drivers/uspto`, `packages/foundation/modeling/rdf`.

## What goals/ip-law-knowledge-graph already covers

This note builds on surface that the SPEC has **already locked** — it is an
extend, not a rebuild:

- **S7 WIPO IPC is already a Source-of-Truth ontology.** `SPEC.md`
  Source-of-Truth Contract lists `S7 | WIPO IPC | International Patent
  Classification hierarchy`, and the OWL Ontology Survey already classifies it
  as `OWL/SKOS (RDF/XML)` with key classes
  `Section, Class, Subclass, MainGroup, Subgroup`.
- **A node type and an edge type already reserve the slot.** Planned node type
  #9 `ClassificationCode` (`_tag: ClassificationCode`, Primary Source S7) and
  planned edge #4 `CLASSIFIED_AS` (`Patent / Trademark → ClassificationCode`,
  Primary Source S7) are the exact landing surface for this taxonomy. The
  contract requires every type to trace to S1-S7, so a populated CPC/IPC
  vocabulary is what makes the S7 trace concrete rather than nominal.
- **The RDF/SKOS host already exists in-repo.** Per the tree snapshot and the
  GOLD_SYNTHESIS gap map, `@beep/rdf` (`packages/foundation/modeling/rdf`)
  ships SKOS/OWL/PROV/Quad/Dataset vocab and `@beep/semantic-web` ships bounded
  SHACL + minimal SPARQL + JSON-LD. The SPEC's ADR-005 deliberately keeps the
  runtime Cypher-only (no SPARQL runtime), and the assumptions section keeps OWL
  a **design-time reference only** — so a SKOS seed lands as authored design-time
  vocabulary feeding the schema, consistent with the locked decisions.
- **A sibling taxonomy seed is already noted in the same gold wave.** The
  GOLD_SYNTHESIS "Court jurisdiction taxonomy" subsection points its SKOS seed
  at `@beep/rdf` `Vocab/Skos.ts` and the S4 JudO slot; the CPC/IPC seed is the
  patent-classification analogue for the S7 slot. The existing
  `research/ontology-grounding-corpus.md` already flags the
  FalkorDB-vs-rebuildable-projection open question (P0) that any seed-loading
  decision must respect.

## Net-new this contributes

Concrete capabilities/patterns from the gold, each tied to nugget
`patents-mcp-server#7` unless noted:

- **A starter CPC section + class/subclass lookup table.** Hardcoded CPC
  sections (A-H plus the cross-sectional/emerging-tech section Y) and a
  class/subclass map including AI/ML-relevant groups `G06N`, `G06Q`, `G06T`,
  `G06V` and comms groups `H04L`, `H04W` (`patents-mcp-server#7`). Useful as a
  practice-relevant starter subset for the S7 `ClassificationCode` node rather
  than a full ~250k-symbol CPC import on day one.
- **A hierarchical resolver pattern.** A walk `code → subclass → class →
  section` that resolves any leaf code up to its broader ancestors
  (`patents-mcp-server#7`). This maps directly onto SKOS `broader`/`narrower`
  semantics for the `ClassificationCode` hierarchy and onto the SPEC's
  `Section/Class/Subclass/MainGroup/Subgroup` key-class breakdown for S7.
- **An optional MCP resource shape.** The upstream exposes the lookup as
  `patents://cpc/{code}` (`patents-mcp-server#7`); per the synthesis this could
  later be surfaced via `@beep/nlp-mcp` or a future patent MCP. This is a
  downstream-surface note only — out of the SPEC's current scope (which
  excludes UI/endpoints) and recorded here purely so the slot is not forgotten.
- **Grounding for the standards behind the seed (external, cited):**
  - CPC is jointly developed and maintained by the USPTO and the EPO, and is an
    extension of the IPC; sections A-H correlate to the eight IPC sections and a
    ninth section **Y** tags cross-sectional / emerging technologies
    ([Wikipedia: Cooperative Patent Classification](https://en.wikipedia.org/wiki/Cooperative_Patent_Classification);
    [USPTO MPEP 905](https://www.uspto.gov/web/offices/pac/mpep/s905.html)).
    This confirms the upstream's A-H+Y section design and the CPC⊇IPC
    relationship the S7 slot needs to model.
  - The authoritative **IPC** scheme is maintained by WIPO and its master files
    are published for free download
    ([WIPO: International Patent Classification (IPC)](https://www.wipo.int/en/web/classification-ipc)),
    which is the upstream source the SPEC's S7 `OWL/SKOS` representation should
    ultimately trace to (rather than freezing the hand-rolled subset).

## Recommended integration (non-invasive)

For the goal owner to fold in **without a SPEC rewrite** — all of these land
inside phases and surfaces the SPEC already defines:

- **P0 (Ontology Research) — treat as grounding input for S7.** When surveying
  S7 WIPO IPC, cite this note's standards grounding and the upstream
  section/class map as a worked example of the
  `Section → Class → Subclass → MainGroup → Subgroup` hierarchy. No scope
  change: S7 is already in the survey table.
- **P1 (Schema Design) — use the resolver shape for the `ClassificationCode`
  node + `CLASSIFIED_AS` edge.** The `code → subclass → class → section` walk is
  the natural `broader`/`narrower` parent chain to encode on node type #9; the
  SKOS-style hierarchy aligns with the existing `@beep/rdf` `Vocab/Skos.ts`
  host. No new node/edge type is required — these already exist.
- **P2/P3 (Seed data) — adopt the A-H+Y subset as starter seed values.** The
  AI/ML and comms class subset is a pragmatic, practice-relevant seed for the
  "at least 1 patent scenario" success criterion, deferring a full CPC/IPC
  bulk import (already out of scope per "Full corpus ingestion (WIPO bulk
  data ...)").
- **Storage posture — respect the open question.** Per
  `research/ontology-grounding-corpus.md`, any loaded classification data is a
  **rebuildable projection** fed from authored vocabulary / epistemic claims,
  not a second source of truth. Seed the SKOS vocab as design-time authored
  data; do not let the FalkorDB store become authoritative.
- **Downstream MCP resource — defer.** Record `patents://cpc/{code}` as a future
  `@beep/nlp-mcp` resource idea only; it is outside this packet's "No web UI /
  endpoint" scope and belongs to the routing cluster's secondary targets
  (`packages/drivers/nlp-mcp`).

## Cautions

- **Reimplement, do not copy — licensing unverified.** `patents-mcp-server` is
  an external repo of unknown license in this intake. Treat the upstream TS as a
  **pattern reference only**; reimplement the resolver and re-derive the
  vocabulary from authoritative public sources (WIPO IPC master files; CPC
  scheme from the EPO/USPTO CPC site). Do not paste upstream source verbatim
  into this permissively-licensed repo.
- **Hand-rolled subset is illustrative, not authoritative.** The gold's
  hardcoded A-H+Y map is a small curated slice, not the full CPC/IPC scheme
  (CPC has ~250k symbols and is revised on a rolling basis). Use it as a starter
  seed; the authoritative S7 grounding is the WIPO/EPO master data. Pin a scheme
  edition/date when seeding so the projection is reproducible.
- **CPC ≠ IPC — keep the distinction explicit.** The SPEC's S7 slot is named
  "WIPO IPC"; the gold is **CPC** (the EPO/USPTO extension of IPC). They share
  sections A-H but CPC adds section Y and far deeper subgroups. Model the
  relationship (CPC `broadMatch`/`exactMatch` → IPC) rather than conflating
  them, or the S7 trace will be imprecise.
- **No SPARQL runtime (locked).** ADR-005 keeps the runtime Cypher-only and
  assumptions keep OWL design-time-only; do not introduce a SPARQL/OWL-reasoner
  runtime to "resolve" classification hierarchies. The `code → section` walk is
  a plain traversal, consistent with that decision.
- **Does not change phases or scope.** Bulk WIPO/USPTO ingestion and any
  endpoint/MCP surface remain explicitly out of scope per the SPEC; this note
  only seeds the already-reserved S7 `ClassificationCode` surface.
