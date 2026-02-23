# Port LiteralKit from Effect v3 to Effect v4

## Goal

Port the generic `LiteralKit` from the beep-effect v3 codebase to Effect v4. LiteralKit extends StringLiteralKit's pattern to support **any** `AST.LiteralValue` — strings, numbers, booleans, and bigints. It provides the same ergonomic utilities (Options, Enum, is guards, pickOptions, omitOptions) plus a `derive` method for creating subsets.

**File to create**: `packages/orm/src/utils/LiteralKit.ts`
**Test file to create**: `packages/orm/test/LiteralKit.test.ts`

## What to Keep

| Feature | Description |
|---------|-------------|
| `Options` | The literal values as the original tuple |
| `Enum` | Object mapping `LiteralToKey<L>` keys → literal values |
| `is` | Per-literal type guards: `(i: unknown) => i is L` |
| `pickOptions` | Return a subset with only specified literals |
| `omitOptions` | Return a subset excluding specified literals |
| `derive` | Create a new LiteralKit from a subset of literals |
| `LiteralToKey` | Type-level key mapping for non-string literals |

## What to Skip

| Feature | Reason |
|---------|--------|
| `S.AnnotableClass` interface | Not available in v4; use `Object.assign` on `S.Literals` instead |
| `mergeSchemaAnnotations` | External dep from `@beep/schema`; not needed |
| `$SchemaId` annotations | External dep from `@beep/identity`; not needed |
| `@beep/utils` ArrayUtils | External dep; use native array methods or plain loops |
| `isMembers` / `mapMembers` AST helpers | v4 `S.Literals()` handles AST construction internally |
| `getDefaultLiteralAST` | v4 `S.Literals()` handles AST construction internally |
| `arbitrary` annotation | External pattern; not needed for core utility |
| `null` literal support | v4 `AST.LiteralValue = string \| number \| boolean \| bigint` — no `null` |

## v3 Source (Reference Only)

**Location**: `.repos/beep-effect/packages/common/schema/src/derived/kits/literal-kit.ts`

### Key v3 patterns to understand:

```typescript
// v3 LiteralToKey type mapping (note: includes null, which v4 does NOT support)
type LiteralToKey<L extends AST.LiteralValue> = L extends null
  ? "null"
  : L extends boolean
    ? L extends true ? "true" : "false"
    : L extends bigint
      ? `${L}n`
      : L extends number
        ? `n${L}`
        : L & string;

// v3 literalToKey runtime function
function literalToKey<const L extends AST.LiteralValue>(literal: L) {
  if (literal === null) return "null";
  if (Equal.equals(typeof literal)("boolean")) return literal ? "true" : "false";
  if (Equal.equals(typeof literal)("bigint")) return `${literal}n`;
  if (Equal.equals(typeof literal)("number")) return `n${literal}`;
  return String(literal);
}

// v3 uses class-based pattern:
// class LiteralKitClass extends S.make<Literals[number]>(schemaAST) { ... }

// v3 derive creates new kit from subset:
// const derive = <Keys extends LiteralsSubset<Literals>>(...keys: Keys) => makeGenericLiteralKit(keys);
```

## v4 Schema API Reference

### AST.LiteralValue (v4)
```typescript
// v4: NO null support
export type LiteralValue = string | number | boolean | bigint
```

### S.Literals (v4)
```typescript
export interface Literals<L extends ReadonlyArray<AST.LiteralValue>>
  extends Bottom<L[number], L[number], never, never, AST.Union<AST.Literal>, Literals<L>> {
  readonly literals: L
  readonly members: { readonly [K in keyof L]: Literal<L[K]> }
  pick<const L2 extends ReadonlyArray<L[number]>>(literals: L2): Literals<L2>
  transform<const L2 extends { readonly [I in keyof L]: AST.LiteralValue }>(
    to: L2
  ): Union<{ [I in keyof L]: decodeTo<Literal<L2[I]>, Literal<L[I]>> }>
  mapMembers<To extends ReadonlyArray<Top>>(f: (members: this["members"]) => To): Union<Simplify<Readonly<To>>>
}

// Constructor takes an ARRAY parameter (not spread):
export function Literals<const L extends ReadonlyArray<AST.LiteralValue>>(literals: L): Literals<L>
```

### S.decodeUnknownSync (v4)
```typescript
// Use this for decoding in tests (not S.decodeSync):
S.decodeUnknownSync(schema)(value)
```

## Design Decisions

1. **Foundation**: Use `S.Literals(literals)` as the base schema, then `Object.assign` statics onto it (same pattern as StringLiteralKit).

2. **LiteralToKey without null**: v4 drops `null` from `LiteralValue`. The type mapping becomes:
   - `boolean` → `"true"` | `"false"`
   - `bigint` → `` `${L}n` `` (e.g., `1n` → `"1n"`)
   - `number` → `` `n${L}` `` (e.g., `200` → `"n200"`)
   - `string` → as-is (e.g., `"pending"` → `"pending"`)

3. **Runtime literalToKey**: Simple function using `typeof` checks (do NOT use `Equal.equals` — that was a v3 pattern dependency). Use plain `typeof literal === "boolean"` etc.

4. **derive method**: Creates a new `LiteralKit` from a subset of the current literals. Recursively calls `LiteralKit(...keys)`.

5. **Return type**: `S.Literals<L> & { Options, is, Enum, pickOptions, omitOptions, derive }` — intersection preserves v4 schema capabilities.

