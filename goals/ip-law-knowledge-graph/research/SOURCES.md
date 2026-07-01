# IP Law Knowledge Graph — Sources & Provenance

Provenance ledger for the gold-intake material folded into this goal. It traces
the deferred S7 (WIPO-IPC/CPC) classification-taxonomy seed back to its mined
nugget, the upstream repo + license it came from, the external standards behind
it, and the in-repo bricks it composes. Derived from the **"IPC/CPC
classification SKOS taxonomy seed"** cluster of the beep-effect Gold-Intake
initiative.

- **Cluster:** IPC/CPC classification SKOS taxonomy seed (theme
  `kg-ontology-reasoning`, wave **P2**, 1 nugget)
- **Route:** `extend-goal` → `primaryTarget: goals/ip-law-knowledge-graph`
- **Gold-intake provenance:**
  - `explorations/_gold-intake/ROUTING.md` — cluster reconciliation (219/219 routed)
  - `explorations/_gold-intake/routing.json` — machine routing (cluster id above)
  - `explorations/_gold-intake/GOLD_SYNTHESIS.md` → "Knowledge graph, ontology &
    reasoning" → "CPC classification taxonomy (section + class maps) as a local
    lookup" (and the gap-map row "CPC/IPC classification + jurisdiction taxonomy
    | not present")
- **Folded note:** [`research/gold-intake-cpc-ipc-skos-seed.md`](./gold-intake-cpc-ipc-skos-seed.md)
  — the non-invasive Case-A extend note this ledger backs.
- Codex review: none under this packet (`reviews/` not present).

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
|---|---|---|---|---|---|---|
| `patents-mcp-server#7` | CPC classification taxonomy (section + class maps) as a local lookup | `patents-mcp-server` (T1, MIT) | `src/tools/utility.tools.ts:48-100` | kg-ontology-reasoning | P2 | **port-with-attribution** (MIT) — adopt the resolver shape + curated A-H+Y subset; re-derive the authoritative vocabulary from WIPO/EPO master data |

### How this informs this packet

This is a single-nugget cluster: it seeds the **already-reserved S7 slot**, it
does not add scope.

- **Resolver pattern → `ClassificationCode` node + `CLASSIFIED_AS` edge.** The
  upstream's `CPC_CLASS_MAP` plus its `code → subclass → class → section` walk is
  the concrete shape for SPEC node type #9 (`ClassificationCode`, Primary Source
  S7) and edge #4 (`CLASSIFIED_AS`, S7). The walk maps directly onto SKOS
  `broader`/`narrower` over the SPEC's `Section/Class/Subclass/MainGroup/Subgroup`
  key-class breakdown. **Take:** the traversal contract and the curated AI/ML +
  comms subset (`G06N`, `G06Q`, `G06T`, `G06V`, `H04L`, `H04W`) as starter seed
  values for the "at least 1 patent scenario" criterion. **Leave:** the
  hand-rolled map as the authority — it is an illustrative ~dozen-symbol slice of
  a ~250k-symbol scheme; the authoritative S7 grounding is the WIPO IPC master
  files / EPO-USPTO CPC scheme.
- **Optional MCP resource shape (`patents://cpc/{code}`).** Recorded as a
  downstream-surface idea only (future `@beep/nlp-mcp` resource). Out of this
  packet's scope ("No web UI / endpoint"); do not implement here.
- **CPC ≠ IPC contract.** The nugget is **CPC** (EPO/USPTO extension of IPC); the
  S7 slot is named "WIPO IPC". They share sections A-H; CPC adds section **Y** and
  deeper subgroups. Model the relationship (CPC `broadMatch`/`exactMatch` → IPC)
  rather than conflating them.

Load-bearing snippet (the contract the implementing agent encodes):

```ts
const CPC_CLASS_MAP: Record<string, string> = {
  G06N: "Computing Arrangements Based on Specific Computational Models (AI/ML)",
  G06V: "Image or Video Recognition or Understanding",
  H04L: "Transmission of Digital Information",
  ...
};
// hierarchical resolver: code -> subclass -> class -> section
```

This is a single-nugget cluster — no sibling-shared nuggets, no split.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
|---|---|---|---|---|
| `patents-mcp-server` | T1 | **MIT** | **Port-with-attribution** (permissive) | The CPC section/class map + `code → subclass → class → section` resolver shape, and the `patents://cpc/{code}` resource idea. FastMCP TS patent-intelligence server (~45-55 tools over USPTO ODP, EPO OPS, Google Patents BigQuery); last commit 2026-06-06, v1.0.4. |

