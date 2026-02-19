---
name: mutablehashset-identity-registry
version: 5
created: 2024-12-24T00:00:00Z
iterations: 4
---

# MutableHashSet Identity Registry - Refined Prompt

## Context

You are working in the `@beep/identity` package (`packages/common/identity/`) within the beep-effect monorepo. This package provides the canonical identity builder for every `@beep/*` namespace, producing stable literal strings and `Symbol.for` tokens for services, schemas, and annotations.

### Current Implementation State

The `Identifier.ts` module contains a `createComposer` function (lines 186-237) that creates `TaggedComposer<Value>` objects. Currently:

- **No global state**: Composers are created on-demand with no registry
- **No tracking**: Created identities cannot be enumerated or queried
- **Function signature**: `createComposer<Value>(value: Value): TaggedComposer<Value>`

### Identity Creation Points (6 locations requiring registration)

| Method | Current Behavior | Registration Required |
|--------|------------------|----------------------|
| `createComposer()` | Creates composer with value | Register `value` parameter |
| Template tag `$Id\`Name\`` | Returns `toIdentityString(composed)` | Register `composed` before return |
| `make(segment)` | Returns `toIdentityString(composed)` | Register `composed` before return |
| `compose(...segments)` | Calls `createComposer` for each | Child composers register via `createComposer` |
| `create(segment)` | Calls `createComposer` | Child composer registers via `createComposer` |
| `annotations(identifier)` | Creates `toIdentitySymbol(composed)` | Register `composed` before creating symbol |

### Key Files

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/Identifier.ts` | Core factory, validation, AND `TaggedComposer` type definition | 186-237 (`createComposer`), 252-262 (`make`), 294-322 (`TaggedComposer` type) |
| `src/types.ts` | Supplementary type definitions (`IdentityString`, `IdentitySymbol`, `IdentityComposer`) | 64-81 (brands), 261-282 (`IdentityComposer` interface) |
| `src/packages.ts` | Canonical exports | Line 22 (`$I` root), 24-66 (compose batch) |
| `test/Identity.test.ts` | Test patterns | 9-117 (all test cases) |

**IMPORTANT**: The `TaggedComposer` type is defined in `Identifier.ts`, NOT in `types.ts`. All type changes for this feature go in `Identifier.ts`.

---

## Objective

Extend the `@beep/identity` Identifier module to track **all** created identity values in a shared `MutableHashSet` registry. The implementation must:

1. **Track all identity creation paths**: Every identity string produced via `compose`, `create`, `make`, template tags, or `annotations` must be registered
2. **Share registry across descendants**: All child composers must reference the same `MutableHashSet` instance as their root
3. **Expose registry via `identityRegistry` property**: Each `TaggedComposer` must have a `identityRegistry` property returning the shared registry
4. **Maintain backward compatibility**: Existing API must work unchanged
5. **Follow Effect idioms**: Use `effect/MutableHashSet`, not native `Set`

### Success Criteria

```typescript
import * as Identifier from "./Identifier";
import * as MutableHashSet from "effect/MutableHashSet";

const { $TestId } = Identifier.make("test");
const { $ChildId } = $TestId.compose("child");
const grandchild = $ChildId.create("grandchild");

// Template tag registration
grandchild`Service`;

// make() registration
$TestId.make("CustomPath");

// annotations() registration
$ChildId.annotations("MySchema");

// All share same registry
console.log($TestId.identityRegistry === $ChildId.identityRegistry); // true
console.log($ChildId.identityRegistry === grandchild.identityRegistry); // true

// All values tracked
const values = [...MutableHashSet.values($TestId.identityRegistry)];
console.log(values);
// [
//   "@beep/test",
//   "@beep/test/child",
//   "@beep/test/child/grandchild",
//   "@beep/test/child/grandchild/Service",
//   "@beep/test/CustomPath",
//   "@beep/test/child/MySchema"
// ]
```

### Safety Goal: Duplicate Detection

**Primary motivation**: Prevent duplicate Effect Context/Service tags that cause runtime Layer conflicts.

In a monorepo with similar naming conventions across vertical slices, copy-paste errors can easily create duplicate identity strings:

```typescript
// packages/documents/domain/src/models/Document.ts
const $I = $DocumentsDomainId.create("models");
export class Document extends S.Class<Document>()($I`Document`, { ... }) {}

