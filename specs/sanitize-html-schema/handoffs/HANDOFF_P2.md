# sanitize-html-schema Handoff: Phase 2 Design

> Context for Phase 2: Schema Architecture Design

---

## Phase 1 Summary (Complete)

| Deliverable | Status | Location |
|-------------|--------|----------|
| Type Inventory | Complete | `outputs/types-inventory.md` |
| Options Matrix | Complete | `outputs/options-matrix.md` |
| Dependency Graph | Complete | `outputs/dependency-graph.md` |
| Literal-Kit Gaps | Complete | `outputs/literal-kit-gaps.md` |
| Reflection Log | Updated | `REFLECTION_LOG.md` |

### Key Discoveries

1. **27+ SanitizeOptions fields** - All optional, many with `false | ...` union pattern
2. **5 fields use `false = allow all`** - allowedTags, allowedAttributes, allowedSchemes, allowedSchemesByTag, allowedClasses (nested)
3. **4 callback fields** - Cannot serialize (textFilter, exclusiveFilter, onOpenTag, onCloseTag)
4. **2 fields use RegExp** - allowedStyles, allowedClasses
5. **Token types already tagged** - Parser tokens use `_tag` discriminator
6. **Literal-kit gaps** - VulnerarbleTag typo, AllowedScheme has unsafe `data:` and `cid:`
7. **Zero external deps** - Only Effect modules

---

## Phase 2 Mission

**Objective**: Design the complete schema architecture using Effect Schema patterns.

**Duration**: 1 session
**Checkpoint**: Per-task

---

## Tasks

### Task 2.1: AllowedTags Design (effect-schema-expert)

Design the `AllowedTags` discriminated union:

```typescript
// Target API
AllowedTags.all()        // → { _tag: "AllTags" }
AllowedTags.none()       // → { _tag: "NoneTags" }
AllowedTags.specific([...]) // → { _tag: "SpecificTags", tags: [...] }
```

Requirements:
- [ ] S.TaggedStruct for each variant
- [ ] S.Union composition
- [ ] Integration with HtmlTag literal-kit
- [ ] Match.value compatibility

**Output**: `outputs/design-allowed-tags.md`

### Task 2.2: AllowedAttributes Design (effect-schema-expert)

Design the `AllowedAttributes` discriminated union:

```typescript
AllowedAttributes.all()
AllowedAttributes.none()
AllowedAttributes.specific({
  "*": ["class", "id"],
  "a": ["href", "target"],
})
```

Requirements:
- [ ] Handle wildcard `*` key
- [ ] Support AllowedAttribute union (string | {name, multiple?, values})
- [ ] Per-tag attribute mapping

**Output**: `outputs/design-allowed-attributes.md`

### Task 2.3: SanitizeConfig Design (effect-schema-expert)

Design the main configuration schema:

Requirements:
- [ ] Include all 27+ options
- [ ] Use discriminated unions for variant types
- [ ] Sensible defaults matching current defaults.ts
- [ ] Mark callback fields as excluded from serialization
- [ ] Handle RegExp fields (pattern string + flags)

**Output**: `outputs/design-sanitize-config.md`

### Task 2.4: SanitizedHtml Brand Design (effect-schema-expert)

Design the branded output type:

```typescript
// Target API
const html = S.decodeSync(SanitizedHtml)("<p>Hello</p>");
// html: SanitizedHtml (branded string)
```

Requirements:
- [ ] S.String base with S.brand("SanitizedHtml")
- [ ] Proper annotations
- [ ] Integration with makeSanitizeSchema factory

**Output**: `outputs/design-sanitized-html.md`

### Task 2.5: Factory Function Design (mcp-researcher)

Research S.transform patterns for the factory:

```typescript
const makeSanitizeSchema = (config: SanitizeConfig.Type) =>
  S.transform(
    S.Union(S.String, S.Number, S.Null, S.Undefined),
    SanitizedHtml,
    { decode: (dirty) => sanitize(dirty, config), encode: identity }
  );
```

Questions to answer:
- [ ] How to handle transformation errors?
- [ ] Best practices for effectful transforms?
- [ ] Configuration closure patterns?

**Output**: `outputs/design-factory.md`

---

## Key Context from Phase 1

### Union Types Requiring S.TaggedClass/S.TaggedStruct

| Type | Variants | Has Payload |
|------|----------|-------------|
| AllowedTags | AllTags, NoneTags, SpecificTags | SpecificTags only |
| AllowedAttributes | AllAttributes, NoneAttributes, SpecificAttributes | SpecificAttributes only |
| AllowedSchemes | AllSchemes, NoneSchemes, SpecificSchemes | SpecificSchemes only |
| DisallowedTagsMode | Discard, Escape, RecursiveEscape, CompletelyDiscard | None |
| AllowedClasses (nested) | AllClasses, SpecificClasses | SpecificClasses only |

### Existing Literal-Kits to Use

| Kit | Import Path |
|-----|-------------|
| HtmlTag | `@beep/schema/integrations/html` |
| HtmlAttribute | `@beep/schema/integrations/html` |
| AllowedScheme | `@beep/schema/integrations/html` |
| TagsMode | `@beep/schema/integrations/html` |

### @beep/schema Custom Utilities

Located in `packages/common/schema/src/core/generics/`:
- `tagged-class.ts` - Custom TaggedClass wrapper
- `tagged-union.ts` - Union factory
- `tagged-struct.ts` - TaggedStruct wrapper

Read these files to understand the codebase patterns before designing.

---

## Design Decisions to Make

### D1: Callback Field Handling

Options:
1. Exclude entirely from schema (runtime-only)
2. Create placeholder type (e.g., `S.Unknown`)
3. Separate serializable vs runtime config types

### D2: RegExp Field Handling

Options:
1. Store as `{ source: string, flags: string }` and transform
2. Store as string pattern only
3. Exclude from serializable schema

### D3: Wildcard Key Handling

For `allowedAttributes["*"]`:
1. Special `GlobalAttributes` variant
2. Regular Record with `*` as literal key
3. Separate `globalAttributes` field

---

## Verification

After each task:

```bash
# Verify outputs exist
ls specs/sanitize-html-schema/outputs/design-*.md

# Check for completeness
wc -l specs/sanitize-html-schema/outputs/design-*.md
```

---

## Exit Criteria

Phase 2 is complete when:

- [ ] All 5 design tasks completed
- [ ] 5 design output files in outputs/
- [ ] All discriminated unions specified
- [ ] SanitizeConfig with all 27+ fields designed
- [ ] Factory function approach decided
- [ ] Callback and RegExp handling decided
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P3.md created
- [ ] P3_ORCHESTRATOR_PROMPT.md created

---

## Notes

1. Use effect-schema-expert agent for Tasks 2.1-2.4
2. Use mcp-researcher for Task 2.5 (S.transform research)
3. Read @beep/schema utility files before designing
4. Focus on API design, not implementation details
5. Document all decision rationale
