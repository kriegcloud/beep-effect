# Phase 3.5 Orchestrator Prompt: Quality Gate — Discovery, Research, Fix Loop

You are orchestrating Phase 3.5 of the canonical-domain-entity-migration spec. This is a quality gate phase: NO new entity migration — only fix existing issues until all gates pass.

## Context

- **Branch**: `canonical-slice-domains`
- **Last commit**: `7f9eed3633 entity consistency` — has build-breaking errors in committed code
- **Working tree**: ~167 modified files (import path fixes, lint formatting, documentation from previous session) + 2 untracked P4 handoff docs — these are partial fixes that were never committed and may NOT fully resolve all issues
- **Repo root**: `/home/elpresidank/YeeBois/projects/beep-effect3`

## Quality Gates (ALL must pass for Phase 3.5 to be complete)

```
Gate 1: build    → bunx turbo run build --filter @beep/shared-domain --force
Gate 2: check    → bun run check --filter @beep/shared-domain
Gate 3: test     → bun run test --filter @beep/shared-domain
Gate 4: lint:fix → bunx turbo run lint:fix --filter @beep/shared-domain
Gate 5: lint     → bunx turbo run lint --filter @beep/shared-domain
```

After shared-domain passes all gates, downstream packages must also pass `check`:
- `@beep/iam-domain`, `@beep/documents-domain`, `@beep/calendar-domain`, `@beep/comms-domain`, `@beep/customization-domain`
- `@beep/iam-client`, `@beep/iam-server`, `@beep/shared-server`, `@beep/documents-server`

### Pre-existing failures (IGNORE — not caused by this migration)

- `@beep/schema` lint: 2 biome errors (upstream)
- `@beep/knowledge-server` tests: 32 PromptTemplates failures + 2 type errors (TestLayers.ts, GmailExtractionAdapter.test.ts)

---

## Execution Loop

Repeat this 4-step cycle until all gates pass:

### Step 1: DISCOVER — Inventory All Issues

Spawn parallel `package-error-fixer` or `Bash` agents to run every gate and capture ALL errors:

```bash
# Run all 5 gates, capture output
bunx turbo run build --filter @beep/shared-domain --force 2>&1 | tee /tmp/p3.5-build.log
bun run check --filter @beep/shared-domain 2>&1 | tee /tmp/p3.5-check.log
bun run test --filter @beep/shared-domain 2>&1 | tee /tmp/p3.5-test.log
bunx turbo run lint:fix --filter @beep/shared-domain 2>&1 | tee /tmp/p3.5-lintfix.log
bunx turbo run lint --filter @beep/shared-domain 2>&1 | tee /tmp/p3.5-lint.log
```

Produce an **Issue Inventory** — a structured list of every distinct error with:
- Gate that caught it (build / check / test / lint)
- File path and line number
- Error code and message
- Whether it's pre-existing (ignore) or migration-caused (fix)

Write the inventory to: `specs/pending/canonical-domain-entity-migration/outputs/P3_5_ISSUE_INVENTORY.md`

### Step 2: RESEARCH — Find Correct Fixes

For each issue in the inventory, spawn `mcp-researcher` or `effect-expert` agents to research the correct fix. Agents should:

1. **Read the failing source file** to understand the full context
2. **Search Effect documentation** via the `effect_docs` MCP tools (`mcp__effect_docs__effect_docs_search`, `mcp__effect_docs__get_effect_doc`) for the relevant API
3. **Search `.repos/effect/` source code** via Grep/Read for canonical usage examples:
   - `.repos/effect/packages/platform/src/` — HttpApiEndpoint patterns
   - `.repos/effect/packages/effect/src/Schema.ts` — Schema combinators
   - `.repos/effect/packages/sql/src/Model.ts` — Model patterns
4. **Check existing canonical entities** in this repo that already work:
   - `packages/documents/domain/src/entities/Page/contracts/` — working GET contracts
   - `packages/documents/domain/src/entities/Comment/` — full canonical reference

Each research agent produces a **Solution Document** written to:
`specs/pending/canonical-domain-entity-migration/outputs/P3_5_SOLUTION_<issue-id>.md`

Each solution document must contain:
- The exact error being fixed
- The root cause explanation
- The researched fix with code (before → after)
- Evidence (link to Effect source or docs that confirms the approach)
- Any downstream impact to verify

### Step 3: FIX — Apply Solutions

Spawn `general-purpose` agents (or a single `package-error-fixer` agent) to apply all solution documents:

- Each agent reads its assigned solution document(s)
- Applies the exact code changes described
- Does NOT improvise beyond what the solution specifies
- Reports what files were modified

**Critical rules for fix agents:**
- NEVER modify files outside `packages/` (no .claude/, no specs/)
- ALWAYS use the Edit tool, never Write (to avoid overwriting unrelated changes)
- If a solution document is ambiguous, STOP and ask rather than guess
- After applying fixes, run `bunx turbo run lint:fix --filter @beep/shared-domain` to auto-format

### Step 4: VERIFY — Re-run All Gates

Re-run all 5 gates from Step 1. Compare output to the previous iteration:

