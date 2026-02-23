# Master Orchestration: db-repo-standardization

> Complete workflow for standardizing DbRepo factory signatures: object inputs, `{ data }` wrapped outputs.

---

## Mandatory Handoff Protocol

**INVIOLABLE RULE**: Every phase MUST create BOTH handoff documents for the next phase before the current phase can be considered complete:

1. `handoffs/HANDOFF_P[N+1].md` — Full context document
2. `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` — Copy-paste prompt

Handoff documents MUST incorporate valuable learnings from `REFLECTION_LOG.md` to maximize the next phase's probability of success. Information not passed forward is LOST — agents start fresh each session.

See `specs/_guide/HANDOFF_STANDARDS.md` for format requirements and context budget protocol.

---

## Phase 1: Inventory & Research

### Purpose

Map every file affected by the refactor and research Effect APIs relevant to the changes.

### Tasks

#### Task 1.1: Build Dependency Inventory (codebase-researcher)

Systematically find all files that:

1. **Import from `@beep/shared-domain/factories/db-repo`** — domain repo contracts
2. **Import from `@beep/shared-server/factories/db-repo` or `@beep/shared-server/factories`** — server repo implementations
3. **Call base repo methods** (`insert`, `insertVoid`, `update`, `updateVoid`, `findById`, `delete`, `insertManyVoid`) on repo instances — call sites in services, handlers, etc.
4. **Reference `DbRepo.Method`** — custom method definitions
5. **Reference `DbRepoSuccess` or `BaseRepo`** — type-level consumers

For each file found, record:
- File path
- Which methods are used (list each)
- Whether it's a type-only import or runtime usage
- Which vertical slice it belongs to (shared, iam, documents, calendar, knowledge, comms, customization)

**Output**: `outputs/inventory.md`

#### Task 1.2: Effect Source Research (mcp-researcher + codebase-explorer)

Research the following in `.repos/effect` source code AND via the `effect_docs` MCP tool:

1. **`@effect/sql/SqlSchema`** — `SqlSchema.single`, `SqlSchema.findOne`, `SqlSchema.void`, `SqlSchema.findAll` return types and how to map/wrap their outputs
2. **`@effect/sql/Model`** — `M.Any`, `Model["insert"]`, `Model["update"]`, `Model["fields"]` type accessors
3. **`effect/Schema`** — `S.Struct.Context` behavior when composing `{ data: ModelType }`
4. **`S.Class` patterns** — How to define Success/Payload classes that wrap repo results
5. **Schema encoding/decoding** — Whether `{ data }` wrapper affects encode/decode pipelines

Key questions to answer:
- Does wrapping `SqlSchema.single` output in `{ data: ... }` require a schema transform, or can we `Effect.map` the result?
- What does `S.Struct.Context<{ readonly data: Model["Type"] }>` resolve to?
- What patterns exist in Effect ecosystem for result wrappers?

**Output**: `outputs/effect-research.md`

### Phase Completion Requirements

Phase 1 is complete when ALL of:
- [ ] `outputs/inventory.md` exists with categorized file list
- [ ] `outputs/effect-research.md` exists with API analysis
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created — must include key inventory findings and research insights that inform the design phase
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created — must include relevant patterns/gotchas from reflection that increase Phase 2 success

**CRITICAL**: Phase is NOT complete until BOTH P2 handoff files exist. Handoff documents MUST incorporate valuable learnings from the REFLECTION_LOG to maximize next phase success.

---

## Phase 2: Design

### Purpose

Design the exact type and implementation changes based on inventory and research.

### Tasks

#### Task 2.1: Design Type Changes (effect-expert)

Using inventory and research outputs, produce:

1. **Finalized `BaseRepo` interface** — exact TypeScript for each method
2. **`Method` type analysis** — determine if `DbRepo.Method` needs changes (it returns `S.Schema.Type<Spec["success"]>` which should auto-adapt if contract Success includes `{ data }`)
3. **Runtime `makeBaseRepo` changes** — how to wrap results, unwrap object inputs
4. **Context propagation verification** — confirm `S.Struct.Context<{ readonly data: Model["Type"] }>` resolves correctly
5. **Migration strategy** — ordered list to minimize intermediate breakage

