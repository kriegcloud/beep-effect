# Field Option Omittable - Research Report

## Executive Summary

The current `BS.FieldOptionOmittable` helper requires explicit `O.none()` values for all optional fields in Model variant schemas (`jsonCreate`, `jsonUpdate`), leading to verbose boilerplate in test fixtures and entity construction. This research explores how to leverage Effect Schema's `default` option with `S.optionalWith` and `S.withConstructorDefault` to enable automatic `O.none()` defaults, allowing fields to be omitted entirely during entity creation.

**Key Finding**: Effect Schema provides `S.optionalWith` with a `default` option that can automatically supply values when fields are omitted. However, this conflicts with the `as: "Option"` configuration currently used. The solution requires using `S.withConstructorDefault` on top of the `PropertySignature` to add constructor-level defaults while preserving the Option transformation behavior.

## Problem Statement

### Current Boilerplate

When creating User entities with the current `BS.FieldOptionOmittable` implementation, tests and factories must explicitly pass `O.none()` for every optional field:

```typescript
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
    // All these O.none() values are required
    createdBy: O.none(),
    updatedBy: O.none(),
    deletedBy: O.none(),
    deletedAt: O.none(),
    banExpires: O.none(),
    phoneNumber: O.none(),
    displayUsername: O.none(),
    username: O.none(),
    stripeCustomerId: O.none(),
    lastLoginMethod: O.none(),
    banReason: O.none(),
    image: O.none(),
    source: O.none(),
  });
```

### Desired Behavior

The goal is to reduce this to only the required fields:

```typescript
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
    // Optional fields automatically default to O.none()
  });
```

## Research Sources

### 1. Effect Documentation
- `Schema.optionalWith` - PropertySignature helper for optional fields with various transformation modes
- `Schema.withConstructorDefault` - Enhances PropertySignature with default constructor values
- Default Constructors documentation - Explains lazy evaluation, nested defaults, and reusability

### 2. Source Code Analysis

#### `@effect/sql/Model.FieldOption` (Lines 269-307)
```typescript
export interface FieldOption<S extends Schema.Schema.Any> extends
  VariantSchema.Field<{
    readonly select: Schema.OptionFromNullOr<S>
    readonly insert: Schema.OptionFromNullOr<S>
    readonly update: Schema.OptionFromNullOr<S>
    readonly json: Schema.optionalWith<S, { as: "Option" }>
    readonly jsonCreate: Schema.optionalWith<S, { as: "Option"; nullable: true }>
    readonly jsonUpdate: Schema.optionalWith<S, { as: "Option"; nullable: true }>
  }>
{}

export const FieldOption = fieldEvolve({
  select: Schema.OptionFromNullOr,
  insert: Schema.OptionFromNullOr,
  update: Schema.OptionFromNullOr,
  json: Schema.optionalWith({ as: "Option" }),
  jsonCreate: Schema.optionalWith({ as: "Option", nullable: true }),
  jsonUpdate: Schema.optionalWith({ as: "Option", nullable: true })
})
```

**Key insight**: The official `FieldOption` uses `Schema.optionalWith({ as: "Option" })` which makes the field optional but still requires explicit `O.none()` when omitted.

#### Current `BS.FieldOptionOmittable` (Lines 86-133)
```typescript
export interface FieldOptionOmittable<Schema extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullOr<Schema>;
    readonly insert: S.optionalWith<Schema, { as: "Option", nullable: true, onNoneEncoding: () => O.Option<null> }>;
    readonly update: S.optionalWith<Schema, { as: "Option", nullable: true, onNoneEncoding: () => O.Option<null> }>;
    readonly json: S.OptionFromNullOr<Schema>;
    readonly jsonCreate: S.optionalWith<Schema, { as: "Option", nullable: true, onNoneEncoding: () => O.Option<null> }>;
    readonly jsonUpdate: S.optionalWith<Schema, { as: "Option", nullable: true, onNoneEncoding: () => O.Option<null> }>;
  }> {
}
```

**Key insight**: Uses `onNoneEncoding` to handle how `O.none()` is encoded (as `null`), but doesn't provide a *default* value when the key is omitted.

#### Effect Schema's `OptionalOptions` (Lines 2386-2420)
```typescript
export type OptionalOptions<A> = {
  readonly default?: never
  readonly as?: never
  readonly exact?: true
  readonly nullable?: true
} | {
  readonly default: LazyArg<A>  // ← Can provide a default value
  readonly as?: never
  readonly exact?: true
  readonly nullable?: true
} | {
  readonly as: "Option"
  readonly default?: never      // ← Cannot combine with 'as: "Option"'
  readonly exact?: never
  readonly nullable?: never
  readonly onNoneEncoding?: LazyArg<option_.Option<undefined>>
} | {
  readonly as: "Option"
  readonly default?: never      // ← Cannot combine with 'as: "Option"'
  readonly exact?: never
  readonly nullable: true
  readonly onNoneEncoding?: LazyArg<option_.Option<null | undefined>>
}
```

