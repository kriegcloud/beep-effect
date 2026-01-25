# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 Implementation.

---

## Prompt

You are implementing Phase 3 (Implementation) of the sanitize-html-schema spec.

### Context

Phase 2 Design is complete. All schema architectures have been designed:
- AllowedTags discriminated union in `outputs/design-allowed-tags.md`
- AllowedAttributes discriminated union in `outputs/design-allowed-attributes.md`
- SanitizeConfig with 27+ fields in `outputs/design-sanitize-config.md`
- SanitizedHtml brand in `outputs/design-sanitized-html.md`
- Factory function in `outputs/design-factory.md`

### Your Mission

Implement all designed schemas in `packages/common/utils/src/sanitize-html/schemas/`.

### Pre-Work (do this first)

1. Read the design documents:
```
specs/sanitize-html-schema/outputs/design-allowed-tags.md
specs/sanitize-html-schema/outputs/design-sanitize-config.md
specs/sanitize-html-schema/outputs/design-factory.md
```

2. Read the handoff document for full implementation plan:
```
specs/sanitize-html-schema/handoffs/HANDOFF_P3.md
```

### Implementation Order

Follow dependency order:

1. **RegExpPattern** → `schemas/regexp-pattern.ts`
2. **AllowedTags** → `schemas/allowed-tags.ts`
3. **AllowedAttributes** → `schemas/allowed-attributes.ts`
4. **AllowedSchemes** → `schemas/allowed-schemes.ts`
5. **AllowedClasses** → `schemas/allowed-classes.ts`
6. **DisallowedTagsMode** → `schemas/disallowed-tags-mode.ts`
7. **SanitizeConfig** → `schemas/sanitize-config.ts`
8. **SanitizedHtml** → `schemas/sanitized-html.ts`
9. **makeSanitizeSchema** → `schemas/make-sanitize-schema.ts`
10. **toSanitizeHtmlOptions** → `schemas/to-sanitize-html-options.ts`
11. **Index** → `schemas/index.ts`

### Tasks (use agents)

For each schema file, you can use `effect-code-writer` agent:

```
Task: Implement AllowedTags schema
Read: specs/sanitize-html-schema/outputs/design-allowed-tags.md
Write: packages/common/utils/src/sanitize-html/schemas/allowed-tags.ts
```

### Tests

After implementation, write tests using `test-writer` agent:

```
Task: Write tests for AllowedTags schema
Reference: packages/common/utils/src/sanitize-html/schemas/allowed-tags.ts
Write: packages/common/utils/test/sanitize-html/schemas/allowed-tags.test.ts
```

### Critical Patterns

From `.claude/rules/effect-patterns.md`:

```typescript
// Namespace imports REQUIRED
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as Match from "effect/Match";

// PascalCase constructors REQUIRED
S.Struct({ name: S.String })
S.Array(S.Number)
S.Union(S.String, S.Number)

// NO native methods
// WRONG: array.map(x => x)
// RIGHT: A.map(array, x => x)
```

### Verification After Each File

```bash
bun run check --filter @beep/utils
```

### Key Imports

```typescript
import { HtmlTag, HtmlAttribute, AllowedScheme, TagsMode } from "@beep/schema/integrations/html";
```

### Success Criteria

- [ ] 11 schema files created in `schemas/`
- [ ] All schemas have annotations (identifier, description, examples)
- [ ] Factory functions work correctly
- [ ] 5 test files passing
- [ ] `bun run check --filter @beep/utils` passes
- [ ] `bun run test --filter @beep/utils` passes
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings

### Handoff Document

Read full implementation plan in: `specs/sanitize-html-schema/handoffs/HANDOFF_P3.md`
