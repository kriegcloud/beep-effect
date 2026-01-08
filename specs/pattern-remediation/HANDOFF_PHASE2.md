# Phase 2 Handoff: UI/Server Package Remediation

## Your Role

You are an **ORCHESTRATION AGENT** responsible for coordinating the remediation of pattern violations in UI and server packages. Your primary job is to **delegate work to sub-agents** and **preserve your own context** for the duration of this task.

## Critical Context Preservation Rules

1. **NEVER write code directly** - Always use `Task` tool with sub-agents to perform file modifications
2. **Batch sub-agents in groups of 4** - Launch up to 4 agents in parallel per batch, wait for completion, then proceed
3. **One file per agent** - Each sub-agent handles exactly one file to avoid conflicts
4. **Verify after each package** - Run `bun run check --filter=<package-name>` after completing each package
5. **Track progress with TodoWrite** - Update the todo list after each batch completes

## Packages in Scope

| Package | File Count | Violation Count |
|---------|------------|-----------------|
| @beep/ui-core | 8 files | 14 violations |
| @beep/lexical-collab | 5 files | 56 violations |
| @beep/iam-server | 3 files | 5 violations |
| @beep/runtime-client | 2 files | 4 violations |

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
- `import * as Match from "effect/Match";`
- `import * as O from "effect/Option";`

Pattern conversions to apply:

1. `.forEach((x) => ...)` → `A.forEach(arr, (x) => ...)`
2. `.map((x) => ...)` → `F.pipe(arr, A.map((x) => ...))`
3. `.filter((x) => ...)` → `F.pipe(arr, A.filter((x) => ...))`
4. `.includes(x)` on array → `A.contains(arr, x)` or `F.pipe(arr, A.some((item) => item === x))`
5. `Array.from(iterable)` → `A.fromIterable(iterable)`
6. `.split(sep)` → `F.pipe(str, Str.split(sep))`
7. `.includes(sub)` on string → `Str.includes(sub)(str)`
8. `.trim()` → `Str.trim(str)`
9. `.toLowerCase()` → `Str.toLowerCase(str)`
10. `typeof x === "string"` → `P.isString(x)`
11. `typeof x === "object"` → `P.isObject(x)`
12. `Date.now()` → `DateTime.toEpochMillis(DateTime.unsafeNow())`
13. `new Date(value)` → `DateTime.unsafeMake(value)` or keep if external library requires Date
14. `switch (x) { case "a": ...; case "b": ... }` →
    ```typescript
    Match.value(x).pipe(
      Match.when("a", () => ...),
      Match.when("b", () => ...),
      Match.exhaustive
    )
    ```

For array indexing after Str.split:
- `str.split("-")[0]` → `F.pipe(str, Str.split("-"), A.head, O.getOrElse(() => ""))`
- `arr[0]` where arr is from split → `F.pipe(arr, A.get(0), O.getOrElse(() => ""))`

EXCEPTIONS - Do NOT change:
- `Array.isArray()` - acceptable for type narrowing
- `instanceof Error` in catch blocks - acceptable for error handling
- `typeof window === "undefined"` - SSR boundary check, keep as-is
- `instanceof Uint8Array`, `instanceof FormData` - runtime type checks at API boundaries

Read the file, apply all applicable conversions, and write the corrected file.
```

## Execution Order

### Batch 1: @beep/ui-core (Part 1)
```
1. utils/cookies.ts (2 violations - switch + Date.now)
2. adapters/AdapterEffectDateTime.ts (4 violations)
3. utils/right-to-left.ts (2 violations)
4. utils/color.ts (2 violations)
```

### Batch 2: @beep/ui-core (Part 2)
```
1. utils/css-variables.ts (1 violation)
2. theme/core/components/avatar.tsx (2 violations)
3. utils/format-number.ts (1 violation)
4. theme/core/components/badge.tsx + button-fab.tsx (2 violations - can combine if small)
```
→ After batch: `bun run check --filter=@beep/ui-core`

### Batch 3: @beep/lexical-collab (Part 1) - CollabInstance.ts
This file has 21 violations. Split into 2 agents if needed, or use one thorough agent.
```
1. CollabInstance.ts (21 violations - forEach, map, filter, switch, Date.now)
```

### Batch 4: @beep/lexical-collab (Part 2)
```
1. CollabTrystero.ts (20 violations - mostly forEach + switch)
2. CollabNetwork.ts (3 violations)
3. cursor.ts (1 violation - Date.now)
4. Messages.ts (3 violations)
```
→ After batch: `bun run check --filter=@beep/ui`

### Batch 5: @beep/iam-server
```
1. api/v1/sso/saml2-sp-metadata.ts (1 violation)
2. api/v1/organization/create.ts (2 violations)
3. api/v1/organization/update.ts (2 violations)
```
→ After batch: `bun run check --filter=@beep/iam-server`

### Batch 6: @beep/runtime-client
```
1. services/unsafe-http-api-client.ts (3 violations - split, map, switch)
2. workers/worker.ts (1 violation)
```
→ After batch: `bun run check --filter=@beep/runtime-client`

## Special Handling: CollabInstance.ts

This file has 21 violations and is complex. Use this specialized prompt:

```
You are remediating pattern violations in `packages/ui/ui/src/lexical/collab/CollabInstance.ts`.

