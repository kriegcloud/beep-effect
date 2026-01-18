# Handoff: TaggedConfigKit Implementation

> Initial handoff for implementing a bidirectional schema between string literals and tagged config structs.

---

## Mission

Implement `TaggedConfigKit` - a schema factory in `@beep/schema` that enables bidirectional transformation between string literal keys and their associated tagged configuration structs.

### The Problem

We frequently have configuration mappings like:

```typescript
const LABEL_COLORS = {
  GRAY: { textColor: '#FFFFFF', backgroundColor: '#202020' },
  GREEN: { textColor: '#D1F0D9', backgroundColor: '#12341D' },
  // ...
} as const;
```

We need a schema that:
1. Decodes `"GRAY"` → `{ _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }`
2. Encodes `{ _tag: "GRAY", ... }` → `"GRAY"`
3. Provides static type inference for both forms
4. Provides accessor patterns for direct config access

---

## Context

### Why This Matters

1. **Type-Safe Configuration**: Instead of `Record<string, Config>`, we get discriminated unions
2. **Schema Integration**: Works with Effect Schema decode/encode pipelines
3. **Direct Access**: `LabelColor.Configs.GRAY` is statically typed
4. **Database Persistence**: Store only the tag, expand to full config at runtime

### Similar Patterns

The closest existing pattern is `MappedLiteralKit`:

```typescript
// MappedLiteralKit maps literal → literal
const Status = MappedLiteralKit(
  ["pending", "PENDING"],
  ["active", "ACTIVE"],
);
// Decodes: "pending" → "PENDING"
// Encodes: "PENDING" → "pending"
```

`TaggedConfigKit` extends this to map `literal → tagged struct`:

```typescript
// TaggedConfigKit maps literal → tagged struct
const LabelColor = TaggedConfigKit(
  ["GRAY", { textColor: '#FFFFFF', backgroundColor: '#202020' }],
);
// Decodes: "GRAY" → { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }
// Encodes: { _tag: "GRAY", ... } → "GRAY"
```

---

## Technical Requirements

### Type Constraints

1. **Tag**: Must be `string` (for `_tag` property compatibility)
2. **Config Fields**: Must be `AST.LiteralValue` (string, number, boolean, null, bigint)
3. **Config Shape**: Flat object (no nested objects)

### Interface Design

```typescript
interface ITaggedConfigKit<Entries extends TaggedConfigEntries>
  extends S.AnnotableClass<
    ITaggedConfigKit<Entries>,
    DecodedUnion<Entries>,  // { _tag: "GRAY", textColor: string, ... } | ...
    Entries[number][0]      // "GRAY" | "GREEN" | ...
  > {
  /**
   * Direct access to config structs by tag.
   * @example LabelColor.Configs.GRAY → { _tag: "GRAY", textColor: '#FFFFFF', ... }
   */
  readonly Configs: ConfigsAccessor<Entries>;

  /**
   * Array of all tags (like StringLiteralKit.Options).
   * @example LabelColor.Tags → ["GRAY", "GREEN", ...]
   */
  readonly Tags: TagsArray<Entries>;

  /**
   * Enum-like accessor for tags (like StringLiteralKit.Enum).
   * @example LabelColor.TagsEnum.GRAY → "GRAY"
   */
  readonly TagsEnum: TagsEnum<Entries>;

  /**
   * The original entries used to construct this kit.
   */
  readonly Entries: Entries;
}
```

### Type Utilities Needed

```typescript
// Entry type: [tag, config]
type TaggedConfigEntry = readonly [string, Record<string, AST.LiteralValue>];
type TaggedConfigEntries = A.NonEmptyReadonlyArray<TaggedConfigEntry>;

// Extract tags from entries
type ExtractTags<E extends TaggedConfigEntries> = E[number][0];

// Build decoded union: { _tag: T, ...config }
type DecodedConfig<Tag extends string, Config extends Record<string, AST.LiteralValue>> =
  { readonly _tag: Tag } & { readonly [K in keyof Config]: Config[K] };

type DecodedUnion<E extends TaggedConfigEntries> =
  E[number] extends readonly [infer T extends string, infer C extends Record<string, AST.LiteralValue>]
    ? DecodedConfig<T, C>
    : never;

// Configs accessor: { [tag]: { _tag: tag, ...config } }
type ConfigsAccessor<E extends TaggedConfigEntries> = {
  readonly [Entry in E[number] as Entry[0]]: DecodedConfig<Entry[0], Entry[1]>;
};
```

