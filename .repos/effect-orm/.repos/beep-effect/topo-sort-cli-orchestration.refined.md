---
name: topo-sort-cli-orchestration
version: 2
created: 2025-01-23T00:00:00Z
iterations: 1
---

# Topological Sort CLI Command - Refined Orchestration Prompt

## Context

You are operating within the `beep-effect` monorepo, a Bun-managed Effect-first TypeScript project. The monorepo contains approximately 40 internal packages under `packages/` and `tooling/` directories, each with its own `package.json` declaring dependencies on other internal `@beep/*` packages.

### Current State

The repository has existing tooling infrastructure:

| Component | Location | Purpose |
|-----------|----------|---------|
| Repository CLI | `tooling/cli/` | Bun-based CLI using `@effect/cli` |
| Tooling Utilities | `tooling/utils/` | Workspace discovery, dependency extraction |
| Dependency Index | `tooling/utils/src/repo/DependencyIndex.ts` | Builds HashMap of package → dependencies |
| Workspace Resolver | `tooling/utils/src/repo/Workspaces.ts` | Maps package names to filesystem paths |
| Dependency Extractor | `tooling/utils/src/repo/Dependencies.ts` | Extracts `@beep/*` deps from package.json |

### Problem Statement

The `tsconfig-auditor` agent system needs to process packages in topological order (packages with fewer dependencies first) to ensure correct sequential processing. Currently, no CLI command exists to output this ordering.

### Relevant Files

```
tooling/cli/src/index.ts                    # CLI entry point, command registration
tooling/cli/src/commands/sync.ts            # Example subcommand pattern
tooling/cli/src/commands/env.ts             # Example subcommand pattern
tooling/utils/src/repo/DependencyIndex.ts   # buildRepoDependencyIndex function
tooling/utils/src/repo/Dependencies.ts      # extractWorkspaceDependencies function
tooling/utils/src/repo/Workspaces.ts        # resolveWorkspaceDirs function
tooling/utils/src/schemas/PackageJson.ts    # PackageJson schema
tooling/utils/src/FsUtils.ts                # Filesystem utilities
```

## Objective

Create a new CLI subcommand `bun run beep topo-sort` that outputs all internal `@beep/*` packages in **topological order** (packages with no/fewer internal dependencies listed first).

### Success Criteria

1. Command executes via `bun run beep topo-sort`
2. Output lists one `@beep/*` package name per line
3. Packages appear only after all their internal dependencies have appeared
4. Circular dependencies are detected and reported as errors
5. The synthetic `@beep/root` package is excluded from output
6. Code passes `bun run check --filter=@beep/cli`
7. Code passes `bun run lint --filter=@beep/cli`

### Measurable Outcomes

| Outcome | Verification |
|---------|--------------|
| Leaf packages appear first | `@beep/types`, `@beep/invariant`, `@beep/identity` in first ~5 lines |
| Dependencies before dependents | `@beep/schema` appears before `@beep/iam-client` |
| All packages included | Output line count ≈ number of packages (minus @beep/root) |
| No cycles | Command exits 0 (or exits 1 with clear cycle error message) |

### Scope Boundaries

**In Scope:**
- Implementing `bun run beep topo-sort` CLI command
- Kahn's algorithm for topological sorting
- Cycle detection with clear error messages
- Integration with existing `@beep/tooling-utils` utilities
- Console output of package names (one per line)

**Out of Scope (do NOT implement):**
- Modifying existing packages' package.json or tsconfig files
- Creating a visual dependency graph or tree output
- Integrating with CI/CD pipelines
- Adding new dependencies to the monorepo
- Implementing package version management
- Creating a web UI or interactive mode

## Role

You are **Claude 4.5 Opus**, an expert software architect orchestrating a multi-agent research and implementation workflow. You specialize in:

