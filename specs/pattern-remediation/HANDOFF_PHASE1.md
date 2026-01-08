# Phase 1 Handoff: High Priority Business Logic Remediation

## Your Role

You are an **ORCHESTRATION AGENT** responsible for coordinating the remediation of pattern violations in high-priority business logic packages. Your primary job is to **delegate work to sub-agents** and **preserve your own context** for the duration of this task.

## Critical Context Preservation Rules

1. **NEVER write code directly** - Always use `Task` tool with sub-agents to perform file modifications
2. **Batch sub-agents in groups of 4** - Launch up to 4 agents in parallel per batch, wait for completion, then proceed
3. **One file per agent** - Each sub-agent handles exactly one file to avoid conflicts
4. **Verify after each package** - Run `bun run check --filter=<package-name>` after completing each package
5. **Track progress with TodoWrite** - Update the todo list after each batch completes

## Packages in Scope

| Package | File Count | Violation Count |
|---------|------------|-----------------|
| @beep/utils | 13 files | 38 violations |
| @beep/schema | 8 files | 27 violations |
| @beep/errors | 2 files | 14 violations |

## Sub-Agent Prompt Template

When spawning sub-agents, use this template:

```
You are remediating pattern violations in `<file_path>`.

Required imports to add if not present:
- `import * as A from "effect/Array";`
- `import * as F from "effect/Function";`
- `import * as Str from "effect/String";`
- `import * as P from "effect/Predicate";`
- `import * as DateTime from "effect/DateTime";`
- `import * as R from "effect/Record";`
- `import * as Struct from "effect/Struct";`

Pattern conversions to apply:

1. `Array.from({ length: N }, (_, i) => ...)` → `A.makeBy(N, (i) => ...)`
2. `.map((x) => ...)` → `F.pipe(arr, A.map((x) => ...))`
3. `.filter((x) => ...)` → `F.pipe(arr, A.filter((x) => ...))`
4. `.reduce(init, (acc, x) => ...)` → `F.pipe(arr, A.reduce(init, (acc, x) => ...))`
5. `.includes(x)` on array → `F.pipe(arr, A.contains(x))`
6. `.slice(start, end)` → `F.pipe(arr, A.drop(start), A.take(end - start))`
7. `.split(sep)` → `F.pipe(str, Str.split(sep))`
8. `.includes(sub)` on string → `Str.includes(sub)(str)`
9. `.startsWith(pre)` → `Str.startsWith(pre)(str)`
10. `.endsWith(suf)` → `Str.endsWith(suf)(str)`
11. `.trim()` → `Str.trim(str)`
12. `.toLowerCase()` → `Str.toLowerCase(str)`
13. `typeof x === "string"` → `P.isString(x)`
14. `typeof x === "object"` → `P.isObject(x)`
15. `typeof x === "boolean"` → `P.isBoolean(x)`
16. `instanceof Date` → `P.isDate(x)`
17. `instanceof RegExp` → `P.isRegExp(x)`
18. `Object.keys(obj)` → `Struct.keys(obj)`
19. `Object.entries(obj)` → `R.toEntries(obj)`
20. `Date.now()` → `DateTime.toEpochMillis(DateTime.unsafeNow())`
21. `new Date()` → `DateTime.unsafeMake(...)` or `DateTime.toDate(DateTime.unsafeNow())`
22. `switch (x) { case ... }` → `Match.value(x).pipe(Match.when(...), Match.exhaustive)`

EXCEPTIONS - Do NOT change:
- `Array.isArray()` - acceptable for type narrowing
- `instanceof Error` in catch blocks - acceptable for error handling
- Type predicate functions that use `typeof`/`instanceof` for TypeScript narrowing

Read the file, apply all applicable conversions, and write the corrected file.
```

## Execution Order

### Batch 1: @beep/utils (Part 1)
```
1. sqids.ts (4 violations)
2. data/string.utils.ts (18 violations)
3. getters/getAt.ts (1 violation)
4. object/path.ts (1 violation)
```

### Batch 2: @beep/utils (Part 2)
```
1. equality/deepEqual.ts (2 violations)
2. data/array.utils/order-by.ts (2 violations)
3. data/object.utils/clone-deep.ts (3 violations)
4. data/object.utils/merge-defined.ts (1 violation)
```

### Batch 3: @beep/utils (Part 3)
```
1. data/object.utils/omit.ts (1 violation)
2. data/object.utils/omit-by.ts (1 violation)
3. timing/debounce.ts (1 violation)
```
→ After batch: `bun run check --filter=@beep/utils`

### Batch 4: @beep/schema (Part 1)
```
1. integrations/files/file-types/FileTypes.ts (12 violations)
2. integrations/files/utils/compress-file-name.ts (2 violations)
3. primitives/person/person-attributes.ts (4 violations)
4. primitives/temporal/dates/date-time.ts (4 violations)
```

### Batch 5: @beep/schema (Part 2)
```
1. primitives/temporal/dates/timestamp.ts (2 violations)
2. core/annotations/default.ts (1 violation)
3. core/extended/extended-schemas.ts (1 violation)
4. primitives/json/json.ts (1 violation)
```
→ After batch: `bun run check --filter=@beep/schema`

### Batch 6: @beep/errors
```
1. shared.ts (3 violations)
2. server.ts (11 violations)
```
→ After batch: `bun run check --filter=@beep/errors`

## Verification Command

After all packages complete:
```bash
bun run check --filter=@beep/utils --filter=@beep/schema --filter=@beep/errors
```

## Tips & Tricks Learned

1. **A.slice doesn't exist** - Use `A.drop(start)` then `A.take(count)` instead
2. **DateTime.unsafeNow() returns Utc, not Date** - If you need a `Date` object, use `DateTime.toDate(DateTime.unsafeNow())`
3. **P.isArray doesn't exist** - Keep `Array.isArray()` for type narrowing, it's acceptable
4. **Str.split returns ReadonlyArray** - The result works with all `A.*` functions
5. **Match.exhaustive is required** - Always end Match chains with `Match.exhaustive` or `Match.orElse`
6. **Check for existing imports** - Many files already have `A`, `F`, `Str` imports; don't duplicate
7. **Test files may have intentional native patterns** - Files in `test/` directories may use native methods with `@ts-expect-error` for testing invalid inputs
8. **Schema filter context** - `S.filter` predicates run synchronously, don't convert internal logic unless it's clearly array/string methods

## Completion Criteria

- [ ] All 38 violations in @beep/utils fixed
- [ ] All 27 violations in @beep/schema fixed
- [ ] All 14 violations in @beep/errors fixed
- [ ] `bun run check` passes for all three packages
- [ ] Update `specs/pattern-remediation/REMAINING_VIOLATIONS.md` to mark Phase 1 complete
