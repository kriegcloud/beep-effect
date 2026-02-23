# Phase 2 Orchestrator Prompt: Planning

Copy-paste this prompt to start Phase 2 (Planning).

---

## Prompt

You are executing Phase 2 (Planning) of the TypeScript Native Preview Port spec for the `beep-effect` monorepo. You are working on branch `native-preview-experiment`.

### Context

Phase 1 (Discovery) has been completed. The discovery report is at:
`specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md`

Read that file first. It contains:
- The installed tsgo version
- A complete inventory of all `tsc` invocations across the repo
- A list of all TypeScript JS API consumers (ts-morph, effect-language-service, etc.)
- Flag compatibility results (which tsconfig flags tsgo accepts/rejects)
- Test results from running tsgo on a leaf package and an Effect-heavy package
- A feasibility assessment recommending STRICT, HYBRID, CHECK-ONLY, or NOT FEASIBLE

Also read the research summary for background:
`specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md`

### Your Mission

Create a detailed, ordered migration plan based on the P1 findings. This plan will be executed in Phase 3.

**Task 1: Decide the migration path**

Read the P1 feasibility assessment. Apply this decision tree:

```
1. Can tsgo emit JS + declarations for a leaf package?
   YES -> Continue to step 2
   NO  -> PATH = "check-only"

2. Can tsgo emit JS + declarations for an Effect-heavy package?
   YES -> Continue to step 3
   NO  -> PATH = "check-only"

3. Does tsgo accept all tsconfig flags, or can rejected flags be safely removed/changed?
   YES -> Continue to step 4
   NO  -> PATH = "check-only"

4. Can the `typescript` package be fully removed?
   YES -> PATH = "strict"
   NO  -> PATH = "hybrid"
```

Document your choice and the specific evidence from P1 that led to it.

**Task 2: Identify required tsconfig changes**

If tsgo rejected any flags in P1:

For each rejected flag:
1. Is the flag needed for correctness? (e.g., `strict` -- yes; `preserveWatchOutput` -- no)
2. Can it be safely removed from `tsconfig.base.jsonc` without breaking tsc compatibility?
3. Does it need to be split into tsgo-specific and tsc-specific configs?
4. What is the concrete change needed?

Document each flag change as a before/after diff.

**Task 3: Create the package migration order**

Using the P1 inventory of `tsc` invocations, create an ordered list of packages to migrate. The order must be:

1. **Leaf packages first** (no downstream consumers): `@beep/types`, `@beep/constants`, `@beep/invariant`
2. **Common foundation**: `@beep/utils`, `@beep/schema`, `@beep/identity`, `@beep/wrap`, `@beep/errors`
3. **Shared layer**: `@beep/shared-domain`, `@beep/shared-tables`, `@beep/shared-server`, `@beep/shared-client`, `@beep/shared-ui`, `@beep/shared-env`, `@beep/shared-ai`
4. **Slice packages**: All `@beep/iam-*`, `@beep/documents-*`, `@beep/calendar-*`, `@beep/customization-*`, `@beep/comms-*`, `@beep/knowledge-*`
5. **UI packages**: `@beep/ui-core`, `@beep/ui-editor`, `@beep/ui-spreadsheet`
6. **Runtime and apps**: `@beep/runtime-server`, `@beep/runtime-client`, apps
7. **Tooling**: `@beep/build-utils`, `@beep/testkit`, `@beep/repo-scripts` (special handling for `@beep/repo-cli` if it uses tsc directly)

For each package, specify:
- Package name
- Scripts to modify (check, build-esm, dev)
- The exact before/after for each script
- Any package-specific concerns

**Task 4: Plan for blockers**

Based on P1 findings:

**ts-morph** (`tooling/cli`):
- This package MUST keep `typescript` in devDependencies
- ts-morph uses the TypeScript JavaScript API at runtime
- tsgo does not provide a JS API
- Decision: keep `tsc` for `tooling/cli` build scripts, OR use tsgo for check only

**effect-language-service patch** (root `prepare` script):
- This patches tsserver, which is part of the `typescript` package
- The `typescript` package must remain in root devDependencies
- The `prepare` script does not need to change

**@effect/docgen**:
- If used, it requires the TypeScript JS API
- Check if any package uses `docgen` scripts
- If so, `typescript` must remain

**Decision**: Document which packages are EXCLUDED from migration and why.

**Task 5: Define acceptance criteria**

For each package in the migration order:
```bash
bun run check --filter @beep/<package>    # Must exit 0
bun run build --filter @beep/<package>    # Must exit 0
bun run test --filter @beep/<package>     # Must exit 0
```

For the full repo (after all packages are migrated):
```bash
bun run build      # Must exit 0
bun run check      # Must exit 0
bun run lint:fix   # Must exit 0
bun run lint       # Must exit 0
bun run test       # Must exit 0
```

**Task 6: Define rollback procedure**

Document how to undo the migration at any point:
- Per-package rollback (revert single package.json)
- Full rollback (revert all changes)
- Script-level rollback (sed replacement)

**Task 7: Write the migration plan**

Compile all of the above into `specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md`.

### Output

Write your plan to `specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md` with the following structure:

```markdown
# P2 Migration Plan

## Migration Path
- **Chosen path**: STRICT / HYBRID / CHECK-ONLY
- **Rationale**: ...
- **Evidence from P1**: ...

## tsconfig Changes
| Flag | Current | Change | Reason |
|------|---------|--------|--------|
| ... | ... | ... | ... |

## Package Migration Order
### Tier 1: Leaf Packages
| # | Package | Scripts to Change | Before | After |
|---|---------|-------------------|--------|-------|
| 1 | @beep/types | check, build-esm, dev | tsc -b ... | tsgo -b ... |
| ... | ... | ... | ... | ... |

### Tier 2: Common Foundation
(same table format)

... (through Tier 7)

## Excluded Packages
| Package | Reason | Scripts Kept |
|---------|--------|-------------|
| @beep/repo-cli | ts-morph dependency | tsc for all scripts |

## Per-Package Acceptance Criteria
(standard 3-command verification)

## Full Repo Acceptance Criteria
(standard 5-command verification)

## Rollback Procedure
(per-package and full rollback)

## Estimated Effort
- Total packages to migrate: N
- Estimated time per package: ~2 minutes (script edit + verify)
- Total estimated time: ~X minutes
- Can batch if all packages use identical pattern: YES/NO
```

### Verification

Before considering P2 complete:

```bash
# The plan file exists and is non-empty
wc -l specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md
```

### Success Criteria

- [ ] Migration path chosen with clear rationale linked to P1 evidence
- [ ] tsconfig changes identified (if any) with before/after diffs
- [ ] Complete, ordered package migration list (all packages that use `tsc`)
- [ ] Each package has specific script changes documented
- [ ] Excluded packages identified with reasons
- [ ] Per-package acceptance criteria defined
- [ ] Full repo acceptance criteria defined
- [ ] Rollback procedure documented
- [ ] Effort estimate provided
- [ ] `outputs/P2_MIGRATION_PLAN.md` created and complete

### Reference Files

- P1 discovery report: `specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md`
- P0 research summary: `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md`
- Master orchestration: `specs/pending/typescript-native-preview-port/MASTER_ORCHESTRATION.md`
- Root tsconfig: `tsconfig.base.jsonc`
- Build tsconfig: `tsconfig.build.json`
- Example package.json: `packages/common/types/package.json`
- Root package.json: `package.json`

### Next Phase

After completing Phase 2, the next agent session will execute the migration plan (Phase 3). Your migration plan document is the primary input. It must be precise enough for an agent to follow mechanically -- every script change, every package, every verification step.
