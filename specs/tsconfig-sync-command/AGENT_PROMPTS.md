# tsconfig-sync-command: Agent Prompts

> Copy-paste prompts for delegating to specialized sub-agents.

---

## Agent Selection Guide

| Task | Agent | When to Use |
|------|-------|-------------|
| Source file implementation | `effect-code-writer` | Creating new .ts files |
| Test implementation | `test-writer` | Creating new .test.ts files |
| Handler code review | `code-reviewer` | After handler.ts completion |
| Architecture validation | `architecture-pattern-enforcer` | After Phase 2 completion |

---

## effect-code-writer Prompts

### Phase 1: Command Definition (index.ts)

```
Implement the tsconfig-sync command definition.

Context:
- Spec: specs/tsconfig-sync-command/README.md
- Pattern: tooling/cli/src/commands/create-slice/index.ts
- Template: specs/tsconfig-sync-command/templates/command-handler.template.ts

Requirements:
1. Command name: "tsconfig-sync"
2. Options:
   - --check (boolean): Validate without modifying files
   - --dry-run (boolean): Show changes without applying
   - --filter (optional string): Sync only specified package
   - --no-hoist (boolean): Skip transitive dependency hoisting
   - --verbose (boolean): Show detailed output
3. Use @effect/cli/Command.make
4. Use @effect/cli/Options

Output: tooling/cli/src/commands/tsconfig-sync/index.ts

Verify: bun run check --filter @beep/repo-cli
```

### Phase 1: Handler (handler.ts)

```
Implement the tsconfig-sync handler using @beep/tooling-utils.

Context:
- Spec: specs/tsconfig-sync-command/README.md (Sync Algorithm section)
- **CRITICAL**: specs/tsconfig-sync-command/EXISTING_UTILITIES.md (utilities to use)
- Pattern: tooling/cli/src/commands/create-slice/handler.ts
- Template: specs/tsconfig-sync-command/templates/command-handler.template.ts

Requirements:
1. Effect.gen function accepting HandlerOptions
2. USE EXISTING UTILITIES (do NOT reimplement):
   - `resolveWorkspaceDirs` from @beep/tooling-utils/repo/Workspaces
   - `buildRepoDependencyIndex` from @beep/tooling-utils/repo/DependencyIndex
   - `collectTsConfigPaths` from @beep/tooling-utils/repo/TsConfigIndex
   - `findRepoRoot` from @beep/tooling-utils/repo/Root
3. Stub implementation for what's NEW:
   - Compute transitive closure (from dep index)
   - Cycle detection
   - Diff with actual
   - Apply changes (based on mode)
4. Layer composition with FsUtilsLive from @beep/tooling-utils/FsUtils

Output: tooling/cli/src/commands/tsconfig-sync/handler.ts

Verify: bun run check --filter @beep/repo-cli
```

### Phase 1: Errors (errors.ts)

```
Implement tagged error types for tsconfig-sync.

Context:
- Pattern: tooling/cli/src/commands/create-slice/errors.ts
- Use S.TaggedError from effect/Schema

Required errors:
1. CircularDependencyError { cycles: Array<Array<string>> }
2. DriftDetectedError { driftCount: number, details: string }
3. PackageNotFoundError { packageName: string }
4. InvalidVersionSpecifierError { packageName: string, current: string, expected: string }
5. TsconfigParseError { path: string, message: string }

Output: tooling/cli/src/commands/tsconfig-sync/errors.ts

Verify: bun run check --filter @beep/repo-cli
```

### ~~Phase 1: Workspace Parser~~ (REMOVED - Use Existing Utility)

> **DO NOT IMPLEMENT** - Use `@beep/tooling-utils` instead:
>
> ```typescript
> import { resolveWorkspaceDirs } from "@beep/tooling-utils/repo/Workspaces";
> import { buildRepoDependencyIndex } from "@beep/tooling-utils/repo/DependencyIndex";
>
> const program = Effect.gen(function* () {
>   // HashMap<packageName, absoluteDir>
>   const workspaces = yield* resolveWorkspaceDirs;
>
>   // HashMap<packageName, { dependencies, devDependencies, peerDependencies }>
>   const depIndex = yield* buildRepoDependencyIndex;
> });
> ```
>
> See [EXISTING_UTILITIES.md](./EXISTING_UTILITIES.md) for complete documentation.

### Phase 1: Reference Path Builder (reference-path-builder.ts)

```
Implement root-relative reference path calculation.

Context:
- Spec: specs/tsconfig-sync-command/README.md (Root-Relative Reference Paths section)

Requirements:
1. buildReferencePath(sourcePath: string, targetPath: string): string
   - sourcePath: e.g., "packages/calendar/server/tsconfig.build.json"
   - targetPath: e.g., "packages/calendar/domain/tsconfig.build.json"
   - Returns: "../../../packages/calendar/domain/tsconfig.build.json"
2. Algorithm:
   - Count depth of source from root (number of "/" in path)
   - Prepend "../" × depth
   - Append target path from root
3. Pure function (no Effect needed)

Output: tooling/cli/src/commands/tsconfig-sync/utils/reference-path-builder.ts

Verify: bun run check --filter @beep/repo-cli
```

### Phase 2: Transitive Closure (transitive-closure.ts)

> **NOTE**: Graph building is provided by `buildRepoDependencyIndex`. Only implement transitive closure.

