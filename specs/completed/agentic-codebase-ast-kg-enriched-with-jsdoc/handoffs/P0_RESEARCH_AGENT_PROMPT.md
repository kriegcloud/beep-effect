# P0 Research Agent Prompt

## Goal
Produce a source-backed landscape inventory for AST KG + JSDoc semantic enrichment on Graphiti. Do not implement runtime code.

## Inputs
1. `README.md`
2. `outputs/p0-research/landscape-comparison.md` (update/complete)
3. Required source list S1-S16 from README

## Required Tasks
1. Compare external stacks and protocols:
- FalkorDB code-graph, code-graph-backend, Code-Graph-RAG, Graphiti, SCIP/scip-typescript.
2. Compare extraction choices:
- ts-morph, TypeScript Compiler API, tree-sitter incremental parsing.
3. Capture incremental/scope constraints:
- TS incremental, Nx affected behavior.
4. Capture docs/governance and static-analysis fit:
- TypeDoc output options, CodeQL language support.

## Output
Write/update: `outputs/p0-research/landscape-comparison.md`

## Output Requirements
1. Must include all 16 required sources with no omissions.
2. Each claim must cite one or more source IDs (S1-S16).
3. Provide explicit recommendation for:
- parser stack
- persistence/read path
- incremental update model
- optional secondary index sources
4. Record known limits/uncertainties without speculation.

## Done Criteria
- Source coverage: 16/16 complete.
- Recommendations align with locked defaults.
- No unresolved architectural ambiguity is left in the landscape doc.