**Note on Naming**: Type names (`ConfigsAccessor`, `TagsArray`, `TagsEnum`) describe the static property types. The property names (`.Configs`, `.Tags`, `.TagsEnum`) are the actual runtime values attached to the class.

---

## Implementation Strategy

### Phase 1: Discovery

1. **Read `MappedLiteralKit`** at `packages/common/schema/src/derived/kits/mapped-literal-kit.ts`
   - Understand the class pattern with `S.make<Type, Encoded>(ast)`
   - Understand the `annotations()` override pattern
   - Understand how static properties are attached

2. **Read `StringLiteralKit`** at `packages/common/schema/src/derived/kits/string-literal-kit.ts`
   - Understand `.Options` and `.Enum` patterns
   - Understand `.is` refinement helpers

3. **Research Effect Schema transforms**
   - `S.transform` for bidirectional transforms
   - `S.TaggedStruct` for tagged struct schemas
   - How to build union schemas programmatically

### Phase 2: Design

1. Define type utilities (see above)
2. Design the `makeTaggedConfigKit` factory function
3. Design the public `TaggedConfigKit` function with annotations
4. Consider `TaggedConfigKitFromObject` helper (similar to `MappedLiteralKitFromEnum`)

### Phase 3: Implementation

Target file: `packages/common/schema/src/derived/kits/tagged-config-kit.ts`

```typescript
// File structure:
// 1. Type Utilities section
// 2. Interface definition
// 3. Helper functions (buildConfigs, buildTagsEnum, etc.)
// 4. Factory implementation (makeTaggedConfigKit)
// 5. Public API (TaggedConfigKit)
// 6. Optional: TaggedConfigKitFromObject helper
```

### Phase 4: Testing

Target file: `packages/common/schema/test/kits/tagged-config-kit.test.ts`

Test cases:
1. Basic decode: literal → tagged struct
2. Basic encode: tagged struct → literal
3. Type inference verification
4. `.Configs` accessor
5. `.Tags` array
6. `.TagsEnum` accessor
7. Multiple entries
8. Single entry edge case
9. Different value types (string, number, boolean)
10. Roundtrip property: `encode(decode(tag)) === tag`
11. Invalid tag rejection (decode error)
12. Empty config support (just `_tag`)
13. Referential stability: `LabelColor.Configs.GRAY === LabelColor.Configs.GRAY`

---

## Files to Reference

### Primary Reference
- `/packages/common/schema/src/derived/kits/mapped-literal-kit.ts` - **Study this thoroughly**

### Secondary References
- `/packages/common/schema/src/derived/kits/literal-kit.ts`
- `/packages/common/schema/src/derived/kits/string-literal-kit.ts`
- `/packages/common/schema/src/core/annotations/built-in-annotations.ts`
- `/packages/common/schema/CLAUDE.md`

### Where to Add Export
- `/packages/common/schema/src/schema.ts` - Add to BS namespace

---

## Code Patterns to Follow

### Namespace Imports (REQUIRED)

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import type * as AST from "effect/SchemaAST";
```

### NO Native Methods

```typescript
// WRONG
entries.map(([tag, config]) => ...)

// RIGHT
A.map(entries, ([tag, config]) => ...)
```

### Class Pattern from MappedLiteralKit

```typescript
return class TaggedConfigKitClass extends S.make<DecodedType, EncodedType>(schemaAST) {
  // Forward annotations to underlying schema for JSON Schema generation, IDE hints, etc.
  static override annotations(annotations: S.Annotations.Schema<DecodedType>): ITaggedConfigKit<Entries> {
    return makeTaggedConfigKit(entries, mergeSchemaAnnotations(this.ast, annotations));
  }

  static Configs = configsAccessor;
  static Tags = tagsArray;
  static TagsEnum = tagsEnum;
  static Entries = entries;
} as UnsafeTypes.UnsafeAny;
```

**Annotation Support**: The `.annotations()` override enables users to add metadata like `identifier`, `title`, `description`, and `jsonSchema` that propagates through JSON Schema generation and IDE tooling.

---

## Verification Commands

```bash
# Type-check the package
bun run check --filter @beep/schema

# Run tests
bun run test --filter @beep/schema

# Lint
bun run lint --filter @beep/schema
```

---

## Expected Output Location

```
packages/common/schema/
├── src/
│   ├── derived/
│   │   └── kits/
│   │       └── tagged-config-kit.ts    # New file
│   └── schema.ts                        # Add export
└── test/
    └── kits/
        └── tagged-config-kit.test.ts   # New file