// packages/iam/domain/src/models/Document.ts
// ❌ COPY-PASTE ERROR: forgot to change $DocumentsDomainId to $IamDomainId
const $I = $DocumentsDomainId.create("models");  // Wrong!
export class Document extends S.Class<Document>()($I`Document`, { ... }) {}
// Both produce "@beep/documents-domain/models/Document" - RUNTIME CONFLICT!
```

The registry MUST detect and warn about these duplicates at registration time.

### Non-Goals

Do NOT implement:
- Registry clearing/resetting methods
- Query/filter APIs beyond basic iteration via `MutableHashSet.values()`
- Serialization/deserialization of the registry
- Any changes to validation logic (`ensureSegment`, `ensureModuleSegment`, etc.)

---

## Role

You are an Effect-first TypeScript engineer implementing a low-complexity enhancement to an existing identity builder module. You must:

- Thread a `MutableHashSet` registry through all composer creation paths
- Add registration calls at each identity creation point
- Update the `TaggedComposer` type definition to include the `identityRegistry` property
- Write comprehensive tests following existing patterns
- Maintain strict adherence to repository conventions
- Reuse existing helper functions (`ensureSegment`, `ensureModuleSegment`, `toIdentityString`, `toIdentitySymbol`, etc.) without modification

---

## Constraints

### Effect Idioms (MANDATORY)

```typescript
// ✅ REQUIRED - Namespace imports only, alphabetically ordered after Effect core
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";  // ADD THIS (alphabetical position)
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// ❌ FORBIDDEN - Never use
new Set();                    // Native Set
items.map(fn);               // Native array methods
items.filter(fn);            // Native array methods
Array.from(iterable);        // Native Array.from
```

### MutableHashSet Usage Pattern

```typescript
// Create at root
const registry = MutableHashSet.empty<string>();

// Add values - IMPORTANT: mutates in place, returns same reference
// ✅ CORRECT: Just call add(), don't reassign
MutableHashSet.add(registry, value);

// ❌ INCORRECT: Don't reassign, it's the same reference anyway
registry = MutableHashSet.add(registry, value);

// Reference equality is preserved
const set1 = MutableHashSet.empty<string>();
const set2 = MutableHashSet.add(set1, "a");
Object.is(set1, set2); // true - SAME reference, set1 was mutated
```

### Type Safety

- Preserve `IdentityString` and `IdentitySymbol` brands through all returns
- No `any`, `@ts-ignore`, or unchecked casts
- Explicit type parameter for `MutableHashSet.empty<string>()`

### JSDoc Requirements

All new exports must include JSDoc with `@since 0.1.0` (this is the package's current version convention):
```typescript
/**
 * Description of the property/method.
 *
 * @category Registry
 * @since 0.1.0
 * @example
 * ```typescript
 * // Usage example
 * ```
 */
```

### Backward Compatibility

- Existing API must work unchanged
- No breaking changes to `TaggedComposer` callable behavior
- No changes to validation logic

---

## Resources

### Files to Read Before Implementation

1. **`packages/common/identity/src/Identifier.ts`** - Full current implementation (includes `TaggedComposer` type)
2. **`packages/common/identity/src/types.ts`** - Supplementary type definitions
3. **`packages/common/identity/test/Identity.test.ts`** - Testing patterns
4. **`packages/common/identity/AGENTS.md`** - Package-specific guidelines

### Effect Documentation

Use the Effect docs MCP tools to reference:
- `effect/MutableHashSet` - API surface and usage patterns

---

## Output Specification

### Modified `src/Identifier.ts`

All changes are in this single file. The `TaggedComposer` type is defined here (lines 294-322).

#### Step 1: Add Import (alphabetically positioned)

```typescript
// Near top of file, after existing Effect imports, in alphabetical order
import * as MutableHashSet from "effect/MutableHashSet";
```

#### Step 2: Add Type Alias and Collision Detection Helper (after imports, before functions)

```typescript
type Registry = MutableHashSet.MutableHashSet<string>;

/**
 * Registers an identity value and warns if a duplicate is detected.
 * Duplicates indicate potential copy-paste errors that would cause
 * runtime Effect Context/Layer conflicts.
 *
 * @internal
 */
