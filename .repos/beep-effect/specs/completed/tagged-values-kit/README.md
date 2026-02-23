# TaggedValuesKit Schema

## Purpose

Create a new schema kit for `@beep/schema` that transforms between string literal tags and tagged arrays of literal values, following the `TaggedConfigKit` pattern.

## Scope

- **In Scope**: `TaggedValuesKit` factory, static accessors (`ValuesFor`, `LiteralKitFor`), validation (allOf/oneOf), tests, JSDoc
- **Out of Scope**: Domain-specific kits (HTML sanitization uses this, but is separate)

## Success Criteria

| # | Criterion | Measurement | Status |
|---|-----------|-------------|--------|
| 1 | Factory implemented | `TaggedValuesKit` exists at `src/derived/kits/tagged-values-kit.ts` | [x] |
| 2 | Static properties | `Tags`, `TagsEnum`, `Entries`, `Configs`, `ConfigMap`, `is`, `derive` accessible | [x] |
| 3 | New accessors | `ValuesFor.<tag>`, `LiteralKitFor.<tag>` return correct types | [x] |
| 4 | Decode behavior | Tag string → `{ _tag, values }` struct transformation works | [x] |
| 5 | Encode validation | Exact value match required (allOf), partial arrays rejected | [x] |
| 6 | LiteralKitFor | Returns functional `IGenericLiteralKit` for oneOf validation | [x] |
| 7 | Test coverage | 100% of exported APIs tested in `test/kits/taggedValuesKit.test.ts` | [x] |
| 8 | Documentation | JSDoc with `@example`, `@category`, `@since` on all exports | [x] |
| 9 | BS namespace | Exported through `packages/common/schema/src/schema.ts` | [x] |
| 10 | Type check | `bun run check --filter @beep/schema` passes | [ ] |
| 11 | Tests pass | `bun run test --filter @beep/schema` passes | [x] |
| 12 | Type signatures | No `as unknown as` assertions needed in tests | [ ] |

---

## Phase Breakdown

### Phase 0: Scaffolding (Complete)
- **Agent**: orchestrator
- **Tasks**: Create spec structure, REFLECTION_LOG.md, directories
- **Output**: This spec with measurable criteria
- **Time**: 30 min

### Phase 1: Implementation (2-3 hours)
- **Agent**: effect-code-writer
- **Tasks**:
  - Create `tagged-values-kit.ts` following `TaggedConfigKit` pattern
  - Implement type utilities (`TaggedValuesEntry`, `DecodedConfig`, etc.)
  - Implement builders (`buildValuesFor`, `buildLiteralKitsFor`, etc.)
  - Implement factory with transform schema
  - Add `TaggedValuesKitFromObject` helper
- **Output**: `outputs/implementation-notes.md`
- **Success**: File compiles, exports through BS namespace

### Phase 2: Testing (1-2 hours)
- **Agent**: test-writer
- **Tasks**:
  - Port test structure from `taggedConfigKit.test.ts`
  - Add decode/encode roundtrip tests
  - Add `ValuesFor` and `LiteralKitFor` accessor tests
  - Add validation tests (allOf encode, oneOf LiteralKit)
  - Add edge case tests (single entry, single value, mixed literal types)
- **Output**: `packages/common/schema/test/kits/taggedValuesKit.test.ts`
- **Success**: All tests pass

### Phase 3: Documentation & Integration (30 min)
- **Agent**: doc-writer
- **Tasks**:
  - Add comprehensive JSDoc to all exports
  - Update `packages/common/schema/README.md` if needed
  - Verify exports in BS namespace
- **Output**: Updated source with JSDoc
- **Success**: `bun run docgen --filter @beep/schema` succeeds

### Phase 4: Type Refinement (1-2 hours)
- **Agent**: effect-code-writer / mcp-researcher
- **Tasks**:
  - Investigate Effect Schema transform encode type patterns
  - Fix type signatures so tests don't need `as unknown as` assertions
  - Ensure type safety preserved for valid usage
- **Output**: Updated types, clean test file
- **Success**: `bun run check --filter @beep/schema` passes without assertion workarounds

---

## Context Layers

