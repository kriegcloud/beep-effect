# Effect API Research: Lexical Utils Refactor

**Generated**: 2026-01-27
**Researcher**: MCP Researcher Agent
**Purpose**: Document Effect APIs needed for transforming Lexical utilities

---

## 1. effect/Stream (PRIORITY: HIGH)

### Import
```typescript
import * as Stream from "effect/Stream"
```

### Key APIs

#### Stream.fromAsyncIterable
**Purpose**: Convert AsyncIterableIterator to Effect Stream

**Usage**:
```typescript
import * as Stream from "effect/Stream"
import * as Effect from "effect/Effect"

// Converting async generator to Stream
async function* asyncGen() {
  yield 1
  yield 2
  yield 3
}

const stream = Stream.fromAsyncIterable(
  asyncGen(),
  (error) => new Error(String(error))  // Error handler REQUIRED
)

// Consuming the stream
const program = Stream.runCollect(stream)
// Result: Chunk([1, 2, 3])
```

**Gotchas**:
- MUST provide error handler function as second argument
- AsyncIterableIterator is consumed only once
- Use Stream.runCollect to materialize all values

#### Stream.unfold
**Purpose**: Create stream from stateful iteration (replacement for stateful generators)

**Usage**:
```typescript
import * as Stream from "effect/Stream"
import * as O from "effect/Option"

// Generate sequence with state
const countdown = Stream.unfold(
  5,  // Initial state
  (n) => n > 0 ? O.some([n, n - 1]) : O.none()
)

const program = Stream.runCollect(countdown)
// Result: Chunk([5, 4, 3, 2, 1])
```

**Gotchas**:
- Return `O.none()` to terminate stream
- Return `O.some([value, nextState])` to continue
- State is immutable - return new state each iteration

#### Stream.runCollect
**Purpose**: Consume entire stream into Chunk

**Usage**:
```typescript
import * as Stream from "effect/Stream"
import * as Effect from "effect/Effect"

const stream = Stream.make(1, 2, 3, 4, 5)

const program = Effect.gen(function* () {
  const chunk = yield* Stream.runCollect(stream)
  // chunk is Chunk<number>

  // Convert to array if needed
  const array = Array.from(chunk)
  return array
})
```

**Gotchas**:
- Returns `Effect<Chunk<A>>` (NOT Array)
- Use `Array.from(chunk)` or `A.fromIterable(chunk)` to convert to array
- Stream is consumed - cannot be reused

#### Stream.mapEffect
**Purpose**: Transform stream elements with effectful functions

**Usage**:
```typescript
import * as Stream from "effect/Stream"
import * as Effect from "effect/Effect"

const fetchData = (id: number) =>
  Effect.succeed({ id, data: `Data ${id}` })

const stream = Stream.make(1, 2, 3)

const program = stream.pipe(
  Stream.mapEffect(fetchData),
  Stream.runCollect
)
```

**Gotchas**:
- Use `Stream.mapEffect` for effectful transforms (NOT `Stream.map`)
- Effects run sequentially by default
- For concurrency, use `Stream.mapEffectPar`

#### ReadableStream Integration Pattern

```typescript
import * as Stream from "effect/Stream"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"

// Using unfold with ReadableStreamDefaultReader
const readStream = <T>(reader: ReadableStreamDefaultReader<T>) =>
  Stream.unfold(reader, (r) =>
    Effect.gen(function* () {
      const result = yield* Effect.promise(() => r.read())
      if (result.done) return O.none()
      return O.some([result.value, r] as const)
    }).pipe(Effect.option)  // Convert to Option
  )

// Alternative: Use fromAsyncIterable if stream is async iterable
const convertReadableStream = <T>(readable: ReadableStream<T>) =>
  Stream.fromAsyncIterable(
    readable as unknown as AsyncIterable<T>,
    (error) => new Error(String(error))
  )
```

---

## 2. effect/HashSet (PRIORITY: HIGH)

### Import
```typescript
import * as HashSet from "effect/HashSet"
```

### Key APIs

#### HashSet.make
**Purpose**: Create HashSet from values

**Usage**:
```typescript
import * as HashSet from "effect/HashSet"

const set = HashSet.make(1, 2, 3, 2, 1)
// Result: HashSet containing [1, 2, 3] (duplicates removed)
```

#### HashSet.fromIterable
**Purpose**: Create HashSet from array or iterable

**Usage**:
```typescript
import * as HashSet from "effect/HashSet"

const array = ["http:", "https:", "mailto:", "sms:", "tel:"]
const set = HashSet.fromIterable(array)
```