- If ALL gates pass → proceed to commit (exit loop)
- If NEW errors appeared → add them to the inventory and loop back to Step 2
- If SAME errors persist → the solution was wrong; research again with more context
- If error count decreased → progress is being made; continue loop

**Circuit breaker**: If 3 full loops complete without all gates passing, STOP and produce a diagnostic report listing remaining issues with everything attempted. Do not loop indefinitely.

---

## Post-Loop: Commit & Downstream Verification

Once all 5 gates pass for `@beep/shared-domain`:

### Downstream Check

Run parallel checks on all downstream packages:

```bash
# Domain packages
bun run check --filter @beep/iam-domain
bun run check --filter @beep/documents-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
bun run check --filter @beep/customization-domain

# Consumer packages
bun run check --filter @beep/iam-client
bun run check --filter @beep/iam-server
bun run check --filter @beep/shared-server
bun run check --filter @beep/documents-server
```

If any downstream package fails with migration-related errors, add those to the inventory and loop again.

### Commit

Stage and commit all changes:

```bash
# Stage source code fixes
git add packages/

# Stage documentation
git add .claude/skills/canonical-domain-entity.md
git add specs/pending/canonical-domain-entity-migration/

# Stage dependency files
git add bun.lock package.json

# DO NOT stage: .claude/.hook-state.json, .claude/.telemetry/

git commit -m "$(cat <<'EOF'
fix(shared-domain): quality gate pass for Phase 3 entity migration

- Fix all build, check, test, and lint errors introduced by Phase 3
- Fix import paths: lowercase → PascalCase for renamed entity directories
- Apply lint auto-formatting across all domain packages
- Add Phase 3 reflection entry and Phase 4 handoff documents

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Final Verification

```bash
git status --short
# Expected: only .claude internal files

bunx turbo run build --filter @beep/shared-domain --force 2>&1 | tail -3
# Expected: all tasks successful
```

---

## Known Issues to Expect

These are issues identified from the previous session's analysis. The discovery step may find more.

### Build Error: `ListPaginated.contract.ts` — GET payload constraint

`HttpApiEndpoint.get()` requires payload fields to be string-encodeable. The `Payload` class has `S.NonNegativeInt` fields (offset, limit) which encode to `number`, not `string`. Research the correct `@effect/platform` pattern for GET payloads with numeric query parameters.

**Research pointers:**
- `.repos/effect/packages/platform/src/HttpApiEndpoint.ts` — search for "encodeable to strings" constraint
- `packages/documents/domain/src/entities/Page/contracts/List.contract.ts` — working GET endpoint with pagination (may have same issue or different approach)
- Effect docs: search for `HttpApiEndpoint.get` payload requirements

### Build Error: `UploadSession.errors.ts` — Module resolution

`import * as File from "../../File"` fails under `tsc -b` (composite project build) but passes under `tsgo --noEmit`. May cascade from the ListPaginated error preventing File module compilation. Research whether this is independent or cascading.

**Research pointers:**
- Check if `File/index.ts` barrel can be resolved by `tsc -b` with `moduleResolution: "bundler"`
- Check for stale build artifacts in `packages/shared/domain/build/` from before the directory rename

---

## Research Resources

### Effect MCP Documentation
- Use `mcp__effect_docs__effect_docs_search` to search Effect documentation
- Use `mcp__effect_docs__get_effect_doc` to fetch specific doc pages

### Effect Source Code (local)
- `.repos/effect/packages/platform/` — HttpApiEndpoint, HttpApiGroup, HttpApi
- `.repos/effect/packages/effect/src/Schema.ts` — Schema module (NumberFromString, etc.)
- `.repos/effect/packages/sql/` — Model, SqlClient patterns

### Canonical Reference Entities
- `packages/documents/domain/src/entities/Comment/` — 5 contracts, full canonical pattern
- `packages/documents/domain/src/entities/Page/` — 16 contracts, GET endpoints with search/list

---

## Output Artifacts

Phase 3.5 should produce these files in `specs/pending/canonical-domain-entity-migration/outputs/`:

| File | Description |
|------|-------------|
| `P3_5_ISSUE_INVENTORY.md` | Complete inventory of all issues found |
| `P3_5_SOLUTION_*.md` | One solution document per distinct issue (or grouped) |
| `P3_5_VERIFICATION_LOG.md` | Log of each gate run with pass/fail per iteration |

These artifacts serve as evidence that the quality gate was passed methodically, and feed into the REFLECTION_LOG for future phases.

---

## Success Criteria

- [ ] Gate 1 (build): `bunx turbo run build --filter @beep/shared-domain --force` passes
- [ ] Gate 2 (check): `bun run check --filter @beep/shared-domain` passes
- [ ] Gate 3 (test): `bun run test --filter @beep/shared-domain` passes
- [ ] Gate 4 (lint:fix): `bunx turbo run lint:fix --filter @beep/shared-domain` passes
- [ ] Gate 5 (lint): `bunx turbo run lint --filter @beep/shared-domain` passes
- [ ] All 6 domain packages pass `check`
- [ ] All 4 downstream consumer packages pass `check`
- [ ] Issue inventory, solution docs, and verification log written to `outputs/`
- [ ] Single commit with all fixes
- [ ] REFLECTION_LOG updated with Phase 3.5 entry