This file has 21 violations across these categories:
- 10 `.forEach()` calls → `A.forEach(arr, fn)`
- 2 `.map()` calls → `F.pipe(arr, A.map(fn))`
- 2 `.filter()` calls → `F.pipe(arr, A.filter(fn))`
- 1 `.includes()` call → `A.contains(arr, item)`
- 1 `Array.from()` → `A.fromIterable()`
- 5 `switch` statements → `Match.value().pipe(...)`
- 2 `Date.now()` calls → `DateTime.toEpochMillis(DateTime.unsafeNow())`

Add imports:
- `import * as A from "effect/Array";`
- `import * as F from "effect/Function";`
- `import * as Match from "effect/Match";`
- `import * as DateTime from "effect/DateTime";`

Key transformations:
1. Lines 144, 153: Entry iteration with filter/map
2. Lines 189, 220, 288, 313, 381, 469, 485, 545: forEach loops
3. Lines 222, 289, 315, 409, 441: switch statements on message.type
4. Lines 251: Array.from(messageMap.values())
5. Lines 520, 546: Date.now() for cursor activity

For switch on message types, use Match.value with discriminated union:
```typescript
Match.value(message).pipe(
  Match.when({ type: "created" }, (m) => ...),
  Match.when({ type: "destroyed" }, (m) => ...),
  Match.when({ type: "cursor" }, (m) => ...),
  Match.exhaustive
)
```

Read the entire file carefully, apply all conversions, and write back.
```

## Verification Commands

After each package:
```bash
bun run check --filter=@beep/ui-core
bun run check --filter=@beep/ui  # covers lexical-collab
bun run check --filter=@beep/iam-server
bun run check --filter=@beep/runtime-client
```

Final verification:
```bash
bunx turbo run check --filter=@beep/ui-core --filter=@beep/ui --filter=@beep/iam-server --filter=@beep/runtime-client
```

## Tips & Tricks Learned

1. **forEach is NOT chainable with pipe** - Use `A.forEach(arr, fn)` not `F.pipe(arr, A.forEach(fn))`
2. **Match.when with objects** - For discriminated unions, use `Match.when({ type: "value" }, fn)`
3. **Match requires exhaustive or orElse** - Every Match chain must end with `Match.exhaustive` or `Match.orElse`
4. **CollabInstance uses Map.forEach** - When iterating Maps, `map.forEach((val, key) => ...)` should become `A.forEach(Array.from(map.entries()), ([key, val]) => ...)` or keep as-is if Map-specific
5. **DateTime for timestamps only** - If external libraries (like faker) require `Date` objects, keep `new Date()` at the boundary
6. **Preserve callback signatures** - Lexical callbacks have specific signatures; don't change function parameter patterns
7. **Switch with fallthrough** - If switch has fallthrough cases, use `Match.whenOr` or restructure carefully
8. **Check for side effects** - `.forEach` in Lexical mutates editor state; ensure `A.forEach` maintains the same behavior (it does, it's imperative)

## Completion Criteria

- [ ] All 14 violations in @beep/ui-core fixed
- [ ] All 56 violations in @beep/lexical-collab fixed
- [ ] All 5 violations in @beep/iam-server fixed
- [ ] All 4 violations in @beep/runtime-client fixed
- [ ] `bun run check` passes for all packages
- [ ] Update `specs/pattern-remediation/REMAINING_VIOLATIONS.md` to mark Phase 2 complete
