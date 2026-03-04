# Graphiti Fact Extracts

## Source

- Graph group: `palantir-ontology`
- Extraction timestamp: 2026-02-25T05:21:45Z (UTC)
- Retrieval methods: `search_memory_facts`, `search_nodes`
- Usage rule: supplemental only; graph facts cannot independently justify high-impact architecture decisions [CIT-003][CIT-009]

## Extracted Facts

| Fact ID | Fact | Confidence | Evidence Category | Corroboration | Usage Decision |
|---|---|---|---|---|---|
| GF-001 | Egress policy governs which external systems agent proxy / Foundry worker connections may communicate with. | medium | graph-derived control-plane fact | CIT-006, CIT-010, CIT-011 | accepted as supplemental support for policy egress controls |
| GF-002 | Pipeline Builder is represented as part of Foundry in graph memory relationships. | medium | graph-derived platform fact | CIT-007 | accepted as supplemental context |
| GF-003 | Pipeline Builder graph relationships include table-level transforms, union transforms, and user-defined function support. | medium | graph-derived workflow fact | CIT-007 | accepted as supplemental context |
| GF-004 | Graph nodes indicate documentation entities tied to interface implementation and pipeline transformation concepts. | low | graph-derived documentation linkage fact | CIT-005, CIT-007 | accepted with low-confidence limitation note |
| GF-005 | Graph retrieval quality for policy/provenance entities is uneven across result sets, requiring primary-source confirmation before control conclusions. | high | graph-quality meta-fact | CIT-003, CIT-009 | accepted as extraction quality constraint |

## Corroboration Status

- Corroborated by primary evidence: GF-001, GF-002, GF-003
- Corroborated with limitation: GF-004
- Process/meta constraint: GF-005

## Integration Guidance

1. Use GF-001 in policy and runtime egress discussions only when paired with primary policy documentation references.
2. Use GF-002 and GF-003 to accelerate workflow architecture framing, not to replace direct provider/runtime evidence.
3. Treat low-confidence graph-only signals as backlog candidates until corroborated.

## Inference Notes

1. Inference: current graph memory is most useful for hypothesis generation and terminology alignment, not final architectural adjudication.
2. Inference: graph extraction should be refreshed during P2 if validation uncovers provenance/policy trace gaps.