Design constraints (from README):
- `insert`/`update`/`insertVoid`/`updateVoid`: parameter renamed to `payload`, same type
- `findById`/`delete`: input becomes `payload: { readonly id: ... }`
- `insertManyVoid`: input becomes `payload: { readonly items: NonEmptyArray<...> }`
- Non-void returns wrap in `{ readonly data: T }`
- `findById` returns `Option<{ readonly data: T }>`, NOT `{ data: Option<T> }`

**Output**: `outputs/design.md`

### Phase Completion Requirements

Phase 2 is complete when ALL of:
- [ ] `outputs/design.md` exists with finalized type signatures
- [ ] Design reviewed and approved
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created — must include finalized design decisions, rationale for key choices, and any context propagation gotchas discovered
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created — must include design summary and patterns from reflection

**CRITICAL**: Phase is NOT complete until BOTH P3 handoff files exist.

---

## Phase 3: Implementation Plan

### Purpose

Create a concrete, ordered implementation plan with specific file-level changes.

### Tasks

#### Task 3.1: Create Ordered Plan

Using the inventory and design, produce an implementation plan ordering:

1. **Core types**: `packages/shared/domain/src/factories/db-repo.ts`
2. **Core implementation**: `packages/shared/server/src/factories/db-repo.ts`
3. **Build shared packages**: propagate types
4. **Per-slice domain repos**: if changes needed (most use `DbRepoSuccess` which auto-updates)
5. **Per-slice server repos**: update custom methods calling base repo methods
6. **Services/handlers**: update call sites
7. **Tests**: update assertions

Group by vertical slice for parallel execution where possible.

**Output**: `outputs/implementation-plan.md`

### Phase Completion Requirements

Phase 3 is complete when ALL of:
- [ ] `outputs/implementation-plan.md` exists with ordered file list
- [ ] Plan reviewed and approved
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created — must include implementation order, specific file paths, and expected patterns for each change
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created — must include concrete code examples from design phase

**CRITICAL**: Phase is NOT complete until BOTH P4 handoff files exist.

---

## Phase 4: Core Refactor

### Purpose

Implement changes to the two core factory files in `packages/shared/`.

### Tasks

#### Task 4.1: Update Domain Types

File: `packages/shared/domain/src/factories/db-repo.ts`

Changes:
- Update `BaseRepo` interface with new signatures per design
- Rename parameters to `payload` consistently
- Wrap non-void return types in `{ readonly data: T }`
- Change `findById` input to `payload: { readonly id: ... }`
- Change `delete` input to `payload: { readonly id: ... }`
- Change `insertManyVoid` input to `payload: { readonly items: ... }`

#### Task 4.2: Update Runtime Implementation

File: `packages/shared/server/src/factories/db-repo.ts`

Changes:
- Update `makeBaseRepo` function body
- `insert`: rename param, wrap result in `{ data: result }`
- `insertVoid`: rename param only
- `update`: rename param, wrap result in `{ data: result }`
- `updateVoid`: rename param only
- `findById`: accept `{ id }`, destructure, pass `id` to schema, wrap result: `O.map(result, data => ({ data }))`
- `delete`: accept `{ id }`, destructure, pass `id` to schema
- `insertManyVoid`: accept `{ items }`, pass `items` to schema
- Preserve all telemetry spans (update attribute access for new shapes)
- Preserve all error mapping

#### Task 4.3: Build & Verify Core

```bash
bun run build --filter @beep/shared-domain
bun run build --filter @beep/shared-server
```

Downstream type errors are expected and confirm changes propagated.

### Phase Completion Requirements

Phase 4 is complete when ALL of:
- [ ] Both factory files updated
- [ ] Shared packages build successfully
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings (especially any unexpected type issues)
- [ ] `handoffs/HANDOFF_P5.md` created — must include exact code patterns used in core refactor, any gotchas discovered, and per-slice migration instructions
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created — must include before/after code examples and common migration patterns from reflection

