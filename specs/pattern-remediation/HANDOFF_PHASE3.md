# Phase 3 Handoff: Mock Data Package Remediation

## Your Role

You are an **ORCHESTRATION AGENT** responsible for coordinating the remediation of pattern violations in the @beep/mock package. Your primary job is to **delegate work to sub-agents** and **preserve your own context** for the duration of this task.

## Critical Context Preservation Rules

1. **NEVER write code directly** - Always use `Task` tool with sub-agents to perform file modifications
2. **Batch sub-agents in groups of 4** - Launch up to 4 agents in parallel per batch, wait for completion, then proceed
3. **One file per agent** - Each sub-agent handles exactly one file to avoid conflicts
4. **Verify after each batch** - Run `bun run check --filter=@beep/mock` after each batch
5. **Track progress with TodoWrite** - Update the todo list after each batch completes

## Package in Scope

| Package | File Count | Violation Count |
|---------|------------|-----------------|
| @beep/mock | 10 files | 61 violations |

### Violation Breakdown
- 47 `Array.from()` → `A.makeBy()`
- 14 `.slice()` → `A.take()`/`A.drop()`

## Sub-Agent Prompt Template

When spawning sub-agents, use this template:

```
You are remediating pattern violations in `<file_path>`.

This is a mock data file. The patterns are simple and repetitive.

Required imports to add at the top (after any "use client" directive):
```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
```

Pattern conversions to apply:

1. `Array.from({ length: N }, (_, index) => ...)` → `A.makeBy(N, (index) => ...)`
   - Remove the unused `_` parameter
   - The callback receives just `index`, not `(_, index)`

2. `.slice(0, N)` → `F.pipe(arr, A.take(N))`
   - Example: `_tags.slice(0, 5)` → `F.pipe(_tags, A.take(5))`

3. `.slice(start, end)` → `F.pipe(arr, A.drop(start), A.take(end - start))`
   - Example: `ITEMS.slice(1, 3)` → `F.pipe(ITEMS, A.drop(1), A.take(2))`
   - Note: Calculate `end - start` for the take count

4. Conditional slices in ternary/OR expressions:
   - `(condition && arr.slice(0, 1))` → `(condition && F.pipe(arr, A.take(1)))`

IMPORTANT for A.makeBy:
- The signature is `A.makeBy(count, (index) => value)`
- NOT `A.makeBy(count, (_, index) => value)` - there's only one parameter
- The first parameter to the callback IS the index

Example transformation:
```typescript
// Before
export const _userFollowers = Array.from({ length: 18 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
}));

// After
export const _userFollowers = A.makeBy(18, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
}));
```

Read the file, apply all conversions, and write the corrected file.
```

## Execution Order

### Batch 1: Core Files
```
1. assets.ts (1 violation - _id array)
2. _mock.ts (0 violations - just re-exports, verify no changes needed)
3. _time.ts (0 violations - already uses A.makeBy correctly)
4. _invoice.ts (3 violations)
```

### Batch 2: User & Order Files
```
1. _user.ts (10 violations)
2. _order.ts (3 violations)
3. _others.ts (4 violations)
4. _files.ts (8 violations)
```
→ After batch: `bun run check --filter=@beep/mock`

### Batch 3: Remaining Files
```
1. _overview.ts (18 violations - largest file)
2. _tour.ts (8 violations)
3. _job.ts (4 violations)
```
→ After batch: `bun run check --filter=@beep/mock`

## Special Handling: _overview.ts

This file has 18 `Array.from` violations. Use this specialized prompt:

