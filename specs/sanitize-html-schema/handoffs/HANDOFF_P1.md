# sanitize-html-schema Handoff: Phase 1 Discovery

> Context for Phase 1: Discovery and Analysis

---

## Phase 0 Summary (Complete)

| Deliverable | Status |
|-------------|--------|
| Spec structure created | Complete |
| README.md with architecture | Complete |
| QUICK_START.md with concepts | Complete |
| MASTER_ORCHESTRATION.md | Complete |
| AGENT_PROMPTS.md | Complete |
| REFLECTION_LOG.md | Template created |

---

## Phase 1 Mission

**Objective**: Map the existing sanitize-html implementation and gather all context needed for schema design.

**Duration**: 1 session
**Checkpoint**: Per-task

---

## Tasks

### Task 1.1: Type Inventory (codebase-researcher)

Analyze `packages/common/utils/src/sanitize-html/types.ts`:

- [ ] Document all interfaces (Attributes, TransformedTag, Frame, SanitizeOptions, etc.)
- [ ] Identify union types using `false` to mean "allow all"
- [ ] List callback/function types
- [ ] Note nullable/optional patterns

**Output**: `outputs/types-inventory.md`

### Task 1.2: Options Matrix (codebase-researcher)

Create complete options inventory:

- [ ] All 27 `SanitizeOptions` fields
- [ ] Default values from `defaults.ts`
- [ ] Which use `false` = allow all pattern
- [ ] Required vs optional classification

**Output**: `outputs/options-matrix.md`

### Task 1.3: Dependency Graph (codebase-researcher)

Map internal module dependencies:

- [ ] filters/tag-filter.ts dependencies
- [ ] filters/attribute-filter.ts dependencies
- [ ] parser/html-parser.ts dependencies
- [ ] sanitize-html.ts dependencies

**Output**: `outputs/dependency-graph.md`

### Task 1.4: Literal Kit Inventory (codebase-researcher)

Compare existing literal-kits to requirements:

- [ ] Tags in HtmlTag vs defaults.ts
- [ ] Schemes in AllowedScheme vs defaults.ts
- [ ] Attributes in HtmlAttribute vs defaults.ts

**Output**: `outputs/literal-kit-gaps.md`

### Task 1.5: S.TaggedClass Patterns (effect-schema-expert)

Research discriminated union patterns:

- [ ] Find existing S.TaggedClass usage in codebase
- [ ] Document patterns for variants with/without payload
- [ ] Research Match.value integration

**Output**: Pattern examples in codebase-context.md

---

## Key Files

### Source (analyze these)

```
packages/common/utils/src/sanitize-html/
├── types.ts              # All type definitions
├── defaults.ts           # Default configuration
├── sanitize-html.ts      # Main sanitization (720+ lines)
├── filters/
│   ├── tag-filter.ts     # Tag filtering logic
│   ├── attribute-filter.ts
│   └── class-filter.ts
├── parser/
│   ├── html-parser.ts    # HTML tokenization
│   ├── token.ts          # Token types
│   └── entities.ts       # Entity encoding
├── url/
│   ├── url-validator.ts  # URL scheme validation
│   └── srcset-parser.ts
└── transform/
    └── tag-transform.ts  # Tag transformation
```

### Destination (reference these)

```
packages/common/schema/src/integrations/html/
├── literal-kits/
│   ├── html-tag.ts       # HtmlTag, MediaTag, etc.
│   ├── html-attributes.ts
│   ├── allowed-schemes.ts
│   └── tags-mode.ts      # TagsMode
└── models.ts             # Attributes, ParserOptions
```

---

## Known Context

### Union Types Requiring S.TaggedClass

From types.ts analysis:

1. `allowedTags: undefined | false | readonly string[]`
   - `false` = allow all tags
   - `string[]` = specific tags

2. `allowedAttributes: undefined | false | Record<string, readonly AllowedAttribute[]>`
   - `false` = allow all attributes

3. `allowedSchemes: undefined | false | readonly string[]`
   - `false` = allow all schemes

4. `disallowedTagsMode: "discard" | "escape" | "recursiveEscape" | "completelyDiscard"`
   - Already a string union

### Existing Literal Kits

| Kit | Covers |
|-----|--------|
| HtmlTag | 140+ HTML tags |
| MediaTag | img, audio, video, picture, svg, object, map, iframe, embed |
| VulnerableTag | script, style |
| NonTextTag | script, style, textarea, option |
| SelfClosing | img, br, hr, area, base, basefont, input, link, meta |
| HtmlAttribute | 300+ HTML attributes |
| AllowedScheme | http, data, cid, https, mailto, ftp, tel |
| TagsMode | escape, recursiveEscape, discard, completelyDiscard |

---

## Verification

After each task:

```bash
# Verify outputs exist
ls specs/sanitize-html-schema/outputs/

# Check for completeness
wc -l specs/sanitize-html-schema/outputs/*.md
```

---

## Exit Criteria

Phase 1 is complete when:

- [ ] All 5 tasks completed
- [ ] 4 output files in outputs/ directory
- [ ] All 27 SanitizeOptions fields documented
- [ ] Literal-kit gaps identified
- [ ] S.TaggedClass patterns collected
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md created
- [ ] P2_ORCHESTRATOR_PROMPT.md created

---

## Notes

1. Use codebase-researcher agent for Tasks 1.1-1.4 (can be parallelized)
2. Use effect-schema-expert agent for Task 1.5
3. Focus on gathering data, not designing solutions
4. Document any uncertainties for Phase 2
