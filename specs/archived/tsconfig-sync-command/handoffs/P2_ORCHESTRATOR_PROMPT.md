# Phase 2 Orchestrator Prompt: tsconfig-sync Tests & File Writing

> Copy-paste this prompt to start Phase 2 implementation

---

## Context

You are implementing **Phase 2** of the `tsconfig-sync` command for `@beep/repo-cli`.

**Phase 1 is complete**. The command structure exists with:
- Command definition with 5 options (`--check`, `--dry-run`, `--filter`, `--no-hoist`, `--verbose`)
- Handler that computes expected state using P0b utilities
- Input schemas and error classes

**Phase 2 mission**: Add file writing and tests.

---

## Phase 1 Files (Already Exist)

```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts      # Command definition
├── handler.ts    # Orchestration (needs file writing added)
├── schemas.ts    # TsconfigSyncInput, getSyncMode
└── errors.ts     # DriftDetectedError, TsconfigSyncError
```

---

## Phase 2 Deliverables

### 2.1 Writer Utilities

Create utilities for file writing:

```
tooling/cli/src/commands/tsconfig-sync/utils/
├── tsconfig-writer.ts     # Write tsconfig.build.json references
└── package-json-writer.ts # Write sorted package.json deps
```

### 2.2 Handler Updates

Update `handler.ts` to call writers in sync mode:
- Write tsconfig references using `writeTsconfigReferences`
- Write package.json dependencies using `writePackageJsonDeps`
- Only write when `mode === "sync"` (not check/dry-run)

### 2.3 Tests

Create Effect-based tests:

```
tooling/cli/test/commands/tsconfig-sync/
├── handler.test.ts  # Integration tests
└── utils.test.ts    # Unit tests for writers
```

---

## Critical Patterns

### Effect FileSystem (REQUIRED)

NEVER use Node.js `fs`. ALWAYS use Effect FileSystem:

```typescript
import { FileSystem } from "@effect/platform";

const fs = yield* FileSystem.FileSystem;
yield* fs.readFileString(path);
yield* fs.writeFileString(path, content);
```

### jsonc-parser for tsconfig (REQUIRED)

Use `jsonc-parser` to preserve comments:

```typescript
import * as jsonc from "jsonc-parser";

const edits = jsonc.modify(content, ["references"], newRefs, {
  formattingOptions: { tabSize: 2, insertSpaces: true },
});
const newContent = jsonc.applyEdits(content, edits);
```

### Testing Pattern (REQUIRED)

Use `@beep/testkit`, NEVER raw `bun:test`:

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

layer(TestLayer, { timeout: Duration.seconds(30) })("suite", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      const result = yield* someEffect();
      strictEqual(result, expected);
    })
  );
});
```

---

## Reference Files

Read these for patterns:

1. **jsonc-parser usage**: `tooling/cli/src/commands/create-slice/utils/config-updater.ts`
2. **Test patterns**: `tooling/testkit/AGENTS.md`
3. **Handler structure**: `tooling/cli/src/commands/tsconfig-sync/handler.ts`
4. **Effect patterns**: `.claude/rules/effect-patterns.md`

---

## Implementation Order

1. **Read** `handler.ts` to understand current state
2. **Create** `utils/tsconfig-writer.ts` with `writeTsconfigReferences`
3. **Create** `utils/package-json-writer.ts` with `writePackageJsonDeps`
4. **Update** `handler.ts` to use writers in sync mode
5. **Create** `test/commands/tsconfig-sync/handler.test.ts`
6. **Create** `test/commands/tsconfig-sync/utils.test.ts`
7. **Verify** all tests pass

---

## Verification

After each step:

```bash
# Type check
bun run check --filter @beep/repo-cli

# Lint
bun run lint --filter @beep/repo-cli

# Test
bun run test --filter @beep/repo-cli
```

Final verification:

```bash
# Dry run (should show changes)
bun run repo-cli tsconfig-sync --dry-run

# Check mode (should detect drift or pass)
bun run repo-cli tsconfig-sync --check

# Sync mode (should write files)
bun run repo-cli tsconfig-sync

# Verify sync worked
bun run repo-cli tsconfig-sync --check  # Should pass now
```

---

## Success Criteria

- [ ] `writeTsconfigReferences` preserves comments in tsconfig files
- [ ] `writePackageJsonDeps` writes sorted dependencies
- [ ] Handler writes files only in sync mode
- [ ] Tests cover: drift detection, filtering, dry-run, cycle detection
- [ ] `bun run test --filter @beep/repo-cli` passes
- [ ] `bun run repo-cli tsconfig-sync --check` validates correctly

---

## Handoff Documents

- **Phase 1 completion**: `specs/tsconfig-sync-command/handoffs/HANDOFF_P1.md`
- **Phase 2 context**: `specs/tsconfig-sync-command/handoffs/HANDOFF_P2.md`
- **Spec overview**: `specs/tsconfig-sync-command/README.md`

---

## Start

Begin by reading the current handler implementation:

```
tooling/cli/src/commands/tsconfig-sync/handler.ts
```

Then read the jsonc-parser pattern from:

```
tooling/cli/src/commands/create-slice/utils/config-updater.ts
```
