# Handoff P2

## Objective

Freeze `/api/kg/graph` response/error contracts and data loader behavior.

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`
- `apps/web/src/app/api/graph/search/route.ts`
- `apps/web/src/lib/effect/mappers.ts`
- `apps/web/test/graphiti/client.test.ts`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p2-web-api-and-loader.md`

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P2-C01 | `bun run --filter @beep/web test -- graphiti/client.test.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p2/web-api-test-baseline.log` |
| P2-C02 | `rg -n "GraphSearchRouteResponseSchema|NextResponse\.json|status" apps/web/src/app/api/graph/search/route.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p2/web-api-contract-audit.log` |
| P2-C03 | `rg -n "GraphNodeSchema|GraphLinkSchema|GraphSearchResultSchema" apps/web/src/lib/effect/mappers.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p2/web-mapper-contract-audit.log` |

## Completion Checklist

- [ ] Success payload schema defined.
- [ ] Missing export typed 404 response defined.
- [ ] Malformed export typed error response defined.
- [ ] API test plan complete.
- [ ] `outputs/manifest.json` updated (`phases.p2.status`, `updated`).
