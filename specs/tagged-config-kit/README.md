# TaggedConfigKit Schema

> Bidirectional schema mapping between string literals and tagged structs with literal-value defaults.

---

## Overview

This specification guides the design and implementation of `TaggedConfigKit` - a new schema in `@beep/schema` that provides bidirectional transformation between string literals and their associated tagged configuration structs.

### Core Concept

```typescript
// Define a TaggedConfigKit
const LabelColor = TaggedConfigKit(
  ["GRAY", { textColor: '#FFFFFF', backgroundColor: '#202020' }],
  ["GREEN", { textColor: '#D1F0D9', backgroundColor: '#12341D' }],
  ["ORANGE", { textColor: '#FDECCE', backgroundColor: '#413111' }],
);

// Decoding: "GRAY" → { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }
// Encoding: { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' } → "GRAY"
```

### Key Properties

1. **Bidirectional**: Decodes literals to tagged structs, encodes back to literals
2. **Tagged Structs**: Each decoded value has a `_tag` property matching its literal key
3. **Literal-Only Fields**: Struct properties must be `AST.LiteralValue` (string, number, boolean, null, bigint)
4. **Default Values**: Each config entry provides defaults for all struct fields
5. **Type-Safe Access**: Provides `.Configs` enum-like accessor for direct struct access

---

## Scope

### In Scope

- Schema that transforms `string` ↔ `{ _tag: string, ...config }`
- Static type inference for both encoded (literal) and decoded (struct) types
- `.Configs` accessor for direct config struct access: `LabelColor.Configs.GRAY`
- `.Tags` accessor for literal values (like `StringLiteralKit.Options`)
- `.TagsEnum` accessor for enum-like tag access
- Integration with existing `@beep/schema` patterns (annotations, BS namespace export)
- Comprehensive test coverage

### Out of Scope

- Nested object properties (only flat structs with literal values)
- Runtime validation beyond schema decode/encode
- Migration tooling from other patterns

---

## Goals

1. **API Parity**: Follow patterns from `MappedLiteralKit` for consistency
2. **Type Safety**: Full inference for tags, config shapes, and accessor properties
3. **Effect Compliance**: Use Effect namespace imports, `F.pipe`, Effect collections
4. **Documentation**: JSDoc with `@category`, `@since`, `@example` tags
5. **Testability**: Unit tests for all public API surface

---

## Quick Start

```bash
# Read the initial handoff
cat specs/tagged-config-kit/handoffs/HANDOFF_INITIAL.md

# Review MappedLiteralKit as reference
cat packages/common/schema/src/derived/kits/mapped-literal-kit.ts

# Review LiteralKit patterns
cat packages/common/schema/src/derived/kits/literal-kit.ts
cat packages/common/schema/src/derived/kits/string-literal-kit.ts
```

---

## Key References

| Document | Purpose |
|----------|---------|
| `handoffs/HANDOFF_INITIAL.md` | **Full context and mission** |
| `REFLECTION_LOG.md` | Cumulative learnings |
| `packages/common/schema/src/derived/kits/mapped-literal-kit.ts` | Primary pattern reference |
| `packages/common/schema/src/derived/kits/string-literal-kit.ts` | StringLiteralKit patterns |
| `packages/common/schema/CLAUDE.md` | Package-specific guidelines |

---

## Phases

### Phase 1: Discovery

**Goal**: Understand existing kit patterns and Effect Schema capabilities

**Tasks**:
1. Analyze `MappedLiteralKit` implementation thoroughly
2. Analyze `StringLiteralKit` and `LiteralKit` patterns
3. Research Effect Schema `TaggedStruct`, `transform`, `transformOrFail` patterns
4. Document type-level utilities needed for config struct inference

**Output**: `outputs/discovery-report.md`

### Phase 2: Design

**Goal**: Design the API and type-level implementation

**Tasks**:
1. Design type-level utilities for config extraction
2. Design the `ITaggedConfigKit` interface
3. Design accessor patterns (`.Configs`, `.Tags`, `.TagsEnum`)
4. Document encoding/decoding flow
5. Define edge cases and constraints

**Output**: `outputs/design-proposal.md`

### Phase 3: Implementation

**Goal**: Implement the schema kit

