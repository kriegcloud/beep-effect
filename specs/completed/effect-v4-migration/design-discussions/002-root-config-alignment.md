# Root Configuration Alignment with effect-smol

**Date:** 2026-02-19
**Status:** ✅ Completed

## Summary

Aligned beep-effect2 root configuration files with effect-smol patterns while maintaining:
- **Bun** as package manager (instead of pnpm)
- **Turbo** for root-level build orchestration
- **Biome** for linting/formatting (instead of oxlint + dprint)

## Files Created/Updated

### ✅ Created Files

1. **`tsconfig.base.json`**
   - Base TypeScript configuration for all packages
   - Uses `${configDir}` for flexible paths (works with Bun)
   - Adapted from effect-smol with Bun-specific tweaks
   - Includes `@effect/language-service` plugin with `@beep/*` namespace imports

2. **`tsconfig.packages.json`**
   - Project references for package builds
   - Currently references: `groking-effect-v4`, `tooling/utils`
   - Ready to add `tooling/cli` when we create `@beep/repo-cli`

3. **`vitest.shared.ts`**
   - Shared Vitest configuration for all packages
   - Includes setup for concurrent test execution
   - Configured with vite-tsconfig-paths for path aliases
   - Coverage with v8 provider

4. **`vitest.setup.ts`**
   - Vitest setup file using `@effect/vitest`
   - Adds Effect equality testers

### ✅ Updated Files

1. **`tsconfig.json`**
   - Root TypeScript configuration
   - References `tsconfig.packages.json`
   - Includes test files and config files
   - Path aliases for workspace packages (`@beep/*`)
   - Types: `["node", "bun"]` for Bun compatibility

2. **`vitest.config.ts`**
   - Root workspace test configuration
   - Projects pattern matching effect-smol
   - Bun-specific exclusions when running with Bun

3. **`package.json`**
   - Updated `workspaces` to include: `scratchpad`, `packages/*`, `tooling/*`, `apps/*`
   - Added to devDependencies catalog:
     - `@effect/language-service: ^0.73.1`
     - `@vitest/coverage-v8: 4.0.18`
     - `vite-tsconfig-paths: ^6.0.5`

## Key Differences from effect-smol

| Aspect | effect-smol | beep-effect2 |
|--------|-------------|--------------|
| Package Manager | pnpm 10.17.1 | Bun 1.3.9 |
| Workspace Config | `pnpm-workspace.yaml` | `package.json` workspaces field |
| Build Orchestration | pnpm scripts | Turbo + package scripts |
| Linting | oxlint + dprint | Biome |
| Formatting | dprint | Biome |
| Module System | NodeNext | NodeNext (same) |
| TypeScript | 5.9.3 | 5.9.3 (same) |

## Configuration Hierarchy

```
tsconfig.base.json (base config)
    ↓
tsconfig.packages.json (package references)
    ↓
tsconfig.json (root + tests)
    ↓
[package]/tsconfig.json (extends base)
```

## Vitest Hierarchy

```
vitest.shared.ts (shared config)
    ↓
vitest.config.ts (workspace projects)
    ↓
[package]/vitest.config.ts (extends shared)
```

## Old Files to Clean Up

These files are from the previous configuration and should be removed:

1. **`tsconfig.base.jsonc`** - Old base config (replaced by `tsconfig.base.json`)
2. **`tsconfig.build.json`** - Old build config (replaced by `tsconfig.packages.json`)
3. **`tsconfig.slices/`** directory - Old reference organization (replaced by direct references)

## Next Steps

1. ✅ Root configs aligned with effect-smol
2. ⏭️ Clean up old config files (optional)
3. ⏭️ Install new dependencies: `bun install`
4. ⏭️ Create `@beep/repo-cli` package in `tooling/cli`
5. ⏭️ Implement `create-package` command

## Package-Level Config Pattern (for new packages)

Each package will have:

```
package/
├── package.json
├── tsconfig.json (extends ../../tsconfig.base.json)
├── vitest.config.ts (extends ../../vitest.shared.ts)
├── src/
│   └── index.ts
└── test/
    └── index.test.ts
```

**Standard `package.json` scripts:**
```json
{
  "scripts": {
    "codegen": "effect-utils codegen",
    "build": "tsc -b tsconfig.json && bun run babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage"
  }
}
```

## Notes

- `${configDir}` is a TypeScript compiler feature (5.5+) that works with any runtime
- Bun supports the same workspace patterns as pnpm
- Package scripts will match effect-smol, Turbo is only at root level
- Biome provides same functionality as oxlint + dprint but simpler
