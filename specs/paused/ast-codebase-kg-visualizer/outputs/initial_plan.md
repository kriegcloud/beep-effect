# Initial Plan

## Objective

Turn the AST visualizer sample bundle into a canonical repository spec that can orchestrate deterministic implementation on top of KG v1 contracts.

## Locked Defaults

1. Data source contract: KG v1 (`beep kg`) + adapter.
2. Adapter ownership: CLI-owned `beep kg export`.
3. UI surface: new authenticated `/kg` route in `apps/web`.
4. Renderer stack: D3 SVG force graph.
5. Validation depth: unit + browser E2E.
6. Scope model: full canonical spec package in-place under `specs/pending/ast-codebase-kg-visualizer`.

## Planned Public Interfaces

1. `bun run beep kg export --mode <full|delta> [--changed <csv>] --format visualizer-v2 [--out <path>]`
2. `GET /api/kg/graph`
3. `apps/web/src/app/(app)/kg/page.tsx`
4. `VisualizerGraph` schema + adapter mapping contract

## Key Risk to Resolve

`kg index` currently does not persist a full visualizer-ready graph artifact by default, so `kg export` must materialize deterministic full graph output from KG v1-compatible sources.

## Phase Order

`PRE -> P0 -> P1 -> P2 -> P3 -> P4 -> P5`