const registerIdentity = (registry: Registry, identity: string): void => {
  if (MutableHashSet.has(registry, identity)) {
    console.warn(
      `[beep/identity] Duplicate identity detected: "${identity}"\n` +
      `This may indicate a copy-paste error. Each identity string must be unique.\n` +
      `Duplicate Effect Context/Service tags cause runtime Layer conflicts.`
    );
  }
  MutableHashSet.add(registry, identity);
};
```

This helper is used at ALL registration points instead of calling `MutableHashSet.add` directly.

#### Step 3: Update `createAnnotations` Function (~line 164-184)

Add `registry` parameter and registration call:

```typescript
const createAnnotations = <const Value extends StringTypes.NonEmptyString>(
  value: Value,
  registry: Registry  // ADD THIS PARAMETER
) =>
  (<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
    identifier: SegmentValue<Next>,
    extras?: SchemaAnnotationExtras<SchemaType>
  ) => {
    const next = ensureSegment(identifier);
    const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
    registerIdentity(registry, composed);  // USE HELPER - warns on duplicate
    const base = {
      schemaId: toIdentitySymbol(composed),
      identifier: next,
      title: toTitle(next),
    } satisfies IdentityAnnotation<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>>;
    // ... rest unchanged
  }) as TaggedComposer<Value>["annotations"];
```

#### Step 4: Modify `createComposer` Signature (~line 186)

```typescript
const createComposer = <const Value extends StringTypes.NonEmptyString>(
  value: Value,
  registry: Registry  // ADD THIS PARAMETER
): TaggedComposer<Value> => {
  // Register this value immediately (first line of function body)
  registerIdentity(registry, value);  // USE HELPER - warns on duplicate

  const identityValue = toIdentityString(value);
  // ... rest of implementation
};
```

#### Step 5: Update Template Tag Function (inside `createComposer`, ~line 188-199)

```typescript
const tag = ((strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>) => {
  if (values.length > 0) {
    throw new Error("Identifier template tags do not allow interpolations.");
  }
  if (strings.length !== 1) {
    throw new Error("Identifier template tags must use a single literal segment.");
  }
  const raw = strings[0];
  const segment = ensureModuleSegment(raw as StringTypes.NonEmptyString);
  const composed = `${value}/${segment}` as `${Value}/${ModuleSegmentValue<StringTypes.NonEmptyString>}`;
  registerIdentity(registry, composed);  // USE HELPER - BEFORE the return, warns on duplicate
  return toIdentityString(composed);
}) as TaggedComposer<Value>;
```

#### Step 6: Update `make` Method (~line 204-207)

```typescript
tag.make = <Next extends StringTypes.NonEmptyString>(segment: SegmentValue<Next>) => {
  const next = ensureSegment(segment);
  const composed = `${value}/${next}` as `${Value}/${SegmentValue<Next>}`;
  registerIdentity(registry, composed);  // USE HELPER - BEFORE the return, warns on duplicate
  return toIdentityString(composed);
};
```

#### Step 7: Thread Registry Through `compose` Method (~line 208-226)

```typescript
tag.compose = <
  const Segments extends readonly [
    ModuleSegmentValue<StringTypes.NonEmptyString>,
    ...ModuleSegmentValue<StringTypes.NonEmptyString>[],
  ],
