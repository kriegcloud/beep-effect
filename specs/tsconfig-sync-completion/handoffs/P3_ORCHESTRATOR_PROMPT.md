# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the `tsconfig-sync-completion` spec: **Comprehensive Testing**.

### Context

P2 refactored the handler into modular functions. P3 adds comprehensive tests for each module. Current test coverage is minimal (schema validation only).

### Your Mission

Create test files for the extracted modules:

| Test File | Module | Tests Needed |
|-----------|--------|--------------|
| `discover.test.ts` | Workspace discovery | 5+ |
| `references.test.ts` | Reference computation | 5+ |
| `package-sync.test.ts` | Package.json sync | 5+ |
| `integration.test.ts` | Full workflow | 3+ |

### Critical Patterns

**Use @beep/testkit, not bun:test**:
```typescript
// CORRECT
import { effect, layer, strictEqual } from "@beep/testkit";

effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* functionUnderTest();
    strictEqual(result, expected);
  })
);

// WRONG - Never do this
import { test } from "bun:test";
test("name", async () => {
  await Effect.runPromise(...);
});
```

**Test pure functions first**, then Effects:
```typescript
// Pure function test
effect("normalizeReferencePaths converts relative to root-relative", () =>
  Effect.gen(function* () {
    const result = normalizeReferencePaths(["../types/tsconfig.build.json"], pkgDir, context);
    strictEqual(result[0].startsWith("../../../"), true);
  })
);
```

### Reference Files

- `specs/tsconfig-sync-completion/handoffs/HANDOFF_P3.md` - Full test plan
- `.claude/commands/patterns/effect-testing-patterns.md` - Testing patterns
- `tooling/testkit/AGENTS.md` - Testkit usage guide

### Verification

```bash
bun run test --filter @beep/repo-cli
bun run lint --filter @beep/repo-cli
```

### Success Criteria

- [ ] `discover.test.ts` with 5+ tests
- [ ] `references.test.ts` with 5+ tests
- [ ] `package-sync.test.ts` with 5+ tests
- [ ] `integration.test.ts` with 3+ tests
- [ ] All tests pass
- [ ] No skipped tests (except intentional)

### Handoff Document

Read full test specifications in: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P3.md`
