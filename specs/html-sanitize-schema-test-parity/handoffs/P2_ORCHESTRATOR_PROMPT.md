# Phase 2 Orchestrator Prompt

> Copy-paste this prompt to begin Phase 2 in a new session.

---

## Prompt

```
I'm continuing work on the html-sanitize-schema-test-parity spec.

## Context
The spec is at: specs/html-sanitize-schema-test-parity/
Phase 1 (Discovery & Verification) is complete. Starting Phase 2 (Test Design).

## Phase 1 Findings
- 23 utils options mapped to schema (see outputs/type-comparison.md)
- 5 callbacks intentionally excluded (textFilter, exclusiveFilter, transformTags, onOpenTag, onCloseTag)
- 1 missing serializable option: `parser` (low priority)
- `preserveEscapedAttributes` was added to schema during Phase 1
- Conversion logic in toSanitizeOptions is type-safe and exhaustive

## Goal
Design test architecture and scaffold test files for makeSanitizeSchema integration tests.

## Tasks
1. Review existing test files in packages/common/schema/test/integrations/html/sanitize/
2. Decide test file organization (extend existing vs create new)
3. Establish test helper patterns for config creation and assertion
4. Identify priority test scenarios based on gap analysis
5. Create test scaffolding document
6. Output to specs/html-sanitize-schema-test-parity/outputs/test-scaffolding.md

## Reference
See HANDOFF_P2.md for detailed context.
See outputs/type-comparison.md for Phase 1 analysis.

## After Completion
Create handoffs/HANDOFF_P3.md and handoffs/P3_ORCHESTRATOR_PROMPT.md for the next phase.
```

---

## Quick Reference

### Key Files to Read
1. `specs/html-sanitize-schema-test-parity/outputs/type-comparison.md` - Phase 1 output
2. `packages/common/schema/test/integrations/html/sanitize/*.test.ts` - Existing tests
3. `packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts` - Schema
4. `packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts` - Conversion

### Expected Output
- `outputs/test-scaffolding.md` with test architecture design
- Decision on file organization (extend vs new files)
- Test helper patterns established

### Test Coverage Priorities
| Priority | Area | ~Tests |
|----------|------|--------|
| Critical | XSS Security | 30+ |
| High | CSS Styles | 25+ |
| High | Classes | 20+ |
| High | iframe Security | 25+ |
| Medium | Disallowed Modes | 20+ |
| Medium | script Security | 15+ |

### Success Criteria
- Test file organization decided
- Test helper patterns documented
- Priority test scenarios identified
- HANDOFF_P3.md created