**CRITICAL**: Phase is NOT complete until BOTH P5 handoff files exist. The core refactor learnings are essential for efficient consumer migration.

---

## Phase 5: Consumer Migration

### Purpose

Update all consuming repositories and call sites across vertical slices.

### Tasks

Work through the inventory file (`outputs/inventory.md`) slice by slice.

#### Task 5.1: Update Server Repositories

For each `*.repo.ts` in server packages:
- `baseRepo.findById(id)` -> `baseRepo.findById({ id })`
- `baseRepo.delete(id)` -> `baseRepo.delete({ id })`
- Handle `{ data }` wrapper on `insert`/`update` results where used
- `baseRepo.insertManyVoid(items)` -> `baseRepo.insertManyVoid({ items })`
- Update custom methods that wrap base repo (e.g. `CommentRepo.create` uses `flow(baseRepo.insert, ...)`)

#### Task 5.2: Update Services and Handlers

For each service/handler calling repo methods:
- `repo.findById(id)` -> `repo.findById({ id })`, handle `Option<{ data }>` result
- `repo.insert(...)` -> destructure `{ data }` from result if value is used
- `repo.delete(id)` -> `repo.delete({ id })`

#### Task 5.3: Update Tests

For each test file:
- Update assertions for new output shapes
- Update test calls passing bare IDs

#### Task 5.4: Fix Remaining Errors

Use `package-error-fixer` per slice:
```bash
bun run check --filter @beep/iam-server
bun run check --filter @beep/documents-server
# etc.
```

### Phase Completion Requirements

Phase 5 is complete when ALL of:
- [ ] All slices updated per inventory
- [ ] `bun run check` passes or only pre-existing failures remain
- [ ] `REFLECTION_LOG.md` updated with Phase 5 learnings (migration patterns that worked/didn't)
- [ ] `handoffs/HANDOFF_P6.md` created — must include list of all changes made, any remaining issues, and exact verification commands
- [ ] `handoffs/P6_ORCHESTRATOR_PROMPT.md` created — must include verification checklist and known pre-existing failures

**CRITICAL**: Phase is NOT complete until BOTH P6 handoff files exist.

---

## Phase 6: Verification

### Purpose

Run all quality gates and confirm no regressions.

### Tasks

```bash
bun run build
bun run check
bun run test
bun run lint:fix && bun run lint
```

Document any pre-existing failures in `outputs/pre-existing-failures.md`.

### Completion Criteria

- [ ] `bun run build` — zero new failures
- [ ] `bun run check` — zero new failures
- [ ] `bun run test` — zero new failures
- [ ] `bun run lint` — zero new failures
- [ ] Pre-existing failures documented

---

## Context Budget Tracking

Per `specs/_guide/HANDOFF_STANDARDS.md`, orchestrators MUST monitor context consumption.

| Phase | Work Items | Est. Tool Calls | Sub-Agents | Large Reads | Risk | Split Trigger |
|-------|------------|-----------------|------------|-------------|------|---------------|
| P1 | 2 | 3-4 | 2 | 0-1 | Low | N/A |
| P2 | 1 | 2-3 | 1-2 | 1-2 | Low | N/A |
| P3 | 1 | 1-2 | 0 | 1 | Low | N/A |
| P4 | 3 | 3-5 | 1-2 | 2 | Medium | N/A |
| P5 | 4 | 8-12 | 2-4 | 3-5 | **High** | Split P5a/P5b if inventory >50 files |
| P6 | 5 | 5-6 | 1 | 0 | Low | N/A |

**Zone Protocol**:
- **Green** (0-10 tool calls, 0-2 large reads, 0-5 sub-agents): Continue normally
- **Yellow** (11-15 / 3-4 / 6-8): Assess remaining work, create checkpoint if >30% remaining
- **Red** (16+ / 5+ / 9+): STOP immediately, create checkpoint handoff
