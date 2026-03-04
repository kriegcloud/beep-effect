# P1 KG Export Engineer Prompt

Mission: design implementation-ready `beep kg export` internals that transform KG v1 artifacts into visualizer-v2 JSON.

Read:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p0-architecture-and-gates.md`
- `tooling/cli/src/commands/kg.ts`
- `tooling/cli/test/kg.test.ts`
- `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json`

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md` (engineer section)

Must include:

1. command argument contract and defaults
2. deterministic materialization algorithm
3. node/edge mapping application points
4. failure modes and typed error strategy
5. concrete unit test plan and fixtures
