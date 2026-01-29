# Agent Prompts

> Specialized prompts for sub-agents in the Lexical Utils Effect Refactor spec.

---

## codebase-researcher

### P1: Codebase Analysis

```
Analyze all utility files in apps/todox/src/app/lexical/utils/

For EACH file (excluding emoji-list.ts and index.ts), document:

1. **Native String Methods Used**
   - List all occurrences: split(), toLowerCase(), toUpperCase(), slice(), etc.
   - Note the line numbers

2. **Native Array Methods Used**
   - List all occurrences: map(), filter(), join(), reduce(), etc.
   - Note the line numbers

3. **Native Collections Used**
   - Set, Map, WeakMap, WeakSet
   - Note how they're used (read, write, iteration)

4. **Async/Promise Patterns**
   - async functions
   - await expressions
   - Promise.all, Promise.race, etc.
   - async generators (function*)

5. **Null/Undefined Handling**
   - null checks (=== null, !== null)
   - undefined checks
   - Optional chaining (?.)
   - Nullish coalescing (??)

6. **Error Handling**
   - try/catch blocks
   - throw statements

7. **External Dependencies**
   - @lexical/* imports
   - DOM APIs used

Output format for each file:
```markdown
### filename.ts

**Lines of Code**: N
**Complexity**: Low/Medium/High

**Native String Methods**:
- Line X: `string.split(...)`
- Line Y: `string.toLowerCase()`

**Native Array Methods**:
- Line X: `array.map(...)`

[Continue for each category]
```

Files to analyze:
- docSerialization.ts
- swipe.ts
- url.ts
- focusUtils.ts
- getDOMRangeRect.ts
- getSelectedNode.ts
- getThemeSelector.ts
- joinClasses.ts
- setFloatingElemPosition.ts
- setFloatingElemPositionForLinkEditor.ts
```

---

## mcp-researcher

### P1: Effect API Research

```
Research Effect documentation for the following APIs needed for the Lexical Utils refactor:

1. **effect/Stream** (PRIORITY: HIGH)
   - Stream.fromAsyncIterable - for replacing async generators
   - Stream.unfold - for stateful iteration
   - Stream.runCollect - for collecting stream results
   - Stream.mapEffect - for effectful transformations
   - How to handle ReadableStream with Stream

2. **effect/HashSet** (PRIORITY: HIGH)
   - HashSet.make - creation
   - HashSet.fromIterable - from array
   - HashSet.has - membership check
   - HashSet.add, HashSet.remove - mutation alternatives
   - HashSet.size - size check

3. **effect/String** (PRIORITY: MEDIUM)
   - Str.split - with delimiter
   - Str.toLowerCase, Str.toUpperCase
   - Str.slice
   - Str.replace (if exists)
   - Str.join (if exists, or Array equivalent)

4. **effect/Array** (PRIORITY: MEDIUM)
   - A.map, A.filter, A.join
   - A.reduce, A.flatMap
   - A.head, A.last (for safe access)
   - A.fromIterable

5. **effect/Option** (PRIORITY: MEDIUM)
   - O.fromNullable - converting nullable to Option
   - O.map, O.flatMap - transformations
   - O.getOrElse - default values
   - O.match - pattern matching

6. **effect/Predicate** (PRIORITY: MEDIUM)
   - P.isNotNull, P.isNotUndefined
   - P.isString, P.isNumber
   - P.isTruthy, P.isFalsy

7. **effect/Schema** (PRIORITY: HIGH)
   - S.pattern() - regex validation
   - S.decodeUnknownSync - replacing JSON.parse
   - S.encodeSync - replacing JSON.stringify
   - Combining S.pattern with other schemas

For each API:
- Provide the exact import path
- Show usage example
- Note any gotchas or common mistakes
- Reference official documentation URL if available
```

---

## architecture-pattern-enforcer

### P2: Architecture Review

