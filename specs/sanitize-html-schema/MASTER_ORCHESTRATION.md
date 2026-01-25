# sanitize-html-schema: Master Orchestration

> Complete workflow for migrating HTML sanitization to Effect Schema-driven architecture.

---

## Overview

This orchestration transforms the imperative `sanitize-html` module in `@beep/utils` into a declarative, schema-driven system at `@beep/schema/integrations/html/sanitize`. The key deliverables are:

1. **S.TaggedClass discriminated unions** for configuration variants
2. **SanitizedHtml branded type** for type-safe output
3. **makeSanitizeSchema factory** that builds transform schemas from config
4. **Full test coverage** ensuring behavioral parity

---

## Phase 0: Scaffolding (COMPLETE)

### Completed Items
- [x] Created spec folder structure
- [x] README.md with purpose, scope, and architecture
- [x] QUICK_START.md with core concepts
- [x] MASTER_ORCHESTRATION.md (this file)
- [x] AGENT_PROMPTS.md with phase prompts
- [x] REFLECTION_LOG.md template

### Outputs
- `specs/sanitize-html-schema/README.md`
- `specs/sanitize-html-schema/QUICK_START.md`
- `specs/sanitize-html-schema/MASTER_ORCHESTRATION.md`
- `specs/sanitize-html-schema/AGENT_PROMPTS.md`
- `specs/sanitize-html-schema/REFLECTION_LOG.md`

---

## Phase 1: Discovery

### Objective
Map the existing sanitize-html implementation and identify all types, options, and dependencies.

### Tasks

| # | Task | Agent | Output |
|---|------|-------|--------|
| 1.1 | Map sanitize-html types | codebase-researcher | Types inventory |
| 1.2 | Document config options | codebase-researcher | Options matrix |
| 1.3 | Identify filter dependencies | codebase-researcher | Dependency graph |
| 1.4 | Catalog existing literal-kits | codebase-researcher | Literal-kit inventory |
| 1.5 | Research S.TaggedClass patterns | effect-schema-expert | Pattern examples |

### Key Questions to Answer

1. **Type Mapping**
   - What interfaces exist in `types.ts`?
   - Which types have union variants (e.g., `false | string[]`)?
   - What callback/function types are defined?

2. **Configuration Options**
   - What are all the options in `SanitizeOptions`?
   - Which options have default values?
   - Which options use `false` to mean "allow all"?

3. **Dependencies**
   - What do tag-filter, attribute-filter, class-filter depend on?
   - How does the parser integrate with filters?
   - What shared utilities are used?

4. **Literal Kit Coverage**
   - Which tags are already in `HtmlTag`?
   - Are all schemes covered in `AllowedScheme`?
   - What attributes are missing from `HtmlAttribute`?

### Outputs
- `outputs/codebase-context.md` - Complete type/option inventory
- `outputs/dependency-graph.md` - Module dependency visualization
- `outputs/literal-kit-gaps.md` - Missing literals to add

### Exit Criteria
- [ ] All 27 `SanitizeOptions` fields documented
- [ ] All filter dependencies mapped
- [ ] Literal-kit gaps identified
- [ ] S.TaggedClass pattern examples collected

---

## Phase 2: Design

### Objective
Design the schema architecture, discriminated unions, and factory pattern.

### Tasks

| # | Task | Agent | Output |
|---|------|-------|--------|
| 2.1 | Design AllowedTags union | effect-schema-expert | Schema definition |
| 2.2 | Design AllowedAttributes union | effect-schema-expert | Schema definition |
| 2.3 | Design AllowedSchemes union | effect-schema-expert | Schema definition |
| 2.4 | Design SanitizeConfig class | effect-schema-expert | Schema definition |
| 2.5 | Design SanitizedHtml brand | effect-schema-expert | Schema definition |
| 2.6 | Design factory interface | effect-schema-expert | API design |
| 2.7 | Research S.transform patterns | mcp-researcher | Pattern docs |

### Design Decisions

#### AllowedTags Union

```typescript
// Three variants: all tags, no tags, specific tags
class AllTags extends S.TaggedClass<AllTags>()("AllTags", {}) {}
class NoneTags extends S.TaggedClass<NoneTags>()("NoneTags", {}) {}
class SpecificTags extends S.TaggedClass<SpecificTags>()("SpecificTags", {
  tags: S.Array(HtmlTag),
}) {}

export const AllowedTags = S.Union(AllTags, NoneTags, SpecificTags);
```

#### AllowedAttributes Union

