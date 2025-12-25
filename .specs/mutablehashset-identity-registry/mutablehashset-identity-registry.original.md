# Implementation Prompt: MutableHashSet Identity Registry

## Objective

Extend the `@beep/identity` Identifier module to track all created identity values in a shared `MutableHashSet` registry. Every identity string produced by a `TaggedComposer` (via `compose`, `create`, `make`, or tagged template literal) should be automatically registered, allowing runtime introspection of all identities derived from a root composer.

## Expected Behavior

```typescript
import * as Identifier from "./Identifier";
import * as MutableHashSet from "effect/MutableHashSet";

export const $I = Identifier.make("beep").$BeepId;

const composers = $I.compose("shared-ui", "shared-client");

// Access the registry
const allIdentities = MutableHashSet.values($I.hashSet);
console.log([...allIdentities]);
// Output: ["@beep", "@beep/shared-ui", "@beep/shared-client"]
```

### Cross-Module Registration

When child composers are used in other files, they share the same registry:

```typescript
// In packages/shared/client/src/atom/files/errors.ts
import { $SharedClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("atom/files/errors");

export class ImageTooLargeAfterCompression extends S.TaggedError<ImageTooLargeAfterCompression>(
  $I`ImageTooLargeAfterCompression`
)("ImageTooLargeAfterCompression", { /* ... */ }) {}
```

```typescript
// Later, checking the root registry
import { $I } from "@beep/identity/packages";
import * as MutableHashSet from "effect/MutableHashSet";

console.log([...MutableHashSet.values($I.hashSet)]);
// Includes:
// - "@beep/shared-client"
// - "@beep/shared-client/atom/files/errors"
// - "@beep/shared-client/atom/files/errors/ImageTooLargeAfterCompression"
```

## Implementation Requirements

### 1. Registry Type

Use `effect/MutableHashSet` for the shared registry:

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

type Registry = MutableHashSet.MutableHashSet<string>;
```

### 2. Modify `createComposer` Function

Thread the registry through all composer creation. The function signature becomes:

```typescript
const createComposer = <const Value extends StringTypes.NonEmptyString>(
  value: Value,
  registry: Registry
): TaggedComposer<Value> => {
  // Register this composer's value
  MutableHashSet.add(registry, value);

  // ... existing implementation with registry threading
};
```

### 3. Registration Points

Register identity values at these locations:

1. **Composer creation** (`createComposer`): Register the `value` parameter
2. **Template tag invocation**: Register the composed string before returning
3. **`compose()` method**: Child composers register via `createComposer`
4. **`create()` method**: Child composer registers via `createComposer`
5. **`make()` method**: Register the produced identity string

### 4. Update `make` Factory

Create the registry at the root level and thread it through:

```typescript
export const make = <const Base extends StringTypes.NonEmptyString>(base: Base) => {
  const registry = MutableHashSet.empty<string>();
  const normalizedBase = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalizedBase);
  const composer = createComposer(baseIdentity, registry);
  // ...
};
```

### 5. Expose `hashSet` Property on `TaggedComposer`

Add the `hashSet` property to the composer object:

```typescript
tag.hashSet = registry;
```

### 6. Update Type Definitions

Extend `TaggedComposer<Value>` in the type definition:

```typescript
export type TaggedComposer<Value extends StringTypes.NonEmptyString> = {
  // ... existing members ...

  /**
   * Shared registry containing all identity strings created from this composer's root.
   * Includes identities from child composers, template tag usage, and all derivation methods.
   */
  readonly hashSet: MutableHashSet.MutableHashSet<string>;
};
```

## Files to Modify

1. **`src/Identifier.ts`** - Core implementation changes:
   - Import `MutableHashSet`
   - Add `Registry` type alias
   - Modify `createComposer` to accept and use registry
   - Add registration calls at all creation points
   - Expose `hashSet` property
   - Update `make` to create and thread registry

2. **`src/types.ts`** - Type definition updates:
   - Add `hashSet` member to `IdentityComposer` interface (if it needs updating)

3. **`test/Identity.test.ts`** - Add test coverage:
   - Test registry population via `compose`
   - Test registry population via `create`
   - Test registry population via template tags
   - Test registry population via `make` method
   - Test shared registry across child composers

## Test Cases to Add

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

describe("Identity Registry", () => {
  it("tracks identities created via compose", () => {
    const { $TestId } = Identifier.make("test");
    $TestId.compose("module-a", "module-b");

    const values = [...MutableHashSet.values($TestId.hashSet)];
    expect(values).toContain("@beep/test");
    expect(values).toContain("@beep/test/module-a");
    expect(values).toContain("@beep/test/module-b");
  });

  it("tracks identities created via create", () => {
    const { $TestId } = Identifier.make("test");
    const child = $TestId.create("child");
    child.create("grandchild");

    const values = [...MutableHashSet.values($TestId.hashSet)];
    expect(values).toContain("@beep/test/child");
    expect(values).toContain("@beep/test/child/grandchild");
  });

  it("tracks identities created via template tags", () => {
    const { $TestId } = Identifier.make("test");
    const { $ModuleId } = $TestId.compose("module");
    $ModuleId`ServiceA`;
    $ModuleId`ServiceB`;

    const values = [...MutableHashSet.values($TestId.hashSet)];
    expect(values).toContain("@beep/test/module/ServiceA");
    expect(values).toContain("@beep/test/module/ServiceB");
  });

  it("tracks identities created via make method", () => {
    const { $TestId } = Identifier.make("test");
    $TestId.make("CustomPath");

    const values = [...MutableHashSet.values($TestId.hashSet)];
    expect(values).toContain("@beep/test/CustomPath");
  });

  it("shares registry across all derived composers", () => {
    const { $TestId } = Identifier.make("test");
    const { $ChildId } = $TestId.compose("child");
    const grandchild = $ChildId.create("grandchild");
    grandchild`Service`;

    // All share the same registry
    expect($TestId.hashSet).toBe($ChildId.hashSet);
    expect($ChildId.hashSet).toBe(grandchild.hashSet);

    const values = [...MutableHashSet.values($TestId.hashSet)];
    expect(values).toHaveLength(4); // test, child, grandchild, Service
  });
});
```

## Constraints

1. **Effect idioms**: Use `effect/MutableHashSet` - do not use native `Set`
2. **No breaking changes**: Existing API must remain fully compatible
3. **JSDoc**: Document the new `hashSet` property with examples
4. **Biome compliance**: Run `bun run lint:fix --filter @beep/identity`
5. **Type safety**: Ensure `hashSet` property is properly typed
6. **Import conventions**: Use `import * as MutableHashSet from "effect/MutableHashSet"`

## Verification

After implementation, run:

```bash
bun run check --filter @beep/identity
bun run build --filter @beep/identity
bun run test --filter @beep/identity
bun run lint --filter @beep/identity
```

All commands must pass without errors.

## Complexity Assessment

This is a low-complexity enhancement (2/10):
- Single mutable reference threaded through existing creation paths
- No architectural changes required
- Clear registration points already exist in the code
- MutableHashSet provides stable reference semantics

## Reference Files

- `src/Identifier.ts` - Current implementation (lines 186-237 for `createComposer`)
- `src/types.ts` - Type definitions
- `test/Identity.test.ts` - Existing test patterns
- `AGENTS.md` - Package conventions and guardrails
