# Effect-Atom Spec Improvement Notes

These notes capture learnings from testing the effect-atom skill file through practical refactoring of the reCAPTCHA service to use `@effect-atom/atom-react`.

## Issues Encountered

### 1. Effect.fn vs Effect.fnUntraced

**Skill file currently states:** Use `Effect.fnUntraced` for function atoms

**Issue:** In practice, `Effect.fn` works better with `runtime.fn()`:
```typescript
// WORKS (Effect.fn)
export const myAtom = runtime.fn(
  Effect.fn(function* (arg: string) {
    const registry = yield* Registry.AtomRegistry;
    // ...
  })
);

// MAY HAVE TYPE ISSUES (Effect.fnUntraced with explicit generator return type)
export const myAtom = runtime.fn(
  Effect.fnUntraced(function* (arg: string): Generator<unknown, string, unknown> {
    // TypeScript may complain about iterator types
  })
);
```

**Recommendation:** Update skill to recommend `Effect.fn` as the default, with `Effect.fnUntraced` only when tracing overhead is a concern.

### 2. Promise Return Type from Function Atoms

**Missing from skill:** How to get values back from function atoms as Promises.

**Pattern discovered:**
```typescript
// Define the atomPromise mode
export const atomPromise = { mode: "promise" } as const;

// Use with useAtomSet to get Promise<T> back
const executeFn = useAtomSet(executeAtom, atomPromise);
const result = await executeFn(args); // Returns Promise<T>
```

**Recommendation:** Add section on "Getting Return Values from Function Atoms" with the `atomPromise` pattern.

### 3. exactOptionalPropertyTypes TypeScript Setting

**Issue:** The codebase uses `exactOptionalPropertyTypes: true`, which means `undefined` cannot be passed where optional properties are expected.

**Problematic pattern:**
```typescript
// FAILS with exactOptionalPropertyTypes
const opts = {
  language: config.language,  // string | undefined
  // ...
};
someFunction(opts);  // Error: undefined not assignable to optional string
```

**Working pattern:**
```typescript
// WORKS: Pass values directly without intermediate object
someFunction(
  config.language,  // Let the function signature handle undefined
  config.otherProp ?? defaultValue
);
```

**Recommendation:** Add note about TypeScript strict mode compatibility when working with optional properties.

### 4. Registry.AtomRegistry Usage Pattern

**Needs clarification:** The skill shows `registry.get(atom)` and `registry.set(atom, value)` but doesn't fully explain the setup.

**Complete pattern:**
```typescript
export const myAtom = runtime.fn(
  Effect.fn(function* (arg: string) {
    // Yield the registry service to get the actual registry
    const registry = yield* Registry.AtomRegistry;

    // Now you can read and write atoms imperatively
    const currentValue = registry.get(someStateAtom);
    registry.set(someStateAtom, newValue);
  })
);
```

**Recommendation:** Add explicit example showing the `yield*` pattern for getting the registry.

### 5. Module-level Mutable State for Browser Callbacks

**Issue:** When integrating with browser APIs that use callbacks (like Google ReCaptcha's onload), the callback runs outside the Effect runtime and needs access to state.

**Pattern discovered:**
```typescript
// Module-level mutable state for browser callback access
let storedCallbackName = "";

export const initAtom = runtime.fn(
  Effect.fn(function* (config: Config) {
    const registry = yield* Registry.AtomRegistry;

    storedCallbackName = generateCallbackName();

    // Browser callback can't use Effect, uses mutable state
    window[storedCallbackName] = () => {
      // Update atom state via registry
      registry.set(stateAtom, newState);
    };
  })
);
```

**Recommendation:** Add section on "Integrating with Browser Callbacks" covering when module-level mutable state is necessary.

### 6. State Atom Design

**Helpful pattern:** Using a single state atom with all related state vs multiple derived atoms.

```typescript
// Single source of truth
type State = {
  readonly isLoaded: boolean;
  readonly instance: O.Option<Instance>;
  readonly config: O.Option<Config>;
};

export const stateAtom = Atom.make<State>(initialState);

// Derived atoms for specific values
export const isReadyAtom = Atom.make((get) => {
  const state = get(stateAtom);
  return state.isLoaded && O.isSome(state.instance);
});
```

**Recommendation:** Add section on "State Atom Architecture Patterns".

## Recommended Skill File Updates

1. **Change default Effect function recommendation** from `Effect.fnUntraced` to `Effect.fn`
2. **Add "Return Values from Function Atoms" section** with `atomPromise` pattern
3. **Add TypeScript strict mode notes** for optional properties
4. **Expand Registry.AtomRegistry example** to show the `yield*` pattern clearly
5. **Add "Browser Integration" section** for callback-based APIs
6. **Add "State Architecture" section** showing single-state-atom pattern

## Summary

The skill file provides good foundational knowledge about effect-atom patterns, but real-world usage revealed several practical patterns that weren't covered. The main gaps are around:
- Getting return values from function atoms
- TypeScript strict mode compatibility
- Browser API integration patterns
- State architecture recommendations
