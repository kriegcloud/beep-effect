# sanitize-html-schema Handoff: Phase 3 Implementation

> Context for Phase 3: Schema Implementation

---

## Phase 2 Summary (Complete)

| Deliverable | Status | Location |
|-------------|--------|----------|
| AllowedTags Design | Complete | `outputs/design-allowed-tags.md` |
| AllowedAttributes Design | Complete | `outputs/design-allowed-attributes.md` |
| SanitizeConfig Design | Complete | `outputs/design-sanitize-config.md` |
| SanitizedHtml Brand Design | Complete | `outputs/design-sanitized-html.md` |
| Factory Function Design | Complete | `outputs/design-factory.md` |
| Reflection Log | Updated | `REFLECTION_LOG.md` |

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Callback fields | Excluded | Cannot serialize functions |
| RegExp fields | `{ source: string, flags?: string }` | JSON-serializable |
| Wildcard key `*` | `S.Union(HtmlTag, S.Literal("*"))` | Single unified Record |
| AllowedTags variants | AllTags / NoneTags / SpecificTags | Three-state discriminated union |
| AllowedAttributes variants | AllAttributes / NoneAttributes / SpecificAttributes | Three-state with wildcard support |
| Factory function | `S.transformOrFail` | Sanitization can fail |
| Output brand | `SanitizedHtml` | Compile-time XSS prevention |

---

## Phase 3 Mission

**Objective**: Implement all designed schemas and write comprehensive tests.

**Duration**: 1-2 sessions
**Checkpoint**: Per-file implementation

---

## Implementation Tasks

### Task 3.1: RegExpPattern Schema

**File**: `packages/common/utils/src/sanitize-html/schemas/regexp-pattern.ts`

**Implements**:
```typescript
export class RegExpPattern extends S.Class<RegExpPattern>("RegExpPattern")({
  source: S.String,
  flags: S.optional(S.String),
}) {
  toRegExp(): RegExp;
  static fromRegExp(regex: RegExp): RegExpPattern;
}
```

**Reference**: `outputs/design-sanitize-config.md` → RegExpPattern section

---

### Task 3.2: AllowedTags Schema

**File**: `packages/common/utils/src/sanitize-html/schemas/allowed-tags.ts`

**Implements**:
- `AllTags` variant (S.Struct with `_tag: "AllTags"`)
- `NoneTags` variant (S.Struct with `_tag: "NoneTags"`)
- `SpecificTags` variant (S.Struct with `_tag: "SpecificTags", tags: S.Array(HtmlTag)`)
- `AllowedTags` union (S.Union of all three)
- Factory functions: `AllowedTags.all()`, `.none()`, `.specific(tags)`

**Reference**: `outputs/design-allowed-tags.md`

---

### Task 3.3: AllowedAttributes Schema

**File**: `packages/common/utils/src/sanitize-html/schemas/allowed-attributes.ts`

**Implements**:
- `AttributeConstraint` schema (`{ name, multiple?, values }`)
- `AllowedAttribute` union (`S.String | AttributeConstraint`)
- `TagKey` schema (`S.Union(HtmlTag, S.Literal("*"))`)
- `AllAttributes` / `NoneAttributes` / `SpecificAttributes` variants
- `AllowedAttributes` union
- Factory functions

**Reference**: `outputs/design-allowed-attributes.md`

---

### Task 3.4: AllowedSchemes and AllowedSchemesByTag Schemas

**File**: `packages/common/utils/src/sanitize-html/schemas/allowed-schemes.ts`

**Implements**:
- `AllowedSchemes` discriminated union (AllowAll | AllowSpecific)
- `AllowedSchemesByTag` discriminated union
- Uses `AllowedScheme` from `@beep/schema/integrations/html`

**Reference**: `outputs/design-sanitize-config.md` → AllowedSchemes section

---

### Task 3.5: AllowedClasses Schema

**File**: `packages/common/utils/src/sanitize-html/schemas/allowed-classes.ts`

**Implements**:
- `AllowedClassesForTag` discriminated union (AllowAll | AllowSpecific)
- `AllowedClassesForTag.AllowSpecific.classes: S.Array(S.Union(S.String, RegExpPattern))`

**Reference**: `outputs/design-sanitize-config.md` → AllowedClassesForTag section

---

### Task 3.6: DisallowedTagsMode Schema

**File**: `packages/common/utils/src/sanitize-html/schemas/disallowed-tags-mode.ts`

**Implements**:
- Uses existing `TagsMode` from `@beep/schema/integrations/html`
- Or create if not suitable

**Reference**: `outputs/design-sanitize-config.md`

---

### Task 3.7: SanitizeConfig Schema

**File**: `packages/common/utils/src/sanitize-html/schemas/sanitize-config.ts`

**Implements**:
- `SanitizeConfig` S.Class with all serializable fields
- Uses all sub-schemas from tasks 3.1-3.6
- `DefaultSanitizeConfig` preset
- `MinimalSanitizeConfig` preset
- `PermissiveSanitizeConfig` preset

**Reference**: `outputs/design-sanitize-config.md` → SanitizeConfig section

---

### Task 3.8: SanitizedHtml Brand

**File**: `packages/common/utils/src/sanitize-html/schemas/sanitized-html.ts`

**Implements**:
```typescript
export const SanitizedHtml = S.String.pipe(
  S.brand("SanitizedHtml")
).annotations({ ... });

export namespace SanitizedHtml {
  export type Type = string & SanitizedHtmlBrand;
  export type Encoded = string;
  export const is: (u: unknown) => u is Type;
  export const unsafe: (html: string) => Type;
}
```

**Reference**: `outputs/design-sanitized-html.md`

---

### Task 3.9: Factory Function

