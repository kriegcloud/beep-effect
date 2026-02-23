# Codebase Analysis: Lexical Utils for Effect Refactor

**Generated**: 2026-01-27
**Analyst**: Codebase Researcher Agent
**Scope**: `apps/todox/src/app/lexical/utils/`

## Summary

Analysis of 10 utility files identifying native JavaScript patterns that require refactoring to Effect idioms per project standards defined in CLAUDE.md and `.claude/rules/effect-patterns.md`.

---

## File-by-File Analysis

### docSerialization.ts

**Location**: `apps/todox/src/app/lexical/utils/docSerialization.ts`
**Lines of Code**: 86
**Complexity**: High

**Native String Methods**:
- Line 58: `.replace(/\//g, '_')` - Base64 URL-safe encoding
- Line 59: `.replace(/\+/g, '-')` - Base64 URL-safe encoding
- Line 60: `.replace(/=+$/, '')` - Base64 padding removal
- Line 72: `.replace(/_/g, '/').replace(/-/g, '+')` - Base64 URL-safe decoding
- Line 75: `b64.charCodeAt(i)` - Character code extraction

**Native Array Methods**:
- Line 42: `output.push(String.fromCharCode(...))` - Accumulate string chunks
- Line 45: `output.join('')` - Join accumulated strings
- Line 82: `output.push(chunk)` - Accumulate decompressed chunks
- Line 85: `output.join('')` - Join decompressed chunks

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- Line 21: `async function* generateReader<T = any>` - Async generator function
- Line 26: `await reader.read()` - Await stream read
- Line 35: `async function readBytestoString` - Async function
- Line 40: `for await (const value of generateReader(reader))` - Async iteration
- Line 48: `export async function docToHash` - Async function
- Line 51: `await Promise.all([...])` - Parallel async operations
- Line 63: `export async function docFromHash` - Async function
- Line 79: `for await (const chunk of generateReader(...))` - Async iteration
- Line 84: `await closed` - Await completion

**Null/Undefined Handling**:
- Line 28: `if (value !== undefined)` - Undefined check for yield value

**Error Handling**:
- None (silent failure modes)

**External Dependencies**:
- Line 9: `import type {SerializedDocument} from '@lexical/file'` - Lexical types
- Line 10-15: Effect imports (already partially migrated but unused)
- Web APIs: `CompressionStream`, `DecompressionStream`, `TextEncoder`, `TextDecoderStream`, `Uint8Array`, `JSON.parse`, `JSON.stringify`, `btoa`, `atob`, `String.fromCharCode`

**Notes**: This file has partially imported Effect modules but does not use them. High complexity due to streaming compression/decompression logic. Prime candidate for Effect Stream refactoring.

---

### swipe.ts

**Location**: `apps/todox/src/app/lexical/utils/swipe.ts`
**Lines of Code**: 127
**Complexity**: Medium

**Native String Methods**:
- None

**Native Array Methods**:
- None (uses Set methods instead)

**Native Collections Used**:
- Line 13: `listeners: Set<Listener>` - Type declaration for Set
- Line 18: `const elements = new WeakMap<HTMLElement, ElementValues>()` - WeakMap for element tracking
- Line 31: `const listeners = new Set<Listener>()` - Set creation for listeners
- Line 63: `elementValues.listeners.add(cb)` - Set.add
- Line 73: `listeners.delete(cb)` - Set.delete
- Line 74: `if (listeners.size === 0)` - Set.size

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- Line 22: `if (touch === undefined)` - Touch check
- Line 30: `if (elementValues === undefined)` - Map get check
- Line 33: `if (elementValues !== undefined)` - Nested check
- Line 38: `if (elementValues === undefined)` - Handler null guard
- Line 42: `if (start === null)` - Null check
- Line 47: `if (end !== null)` - Null check
- Line 69: `if (elementValues === undefined)` - Delete guard

**Error Handling**:
- None

**External Dependencies**:
- DOM APIs: `HTMLElement`, `TouchEvent`, `addEventListener`, `removeEventListener`, `changedTouches`

**Control Flow**:
- Line 46: `for (const listener of listeners)` - For...of iteration

