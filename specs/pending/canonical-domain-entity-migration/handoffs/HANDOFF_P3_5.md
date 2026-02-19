# Phase 3.5 Handoff: Quality Gate — Discovery, Research, Fix Loop

## Phase 3 Summary

Phase 3 migrated 14 entities (8 Shared + 6 Documents) to the canonical pattern using a 4-agent swarm. All entities were scaffolded correctly BUT:

- **`@beep/shared-domain` build fails** — `tsc -b tsconfig.build.json` produces at least 2 known errors
- **All downstream packages cascade-fail** — shared-server, documents-server, iam-server, iam-domain, documents-domain, iam-client depend on shared-domain:build
- **167 uncommitted working tree fixes exist** — import path corrections, lint formatting, barrel path fixes from the previous session's cleanup pass; these were never committed and may NOT fully resolve all issues
- **There may be additional undiscovered issues** — only `build` was tested; `check`, `test`, `lint:fix`, and `lint` have NOT been verified

### Key Phase 3 Learnings (from REFLECTION_LOG.md)

1. **Barrel file contention** — two agents updating the same `index.ts` caused partial updates; old lowercase paths survived
2. **Agent turn exhaustion on Document entity** — 13 custom methods exceeded agent turn budget
3. **`rm -rf` universally denied** — cleanup needed `bypassPermissions` mode
4. **Single barrel owner rule** — orchestrator must update barrels AFTER all agents complete

---

## Why Phase 3.5 Exists

Phase 4 (Knowledge slice: 19 entities, 46 custom methods) depends on `@beep/shared-domain` building cleanly. All 5 quality gates must pass before Phase 4 can begin:

| Gate | Command | Status |
|------|---------|--------|
| build | `bunx turbo run build --filter @beep/shared-domain --force` | FAILING |
| check | `bun run check --filter @beep/shared-domain` | passing (tsgo) |
| test | `bun run test --filter @beep/shared-domain` | UNKNOWN |
| lint:fix | `bunx turbo run lint:fix --filter @beep/shared-domain` | UNKNOWN |
| lint | `bunx turbo run lint --filter @beep/shared-domain` | UNKNOWN |

---

## Known Issues (from prior analysis — inventory may reveal more)

### Issue A: `ListPaginated.contract.ts` — GET payload constraint (BUILD)

**File**: `packages/shared/domain/src/entities/File/contracts/ListPaginated.contract.ts`
**Error**: `TS2345: Argument of type 'typeof Payload' is not assignable to "'GET' payload must be encodeable to strings"`

The `Payload` class has `offset: S.NonNegativeInt` and `limit: S.NonNegativeInt`. These encode to `number`, but `HttpApiEndpoint.get()` requires all payload fields to encode to `string` (for URL query parameters).

**Research needed**: What is the correct `@effect/platform` pattern for GET endpoints with numeric query parameters? Check `.repos/effect/` source and Effect docs MCP.

### Issue B: `UploadSession.errors.ts` — Module resolution (BUILD)

**File**: `packages/shared/domain/src/entities/UploadSession/UploadSession.errors.ts`
**Error**: `TS2307: Cannot find module '../../File' or its corresponding type declarations`

The committed code has `import * as File from "../file"` (lowercase, deleted directory). The working tree fixes it to `import * as File from "../../File"`, but `tsc -b` still fails — possibly cascading from Issue A.

**Research needed**: Is this independent or a cascade? Does `tsc -b` with `moduleResolution: "bundler"` resolve directory barrel imports differently than `tsgo`?

### Issue C: Additional working tree changes (UNKNOWN gates)

167 modified files include lint formatting, import reordering, barrel export ordering changes. These have NOT been tested against `test`, `lint:fix`, or `lint` gates. The discovery step may reveal additional issues.

---

## Approach: Discovery → Research → Fix Loop

Phase 3.5 uses a methodical 4-step loop instead of prescriptive fixes:

### Step 1: DISCOVER
Run all 5 gates, capture every error, produce a structured issue inventory.

### Step 2: RESEARCH
For each issue, sub-agents research the correct fix using:
- **Effect docs MCP** (`effect_docs_search`, `get_effect_doc`)
- **Effect source code** (`.repos/effect/packages/`)
- **Working canonical entities** in this repo (Page, Comment contracts)