```typescript
// Supports global attributes + per-tag overrides
class AllAttributes extends S.TaggedClass<AllAttributes>()("AllAttributes", {}) {}
class NoneAttributes extends S.TaggedClass<NoneAttributes>()("NoneAttributes", {}) {}
class SpecificAttributes extends S.TaggedClass<SpecificAttributes>()("SpecificAttributes", {
  // Attributes allowed on all tags
  global: S.optional(S.Array(HtmlAttribute)),
  // Per-tag attribute overrides
  byTag: S.optional(S.Record({
    key: HtmlTag,
    value: S.Array(HtmlAttribute),
  })),
}) {}

export const AllowedAttributes = S.Union(AllAttributes, NoneAttributes, SpecificAttributes);
```

#### DisallowedTagsMode

```typescript
// Reuse existing TagsMode, add TaggedClass wrappers
class DiscardMode extends S.TaggedClass<DiscardMode>()("Discard", {}) {}
class EscapeMode extends S.TaggedClass<EscapeMode>()("Escape", {}) {}
class RecursiveEscapeMode extends S.TaggedClass<RecursiveEscapeMode>()("RecursiveEscape", {}) {}
class CompletelyDiscardMode extends S.TaggedClass<CompletelyDiscardMode>()("CompletelyDiscard", {}) {}

export const DisallowedTagsMode = S.Union(
  DiscardMode,
  EscapeMode,
  RecursiveEscapeMode,
  CompletelyDiscardMode
);
```

#### SanitizedHtml Brand

```typescript
import * as S from "effect/Schema";
import * as B from "effect/Brand";

export const SanitizedHtml = S.String.pipe(
  S.brand("SanitizedHtml"),
  S.annotations({
    identifier: "SanitizedHtml",
    description: "HTML string that has been sanitized against XSS attacks",
  })
);

export type SanitizedHtml = S.Schema.Type<typeof SanitizedHtml>;
```

### Outputs
- `outputs/schema-design.md` - Complete schema architecture
- `outputs/api-design.md` - Factory interface and usage examples

### Exit Criteria
- [ ] All discriminated unions designed
- [ ] SanitizeConfig schema complete
- [ ] SanitizedHtml brand defined
- [ ] Factory interface documented
- [ ] Migration strategy defined

---

## Phase 3: Implementation

### Objective
Implement the designed schemas, factory, and core sanitization logic.

### Tasks

| # | Task | Agent | Files |
|---|------|-------|-------|
| 3.1 | Create config/ directory structure | effect-code-writer | Directory scaffold |
| 3.2 | Implement AllowedTags schema | effect-code-writer | `config/allowed-tags.ts` |
| 3.3 | Implement AllowedAttributes schema | effect-code-writer | `config/allowed-attributes.ts` |
| 3.4 | Implement AllowedSchemes schema | effect-code-writer | `config/allowed-schemes.ts` |
| 3.5 | Implement DisallowedTagsMode schema | effect-code-writer | `config/disallowed-tags-mode.ts` |
| 3.6 | Implement SanitizeConfig schema | effect-code-writer | `config/sanitize-config.ts` |
| 3.7 | Implement SanitizedHtml brand | effect-code-writer | `branded/sanitized-html.ts` |
| 3.8 | Implement Frame/Transformer types | effect-code-writer | `types/` directory |
| 3.9 | Migrate sanitization logic | effect-code-writer | `sanitize.ts` |
| 3.10 | Implement makeSanitizeSchema factory | effect-code-writer | `factory.ts` |
| 3.11 | Create barrel exports | effect-code-writer | `index.ts` files |
| 3.12 | Update html integrations index | effect-code-writer | `html/index.ts` |

### Implementation Order

```
1. branded/sanitized-html.ts      # No dependencies
2. config/allowed-tags.ts         # Depends on literal-kits
3. config/allowed-attributes.ts   # Depends on literal-kits
4. config/allowed-schemes.ts      # Depends on literal-kits
5. config/disallowed-tags-mode.ts # Depends on literal-kits
6. types/frame.ts                 # No dependencies
7. types/transformer.ts           # Depends on frame
8. config/sanitize-config.ts      # Depends on all config/*
9. sanitize.ts                    # Core logic, depends on config
10. factory.ts                     # Depends on everything
11. index.ts files                 # Barrel exports
```

### Verification After Each Task

```bash
# After each file
bun run check --filter @beep/schema

# After implementation complete
bun run lint:fix --filter @beep/schema
```