6. **Spread API**: `LiteralKit(200, 201, 400, 404, 500)` — takes spread args (like StringLiteralKit), wraps into array for `S.Literals(literals)`.

7. **Export both**: Export `LiteralKit` function AND `LiteralKit` type (same name, function + type merge).

## Constraints

- Zero external dependencies — only `effect/Schema` and `effect/SchemaAST` imports
- v4 APIs only (`S.Literals`, not v3 `S.Literal` with spread)
- No `as any` — use proper type assertions with `as` on known-safe boundaries
- No `null` literal support (v4 limitation)
- Must pass `tsc --noEmit` with strict mode
- Must have comprehensive tests

## Expected Usage

```typescript
import { LiteralKit } from "./utils/LiteralKit.js"
import * as S from "effect/Schema"

// Number literals (HTTP status codes)
const HttpStatus = LiteralKit(200, 201, 400, 404, 500)
HttpStatus.Options        // => [200, 201, 400, 404, 500]
HttpStatus.Enum.n200      // => 200
HttpStatus.Enum.n404      // => 404
HttpStatus.is.n200(200)   // => true
HttpStatus.is.n200(201)   // => false

// Schema validation
S.decodeUnknownSync(HttpStatus)(200)  // => 200
S.decodeUnknownSync(HttpStatus)(999)  // throws ParseError

// Subset operations
HttpStatus.pickOptions(200, 201)       // => [200, 201]
HttpStatus.omitOptions(200, 201)       // => [400, 404, 500]

// Derive new kit from subset
const SuccessStatus = HttpStatus.derive(200, 201)
SuccessStatus.Options     // => [200, 201]
SuccessStatus.Enum.n200   // => 200

// Boolean literals
const Toggle = LiteralKit(true, false)
Toggle.Enum.true          // => true
Toggle.Enum.false         // => false
Toggle.is.true(true)      // => true
Toggle.is.false(false)    // => true

// Bigint literals
const BigNums = LiteralKit(1n, 2n, 3n)
BigNums.Enum["1n"]        // => 1n
BigNums.is["2n"](2n)     // => true

// String literals (also works, same as StringLiteralKit)
const Status = LiteralKit("pending", "active", "archived")
Status.Enum.pending       // => "pending"
Status.is.active("active") // => true

// v4 Literals interop (inherited methods)
HttpStatus.literals       // => [200, 201, 400, 404, 500]
HttpStatus.members        // array of Literal schemas
HttpStatus.pick([200, 201]) // narrowed Literals schema
```

## Reference: Completed StringLiteralKit

The StringLiteralKit port at `packages/orm/src/utils/StringLiteralKit.ts` demonstrates the exact same pattern. Key differences:
- StringLiteralKit is constrained to `ReadonlyArray<string>` — keys are identity (key === value)
- LiteralKit supports any `AST.LiteralValue` — keys use `LiteralToKey` mapping
- LiteralKit adds `derive` method

```typescript
// StringLiteralKit pattern (already implemented):
export type StringLiteralKit<L extends ReadonlyArray<string>> = S.Literals<L> & {
  readonly Options: L
  readonly is: IsGuards<L>
  readonly Enum: EnumType<L>
  readonly pickOptions: ...
  readonly omitOptions: ...
}

export function StringLiteralKit<const L extends ReadonlyArray<string>>(
  ...literals: L
): StringLiteralKit<L> {
  const schema = S.Literals(literals)
  // ... build statics ...
  return Object.assign(schema, { Options: literals, is, Enum, pickOptions, omitOptions }) as StringLiteralKit<L>
}
```

## Test Reference

See v3 tests at `.repos/beep-effect/packages/common/schema/test/kits/literalKit.test.ts` for coverage expectations. Tests should cover:

1. **Number literals**: Options, Enum (n-prefixed keys), is guards, schema decoding, pickOptions, omitOptions, derive
2. **String literals**: Options, Enum (identity keys), is guards, schema decoding
3. **Boolean literals**: Options, Enum ("true"/"false" keys), is guards, schema decoding
4. **Bigint literals**: Options, Enum ("Xn" keys), is guards, schema decoding
5. **Single literal**: All properties work with one literal
6. **Derive chain**: derive from derive
7. **Literals interop**: `.literals`, `.members`, `.pick()` inherited from v4 `S.Literals`
8. **Edge cases**: separate kits are independent, many literals

Use `vitest` imports (not `bun:test`). Use `S.decodeUnknownSync` (not `S.decodeSync`).

## Implementation Checklist

1. Define `LiteralToKey<L>` conditional type (boolean → "true"/"false", bigint → "${L}n", number → "n${L}", string → as-is)
2. Define `IsGuards<L>` using `LiteralToKey` for keys
3. Define `LiteralEnum<L>` using `LiteralToKey` for keys
4. Define `LiteralKit<L>` type as intersection of `S.Literals<L>` & statics
5. Implement `literalToKey()` runtime function using `typeof` checks
6. Implement `LiteralKit()` function with spread args
7. Build `is` guards using `literalToKey` for keys, equality check for values
8. Build `Enum` using `literalToKey` for keys, literal for values
9. Implement `pickOptions`, `omitOptions`, `derive`
10. `Object.assign` statics onto `S.Literals(literals)` result
11. Write tests covering all literal types
12. Run `npx tsc --noEmit -p packages/orm/tsconfig.json` (typecheck gate)
13. Run `npx vitest run packages/orm/test/LiteralKit.test.ts` (test gate)
