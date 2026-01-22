# Phase 5 Orchestrator Prompt: Expected Files Generation

> Copy this entire prompt into a new Claude session to execute Phase 5.

---

## Context

You are executing **Phase 5** of the `tsconfig-sync-completion` spec. This is a **pre-validation phase** where you will create "expected" output files that represent the correct result of running the `tsconfig-sync` command.

These expected files will be used in Phase 6 (Ralph Wiggum Validation Loop) to verify the command produces correct output.

---

## Pre-requisites

Read and internalize these documents:

1. **Handoff Document**: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P5.md`
2. **Requirements Reference**: `specs/tsconfig-sync-completion/outputs/REQUIREMENTS.md`
3. **Parent Spec**: `specs/tsconfig-sync-command/README.md` (archived, but contains detailed requirements)

---

## Mission

Create expected output files for all 59 packages (excluding marketing) in the repository.

### Output Structure

```
specs/tsconfig-sync-completion/outputs/
├── REQUIREMENTS.md                    # Already exists
├── packages/
│   └── {slice}/{layer}/expected/
│       ├── tsconfig.build.json
│       ├── tsconfig.src.json
│       ├── tsconfig.test.json
│       └── package.json
├── tooling/
│   └── {package}/expected/
│       └── ...
└── apps/
    └── {app}/expected/
        └── ...
```

---

## Execution Steps

### Step 1: Get topo-sorted package list

```bash
bun run repo-cli topo-sort
```

### Step 2: Build adjacency list for transitive closure computation

Read all `package.json` files to build a dependency graph. You'll need this to compute transitive dependencies.

### Step 3: Process each package (in topo-sort order)

For each package:

1. **Read current package.json** to get direct `@beep/*` dependencies
2. **Compute transitive closure** of all `@beep/*` dependencies using the adjacency list
3. **Read current tsconfig files** to understand structure (extends, compilerOptions, include, exclude)
4. **Generate expected files** following REQUIREMENTS.md exactly:
   - `tsconfig.build.json` - With root-relative, topo-sorted references
   - `tsconfig.src.json` - Same refs with `.src.json` suffix
   - `tsconfig.test.json` - Same refs with `.test.json` suffix
   - `package.json` - With sorted dependencies (topo + alpha)

### Step 4: Handle Next.js apps specially

For `apps/web` and `apps/todox`:

1. **Compute transitive deps** for ALL direct `@beep/*` dependencies
2. **Exclude tooling packages** from paths/refs (except `@beep/testkit`)
3. **Generate path aliases** for ALL transitive deps
4. **Generate references** for ALL transitive deps
5. Save to `tsconfig.json` (not just build.json)

### Step 5: Validate expected files

Before completing, verify:
- [ ] All 59 packages have expected directories
- [ ] All JSON files are valid
- [ ] References match REQUIREMENTS.md format
- [ ] Next.js apps have transitive path aliases

---

## Key Reference Calculations

### Root-Relative Path Formula

```
from_depth = count "/" in package relative path
prefix = "../" repeated (from_depth) times
reference = prefix + target_package_path + "/tsconfig.build.json"
```

**Example**: `packages/iam/server` (depth=3) referencing `packages/common/schema`:
```
"../../../packages/common/schema/tsconfig.build.json"
```

### Topological Sort Order

Use the output of `bun run repo-cli topo-sort`. Packages earlier in the list are dependencies of packages later in the list.

### Transitive Closure

If package A depends on B, and B depends on C, then:
- A's references include B AND C
- A's references are sorted: C before B (topo order)

---

## Package Type Detection

| Pattern | Type | Files to Generate |
|---------|------|-------------------|
| `packages/*/*` | Regular package | build, src, test, package.json |
| `tooling/*` | Tooling package | build, src, test, package.json |
| `apps/web`, `apps/todox` | Next.js app | tsconfig.json, package.json |
| `apps/server` | Backend app | build, src, test, package.json |
| `apps/marketing` | **SKIP** | N/A |

---

## Important Notes

1. **Do NOT run tsconfig-sync** - This phase creates expected files manually based on spec
2. **Preserve existing structure** - Only change references/paths/deps, keep extends/compilerOptions/etc.
3. **Use REQUIREMENTS.md as source of truth** for all format decisions
4. **Ask questions** if any requirement is ambiguous
5. **Validate JSON** before writing files

---

## Completion Checklist

Before marking P5 complete:

- [ ] All 59 package directories created in outputs/
- [ ] All expected/*.json files are valid JSON/JSONC
- [ ] tsconfig references use root-relative paths
- [ ] tsconfig references are topologically sorted
- [ ] Next.js apps have transitive path aliases
- [ ] Tooling packages excluded from app configs
- [ ] package.json deps sorted (workspace topo, external alpha)
- [ ] All @beep/* use workspace:^
- [ ] All external deps use catalog:
- [ ] Spot-checked 5+ packages against REQUIREMENTS.md

---

## Handoff to P6

After completing P5, Phase 6 can begin. P6 uses the Ralph Wiggum plugin to:

1. Run `tsconfig-sync` on each package
2. Copy actual results to `outputs/<path>/actual/`
3. Compare actual vs expected
4. Fix bugs if discrepancies found
5. Repeat until all packages pass

---

## Questions?

If you encounter ambiguous requirements or edge cases, consult:
1. `specs/tsconfig-sync-completion/outputs/REQUIREMENTS.md`
2. `specs/tsconfig-sync-command/README.md` (archived parent spec)
3. Ask the user for clarification

Good luck!