**Tasks**:
1. Implement type utilities
2. Implement `makeTaggedConfigKit` factory
3. Implement `TaggedConfigKit` public API
4. Export through BS namespace in `src/schema.ts`
5. Verify with type-check

**Output**: `packages/common/schema/src/derived/kits/tagged-config-kit.ts`

### Phase 4: Testing

**Goal**: Comprehensive test coverage

**Tasks**:
1. Unit tests for decode/encode operations
2. Type-level tests for inference
3. Tests for `.Configs`, `.Tags`, `.TagsEnum` accessors
4. Edge case tests (single entry, many entries)

**Output**: `packages/common/schema/test/kits/tagged-config-kit.test.ts`

---

## Success Criteria

- [ ] Schema correctly decodes literals to tagged structs
- [ ] Schema correctly encodes tagged structs to literals
- [ ] Full type inference for `Encoded` and `Type`
- [ ] `.Configs.TAG` returns correctly typed config struct
- [ ] `.Tags` returns array of literal tags
- [ ] `.TagsEnum` returns enum-like object for tags
- [ ] Exported via BS namespace (`BS.TaggedConfigKit`)
- [ ] Type-check passes: `bun run check --filter @beep/schema`
- [ ] Lint passes: `bun run lint --filter @beep/schema`
- [ ] Tests pass: `bun run test --filter @beep/schema`

---

## Expected Usage

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

// Define label colors with their associated configs
const LabelColor = BS.TaggedConfigKit(
  ["GRAY", { textColor: '#FFFFFF', backgroundColor: '#202020' }],
  ["GREEN", { textColor: '#D1F0D9', backgroundColor: '#12341D' }],
  ["ORANGE", { textColor: '#FDECCE', backgroundColor: '#413111' }],
  ["PINK", { textColor: '#FDD9DF', backgroundColor: '#411D23' }],
  ["BLUE", { textColor: '#D8E6FD', backgroundColor: '#1C2A41' }],
  ["PURPLE", { textColor: '#E8DEFD', backgroundColor: '#2C2341' }],
);

// Type inference
type ColorTag = typeof LabelColor.Encoded;  // "GRAY" | "GREEN" | ...
type ColorConfig = typeof LabelColor.Type;  // { _tag: "GRAY", textColor: string, ... } | ...

// Direct config access
const grayConfig = LabelColor.Configs.GRAY;
// { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }

// Tag access
const allTags = LabelColor.Tags;
// ["GRAY", "GREEN", "ORANGE", "PINK", "BLUE", "PURPLE"]

// Decoding
const decoded = S.decodeSync(LabelColor)("GRAY");
// { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }

// Encoding
const encoded = S.encodeSync(LabelColor)(decoded);
// "GRAY"

// Effect-based usage
const program = Effect.gen(function* () {
  const colorKey: ColorTag = "GREEN";
  const config = yield* S.decode(LabelColor)(colorKey);
  yield* Effect.log("Config", config);
  // { _tag: "GREEN", textColor: '#D1F0D9', backgroundColor: '#12341D' }

  const backToKey = yield* S.encode(LabelColor)(config);
  yield* Effect.log("Key", backToKey);
  // "GREEN"
});
```

---

## Directory Structure

```
specs/tagged-config-kit/
├── README.md                           # This file
├── REFLECTION_LOG.md                   # Learnings log
├── outputs/
│   ├── discovery-report.md             # P1: Pattern analysis
│   └── design-proposal.md              # P2: API design
├── handoffs/
│   ├── HANDOFF_INITIAL.md              # Initial context handoff
│   ├── HANDOFF_P1.md                   # Phase 1 completion
│   ├── HANDOFF_P2.md                   # Phase 2 completion
│   └── HANDOFF_P3.md                   # Phase 3 completion
└── templates/
    └── test-case.template.md           # Test case template
```

---

## Related

- [MappedLiteralKit](../../packages/common/schema/src/derived/kits/mapped-literal-kit.ts)
- [StringLiteralKit](../../packages/common/schema/src/derived/kits/string-literal-kit.ts)
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md)
- [Schema Package CLAUDE.md](../../packages/common/schema/CLAUDE.md)
- [Spec Creation Guide](../SPEC_CREATION_GUIDE.md)
