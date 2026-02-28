# Handoff P4: Effect v4 Reliability Layer

## Context Budget

| Memory Type | Budget | Estimated | Status |
|---|---|---|---|
| Working | 2,000 | ~1,050 | OK |
| Episodic | 1,000 | ~400 | OK |
| Semantic | 500 | ~350 | OK |
| Procedural | Links | Links | OK |

## Working Context

Phase goal:

1. Build correction index from local migration corpus + KG facts only.
2. Expand wrong-API detector categories.
3. Generate preflight correction packet before runs.
4. Hard-fail critical wrong-API incidents.

Deliverables:

1. `benchmarks/agent-reliability/effect-v4-corrections.json` (generated + curated).
2. `outputs/p4-effect-v4-detector-report.md`.

Exit gate:

1. Wrong-API trend moves toward target trajectory.

## Episodic Context

1. Adaptive-mode baseline has been measured in P3.
2. Detector exists but needs deeper coverage and source-backed evidence mapping.

## Semantic Context

1. Local-only truth sources remain mandatory.
2. Critical detector incidents directly affect run success.

## Procedural Context

1. Map every detector rule to migration or KG evidence.
2. Keep correction packet bounded and deduped.