**Gotchas**:
- More efficient than `HashSet.make(...array)` for large collections

#### HashSet.has
**Purpose**: Check membership

**Usage**:
```typescript
import * as HashSet from "effect/HashSet"

const SUPPORTED_PROTOCOLS = HashSet.fromIterable(["http:", "https:"])
const isSupported = HashSet.has(SUPPORTED_PROTOCOLS, "https:")  // true
```

**Gotchas**:
- `HashSet.has(set, value)` (NOT `set.has(value)`)
- Uses structural equality

#### HashSet.add / HashSet.remove
**Purpose**: Add or remove elements (returns NEW HashSet)

**Usage**:
```typescript
import * as HashSet from "effect/HashSet"
import * as F from "effect/Function"

const set1 = HashSet.make(1, 2, 3)
const set2 = HashSet.add(set1, 4)  // [1, 2, 3, 4]
const set3 = HashSet.remove(set2, 2)  // [1, 3, 4]

// Original unchanged (immutable)
HashSet.has(set1, 4)  // false

// Chaining with pipe
const result = F.pipe(
  HashSet.empty<string>(),
  HashSet.add("foo"),
  HashSet.add("bar")
)
```

**Gotchas**:
- Returns NEW HashSet (immutable)
- Use `F.pipe` for chaining operations

#### HashSet.size
**Purpose**: Get element count

**Usage**:
```typescript
import * as HashSet from "effect/HashSet"

const set = HashSet.make(1, 2, 3)
const count = HashSet.size(set)  // 3

// Check if empty
const isEmpty = HashSet.isEmpty(set)  // false (preferred over size === 0)
```

---

## 3. effect/String (PRIORITY: MEDIUM)

### Import
```typescript
import * as Str from "effect/String"
```

### Key APIs

#### Str.split
**Purpose**: Split string by delimiter

**Usage**:
```typescript
import * as Str from "effect/String"

const text = "foo,bar,baz"
const parts = Str.split(text, ",")
// Result: ["foo", "bar", "baz"]
```

**Gotchas**:
- Delimiter is **plain string only** (NOT regex)
- Returns ReadonlyArray
- For regex split, use native `.split()` then `A.fromIterable`

#### Str.toLowerCase / Str.toUpperCase
**Purpose**: Case conversion

**Usage**:
```typescript
import * as Str from "effect/String"

const lower = Str.toLowerCase("HELLO")  // "hello"
const upper = Str.toUpperCase("world")  // "WORLD"
```

#### Str.slice
**Purpose**: Extract substring

**Usage**:
```typescript
import * as Str from "effect/String"

const text = "Hello, World!"
const sub1 = Str.slice(text, 0, 5)  // "Hello"
const sub2 = Str.slice(text, 7)     // "World!"
```

### Missing APIs (Use Native)

**Str.replace** - NOT available
```typescript
// Use native .replace() for regex operations
const encoded = str.replace(/\//g, '_').replace(/\+/g, '-')
```

**Str.join** - NOT available (use effect/Array)
```typescript
import * as A from "effect/Array"
const joined = A.join(["foo", "bar", "baz"], ",")  // "foo,bar,baz"
```

---

## 4. effect/Array (PRIORITY: MEDIUM)

### Import
```typescript
import * as A from "effect/Array"
```

### Key APIs

#### A.map / A.filter / A.join
**Usage**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

const numbers = [1, 2, 3, 4, 5]

// Standalone calls
const doubled = A.map(numbers, n => n * 2)
const evens = A.filter(numbers, n => n % 2 === 0)
const joined = A.join(["foo", "bar", "baz"], ",")

// Pipe composition
const result = F.pipe(
  numbers,
  A.filter(n => n > 2),
  A.map(n => n * 2),
  A.join(", ")
)
// "6, 8, 10"
```

**Gotchas**:
- `A.map(array, fn)` NOT `array.map(fn)`
- Returns ReadonlyArray
- Use `F.pipe` for method chaining

#### A.reduce / A.flatMap
**Usage**:
```typescript
import * as A from "effect/Array"

// Reduce
const sum = A.reduce([1, 2, 3, 4], 0, (acc, n) => acc + n)
// Result: 10

// FlatMap
const doubled = A.flatMap([1, 2, 3], n => [n, n * 2])
// Result: [1, 2, 2, 4, 3, 6]
```

**Gotchas**:
- `A.reduce` signature: `(array, initial, reducer)` - initial is SECOND arg

#### A.head / A.last (Safe Access)
**Usage**:
```typescript
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as F from "effect/Function"

