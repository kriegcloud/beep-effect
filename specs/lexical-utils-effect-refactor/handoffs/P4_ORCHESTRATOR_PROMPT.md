# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 (Priority 1 Refactor) of the lexical-utils-effect-refactor spec.

### Context

Phase 3 (Schema Creation) is complete with PASS status. All required schemas are now available:
- `errors.ts` - InvalidUrlError, ParseError, InvalidDocumentHashError, CompressionError
- `url.schema.ts` - SanitizedUrl, SupportedProtocol, UrlValidationResult
- `doc.schema.ts` - SerializedDocument, DocumentHashString, SerializedDocumentConfig
- `swipe.schema.ts` - Force, TouchCoordinates, SwipeDirection, SwipeThreshold, SwipeEvent

### Your Mission

Refactor **Priority 1 (High Complexity)** files using Effect patterns:

1. **docSerialization.ts** (86 LOC, 9 async patterns)
2. **swipe.ts** (127 LOC, 6 native collections)

**This is an implementation phase** - use tools directly, don't delegate to sub-agents.

### docSerialization.ts Refactoring

**Location**: `apps/todox/src/app/lexical/utils/docSerialization.ts`

**Key Transformations**:

1. **Remove unused imports** (Effect, P, A, Str, S, $I - currently flagging as errors)

2. **Convert `docToHash` to Effect**:
```typescript
// FROM
export async function docToHash(doc: SerializedDocument): Promise<string>

// TO
export const docToHash = (doc: SerializedDocument): Effect.Effect<string, CompressionError> =>
  Effect.gen(function* () {
    // Implementation using Effect.promise for async operations
  });

// Add backward-compatible wrapper
export const docToHashPromise = (doc: SerializedDocument): Promise<string> =>
  Effect.runPromise(docToHash(doc));
```

3. **Convert `docFromHash` to Effect**:
```typescript
// FROM
export async function docFromHash(hash: string): Promise<SerializedDocument | null>

// TO
export const docFromHash = (hash: string): Effect.Effect<SerializedDocument, InvalidDocumentHashError | ParseError> =>
  Effect.gen(function* () {
    // Implementation
  });

// Add backward-compatible wrapper
export const docFromHashPromise = (hash: string): Promise<SerializedDocument | null> =>
  pipe(
    docFromHash(hash),
    Effect.option,
    Effect.runPromise
  ).then(O.getOrNull);
```

4. **Wrap stream operations with Effect.promise**:
```typescript
yield* Effect.promise(() => writer.write(data));
yield* Effect.promise(() => writer.close());
```

5. **Use Effect.try for parsing**:
```typescript
const parsed = yield* Effect.try({
  try: () => JSON.parse(output.join("")),
  catch: (e) => new ParseError({ message: String(e), input: output.join("") }),
});
```

### swipe.ts Refactoring

**Location**: `apps/todox/src/app/lexical/utils/swipe.ts`

**Key Transformations**:

1. **Replace Set with MutableHashSet**:
```typescript
// FROM
import type { ... };
const elements = new WeakMap<HTMLElement, ElementValues>();
type ElementValues = {
  listeners: Set<Listener>;
  // ...
};

// TO
import * as MutableHashSet from "effect/MutableHashSet";

type ElementValues = {
  listeners: MutableHashSet.MutableHashSet<Listener>;
  // ...
};

// In addListener:
const listeners = MutableHashSet.empty<Listener>();
// ...
MutableHashSet.add(listeners, cb);

// In deleteListener:
MutableHashSet.remove(listeners, cb);
MutableHashSet.size(listeners) === 0
```

2. **Keep native WeakMap** - no Effect equivalent, serves GC purposes

3. **Update iteration**:
```typescript
// FROM
for (const listener of listeners) {
  listener([end[0] - start[0], end[1] - start[1]], e);
}

// TO
MutableHashSet.forEach(listeners, (listener) => {
  listener([end[0] - start[0], end[1] - start[1]], e);
});
```

### Critical Patterns

**From `.claude/rules/effect-patterns.md`**:
- Namespace imports: `import * as Effect from "effect/Effect"`
- PascalCase constructors: `S.String`, `S.Number`
- Native method ban: Use `A.map()`, `Str.split()`, etc.
- **Exception**: Keep native for regex operations and WeakMap

**MutableHashSet API**:
```typescript
MutableHashSet.empty<T>()           // Create empty set
MutableHashSet.add(set, value)      // Add (mutates)
MutableHashSet.remove(set, value)   // Remove (mutates)
MutableHashSet.has(set, value)      // Check membership
MutableHashSet.size(set)            // Get size
MutableHashSet.forEach(set, fn)     // Iterate
```

### Verification

After refactoring:
1. Run `bun run check --filter @beep/todox` to verify no type errors
2. Ensure backward-compatible Promise wrappers exist
3. Test Effect functions yield properly

### Success Criteria

- [ ] `docSerialization.ts` uses Effect.gen for async operations
- [ ] `docSerialization.ts` uses TaggedError classes
- [ ] `docSerialization.ts` has Promise wrapper functions
- [ ] `swipe.ts` uses MutableHashSet instead of Set
- [ ] `swipe.ts` keeps native WeakMap
- [ ] No type errors in refactored files
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings
- [ ] `HANDOFF_P5.md` created
- [ ] `P5_ORCHESTRATOR_PROMPT.md` created

### Reference Files

- Phase 3 schemas: `apps/todox/src/app/lexical/schema/`
- Effect patterns: `.claude/rules/effect-patterns.md`
- API research: `specs/lexical-utils-effect-refactor/outputs/effect-api-research.md`
- Handoff context: `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P4.md`

### Next Phase

After completing Phase 4:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P5.md` (Priority 2-3 Refactor context)
3. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

### Notes

- **Pre-existing errors**: `docSerialization.ts` has unused imports that should be removed or utilized
- **Stream integration**: CompressionStream/DecompressionStream are Web APIs - wrap with Effect.promise
- **MutableHashSet vs HashSet**: Use Mutable variant because event handlers hold references