**Critical finding**: The `default` option and `as: "Option"` are mutually exclusive in the union type. This means we cannot use `S.optionalWith(schema, { default: () => O.none(), as: "Option" })`.

#### `Schema.withConstructorDefault` (Lines 2002-2017, 2487-2562)
```typescript
export const withConstructorDefault: {
  <Type>(defaultValue: () => Types.NoInfer<Type>): <
    TypeToken extends PropertySignature.Token,
    Key extends PropertyKey,
    EncodedToken extends PropertySignature.Token,
    Encoded,
    R
  >(
    self: PropertySignature<TypeToken, Type, Key, EncodedToken, Encoded, boolean, R>
  ) => PropertySignature<TypeToken, Type, Key, EncodedToken, Encoded, true, R>
}
```

**Key insight**: This is a separate combinator that wraps a `PropertySignature` and adds a constructor default **without changing the encoding/decoding behavior**. It can be applied *after* `S.optionalWith`.

### 3. VariantSchema System

#### `fieldEvolve` (Lines 387-419, 541-552)
```typescript
const fieldEvolve = dual(
  2,
  (
    self: Field<any> | Schema.Schema.All | Schema.PropertySignature.All,
    f: Record<string, (schema: Field.ValueAny) => Field.ValueAny>
  ): Field<any> => {
    const field = isField(self) ? self : Field(Object.fromEntries(
      options.variants.map((variant) => [variant, self])
    ))
    return Field(Struct_.evolve(field.schemas, f))
  }
)
```

**Key insight**: `fieldEvolve` applies transformations to each variant schema individually. We can use this to wrap each variant with `S.withConstructorDefault` after applying `S.optionalWith`.

#### `extract` (Lines 185-228)
The extraction process retrieves the schema for a specific variant from the Field and builds a Struct. This happens during `Model.jsonCreate` access.

```typescript
for (const key of Object.keys(self[TypeId])) {
  const value = self[TypeId][key]
  if (FieldTypeId in value) {
    if (variant in value.schemas) {
      fields[key] = value.schemas[variant]  // ← Gets the PropertySignature for the variant
    }
  }
}
return cache[cacheKey] = Schema.Struct(fields)
```

**Key insight**: The extracted schema for a variant is used directly in `S.Struct()`, so defaults set via `S.withConstructorDefault` will be respected.

## How Defaults Work in Effect Schema

### 1. Constructor Defaults vs Decoding Defaults

Effect Schema distinguishes between:
- **Decoding defaults**: Applied when decoding from encoded type to decoded type (e.g., JSON → domain model)
- **Constructor defaults**: Applied when using `.make()` to create instances directly

The `.make()` method operates on the **decoded type** (Type A), not the encoded type (Type I).

### 2. Lazy Evaluation

From the Effect documentation:
> Defaults are lazily evaluated, meaning that a new instance of the default is generated every time the constructor is called.

```typescript
const Person = Schema.Struct({
  timestamp: Schema.Number.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => new Date().getTime())
  )
})

console.log(Person.make({ name: "name1" }))  // timestamp: 1714232909221
console.log(Person.make({ name: "name2" }))  // timestamp: 1714232909227
```

### 3. Shallow Defaults in Nested Structs

Defaults do not propagate through nested structures automatically. However, in our case, we're dealing with flat Field definitions that get extracted into a single Struct, so this limitation doesn't apply.

### 4. Portability

> Default values are also "portable", meaning that if you reuse the same property signature in another schema, the default is carried over.

This is critical: once we enhance a `PropertySignature` with `S.withConstructorDefault`, that default follows the signature wherever it's used.

## Proposed Solutions

### Solution 1: `withConstructorDefault` on Top of `optionalWith`

Wrap each variant's `S.optionalWith` with `S.withConstructorDefault(() => O.none())`.

#### Implementation

```typescript
export const FieldOptionOmittableWithDefaults = <Schema extends S.Schema.Any>(
  schema: Schema
): FieldOptionOmittable<Schema> =>
  M.Field({
    select: S.OptionFromNullOr(schema),
    insert: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }).pipe(S.withConstructorDefault(() => O.none())),
    update: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }).pipe(S.withConstructorDefault(() => O.none())),
    json: S.OptionFromNullOr(schema),
    jsonCreate: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }).pipe(S.withConstructorDefault(() => O.none())),
    jsonUpdate: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }).pipe(S.withConstructorDefault(() => O.none())),
  });
```