>(
  ...segments: Segments
) => {
  const entries = F.pipe(
    segments,
    A.map((segment) => {
      const ensured = ensureModuleSegment(segment);
      const composed = `${value}/${ensured}` as `${Value}/${ModuleSegmentValue<StringTypes.NonEmptyString>}`;
      const composer = createComposer(composed, registry);  // PASS REGISTRY HERE
      return [toTaggedKey(ensured), composer] as const;
    })
  );
  return R.fromEntries(entries) as TaggedModuleRecord<Value, Segments>;
};
```

#### Step 8: Update `annotations` Assignment (~line 227)

```typescript
tag.annotations = createAnnotations(value, registry);  // PASS REGISTRY HERE
```

#### Step 9: Thread Registry Through `create` Method (~line 228-234)

```typescript
tag.create = <const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
  segment: Segment
): TaggedComposerResult<Value, Segment> => {
  const next = ensureSegment(segment);
  const composed = `${value}/${next}` as `${Value}/${SegmentValue<Segment>}`;
  return createComposer(composed, registry);  // PASS REGISTRY HERE
};
```

#### Step 10: Expose `identityRegistry` Property (after all method assignments)

```typescript
tag.identityRegistry = registry;
```

#### Step 11: Update `TaggedComposer` Type Definition (~line 294-322)

Add the `identityRegistry` member to the type:

```typescript
export type TaggedComposer<Value extends StringTypes.NonEmptyString> = {
  <const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
    strings: readonly [Segment]
  ): IdentityString<`${Value}/${Segment}`>;
  (
    strings: TemplateStringsArray,
    ...values: ReadonlyArray<unknown>
  ): IdentityString<`${Value}/${ModuleSegmentValue<StringTypes.NonEmptyString>}`>;
  value: IdentityString<Value>;
  identifier: IdentityString<Value>;
  compose<
    const Segments extends readonly [
      ModuleSegmentValue<StringTypes.NonEmptyString>,
      ...ModuleSegmentValue<StringTypes.NonEmptyString>[],
    ],
  >(...segments: Segments): TaggedModuleRecord<Value, Segments>;
  make<Next extends StringTypes.NonEmptyString>(
    segment: SegmentValue<Next>
  ): IdentityString<`${Value}/${SegmentValue<Next>}`>;
  string(): IdentityString<Value>;
  symbol(): IdentitySymbol<Value>;
  annotations<SchemaType = unknown, Next extends StringTypes.NonEmptyString = StringTypes.NonEmptyString>(
    identifier: SegmentValue<Next>,
    extras?: SchemaAnnotationExtras<SchemaType>
  ): IdentityAnnotationResult<`${Value}/${SegmentValue<Next>}`, SegmentValue<Next>, SchemaType>;
  create<const Segment extends ModuleSegmentValue<StringTypes.NonEmptyString>>(
    segment: Segment
  ): TaggedComposerResult<Value, Segment>;

  /**
   * Shared registry containing all identity strings created from this composer's root.
   * All child composers derived via `compose`, `create`, template tags, `make`, or
   * `annotations` share the same registry instance.
   *
   * @category Registry
   * @since 0.1.0
   * @example
   * ```typescript
   * import * as MutableHashSet from "effect/MutableHashSet";
   * import { $I } from "@beep/identity/packages";
   *
   * const values = [...MutableHashSet.values($I.identityRegistry)];
   * console.log(values); // All registered identity strings
   * ```
   */
  readonly identityRegistry: MutableHashSet.MutableHashSet<string>;
};
```

#### Step 12: Update `make` Factory (~line 252-262)

```typescript
export const make = <const Base extends StringTypes.NonEmptyString>(base: Base) => {
  const registry = MutableHashSet.empty<string>();  // CREATE REGISTRY FIRST
  const normalizedBase = normalizeBase(base);
  const baseIdentity = createBaseIdentity(normalizedBase);
  const composer = createComposer(baseIdentity, registry);  // PASS REGISTRY
  const key = toTaggedKey(normalizedBase);
  return {
    [key]: composer,
  } as {
    readonly [Key in typeof key]: TaggedComposer<BaseIdentity<Base>>;
  };
};
```

---

### New Tests in `test/Identity.test.ts`

Add imports at top of file (with existing imports):
```typescript
import { spyOn } from "bun:test";  // For console.warn spy
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
```

Add new `describe` block after existing tests:

```typescript
describe("Identity Registry", () => {
  it("registers root identity on make() call", () => {
    const { $TestId } = Identifier.make("test");

    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toEqual(["@beep/test"]);
  });

  it("tracks identities created via compose", () => {
    const { $TestId } = Identifier.make("test");
    $TestId.compose("module-a", "module-b");

    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toContain("@beep/test");
    expect(values).toContain("@beep/test/module-a");
    expect(values).toContain("@beep/test/module-b");
  });

  it("tracks identities created via create", () => {
    const { $TestId } = Identifier.make("test");
    const child = $TestId.create("child");
    child.create("grandchild");

    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toContain("@beep/test/child");
    expect(values).toContain("@beep/test/child/grandchild");
  });

  it("tracks identities created via template tags", () => {
    const { $TestId } = Identifier.make("test");
    const { $ModuleId } = $TestId.compose("module");
    $ModuleId`ServiceA`;
    $ModuleId`ServiceB`;

    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toContain("@beep/test/module/ServiceA");
    expect(values).toContain("@beep/test/module/ServiceB");
  });

  it("tracks identities created via make method", () => {
    const { $TestId } = Identifier.make("test");
    $TestId.make("CustomPath");

    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toContain("@beep/test/CustomPath");
  });

  it("tracks identities created via annotations", () => {
    const { $TestId } = Identifier.make("test");
    const { $SchemaId } = $TestId.compose("schema");
    $SchemaId.annotations("MyEntity");
    $SchemaId.annotations("AnotherEntity", { description: "With extras" });

    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toContain("@beep/test/schema/MyEntity");
    expect(values).toContain("@beep/test/schema/AnotherEntity");
  });

  it("shares registry across all derived composers", () => {
    const { $TestId } = Identifier.make("test");
    const { $ChildId } = $TestId.compose("child");
    const grandchild = $ChildId.create("grandchild");
    grandchild`Service`;

    // All share the same registry reference
    expect($TestId.identityRegistry).toBe($ChildId.identityRegistry);
    expect($ChildId.identityRegistry).toBe(grandchild.identityRegistry);

    // Verify all expected values are present
    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    expect(values).toEqual(expect.arrayContaining([
      "@beep/test",
      "@beep/test/child",
      "@beep/test/child/grandchild",
      "@beep/test/child/grandchild/Service"
    ]));
    expect(values).toHaveLength(4);
  });

  it("isolates registries between different make() calls", () => {
    const { $FooId } = Identifier.make("foo");
    const { $BarId } = Identifier.make("bar");

    $FooId.compose("module");
    $BarId.compose("other");

    const fooValues = [...MutableHashSet.values($FooId.identityRegistry)];
    const barValues = [...MutableHashSet.values($BarId.identityRegistry)];

    expect(fooValues).toContain("@beep/foo/module");
    expect(fooValues).not.toContain("@beep/bar/other");
    expect(barValues).toContain("@beep/bar/other");
    expect(barValues).not.toContain("@beep/foo/module");
  });

  it("warns on duplicate identity registration", () => {
    const { $TestId } = Identifier.make("test");
    const warnSpy = spyOn(console, "warn");

    // First registration - no warning
    $TestId.make("Duplicate");
    expect(warnSpy).not.toHaveBeenCalled();

    // Second registration - should warn
    $TestId.make("Duplicate");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("Duplicate identity detected");
    expect(warnSpy.mock.calls[0][0]).toContain("@beep/test/Duplicate");

    // Third registration - should warn again
    $TestId.make("Duplicate");
    expect(warnSpy).toHaveBeenCalledTimes(2);

    // Value is still only stored once (HashSet deduplicates)
    const values = [...MutableHashSet.values($TestId.identityRegistry)];
    const duplicateCount = F.pipe(
      values,
      A.filter(v => v === "@beep/test/Duplicate"),
      A.length
    );
    expect(duplicateCount).toBe(1);
  });

  it("warns on cross-slice duplicate (simulating copy-paste error)", () => {
    // Simulate the copy-paste error scenario from the docs
    const { $DocumentsDomainId } = Identifier.make("documents-domain");
    const warnSpy = spyOn(console, "warn");

    // First slice registers Document
    const docsModels = $DocumentsDomainId.create("models");
    docsModels`Document`;

    // Second slice (simulating wrong import - same base composer)
    // This would happen if someone copy-pasted and forgot to change the import
    docsModels`Document`;  // Same path = duplicate!

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("@beep/documents-domain/models/Document");
    expect(warnSpy.mock.calls[0][0]).toContain("copy-paste error");
  });
});
```

---

## Verification Checklist

After implementation, verify:

- [ ] `bun run check --filter @beep/identity` passes (no type errors)
- [ ] `bun run build --filter @beep/identity` passes (ESM/CJS emit)
- [ ] `bun run test --filter @beep/identity` passes (all tests green)
- [ ] `bun run lint --filter @beep/identity` passes (Biome compliance)
- [ ] `registerIdentity` helper function added with duplicate detection
- [ ] All 6 registration points use `registerIdentity` helper:
  - [ ] `createComposer` - registers `value` parameter
  - [ ] Template tag - registers `composed` before return
  - [ ] `make()` method - registers `composed` before return
  - [ ] `compose()` method - passes registry to child `createComposer` calls
  - [ ] `create()` method - passes registry to child `createComposer` call
  - [ ] `annotations()` method - registers `composed` before creating symbol
- [ ] Duplicate detection warns via `console.warn` with identity string
- [ ] Warning message includes "copy-paste error" guidance
- [ ] `identityRegistry` property added to `TaggedComposer` type definition
- [ ] `identityRegistry` property exposed on composer object
- [ ] `createAnnotations` call site updated to pass `registry`
- [ ] Registry shared via reference equality across child composers
- [ ] Isolated registries between different `Identifier.make()` calls
- [ ] JSDoc added for `identityRegistry` property with `@since 0.1.0`
- [ ] No native `Set`, `Map`, or array methods used
- [ ] No breaking changes to existing API
- [ ] Import added in alphabetical order with other Effect imports

---

## Examples

### Cross-Module Registration (Real-World Pattern)

```typescript
// packages/common/identity/src/packages.ts
import * as Identifier from "./Identifier";

