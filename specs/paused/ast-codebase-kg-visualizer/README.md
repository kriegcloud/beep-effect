# AST Codebase KG Visualizer (KG v1 + `/kg` D3)

## Status

PENDING

## Owner

@elpresidank

## Created

2026-02-28

## Updated

2026-02-28

## Quick Navigation

- [Quick Start](./QUICK_START.md)
- [Master Orchestration](./MASTER_ORCHESTRATION.md)
- [Agent Prompts](./AGENT_PROMPTS.md)
- [Rubrics](./RUBRICS.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Handoff PRE](./handoffs/HANDOFF_PRE.md)
- [Handoff P0](./handoffs/HANDOFF_P0.md)
- [Handoff P1](./handoffs/HANDOFF_P1.md)
- [Handoff P2](./handoffs/HANDOFF_P2.md)
- [Handoff P3](./handoffs/HANDOFF_P3.md)
- [Handoff P4](./handoffs/HANDOFF_P4.md)
- [Handoff P5](./handoffs/HANDOFF_P5.md)
- [Outputs Manifest](./outputs/manifest.json)
- [Initial Plan](./outputs/initial_plan.md)
- [PRE Output](./outputs/p-pre-contract-and-source-alignment.md)
- [P0 Output](./outputs/p0-architecture-and-gates.md)
- [P1 Output](./outputs/p1-kg-export-cli.md)
- [P2 Output](./outputs/p2-web-api-and-loader.md)
- [P3 Output](./outputs/p3-d3-ui-implementation.md)
- [P4 Output](./outputs/p4-performance-and-e2e-validation.md)
- [P5 Output](./outputs/p5-rollout-decision.md)
- [Frozen Bundle Inputs](./outputs/kg-bundle/README.md)

## Purpose

**Problem:** The repository has a sample AST visualizer bundle, but no canonical repo spec that can orchestrate production-grade implementation using the existing KG v1 command surface and web architecture.

**Solution:** Upgrade this spec directory into a full canonical orchestration package that freezes architecture, APIs, mapping contracts, quality gates, and handoff prompts for implementing a deterministic `beep kg export` path plus an authenticated Next.js `/kg` D3 visualizer.

**Why this matters:** It prevents fragmented one-off implementations, keeps KG semantics aligned to existing `beep kg` contracts, and makes UI delivery reproducible across agents and phases.

## Source-of-Truth Contract

All decisions in this spec must be grounded in these local artifacts first:

1. [JSDoc AST KG Impact Readiness (pending)](../jsdoc-ast-kg-agent-impact-readiness/README.md)
2. [JSDoc AST KG Master Orchestration](../jsdoc-ast-kg-agent-impact-readiness/MASTER_ORCHESTRATION.md)
3. [JSDoc AST KG Rubrics](../jsdoc-ast-kg-agent-impact-readiness/RUBRICS.md)
4. [Agentic AST KG Enriched With JSDoc (completed)](../../completed/agentic-codebase-ast-kg-enriched-with-jsdoc/README.md)
5. [Completed AST KG Orchestration](../../completed/agentic-codebase-ast-kg-enriched-with-jsdoc/MASTER_ORCHESTRATION.md)
6. [KG CLI Command Surface](../../../tooling/cli/src/commands/kg.ts)
7. [Visualizer Bundle README](./outputs/kg-bundle/README.md)
8. [Visualizer Bundle Prompt](./outputs/kg-bundle/codex-prompt-kg-visualizer.md)
9. [Visualizer Bundle Extractor](./outputs/kg-bundle/extract-graph-v2.ts)
10. [Visualizer Bundle Reference UI](./outputs/kg-bundle/visualize-v2.html)
11. [Visualizer Sample Graph](./outputs/kg-bundle/sample-graph-v2.json)
12. [Existing Web Graph API](../../../apps/web/src/app/api/graph/search/route.ts)
13. [Existing Web Graph Components](../../../apps/web/src/components/graph/GraphPanel.tsx)
14. [Existing Force Graph Component](../../../apps/web/src/components/graph/ForceGraph.tsx)
15. [Existing Graph Node Details Component](../../../apps/web/src/components/graph/NodeDetail.tsx)
16. [Existing Graph Mappers](../../../apps/web/src/lib/effect/mappers.ts)
17. [Existing Graph State Atoms](../../../apps/web/src/state/graph.atoms.ts)
18. [Existing Web Route Layout](../../../apps/web/src/app/(app)/layout.tsx)

