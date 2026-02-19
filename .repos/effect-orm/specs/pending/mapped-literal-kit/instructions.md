# Port MappedLiteralKit from Effect v3 to Effect v4

## Goal

Port the `MappedLiteralKit` from the beep-effect v3 codebase to Effect v4. MappedLiteralKit provides **bidirectional literal mapping** — it wraps a transform schema that converts between two sets of literals (e.g., `"pending"` ↔ `"PENDING"`, or `"OK"` ↔ `200`). It exposes `From` and `To` as full `LiteralKit` instances, plus `DecodedEnum`, `EncodedEnum`, and lookup maps.

**Prerequisite**: `LiteralKit` must be implemented first at `packages/orm/src/utils/LiteralKit.ts` (see `specs/pending/literal-kit/instructions.md`).

**File to create**: `packages/orm/src/utils/MappedLiteralKit.ts`
**Test file to create**: `packages/orm/test/MappedLiteralKit.test.ts`

## What to Keep

| Feature | Description |
|---------|-------------|
| `From` | LiteralKit of the source (encoded) literals |
| `To` | LiteralKit of the target (decoded) literals |
| `Pairs` | The original `[from, to]` tuples |
| `DecodedEnum` | Maps `LiteralToKey<from>` → `to` value (encoded key → decoded value) |
| `EncodedEnum` | Maps `LiteralToKey<to>` → `from` value (decoded key → encoded value) |
| `decodeMap` | `ReadonlyMap<from, to>` for programmatic lookups |
| `encodeMap` | `ReadonlyMap<to, from>` for reverse lookups |
| `LiteralToKey` | Same key mapping as LiteralKit |

## What to Skip

| Feature | Reason |
|---------|--------|
| `Map` (HashMap) | Unnecessary complexity; native `ReadonlyMap` is sufficient |
| `MappedLiteralKitFromEnum` | Depends on `@beep/utils` ArrayUtils; can be added later if needed |
| `S.AnnotableClass` interface | Not in v4; use `Object.assign` pattern |
| `mergeSchemaAnnotations` | External dep from `@beep/schema` |
| `@beep/identity`, `@beep/types`, `@beep/utils` | External deps; eliminate all |
| `UnsafeTypes.UnsafeAny` | Use targeted type assertions instead |
| `null` literal support | v4 `LiteralValue` excludes `null` |

## v3 Source (Reference Only)

**Location**: `.repos/beep-effect/packages/common/schema/src/derived/kits/mapped-literal-kit.ts`

### Key v3 patterns to understand:

```typescript
// v3 MappedPairs type
type MappedPairs = A.NonEmptyReadonlyArray<readonly [AST.LiteralValue, AST.LiteralValue]>;

// v3 Extract helpers
type ExtractFromLiterals<Pairs> = { [K in keyof Pairs]: Pairs[K][0] }
type ExtractToLiterals<Pairs> = { [K in keyof Pairs]: Pairs[K][1] }

// v3 DecodedEnum: from-keys → to-values
type DecodedEnum<Pairs> = {
  readonly [P in Pairs[number] as LiteralToKey<P[0]>]: P[1];
};

// v3 EncodedEnum: to-keys → from-values
type EncodedEnum<Pairs> = {
  readonly [P in Pairs[number] as LiteralToKey<P[1]>]: P[0];
};

// v3 uses S.transformLiterals(...pairs) for the underlying schema
// v3 uses class-based pattern: class extends S.make<Type, Encoded>(ast) { ... }
// v3 creates From/To as makeGenericLiteralKit(fromLiterals) / makeGenericLiteralKit(toLiterals)
```

## v4 Schema API Reference

### S.Literals.transform (v4)
```typescript
// On the Literals interface:
transform<const L2 extends { readonly [I in keyof L]: AST.LiteralValue }>(
  to: L2
): Union<{ [I in keyof L]: decodeTo<Literal<L2[I]>, Literal<L[I]>> }>

// Usage:
const schema = S.Literals(["pending", "active"]).transform(["PENDING", "ACTIVE"])
// Decoding: "pending" → "PENDING"
// Encoding: "PENDING" → "pending"
```

### S.Literal.transform (v4)
```typescript
// On individual Literal:
transform<L2 extends AST.LiteralValue>(to: L2): decodeTo<Literal<L2>, Literal<L>>
```

### S.decodeUnknownSync / S.encodeUnknownSync (v4)
```typescript
S.decodeUnknownSync(schema)(encodedValue)  // from → to
S.encodeUnknownSync(schema)(decodedValue)  // to → from
```

### AST.LiteralValue (v4)
```typescript
export type LiteralValue = string | number | boolean | bigint  // NO null
```

## Design Decisions

