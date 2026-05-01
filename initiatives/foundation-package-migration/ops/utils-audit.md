# @beep/utils Boundary Audit

This ledger supports the first-pass move of `@beep/utils` to
`packages/foundation/modeling/utils`.

## Decision

Move the package as `foundation/modeling` to preserve public imports. Do not
split the package during the topology migration. Fix manifest correctness and
record mixed runtime surfaces as follow-up cleanup.

## Allow

These modules are modeling-safe helpers that are already used by shared-domain,
tooling, schema, or package internals:

- `Array`
- `Bool`
- `Function`
- `Html`
- `Number`
- `Option`
- `Predicate`
- `Str`
- `Struct`
- `Text`
- `thunk`
- `isBlockedObjectKey`

## Defer

These modules carry runtime, platform, or capability flavor. They may remain for
API stability during the move, but should be revisited after the topology lands:

- `DateTime`
- `Event`
- `FileSystem`
- `Glob`
- `NodeUrl`
- `Random`
- `Stream`

## Block

No blocking module was found for the topology move. The package does import
`@beep/identity` from source files, so the manifest must gain an explicit
`@beep/identity` dependency during the move.

## Follow-Up

- Decide whether runtime helpers should stay in `@beep/utils`, move to a
  `foundation/capability` package, or split by explicit subpath boundaries.
- Add stricter boundary import laws after the foundation topology is stable.