When assumptions conflict with these artifacts, this spec must follow these artifacts.

## Locked Architecture Decisions (ADRs)

| ADR | Decision | Rationale |
|---|---|---|
| ADR-000 | Upgrade in place at `specs/pending/ast-codebase-kg-visualizer` | Preserve bundle artifacts and avoid duplicate spec slugs. |
| ADR-001 | KG v1 (`beep kg`) is canonical graph source | Reuse existing deterministic contracts and dual-write provenance model. |
| ADR-002 | Visualizer adapter is CLI-owned via `beep kg export` | Keep graph materialization deterministic and scriptable outside web runtime. |
| ADR-003 | UI surface is additive authenticated `/kg` route in `apps/web` | Preserve existing `/(app)/page.tsx` graph/chat experience. |
| ADR-004 | Renderer stack is D3 SVG force graph | Match bundle behavior contract (filters, hover, inspector, depth presets, markers). |
| ADR-005 | Upload/demo mode is allowed for local validation, not canonical production data path | Canonical path must read exported KG v1-derived artifact. |
| ADR-006 | Validation requires unit + browser E2E | Ensure both contract correctness and interactive UX behavior are guarded. |

## Scope

### In Scope

- Full canonical spec scaffold and orchestration package under this directory.
- PRE + P0..P5 phase outputs, handoffs, and prompts.
- Planning and contract-freezing for new CLI command:
  - `bun run beep kg export --mode <full|delta> [--changed <csv>] --format visualizer-v2 [--out <path>]`
- Planning and contract-freezing for new API route:
  - `GET /api/kg/graph`
- Planning and contract-freezing for new web route:
  - `apps/web/src/app/(app)/kg/page.tsx`
- KG v1 to visualizer schema mapping freeze (nodes, edges, provenance, meta).
- Test and verification gates for CLI, API, D3 UI interactions, and scale behavior.

### Out of Scope

- Direct per-request visualization from FalkorDB/Graphiti query APIs.
- Replacing existing home app route behavior.
- Shipping runtime features not required for visualizer path (alerts, auth redesign, new storage backends).
- Replacing existing `beep kg` indexing/publish/parity/replay command semantics.

## Phase Breakdown

| Phase | Focus | Deliverable | Exit Criteria |
|---|---|---|---|
| PRE | Contract alignment + schema mapping freeze | `outputs/p-pre-contract-and-source-alignment.md` | Source-of-truth alignment and immutable mapping tables are locked. |
| P0 | Architecture and gate freeze | `outputs/p0-architecture-and-gates.md` | CLI/API/UI boundaries, file map, and acceptance gates are decision-complete. |
| P1 | `kg export` CLI design + implementation plan | `outputs/p1-kg-export-cli.md` | Command contract, adapter architecture, and tests are locked with no TBDs. |
| P2 | `/api/kg/graph` serving + loader contract | `outputs/p2-web-api-and-loader.md` | API schema/errors and data loading behavior are locked. |
| P3 | `/kg` D3 UI implementation contract | `outputs/p3-d3-ui-implementation.md` | Component architecture, interactions, accessibility, and fallback UX are locked. |
| P4 | Performance + E2E validation | `outputs/p4-performance-and-e2e-validation.md` | Unit/API/E2E + scale gate plan is complete and measurable. |
| P5 | Rollout decision + runbook | `outputs/p5-rollout-decision.md` | Go/no-go rubric, rollback triggers, and staged rollout policy are explicit. |

## Execution Plan For Another Agent Instance

### PRE: Contract Alignment + Mapping Freeze

- Align source contracts between KG v1 outputs and visualizer v2 requirements.
- Freeze immutable node/edge mapping tables with deterministic fallback semantics.
- Produce command and evidence matrix for all phases.
- Write [outputs/p-pre-contract-and-source-alignment.md](./outputs/p-pre-contract-and-source-alignment.md).

### P0: Architecture and Gates

- Freeze file boundaries for CLI export module(s), API route(s), and `/kg` UI modules.
- Freeze interface contracts and quality gates for each layer.
- Capture unresolved constraints and convert to explicit acceptance gates.
- Write [outputs/p0-architecture-and-gates.md](./outputs/p0-architecture-and-gates.md).

### P1: KG Export CLI

- Define CLI contract, options, defaults, and output schema guarantees.
- Define deterministic export pipeline from KG v1 artifacts.
- Define unit test matrix for determinism, delta/full behavior, and malformed input handling.
- Write [outputs/p1-kg-export-cli.md](./outputs/p1-kg-export-cli.md).