#### How It Works

1. `S.optionalWith(schema, { as: "Option", nullable: true })` creates a `PropertySignature` that:
   - Type: `Option<Schema.Type<Schema>>`
   - Encoded: `Schema.Encoded<Schema> | null | undefined`
   - Token: `"?:"` (optional in encoded side, but still required on type side with `as: "Option"`)

2. `.pipe(S.withConstructorDefault(() => O.none()))` enhances the signature with:
   - Constructor default: `() => O.none()`
   - Type token changes from `"?:"` to `":"` (required in type, but has a default)
   - This makes the field optional in the constructor while preserving Option semantics

3. When `Model.jsonCreate.make({ email, name })` is called:
   - The struct constructor sees fields with defaults
   - Missing keys use `() => O.none()` automatically
   - No explicit `O.none()` needed in the call site

#### Type Signature Changes

Before:
```typescript
type UserJsonCreate = {
  email: string;
  name: string;
  image: Option.Option<string>;        // Required!
  phoneNumber: Option.Option<string>;  // Required!
  // ... all other optional fields required
}
```

After:
```typescript
type UserJsonCreate = {
  email: string;
  name: string;
  // image and phoneNumber are optional in constructor, default to O.none()
}
```

### Solution 2: Alternative Using `fieldEvolve`

Leverage `M.fieldEvolve` to apply `S.withConstructorDefault` transformation to specific variants.

#### Implementation

```typescript
export const FieldOptionOmittableWithDefaults = <Schema extends S.Schema.Any>(
  schema: Schema
): FieldOptionOmittable<Schema> =>
  M.Field({
    select: S.OptionFromNullOr(schema),
    insert: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
    update: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
    json: S.OptionFromNullOr(schema),
    jsonCreate: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
    jsonUpdate: S.optionalWith(schema, {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
  }).pipe(
    M.fieldEvolve({
      jsonCreate: (variant) => S.asSchema(variant).pipe(S.withConstructorDefault(() => O.none())),
      jsonUpdate: (variant) => S.asSchema(variant).pipe(S.withConstructorDefault(() => O.none())),
    })
  );
```

This approach applies defaults only to the write variants (`jsonCreate`, `jsonUpdate`), leaving read variants unchanged.

### Solution 3: Separate Helper for Write-Only Defaults

Create a distinct helper specifically for fields that should have defaults in write operations.

#### Implementation

```typescript
export const FieldOptionOmittableWriteDefaults = <Schema extends S.Schema.Any>(
  schema: Schema
): FieldOptionOmittable<Schema> => {
  const baseField = M.FieldOption(schema);
  return M.fieldEvolve(baseField, {
    insert: (variant) => S.asSchema(variant).pipe(S.withConstructorDefault(() => O.none())),
    update: (variant) => S.asSchema(variant).pipe(S.withConstructorDefault(() => O.none())),
    jsonCreate: (variant) => S.asSchema(variant).pipe(S.withConstructorDefault(() => O.none())),
    jsonUpdate: (variant) => S.asSchema(variant).pipe(S.withConstructorDefault(() => O.none())),
  });
};
```

This builds on top of the standard `M.FieldOption` and adds defaults to all write variants.

## Trade-offs and Considerations

### Solution 1: Direct `withConstructorDefault` Pipe

**Pros**:
- Explicit and clear in the field definition
- Self-documenting: defaults are visible inline
- Maximum control over which variants get defaults
- No additional abstraction layers

**Cons**:
- Verbose: repeats `.pipe(S.withConstructorDefault(() => O.none()))` for each variant
- Higher chance of copy-paste errors
- Harder to maintain if we want to change default behavior globally

### Solution 2: `fieldEvolve` Transformation

**Pros**:
- Cleaner: defaults applied via transformation after base field creation
- Centralizes default logic
- Easier to add/remove defaults from specific variants
- Aligns with Effect's compositional patterns

**Cons**:
- Less obvious where defaults come from (implicit transformation)
- Requires understanding `fieldEvolve` mechanics
- May need `S.asSchema` cast to work with PropertySignatures

### Solution 3: Separate Helper