- **Effect-TS** - Deep knowledge of Effect ecosystem, idioms, and best practices
- **Graph Algorithms** - Topological sorting, cycle detection, dependency analysis
- **Monorepo Architecture** - Workspace management, cross-package dependencies
- **Agent Orchestration** - Sequential deployment of specialized sub-agents

You delegate research tasks to `effect-researcher` sub-agents (Sonnet) and synthesize the research agent findings into a cohesive implementation plan before coding.

## Constraints

### Effect-First Requirements

All code MUST follow Effect idioms. Reference `EFFECT_CONSTRAINTS.md` for complete list.

| Category | Forbidden | Required |
|----------|-----------|----------|
| Arrays | `.map()`, `.filter()`, `.reduce()` | `A.map`, `A.filter`, `A.reduce` via `F.pipe` |
| Strings | `.split()`, `.trim()`, `.includes()` | `Str.split`, `Str.trim`, `Str.includes` |
| Control Flow | `switch`, long if-else chains | `Match.value().pipe()` with `Match.exhaustive` |
| Async | `async/await`, `try/catch` | `Effect.gen`, `Effect.tryPromise` |
| Errors | `throw new Error()` | `Schema.TaggedError` |
| Collections | `Map`, `Set`, native arrays | `HashMap`, `HashSet`, `SortedSet` from `effect` |
| Iteration | `for...of`, `.forEach()` | `A.forEach`, `Effect.forEach` |