```
Implement transitive closure computation using existing dependency index.

Context:
- Spec: specs/tsconfig-sync-command/README.md (Transitive Dependency Hoisting section)
- EXISTING: @beep/tooling-utils/repo/DependencyIndex (provides buildRepoDependencyIndex)
- Pattern: tooling/cli/src/commands/topo-sort.ts

Requirements:
1. Use buildRepoDependencyIndex for graph data:
   ```typescript
   import { buildRepoDependencyIndex } from "@beep/tooling-utils/repo/DependencyIndex";
   const depIndex = yield* buildRepoDependencyIndex;
   // HashMap<"@beep/pkg", { dependencies, devDependencies, peerDependencies }>
   ```
2. Implement transitive closure:
   - transitiveClose(depIndex: HashMap, packageName: string): Effect<HashSet<string>>
   - Return ALL transitive dependencies (recursive)
3. Implement getAllTransitiveDeps:
   - Returns { workspace: HashSet, npm: HashSet } for a package
   - Includes direct + all transitive deps

Output: tooling/cli/src/commands/tsconfig-sync/utils/transitive-closure.ts

Verify: bun run check --filter @beep/repo-cli
```

### Phase 2: Dependency Sorter (dep-sorter.ts)

```
Implement dependency sorting (topological + alphabetical).

Context:
- Spec: specs/tsconfig-sync-command/README.md (Dependency Sorting Algorithm section)
- Pattern: tooling/cli/src/commands/topo-sort.ts (Kahn's algorithm)

Requirements:
1. sortWorkspaceDeps(deps: Record<string, string>, graph: DependencyGraph): Record<string, string>
   - Topological sort (deps before dependents)
2. sortExternalDeps(deps: Record<string, string>): Record<string, string>
   - Alphabetical sort (case-insensitive)
3. sortAllDeps(deps: Record<string, string>, graph: DependencyGraph): Record<string, string>
   - Workspace first (topological), then external (alphabetical)
   - Preserve version specifiers

Output: tooling/cli/src/commands/tsconfig-sync/utils/dep-sorter.ts

Verify: bun run check --filter @beep/repo-cli
```

---

## test-writer Prompts

### ~~Phase 3: Workspace Parser Tests~~ (REMOVED)

> **NOT NEEDED** - Using `@beep/tooling-utils/repo/Workspaces` which has its own tests.

### Phase 3: Transitive Closure Tests

```
Create tests for transitive-closure.ts.

Context:
- Pattern: Use @beep/testkit (effect, scoped, layer)
- Template: specs/tsconfig-sync-command/templates/command.test.template.ts

Test scenarios:
1. Computes transitive closure (depth 2: A->B->C)
2. Computes transitive closure (depth 3+: A->B->C->D)
3. Handles circular dependencies (reports cycle, doesn't loop)
4. Handles self-references (A depends on A)
5. Separates workspace from external deps correctly
6. Returns empty set for package with no dependencies

Coverage target: 95%

Output: tooling/cli/src/commands/tsconfig-sync/test/transitive-closure.test.ts

Verify: bun run test --filter @beep/repo-cli
```

### Phase 3: Reference Path Builder Tests

```
Create tests for reference-path-builder.ts.

Context:
- Pattern: Use @beep/testkit (effect)
- Pure functions, no Layer needed

Test scenarios:
1. Same-level sibling (../domain)
2. Different slice (../../iam/domain)
3. Deep nesting (depth 4)
4. Root-level package
5. Preserves tsconfig.build.json suffix

Coverage target: 100%

Output: tooling/cli/src/commands/tsconfig-sync/test/reference-path-builder.test.ts

Verify: bun run test --filter @beep/repo-cli
```

---

## code-reviewer Prompts

### Phase 1: Handler Review

```
Review handler.ts for tsconfig-sync command.

Context:
- Spec: specs/tsconfig-sync-command/README.md
- Pattern guidelines: .claude/rules/effect-patterns.md
- Pattern guidelines: .claude/rules/general.md

Check for:
1. Effect patterns (namespace imports, S.TaggedError, etc.)
2. FileSystem service usage (not Node.js fs)
3. Layer composition correctness
4. Error handling completeness
5. Mode handling (check vs dry-run vs sync)

Output: Score (high/medium/low issues) + specific fixes

File: tooling/cli/src/commands/tsconfig-sync/handler.ts
```

### Phase 2: Architecture Review

```
Review tsconfig-sync command architecture.

Context:
- Spec: specs/tsconfig-sync-command/README.md
- Pattern guidelines: .claude/rules/general.md

Check for:
1. Slice boundary violations (no cross-slice imports)
2. Path alias usage (@beep/*)
3. Layer dependency order
4. Service separation (each util as Effect service)
5. Error propagation patterns

Output: Score (high/medium/low issues) + specific fixes

Directory: tooling/cli/src/commands/tsconfig-sync/
```

---

## Delegation Decision Matrix

| Condition | Action |
|-----------|--------|
| Need to implement .ts source file | Delegate to `effect-code-writer` |
| Need to implement .test.ts file | Delegate to `test-writer` |
| Handler implementation complete | Delegate to `code-reviewer` |
| Phase 2 complete | Delegate to `architecture-pattern-enforcer` |
| More than 3 files need review | Batch into single `code-reviewer` call |
| Test coverage insufficient | Delegate to `test-writer` for additional tests |
