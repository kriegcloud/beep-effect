# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `tsconfig-sync-completion` spec: **Handler Refactoring**.

### Context

P1 added package.json sync to the handler. The handler is now ~850+ LOC with mixed concerns. P2 extracts modular, testable functions.

### Your Mission

Refactor `handler.ts` from ~850 LOC to < 300 LOC by extracting:

| Module | Purpose | Lines to Extract |
|--------|---------|------------------|
| `discover.ts` | Workspace discovery | 369-430 |
| `references.ts` | Reference path computation | 462-640 |
| `package-sync.ts` | Package.json sync | P1 additions |
| `tsconfig-sync.ts` | tsconfig file sync | 654-738 |
| `types.ts` | Shared types | New |

### Critical Patterns

**Extract, don't change logic**:
```typescript
// BEFORE (in handler.ts)
const packages = yield* findWorkspacePackages();
const adjacencyList = yield* buildAdjacencyList(packages);

// AFTER (handler.ts calls discover.ts)
import { discoverWorkspace, WorkspaceContext } from "./discover";
const context = yield* discoverWorkspace;
```

**Pass context, don't use globals**:
```typescript
// Define shared context type
export interface WorkspaceContext {
  readonly packages: readonly string[];
  readonly adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>;
  readonly tsconfigPaths: HashMap.HashMap<string, readonly string[]>;
  readonly pkgDirMap: HashMap.HashMap<string, string>;
  readonly repoRoot: string;
}
```

**One extraction at a time**:
1. Extract `discover.ts` → run tests
2. Extract `references.ts` → run tests
3. Extract `package-sync.ts` → run tests
4. Extract `tsconfig-sync.ts` → run tests

### Reference Files

- `tooling/cli/src/commands/tsconfig-sync/handler.ts` - Source to refactor
- `specs/tsconfig-sync-completion/handoffs/HANDOFF_P2.md` - Full extraction plan

### Verification

After each extraction:
```bash
bun run lint --filter @beep/repo-cli
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
bun run repo-cli tsconfig-sync --check
```

### Success Criteria

- [ ] `handler.ts` < 300 LOC
- [ ] `discover.ts` created with workspace discovery
- [ ] `references.ts` created with reference computation
- [ ] `package-sync.ts` created with package.json sync
- [ ] `tsconfig-sync.ts` created with tsconfig sync
- [ ] `types.ts` created with shared types
- [ ] All tests pass
- [ ] Lint passes
- [ ] `--check` mode works unchanged

### Handoff Document

Read full extraction plan in: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P2.md`
