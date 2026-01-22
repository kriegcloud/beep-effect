# Phase 5: Expected Files Generation

> Pre-validation phase for tsconfig-sync command verification.

**Status**: Ready
**Depends On**: P0-P4 Complete
**Followed By**: P6 (Ralph Wiggum Validation Loop)

---

## Objective

Create "expected" output files for each package that represent the **correct** result of running `tsconfig-sync`. These files serve as the ground truth for validating command behavior in Phase 6.

This phase is executed by a **separate session** from the validation loop, ensuring expected files are reviewed and validated against the spec before validation begins.

---

## Scope

### Packages to Process (59 total, excluding marketing)

All packages from `bun run repo-cli topo-sort` output, processed in topological order:

**Leaf packages (no deps):** `@beep/identity`, `@beep/invariant`, `@beep/types`, etc.

**Mid-level packages:** `@beep/schema`, `@beep/shared-domain`, `@beep/iam-domain`, etc.

**High-level packages:** `@beep/iam-server`, `@beep/documents-server`, `@beep/web`, etc.

### Files to Generate Per Package

#### Regular Packages (`packages/*/*`, `tooling/*`)

| File | Contents |
|------|----------|
| `tsconfig.build.json` | Expected references array |
| `tsconfig.src.json` | Expected references array |
| `tsconfig.test.json` | Expected references array |
| `package.json` | Expected sorted dependencies |

#### Next.js Apps (`apps/web`, `apps/todox`)

| File | Contents |
|------|----------|
| `tsconfig.json` | Expected paths + references (transitive) |
| `tsconfig.build.json` | Expected references (if exists) |
| `tsconfig.test.json` | Expected references (if exists) |
| `package.json` | Expected sorted dependencies |

---

## Output Directory Structure

```
specs/tsconfig-sync-completion/outputs/
├── REQUIREMENTS.md                    # Reference document (already created)
├── packages/
│   ├── common/
│   │   ├── schema/
│   │   │   └── expected/
│   │   │       ├── tsconfig.build.json
│   │   │       ├── tsconfig.src.json
│   │   │       ├── tsconfig.test.json
│   │   │       └── package.json
│   │   ├── errors/
│   │   │   └── expected/
│   │   │       └── ...
│   │   └── ...
│   ├── iam/
│   │   ├── domain/
│   │   │   └── expected/...
│   │   ├── tables/
│   │   │   └── expected/...
│   │   └── ...
│   └── ...
├── tooling/
│   ├── cli/
│   │   └── expected/...
│   ├── utils/
│   │   └── expected/...
│   └── ...
└── apps/
    ├── web/
    │   └── expected/
    │       ├── tsconfig.json          # With transitive path aliases
    │       └── package.json
    ├── todox/
    │   └── expected/...
    └── server/
        └── expected/...
```

---

## Workflow

### Step 1: Run topo-sort to get package order

```bash
bun run repo-cli topo-sort
```

This gives the canonical order. Process packages in this order.

### Step 2: For each package, analyze current state

1. **Read `package.json`** to determine direct `@beep/*` dependencies
2. **Compute transitive closure** of all `@beep/*` dependencies
3. **Read current tsconfig files** to understand structure (extends, compilerOptions, etc.)

### Step 3: Generate expected files based on REQUIREMENTS.md

For each package, create expected output files that match the requirements:

1. **tsconfig.build.json**:
   - Extract existing structure (extends, compilerOptions, include, exclude)
   - Compute correct `references` array based on transitive deps
   - Use root-relative paths
   - Sort topologically

2. **tsconfig.src.json / tsconfig.test.json**:
   - Same references with appropriate suffix
   - Skip if file doesn't exist in source

3. **package.json**:
   - Compute sorted `dependencies` (topo + alpha)
   - Compute sorted `devDependencies` (topo + alpha)
   - Compute sorted `peerDependencies` (topo + alpha)
   - Enforce version specifiers (`workspace:^` or `catalog:`)

### Step 4: Validate expected files against REQUIREMENTS.md

Before proceeding to P6, verify each expected file:

- [ ] References use root-relative paths
- [ ] References are topologically sorted
- [ ] Path aliases (for apps) include transitive deps
- [ ] Dependencies sorted correctly
- [ ] Version specifiers enforced

---

## Reference Computation Algorithm

### For Regular Packages

