# P2: Web API and Loader

## Goal

Define implementation-ready API and loader contracts for serving exported visualizer graphs.

## Required Inputs

1. `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`
2. `apps/web/src/app/api/graph/search/route.ts`
3. `apps/web/src/lib/effect/mappers.ts`

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p2-web-api-and-loader.md`

## Frozen API Contract

- Route: `GET /api/kg/graph`

Success payload:

- HTTP `200`
- body: `VisualizerGraph`

Missing export payload:

- HTTP `404`
- body:
  - `error.code = "KgGraphNotFound"`
  - `error.message` includes remediation command: `bun run beep kg export --mode full --format visualizer-v2`

Malformed export payload:

- HTTP `500`
- body:
  - `error.code = "KgGraphMalformed"`
  - `error.message` and safe diagnostics

## Loader Contract

1. Primary path:
   - `tooling/ast-kg/.cache/codebase-graph-v2.json`
2. Optional override path (non-default): provided via explicit env/config in implementation phase.
3. decode with schema validation before returning payload.
4. never return raw parse/stack traces to client payload.

## API Test Matrix

1. success response with valid fixture.
2. missing file returns typed 404 payload.
3. malformed file returns typed 500 payload.

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P2-C01 | web API route tests | `outputs/evidence/p2/web-api-tests.log` |
| P2-C02 | route contract audit | `outputs/evidence/p2/web-api-contract-audit.log` |
| P2-C03 | schema decode audit | `outputs/evidence/p2/web-api-schema-audit.log` |

## Completion Checklist

- [ ] API success contract is frozen.
- [ ] Missing/malformed contracts are frozen.
- [ ] Loader behavior is frozen.
- [ ] API test matrix is frozen.

## Explicit Handoff

Next phase: [HANDOFF_P3.md](../handoffs/HANDOFF_P3.md)