**Pros**:
- Clear intent: separate helper for "write-default" fields
- Reuses `M.FieldOption` as a foundation
- Easy to switch between "always required" and "has defaults" by swapping helpers
- Follows open/closed principle (extend via new helper, don't modify existing)

**Cons**:
- Two helpers with similar names could cause confusion
- Users need to know when to use which helper
- Potential for inconsistent usage across the codebase

### General Considerations

#### 1. AST and Schema Composition

`S.withConstructorDefault` works by wrapping the `PropertySignature.AST` with additional metadata. This is a pure, composable transformation that doesn't break the variant extraction process.

#### 2. Constructor vs Decoding

These defaults apply **only to the constructor** (`.make()`). When decoding JSON or database rows, the normal `S.optionalWith` rules apply:
- Missing keys in JSON → `O.none()`
- `null` in database → `O.none()`
- Explicit value → `O.some(value)`

The constructor default is a separate concern from decoding/encoding.

#### 3. Type Safety

TypeScript will correctly infer that fields with constructor defaults are optional in the `make()` call. The signature changes from:
```typescript
{ field: Option.Option<A> }  // Required
```
to:
```typescript
{ field?: Option.Option<A> }  // Optional, defaults to O.none()
```

#### 4. Testing Impact

This change eliminates boilerplate in test fixtures without sacrificing explicitness where needed:

```typescript
// Before: Always required
makeMockUser({ createdBy: O.none(), updatedBy: O.none(), /* ... */ })

// After: Only specify when needed
makeMockUser({})  // All optionals default to O.none()
makeMockUser({ createdBy: O.some("admin-id") })  // Override specific fields
```

#### 5. Migration Path

The old `BS.FieldOptionOmittable` and new version can coexist:
- Rename current to `BS.FieldOptionOmittableExplicit`
- Create new `BS.FieldOptionOmittable` with defaults
- Migrate incrementally, testing each entity model

Alternatively:
- Add a new `BS.FieldOptionOmittableAuto` name
- Use the new version in new code
- Keep existing code using the current version

## Implementation Recommendations

### Recommended Approach: Solution 1 with Helper Factory

Combine the explicitness of Solution 1 with a helper factory to reduce repetition:

```typescript
/**
 * Helper to create optionalWith PropertySignature with constructor default.
 */
const optionalWithDefault = <A>(
  schema: S.Schema<A, any, any>,
  defaultValue: () => A,
  options: {
    readonly as?: "Option";
    readonly nullable?: boolean;
    readonly onNoneEncoding?: () => O.Option<any>;
  } = {}
) => {
  const base = S.optionalWith(schema, options as any);
  return base.pipe(S.withConstructorDefault(defaultValue));
};

/**
 * Variant definition for nullable Option fields with automatic O.none() defaults in write variants.
 */
export const FieldOptionOmittable = <Schema extends S.Schema.Any>(
  schema: Schema
): FieldOptionOmittable<Schema> =>
  M.Field({
    select: S.OptionFromNullOr(schema),
    insert: optionalWithDefault(schema, () => O.none(), {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
    update: optionalWithDefault(schema, () => O.none(), {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
    json: S.OptionFromNullOr(schema),
    jsonCreate: optionalWithDefault(schema, () => O.none(), {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
    jsonUpdate: optionalWithDefault(schema, () => O.none(), {
      as: "Option",
      nullable: true,
      onNoneEncoding: () => O.some(null),
    }),
  });
```

### Step-by-Step Implementation Plan

1. **Add the helper function** `optionalWithDefault` in `packages/common/schema/src/integrations/sql/common.ts`

2. **Update `FieldOptionOmittable`** to use the helper for write variants

3. **Add JSDoc documentation** explaining the auto-default behavior

4. **Update type signature** to reflect optional constructor fields

5. **Test with User.Model**:
   ```typescript
   const user = User.Model.jsonCreate.make({
     email: "test@example.com",
     name: "Test User",
     // No O.none() fields required!
   });
   ```

6. **Validate encoding/decoding**:
   - Ensure `O.none()` encodes to `null` in database inserts
   - Ensure `null` in database decodes to `O.none()` in select variants

7. **Update test utilities**:
   - Simplify `makeMockUser` and similar factory functions
   - Remove boilerplate `O.none()` assignments

8. **Document the pattern** in `packages/common/schema/AGENTS.md`

### Alternative: Keep Both Variants

If there are cases where explicit `O.none()` is preferred (e.g., for clarity in certain contexts), provide both:

```typescript
// Auto-defaults for tests and simple creation
export const FieldOptionOmittable = <Schema extends S.Schema.Any>(schema: Schema) => /* ... with defaults */;

// Explicit for scenarios where clarity is paramount
export const FieldOptionOmittableExplicit = <Schema extends S.Schema.Any>(schema: Schema) => /* ... without defaults */;
```

This gives users the choice while establishing a clear default (auto-defaults) for new code.

## Edge Cases and Validation

### 1. Nested Models

If a model contains nested structs with optional fields, defaults do not propagate automatically. However, in `beep-effect`, models are flat (no nested Model classes in field definitions), so this is not a concern.

### 2. Array Fields

If an optional field is an array (e.g., `tags: Option<Array<string>>`), the default `() => O.none()` is correct. To have an empty array instead, you'd use `() => O.some([])`, but that's a different use case.

### 3. Union Types

Optional fields using union types (e.g., `Option<A | B>`) work the same way. The default `O.none()` is type-safe.

### 4. Encoding Round-Trip

Verify that:
```typescript
const user = User.Model.jsonCreate.make({ email: "test@example.com", name: "Test" });
const encoded = S.encodeSync(User.Model.jsonCreate)(user);
const decoded = S.decodeSync(User.Model.jsonCreate)(encoded);

// encoded.image should be undefined or null (depending on onNoneEncoding)
// decoded.image should be O.none()
```

### 5. Database NULL vs Undefined

With `nullable: true` and `onNoneEncoding: () => O.some(null)`:
- `O.none()` encodes to `null` in the database
- `null` in the database decodes to `O.none()` in selects

This aligns with PostgreSQL nullable column semantics.

## Integration with beep-effect Architecture

### 1. Compatibility with `makeFields`

The `makeFields` helper in `packages/shared/domain/src/common.ts` already uses `S.optionalWith` with defaults for the `id` field:

```typescript
id: S.optionalWith(entityId, { default: () => entityId.create() })
```

This validates that `S.optionalWith` with `default` works in the context of Model fields. However, that example doesn't use `as: "Option"`, which is why we need `S.withConstructorDefault` as a separate step.

### 2. Alignment with `auditColumns` and `userTrackingColumns`

These currently use `BS.FieldOptionOmittable`, which is a simpler helper:

```typescript
export const FieldOmitableOption = <Schema extends S.Schema.Any>(schema: Schema) =>
  S.optionalWith(schema, {
    nullable: true,
    as: "Option",
    onNoneEncoding: thunk(O.some(null)),
  });
```

This is used in non-Model contexts (plain Schema property signatures). It doesn't integrate with `@effect/sql/Model` variants.

**Recommendation**: Keep `FieldOmitableOption` for non-Model schemas and use `FieldOptionOmittable` for Model fields.

### 3. Consistency with `BS.toOptionalWithDefault`

The codebase has another pattern for defaults:

```typescript
uploadLimit: BS.toOptionalWithDefault(S.Int)(USER_UPLOAD_LIMIT)
role: BS.toOptionalWithDefault(UserRole)(UserRole.Enum.user)
```

This is for **non-Option fields** with default values. The new `FieldOptionOmittable` handles **Option fields** with default `O.none()`.

These are complementary patterns, not conflicting.

## Conclusion

Adding automatic `O.none()` defaults to `FieldOptionOmittable` is achievable using `S.withConstructorDefault` on top of `S.optionalWith({ as: "Option" })`. The recommended implementation uses a helper factory to reduce repetition and provides clear, composable semantics.

This change will:
- Eliminate boilerplate in test factories and entity creation
- Preserve type safety and encoding/decoding correctness
- Align with Effect Schema's compositional design
- Improve developer experience without sacrificing explicitness when needed

The implementation should be tested thoroughly with existing User, Account, and other entity models to ensure no regressions in database interactions or JSON API contracts.

## References

### Effect Documentation
- [Default Constructors](https://effect.website/docs/schema/default-constructors)
- [Schema.optionalWith API](https://effect.website/docs/schema/api/optionalWith)
- [PropertySignature](https://effect.website/docs/schema/property-signatures)

### Source Files
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/common/schema/src/integrations/sql/common.ts` (Lines 74-133)
- `/home/elpresidank/YeeBois/projects/beep-effect2/tmp/effect/packages/sql/src/Model.ts` (Lines 260-307)
- `/home/elpresidank/YeeBois/projects/beep-effect2/node_modules/@effect/experimental/src/VariantSchema.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/node_modules/effect/src/Schema.ts` (Lines 2386-2627)
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/domain/src/entities/User/User.model.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/_internal/db-admin/test/AccountRepo.test.ts` (Lines 25-46)

### Code Examples
- `makeFields` in `packages/shared/domain/src/common.ts` (Lines 74-96)
- `auditColumns` and `userTrackingColumns` in `packages/shared/domain/src/common.ts` (Lines 13-48)