const array = [1, 2, 3]

// Returns Option<T>
const first = A.head(array)  // O.some(1)
const last = A.last(array)   // O.some(3)
const empty = A.head([])     // O.none()

// Extract with default
const value = F.pipe(
  A.head(array),
  O.getOrElse(() => 0)
)
// Result: 1
```

**Gotchas**:
- Returns `Option<T>` NOT nullable
- NEVER use `array[0]` - use `A.head`

#### A.fromIterable
**Usage**:
```typescript
import * as A from "effect/Array"

// From Set
const fromSet = A.fromIterable(new Set([1, 2, 3]))

// From Chunk (after Stream.runCollect)
const fromChunk = A.fromIterable(chunk)

// From generator
function* gen() { yield 1; yield 2; yield 3; }
const fromGen = A.fromIterable(gen())
```

---

## 5. effect/Option (PRIORITY: MEDIUM)

### Import
```typescript
import * as O from "effect/Option"
```

### Key APIs

#### O.fromNullable
**Purpose**: Convert nullable value to Option

**Usage**:
```typescript
import * as O from "effect/Option"

const value1 = O.fromNullable("hello")    // O.some("hello")
const value2 = O.fromNullable(null)       // O.none()
const value3 = O.fromNullable(undefined)  // O.none()
```

**Gotchas**:
- Treats both `null` AND `undefined` as none

#### O.map / O.flatMap
**Purpose**: Transform Option contents

**Usage**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

// Map
const doubled = F.pipe(
  O.some(5),
  O.map(n => n * 2)
)  // O.some(10)

// FlatMap (when transform returns Option)
const safe = F.pipe(
  O.some(5),
  O.flatMap(n => n > 0 ? O.some(n * 2) : O.none())
)
```

#### O.getOrElse
**Purpose**: Extract value with default

**Usage**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const value = F.pipe(
  O.none<number>(),
  O.getOrElse(() => 0)
)
// Result: 0
```

**Gotchas**:
- Takes a **function** (lazy evaluation): `O.getOrElse(() => default)`
- NOT `O.getOrElse(default)`

#### O.match
**Purpose**: Pattern match on Option

**Usage**:
```typescript
import * as O from "effect/Option"
import * as F from "effect/Function"

const message = F.pipe(
  O.some(42),
  O.match({
    onNone: () => "No value",
    onSome: (n) => `Value is ${n}`
  })
)
// "Value is 42"
```

---

## 6. effect/Predicate (PRIORITY: MEDIUM)

### Import
```typescript
import * as P from "effect/Predicate"
```

### Key APIs

#### P.isNotNull / P.isNotUndefined
**Purpose**: Type-safe null/undefined checks

**Usage**:
```typescript
import * as P from "effect/Predicate"
import * as A from "effect/Array"

const values = [1, null, 2, undefined, 3]

// Filter out nulls
const notNull = A.filter(values, P.isNotNull)
// [1, 2, undefined, 3] - TypeScript knows these aren't null

// Filter out both null and undefined
const defined = A.filter(values, value =>
  P.isNotNull(value) && P.isNotUndefined(value)
)
// [1, 2, 3]
```

#### P.isString / P.isNumber
**Purpose**: Type guards for primitives

**Usage**:
```typescript
import * as P from "effect/Predicate"
import * as A from "effect/Array"

const mixed = [1, "hello", 2, "world", null]

const strings = A.filter(mixed, P.isString)
// ["hello", "world"] - typed as string[]

const numbers = A.filter(mixed, P.isNumber)
// [1, 2] - typed as number[]
```

**Gotchas**:
- TypeScript infers narrowed type automatically
- Replaces `typeof x === "string"` pattern

#### P.isTruthy / P.isFalsy
**Purpose**: Check truthiness/falsiness

**Usage**:
```typescript
import * as P from "effect/Predicate"
import * as A from "effect/Array"

const values = [0, 1, "", "hello", null, undefined, false, true]

const truthy = A.filter(values, P.isTruthy)
// [1, "hello", true]

const falsy = A.filter(values, P.isFalsy)
// [0, "", null, undefined, false]
```

---

## 7. effect/Schema (PRIORITY: HIGH)

### Import
```typescript
import * as S from "effect/Schema"
```

### Key APIs

#### S.pattern()
**Purpose**: String validation with regex

**Usage**:
```typescript
import * as S from "effect/Schema"