**File**: `packages/common/utils/src/sanitize-html/schemas/make-sanitize-schema.ts`

**Implements**:
```typescript
export const makeSanitizeSchema = (
  config: SanitizeConfig.Type
): S.Schema<SanitizedHtml, string | number | null | undefined> =>
  S.transformOrFail(DirtyHtml, SanitizedHtml, { ... });
```

**Reference**: `outputs/design-factory.md`

---

### Task 3.10: Config-to-Runtime Transformer

**File**: `packages/common/utils/src/sanitize-html/schemas/to-sanitize-html-options.ts`

**Implements**:
- `toSanitizeHtmlOptions(config: SanitizeConfig): sanitizeHtml.IOptions`
- Uses `Match.value` for discriminated union conversion
- Handles RegExpPattern → RegExp conversion

**Reference**: `outputs/design-factory.md` → toSanitizeHtmlOptions section

---

### Task 3.11: Index and Exports

**File**: `packages/common/utils/src/sanitize-html/schemas/index.ts`

**Implements**:
- Re-exports all schemas
- Module organization

---

### Task 3.12: Tests

**Files**:
- `packages/common/utils/test/sanitize-html/schemas/allowed-tags.test.ts`
- `packages/common/utils/test/sanitize-html/schemas/allowed-attributes.test.ts`
- `packages/common/utils/test/sanitize-html/schemas/sanitize-config.test.ts`
- `packages/common/utils/test/sanitize-html/schemas/sanitized-html.test.ts`
- `packages/common/utils/test/sanitize-html/schemas/make-sanitize-schema.test.ts`

**Test Categories**:
1. Schema decode/encode round-trip
2. Factory function behavior
3. Match.value exhaustiveness
4. Error handling
5. Type guards
6. Preset validation

**Reference**: `@beep/testkit` patterns from `.claude/commands/patterns/effect-testing-patterns.md`

---

## File Structure

```
packages/common/utils/src/sanitize-html/
├── index.ts                          # Main exports (existing)
├── sanitize.ts                       # Core sanitize function (existing)
├── types.ts                          # Type definitions (existing)
├── defaults.ts                       # Default config (existing)
├── schemas/                          # NEW: Effect Schema layer
│   ├── index.ts                      # Schema exports
│   ├── regexp-pattern.ts             # RegExpPattern schema
│   ├── allowed-tags.ts               # AllowedTags discriminated union
│   ├── allowed-attributes.ts         # AllowedAttributes discriminated union
│   ├── allowed-schemes.ts            # AllowedSchemes/ByTag schemas
│   ├── allowed-classes.ts            # AllowedClasses schema
│   ├── disallowed-tags-mode.ts       # DisallowedTagsMode (reuse or create)
│   ├── sanitize-config.ts            # SanitizeConfig S.Class
│   ├── sanitized-html.ts             # SanitizedHtml branded type
│   ├── make-sanitize-schema.ts       # Factory function
│   └── to-sanitize-html-options.ts   # Config transformer

packages/common/utils/test/sanitize-html/
├── schemas/
│   ├── allowed-tags.test.ts
│   ├── allowed-attributes.test.ts
│   ├── sanitize-config.test.ts
│   ├── sanitized-html.test.ts
│   └── make-sanitize-schema.test.ts
```

---

## Implementation Order

**Recommended sequence** (dependency order):

1. `regexp-pattern.ts` (no dependencies)
2. `allowed-tags.ts` (depends on HtmlTag)
3. `allowed-attributes.ts` (depends on HtmlTag, HtmlAttribute)
4. `allowed-schemes.ts` (depends on AllowedScheme)
5. `allowed-classes.ts` (depends on RegExpPattern)
6. `disallowed-tags-mode.ts` (depends on TagsMode)
7. `sanitize-config.ts` (depends on all above)
8. `sanitized-html.ts` (no dependencies)
9. `make-sanitize-schema.ts` (depends on SanitizeConfig, SanitizedHtml)
10. `to-sanitize-html-options.ts` (depends on SanitizeConfig)
11. `schemas/index.ts` (re-exports)
12. Tests (parallel)

---

## Key References

| Document | Purpose |
|----------|---------|
| `outputs/design-allowed-tags.md` | AllowedTags schema spec |
| `outputs/design-allowed-attributes.md` | AllowedAttributes schema spec |
| `outputs/design-sanitize-config.md` | SanitizeConfig full spec |
| `outputs/design-sanitized-html.md` | Brand design spec |
| `outputs/design-factory.md` | Factory function spec |
| `.claude/rules/effect-patterns.md` | Effect Schema conventions |
| `.claude/commands/patterns/effect-testing-patterns.md` | Test patterns |
| `packages/common/schema/src/integrations/html/` | Existing HTML literal-kits |

---

## Verification

After each task:

```bash
# Type check
bun run check --filter @beep/utils

# Run tests
bun run test --filter @beep/utils

# Lint
bun run lint --filter @beep/utils
```

---

## Exit Criteria

Phase 3 is complete when:

- [ ] All 10 schema files created
- [ ] schemas/index.ts exports all schemas
- [ ] 5 test files created with passing tests
- [ ] `bun run check --filter @beep/utils` passes
- [ ] `bun run test --filter @beep/utils` passes
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] HANDOFF_P4.md created (if needed)

---

## Notes

1. Follow Effect namespace imports (`import * as S from "effect/Schema"`)
2. Use `@beep/testkit` for all tests (NOT raw bun:test)
3. Use HtmlTag/HtmlAttribute/AllowedScheme from `@beep/schema/integrations/html`
4. All schemas must have annotations (identifier, description, examples)
5. Use Match.value for discriminated union handling
6. Validate against sanitize-html defaults for preset configs