**Math Operations**:
- Line 87: `Math.abs(y)` - Absolute value comparison
- Line 99: `Math.abs(y)` - Absolute value comparison
- Line 111: `Math.abs(x)` - Absolute value comparison
- Line 123: `Math.abs(x)` - Absolute value comparison

---

### url.ts

**Location**: `apps/todox/src/app/lexical/utils/url.ts`
**Lines of Code**: 38
**Complexity**: Low

**Native String Methods**:
- None (uses RegExp test method)

**Native Array Methods**:
- None

**Native Collections Used**:
- Line 9: `const SUPPORTED_URL_PROTOCOLS = new Set([...])` - Set for protocol lookup
- Line 21: `SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)` - Set.has

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- None

**Error Handling**:
- Line 18: `try {` - Try block for URL parsing
- Line 24: `} catch {` - Catch block (ignores parsing errors)

**External Dependencies**:
- Web APIs: `new URL(url)` (Line 19), `new RegExp(...)` (Line 31)

---

### focusUtils.ts

**Location**: `apps/todox/src/app/lexical/utils/focusUtils.ts`
**Lines of Code**: 36
**Complexity**: Low

**Native String Methods**:
- None

**Native Array Methods**:
- None

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- Line 24: `el?.focus()` - Optional chaining for focus
- Line 35: `return event?.detail === 0` - Optional chaining for detail

**Error Handling**:
- None

**External Dependencies**:
- DOM APIs: `HTMLElement`, `querySelector`, `focus()`, `MouseEvent`, `PointerEvent`, `React.MouseEvent`

**Type Assertions**:
- Line 17: `as HTMLElement` - Casting querySelector result

---

### getDOMRangeRect.ts

**Location**: `apps/todox/src/app/lexical/utils/getDOMRangeRect.ts`
**Lines of Code**: 27
**Complexity**: Low

**Native String Methods**:
- None

**Native Array Methods**:
- None

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- Line 18: `while (inner.firstElementChild != null)` - Null check in while loop

**Error Handling**:
- None

**External Dependencies**:
- DOM APIs: `Selection`, `HTMLElement`, `getRangeAt`, `getBoundingClientRect`, `firstElementChild`, `DOMRect`

**Type Assertions**:
- Line 19: `inner.firstElementChild as HTMLElement` - Casting element child

---

### getSelectedNode.ts

**Location**: `apps/todox/src/app/lexical/utils/getSelectedNode.ts`
**Lines of Code**: 27
**Complexity**: Low

**Native String Methods**:
- None

**Native Array Methods**:
- None

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- None

**Error Handling**:
- None

**External Dependencies**:
- Line 8: `import {$isAtNodeEnd} from '@lexical/selection'` - Lexical selection utility
- Line 9: `import type {ElementNode, RangeSelection, TextNode} from 'lexical'` - Lexical types

---

### getThemeSelector.ts

**Location**: `apps/todox/src/app/lexical/utils/getThemeSelector.ts`
**Lines of Code**: 25
**Complexity**: Low

**Native String Methods**:
- Line 22: `.split(/\s+/g)` - Split on whitespace

**Native Array Methods**:
- Line 23: `.map((cls) => \`.${cls}\`)` - Map class names to selectors
- Line 24: `.join()` - Join into selector string

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- Line 15: `getTheme()?.[name]` - Optional chaining for theme access

**Error Handling**:
- Line 17: `throw new Error(...)` - Error throw for missing theme property

**External Dependencies**:
- Line 9: `import type {EditorThemeClasses} from 'lexical'` - Lexical types

**Type Narrowing**:
- Line 16: `if (typeof className !== 'string')` - typeof check

---

### joinClasses.ts

**Location**: `apps/todox/src/app/lexical/utils/joinClasses.ts`
**Lines of Code**: 13
**Complexity**: Low

**Native String Methods**:
- None

**Native Array Methods**:
- Line 12: `args.filter(Boolean)` - Filter falsy values
- Line 12: `.join(' ')` - Join with space

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- None (handled by Boolean filter)

**Error Handling**:
- None

**External Dependencies**:
- None (pure utility)

---

### setFloatingElemPosition.ts

