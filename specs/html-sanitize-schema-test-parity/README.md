# html-sanitize-schema-test-parity

> Comprehensive test coverage for `@beep/schema/integrations/html` to achieve parity with `@beep/utils/sanitize-html` tests.

**Complexity Score**: 49 (High)
**Status**: Phase 0 Complete
**Estimated Effort**: ~3 hours across 7 phases

---

## Purpose

The `@beep/schema` package provides an Effect Schema-driven approach to HTML sanitization configuration. While the implementation covers all serializable configuration options, the **test suite has significant gaps** compared to the battle-tested `@beep/utils/sanitize-html` tests.

This spec defines the work required to achieve test parity, ensuring the schema-based approach handles all edge cases as robustly as the utils-based implementation.

---

## Problem Statement

### Current State

| Package | Test Files | Test Cases | Coverage |
|---------|:----------:|:----------:|:--------:|
| `@beep/utils/sanitize-html` | 11 | ~250 | Comprehensive |
| `@beep/schema/integrations/html` | 4 | ~60 | **Partial** |

### Gap Analysis

The schema tests are **missing entirely** for these supported features:

| Feature | Schema Config | Utils Tests | Schema Tests |
|---------|:-------------:|:-----------:|:------------:|
| CSS/Style filtering | `allowedStyles` | 68 cases | **0** |
| Class filtering | `allowedClasses` | 46 cases | **0** |
| iframe hostname validation | `allowedIframeHostnames` | 52 cases | **0** |
| Script hostname validation | `allowedScriptHostnames` | 20 cases | **0** |
| disallowedTagsMode | `disallowedTagsMode` | Tested | **0** |
| Preset configurations | 3 presets defined | N/A | **0** |

### Security Risk

Without comprehensive tests, we cannot verify that:
1. CSS XSS vectors (expression(), url(javascript:)) are blocked
2. Class filtering with glob/regex patterns works correctly
3. iframe/script hostname whitelisting is enforced
4. All TagsMode variants behave as expected

---

## Scope

### In Scope

1. **CSS/Style filtering tests** - Port tests from `sanitize-html.css.test.ts`
2. **Class filtering tests** - Port tests from `sanitize-html.classes.test.ts`
3. **iframe/script tests** - Port tests from `sanitize-html.iframe.test.ts`
4. **Modes tests** - Test all `disallowedTagsMode` variants
5. **Preset tests** - Verify `DefaultSanitizeConfig`, `MinimalSanitizeConfig`, `PermissiveSanitizeConfig`
6. **Implementation gap documentation** - Document features intentionally excluded

### Out of Scope

1. **transformTags** - Callbacks are not serializable, intentionally excluded
2. **textFilter/exclusiveFilter** - Callbacks, intentionally excluded
3. **Parser tests** - Delegated to utils implementation
4. **New schema features** - Focus on testing existing config options

---

## Success Criteria

- [ ] 5 new test files created
- [ ] ~170 new test cases added
- [ ] All CSS XSS vectors tested via schema
- [ ] All class filtering patterns (string, glob, regex) tested
- [ ] All iframe/script hostname/domain validation tested
- [ ] All TagsMode variants tested
- [ ] All 3 preset configurations verified
- [ ] Zero test failures
- [ ] Zero type errors in `@beep/schema`

---

## Key Files

### Schema Implementation
- `packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts`
- `packages/common/schema/src/integrations/html/sanitize/to-sanitize-options.ts`
- `packages/common/schema/src/integrations/html/sanitize/make-sanitize-schema.ts`
- `packages/common/schema/src/integrations/html/sanitize/allowed-classes.ts`

### Existing Schema Tests
- `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.basic.test.ts`
- `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.attributes.test.ts`
- `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.xss.test.ts`
- `packages/common/schema/test/integrations/html/sanitize/make-sanitize-schema.urls.test.ts`

### Utils Tests to Port From
- `packages/common/utils/test/sanitize-html/sanitize-html.css.test.ts`
- `packages/common/utils/test/sanitize-html/sanitize-html.classes.test.ts`
- `packages/common/utils/test/sanitize-html/sanitize-html.iframe.test.ts`

---

## Phase Overview

| Phase | Focus | Agents | Deliverables |
|:-----:|-------|--------|--------------|
| 0 | Scaffolding | doc-writer | README, MASTER_ORCHESTRATION |
| 1 | Discovery | codebase-researcher | Gap verification report |
| 2 | Test Design | test-writer, code-reviewer | Test suite designs |
| 3 | CSS Tests | test-writer | `make-sanitize-schema.css.test.ts` |
| 4 | Class Tests | test-writer | `make-sanitize-schema.classes.test.ts` |
| 5 | Iframe Tests | test-writer | `make-sanitize-schema.iframe.test.ts` |
| 6 | Modes Tests | test-writer | `make-sanitize-schema.modes.test.ts`, `presets.test.ts` |
| 7 | Validation | code-reviewer, reflector | Final review, patterns |

See [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for detailed phase breakdown.

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute guide to beginning Phase 1.

---

## Verification Commands

```bash
# Run existing schema tests
bun run test --filter=@beep/schema

# Type check schema package
bun run check --filter=@beep/schema

# Lint schema package
bun run lint --filter=@beep/schema
```

---

## Related

- [specs/_guide/README.md](../_guide/README.md) - Spec creation guide
- [specs/_guide/PATTERN_REGISTRY.md](../_guide/PATTERN_REGISTRY.md) - Reusable patterns
- [HANDOFF_STANDARDS.md](../_guide/HANDOFF_STANDARDS.md) - Handoff file requirements
