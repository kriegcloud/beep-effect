# Field Option Omittable - Auto-Default Enhancement

## Problem

Currently, creating entities with optional fields requires explicit `O.none()` for every optional field:

```typescript
User.Model.jsonCreate.make({
  email: "test@example.com",
  name: "Test User",
  createdBy: O.none(),
  updatedBy: O.none(),
  deletedBy: O.none(),
  deletedAt: O.none(),
  banExpires: O.none(),
  phoneNumber: O.none(),
  // ... 7 more O.none() fields
});
```

## Solution

Use `S.withConstructorDefault(() => O.none())` on top of `S.optionalWith({ as: "Option" })` to enable automatic defaults:

```typescript
User.Model.jsonCreate.make({
  email: "test@example.com",
  name: "Test User",
  // Optional fields automatically default to O.none()
});
```

## Key Findings

1. **`default` and `as: "Option"` are mutually exclusive** in `S.optionalWith` options
2. **`S.withConstructorDefault`** can be piped after `S.optionalWith` to add constructor defaults
3. **Defaults are lazy** - new `O.none()` instance created each time
4. **Constructor defaults != decoding defaults** - only affects `.make()`, not JSON/DB decoding
5. **Type-safe** - TypeScript correctly infers optional fields with defaults

## Recommended Implementation

```typescript
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

## Files to Modify

1. `packages/common/schema/src/integrations/sql/common.ts`
   - Add `optionalWithDefault` helper
   - Update `FieldOptionOmittable` implementation
   - Update JSDoc to document auto-default behavior

2. `packages/_internal/db-admin/test/AccountRepo.test.ts`
   - Simplify `makeMockUser` to remove explicit `O.none()` fields
   - Test that omitted fields default correctly

3. Other test files using `BS.FieldOptionOmittable`
   - Remove boilerplate `O.none()` assignments
   - Verify encoding/decoding round-trips

## Testing Checklist

- [ ] Constructor creates `O.none()` for omitted fields
- [ ] Explicit `O.some(value)` overrides the default
- [ ] Encoding: `O.none()` → `null` in database
- [ ] Decoding: `null` → `O.none()` from database
- [ ] TypeScript correctly infers optional fields
- [ ] No regressions in existing tests

## See Also

- `research.md` - Full research document with detailed analysis
- Effect docs: [Default Constructors](https://effect.website/docs/schema/default-constructors)
- Effect docs: [PropertySignature](https://effect.website/docs/schema/property-signatures)
