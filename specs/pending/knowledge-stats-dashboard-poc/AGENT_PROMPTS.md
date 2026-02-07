# Agent Prompts: Knowledge Stats Dashboard POC

This spec assumes sessions that can delegate to specialized agents described in `specs/_guide/README.md`.

If a given environment does not provide these agents, treat the prompts as *role descriptions* and execute the tasks manually with equivalent rigor.

---

## P1: Discovery (codebase-researcher)

```text
You are the codebase-researcher for the Knowledge Stats Dashboard POC.

Goal: produce a file map + pattern references that make implementation straightforward.

Constraints:
- Follow slice boundaries: domain -> tables -> server -> client -> ui.
- Identify existing RPC patterns in `packages/knowledge/server/src/rpc/v1/`.
- Identify where `@xyflow/react` is used in the codebase (if anywhere), and any shared graph UI patterns.
- Do not propose new libraries unless necessary; record evidence.

Deliverable:
- Write `specs/pending/knowledge-stats-dashboard-poc/outputs/codebase-context.md`

Include:
- Candidate route location (`apps/web` vs `apps/todox`) with evidence
- Confirm how the **Knowledge Base** tab is implemented and where to attach the dashboard route/nav item
- Existing stats/ontology endpoints, if any
- Suggested file touch list for P2-P5
```

---

## P1: Effect / Schema Research (mcp-researcher)

```text
You are the mcp-researcher.

Goal: collect repo-specific Effect/Schema patterns relevant to:
- defining RPC response schemas
- validating external data (DB -> domain -> RPC)
- writing tests with `@beep/testkit`

Deliverable:
- `specs/pending/knowledge-stats-dashboard-poc/outputs/effect-research.md`

Provide short citations to local docs:
- `.claude/rules/effect-patterns.md`
- `documentation/EFFECT_PATTERNS.md`
- `documentation/patterns/effect-testing-standards.md` (if present)
```

---

## P2: Contracts (schema-expert + effect-code-writer)

```text
You are implementing Phase 2 for Knowledge Stats Dashboard POC.

Goal: define an RPC contract in `packages/knowledge/client` that returns a schema-validated `DashboardStats`.

Requirements:
- No `any`, no unchecked casts.
- Output schema must represent:
  - summary metrics row (counts)
  - schema inventory (classes/properties) with counts
  - graph nodes/edges derived from ontology schema (not instances)
- Add a versioned endpoint naming scheme consistent with existing `rpc/v1` modules.

Deliverable:
- Code changes in `packages/knowledge/client`
- Update handoff: `handoffs/HANDOFF_P3.md`
```

---

## P3: Server Aggregates (effect-code-writer + test-writer)

```text
You are implementing Phase 3 for Knowledge Stats Dashboard POC.

Goal: implement server-side SQL aggregates and an RPC handler that returns the Phase 2 contract.

Requirements:
- SQL aggregates only (no client recompute).
- Prefer existing services/layers in `packages/knowledge/server/src/Service`.
- Add tests for empty/non-empty DB. Use repo fixtures patterns if available.

Deliverable:
- Code changes in `packages/knowledge/server`
- Tests passing for touched packages
```

---

## P4: UI Components (react-expert)

```text
You are implementing Phase 4 for Knowledge Stats Dashboard POC.

Goal: implement dashboard components in `packages/knowledge/ui` and export them.

Requirements:
- Use React Flow for schema graph (2D baseline).
- Provide toggles for layout/direction/edge style/spacing.
- Keep state local or via repo standard (Effect Atom) if already used.

Deliverable:
- Components + exports in `packages/knowledge/ui`
- Minimal tests if repo has UI VM patterns
```

---

## P5: Integration (react-expert)

```text
You are implementing Phase 5 for Knowledge Stats Dashboard POC.

Goal: add a page route and wire RPC -> UI.

Requirements:
- Choose `apps/web` vs `apps/todox` based on Discovery evidence.
- Ensure dark mode acceptable.
- Ensure mobile doesn’t hard-break (graph can collapse behind a tab).

Deliverable:
- Working route rendering real stats
```

---

## P6: Verification (package-error-fixer + test-writer)

```text
You are implementing Phase 6 for Knowledge Stats Dashboard POC.

Goal: run gates and fix remaining issues.

Commands:
- bun run check
- bun run test
- bun run lint

Visual QA:
- Use the Playwright MCP server (`mcp__playwright__*`) to take snapshots and screenshots.
- Capture at least light + dark mode, plus one non-default graph layout state.
- If auth is required, use the sign-in route and the seeded dev account email (`beep@hole.com`); keep passwords out of committed docs and logs.

Deliverable:
- All gates pass
- Add short verification notes in outputs/ (optional)
```