1. **Foundation**: Use `S.Literals(fromLiterals).transform(toLiterals)` to create the transform schema, then `Object.assign` statics onto it.

2. **Spread pairs API**: `MappedLiteralKit(["pending", "PENDING"], ["active", "ACTIVE"])` — takes spread of `[from, to]` tuples.

3. **From/To are LiteralKit instances**: Import `LiteralKit` from `./LiteralKit.js` and create `From = LiteralKit(...fromLiterals)`, `To = LiteralKit(...toLiterals)`.

4. **Return type**: The transform schema type (Union of decodeTo) intersected with statics. Define as:
   ```typescript
   type MappedLiteralKitSchema<Pairs> =
     ReturnType<S.Literals<FromLiterals<Pairs>>["transform"]> & { From, To, Pairs, DecodedEnum, EncodedEnum, decodeMap, encodeMap }
   ```
   The exact type may need simplification — the key is that `S.decodeUnknownSync` and `S.encodeUnknownSync` work on the result.

5. **LiteralToKey**: Reuse from `LiteralKit.ts` — import the type and runtime function. Or redefine locally if preferred (simpler, no coupling).

6. **No HashMap**: Use native `ReadonlyMap` for `decodeMap`/`encodeMap`. Simpler, no extra import.

7. **Export both**: Export `MappedLiteralKit` function AND type.

## Constraints

- Only `effect/Schema` and `effect/SchemaAST` as Effect imports (plus `./LiteralKit.js` local import)
- v4 APIs only
- No `as any` — use targeted type assertions
- No `null` literal support
- Must pass `tsc --noEmit` with strict mode
- Must have comprehensive tests
- **Depends on LiteralKit being implemented first**

## Expected Usage

```typescript
import { MappedLiteralKit } from "./utils/MappedLiteralKit.js"
import * as S from "effect/Schema"

// String to string mapping
const StatusMapping = MappedLiteralKit(
  ["pending", "PENDING"],
  ["active", "ACTIVE"],
  ["archived", "ARCHIVED"]
)

// From kit (source/encoded literals)
StatusMapping.From.Options           // => ["pending", "active", "archived"]
StatusMapping.From.Enum.pending      // => "pending"
StatusMapping.From.is.pending("pending")  // => true

// To kit (target/decoded literals)
StatusMapping.To.Options             // => ["PENDING", "ACTIVE", "ARCHIVED"]
StatusMapping.To.Enum.PENDING        // => "PENDING"

// Direct enum access
StatusMapping.DecodedEnum.pending    // => "PENDING" (from-key → to-value)
StatusMapping.DecodedEnum.active     // => "ACTIVE"
StatusMapping.EncodedEnum.PENDING    // => "pending" (to-key → from-value)
StatusMapping.EncodedEnum.ACTIVE     // => "active"

// Schema decode/encode
S.decodeUnknownSync(StatusMapping)("pending")   // => "PENDING"
S.encodeUnknownSync(StatusMapping)("PENDING")   // => "pending"

// Lookup maps
StatusMapping.decodeMap.get("pending")   // => "PENDING"
StatusMapping.encodeMap.get("PENDING")   // => "pending"

// Original pairs
StatusMapping.Pairs  // => [["pending", "PENDING"], ["active", "ACTIVE"], ["archived", "ARCHIVED"]]


// String to number mapping (HTTP status codes)
const HttpStatus = MappedLiteralKit(
  ["OK", 200],
  ["CREATED", 201],
  ["NOT_FOUND", 404],
  ["INTERNAL_SERVER_ERROR", 500]
)

HttpStatus.DecodedEnum.OK           // => 200
HttpStatus.DecodedEnum.NOT_FOUND    // => 404
HttpStatus.EncodedEnum.n200         // => "OK"
HttpStatus.EncodedEnum.n404         // => "NOT_FOUND"

S.decodeUnknownSync(HttpStatus)("OK")      // => 200
S.encodeUnknownSync(HttpStatus)(200)        // => "OK"

HttpStatus.From.Options  // => ["OK", "CREATED", "NOT_FOUND", "INTERNAL_SERVER_ERROR"]
HttpStatus.To.Options    // => [200, 201, 404, 500]
HttpStatus.To.Enum.n200  // => 200


// Number to string mapping
const ErrorCodes = MappedLiteralKit(
  [1001, "INVALID_INPUT"],
  [1002, "NOT_FOUND"],
  [1003, "UNAUTHORIZED"]
)

ErrorCodes.DecodedEnum.n1001        // => "INVALID_INPUT"
ErrorCodes.EncodedEnum.INVALID_INPUT // => 1001


// Boolean to string mapping
const BoolMapping = MappedLiteralKit(
  [true, "yes"],
  [false, "no"]
)

BoolMapping.DecodedEnum.true         // => "yes"
BoolMapping.DecodedEnum.false        // => "no"
BoolMapping.EncodedEnum.yes          // => true
BoolMapping.EncodedEnum.no           // => false
```

