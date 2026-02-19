# `@beep/repo-utils`

Effect-based monorepo utilities for repository analysis and workspace management.

## Quick Start

```typescript
import { Effect } from "effect"
import { NodeFileSystem, NodePath } from "@effect/platform-node"
import {
  FsUtils, FsUtilsLive, findRepoRoot, resolveWorkspaceDirs,
  buildRepoDependencyIndex, topologicalSort
} from "@beep/repo-utils"

const program = Effect.gen(function* () {
  const root = yield* findRepoRoot()
  const workspaces = yield* resolveWorkspaceDirs(root)
  const depIndex = yield* buildRepoDependencyIndex(root)
  const buildOrder = yield* topologicalSort(/* adjacency list */)
  return { root, workspaces, depIndex, buildOrder }
}).pipe(
  Effect.provide(FsUtilsLive),
  Effect.provide([NodeFileSystem.layer, NodePath.layer])
)
```

## Modules

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| **FsUtils** | `FsUtils`, `FsUtilsLive` | glob, readJson, writeJson, modifyFile, existsOrThrow |
| **Root** | `findRepoRoot` | Walk upward for `.git`/`bun.lock` markers |
| **Workspaces** | `resolveWorkspaceDirs` | Expand workspace globs to `HashMap<name, dir>` |
| **Dependencies** | `extractWorkspaceDependencies` | Classify deps as workspace vs NPM |
| **DependencyIndex** | `buildRepoDependencyIndex` | Full `HashMap<pkg, TypedDeps>` for monorepo |
| **UniqueDeps** | `collectUniqueNpmDependencies` | Union all NPM deps across packages |
| **Graph** | `topologicalSort`, `detectCycles`, `computeTransitiveClosure` | Dependency graph analysis |
| **TsConfig** | `collectTsConfigPaths` | Find all tsconfig files per workspace |
| **PackageJson** | `PackageJson`, `decodePackageJson` | Type-safe package.json schema |

## Installation

Private workspace package:

```json
{
  "dependencies": {
    "@beep/repo-utils": "workspace:*"
  }
}
```

## Scripts

```bash
bun run check     # Type check
npx vitest run    # Run tests (NOT bun test)
bun run build     # Compile + pure annotations
bun run docgen    # Generate API docs
```

## License

MIT