**Location**: `apps/todox/src/app/lexical/utils/setFloatingElemPosition.ts`
**Lines of Code**: 74
**Complexity**: Medium

**Native String Methods**:
- None

**Native Array Methods**:
- None

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- Line 21: `if (targetRect === null || !scrollerElem)` - Null and falsy check

**Error Handling**:
- None

**External Dependencies**:
- DOM APIs: `HTMLElement`, `DOMRect`, `window.getSelection()`, `Selection.getRangeAt()`, `window.getComputedStyle()`, `getBoundingClientRect()`, `parentElement`, `Node.ELEMENT_NODE`, `startContainer`, `nodeType`, `style.opacity`, `style.transform`

**Type Assertions**:
- Line 42: `(textNode as Element)` - Casting text node to Element
- Line 43: `(textNode.parentElement as Element)` - Casting parent element

---

### setFloatingElemPositionForLinkEditor.ts

**Location**: `apps/todox/src/app/lexical/utils/setFloatingElemPositionForLinkEditor.ts`
**Lines of Code**: 46
**Complexity**: Low

**Native String Methods**:
- None

**Native Array Methods**:
- None

**Native Collections Used**:
- None

**Async/Promise Patterns**:
- None

**Null/Undefined Handling**:
- Line 20: `if (targetRect === null || !scrollerElem)` - Null and falsy check

**Error Handling**:
- None

**External Dependencies**:
- DOM APIs: `HTMLElement`, `DOMRect`, `getBoundingClientRect()`, `parentElement`, `style.opacity`, `style.transform`

---

## Summary Statistics

| File | LOC | Complexity | Native Strings | Native Arrays | Collections | Async | Null/Undefined | Errors |
|------|-----|------------|----------------|---------------|-------------|-------|----------------|--------|
| docSerialization.ts | 86 | High | 5 | 4 | 0 | 9 | 1 | 0 |
| swipe.ts | 127 | Medium | 0 | 0 | 6 | 0 | 6 | 0 |
| url.ts | 38 | Low | 0 | 0 | 2 | 0 | 0 | 1 |
| focusUtils.ts | 36 | Low | 0 | 0 | 0 | 0 | 2 | 0 |
| getDOMRangeRect.ts | 27 | Low | 0 | 0 | 0 | 0 | 1 | 0 |
| getSelectedNode.ts | 27 | Low | 0 | 0 | 0 | 0 | 0 | 0 |
| getThemeSelector.ts | 25 | Low | 1 | 2 | 0 | 0 | 1 | 1 |
| joinClasses.ts | 13 | Low | 0 | 2 | 0 | 0 | 0 | 0 |
| setFloatingElemPosition.ts | 74 | Medium | 0 | 0 | 0 | 0 | 1 | 0 |
| setFloatingElemPositionForLinkEditor.ts | 46 | Low | 0 | 0 | 0 | 0 | 1 | 0 |

**Totals**: 499 LOC, 6 native string methods, 8 native array methods, 8 collection operations, 9 async patterns, 13 null/undefined checks, 2 error handling sites

---

## Refactoring Priority

### Tier 1: High Priority (Complex, Many Patterns)

1. **docSerialization.ts**
   - 9 async patterns requiring Effect conversion
   - 5 string methods requiring native usage (no Effect replacement for `.replace()`)
   - 4 array methods requiring A.* conversion
   - Async generators -> Effect Stream
   - Promise.all -> Effect.all
   - Most complex file requiring full Effect Stream refactor

2. **swipe.ts**
   - 6 collection operations (Set/WeakMap) -> MutableHashSet/MutableHashMap
   - 6 null checks -> Option handling
   - State management pattern needs Effect Ref
   - Event listener pattern could use Effect Scope

### Tier 2: Medium Priority (Some Patterns)

3. **getThemeSelector.ts**
   - 1 string method: `.split()` - need to verify Str.split regex support
   - 2 array methods: `.map()`, `.join()` -> `A.map()`, `A.join()`
   - 1 error throw -> S.TaggedError
   - typeof check -> P.isString

4. **joinClasses.ts**
   - 2 array methods: `.filter()`, `.join()` -> `A.filter()`, `A.join()`
   - Simple utility conversion

