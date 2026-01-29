# Master Orchestration

> Detailed phase-by-phase orchestration guide for lexical Effect alignment.

---

## Orchestrator Identity Contract

**CRITICAL**: Read this before executing ANY phase.

You are an **ORCHESTRATOR**. You are NOT:
- A code writer
- A code reviewer
- A researcher

Your ONLY responsibilities:
1. Deploy sub-agents with optimized prompts
2. Monitor sub-agent progress via checklist documents
3. Synthesize reports into master checklists
4. Create handoff documents when phases complete or context reaches 50%
5. Run verification commands

**If you find yourself reading source files, writing code, or analyzing patterns - STOP. Delegate to a sub-agent.**

---

## Context Management Protocol

### 50% Context Threshold

When you reach 50% of your context limit:

1. **Pause current work**
2. **Complete reflection** for work done so far
3. **Create intra-phase handoff** using alphanumeric format:
   - `P1a_ORCHESTRATOR_PROMPT.md` (first handoff in P1)
   - `P1b_ORCHESTRATOR_PROMPT.md` (second handoff in P1)
4. **Document lessons learned** about sub-agent performance
5. **Include improvement suggestions** for agent prompts

### Handoff Document Content

Every handoff MUST include:
- Phase progress (items completed / total)
- Remaining work items with file paths
- Agent prompt improvements discovered
- Quality check status

---

## Phase 1: Native Array Methods

### Objective

Replace all native Array methods with `effect/Array` equivalents.

### Target Methods

| Native | Effect Replacement |
|--------|-------------------|
| `.map()` | `A.map(array, fn)` |
| `.flatMap()` | `A.flatMap(array, fn)` |
| `.filter()` | `A.filter(array, pred)` |
| `.find()` | `A.findFirst(array, pred)` |
| `.findIndex()` | `A.findFirstIndex(array, pred)` |
| `.some()` | `A.some(array, pred)` |
| `.every()` | `A.every(array, pred)` |
| `.reduce()` | `A.reduce(array, init, fn)` |
| `.reduceRight()` | `A.reduceRight(array, init, fn)` |
| `.includes()` | `A.contains(array, value)` |
| `.indexOf()` | `A.findFirstIndex(array, x => x === value)` |
| `.slice()` | `A.take(array, n)` / `A.drop(array, n)` |
| `.concat()` | `A.appendAll(array1, array2)` |
| `.join()` | `A.join(array, sep)` |
| `.reverse()` | `A.reverse(array)` |
| `.sort()` | `A.sort(array, Order)` |
| `.length === 0` | `A.isEmptyReadonlyArray(array)` |
| `Array.isArray()` | `A.isArray(value)` |
| `Array.from()` | `A.fromIterable(iterable)` |
| `[...spread]` | `A.appendAll` / `A.prepend` |

### Discovery Phase

**Deploy**: 4 `codebase-researcher` agents in parallel

| Agent | Scope | Output |
|-------|-------|--------|
| Array-1 | `nodes/`, `plugins/A*-F*` | `outputs/P1-discovery-1.md` |
| Array-2 | `plugins/G*-M*` | `outputs/P1-discovery-2.md` |
| Array-3 | `plugins/N*-Z*` | `outputs/P1-discovery-3.md` |
| Array-4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P1-discovery-4.md` |

**Agent Prompt Reference**: `agent-prompts/P1-array-discovery.md`

### Consolidation Phase

**Deploy**: 1 agent to merge discovery documents

**Output**: `outputs/P1-MASTER_CHECKLIST.md`

### Execution Phase

**Deploy**: `effect-code-writer` agents in batches of 5

**Agent Prompt Reference**: `agent-prompts/P1-code-writer.md`

**Batch Calculation**: `ceil(unique_files / 5)`

### Verification

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

### Reflection & Handoff

1. Deploy `reflector` agent
2. Update `REFLECTION_LOG.md`
3. Create `handoffs/HANDOFF_P2.md`
4. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`

---

## Phase 2: Native String Methods

### Objective

Replace all native String methods with `effect/String` equivalents.

### Target Methods