```
1. deps = read @beep/* from package.json (all dep types)
2. transitive = computeTransitiveClosure(adjacencyList, deps)
3. all_deps = union(deps, transitive)
4. sorted_deps = topologicalSort(all_deps)
5. references = sorted_deps.map(dep => {
     target_path = pkgDirMap[dep] + "/tsconfig.build.json"
     return buildRootRelativePath(current_pkg_path, target_path)
   })
```

### For Next.js Apps

```
1. deps = read @beep/* from package.json
2. transitive = computeTransitiveClosure(adjacencyList, deps)
3. all_deps = union(deps, transitive)
4. filtered = all_deps.filter(d => !isToolingPackage(d))  # Exclude tooling
5. sorted_deps = topologicalSort(filtered)
6. paths = sorted_deps.map(dep => buildPathAlias(dep))
7. references = sorted_deps.map(dep => buildReference(dep))
```

---

## Tooling Package Exclusion

Next.js apps should NOT have path aliases or references for these packages:

- `@beep/build-utils`
- `@beep/repo-cli`
- `@beep/tooling-utils`
- `@beep/repo-scripts`

Exception: `@beep/testkit` IS allowed (apps may have tests).

---

## Example: Expected Files for `@beep/iam-server`

### Input: Current package.json dependencies

```json
{
  "dependencies": {
    "@beep/iam-domain": "workspace:^",
    "@beep/iam-tables": "workspace:^",
    "@beep/shared-server": "workspace:^"
  }
}
```

### Computed transitive closure

```
@beep/iam-domain -> @beep/shared-domain -> @beep/schema -> @beep/types, @beep/invariant, ...
@beep/iam-tables -> @beep/iam-domain, @beep/shared-tables, ...
@beep/shared-server -> @beep/shared-domain, @beep/shared-tables, ...
```

### Expected tsconfig.build.json references

```json
{
  "references": [
    { "path": "../../packages/common/invariant/tsconfig.build.json" },
    { "path": "../../packages/common/types/tsconfig.build.json" },
    { "path": "../../packages/common/schema/tsconfig.build.json" },
    { "path": "../../packages/shared/domain/tsconfig.build.json" },
    { "path": "../../packages/shared/tables/tsconfig.build.json" },
    { "path": "../../packages/shared/server/tsconfig.build.json" },
    { "path": "../../packages/iam/domain/tsconfig.build.json" },
    { "path": "../../packages/iam/tables/tsconfig.build.json" }
  ]
}
```

### Expected package.json (sorted)

```json
{
  "dependencies": {
    "@beep/iam-domain": "workspace:^",
    "@beep/iam-tables": "workspace:^",
    "@beep/shared-server": "workspace:^"
  },
  "devDependencies": {
    "@beep/invariant": "workspace:^",
    "@beep/types": "workspace:^",
    "@beep/schema": "workspace:^",
    "@beep/shared-domain": "workspace:^",
    "@beep/shared-tables": "workspace:^",
    "@beep/iam-domain": "workspace:^",
    "@beep/iam-tables": "workspace:^",
    "@beep/shared-server": "workspace:^",
    "effect": "catalog:",
    "drizzle-orm": "catalog:"
  }
}
```

---

## Deliverables

1. **Expected files** in `specs/tsconfig-sync-completion/outputs/<path>/expected/`
   - All 59 packages (excluding marketing)
   - All relevant config files per package type

2. **Verification checklist** (update in REQUIREMENTS.md or separate file)
   - [ ] All packages have expected files
   - [ ] Expected files match REQUIREMENTS.md
   - [ ] Transitive deps correctly computed
   - [ ] Sorting order matches topo-sort

---

## Success Criteria

- [ ] All 59 packages have expected file directories
- [ ] Each expected file is valid JSON/JSONC
- [ ] References use correct root-relative path format
- [ ] References are topologically sorted
- [ ] Next.js apps have transitive path aliases
- [ ] package.json deps sorted (topo + alpha)
- [ ] All `@beep/*` use `workspace:^`
- [ ] All external deps use `catalog:`
- [ ] Expected files reviewed and validated before P6 begins

---

## Notes for Session

1. **Process in topo-sort order** - Start with leaf packages, work up to apps
2. **Use existing package.json as source of truth** for direct dependencies
3. **Don't run tsconfig-sync yet** - This phase creates expected files manually
4. **Reference REQUIREMENTS.md** for all format decisions
5. **Validate expected files** before handing off to P6
