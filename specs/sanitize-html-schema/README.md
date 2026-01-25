# sanitize-html-schema

> Refactor HTML sanitization module to use Effect Schema-driven approach with discriminated unions and branded output types.

---

## Purpose

Migrate the imperative HTML sanitization module from `@beep/utils/sanitize-html` to a declarative, Effect Schema-driven architecture at `@beep/schema/integrations/html`. The end result should be an `S.transform` schema that accepts `dirty: string | number | null | undefined` and produces a branded `SanitizedHtml` string.

---

## Problem Statement

The current `sanitize-html` module:

1. **Imperative design**: 720+ lines of imperative logic with mutable state, nested callbacks, and complex control flow
2. **Plain TypeScript types**: Uses interface-based types (`SanitizeOptions`, `Frame`, etc.) instead of Effect Schema
3. **No type safety on output**: Returns plain `string` instead of a branded type
4. **Duplicate definitions**: Tag/attribute/scheme literals are duplicated between utils types and schema literal-kits
5. **Not composable**: Cannot be integrated into Effect pipelines or used as schema transforms

---

## Scope

### In Scope

1. **Schema-driven configuration**: Convert `SanitizeOptions` interface to `S.Class`-based schemas with:
   - `S.TaggedClass` for discriminated union variants (e.g., `AllowedTags`, `DisallowedTagsMode`)
   - Existing literal-kits for type-safe tag/attribute/scheme literals
   - Proper validation and defaults via Effect Schema

2. **Transform schema factory**: Create a factory function that builds an `S.transform` schema:
   ```typescript
   const SanitizedHtml = makeSanitizeSchema(config)
   // SanitizedHtml: S.Schema<SanitizedHtml.Type, string | number | null | undefined>
   ```

3. **Branded output type**: Define `SanitizedHtml` as a branded string schema

4. **Discriminated unions**: Use `S.TaggedClass` for:
   - `AllowedTags`: `AllTags` | `NoneTags` | `SpecificTags`
   - `AllowedAttributes`: `AllAttributes` | `NoneAttributes` | `SpecificAttributes`
   - `DisallowedTagsMode`: `Discard` | `Escape` | `RecursiveEscape` | `CompletelyDiscard`
   - `AllowedSchemes`: `AllSchemes` | `NoneSchemes` | `SpecificSchemes`

5. **Integration with existing literal-kits**:
   - `HtmlTag`, `MediaTag`, `VulnerableTag`, `NonTextTag`, `SelfClosing`
   - `HtmlAttribute`, `NonBooleanAttribute`, `AnchorAttribute`, `ImgAttribute`
   - `AllowedScheme`, `AllowedSchemesAppliedToAttributes`
   - `TagsMode` (rename to `DisallowedTagsMode`)

6. **Location migration**: Move from `packages/common/utils/src/sanitize-html/` to `packages/common/schema/src/integrations/html/sanitize/`

### Out of Scope

- Runtime performance optimization (defer to Phase 4+)
- Browser-specific DOM parsing (keep parser abstraction)
- New sanitization features (preserve existing behavior)

---

## Success Criteria

- [ ] `SanitizeConfig` schema using `S.Class` with all options
- [ ] Discriminated unions via `S.TaggedClass` for variant types
- [ ] `makeSanitizeSchema(config)` factory returns transform schema
- [ ] `SanitizedHtml` branded string schema as output type
- [ ] Integration with existing literal-kits (no duplication)
- [ ] Parity with existing sanitization behavior (test coverage)
- [ ] All imports use Effect namespace conventions
- [ ] No native JS array/string methods (use Effect utilities)
- [ ] `bun run check --filter @beep/schema` passes
- [ ] `bun run test --filter @beep/schema` passes

---

## Phase Overview

| Phase | Focus | Agents | Outputs |
|-------|-------|--------|---------|
| 0 | Scaffolding | doc-writer | README, structure |
| 1 | Discovery | codebase-researcher, effect-schema-expert | Codebase mapping, pattern analysis |
| 2 | Design | effect-schema-expert, mcp-researcher | Schema architecture, S.TaggedClass design |
| 3 | Implementation | effect-code-writer | Schema definitions, transform factory |
| 4 | Testing | test-writer | Unit tests, parity tests |
| 5 | Integration | package-error-fixer, code-reviewer | Error fixes, final review |

---

## Architecture Design

### Target Module Structure