| Native | Effect Replacement |
|--------|-------------------|
| `.split()` | `Str.split(str, sep)` |
| `.toLowerCase()` | `Str.toLowerCase(str)` |
| `.toUpperCase()` | `Str.toUpperCase(str)` |
| `.trim()` | `Str.trim(str)` |
| `.trimStart()` | `Str.trimStart(str)` |
| `.trimEnd()` | `Str.trimEnd(str)` |
| `.slice()` | `Str.slice(str, start, end)` |
| `.substring()` | `Str.slice(str, start, end)` |
| `.startsWith()` | `Str.startsWith(str, prefix)` |
| `.endsWith()` | `Str.endsWith(str, suffix)` |
| `.includes()` | `Str.includes(str, search)` |
| `.replace()` | `Str.replace(str, search, replacement)` |
| `.replaceAll()` | `Str.replaceAll(str, search, replacement)` |
| `.charAt()` | `Str.charAt(str, index)` |
| `.charCodeAt()` | `Str.charCodeAt(str, index)` |
| `.padStart()` | `Str.padStart(str, length, fillStr)` |
| `.padEnd()` | `Str.padEnd(str, length, fillStr)` |
| `.repeat()` | `Str.repeat(str, count)` |
| `.length` | `Str.length(str)` |
| `.match()` | `Str.match(regex)(str)` |

### Discovery Phase

Same parallel agent pattern as P1.

**Agent Prompt Reference**: `agent-prompts/P2-string-discovery.md`

### Execution Phase

**Agent Prompt Reference**: `agent-prompts/P2-code-writer.md`

---

## Phase 3: Native Set

### Objective

Replace `new Set()` with `effect/MutableHashSet` or `effect/HashSet`.

### Decision Criteria

- **Mutable operations** (`.add()`, `.delete()`, `.clear()`) → `MutableHashSet`
- **Immutable operations** (`.has()`, iteration only) → `HashSet`

### Target Patterns

| Native | Effect Replacement |
|--------|-------------------|
| `new Set()` | `MutableHashSet.make()` or `HashSet.make()` |
| `.add()` | `MutableHashSet.add(set, value)` |
| `.delete()` | `MutableHashSet.remove(set, value)` |
| `.has()` | `HashSet.has(set, value)` / `MutableHashSet.has(set, value)` |
| `.clear()` | `MutableHashSet.clear(set)` |
| `.size` | `HashSet.size(set)` |
| `.forEach()` | `HashSet.forEach(set, fn)` |
| `[...set]` | `HashSet.toArray(set)` |

**Agent Prompt Reference**: `agent-prompts/P3-set-discovery.md`, `agent-prompts/P3-code-writer.md`

---

## Phase 4: Native Map

### Objective

Replace `new Map()` with `effect/MutableHashMap` or `effect/HashMap`.

### Decision Criteria

- **Mutable operations** (`.set()`, `.delete()`, `.clear()`) → `MutableHashMap`
- **Immutable operations** (`.get()`, `.has()`, iteration only) → `HashMap`

### Target Patterns

| Native | Effect Replacement |
|--------|-------------------|
| `new Map()` | `MutableHashMap.make()` or `HashMap.make()` |
| `.set()` | `MutableHashMap.set(map, key, value)` |
| `.get()` | `HashMap.get(map, key)` |
| `.delete()` | `MutableHashMap.remove(map, key)` |
| `.has()` | `HashMap.has(map, key)` |
| `.clear()` | `MutableHashMap.clear(map)` |
| `.size` | `HashMap.size(map)` |
| `.keys()` | `HashMap.keys(map)` |
| `.values()` | `HashMap.values(map)` |
| `.entries()` | `HashMap.toEntries(map)` |

**Agent Prompt Reference**: `agent-prompts/P4-map-discovery.md`, `agent-prompts/P4-code-writer.md`

---

## Phase 5: Native Error

### Objective

Replace `throw new Error()` and `new Error()` with Effect `TaggedError` schemas.

### Target Patterns

| Native | Effect Replacement |
|--------|-------------------|
| `throw new Error("msg")` | `Effect.fail(new MyError({ message: "msg" }))` |
| `new Error("msg")` | `new MyError({ message: "msg" })` |
| `catch (e)` | Effect error channel |

### Error Schema Location

