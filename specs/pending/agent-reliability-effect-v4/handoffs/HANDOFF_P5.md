# Handoff P5: KG Closed Loop

## Context Budget

| Memory Type | Budget | Estimated | Status |
|---|---|---|---|
| Working | 2,000 | ~1,050 | OK |
| Episodic | 1,000 | ~450 | OK |
| Semantic | 500 | ~350 | OK |
| Procedural | Links | Links | OK |

## Working Context

Phase goal:

1. Introduce run-level failure ontology.
2. Ingest failed runs into Graphiti (`beep-dev`) as structured episodes.
3. Retrieve corrective facts pre-run using prompt + touched paths + failure signature.
4. Compare `adaptive` vs `adaptive_kg` with controlled experiment.

Deliverables:

1. `outputs/agent-reliability/episodes/` artifacts.
2. `outputs/p5-kg-impact-report.md`.

Exit gate:

1. `adaptive_kg` demonstrates measurable lift or incident reduction.

## Episodic Context

1. Detector and correction layers should already be active from P4.
2. Existing Graphiti shared-memory infrastructure is operational from completed specs.

## Semantic Context

1. Use `group_id: beep-dev` for run-knowledge ingestion.
2. Keep retrieval packet size bounded (facts + chars + dedupe).

## Procedural Context

1. Reuse existing Graphiti MCP helper paths.
2. Keep ingestion payload typed and auditable.
