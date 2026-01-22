# P0 Orchestrator Prompt: Next.js Transitive Dependency Fix

## Context

You are fixing a CRITICAL bug in the `tsconfig-sync` command. The command generates broken configs for Next.js apps because it only adds path aliases for direct dependencies, not transitive dependencies. Next.js doesn't support TypeScript project references, so it needs explicit path aliases for ALL dependencies.

## Your Task

Implement the fix described in `HANDOFF_P0.md`:

1. Pass `adjacencyList` to `processNextJsApps` function
2. Compute transitive closure for each app's @beep/* dependencies
3. Use transitive deps (not just direct) for path aliases AND references

## Starting Point

Read these files first:
- `specs/tsconfig-sync-completion/handoffs/HANDOFF_P0.md` — detailed implementation plan
- `specs/tsconfig-sync-completion/REFLECTION_LOG.md` — root cause analysis
- `tooling/cli/src/commands/tsconfig-sync/handler.ts` — file to modify (lines 202-354, 743)

## Implementation Steps

1. **Modify function signature** (lines 202-210): Add `adjacencyList` parameter
2. **Add transitive closure** (after line 258): Compute closure for all @beep/* deps
3. **Update path alias loop** (lines 277-285): Use `transitiveDeps` instead of `beepDeps`
4. **Update references loop** (lines 303-309): Use `transitiveDeps` instead of `beepDeps`
5. **Update call site** (line 743): Pass `adjacencyList` to function

## Key Code Changes

```typescript
// After line 258, add:
const transitiveDeps = yield* F.pipe(
  HashSet.toValues(beepDeps),
  Effect.reduce(HashSet.empty<string>(), (acc, dep) =>
    Effect.map(
      computeTransitiveClosure(adjacencyList, dep),
      (closure) => F.pipe(acc, HashSet.add(dep), HashSet.union(closure))
    )
  )
);

// Lines 277-285 and 303-309: Change beepDeps → transitiveDeps
```

## Verification Commands

After implementing, run:

```bash
# 1. Run sync
bun run repo-cli tsconfig-sync --verbose

# 2. CRITICAL: Verify builds pass
bun run build --filter @beep/web
bun run build --filter @beep/todox

# 3. Verify check mode
bun run repo-cli tsconfig-sync --check

# 4. Run tests
bun run test --filter @beep/repo-cli
```

## Success Criteria

- Both Next.js apps build successfully
- `apps/web/tsconfig.json` contains transitive deps like `@beep/shared-tables`
- `--check` mode passes on freshly synced repo
- All existing tests pass

## DO NOT

- Break existing tsconfig sync for regular packages
- Change the sorting algorithm
- Add package.json sync (that's P1)
- Refactor handler (that's P2)

Focus ONLY on fixing the transitive dependency issue for Next.js apps.
