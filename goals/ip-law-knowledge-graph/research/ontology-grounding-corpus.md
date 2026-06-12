# Ontology Grounding Corpus (added 2026-06-11)

Curated grounding material for this packet's P0 ontology research, surveyed
during the 2026-06-11 corpus/vision sessions. These sources complement the
S1–S7 OWL ontology set already locked in `SPEC.md`.

## Primary local corpus: `/home/elpresidank/YeeBois/ontology_research/`

| Anchor | Path | Why it matters |
| --- | --- | --- |
| FOLIO ontology | `legal_ontologies/openlegalstandards_folio/FOLIO/FOLIO.owl` (18 MB, 18k+ concepts; CC-BY, ALEA/SALI) | Broad legal practice vocabulary (matters, actors, documents). **Caveat verified: shallow on patent/trademark practice areas** — FOLIO supplies the backbone, not the IP layer. Ships its own Fuseki + MCP tooling. |
| IP ontology literature | top-level PDFs: IPROnto, OWL Copyright Ontology, Copyright Licenses Reasoning, IPR Brokerage, Regulatory Ontologies, LKIF Core, LegalRuleML 1.0 | The classical actor/work/right/obligation/action primitives. LKIF + LegalRuleML + IPROnto are the highest-value anchors; most IP-specific papers are 2004–2008 academic artifacts — mine concepts, not code. |
| effect-ontology repo | `ontology_ts_repos/effect-ontology` | Effect-native OWL→prompt→LLM→SHACL→RDF extraction pipeline (catamorphic prompt folding, entity resolution). The pattern bridge from ontology to schema-constrained extraction. |
| effect-langextract repo | `ontology_ts_repos/effect-langextract` | Already absorbed into the repo as `foundation/capability/langextract` (source-grounded char spans). Reference for parity. |
| Patent KG fixtures | `IP_ONTOLOGY_AI_RESEARCH/citation_recommendation_model_*_spo.spo` (430k+ triples: assignees/inventors/classifications/dates/titles) | Shape reference for patent-KG facets; content is Chinese-patent data — fixtures only. |
| Practice blueprint | `IP_ONTOLOGY_AI_RESEARCH/markdown/tom_oppold_practice_profile_and_automation_blueprint.md` | The target practice mapped to data sources: USPTO ODP, PatentsView, CourtListener, attorney identity resolution (OED#/bar#/attorney_id), Attorney/Patent/Case/DocketEntry node sketch. |
| LLM+KG paper | `IP_ONTOLOGY_AI_RESEARCH/1-s2.0-S0952197626004574-main.pdf` (Eng. Appl. of AI, 2026) | Two-stage ontology-guided patent knowledge extraction — same architecture family as effect-ontology. |

## Strays found in the 2026-06-11 workstation scan

- `/home/elpresidank/Documents/patentlego-ontology/` (30 files) — patent
  ontology working notes; review and absorb or retire during P0.
- `/home/elpresidank/Documents/Research_sources_for_a_Palantir-style_IP_Law_ontology.md`
  — curated six-layer source list (Palantir operational-ontology paradigm,
  formal foundations, legal core ontologies, IP REL standards, doctrinal
  primary sources, property-graph/OWL bridges). Directly relevant to P0;
  honest maintenance-status flags per source.

## Open question for P0 (flagged 2026-06-11, must be resolved)

This packet's `SPEC.md` locks **FalkorDB** as graph storage. Runtime
doctrine (`goals/agentic-professional-runtime/SPEC.md`, reaffirmed
2026-06-11) holds that *claim + evidence + provenance + lifecycle is the
authoritative memory primitive* and **graph views are rebuildable
projections** — and that data-model documents stay storage-neutral. P0 must
reconcile the two before P1 schema design, presumptively by classifying the
FalkorDB store as a rebuildable projection fed from epistemic claims rather
than a second source of truth. Record the resolution in this packet's
decision history (and amend `SPEC.md` here if the storage posture changes).

## Related packets

- `goals/oppold-corpus-pipeline` — produces the organized, USPTO-enriched
  corpus + catalog this graph will be built from.
- `goals/trustgraph-port` — selective extraction-kernel port; graph views
  remain projections.
