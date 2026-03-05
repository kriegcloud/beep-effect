# Effect-v4 KG Office Hours Evidence

## Scope

- KG corpus is intentionally limited to `.repos/effect-v4` (effect-smol), not the full beep monorepo.
- Codex and Claude share memory through Graphiti with `group_id=beep-dev`.
- Dataset source for this pass is `specs/completed/effect-v4-knowledge-graph/outputs/p3-ast-extraction/function-episodes.json`.
- Reproducible dataset size check:

```bash
python -c 'import json; print(len(json.load(open("specs/completed/effect-v4-knowledge-graph/outputs/p3-ast-extraction/function-episodes.json"))))'
# expected output: 4052
```

## Condition Mapping

| P4 mode name | Bench condition | Intent |
|---|---|---|
| `baseline` | `current` | Non-KG control condition |
| `semantic_only` | `adaptive` | Adaptive policy path without Graphiti retrieval |
| `ast_only` | `minimal` | Minimal retrieval packet path without Graphiti retrieval |
| `ast_jsdoc_hybrid` | `adaptive_kg` | Hybrid path with Graphiti retrieval enabled |

## Targeted Live Ablation Snapshot (2026-02-28 UTC)

- Source run: `outputs/agent-reliability/runs/p4-ablation-live-v9-targeted.json`
- `runAtEpochMs`: `1772299651692` (`2026-02-28T17:27:31.692Z`)
- `runMode`: `live`
- `executionBackend`: `cli`
- `status`: `completed`
- `totalRuns`: `8`

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|
| `adaptive` (`semantic_only`) | 2 | 0 | 0.00% | 0 | 0.00% | n/a |
| `adaptive_kg` (`ast_jsdoc_hybrid`) | 2 | 2 | 100.00% | 0 | 100.00% | 4.40 |
| `current` (`baseline`) | 2 | 0 | 0.00% | 0 | 0.00% | n/a |
| `minimal` (`ast_only`) | 2 | 0 | 0.00% | 0 | 0.00% | n/a |

## Caveats

- This is a targeted slice (`n=8`), so treat it as directional evidence, not final promotion evidence.
- Broader baseline-vs-candidate comparisons can be non-comparable when run mode and matrix assumptions differ.
- Weekly reports include both successful and failed probes across different dates and backends; use run metadata when comparing.

## Source References

- Mode mapping: `outputs/p0-baseline-and-gates.md` lines 39-44.
- Targeted report table: `outputs/agent-reliability/weekly/p4-ablation-live-v9-targeted-report.md` lines 15-20.
- Targeted run metadata + condition records:
  - `outputs/agent-reliability/runs/p4-ablation-live-v9-targeted.json` lines 3, 5-12.
  - `outputs/agent-reliability/runs/p4-ablation-live-v9-targeted.json` lines 650-870 (`adaptive_kg` entries with `success=true`, `retrievalTop5`, and `kgContextReview`).
- Dataset artifact and scope context:
  - `specs/completed/effect-v4-knowledge-graph/outputs/p3-ast-extraction/function-episodes.json` lines 1-8.
  - Dataset size check command shown above (expected `4052`).
- Non-comparable matrix caveat example:
  - `outputs/agent-reliability/weekly/p4-ablation-compare.md` note block under "NON-COMPARABLE".

## Discord Draft

During today’s [Office Hours](https://youtu.be/BKYFmcij_gk), when AST + annotation came up, my goblin brain took that personally.

I’ve been building a KG from **`.repos/effect-v4` only** (effect-smol), not the whole monorepo: AST/JSDoc extraction -> FalkorDB -> Graphiti MCP -> hook-time context injection for Codex/Claude (for example when they reach for APIs like `Either`).

Bonus side effect: **Claude + Codex share memory via Graphiti using `group_id=beep-dev`**, so facts discovered by one agent can be reused by the other instead of each run starting from zero context.

Current dataset: **4,052 function episodes** (ts-morph + JSDoc extraction, Voyage Code 3 embeddings).

Most useful data point so far (targeted live ablation, 2026-02-28 UTC, n=8):

- `semantic_only` (`adaptive`): **0/2 success**, **0% retrieval top-5 hit**
- `ast_jsdoc_hybrid` (`adaptive_kg`): **2/2 success**, **100% retrieval top-5 hit**, **KG relevance mean 4.40/5**

So yeah, early signal says "semantic + adaptive AST/JSDoc hybrid" is not just vibes.

Still small-N, still expanding eval gates before claiming victory. If anyone has done similar ablation design for Effect-heavy repos, I would love to compare notes.