### Working Memory (Current State)
- **Phase**: 1 (Implementation) - Complete
- **Next Phase**: 2 (Testing)
- **Blocking Issues**: None

### Semantic Memory (Project Constants)

| Key | Value |
|-----|-------|
| Target Package | `@beep/schema` |
| Source Path | `packages/common/schema/src/derived/kits/tagged-values-kit.ts` |
| Test Path | `packages/common/schema/test/kits/taggedValuesKit.test.ts` |
| Reference Implementation | `packages/common/schema/src/derived/kits/tagged-config-kit.ts` |
| LiteralKit Dependency | `packages/common/schema/src/derived/kits/literal-kit.ts` |

### Procedural Memory (Links Only)

| Reference | When to Consult |
|-----------|-----------------|
| [TaggedConfigKit Source](../../packages/common/schema/src/derived/kits/tagged-config-kit.ts) | P1: Primary implementation reference |
| [TaggedConfigKit Tests](../../packages/common/schema/test/kits/taggedConfigKit.test.ts) | P2: Test structure reference |
| [LiteralKit Source](../../packages/common/schema/src/derived/kits/literal-kit.ts) | P1: LiteralKitFor implementation |
| [Effect Patterns](../../.claude/rules/effect-patterns.md) | All phases: Import conventions |
| [Testing Patterns](../../.claude/commands/patterns/effect-testing-patterns.md) | P2: Test patterns |

### Context Budget

| Memory Type | Content | Est. Tokens |
|-------------|---------|-------------|
| Working | Current phase tasks | ~400 |
| Episodic | Previous phases summary | ~200 |
| Semantic | Tech stack constants | ~300 |
| Procedural | Documentation links | ~100 |
| **Total per handoff** | | **~1,000** |

**Target**: ≤4,000 tokens per handoff

#### Verified Token Counts

| File | Words | Est. Tokens | Budget | Status |
|------|-------|-------------|--------|--------|
| HANDOFF_P0.md | 274 | ~1,096 | ≤4,000 | ✅ OK |
| HANDOFF_P1.md | 229 | ~916 | ≤4,000 | ✅ OK |
| HANDOFF_P2.md | 211 | ~844 | ≤4,000 | ✅ OK |
| P1_ORCHESTRATOR_PROMPT.md | 249 | ~996 | ≤4,000 | ✅ OK |
| P2_ORCHESTRATOR_PROMPT.md | 252 | ~1,008 | ≤4,000 | ✅ OK |
| P3_ORCHESTRATOR_PROMPT.md | 251 | ~1,004 | ≤4,000 | ✅ OK |
| QUICK_START.md | 209 | ~836 | ≤600 | ⚠️ Slightly over (acceptable) |

---

## Technical Design

### Entry Type
```ts
type TaggedValuesEntry = readonly [string, A.NonEmptyReadonlyArray<AST.LiteralValue>];
type TaggedValuesEntries = A.NonEmptyReadonlyArray<TaggedValuesEntry>;
```

### Decoded Type
```ts
type DecodedConfig<Tag extends string, Values extends A.NonEmptyReadonlyArray<AST.LiteralValue>> = {
  readonly _tag: Tag;
  readonly values: Values;
};
```

### Construction Example
```ts
import { TaggedValuesKit } from "@beep/schema/derived/kits/tagged-values-kit";

class AllowedAttributesFor extends TaggedValuesKit(
  ["a", ["charset", "coords", "download", "href", "hreflang", "name", "ping", "referrerpolicy", "rel", "rev", "shape", "target", "type"]],
  ["img", ["src", "alt", "width", "height", "loading"]]
) {}
```

### Decode/Encode
```ts
// Decode: "a" → { _tag: "a", values: ["charset", "coords", ...] }
S.decodeSync(AllowedAttributesFor)("a");

// Encode: { _tag: "a", values: [...] } → "a"
// VALIDATES: values must match exactly (allOf)
S.encodeSync(AllowedAttributesFor)({ _tag: "a", values: [...] });
```

