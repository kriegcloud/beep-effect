# P2 API Engineer Prompt

Mission: define implementation-ready API + loader contract for serving exported visualizer graph data.

Read:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`
- `apps/web/src/app/api/graph/search/route.ts`
- `apps/web/src/lib/effect/mappers.ts`

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p2-web-api-and-loader.md` (engineer section)

Must include:

1. `GET /api/kg/graph` response schema
2. error payload schemas (missing/malformed)
3. cache and file lookup behavior
4. API unit/integration test cases