> **Caution (from bundle):** Deferred scope note on the IP-law graph; IPC/CPC are
> public WIPO/EPO-USPTO classification schemes — the *vocabulary content* is
> public-domain standards data and must be re-derived from the authoritative
> master files, not frozen from the upstream's curated subset. Because
> `patents-mcp-server` is **MIT**, the upstream TypeScript *may* be ported with
> attribution (it is not copyleft), but the data itself should still trace to
> WIPO/EPO so the S7 projection is reproducible. Pin a scheme edition/date when
> seeding.

> **Note — supersedes the folded note's earlier caution.** The folded note
> (written before the license bundle landed) flagged `patents-mcp-server` as
> "unknown license / reimplement only". The gold-intake bundle confirms it is
> **MIT**, so port-with-attribution is permissible; the note has been corrected
> accordingly. The standards-data re-derivation guidance still stands on its own
> merits (reproducibility), independent of license.

## 3. External research sources

External standards citations actually present on disk in
[`research/gold-intake-cpc-ipc-skos-seed.md`](./gold-intake-cpc-ipc-skos-seed.md)
("Net-new this contributes" → standards grounding):

- **Cooperative Patent Classification** — confirms CPC is jointly maintained by
  USPTO + EPO, extends the IPC, sections A-H correlate to the eight IPC sections,
  and a ninth section **Y** tags cross-sectional / emerging technologies.
  <https://en.wikipedia.org/wiki/Cooperative_Patent_Classification>
- **USPTO MPEP § 905** — CPC ⊇ IPC relationship and section design.
  <https://www.uspto.gov/web/offices/pac/mpep/s905.html>
- **WIPO — International Patent Classification (IPC)** — authoritative IPC scheme
  + free master-file downloads; the source the S7 `OWL/SKOS` representation should
  ultimately trace to. <https://www.wipo.int/en/web/classification-ipc>

S7 Source-of-Truth access URL (from `SPEC.md` → Source-of-Truth Contract):
<https://www.wipo.int/classifications/ipc/en/>

## 4. In-repo capability references

Bricks this seed composes (from the cluster's secondary targets + the SPEC's
locked surface):

- `@beep/rdf` — **extend** — `packages/foundation/modeling/rdf`. Ships SKOS / OWL
  / PROV / Quad / Dataset vocab (`Vocab/Skos.ts`). Final beep-target: the
  WIPO-IPC/CPC taxonomy seed lands here as design-time authored vocabulary.
- `@beep/semantic-web` — **reuse** — bounded SHACL + minimal SPARQL + JSON-LD
  (per the folded note); design-time validation host, not a runtime SPARQL engine
  (ADR-005 keeps the runtime Cypher-only).
- `@beep/nlp-mcp` — **NET-NEW (deferred)** — `packages/drivers/nlp-mcp`. Optional
  future host for the `patents://cpc/{code}` MCP resource; out of this packet's
  scope.
- `packages/drivers/uspto` — **reference** — cluster secondary target; the
  USPTO-facing driver that a future bulk CPC/IPC ingestion would route through
  (full corpus ingestion is explicitly out of SPEC scope).
- `explorations/court-vocabulary-resolver` — **reference** — sibling SKOS-seed packet in
  the same gold wave (court-jurisdiction taxonomy → S4 JudO slot); the CPC/IPC
  seed is the patent-classification analogue for the S7 slot.

The S7 landing surface itself is **already specced** (not net-new): SPEC node
type #9 `ClassificationCode` (S7) and edge #4 `CLASSIFIED_AS` (S7). The package
target is `packages/ip-law-graph` per the SPEC's assumptions.

## 5. Cross-links & provenance

- **Cluster id:** "IPC/CPC classification SKOS taxonomy seed" (route
  `extend-goal`, `goals/ip-law-knowledge-graph`, wave P2) in
  `explorations/_gold-intake/routing.json`.
- **Sibling packet:** `explorations/court-vocabulary-resolver` (court-jurisdiction SKOS
  seed, same gold wave).
- **This packet:**
  - [`research/gold-intake-cpc-ipc-skos-seed.md`](./gold-intake-cpc-ipc-skos-seed.md)
    — folded research note (the actionable extend).
  - [`research/ontology-grounding-corpus.md`](./ontology-grounding-corpus.md) —
    grounding anchors + the FalkorDB-vs-rebuildable-projection open question (P0)
    that any seed-loading decision must respect.
  - [`SPEC.md`](../SPEC.md) — S7 contract, node #9 / edge #4, ADR-005 (no SPARQL
    runtime), out-of-scope (bulk ingestion, endpoints).
- **GOLD_SYNTHESIS:** `explorations/_gold-intake/GOLD_SYNTHESIS.md` → "Knowledge
  graph, ontology & reasoning" → "CPC classification taxonomy (section + class
  maps) as a local lookup".
- No `DECISIONS.md` or `reviews/` in this packet (ADRs live inline in `SPEC.md`).