```

---

## Definition of Done

1. `TaggedConfigKit` implemented with full type inference
2. Exported via `BS.TaggedConfigKit`
3. All accessor properties working (`.Configs`, `.Tags`, `.TagsEnum`)
4. Decode/encode working correctly
5. Tests passing
6. Type-check passing
7. Lint passing
8. JSDoc documentation complete

---

## Notes for Implementation

### Transform Schema Construction

The core challenge is building a transform schema that:
1. Takes a literal union as input (`"GRAY" | "GREEN" | ...`)
2. Produces a tagged union as output (`{ _tag: "GRAY", ... } | { _tag: "GREEN", ... } | ...`)

**Key Insight**: Config fields should use `S.Literal(value)` directly to preserve exact literal types (e.g., `'#FFFFFF'` not `string`).

```typescript
// Step 1: Build literal union schema for the "from" side
const literalSchema = S.Union(...A.map(entries, ([tag]) => S.Literal(tag)));

// Step 2: Build struct schemas for the "to" side
// Use S.Literal for each config value to preserve literal types
const structSchemas = A.map(entries, ([tag, config]) =>
  S.Struct({
    _tag: S.Literal(tag),
    ...R.map(config, (value) => S.Literal(value))  // Preserves '#FFFFFF' not just string
  })
);
const taggedUnionSchema = S.Union(...structSchemas);

// Step 3: Build a lookup map for O(1) decode
const configMap: Record<string, { _tag: string } & Record<string, AST.LiteralValue>> = F.pipe(
  entries,
  A.map(([tag, config]) => [tag, { _tag: tag, ...config }] as const),
  R.fromEntries
);

// Step 4: Create the transform schema
const transformSchema = S.transform(
  literalSchema,
  taggedUnionSchema,
  {
    strict: true,
    decode: (tag) => configMap[tag]!,  // Safe: literalSchema already validated tag
    encode: (config) => config._tag,
  }
);
```

### Error Handling

The schema provides robust error handling through the literal union:

1. **Invalid tag on decode**: Fails at `literalSchema` validation before transform runs
   - Input `"INVALID"` → Schema parse error with valid options listed

2. **Invalid struct on encode**: Fails at `taggedUnionSchema` validation
   - Struct with unknown `_tag` → Schema parse error

3. **No additional error handling needed**: Transform functions receive validated data

This design follows Effect Schema's principle of "validate at the boundary, trust internally."

### Handling Defaults

Since all config fields have default values from the entries, the decoded structs are always complete. The `_tag` identifies which config to use. The lookup map (`configMap`) provides O(1) decode performance.

---

## Optional: TaggedConfigKitFromObject Helper

Similar to `MappedLiteralKitFromEnum`, consider implementing a helper for converting object maps:

```typescript
// Helper for converting object maps to entries
export const TaggedConfigKitFromObject = <
  const Obj extends Record<string, Record<string, AST.LiteralValue>>
>(obj: Obj): ITaggedConfigKit</* inferred entries type */> => {
  const entries = F.pipe(
    Struct.keys(obj),
    A.map((key) => [key, obj[key]] as const)
  ) as TaggedConfigEntries;
  return TaggedConfigKit(...entries);
};

// Usage:
const LabelColor = TaggedConfigKitFromObject({
  GRAY: { textColor: '#FFFFFF', backgroundColor: '#202020' },
  GREEN: { textColor: '#D1F0D9', backgroundColor: '#12341D' },
});
```

This is lower priority than the core `TaggedConfigKit` function. Implement if time permits.

---

## Questions to Resolve During Implementation

1. Should `TaggedConfigKit` support partial overrides during decode?
   - Recommendation: No, keep it simple. Decode always returns full config.

2. Should `.Configs` values be frozen?
   - Recommendation: Yes, use `Object.freeze()` for safety.

3. How to handle configs with no additional fields (just `_tag`)?
   - Recommendation: Support it, results in `{ _tag: "TAG" }`. Type system handles this correctly with `DecodedConfig<"TAG", {}>`.

---

## Start Here

1. Read this handoff completely
2. Study `MappedLiteralKit` implementation
3. Create `outputs/discovery-report.md` with findings
4. Update `REFLECTION_LOG.md` with Phase 1 learnings
5. Proceed to Phase 2: Design
