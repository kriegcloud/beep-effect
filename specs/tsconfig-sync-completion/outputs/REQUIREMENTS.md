# tsconfig-sync Requirements Reference

> Synthesized requirements document for validating tsconfig-sync command output.

---

## Overview

The `tsconfig-sync` command synchronizes TypeScript configuration files and package.json dependencies across the monorepo. This document defines the **exact expected output** for each file type to enable validation.

---

## Package Types

### 1. Regular Packages (`packages/*/*`)

**Files synced:**
- `tsconfig.build.json` - Production build configuration
- `tsconfig.src.json` - Source files configuration
- `tsconfig.test.json` - Test files configuration
- `package.json` - Dependency declarations

### 2. Next.js Apps (`apps/{web,todox}`)

**Files synced:**
- `tsconfig.json` - Main TypeScript configuration with path aliases
- `tsconfig.build.json` - Build configuration (if exists)
- `tsconfig.test.json` - Test configuration (if exists)
- `package.json` - Dependency declarations

**Note:** `apps/marketing` is excluded (static site with no `@beep/*` dependencies).

### 3. Tooling Packages (`tooling/*`)

Same as regular packages. Tooling packages ARE synced for their own configs, but are EXCLUDED from Next.js app path aliases (except `@beep/testkit`).

**Tooling packages excluded from app configs:**
- `@beep/build-utils`
- `@beep/repo-cli`
- `@beep/tooling-utils`
- `@beep/repo-scripts`

---

## tsconfig.build.json Requirements

### Structure

```json
{
  "extends": "../../tsconfig.base.jsonc",
  "compilerOptions": {
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["./src/**/*.ts"],
  "exclude": ["./test/**/*.ts"],
  "references": [
    { "path": "../../../packages/common/schema/tsconfig.build.json" },
    { "path": "../../../packages/shared/domain/tsconfig.build.json" }
  ]
}
```

### Reference Rules

1. **Root-relative paths**: All reference paths use root-relative format
   - Start with `../` repeated to reach repo root
   - Then full path from root: `packages/slice/layer/tsconfig.build.json`

2. **Path calculation formula**:
   ```
   depth = count of "/" in relative path from repo root
   prefix = "../" repeated (depth) times
   reference = prefix + target_package_path + "/tsconfig.build.json"
   ```

   **Example**: `packages/calendar/server/tsconfig.build.json` (depth=3)
   - Reference to `packages/common/schema`: `../../../packages/common/schema/tsconfig.build.json`

3. **Topological sorting**: References ordered by dependency (deps before dependents)
   - Leaf packages first (e.g., `@beep/invariant`, `@beep/types`)
   - Higher-level packages later (e.g., `@beep/schema` after `@beep/invariant`)
   - Use topo-sort order for workspace packages

4. **Only `@beep/*` packages**: Third-party deps don't generate references

5. **Transitive closure**: Include ALL transitive `@beep/*` dependencies
   - If A depends on B, and B depends on C, then A's references include B AND C

---

## tsconfig.src.json Requirements

### Structure

```json
{
  "extends": "./tsconfig.build.json",
  "references": [
    { "path": "../../../packages/common/schema/tsconfig.src.json" },
    { "path": "../../../packages/shared/domain/tsconfig.src.json" }
  ]
}
```

### Rules

1. **Same references as build** but with `.src.json` suffix
2. If reference target has no `tsconfig.src.json`, omit that reference (graceful skip)
3. Topological order preserved

---

## tsconfig.test.json Requirements

### Structure

```json
{
  "extends": "./tsconfig.build.json",
  "compilerOptions": {
    "rootDir": "."
  },
  "include": ["./src/**/*.ts", "./test/**/*.ts"],
  "references": [
    { "path": "../../../packages/common/schema/tsconfig.test.json" },
    { "path": "../../../packages/shared/domain/tsconfig.test.json" }
  ]
}
```

### Rules

1. **Same references as build** but with `.test.json` suffix
2. If reference target has no `tsconfig.test.json`, omit that reference
3. Topological order preserved