export const $I = Identifier.make("beep").$BeepId;

const composers = $I.compose("shared-ui", "shared-client");
export const $SharedClientId = composers.$SharedClientId;
```

```typescript
// packages/shared/client/src/atom/files/errors.ts
import { $SharedClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("atom/files/errors");

export class ImageTooLargeAfterCompression extends S.TaggedError<ImageTooLargeAfterCompression>(
  $I`ImageTooLargeAfterCompression`
)("ImageTooLargeAfterCompression", {
  fileName: S.String,
  originalSizeBytes: S.Number,
  compressedSizeBytes: S.Number,
}, $I.annotations("ImageTooLargeAfterCompression", {
  description: "Image too large after compression",
})) {}
```

```typescript
// Later, introspecting all registered identities
import { $I } from "@beep/identity/packages";
import * as MutableHashSet from "effect/MutableHashSet";

const allIdentities = [...MutableHashSet.values($I.identityRegistry)];
console.log(allIdentities);
// Includes (populated as modules are imported):
// - "@beep"
// - "@beep/shared-client"
// - "@beep/shared-client/atom/files/errors"
// - "@beep/shared-client/atom/files/errors/ImageTooLargeAfterCompression"
```

---

## Metadata

### Research Sources

**Files Explored**:
- `packages/common/identity/src/Identifier.ts` - Core implementation + `TaggedComposer` type
- `packages/common/identity/src/types.ts` - Supplementary type definitions
- `packages/common/identity/src/packages.ts` - Export patterns
- `packages/common/identity/test/Identity.test.ts` - Test patterns
- `packages/common/identity/AGENTS.md` - Package guidelines

**Documentation Referenced**:
- `effect/MutableHashSet` - API surface, mutation semantics, reference equality behavior

**Package Guidelines Consulted**:
- Root `AGENTS.md` - Effect idioms, forbidden patterns, import conventions
- `packages/common/identity/AGENTS.md` - Package-specific constraints

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial creation | N/A |
| 1 | Missing `annotations()` registration | Added as 6th registration point |
| 2 | HIGH: Type location confusion | Clarified `TaggedComposer` is in `Identifier.ts`, merged output sections |
| 2 | HIGH: Missing `createAnnotations` call site | Added Step 8 showing `tag.annotations = createAnnotations(value, registry)` |
| 2 | HIGH: Template tag ordering ambiguous | Showed complete function body with explicit "BEFORE the return" comments |
| 2 | MEDIUM: Test assertion fragility | Changed `toHaveLength(4)` to use `arrayContaining` + `toHaveLength` combo |
| 2 | MEDIUM: Import location unclear | Added Step 1 showing alphabetical positioning |
| 2 | LOW: JSDoc version | Added explicit note to use `@since 0.1.0` |
| 2 | Added Non-Goals section | Prevents scope creep |
| 2 | Added mutation semantics warning | Clarifies MutableHashSet behavior |
| 2 | Added edge case tests | Empty registry test, duplicate handling test |
| 3 | CRITICAL: Native `.filter()` in test | Replaced with `F.pipe(values, A.filter(...), A.length)` |
| 4 | User clarification: Primary goal is duplicate prevention | Added Safety Goal section explaining runtime Layer conflicts |
| 4 | Added `registerIdentity` helper | Checks `MutableHashSet.has()` before adding, warns on duplicate |
| 4 | Updated all registration points | Use `registerIdentity` instead of `MutableHashSet.add` |
| 4 | Added duplicate detection tests | Tests for warning on duplicate, cross-slice copy-paste scenario |
| 4 | Updated verification checklist | Added duplicate detection checkpoints |
| 5 | Property rename | Changed `hashSet` → `identityRegistry` for semantic clarity |