### Outputs
- New files in `packages/common/schema/src/integrations/html/sanitize/`
- Updated `packages/common/schema/src/integrations/html/index.ts`

### Exit Criteria
- [ ] All schema files created
- [ ] Factory function works
- [ ] Type check passes
- [ ] Lint passes

---

## Phase 4: Testing

### Objective
Create comprehensive tests ensuring behavioral parity with existing sanitize-html.

### Tasks

| # | Task | Agent | Files |
|---|------|-------|-------|
| 4.1 | Test AllowedTags variants | test-writer | `test/allowed-tags.test.ts` |
| 4.2 | Test AllowedAttributes variants | test-writer | `test/allowed-attributes.test.ts` |
| 4.3 | Test SanitizeConfig | test-writer | `test/sanitize-config.test.ts` |
| 4.4 | Test SanitizedHtml brand | test-writer | `test/sanitized-html.test.ts` |
| 4.5 | Test factory function | test-writer | `test/factory.test.ts` |
| 4.6 | Parity tests vs existing | test-writer | `test/parity.test.ts` |
| 4.7 | Edge case tests | test-writer | `test/edge-cases.test.ts` |

### Test Categories

#### Schema Validation Tests
```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as S from "effect/Schema";

effect("AllTags creates valid union member", () =>
  Effect.gen(function* () {
    const result = S.decodeSync(AllowedTags)({ _tag: "AllTags" });
    strictEqual(result._tag, "AllTags");
  })
);
```

#### Parity Tests
```typescript
import { sanitizeHtml as oldSanitize } from "@beep/utils/sanitize-html";
import { makeSanitizeSchema } from "@beep/schema/integrations/html/sanitize";

effect("matches old sanitizer output for script removal", () =>
  Effect.gen(function* () {
    const input = "<script>alert('xss')</script><p>safe</p>";
    const oldResult = oldSanitize(input);

    const schema = makeSanitizeSchema(defaultConfig);
    const newResult = S.decodeSync(schema)(input);

    strictEqual(newResult, oldResult);
  })
);
```

### Outputs
- Test files in `packages/common/schema/test/integrations/html/sanitize/`
- Coverage report

### Exit Criteria
- [ ] All schema tests pass
- [ ] Parity tests pass
- [ ] Edge cases covered
- [ ] >90% coverage on new code

---

## Phase 5: Integration

### Objective
Fix errors, update exports, and finalize integration.

### Tasks

| # | Task | Agent | Output |
|---|------|-------|--------|
| 5.1 | Fix type errors | package-error-fixer | Clean build |
| 5.2 | Fix lint errors | package-error-fixer | Clean lint |
| 5.3 | Update BS namespace exports | effect-code-writer | Updated schema.ts |
| 5.4 | Update package exports | effect-code-writer | Updated package.json |
| 5.5 | Final code review | code-reviewer | Review report |
| 5.6 | Update documentation | doc-writer | Updated docs |

### Final Verification

```bash
# Full verification
bun run check --filter @beep/schema
bun run test --filter @beep/schema
bun run lint --filter @beep/schema

# Cross-package check
bun run check
```

### Outputs
- Clean build
- Updated documentation
- Final review report

### Exit Criteria
- [ ] All checks pass
- [ ] BS namespace includes new exports
- [ ] Documentation updated
- [ ] Code review complete

---

## Handoff Protocol

At the end of each phase, create:

1. **`handoffs/HANDOFF_P[N+1].md`** - Context document
2. **`handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`** - Copy-paste prompt

See [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) for phase-specific prompts.

---

## Success Criteria (Final)

- [ ] `SanitizeConfig` schema using `S.Class` with all 27 options
- [ ] Discriminated unions via `S.TaggedClass` for variant types
- [ ] `makeSanitizeSchema(config)` factory returns transform schema
- [ ] `SanitizedHtml` branded string schema as output type
- [ ] Integration with existing literal-kits (no duplication)
- [ ] Parity with existing sanitization behavior (test coverage)
- [ ] All imports use Effect namespace conventions
- [ ] No native JS array/string methods (use Effect utilities)
- [ ] `bun run check --filter @beep/schema` passes
- [ ] `bun run test --filter @beep/schema` passes
- [ ] `bun run lint --filter @beep/schema` passes

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Performance regression | Benchmark against old sanitizer, defer optimization |
| Parser incompatibility | Keep existing parser, wrap in Effect |
| Missing edge cases | Comprehensive parity tests |
| Breaking consumers | Keep old function, add deprecation warning |