```
You are remediating pattern violations in `packages/common/mock/src/_overview.ts`.

This file has 18 `Array.from` violations that all follow the same pattern.

Add import at top (after "use client" if present):
```typescript
import * as A from "effect/Array";
```

Transform ALL instances of:
```typescript
Array.from({ length: N }, (_, index) => ({...}))
```
to:
```typescript
A.makeBy(N, (index) => ({...}))
```

Lines with violations: 36, 43, 57, 67, 72, 80, 132, 147, 163, 172, 267, 276, 291, 297, 307, 322, 330, 339

CRITICAL: The A.makeBy callback takes ONE parameter (index), not two.
- Wrong: `A.makeBy(5, (_, index) => ...)`
- Right: `A.makeBy(5, (index) => ...)`

Read the entire file, find all Array.from patterns, and convert them all.
```

## Special Handling: _files.ts

This file has both `Array.from` AND `.slice()` violations:

```
You are remediating pattern violations in `packages/common/mock/src/_files.ts`.

Add imports:
```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
```

Violations to fix:

1. Line 43: `Array.from({ length: 20 }, ...)` → `A.makeBy(20, ...)`

2. Lines 69-72 (shared function): Multiple .slice() calls
   - `SHARED_PERSONS.slice(0, 5)` → `F.pipe(SHARED_PERSONS, A.take(5))`
   - `SHARED_PERSONS.slice(5, 9)` → `F.pipe(SHARED_PERSONS, A.drop(5), A.take(4))`
   - `SHARED_PERSONS.slice(9, 11)` → `F.pipe(SHARED_PERSONS, A.drop(9), A.take(2))`
   - `SHARED_PERSONS.slice(11, 12)` → `F.pipe(SHARED_PERSONS, A.drop(11), A.take(1))`

3. Lines 83, 99: `_tags.slice(0, 5)` → `F.pipe(_tags, A.take(5))`

Note: The file already has some Effect imports and uses Str.split correctly.
```

## Verification Commands

After each batch:
```bash
bun run check --filter=@beep/mock
```

Final verification:
```bash
bun run check --filter=@beep/mock && bun run lint --filter=@beep/mock
```

## Tips & Tricks Learned

1. **A.makeBy callback signature** - Takes ONE parameter `(index)`, not `(_, index)`. This is the most common mistake.

2. **Preserve readonly arrays** - `A.makeBy` returns `Array<T>`, but the original `Array.from` returns mutable. This is fine for mock data.

3. **Slice arithmetic** - For `.slice(start, end)`:
   - `A.drop(start)` removes the first `start` elements
   - `A.take(end - start)` takes the next `end - start` elements
   - Calculate the take count: `slice(5, 9)` → `drop(5), take(4)`

4. **Nested Array.from** - Some files have `Array.from` inside another `Array.from` (like `_user.ts:58`). Handle both.

5. **Conditional expressions** - `(index % 2 && arr.slice(0, 1))` - wrap the slice in `F.pipe()` but keep the condition structure.

6. **Empty array fallback** - `... || []` patterns should remain unchanged.

7. **Check for existing imports** - `_files.ts` already has `A` and `F` imports from Effect.

8. **_time.ts is already correct** - It uses `A.makeBy` properly, no changes needed.

## Common Mistakes to Avoid

```typescript
// WRONG - two parameters
A.makeBy(18, (_, index) => ({ id: _mock.id(index) }))

// RIGHT - one parameter
A.makeBy(18, (index) => ({ id: _mock.id(index) }))
```

```typescript
// WRONG - A.slice doesn't exist
F.pipe(arr, A.slice(0, 5))

// RIGHT - use drop + take
F.pipe(arr, A.take(5))  // for slice(0, N)
F.pipe(arr, A.drop(1), A.take(2))  // for slice(1, 3)
```

## Completion Criteria

- [ ] All 61 violations in @beep/mock fixed
- [ ] `bun run check --filter=@beep/mock` passes
- [ ] `bun run lint --filter=@beep/mock` passes
- [ ] Update `specs/pattern-remediation/REMAINING_VIOLATIONS.md` to mark Phase 3 complete
- [ ] Update `specs/pattern-remediation/PLAN.md` completion log with all phases

## Final Monorepo Verification

After all phases complete, run:
```bash
bunx turbo run check
```

This should pass with all ~85 tasks successful.