```
Validate the proposed Lexical Utils refactoring approach against repository patterns.

Check these requirements:

1. **Import Conventions** (.claude/rules/effect-patterns.md)
   - Namespace imports: import * as Effect from "effect/Effect"
   - Single-letter aliases: A, Str, O, P, S
   - No named imports from effect modules

2. **Schema Location**
   - Schemas should go in apps/todox/src/app/lexical/schema/
   - Follow existing patterns in schemas.ts
   - Use $TodoxId for annotations

3. **No Cross-Boundary Imports**
   - Utils should not import from other slices
   - Should only import from:
     - effect/*
     - @lexical/*
     - @beep/identity
     - Local schema directory

4. **File Organization**
   - One schema file per domain (url.schema.ts, docHash.schema.ts)
   - Barrel exports in index.ts
   - No circular dependencies

5. **Effect Pattern Compliance**
   - No async/await in final code
   - No native collections (Set, Map)
   - No native string/array methods
   - All errors as tagged errors (not throw)

Output: Report with PASS/FAIL for each check, with specific file:line references for failures.
```

---

## code-reviewer

### P2: Code Quality Review

```
Review the proposed Effect transformations for the Lexical Utils refactor.

Validate these transformation patterns:

1. **Async to Effect**
   ```typescript
   // WRONG
   async function foo(): Promise<T> {
     const x = await bar();
     return x;
   }

   // CORRECT
   const foo = Effect.gen(function* () {
     const x = yield* bar();
     return x;
   });
   ```

2. **Set to HashSet**
   ```typescript
   // WRONG
   const set = new Set(['a', 'b']);
   set.has('a');

   // CORRECT
   const set = HashSet.fromIterable(['a', 'b']);
   HashSet.has(set, 'a');
   ```

3. **Null Check to Option**
   ```typescript
   // WRONG
   if (value !== null) { ... }

   // CORRECT (when returning)
   O.fromNullable(value)

   // CORRECT (when guarding)
   P.isNotNull(value)
   ```

4. **Array Methods**
   ```typescript
   // WRONG
   arr.map(x => x + 1).filter(x => x > 0).join(',')

   // CORRECT
   A.map(arr, x => x + 1) |> A.filter(x => x > 0) |> A.join(',')
   // or with pipe
   pipe(arr, A.map(x => x + 1), A.filter(x => x > 0), A.join(','))
   ```

5. **JSON Parse with Schema**
   ```typescript
   // WRONG
   JSON.parse(str)

   // CORRECT
   S.decodeUnknownSync(MySchema)(JSON.parse(str))
   // or better
   S.decodeUnknownSync(S.parseJson(MySchema))(str)
   ```

Flag any patterns that don't match these transformations.
```

---

## effect-code-writer

### P3: URL Schema Creation

```
Create apps/todox/src/app/lexical/schema/url.schema.ts

Requirements:
1. Import * as S from "effect/Schema"
2. Import $TodoxId from "@beep/identity/packages"
3. Create $I identifier

Schemas to create:

1. SupportedProtocol - literal union
   const SupportedProtocol = S.Literal("http:", "https:", "mailto:", "sms:", "tel:");

2. UrlPattern - pattern schema for URL regex
   The regex: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/

   Use S.String.pipe(S.pattern(...)) with $I annotations

3. Export types:
   export type SupportedProtocol = typeof SupportedProtocol.Type
   export type UrlPattern = typeof UrlPattern.Type

Follow the pattern in apps/todox/src/app/lexical/schema/schemas.ts for annotation style.
```

### P4: docSerialization.ts Refactor

