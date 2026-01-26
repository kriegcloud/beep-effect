# Handoff: Phase 2 - Test Design

> Context document for beginning Phase 2.

---

## Working Memory (critical context)

### Current Task
Design test architecture and create test file structure for `makeSanitizeSchema` integration tests.

### Success Criteria
- [ ] Test file organization decided (single file vs multiple)
- [ ] Test helper patterns established
- [ ] Priority test scenarios identified
- [ ] Test scaffolding created

### Blocking Issues
None - Phase 1 complete with comprehensive type analysis.

---

## Episodic Memory (session history)

### Phase 1 Summary
- Type comparison completed: 23 options mapped, 5 callbacks excluded, 1 missing
- **Missing options**:
  1. `parser` (ParserOptions) - Low priority, sensible defaults
- **Added during Phase 1**: `preserveEscapedAttributes` (boolean) - Enables full escape mode test coverage
- Conversion edge cases documented - all conversions are type-safe and exhaustive
- RegExp pattern validation identified as potential runtime failure point

### Key Findings
1. Schema uses discriminated unions with factory methods (more ergonomic than utils)
2. `toSanitizeOptions` conversion is well-implemented with exhaustive matching
3. XSS security tests are critical focus area
4. Test coverage should emphasize:
   - CSS style pattern matching (regex edge cases)
   - Class filtering (string vs RegExpPattern)
   - iframe/script hostname/domain validation
   - All 4 disallowed tags modes

---

## Semantic Memory (reference context)

### Key Files
- **Type comparison output**: `outputs/type-comparison.md`
- **Existing test files**:
  - `test/integrations/html/sanitize/make-sanitize-schema.attributes.test.ts`
  - `test/integrations/html/sanitize/make-sanitize-schema.basic.test.ts`
  - `test/integrations/html/sanitize/make-sanitize-schema.urls.test.ts`
  - `test/integrations/html/sanitize/make-sanitize-schema.xss.test.ts`
- **Schema under test**: `src/integrations/html/sanitize/sanitize-config.ts`
- **Conversion function**: `src/integrations/html/sanitize/to-sanitize-options.ts`

### Tech Stack
- `@beep/testkit` for Effect-based tests
- `effect()` / `layer()` test runners
- `makeSanitizeSchema` factory pattern

---

## Procedural Memory (links only)

- [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md) - Full phase details
- [AGENT_PROMPTS.md](../AGENT_PROMPTS.md) - Phase 2 agent prompts
- [type-comparison.md](../outputs/type-comparison.md) - Phase 1 output
- [effect-testing-patterns.md](../../../.claude/commands/patterns/effect-testing-patterns.md) - Test patterns

---

## Agent Instructions

### Primary Agent: `test-writer`

**Task**: Design test architecture and scaffold test files.

**Prompt**:
```
Design test architecture for makeSanitizeSchema integration tests in the @beep/schema package.

Based on the type comparison in specs/html-sanitize-schema-test-parity/outputs/type-comparison.md:

1. Review existing test files in packages/common/schema/test/integrations/html/sanitize/
2. Design test file organization covering missing areas:
   - CSS styles (allowedStyles, parseStyleAttributes)
   - Classes (allowedClasses with string and RegExpPattern)
   - iframe security (hostnames, domains, relative URLs)
   - script security (hostnames, domains)
   - Disallowed tags modes (all 4 modes)
   - Nesting limits
   - Configuration presets

3. Create test helper patterns for:
   - Creating test configs from SanitizeConfig schema
   - Converting to runtime options via toSanitizeOptions
   - Asserting sanitization output

4. Scaffold new test files following @beep/testkit patterns

Output test scaffolding to specs/html-sanitize-schema-test-parity/outputs/test-scaffolding.md
```

### Decision Points for Human

1. **File organization**: Should we add to existing test files or create new ones?
   - Option A: Extend existing 4 files with missing test cases
   - Option B: Create 5 new files (css, classes, iframe, modes, presets)
   - Recommendation: **Option A** - extend existing files to avoid fragmentation

2. ~~**Missing schema options**: Should we add `preserveEscapedAttributes` to schema first?~~ **RESOLVED**
   - `preserveEscapedAttributes` has been added to the schema
   - Full escape mode test coverage is now possible

---

## Test Priority Matrix

| Test Area | Priority | Reason | Estimated Tests |
|-----------|----------|--------|-----------------|
| XSS Security | Critical | Safety | 30+ |
| CSS Styles | High | Gap coverage | 25+ |
| Classes | High | Gap coverage | 20+ |
| iframe Security | High | Gap coverage | 25+ |
| Disallowed Modes | Medium | Feature coverage | 20+ |
| script Security | Medium | Gap coverage | 15+ |
| Nesting Limits | Medium | Feature coverage | 10+ |
| Presets | Low | Convenience | 15+ |
| Parser Options | Low | Missing from schema | Blocked |

---

## Phase Completion Checklist

- [ ] Test file organization decided
- [ ] Test helper patterns established
- [ ] `outputs/test-scaffolding.md` created
- [ ] Priority test scenarios documented
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created