// URL pattern validation
const UrlSchema = S.String.pipe(
  S.pattern(/^https?:\/\/.+/)
)

// Decoding
S.decodeUnknownSync(UrlSchema)("https://example.com")
// "https://example.com"

S.decodeUnknownSync(UrlSchema)("not a url")
// Throws: ParseError

// Combining with other constraints
const StrictUrlSchema = S.String.pipe(
  S.nonEmptyString(),
  S.pattern(/^https?:\/\/.+/),
  S.maxLength(2048)
)
```

**Gotchas**:
- Use `S.pattern()` (lowercase)
- Validation happens during **decode**, not encode
- Combine with other string filters via `pipe`

#### S.decodeUnknownSync
**Purpose**: Parse/validate unknown input (replaces JSON.parse validation)

**Usage**:
```typescript
import * as S from "effect/Schema"

// Define schema
const PersonSchema = S.Struct({
  name: S.String,
  age: S.Number
})

// Parse JSON string
const jsonString = '{"name":"Alice","age":30}'
const parsed = S.decodeUnknownSync(S.parseJson(PersonSchema))(jsonString)
// { name: "Alice", age: 30 }

// Validate unknown data
const unknownData: unknown = { name: "Bob", age: 25 }
const validated = S.decodeUnknownSync(PersonSchema)(unknownData)
```

**Gotchas**:
- Throws on validation failure (NOT Effect)
- For Effect-based: use `S.decodeUnknown` (returns Effect)
- `S.parseJson(schema)` combines JSON parsing + validation

#### S.encodeSync
**Purpose**: Serialize to output format

**Usage**:
```typescript
import * as S from "effect/Schema"

const DocSchema = S.Struct({
  content: S.String,
  createdAt: S.DateFromString  // Date <-> ISO string
})

const doc = {
  content: "Hello",
  createdAt: new Date("2024-01-01")
}

const encoded = S.encodeSync(DocSchema)(doc)
// { content: "Hello", createdAt: "2024-01-01T00:00:00.000Z" }

// Then stringify
const json = JSON.stringify(encoded)
```

**Gotchas**:
- Transforms internal types to wire types
- Combine with `JSON.stringify` for final JSON output

---

## Common Gotchas Summary

| Pattern | Gotcha | Solution |
|---------|--------|----------|
| Stream.fromAsyncIterable | Must provide error handler | `Stream.fromAsyncIterable(iter, err => new Error(String(err)))` |
| HashSet operations | Returns new HashSet (immutable) | Use `F.pipe` for chaining |
| Array operations | Signature: `A.map(array, fn)` | Import `* as A` and use module functions |
| Option.getOrElse | Takes function, not value | `O.getOrElse(() => default)` |
| Schema.pattern | Applied during decode only | Validate inputs, not outputs |
| Stream.runCollect | Returns Chunk, not Array | Use `A.fromIterable(chunk)` |
| Str.split | No regex support | Use native `.split()` for regex |
| Str.replace | NOT available | Use native `.replace()` |

---

## Migration Patterns

### Async Generator -> Stream
```typescript
// Before
async function* generateReader(reader) {
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    yield value
  }
}

// After
const readStream = (reader) =>
  Stream.unfold(reader, (r) =>
    Effect.gen(function* () {
      const result = yield* Effect.promise(() => r.read())
      return result.done ? O.none() : O.some([result.value, r])
    }).pipe(Effect.option)
  )
```

### Set -> HashSet
```typescript
// Before
const seen = new Set<string>()
seen.add("foo")
if (seen.has("bar")) { ... }

// After
let seen = HashSet.empty<string>()
seen = HashSet.add(seen, "foo")
if (HashSet.has(seen, "bar")) { ... }
```

### Array Methods -> Effect/Array
```typescript
// Before
const result = array.map(x => x * 2).filter(x => x > 0).join(", ")

// After
const result = F.pipe(
  array,
  A.map(x => x * 2),
  A.filter(x => x > 0),
  A.join(", ")
)
```

### try/catch -> Effect.try
```typescript
// Before
try {
  const url = new URL(input)
  return url.protocol
} catch {
  return null
}

// After
Effect.try({
  try: () => new URL(input),
  catch: () => new InvalidUrlError()
}).pipe(
  Effect.map(url => url.protocol),
  Effect.option
)
```

---

## References

- Effect Documentation: https://effect.website/docs/
- Stream Guide: https://effect.website/docs/guides/streaming
- Schema Guide: https://effect.website/docs/guides/schema/introduction
- Project patterns: `.claude/rules/effect-patterns.md`