```
Refactor apps/todox/src/app/lexical/utils/docSerialization.ts to use Effect patterns.

Current file uses:
- async generator (generateReader)
- Promise.all
- JSON.stringify / JSON.parse
- Native array push, join
- for await loops

Transform to:

1. generateReader -> Stream pattern
   ```typescript
   const readStream = <T>(reader: ReadableStreamDefaultReader<T>) =>
     Stream.unfold(reader, (r) =>
       Effect.gen(function* () {
         const result = yield* Effect.promise(() => r.read());
         if (result.done) return O.none();
         return O.some([result.value, r] as const);
       })
     );
   ```

2. readBytestoString -> Stream.runCollect + processing
   - Use Stream to collect chunks
   - Use A.flatMap for chunk processing
   - Use A.join instead of array.join

3. docToHash -> Effect.gen
   - Replace Promise.all with Effect.all
   - Use S.encodeSync for JSON serialization
   - Return Effect<string, never, never>

4. docFromHash -> Effect.gen
   - Use schema decode instead of JSON.parse
   - Use O.fromNullable for regex match
   - Return Effect<SerializedDocument, ParseError, never>

Important: The function signatures may need to change from async to Effect-returning.
Document any breaking changes in comments.
```

### P5: getThemeSelector.ts Refactor

```
Refactor apps/todox/src/app/lexical/utils/getThemeSelector.ts

Current:
```typescript
return className
  .split(/\s+/g)
  .map((cls) => `.${cls}`)
  .join();
```

Transform to:
```typescript
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as P from "effect/Predicate";

// For the typeof check
if (!P.isString(className)) {
  // tagged error instead of throw
}

// For the string operations
pipe(
  Str.split(className, /\s+/),  // Check if Str.split supports regex
  A.map((cls) => `.${cls}`),
  A.join(",")  // Note: join() with no arg uses comma
)
```

Note: Verify Str.split regex support. If not supported, may need:
- Use native split but wrap: Str.split doesn't exist, use className.split then A.fromIterable
- Or use A.filter to handle empty strings after split
```

---

## test-writer

### P6: Utils Tests

```
Create test file: apps/todox/src/app/lexical/utils/test/utils.test.ts

Use @beep/testkit patterns.

Test cases:

1. **sanitizeUrl**
   ```typescript
   import { effect, strictEqual } from "@beep/testkit";
   import { sanitizeUrl } from "../url";

   effect("sanitizeUrl - allows https protocol", () =>
     Effect.gen(function* () {
       const result = sanitizeUrl("https://example.com");
       strictEqual(result, "https://example.com");
     })
   );

   effect("sanitizeUrl - blocks javascript protocol", () =>
     Effect.gen(function* () {
       const result = sanitizeUrl("javascript:alert(1)");
       strictEqual(result, "about:blank");
     })
   );
   ```

2. **validateUrl**
   - Valid URLs return true
   - Invalid URLs return false
   - Edge case: "https://" returns true (per TODO comment)

3. **joinClasses**
   - Joins string arguments with space
   - Filters out falsy values (false, null, undefined)
   - Returns empty string for no valid inputs

4. **getThemeSelector**
   - Converts space-separated classes to selector
   - Throws/fails on non-string input

Tests should use effect() helper for Effect-returning functions,
or standard bun:test for pure functions if they remain synchronous.
```

---

## package-error-fixer

### P6: Fix Type Errors

```
Fix all type errors in the todox package after the Effect refactor.

Run: bun run check --filter todox

Common issues to fix:

1. **Effect return type mismatches**
   - Functions that were Promise<T> now return Effect<T, E, R>
   - Callers need to yield* or run the Effect

2. **Option unwrapping**
   - O.fromNullable returns Option<T>, not T
   - Use O.getOrElse or O.match to unwrap

3. **HashSet type parameters**
   - HashSet.HashSet<T> not Set<T>
   - Methods are module functions, not instance methods

4. **Schema decode errors**
   - S.decodeUnknownSync can throw ParseError
   - May need to wrap in Effect.try

5. **Stream to Array**
   - Stream.runCollect returns Chunk, may need A.fromIterable

For each error:
1. Read the error message
2. Identify the root cause
3. Apply the minimal fix
4. Verify the fix doesn't introduce new errors
```