## Reference: LiteralKit (Dependency)

MappedLiteralKit depends on LiteralKit for the `From` and `To` properties. LiteralKit lives at `packages/orm/src/utils/LiteralKit.ts` and exports:

```typescript
export type LiteralKit<L extends ReadonlyArray<AST.LiteralValue>> = S.Literals<L> & {
  readonly Options: L
  readonly is: IsGuards<L>
  readonly Enum: LiteralEnum<L>
  readonly pickOptions: ...
  readonly omitOptions: ...
  readonly derive: ...
}

export function LiteralKit<const L extends ReadonlyArray<AST.LiteralValue>>(...literals: L): LiteralKit<L>
```

The `LiteralToKey` type and `literalToKey` runtime function should be importable from LiteralKit (or re-exported). If LiteralKit doesn't export them, you may need to either:
- Add exports to LiteralKit
- Duplicate them locally in MappedLiteralKit

## Reference: Completed StringLiteralKit

The StringLiteralKit port at `packages/orm/src/utils/StringLiteralKit.ts` demonstrates the `Object.assign` pattern. StringLiteralKit is string-only; LiteralKit/MappedLiteralKit generalize to all literal types.

## Test Reference

See v3 tests at `.repos/beep-effect/packages/common/schema/test/kits/mappedLiteralKit.test.ts` for coverage expectations. Tests should cover:

1. **String to string mapping**: From/To kits, DecodedEnum, EncodedEnum, decode/encode, decodeMap/encodeMap, rejection of invalid values
2. **String to number mapping**: HTTP status codes, n-prefixed keys in EncodedEnum, cross-type decode/encode
3. **Number to string mapping**: n-prefixed keys in DecodedEnum
4. **Boolean mapping**: "true"/"false" keys in DecodedEnum
5. **Bigint mapping**: "Xn" keys in DecodedEnum
6. **Single pair**: Minimal case
7. **Number to number mapping**: Both sides n-prefixed
8. **Type safety**: Verify types at assignment (e.g., `const x: 200 = HttpStatus.DecodedEnum.OK`)
9. **Edge cases**: negative numbers (n-1), floating point (n0.5), special characters in strings

Use `vitest` imports (not `bun:test`). Use `S.decodeUnknownSync` and `S.encodeUnknownSync`.

## Implementation Checklist

1. Import `LiteralKit` and `LiteralToKey`/`literalToKey` from `./LiteralKit.js`
2. Define `MappedPairs` type (array of `[LiteralValue, LiteralValue]` tuples)
3. Define `ExtractFromLiterals<Pairs>` and `ExtractToLiterals<Pairs>` type helpers
4. Define `DecodedEnum<Pairs>` type using `LiteralToKey` on from-side keys
5. Define `EncodedEnum<Pairs>` type using `LiteralToKey` on to-side keys
6. Define `MappedLiteralKit<Pairs>` type as schema intersection with statics
7. Implement `MappedLiteralKit()` function:
   a. Extract `fromLiterals` and `toLiterals` arrays from pairs
   b. Create transform schema: `S.Literals(fromLiterals).transform(toLiterals)`
   c. Create `From = LiteralKit(...fromLiterals)` and `To = LiteralKit(...toLiterals)`
   d. Build `DecodedEnum` and `EncodedEnum` using `literalToKey`
   e. Build `decodeMap` and `encodeMap` as `new Map()`
   f. `Object.assign` statics onto transform schema
8. Write tests covering all literal type combinations
9. Run `npx tsc --noEmit -p packages/orm/tsconfig.json` (typecheck gate)
10. Run `npx vitest run packages/orm/test/MappedLiteralKit.test.ts` (test gate)

## Type Challenge Notes

The transform schema's return type from `S.Literals.transform()` is complex:
```typescript
Union<{ [I in keyof L]: decodeTo<Literal<L2[I]>, Literal<L[I]>> }>
```

You'll likely need a type assertion when creating the final intersection type. This is acceptable at the `Object.assign` boundary — the statics are known-safe, and the schema behavior is validated by tests. Use a targeted assertion like:
```typescript
return Object.assign(transformSchema, { From, To, Pairs, DecodedEnum, EncodedEnum, decodeMap, encodeMap }) as MappedLiteralKit<Pairs>
```

The key invariant is that `S.decodeUnknownSync(result)` and `S.encodeUnknownSync(result)` work correctly — tests validate this.