- Lexical-module errors → `apps/todox/src/app/lexical/schema/errors.ts`
- File-specific errors → Top of file where violation occurs

### Schema Template

```typescript
import * as S from "effect/Schema";

export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
  // Add contextual fields as needed
}) {}
```

**Agent Prompt Reference**: `agent-prompts/P5-error-discovery.md`, `agent-prompts/P5-code-writer.md`

---

## Phase 6: JSON.parse/stringify

### Objective

Replace raw `JSON.parse` and `JSON.stringify` with Effect Schema equivalents.

### Target Patterns

| Native | Effect Replacement |
|--------|-------------------|
| `JSON.parse(str)` | `S.decodeUnknownEither(S.parseJson(schema))(str)` |
| `JSON.stringify(obj)` | `S.encodeUnknownEither(S.parseJson(schema))(obj)` |

### Implementation Notes

1. Define schema for the JSON structure
2. Use `S.parseJson(schema)` to create parsing schema
3. Use `S.decodeUnknownEither` for parsing (returns `Either`)
4. Use `S.encodeUnknownEither` for stringify (returns `Either`)

**Agent Prompt Reference**: `agent-prompts/P6-json-discovery.md`, `agent-prompts/P6-code-writer.md`

---

## Phase 7: Promise-Based Code

### Objective

Replace Promise-based patterns with Effect runtime patterns for non-network code.

### Reference Examples

- `apps/todox/src/app/lexical/nodes/embeds/TweetNode.tsx`
- `apps/todox/src/app/lexical/nodes/ExcalidrawNode/ExcalidrawImage.tsx`

### Target Patterns

| Before | After |
|--------|-------|
| `async function` | `Effect.gen(function* () { ... })` |
| `await promise` | `yield* Effect.promise(() => promise)` |
| `Promise.resolve(x)` | `Effect.succeed(x)` |
| `Promise.reject(e)` | `Effect.fail(e)` |
| `new Promise()` | `Effect.async()` |

### Hook Pattern

```typescript
import { useRuntime } from "@/hooks/useRuntime";

function MyComponent() {
  const runtime = useRuntime();

  const handleAction = () => {
    runtime.runPromise(
      Effect.gen(function* () {
        // Effect code here
      })
    );
  };
}
```

**Agent Prompt Reference**: `agent-prompts/P7-promise-discovery.md`, `agent-prompts/P7-code-writer.md`

---

## Phase 8: Raw Regex

### Objective

Replace raw regex usage with `effect/String` `Str.match` patterns.

### Reference Example

`apps/todox/src/app/lexical/plugins/AutoEmbedPlugin/index.tsx:79-108`

### Target Patterns

| Before | After |
|--------|-------|
| `str.match(/regex/)` | `Str.match(/regex/)(str)` |
| `/regex/.test(str)` | `O.isSome(Str.match(/regex/)(str))` |
| `/regex/.exec(str)` | `Str.match(/regex/)(str)` |
| `str.replace(/regex/, rep)` | `Str.replace(str, /regex/, rep)` |

### Pattern Template

```typescript
import * as Str from "effect/String";
import * as O from "effect/Option";

const parseUrl = (url: string) => {
  const match = Str.match(/pattern/)(url);
  return O.flatMap(match, ([_, group]) => O.fromNullable(group));
};
```

**Agent Prompt Reference**: `agent-prompts/P8-regex-discovery.md`, `agent-prompts/P8-code-writer.md`

---

## Phase 9: Switch Statements

### Objective

Replace `switch` statements with `effect/Match`.

### Target Patterns

```typescript
// Before
switch (value) {
  case "a": return 1;
  case "b": return 2;
  default: return 0;
}

// After
import * as Match from "effect/Match";

Match.value(value).pipe(
  Match.when("a", () => 1),
  Match.when("b", () => 2),
  Match.orElse(() => 0)
)
```

### Advanced Patterns

```typescript
// Type narrowing
Match.type<MyUnion>().pipe(
  Match.tag("TypeA", (a) => handleA(a)),
  Match.tag("TypeB", (b) => handleB(b)),
  Match.exhaustive
)

// Discriminated unions
Match.value(status).pipe(
  Match.when("active", () => "Active"),
  Match.when("inactive", () => "Inactive"),
  Match.orElse(() => "Unknown")
)
```