### P2: API and Loader

- Define `GET /api/kg/graph` contract for success, missing export file, and malformed export.
- Define data loader behavior and cache assumptions for web consumption.
- Define API tests and typed error expectations.
- Write [outputs/p2-web-api-and-loader.md](./outputs/p2-web-api-and-loader.md).

### P3: D3 UI

- Define `/kg` page composition, state model, D3 canvas boundaries, and interactions.
- Lock interaction behavior for depth presets, filters, search, hover, click inspector, zoom/pan, and auto-fit.
- Define accessibility and keyboard expectations.
- Write [outputs/p3-d3-ui-implementation.md](./outputs/p3-d3-ui-implementation.md).

### P4: Performance + E2E Validation

- Define automated tests: CLI unit, API unit/integration, Playwright UI E2E.
- Define scale scenario gates (sample and large fixture).
- Define evidence artifact contract for measured results.
- Write [outputs/p4-performance-and-e2e-validation.md](./outputs/p4-performance-and-e2e-validation.md).

### P5: Rollout Decision

- Evaluate all gates and produce go/limited-go/no-go recommendation.
- Define production runbook and rollback triggers.
- Capture ownership and follow-up actions.
- Write [outputs/p5-rollout-decision.md](./outputs/p5-rollout-decision.md).

## Important Planned Public API / Interface Additions

1. CLI export command:
   - `bun run beep kg export --mode <full|delta> [--changed <csv>] --format visualizer-v2 [--out <path>]`
   - default output path: `tooling/ast-kg/.cache/codebase-graph-v2.json`
2. API route:
   - `GET /api/kg/graph` returns exported visualizer graph JSON or typed 404 remediation payload.
3. Web route:
   - `apps/web/src/app/(app)/kg/page.tsx`
4. Type contracts:
   - `VisualizerGraph` schema compatible with bundle reference contract
   - Adapter mapping contract from KG v1 nodes/edges/provenance to visualizer graph nodes/edges/meta

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `kg index` does not currently materialize a full visualizer-ready graph artifact | High | `kg export` command must explicitly reconstruct deterministic graph output and write canonical cache artifact. |
| KG v1 kinds/edges do not map 1:1 to visualizer contract | High | Freeze immutable mapping tables in PRE/P0 and preserve `meta.originalType` on fallback mappings. |
| UI degrades on large graphs (5k+ nodes) | High | Enforce P4 scale gates, profiling evidence, and interaction latency thresholds. |
| API route coupling to missing export files leads to runtime failures | Medium | Typed 404 remediation contract + operator instructions in response and runbook. |
| Scope drift into direct database query rendering | Medium | ADR-005 and explicit out-of-scope boundary in every phase handoff. |

## Test Cases and Scenarios (Spec-Level Requirements)

1. CLI unit scenarios:
   - export command emits valid visualizer schema output
   - deterministic output for same commit/input
   - delta/full behavior correctness
2. API scenarios:
   - `/api/kg/graph` success path
   - missing export file typed 404 remediation response
   - malformed graph file handling
3. UI E2E scenarios:
   - `/kg` route renders graph
   - depth slider changes visible node sets
   - node and edge filters toggle visibility
   - hover neighborhood highlight + click inspector behavior
   - `/` hotkey search + `Esc` clear
4. Scale scenarios:
   - sample fixture smoke (`114 nodes / 205 edges`)
   - large fixture responsiveness (no freeze/crash, bounded interaction latency)

## Verification and Acceptance Gates

Required command families for this spec package:

1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check`
5. `find specs/pending/ast-codebase-kg-visualizer -type f | sort`
6. `cat specs/pending/ast-codebase-kg-visualizer/outputs/manifest.json`

## Assumptions and Defaults

1. Upgrade occurs in place at `specs/pending/ast-codebase-kg-visualizer`.
2. `outputs/kg-bundle/*` remains preserved as frozen input artifacts.
3. Full canonical spec package is required.
4. `/kg` is additive and does not replace `apps/web/src/app/(app)/page.tsx`.
5. CLI export path is canonical; direct sink-query visualization is out-of-scope for initial rollout.

## Exit Condition

This spec is complete when another agent can execute PRE + P0..P5 without making architecture decisions, produce all declared outputs and evidence artifacts, and deliver an explicit rollout recommendation grounded in the locked test and performance gates.