### Import Conventions

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Match from "effect/Match";
```

### Package Boundaries

- Use `@beep/*` path aliases exclusively (never relative `../` paths to other packages)
- Import from `@beep/tooling-utils` for repository utilities
- New code belongs in `tooling/cli/src/commands/topo-sort.ts`

### Algorithm Requirements

- Use **Kahn's algorithm** for topological sorting
- Detect circular dependencies and fail with descriptive error
- Only consider `@beep/*` internal dependencies (ignore npm packages)
- Use `Ref` for mutable state within the algorithm
- Use `HashMap` for adjacency list representation
- Use `HashSet` for in-degree tracking

## Resources

### Files to Read

| File | Purpose |
|------|---------|
| `tooling/cli/src/index.ts` | Understand command registration pattern |
| `tooling/cli/src/commands/sync.ts` | Reference subcommand implementation |
| `tooling/utils/src/repo/DependencyIndex.ts` | Use `buildRepoDependencyIndex` |
| `tooling/utils/src/repo/Dependencies.ts` | Understand dependency extraction |
| `tooling/utils/src/schemas/PackageJson.ts` | Understand schema structures |
| `node_modules/effect/src/SortedSet.ts` | Research SortedSet API |
| `node_modules/effect/src/HashMap.ts` | Research HashMap API |
| `node_modules/effect/src/Ref.ts` | Research Ref for mutable state |

### Documentation to Consult

Use MCP tools `mcp__effect_docs__effect_docs_search` and `mcp__effect_docs__get_effect_doc` for:

- `effect/SortedSet` - Ordered set with custom comparator
- `effect/Order` - Defining custom orderings
- `effect/Ref` - Mutable references in Effect
- `effect/HashMap` - Hash-based map operations
- `@effect/cli` - CLI command definition patterns

### AGENTS.md Files

| Package | Path |
|---------|------|
| CLI | `tooling/cli/AGENTS.md` |
| Utils | `tooling/utils/AGENTS.md` |
| Root | `AGENTS.md` (contains Effect constraints) |

## Output Specification

### Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| CLI Command | `tooling/cli/src/commands/topo-sort.ts` | Main implementation |
| Registration | `tooling/cli/src/index.ts` | Import and register command |
| (Optional) Utility | `tooling/utils/src/repo/TopologicalSort.ts` | Reusable sort algorithm |

### Command Structure

```typescript
// tooling/cli/src/commands/topo-sort.ts
import * as CliCommand from "@effect/cli/Command";
import * as Effect from "effect/Effect";

export const topoSortCommand = CliCommand.make("topo-sort").pipe(
  CliCommand.withDescription("Output packages in topological order (least dependencies first)"),
  CliCommand.withHandler(() =>
    Effect.gen(function* () {
      // Implementation
    })
  )
);
```

### Expected Output Format

```
@beep/types
@beep/invariant
@beep/identity
@beep/testkit
@beep/utils
@beep/schema
@beep/errors
@beep/constants
@beep/contract
...
```

### Optional Flags (stretch goal)

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON array |
| `--with-count` | Show dependency count: `@beep/types (0)` |
| `--reverse` | Most dependencies first |

### Expected Error Output (Circular Dependency)

```
Error: Circular dependency detected

The following packages form a dependency cycle:
  - @beep/package-a
  - @beep/package-b
  - @beep/package-c

Unable to determine topological order. Please resolve the circular dependency.
```

Exit code: 1

## Examples

### Example 1: Kahn's Algorithm with Effect

```typescript
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";

class CyclicDependencyError extends S.TaggedError<CyclicDependencyError>()(
  "CyclicDependencyError",
  { packages: S.Array(S.String) }
) {}

const topologicalSort = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<Array<string>, CyclicDependencyError> =>
  Effect.gen(function* () {
    // Compute in-degrees
    const inDegree = yield* Ref.make(HashMap.empty<string, number>());
    const queue = yield* Ref.make<Array<string>>([]);
    const result = yield* Ref.make<Array<string>>([]);

    // Initialize in-degrees to 0 for all nodes
    yield* Effect.forEach(HashMap.keys(adjacencyList), (node) =>
      Ref.update(inDegree, HashMap.set(node, 0))
    );

    // Count incoming edges
    yield* Effect.forEach(HashMap.values(adjacencyList), (deps) =>
      Effect.forEach(deps, (dep) =>
        Ref.update(inDegree, (map) =>
          F.pipe(
            HashMap.get(map, dep),
            O.map((n) => HashMap.set(map, dep, n + 1)),
            O.getOrElse(() => map)
          )
        )
      )
    );

    // Enqueue nodes with in-degree 0
    const degrees = yield* Ref.get(inDegree);
    yield* Effect.forEach(HashMap.entries(degrees), ([node, degree]) =>
      degree === 0
        ? Ref.update(queue, A.append(node))
        : Effect.void
    );

    // Process queue (Kahn's algorithm)
    yield* Effect.whileLoop({
      while: Ref.get(queue).pipe(Effect.map(A.isNonEmptyArray)),
      body: () =>
        Effect.gen(function* () {
          const q = yield* Ref.get(queue);
          const node = F.pipe(q, A.head, O.getOrThrow);
          yield* Ref.set(queue, F.pipe(q, A.drop(1)));
          yield* Ref.update(result, A.append(node));

          const neighbors = F.pipe(
            HashMap.get(adjacencyList, node),
            O.getOrElse(() => HashSet.empty<string>())
          );

          yield* Effect.forEach(neighbors, (neighbor) =>
            Effect.gen(function* () {
              yield* Ref.update(inDegree, (map) =>
                F.pipe(
                  HashMap.get(map, neighbor),
                  O.map((n) => HashMap.set(map, neighbor, n - 1)),
                  O.getOrElse(() => map)
                )
              );
              const newDegree = yield* Ref.get(inDegree).pipe(
                Effect.map((m) => F.pipe(HashMap.get(m, neighbor), O.getOrElse(() => 0)))
              );
              if (newDegree === 0) {
                yield* Ref.update(queue, A.append(neighbor));
              }
            })
          );
        }),
      step: () => Effect.void,
    });

    const sorted = yield* Ref.get(result);
    const allNodes = F.pipe(adjacencyList, HashMap.keys, A.fromIterable);

    if (A.length(sorted) !== A.length(allNodes)) {
      return yield* new CyclicDependencyError({
        packages: F.pipe(
          allNodes,
          A.filter((n) => !F.pipe(sorted, A.contains(n)))
        ),
      });
    }

    return sorted;
  });
```

### Example 2: Building Adjacency List from Dependency Index

```typescript
const buildAdjacencyList = Effect.gen(function* () {
  const depIndex = yield* buildRepoDependencyIndex;

  let adjacency = HashMap.empty<string, HashSet.HashSet<string>>();

  yield* Effect.forEach(HashMap.entries(depIndex), ([pkg, deps]) =>
    Effect.sync(() => {
      if (pkg === "@beep/root") return; // Skip synthetic root

      const workspaceDeps = F.pipe(
        deps.dependencies.workspace,
        HashSet.union(deps.devDependencies.workspace)
      );

      adjacency = HashMap.set(adjacency, pkg, workspaceDeps);
    })
  );

  return adjacency;
});
```

## Verification Checklist

### Code Quality
- [ ] No `async/await` or bare Promises anywhere
- [ ] No native Array methods (`.map()`, `.filter()`, etc.)
- [ ] No native String methods (`.split()`, `.trim()`, etc.)
- [ ] No `switch` statements or long if-else chains
- [ ] All errors use `Schema.TaggedError`
- [ ] All imports use `@beep/*` aliases or `effect/*` namespaces

### Functionality
- [ ] `bun run beep topo-sort` executes without error
- [ ] Output lists all internal packages (excluding @beep/root)
- [ ] Packages appear only after their dependencies
- [ ] Circular dependencies produce clear error message
- [ ] Exit code 0 on success, non-zero on failure

### Build & Lint
- [ ] `bun run check --filter=@beep/cli` passes
- [ ] `bun run lint --filter=@beep/cli` passes

### Integration
- [ ] Command registered in `tooling/cli/src/index.ts`
- [ ] Command appears in `bun run beep --help`

---

## Agent Deployment Strategy

Deploy `effect-researcher` agents **sequentially** with explicit research prompts:

### Phase 1: Tooling Utilities Research
```
Prompt: "Research tooling/utils dependency utilities. Document:
1. buildRepoDependencyIndex - return type, data structure
2. extractWorkspaceDependencies - how @beep/* deps are identified
3. resolveWorkspaceDirs - package name to path mapping
4. Schemas in tooling/utils/src/schemas/ for package.json
Output: Research report with API signatures and usage patterns."
```

### Phase 2: Effect Graph Algorithm Research
```
Prompt: "Research Effect patterns for topological sorting. Document:
1. effect/SortedSet - creation, ordering, conversion to Array
2. effect/Order - custom ordering definition
3. effect/Ref - mutable state patterns
4. Kahn's algorithm implementation using Effect.gen, Ref, HashMap
Output: Research report with complete code sketches."
```

### Phase 3: @effect/cli Patterns Research
```
Prompt: "Research @effect/cli command patterns. Document:
1. How subcommands are registered in tooling/cli/src/index.ts
2. Command handler patterns from existing commands
3. Console output patterns for printing lists
4. Layer composition for FsUtils and other services
Output: Research report with command template code."
```

### Phase 4: Implementation Design
```
Prompt: "Synthesize research into implementation plan. Produce:
1. File structure (new files, modifications)
2. Algorithm design using Kahn's with Effect primitives
3. Complete code structure for topo-sort.ts
4. Integration steps for command registration
5. Error handling for circular dependencies"
```

### Phase 5: Implementation
Execute implementation based on synthesized design.

---

## Metadata

### Research Sources
- Files: `tooling/cli/src/`, `tooling/utils/src/repo/`
- Documentation: Effect SortedSet, HashMap, Ref, @effect/cli
- Packages: `@beep/tooling-utils`, `@beep/cli`

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial | N/A |
| 1 | CL-5: Missing scope boundaries, PE-7: No error output example, CL-1: Minor pronoun ambiguity | Added "Scope Boundaries" section with In/Out of Scope, Added "Expected Error Output" section, Fixed "their findings" → "research agent findings" |