**Agent Prompt Reference**: `agent-prompts/P9-switch-discovery.md`, `agent-prompts/P9-code-writer.md`

---

## Phase 10: Native Date

### Objective

Replace native `Date` usage with `effect/DateTime`.

### Target Patterns

| Native | Effect Replacement |
|--------|-------------------|
| `new Date()` | `DateTime.now` or `DateTime.unsafeNow()` |
| `Date.now()` | `DateTime.now` (in Effect context) |
| `new Date(str)` | `DateTime.make(str)` |
| `date.getTime()` | `DateTime.toEpochMillis(dt)` |
| `date.toISOString()` | `DateTime.formatIso(dt)` |
| `date.getFullYear()` | `DateTime.getPartUtc(dt, "year")` |

### Implementation Notes

1. `DateTime.now` returns `Effect<DateTime.Utc>`
2. Use `DateTime.unsafeNow()` for synchronous contexts
3. For parsing, use `DateTime.make` which returns `Option<DateTime>`

**Agent Prompt Reference**: `agent-prompts/P10-date-discovery.md`, `agent-prompts/P10-code-writer.md`

---

## Phase 11: Nullable Returns to Option

### Objective

Identify functions returning `T | null | undefined` and refactor to return `Option<T>` where appropriate.

### Decision Criteria

**DO refactor** when:
- Function is internal to the lexical module
- Return type is `T | null` or `T | undefined`
- No external API requires nullable return

**DO NOT refactor** when:
- Function is a React component prop
- Function is required by Lexical/third-party API to return nullable
- Function is an event handler with specific signature

### Reference Example

`apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:42-57`

```typescript
// This returns DOMConversionOutput | null - required by Lexical API
// DO NOT refactor - Lexical requires nullable return
function $convertDateTimeElement(domNode: HTMLElement): DOMConversionOutput | null
```

### Pattern Template

```typescript
import * as O from "effect/Option";

// Before
function findUser(id: string): User | null {
  const user = users.get(id);
  return user || null;
}

// After
function findUser(id: string): O.Option<User> {
  return O.fromNullable(users.get(id));
}

// Callers must update:
// Before: const user = findUser(id); if (user) { ... }
// After: O.match(findUser(id), { onNone: () => ..., onSome: (user) => ... })
```

### Additional Requirements

When refactoring a function to return `Option`:
1. Update ALL callers of that function
2. Use `O.match`, `O.map`, `O.flatMap` patterns at call sites
3. Verify no external API breaks

**Agent Prompt Reference**: `agent-prompts/P11-option-discovery.md`, `agent-prompts/P11-code-writer.md`

---

## Quality Gates

### Per-Phase Quality Checks

```bash
# Must pass before phase is complete
bun run build
bun run check
bun run lint:fix
bun run lint
```

### Final Verification

After all phases complete:

```bash
# Full quality check
bun run build
bun run check
bun run lint

# Optional: Run tests if available
bun run test --filter @beep/todox
```

---

## Handoff Standards

### HANDOFF_P[N].md Structure

```markdown
# Phase [N] Handoff

## Summary
- Items completed: X/Y
- Files modified: Z

## Key Learnings
- [Insight from this phase]

## Remaining Work
- [If incomplete]

## Agent Prompt Improvements
- [Changes for next phase]

## Verification Status
- [ ] bun run build
- [ ] bun run check
- [ ] bun run lint
```

### P[N]_ORCHESTRATOR_PROMPT.md Structure

```markdown
# Phase [N] Orchestrator Prompt

Copy-paste this prompt to start Phase [N].

---

You are an ORCHESTRATOR for Phase [N] of the lexical-effect-alignment spec.

## Your Identity
- You are NOT a code writer, reviewer, or researcher
- You ONLY deploy sub-agents and monitor progress

## Current Phase
[Phase objective and scope]

## Agent Prompts
[Reference to agent-prompts/P[N]-*.md files]

## Execution Steps
1. [Numbered steps]

## Verification
[Commands to run]

## Handoff Document
Read full context: specs/lexical-effect-alignment/handoffs/HANDOFF_P[N].md
```