Each research agent produces a solution document with before/after code and evidence.

### Step 3: FIX
Sub-agents apply the solution documents. No improvisation — follow the researched fix exactly.

### Step 4: VERIFY
Re-run all gates. If new errors appear, loop back. Circuit breaker at 3 iterations.

Full orchestrator prompt: `handoffs/P3_5_ORCHESTRATOR_PROMPT.md`

---

## Working Tree State

### Modified files (~167) — already applied, need commit

| Change Category | Approximate Count | Description |
|----------------|-------------------|-------------|
| Import path case fixes | ~20 | `../../file` → `../../File`, `../../folder` → `../../Folder`, `../file` → `../File` |
| Barrel path fixes | 3 | `./file` → `./File`, `./folder` → `./Folder`, `./upload-session` → `./UploadSession` in shared barrel |
| Lint formatting | ~130 | Multi-line `S.Union(...)` → single lines, import reordering, trailing comma removal |
| Barrel export ordering | ~15 | `Errors` export moved before `Tool` export for consistency |
| Documentation | 3 | `REFLECTION_LOG.md`, `canonical-domain-entity.md`, `PermissionMatrix.ts` |
| Schema/dependency | 4 | `@beep/schema` Temperature.ts, string-literal-kit.ts, `bun.lock`, `package.json` |

### Untracked files (2) — need `git add`

| File | Description |
|------|-------------|
| `specs/.../handoffs/HANDOFF_P4.md` | Phase 4 handoff document |
| `specs/.../handoffs/P4_ORCHESTRATOR_PROMPT.md` | Phase 4 orchestrator prompt |

---

## Research Resources

| Resource | How to Access | What It Contains |
|----------|---------------|------------------|
| Effect docs MCP | `mcp__effect_docs__effect_docs_search` / `mcp__effect_docs__get_effect_doc` | Official API documentation |
| Effect source | `.repos/effect/packages/platform/src/HttpApiEndpoint.ts` | Implementation of GET payload constraints |
| Effect Schema source | `.repos/effect/packages/effect/src/Schema.ts` | NumberFromString, int(), nonNegative() |
| Canonical Page entity | `packages/documents/domain/src/entities/Page/contracts/` | 16 working contracts including GET endpoints |
| Canonical Comment entity | `packages/documents/domain/src/entities/Comment/` | 5 contracts, full canonical reference |
| tsconfig.build.json | `packages/shared/domain/tsconfig.build.json` | Build config (composite, outDir, moduleResolution) |
| tsconfig.src.json | `packages/shared/domain/tsconfig.src.json` | Source config (rootDir, bundler resolution) |

---

## Output Artifacts

Phase 3.5 produces:

| File | Location |
|------|----------|
| Issue Inventory | `specs/.../outputs/P3_5_ISSUE_INVENTORY.md` |
| Solution Documents | `specs/.../outputs/P3_5_SOLUTION_*.md` |
| Verification Log | `specs/.../outputs/P3_5_VERIFICATION_LOG.md` |
| REFLECTION_LOG entry | `specs/.../REFLECTION_LOG.md` (Phase 3.5 section) |

---

## Success Criteria

1. All 5 gates pass for `@beep/shared-domain` (build, check, test, lint:fix, lint)
2. All 6 domain packages pass `check`
3. All 4 downstream consumer packages pass `check`
4. Issue inventory, solution docs, and verification log written to `outputs/`
5. Single commit with all fixes + documentation
6. REFLECTION_LOG updated with Phase 3.5 entry

---

## Gotchas

1. **Working directory may be wrong** — previous session `cd`'d into `packages/shared/domain/`. Always use full paths or `git -C <repo-root>`.
2. **`tsgo` vs `tsc -b` divergence** — check (tsgo) passes but build (tsc -b) fails. The build step is stricter about `HttpApiEndpoint.get()` payload types.
3. **Turbo cache** — use `--force` to bypass stale build artifacts after file modifications.
4. **`bun.lock` and `package.json` changes** — from a dependency update in the previous session; include in commit.
5. **`@beep/schema` lint errors are pre-existing** — do NOT fix these; they're upstream and unrelated.
