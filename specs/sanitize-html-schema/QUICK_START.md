# sanitize-html-schema Quick Start

> 5-minute guide to understanding and starting this spec.

---

## What We're Building

A schema-driven HTML sanitization system that transforms:

```typescript
// Before: Imperative function returning plain string
const result = sanitizeHtml("<script>bad</script><p>good</p>", options);
// result: string (no type safety)

// After: Schema transform returning branded type
const SanitizeSchema = makeSanitizeSchema(config);
const result = S.decodeSync(SanitizeSchema)("<script>bad</script><p>good</p>");
// result: SanitizedHtml.Type (branded, type-safe)
```

---

## Core Concepts

### 1. Discriminated Unions with S.TaggedClass

Instead of `allowedTags: false | string[]`, we use:

```typescript
// Discriminated union for AllowedTags
class AllTags extends S.TaggedClass<AllTags>()("AllTags", {}) {}
class NoneTags extends S.TaggedClass<NoneTags>()("NoneTags", {}) {}
class SpecificTags extends S.TaggedClass<SpecificTags>()("SpecificTags", {
  tags: S.Array(HtmlTag),
}) {}

const AllowedTags = S.Union(AllTags, NoneTags, SpecificTags);
```

### 2. Literal Kits Integration

Existing literal-kits provide type-safe HTML primitives:

```typescript
import { HtmlTag, HtmlAttribute, AllowedScheme } from "@beep/schema/integrations/html";

// HtmlTag: "a" | "abbr" | "acronym" | ... (all HTML tags)
// HtmlAttribute: "href" | "src" | ... (all HTML attributes)
// AllowedScheme: "http" | "https" | "mailto" | ... (URL schemes)
```

### 3. Transform Schema Factory

Build a schema from configuration:

```typescript
const config = new SanitizeConfig({
  allowedTags: new SpecificTags({ tags: ["p", "a", "strong"] }),
  allowedAttributes: new SpecificAttributes({
    global: ["class", "id"],
    byTag: { a: ["href", "target"] },
  }),
});

const SanitizeSchema = makeSanitizeSchema(config);
```

### 4. Branded Output

```typescript
const SanitizedHtml = S.String.pipe(
  S.brand("SanitizedHtml")
);

// Usage in APIs
const renderHtml = (content: SanitizedHtml.Type): void => { /* safe */ };
```

---

## Phase Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Discovery                                          │
│  - Map existing sanitize-html structure                      │
│  - Identify all config options and their types               │
│  - Document parser/filter dependencies                       │
├─────────────────────────────────────────────────────────────┤
│  Phase 2: Design                                             │
│  - Design S.TaggedClass discriminated unions                 │
│  - Define SanitizeConfig schema structure                    │
│  - Plan integration with literal-kits                        │
├─────────────────────────────────────────────────────────────┤
│  Phase 3: Implementation                                     │
│  - Create config schemas (allowed-tags, allowed-attributes)  │
│  - Create SanitizedHtml branded type                         │
│  - Implement makeSanitizeSchema factory                      │
│  - Migrate sanitization logic                                │
├─────────────────────────────────────────────────────────────┤
│  Phase 4: Testing                                            │
│  - Unit tests for each schema                                │
│  - Parity tests against existing sanitize-html               │
│  - Edge case coverage                                        │
├─────────────────────────────────────────────────────────────┤
│  Phase 5: Integration                                        │
│  - Fix type/lint errors                                      │
│  - Update exports and barrel files                           │
│  - Final code review                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files to Study

Before starting, read these files:

1. **Current implementation**:
   - `packages/common/utils/src/sanitize-html/types.ts`
   - `packages/common/utils/src/sanitize-html/sanitize-html.ts`

2. **Existing literal-kits**:
   - `packages/common/schema/src/integrations/html/literal-kits/html-tag.ts`
   - `packages/common/schema/src/integrations/html/models.ts`

3. **S.TaggedClass examples**:
   - Search: `grep -r "TaggedClass" packages/*/domain/src --include="*.ts"`

---

## Starting Phase 1

Launch the codebase-researcher agent with:

```
Analyze the sanitize-html module for schema migration.

Tasks:
1. Map all types in packages/common/utils/src/sanitize-html/types.ts
2. Identify all configuration options and their valid values
3. Document dependencies between filters, parser, and main sanitization
4. List all existing literal-kits in html integrations

Output: outputs/codebase-context.md
```

---

## Verification Commands

```bash
# Type check schema package
bun run check --filter @beep/schema

# Run schema tests
bun run test --filter @beep/schema

# Lint check
bun run lint --filter @beep/schema
```

---

## Next Steps

1. Read [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for detailed phase workflows
2. Check [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) for copy-paste agent prompts
3. Begin Phase 1 Discovery with codebase-researcher