```
packages/common/schema/src/integrations/html/
├── literal-kits/           # Existing (enhance if needed)
│   ├── html-tag.ts        # HtmlTag, MediaTag, VulnerableTag, etc.
│   ├── html-attributes.ts # HtmlAttribute, NonBooleanAttribute, etc.
│   ├── allowed-schemes.ts # AllowedScheme, AllowedSchemesAppliedToAttributes
│   ├── tags-mode.ts       # TagsMode (DisallowedTagsMode)
│   └── index.ts
├── models.ts              # Existing: Attributes, ParserOptions
├── sanitize/              # NEW
│   ├── config/            # Configuration schemas
│   │   ├── allowed-tags.ts        # S.TaggedClass union
│   │   ├── allowed-attributes.ts  # S.TaggedClass union
│   │   ├── allowed-schemes.ts     # S.TaggedClass union
│   │   ├── sanitize-config.ts     # Main config S.Class
│   │   └── index.ts
│   ├── types/             # Type schemas
│   │   ├── frame.ts       # Frame schema
│   │   ├── transformer.ts # Transformer function schema
│   │   └── index.ts
│   ├── branded/           # Branded output types
│   │   ├── sanitized-html.ts
│   │   └── index.ts
│   ├── factory.ts         # makeSanitizeSchema factory
│   ├── sanitize.ts        # Core sanitization logic (Effect-based)
│   └── index.ts
└── index.ts               # Barrel export
```

### Discriminated Union Examples

```typescript
// AllowedTags: S.TaggedClass union
export class AllTags extends S.TaggedClass<AllTags>()("AllTags", {}) {}
export class NoneTags extends S.TaggedClass<NoneTags>()("NoneTags", {}) {}
export class SpecificTags extends S.TaggedClass<SpecificTags>()("SpecificTags", {
  tags: S.Array(HtmlTag),
}) {}

export const AllowedTags = S.Union(AllTags, NoneTags, SpecificTags);
export type AllowedTags = typeof AllowedTags.Type;
```

### Transform Schema Factory

```typescript
import * as S from "effect/Schema";
import type { SanitizeConfig } from "./config";
import { SanitizedHtml } from "./branded";

export const makeSanitizeSchema = (config: SanitizeConfig.Type) =>
  S.transform(
    S.Union(S.String, S.Number, S.Null, S.Undefined),
    SanitizedHtml,
    {
      strict: true,
      decode: (dirty) => sanitize(dirty, config),
      encode: (sanitized) => sanitized, // passthrough
    }
  );
```

---

## Key Decisions

### D1: Discriminated Unions via S.TaggedClass

**Decision**: Use `S.TaggedClass` for variant types instead of plain unions.

**Rationale**:
- Type-safe discrimination via `_tag` field
- Consistent with Effect patterns in codebase
- Enables pattern matching via `Match.value().pipe(...)`
- Composable with other Effect utilities

### D2: Factory Pattern for Transform Schema

**Decision**: Expose `makeSanitizeSchema(config)` factory rather than pre-built schema.

**Rationale**:
- Configuration determines sanitization rules
- Allows compile-time type safety for specific configs
- Enables tree-shaking unused rules
- Mirrors Effect's factory patterns (e.g., `Layer.provide`)

### D3: Branded String Output

**Decision**: Output `SanitizedHtml` branded string, not plain string.

**Rationale**:
- Prevents accidental mixing of sanitized/unsanitized strings
- Enables type-safe APIs that require sanitized input
- Aligns with `@beep/schema` EntityId branding pattern

### D4: Keep Parser Abstraction

**Decision**: Keep existing HTML parser abstraction, don't inline parsing logic.

**Rationale**:
- Parser is well-tested and handles edge cases
- Schema layer should focus on config/transform, not parsing
- Allows future parser swapping (browser DOM, different library)

---

## Reference Files

### Source (to migrate)
- `packages/common/utils/src/sanitize-html/sanitize-html.ts` - Main sanitization
- `packages/common/utils/src/sanitize-html/types.ts` - Type definitions
- `packages/common/utils/src/sanitize-html/defaults.ts` - Default config
- `packages/common/utils/src/sanitize-html/filters/` - Tag/attribute filters
- `packages/common/utils/src/sanitize-html/parser/` - HTML parser

### Destination (to enhance)
- `packages/common/schema/src/integrations/html/literal-kits/` - Tag/attribute literals
- `packages/common/schema/src/integrations/html/models.ts` - Existing models

### Pattern References
- `packages/common/schema/src/derived/kits/string-literal-kit.ts` - StringLiteralKit pattern
- `packages/iam/domain/src/entities/Member/schemas/MemberStatus.ts` - S.TaggedClass usage
- `.claude/rules/effect-patterns.md` - Effect conventions

---

## Complexity Score

| Factor | Weight | Value | Score |
|--------|--------|-------|-------|
| Phase Count | 2 | 5 | 10 |
| Agent Diversity | 3 | 5 | 15 |
| Cross-Package | 4 | 4 | 16 |
| External Dependencies | 3 | 0 | 0 |
| Uncertainty | 5 | 4 | 20 |
| Research Required | 2 | 3 | 6 |
| **Total** | | | **67** |

**Complexity Level**: Critical (61+)

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute getting started guide.

---

## Related

- [Spec Guide](../_guide/README.md)
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md)
- [Schema AGENTS.md](../../packages/common/schema/CLAUDE.md)