### Static Accessors
```ts
// Direct value access
AllowedAttributesFor.ValuesFor.a  // => ["charset", "coords", ...]

// LiteralKit for oneOf validation
AllowedAttributesFor.LiteralKitFor.a  // => IGenericLiteralKit<[...]>
S.decodeSync(AllowedAttributesFor.LiteralKitFor.a)("href")  // valid
S.decodeSync(AllowedAttributesFor.LiteralKitFor.a)("src")   // throws (not in "a")
```

### Interface
```ts
export interface ITaggedValuesKit<Entries extends TaggedValuesEntries>
  extends S.AnnotableClass<ITaggedValuesKit<Entries>, DecodedUnion<Entries>, ExtractTags<Entries>> {

  // From TaggedConfigKit
  readonly Configs: ConfigsAccessor<Entries>;
  readonly Tags: TagsArray<Entries>;
  readonly TagsEnum: TagsEnum<Entries>;
  readonly Entries: Entries;
  readonly is: ConfigGuards<Entries>;
  readonly ConfigMap: HashMap.HashMap<ExtractTags<Entries>, DecodedUnion<Entries>>;
  readonly derive: <Tags extends TagsSubset<Entries>>(...tags: Tags) => ITaggedValuesKit<...>;

  // NEW
  readonly ValuesFor: ValuesForAccessor<Entries>;
  readonly LiteralKitFor: LiteralKitForAccessor<Entries>;
}
```

---

## Validation Invariants

### Encode (allOf)
The `values` array MUST contain ALL defined values for the tag - no more, no less:

```ts
// VALID - exact match
S.encodeSync(Kit)({ _tag: "img", values: ["src", "alt", "width", "height", "loading"] });

// INVALID - missing values
S.encodeSync(Kit)({ _tag: "img", values: ["src", "alt"] });  // throws

// INVALID - extra values
S.encodeSync(Kit)({ _tag: "img", values: ["src", "alt", "width", "height", "loading", "onclick"] });  // throws
```

### LiteralKitFor (oneOf)
Each `LiteralKitFor.<tag>` provides standard LiteralKit validation for individual values:

```ts
const imgKit = Kit.LiteralKitFor.img;
S.decodeSync(imgKit)("src")      // => "src" (valid)
S.decodeSync(imgKit)("onclick")  // throws (not in img's list)
```

---

## Constraints

- MUST maintain backward compatibility with existing `@beep/schema` exports
- MUST follow Effect namespace import patterns (see `.claude/rules/effect-patterns.md`)
- MUST NOT introduce new dependencies (use existing Effect/Schema APIs only)
- MUST use `F.pipe` with Effect collections, NEVER native array/string methods

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/schema

# Run tests
bun run test --filter @beep/schema

# Lint
bun run lint packages/common/schema

# Build
bun run build --filter @beep/schema
```

---

## Open Questions

1. **TaggedValuesKitFromObject** - Include helper for object-based construction?
2. **Order preservation** - Should `values` maintain construction order, or is set equality sufficient?
3. **Tuple vs Array** - Use `S.Tuple` (exact positional) or `S.Array` with set validation?

---

## File Structure

```
specs/tagged-values-kit/
├── README.md                              # This file
├── QUICK_START.md                         # 5-minute triage
├── REFLECTION_LOG.md                      # Cumulative learnings
├── handoffs/
│   ├── HANDOFF_P0.md                      # P0 → P1 context
│   ├── HANDOFF_P1.md                      # P1 → P2 context
│   ├── HANDOFF_P2.md                      # P2 → P3 context
│   ├── P1_ORCHESTRATOR_PROMPT.md          # Start P1
│   ├── P2_ORCHESTRATOR_PROMPT.md          # Start P2
│   └── P3_ORCHESTRATOR_PROMPT.md          # Start P3
├── outputs/
│   └── implementation-notes.md            # Phase 1 output
└── templates/
    └── .gitkeep

packages/common/schema/
├── src/derived/kits/
│   ├── tagged-values-kit.ts               # NEW
│   ├── tagged-config-kit.ts               # Reference
│   └── literal-kit.ts                     # Dependency
└── test/kits/
    ├── taggedValuesKit.test.ts            # NEW
    └── taggedConfigKit.test.ts            # Reference
```