### Tier 3: Low Priority (Minimal Changes)

5. **url.ts**
   - 2 collection ops: new Set, .has() -> HashSet
   - 1 try/catch -> Effect.try

6. **focusUtils.ts**
   - 2 optional chains -> O.fromNullable pipelines
   - Type assertion -> Effect-based DOM query

7. **getDOMRangeRect.ts**
   - 1 null check in while loop
   - Type assertion -> Effect-based traversal
   - DOM-centric, minimal Effect benefit

8. **setFloatingElemPosition.ts**
   - 1 null check
   - 2 type assertions
   - DOM positioning logic, minimal Effect benefit

9. **setFloatingElemPositionForLinkEditor.ts**
   - 1 null check
   - Similar to setFloatingElemPosition.ts

10. **getSelectedNode.ts**
    - Pure Lexical integration
    - No native patterns to refactor
    - Already Effect-compatible

---

## Pattern Mapping Reference

### String Methods -> Effect/String

| Native | Effect | Notes |
|--------|--------|-------|
| `str.split(sep)` | `Str.split(str, sep)` | Delimiter only, NOT regex |
| `str.replace(pat, rep)` | Native `.replace()` | NOT available in effect/String |
| `str.charCodeAt(i)` | Native `.charCodeAt()` | Low-level binary operation |

### Array Methods -> Effect/Array

| Native | Effect | Example |
|--------|--------|---------|
| `arr.push(x)` | `A.append(arr, x)` | Immutable |
| `arr.join(sep)` | `A.join(arr, sep)` | |
| `arr.filter(fn)` | `A.filter(arr, fn)` | |
| `arr.map(fn)` | `A.map(arr, fn)` | |

### Collections -> Effect Collections

| Native | Effect | Notes |
|--------|--------|-------|
| `new Set()` | `HashSet.empty()` or `MutableHashSet.make()` | |
| `set.has(x)` | `HashSet.has(set, x)` | |
| `set.add(x)` | `HashSet.add(set, x)` | Returns new HashSet |
| `set.delete(x)` | `HashSet.remove(set, x)` | Returns new HashSet |
| `set.size` | `HashSet.size(set)` | |
| `new WeakMap()` | Consider `Ref` or `FiberRef` | For element-keyed state |

### Async -> Effect

| Native | Effect | Notes |
|--------|--------|-------|
| `async function` | `Effect.gen(function* () {...})` | |
| `await x` | `yield* x` | Inside Effect.gen |
| `Promise.all([a, b])` | `Effect.all([a, b])` | Parallel execution |
| `async function*` | `Stream.fromAsyncIterable` or `Stream.unfold` | |
| `for await (x of gen)` | `Stream.runForEach` | Stream consumption |

### Null Handling -> Option

| Native | Effect | Notes |
|--------|--------|-------|
| `x === null` | `O.isNone(O.fromNullable(x))` | |
| `x !== undefined` | `O.isSome(O.fromNullable(x))` | |
| `x?.method()` | `O.map(O.fromNullable(x), _ => _.method())` | |
| `x ?? default` | `O.getOrElse(O.fromNullable(x), () => default)` | |

### Error Handling -> Effect

| Native | Effect | Notes |
|--------|--------|-------|
| `throw new Error(msg)` | `Effect.fail(new MyError({ message: msg }))` | Define TaggedError |
| `try { } catch { }` | `Effect.try({ try: ..., catch: ... })` | |

---

## Known Gaps and Risks

### Missing Effect APIs
1. **Str.replace()** - NOT available, must use native `.replace()` for regex operations
2. **Str.split()** - Does NOT support regex delimiter, only string delimiter
3. **WeakMap equivalent** - No direct Effect equivalent; consider Ref/FiberRef patterns

### Risks
1. **Breaking changes** - Function signatures changing from `Promise<T>` to `Effect<T, E, R>`
2. **ReadableStream compatibility** - Web API integration may need careful handling
3. **DOM operations** - Many files are DOM-centric; Effect wrapping adds minimal value

### Recommendations
1. Keep native `.replace()` for complex string operations
2. For Str.split with regex, use native split then `A.fromIterable`
3. Consider whether DOM-centric files benefit from Effect refactoring