---

## Next.js App tsconfig.json Requirements

### Structure

```json
{
  "extends": "../../tsconfig.base.jsonc",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"],
      "@beep/schema": ["../../packages/common/schema/src/index.ts"],
      "@beep/schema/*": ["../../packages/common/schema/src/*"],
      "@beep/shared-domain": ["../../packages/shared/domain/src/index.ts"],
      "@beep/shared-domain/*": ["../../packages/shared/domain/src/*"]
    }
  },
  "references": [
    { "path": "../../packages/common/schema/tsconfig.build.json" },
    { "path": "../../packages/shared/domain/tsconfig.build.json" }
  ],
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Path Alias Rules

1. **Format**: Two entries per package
   ```json
   "@beep/package-name": ["../../path/to/package/src/index.ts"],
   "@beep/package-name/*": ["../../path/to/package/src/*"]
   ```

2. **Relative paths**: From app directory to package
   - `apps/web` → `packages/common/schema` = `../../packages/common/schema/src/`

3. **CRITICAL: Include transitive dependencies**
   - If app depends on `@beep/documents-server`
   - And `@beep/documents-server` depends on `@beep/documents-domain`
   - App MUST have path aliases for BOTH packages

4. **Exclude tooling packages**: Don't add paths for:
   - `@beep/build-utils`
   - `@beep/repo-cli`
   - `@beep/tooling-utils`
   - `@beep/repo-scripts`

5. **Alphabetical ordering**: Path aliases sorted alphabetically by package name

### Reference Rules (Next.js Apps)

1. **Use build config suffix**: `tsconfig.build.json` (not `.src.json` or `.test.json`)
2. **Include transitive deps**: Same set as path aliases
3. **Topological order**: Dependencies before dependents
4. **Relative paths**: From app directory (depth = 2 for `apps/web`)

---

## package.json Requirements

### Dependency Sorting Order

1. **Workspace packages (`@beep/*`)**: Sorted topologically
   - Dependencies before dependents
   - Uses same order as `topo-sort` command output

2. **External packages**: Sorted alphabetically (case-insensitive)
   - `drizzle-orm` before `effect` before `zod`

3. **Combined order**: Workspace packages FIRST, then external packages

### Version Specifier Enforcement

| Package Type | Required Specifier |
|--------------|-------------------|
| `@beep/*` (workspace) | `workspace:^` |
| External (in catalog) | `catalog:` |

### Sections Affected

All three dependency sections follow the same rules:
- `dependencies`
- `devDependencies`
- `peerDependencies`

### Example

**Before (unsorted):**
```json
{
  "dependencies": {
    "effect": "catalog:",
    "@beep/schema": "workspace:^",
    "@beep/invariant": "workspace:^",
    "drizzle-orm": "catalog:"
  }
}
```

**After (sorted):**
```json
{
  "dependencies": {
    "@beep/invariant": "workspace:^",
    "@beep/schema": "workspace:^",
    "drizzle-orm": "catalog:",
    "effect": "catalog:"
  }
}
```

(Note: `@beep/invariant` before `@beep/schema` because invariant is a dependency of schema in the topo-sort order)

---

## Transitive Dependency Hoisting

### Rules

1. **Scope**: Peer dependencies of direct dependencies are hoisted
2. **Recursion**: Fully recursive (A→B→C means A gets all C's peer deps)
3. **Destination**: Hoisted to both `peerDependencies` AND `devDependencies`
4. **Specifiers preserved**: Maintain `workspace:^` or `catalog:` format

### Example

If `@beep/documents-server` depends on `@beep/schema`, and `@beep/schema` has:
```json
{
  "peerDependencies": {
    "@beep/invariant": "workspace:^",
    "effect": "catalog:"
  }
}
```

Then `@beep/documents-server` should have:
```json
{
  "peerDependencies": {
    "@beep/invariant": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:"
  },
  "devDependencies": {
    "@beep/invariant": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:"
  }
}
```

---

## Topological Sort Reference

The canonical package order (from `bun run repo-cli topo-sort`):

```
@beep/calendar-client
@beep/calendar-ui
@beep/comms-client
@beep/comms-ui
@beep/customization-client
@beep/customization-ui
@beep/documents-client
@beep/documents-ui
@beep/identity
@beep/invariant
@beep/knowledge-client
@beep/knowledge-ui
@beep/testkit
@beep/tooling-utils
@beep/types
@beep/build-utils
@beep/utils
@beep/schema
@beep/constants
@beep/repo-cli
@beep/ui-core
@beep/wrap
@beep/errors
@beep/repo-scripts
@beep/shared-domain
@beep/calendar-domain
@beep/comms-domain
@beep/customization-domain
@beep/documents-domain
@beep/iam-domain
@beep/knowledge-domain
@beep/shared-env
@beep/shared-server
@beep/shared-tables
@beep/ui
@beep/calendar-tables
@beep/comms-tables
@beep/customization-tables
@beep/documents-tables
@beep/iam-tables
@beep/knowledge-tables
@beep/shared-ai
@beep/runtime-client
@beep/ui-editor
@beep/calendar-server
@beep/comms-server
@beep/customization-server
@beep/documents-server
@beep/iam-server
@beep/knowledge-server
@beep/shared-client
@beep/db-admin
@beep/runtime-server
@beep/iam-client
@beep/shared-ui
@beep/server
@beep/iam-ui
@beep/todox
@beep/web
```

**Note:** Packages appearing earlier are dependencies of packages appearing later.

---

## Verification Checklist

For each package, verify:

### tsconfig Files

- [ ] `tsconfig.build.json` references match transitive `@beep/*` dependencies
- [ ] References use root-relative paths with correct depth
- [ ] References are topologically sorted
- [ ] `tsconfig.src.json` references mirror build (with `.src.json` suffix)
- [ ] `tsconfig.test.json` references mirror build (with `.test.json` suffix)

### package.json

- [ ] `dependencies` sorted: workspace (topo) then external (alpha)
- [ ] `devDependencies` sorted: workspace (topo) then external (alpha)
- [ ] `peerDependencies` sorted: workspace (topo) then external (alpha)
- [ ] All `@beep/*` use `workspace:^`
- [ ] All external deps use `catalog:`
- [ ] Transitive peer deps are hoisted (if applicable)

### Next.js Apps Only

- [ ] `tsconfig.json` has path aliases for ALL transitive deps
- [ ] Path aliases exclude tooling packages (except testkit)
- [ ] Path aliases sorted alphabetically
- [ ] References include all transitive deps
- [ ] References use build config suffix

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Package has no `@beep/*` deps | Empty references array `[]` |
| Package has no tsconfig.src.json | Skip src references (no error) |
| Package has no tsconfig.test.json | Skip test references (no error) |
| Self-reference (A depends on A) | Skip (don't include self) |
| Circular dependency detected | Command fails with error (before any sync) |
| Missing target tsconfig | Skip reference (graceful degradation) |
| Unknown workspace dep | Treat as external (alphabetical sort) |
| Package in both peer and dev deps | Keep in both (no deduplication across sections) |

---

## File Path Patterns

### Regular Package Paths

```
packages/{slice}/{layer}/
├── package.json
├── tsconfig.build.json
├── tsconfig.src.json
└── tsconfig.test.json
```

Slices: `iam`, `documents`, `calendar`, `knowledge`, `comms`, `customization`, `shared`, `common`, `runtime`, `ui`

Layers: `domain`, `tables`, `server`, `client`, `ui`

### Tooling Package Paths

```
tooling/{package}/
├── package.json
├── tsconfig.build.json
├── tsconfig.src.json
└── tsconfig.test.json
```

Packages: `utils`, `cli`, `build-utils`, `testkit`, `repo-scripts`

### App Paths

```
apps/{app}/
├── package.json
├── tsconfig.json
├── tsconfig.build.json (if exists)
└── tsconfig.test.json (if exists)
```

Apps: `web`, `todox`, `server` (Note: `server` is not a Next.js app)
